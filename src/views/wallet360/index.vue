<script setup lang="ts">
import { CopyDocument, Delete, EditPen, Download, Upload, View, Refresh, Search } from "@element-plus/icons-vue";
import { ref, reactive, computed } from "vue";
import tokenTable from "./component/table.vue";

const input2 = ref("");

const dataList = ref([
  { name: "地址：", value: "xxxxxxxxx", copy: true, tag: ["标签1", "标签2", "黑客朝鲜"] },
  { name: "以太币余额：", value: "xxxxxxxxx" },
  { name: "BNB价值：", value: "xxxxxxxxx" },
  { name: "代币持有：", value: "28个代币", border: false },
]);

const buttons = [
  { label: "代币", index: 0, component: "" },
  { label: "NFT", index: 1, component: "" },
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
      placeholder="请输入钱包地址"
      :prefix-icon="Search"
    >
      <template #append>
        <el-button :icon="Search" />
      </template>
    </el-input>

    <el-card shadow="hover" header="概述" class="mb-3">
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
        <div v-if="item.tag" class="inline-flex gap-2 ml-2">
          <el-tag type="primary" effect="dark">Tag 1</el-tag>
          <el-tag type="success" effect="dark">Tag 2</el-tag>
          <el-tag type="info" effect="dark">黑客</el-tag>
          <el-tag type="warning" effect="light">Tag 4</el-tag>
          <el-tag type="danger" effect="dark" closable>朝鲜</el-tag>
        </div>
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
      <token-table />
    </div>
  </div>
</template>
