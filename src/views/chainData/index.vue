<script setup lang="ts" name="UseDialogDemo">
import { ref } from "vue";
import { useDialog, ProDialog } from "@/components";
import { useNamespace } from "@/composables";
import { useRouter, useRoute, type LocationQueryValue } from "vue-router";
const visible = ref(false);
const router = useRouter();
const { open } = useDialog();
import product1 from "@/common/assets/images/chain/block.png?url";
import product2 from "@/common/assets/images/chain/trans.png?url";

const ns = useNamespace();

const tableData = reactive([
  {
    name: "131385775",
    category: "2 secs ago",
    price: 1299,
    stock: 156,
    sales: 423,
    percentage: 75,
    pro: 0,
    color: `${ns.cssVar("color-primary")} !important`,
    image: product1,
    image2: product2,
    sender: "0x1234567890abcdef1234567890abcdef12345678",
    receiver: "0xabcdef1234567890abcdef1234567890abcdef12",
  },
  {
    name: "131385778",
    category: "5 secs ago",
    price: 499,
    stock: 89,
    sales: 652,
    percentage: 85,
    pro: 0,
    color: `${ns.cssVar("color-success")} !important`,
    image: product1,
    image2: product2,
    sender: "0x1234567890abcdef1234567890abcdef12345678",
    receiver: "0xabcdef1234567890abcdef1234567890abcdef12",
  },
  {
    name: "131385770",
    category: "10 secs ago",
    price: 399,
    stock: 12,
    sales: 238,
    percentage: 45,
    pro: 0,
    color: `${ns.cssVar("color-warning")} !important`,
    image: product1,
    image2: product2,
    sender: "0x1234567890abcdef1234567890abcdef12345678",
    receiver: "0xabcdef1234567890abcdef1234567890abcdef12",
  },
  {
    name: "131385771",
    category: "15 secs ago",
    price: 5999,
    stock: 0,
    sales: 126,
    percentage: 30,
    pro: 0,
    color: `${ns.cssVar("color-error")} !important`,
    image: product1,
    image2: product2,
    sender: "0x1234567890abcdef1234567890abcdef12345678",
    receiver: "0xabcdef1234567890abcdef1234567890abcdef12",
  },
  {
    name: "131385772",
    category: "20 secs ago",
    price: 799,
    stock: 45,
    sales: 321,
    percentage: 60,
    pro: 0,
    color: `${ns.cssVar("color-info")} !important`,
    image: product1,
    image2: product2,
    sender: "0x1234567890abcdef1234567890abcdef12345678",
    receiver: "0xabcdef1234567890abcdef1234567890abcdef12",
  },
  {
    name: "131385773",
    category: "25 secs ago",
    price: 299,
    stock: 78,
    sales: 489,
    percentage: 70,
    pro: 0,
    color: `${ns.cssVar("color-secondary")} !important`,
    image: product1,
    image2: product2,
    sender: "0x1234567890abcdef1234567890abcdef12345678",
    receiver: "0xabcdef1234567890abcdef1234567890abcdef12",
  },
]);

// 根据库存获取状态文本
const getStockStatus = (stock: number) => {
  if (stock === 0) return "缺货";
  if (stock < 20) return "低库存";
  if (stock < 50) return "适中";
  return "充足";
};

// 根据库存获取状态类名
const getStockClass = (stock: number) => {
  if (stock === 0) return ns.join("bg-error");
  if (stock < 20) return ns.join("bg-warning");
  if (stock < 50) return ns.join("bg-info");
  return ns.join("bg-success");
};

function handleMore() {}
</script>

<template>
  <div class="chain-data-container">
    <el-card shadow="never" header="最新区块" class="tk-card-minimal">
      <div class="table11">
        <el-table
          :data="tableData"
          table-layout="fixed"
          size="large"
          :header-cell-style="{ background: 'transparent' }"
          :header-row-style="{ display: 'none' }"
        >
          <template #default>
            <el-table-column label="产品" prop="product" width="220px">
              <template #default="scope">
                <div style="display: flex; align-items: center">
                  <img class="product-image" :src="scope.row.image" />
                  <div class="product-info">
                    <div
                      class="product-name"
                      @click="
                        router.push({
                          path: '/block',
                          query: { id: scope.row.name },
                        })
                      "
                    >
                      {{ scope.row.name }}
                    </div>
                    <div class="product-category">{{ scope.row.category }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="价格" prop="price">
              <template #default="scope">
                <span class="price">¥{{ scope.row.price.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column label="库存" prop="stock">
              <template #default="scope">
                <div class="stock-badge" :class="getStockClass(scope.row.stock)">
                  {{ getStockStatus(scope.row.stock) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="销量" prop="sales" />
          </template>
        </el-table>
      </div>
      <el-button class="more-btn" v-waves @click="handleMore">查看更多</el-button>
    </el-card>
    <el-card shadow="never" header="最新交易" class="tk-card-minimal">
      <div class="table11">
        <el-table
          :data="tableData"
          table-layout="fixed"
          size="large"
          :header-cell-style="{ background: 'transparent' }"
          :header-row-style="{ display: 'none' }"
        >
          <template #default>
            <el-table-column label="产品" prop="product" width="160px">
              <template #default="scope">
                <div style="display: flex; align-items: center">
                  <img class="product-image" :src="scope.row.image2" />
                  <div class="product-info">
                    <div
                      class="product-name"
                      @click="
                        router.push({
                          path: '/block',
                          query: { id: scope.row.name },
                        })
                      "
                    >
                      {{ scope.row.name }}
                    </div>
                    <div class="product-category">{{ scope.row.category }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="价格" prop="price" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="truncate">
                  <span>发送方</span>
                  <span class="text-[var(--el-color-primary)]">{{ row.sender }}</span>
                </div>
                <div class="truncate">
                  <span>接收方</span>
                  <span class="text-[var(--el-color-primary)]">{{ row.receiver }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="销量" prop="sales" width="160px">
              <template #default="scope">
                <span>{{ scope.row.sales }}</span>
                <span class="pl-1">BNB</span>
              </template>
            </el-table-column>
          </template>
        </el-table>
      </div>
      <el-button class="more-btn" v-waves @click="handleMore">查看更多</el-button>
    </el-card>
  </div>
</template>
<style lang="scss" scoped>
.chain-data-container {
  padding: 0px;
  display: flex;
  flex-direction: row;
  gap: 20px;
  .tk-card-minimal {
    width: 50%;
  }
}
.more-btn {
  width: 100%;
  margin-top: 25px;
  text-align: center;
}
.table11 {
  width: 100%;

  :deep(.el-table__inner-wrapper::before) {
    background-color: transparent;
  }
  .product-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 6px;
  }

  .product-info {
    display: flex;
    flex-direction: column;
    margin-left: 12px;
  }

  .product-name {
    font-weight: 500;
    color: var(--el-color-primary);
    cursor: pointer;
  }

  .product-category {
    font-size: 12px;
    color: #64748b;
  }

  .price {
    font-weight: 600;
  }

  .stock-badge {
    display: inline-block;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
  }
}
</style>
