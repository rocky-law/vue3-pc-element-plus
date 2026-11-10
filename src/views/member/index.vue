<template>
  <div>
    <el-alert
      title="提示：当前账户余额不足，请您充值或购买相关服务！"
      type="warning"
      show-icon
      :closable="false"
      class="!mb-3"
    />
    <div class="apply-flex-stretch-between gap-4">
      <el-card class="!bg-gray-200/5 flex-1">
        <div class="apply-flex-col-between h-full">
          <div>
            <div class="text-base">月卡用户/年卡用户/未购买服务</div>
            <div class="text-secondary2">剩余时间：26天/ 12:24:12</div>
          </div>

          <div class="h-[6px] bg-gray-200 mt-2"><div class="bg-text-01 h-full" :style="{ width: '30%' }"></div></div>
        </div>
      </el-card>
      <el-card class="flex-1">
        <div class="text-base">账户余额：26 USDT</div>
        <div v-for="b in links" :key="b.label">
          <el-button
            class="mt-2 !font-semibold"
            @click="b.onclick && b.onclick()"
            type="primary"
            size="large"
            text
            color="var(--color-text-01)"
          >
            {{ b.label }}
          </el-button>
          <el-switch
            v-if="b.need"
            style="--el-switch-on-color: var(--color-text-01)"
            v-model="value3"
            inline-prompt
            active-text="是"
            inactive-text="否"
          />
        </div>
      </el-card>
    </div>
    <el-dialog
      :title="dialogTitle[dialogStatus]"
      v-model="dialogFormVisible"
      draggable
      :close-on-click-modal="false"
      overflow
      destroy-on-close
    >
      <el-alert
        title="提示：充值不可退款，请勿从任何智能合约充值，否则可能导致资金损失。仅支持接收BNB Chain USDT资产。"
        type="warning"
        show-icon
        :closable="false"
        class="!mb-3"
      />
      <el-card shadow="hover" class="text-center" style="width: 260px; margin: 10px auto">
        <div class="text-lg font-semibold">充值</div>
        <QrCode :text="qrCodeText" logo="/avatar.png" />
      </el-card>
      <el-form
        ref="formRef"
        :rules="rules"
        :model="tempTableDate"
        label-position="left"
        label-width="120px"
        style="width: 600px"
        :disabled="dialogStatus === 'look'"
      >
        <el-form-item label="充值地址" prop="name">
          <el-input v-model="tempTableDate.name" placeholder="请输入">
            <template #suffix>
              <el-icon class="el-input__icon"><copy-document /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="充值金额" prop="date">
          <el-input-number
            v-model="tempTableDate.date"
            :min="0"
            :max="10000000"
            :step="0.1"
            :precision="2"
            align="left"
            placeholder="请输入充值金额"
            controls-position="right"
          >
            <template #prefix>
              <span>$</span>
            </template>
            <template #suffix>
              <span>USDT</span>
            </template>
          </el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <template v-if="dialogStatus === 'look'">
            <el-button type="primary" @click="dialogFormVisible = false">确定</el-button>
          </template>
          <template v-else>
            <el-button @click="dialogFormVisible = false">取消</el-button>
            <el-button type="primary" @click="addData()">确定</el-button>
          </template>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      :title="'购买会员'"
      v-model="dialogFormVisible2"
      draggable
      :close-on-click-modal="false"
      overflow
      destroy-on-close
    >
      <el-alert
        title="提示：当账户内所有会员即将用完或到期后，系统将默认自动续订此包。购买完成后，您可随时修改或取消自动续订。"
        type="warning"
        show-icon
        :closable="false"
        class="!mb-3"
      />
      <div>
        <span>当前余额：</span>
        <span>100 USDT</span>
      </div>
      <div>
        <span>当前剩余会员时间：</span>
        <span class="text-[#f00]">28天</span>
      </div>
      <el-radio-group v-model="radio1" class="flex-col">
        <el-card
          shadow="hover"
          class="my-2 w-[300px] cursor-pointer"
          v-for="item in planList"
          :key="item.id"
          @click="radio1 = item.id"
          :style="radio1 === item.id ? { borderColor: '#395ae3' } : {}"
        >
          <div class="text-sm text-left">
            <span>{{ item.name }}：</span>
            <span class="text-[#f00]">有效时间{{ item.duration }}天</span>
          </div>

          <div class="text-sm text-left">
            <span>价格：</span>
            <span>{{ item.price }} USDT</span>
          </div>
          <el-radio :value="item.id" size="large"></el-radio>
        </el-card>
      </el-radio-group>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible2 = false">取消</el-button>
          <el-button type="primary" @click="buy()">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import { useRouter, useRoute, type LocationQueryValue } from "vue-router";
import { CopyDocument, Search } from "@element-plus/icons-vue";
import { QrCode } from "@/components";

const router = useRouter();
const links = [
  {
    label: "去充值 >",
    url: "/member/depositRecords",
    onclick() {
      dialogFormVisible.value = true;
      dialogStatus.value = "add";
    },
  },
  {
    label: "充值记录",
    url: "/member/depositRecords",
    onclick() {
      router.push({
        path: "/page-charts/page-chart02",
      });
    },
  },
  {
    label: "购买会员",
    url: "/member/depositRecords",
    onclick() {
      dialogFormVisible2.value = true;
    },
  },
  {
    label: "自动续订",
    url: "/member/depositRecords",
    need: true,
  },
];
const qrCodeText = "一个基于 Vue3、TypeScript、Vite、Pinia、Element-Plus 搭建的现代 Template 管理系统模板";
const dialogTitle: Record<string, string> = {
  look: "查看",
  edit: "编辑",
  add: "充值",
};
const planList = ref([
  { id: 1, name: "月卡", duration: 30, price: 50 },
  { id: 2, name: "年卡", duration: 365, price: 500 },
]);

const dialogFormVisible = ref(false);
const dialogFormVisible2 = ref(false);
const dialogStatus = ref("");

const defaultTableData = {
  id: "",
  name: "",
  date: 0,
  address: "",
  status: "",
  priority: 0,
  title: "",
};
const tempTableDate = ref(defaultTableData);
const rules = {
  date: [{ required: true, message: "date is required", trigger: "change" }],
  name: [{ required: true, message: "name is required", trigger: "change" }],
  title: [{ required: true, message: "title is required", trigger: "blur" }],
};
const formRef = useTemplateRef<FormInstance>("formRef");
const radio1 = ref<any>("");
const value3 = ref(true);
const addData = () => {
  formRef.value?.validate(async valid => {
    if (valid) {
      const tableDataTemp = tempTableDate.value;
      tableDataTemp.id = Math.round(Math.random() * 100) + 1024 + ""; // 随机一个 id

      dialogFormVisible.value = false;
      ElNotification.success({
        title: "成功",
        message: "创建成功",
      });
    }
  });
};

function buy() {
  if (!radio1.value) {
    ElMessage({
      showClose: true,
      message: "请选择一种套餐。",
      type: "warning",
      duration: 2000,
    });
    return;
  }
  dialogFormVisible2.value = false;
  ElNotification.success({
    title: "成功",
    message: "购买成功",
    duration: 2000,
  });
}
</script>
