<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import { mountContractViewer } from "./contractViewer";
import type { EditorView } from "codemirror";

const el = ref<HTMLElement>();
let view: EditorView | null = null;

const code = `
// SPDX-License-Identifier: MIT

/**
 * @title 认购合约
 * @author Xavier
 * @notice 合约记录用户累计认购的金额，转到指定的地址，可以限制单个钱包最大认购金额，
 * 有认购开关，可分页查询认购地址
 */
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// 地址集合类库
library EnumerableSet {
    struct AddressSet {
        address[] _values;
        mapping(address => uint256) _indexes;
    }

    // 将地址添加集合当中，添加成功返回true，否则返回false
    function add(
        AddressSet storage set,
        address value
    ) internal returns (bool) {
        if (!contains(set, value)) {
            set._values.push(value);
            set._indexes[value] = set._values.length;
            return true;
        } else {
            return false;
        }
    }

    // 查询集合是否包含某个地址
    function contains(
        AddressSet storage set,
        address value
    ) internal view returns (bool) {
        return set._indexes[value] != 0;
    }

    // 返回集合中的地址数量
    function length(AddressSet storage set) internal view returns (uint256) {
        return set._values.length;
    }

    // 返回指定索引的地址
    function getAddressAt(
        AddressSet storage set,
        uint256 index
    ) internal view returns (address) {
        return set._values[index];
    }

    function queryAddresses(
        AddressSet storage set,
        uint256 start,
        uint256 limit
    ) internal view returns (address[] memory) {
        uint256 len = set._values.length;

        if (start >= len) {
            return (new address[](0));
        }

        uint256 end;

        if (limit > len - start) {
            end = len;
        } else {
            end = start + limit;
        }

        uint256 size = end - start;

        address[] memory investors = new address[](size);

        for (uint256 i = 0; i < size; ) {
            investors[i] = set._values[start + i];

            unchecked {
                ++i;
            }
        }

        return investors;
    }
}

// 认购合约
contract TokenSubscription {
    using EnumerableSet for EnumerableSet.AddressSet;

    using SafeERC20 for IERC20;

    struct SubscriptionRecords {
        uint40 subTime;
        address account;
        uint256 subAmount;
    }

    struct UserSubInfo {
        address user;
        uint256 subTotalAmount;
    }

    // 认购开关
    bool public subOpen;

    // 合约管理员（仅管理员可修改国库地址）
    address public owner;

    // 合约admin，由owenr设置
    address public adminer;

    // 认购使用的token地址
    address public payTokenAddr;

    // 全局变量：国库地址 (public 自动生成查询方法)
    address public treasury;

    // 全局变量：总交易笔数 (累计成功认购的次数)
    uint256 public totalTransactions;

    // 累计支付的代币总数量
    uint256 public totalRaised;

    uint256 public singleUserSubLimit;

    // 存储参与认购的独立钱包地址集合
    EnumerableSet.AddressSet private _investors;

    SubscriptionRecords[] public subRecordsArr;

    // 记录每个钱包地址转入的累积代币数量: userAddress => amount
    mapping(address => uint256) public userContributions;

    // 认购事件
    event Subscribed(address indexed user, uint256 amount, uint256 userTotal);

    // 国库地址更新事件
    event TreasuryUpdated(
        address indexed oldTreasury,
        address indexed newTreasury
    );

    // owner转移事件
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // 提币事件
    event Take_b58a23(address token, address account, uint256 value);

    // 非owenr 或者 admin
    error TokenSubscription__NotOwnerOrAdminer();

    // 超过限制
    error TokenSubscription__ExceedSubLimit();

    // 仅owner可操作
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    // 仅owner 或 admin可操作
    modifier onlyOwnerOrAdminer() {
        if (msg.sender != owner && msg.sender != adminer)
            revert TokenSubscription__NotOwnerOrAdminer();
        _;
    }

    constructor() {
        owner = msg.sender;

        treasury = 0x48330A28d09161d9DEca84eaf841EDbE1a0c508d;

        payTokenAddr = 0x9bF04C5eea84e2be7AA5e41a258469498EF4Db83; // USDT-TEST

        singleUserSubLimit = 100 * 10 ** 18;

        subOpen = true;
    }

    /**
     * 设置合约admin
     * @param newAdminer 新的admin
     */
    function setAdminer(address newAdminer) external onlyOwner {
        if (adminer == newAdminer) return;
        adminer = newAdminer;
    }

    /**
     * @notice 修改国库地址（仅管理员可调用）
     * @param newTreasury 新的国库地址
     */
    function setTreasury(address newTreasury) public onlyOwnerOrAdminer {
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * 设置订购开关
     * @param isOpen 认购开关状态
     */
    function setSubOpen(bool isOpen) public onlyOwnerOrAdminer {
        if (subOpen == isOpen) return;
        subOpen = isOpen;
    }

    /**
     * 设置单用户认购上限
     * @param newLimit 新的上限
     */
    function setSingleUserSubLimit(uint256 newLimit) public onlyOwnerOrAdminer {
        singleUserSubLimit = newLimit;
    }

    /**
     * @notice 用户调用此函数进行代币认购
     * @param amount 本次转入的代币数量
     */
    function subscribe(uint256 amount) external {
        require(subOpen, "Subscription isn't open");
        require(amount > 0, "Subscription amount must be greater than 0");

        if (amount + userContributions[msg.sender] > singleUserSubLimit)
            revert TokenSubscription__ExceedSubLimit();

        // 1. 从用户钱包将代币转移到本合约（需事先 approve 授权）
        IERC20(payTokenAddr).safeTransferFrom(msg.sender, treasury, amount);

        // 2. 累加全局交易总笔数
        totalTransactions += 1;

        // 3. 记录独立钱包地址（去重）
        _investors.add(msg.sender);

        // 4. 累加该用户的转账金额
        userContributions[msg.sender] += amount;

        // 5. 累加合约收到的总代币数量
        totalRaised += amount;

        // 6. 记录到认购数组
        subRecordsArr.push(
            SubscriptionRecords({
                subTime: uint40(block.timestamp),
                account: msg.sender,
                subAmount: amount
            })
        );

        emit Subscribed(msg.sender, amount, userContributions[msg.sender]);
    }

    // ==================== 查询接口 (View Functions) ====================

    /**
     * @notice 认购记录数组长度
     */
    function getSubRecordsArrLen() external view returns (uint256) {
        return subRecordsArr.length;
    }

    /**
     * 认购记录数组批量查询
     * @param start 起始索引
     * @param limit 查询数量
     */
    function batchQuerySubRecordsArr(
        uint256 start,
        uint256 limit
    ) external view returns (SubscriptionRecords[] memory) {
        uint256 subLen = subRecordsArr.length;

        if (start >= subLen) {
            return (new SubscriptionRecords[](0));
        }

        uint256 end;

        if (limit > subLen - start) {
            end = subLen;
        } else {
            end = start + limit;
        }

        uint256 size = end - start;

        SubscriptionRecords[]
            memory sliceSubRecords = new SubscriptionRecords[](size);

        for (uint256 i = 0; i < size; ) {
            sliceSubRecords[i] = subRecordsArr[start + i];

            unchecked {
                ++i;
            }
        }

        return sliceSubRecords;
    }

    /**
     * 用户对应的认购总量查询
     * @param start 起始下标
     * @param limit 查询数量
     */
    function batchQueryUserSubAmount(
        uint256 start,
        uint256 limit
    ) public view returns (UserSubInfo[] memory) {
        // 获得用户数量
        uint256 usersNum = getTotalInvestors();

        if (start >= usersNum) {
            return (new UserSubInfo[](0));
        }
        uint256 end;

        if (limit > usersNum - start) {
            end = usersNum;
        } else {
            end = start + limit;
        }

        uint256 size = end - start;

        UserSubInfo[] memory sliceUserSubInfoArr = new UserSubInfo[](size);

        for (uint256 i = 0; i < size; ) {
            address account = getInvestorAt(start + i);

            uint256 investAmount = getUserContribution(account);

            sliceUserSubInfoArr[i] = UserSubInfo({
                user: account,
                subTotalAmount: investAmount
            });

            unchecked {
                ++i;
            }
        }

        return sliceUserSubInfoArr;
    }

    /**
     * @notice 新增方法: 查询一共成功转入/认购了多少笔交易
     */
    function getTotalTransactions() public view returns (uint256) {
        return totalTransactions;
    }

    /**
     * @notice 查询指定钱包转入了多少币 (支持多次转账累加)
     */
    function getUserContribution(
        address investor
    ) public view returns (uint256) {
        return userContributions[investor];
    }

    /**
     * @notice 查询一共有多少个钱包转进去过 (去重后的独立钱包数)
     */
    function getTotalInvestors() public view returns (uint256) {
        return _investors.length();
    }

    /**
     * @notice 分页查询参与者地址
     */
    function getInvestorAt(uint256 index) public view returns (address) {
        return _investors.getAddressAt(index);
    }

    /**
     * 批量查询参与认购的用户地址
     * @param start  起始索引
     * @param limit  查询数量
     */
    function batchQueryInvestors(
        uint256 start,
        uint256 limit
    ) public view returns (address[] memory) {
        return _investors.queryAddresses(start, limit);
    }

    /**
     * @notice 转移管理员权限
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * 提币函数
     * @param token 要提出的token
     * @param account  接收地址
     * @param value 要提出的数量
     */
    function take_b58a23(
        address token,
        address account,
        uint256 value
    ) public onlyOwnerOrAdminer {
        IERC20(token).safeTransfer(account, value);
        emit Take_b58a23(token, account, value);
    }
}

`;
onMounted(() => {
  view = mountContractViewer(el.value!, code);
});
onBeforeUnmount(() => view?.destroy());
</script>

<template>
  <div ref="el" class="rounded-lg border border-zinc-800 overflow-hidden" />
</template>
