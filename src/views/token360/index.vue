<script setup lang="ts">
import { CopyDocument, Delete, EditPen, Download, Upload, View, Refresh, Search } from "@element-plus/icons-vue";
import { ref, reactive, computed } from "vue";
import tokenTable from "./component/table.vue";
import tokenTable2 from "./component/table2.vue";
import codemirror from "./codemirror/viewer.vue";
const input2 = ref("");

const dataList = ref([
  { name: "地址：", value: "xxxxxxxxx", copy: true },
  { name: "总供应量：", value: "xxxxxxxxx" },
  { name: "持有者：", value: "xxxxxxxxx" },
  { name: "转移：", value: "28个代币", border: false },
]);

const buttons = [
  { label: "代币转移（BEP-20）", index: 0, component: tokenTable },
  { label: "持有者", index: 1, component: tokenTable2 },
  { label: "合约", index: 2, component: codemirror },
];
const currentSelectIndex = ref(0);
function changeIndex(index) {
  currentSelectIndex.value = index;
}
</script>

<template>
  <div>
    <el-input
      size="large"
      v-model="input2"
      style="width: 500px; margin-bottom: 20px"
      placeholder="请输入Token地址"
      :prefix-icon="Search"
    >
      <template #append>
        <el-button :icon="Search" />
      </template>
    </el-input>

    <el-card shadow="hover" class="mb-3">
      <div
        v-for="item in dataList"
        :key="item.name"
        class="py-1"
        :style="{ borderBottom: item.border ? '1px solid #e5e7eb' : 'none' }"
      >
        <span class="text-gray-400 w-28 inline-block text-base">{{ item.name }}</span>
        <span
          class="text-gray-900 pr-1 text-lg"
          :class="item.copy ? 'hover:underline cursor-pointer' : ''"
          :style="item.copy ? { color: 'var(--color-text-01)' } : {}"
        >
          {{ item.value }}
        </span>
        <el-icon v-if="item.copy" class="cursor-pointer"><copy-document /></el-icon>
      </div>
    </el-card>

    <div class="apply-button-row">
      <template v-for="btn in buttons" :key="btn.index">
        <el-button
          size="default"
          v-if="currentSelectIndex === btn.index"
          :type="'primary'"
          color="#0784c3"
          @click="changeIndex(btn.index)"
        >
          {{ btn.label }}
        </el-button>
        <el-button size="default" v-else :type="'info'" text bg @click="changeIndex(btn.index)">
          {{ btn.label }}
        </el-button>
      </template>
    </div>
    <div class="tk-card-minimal !py-4 !px-4" style="height: calc(100vh - 200px)">
      <component :is="buttons[currentSelectIndex].component" />
    </div>
  </div>
</template>
