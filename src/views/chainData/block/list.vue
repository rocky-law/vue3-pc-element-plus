<script setup lang="ts">
import { useRouter } from "vue-router";
import { CopyDocument, Search } from "@element-plus/icons-vue";
defineOptions({ name: "blockList" });

const router = useRouter();

const dataList = ref([
  { name: "区块高度：", value: "xxxxxxxxx" },

  { name: "时间：", value: "xxxxxxxxx" },

  { name: "交易：", value: "xxxxxxxxx", border: true },

  { name: "矿工：", value: "xxxxxxxxx", copy: true },

  { name: "区块奖励：", value: "xxxxxxxxx" },

  { name: "难度值：", value: "xxxxxxxxx" },

  { name: "总难度值：", value: "xxxxxxxxx" },

  { name: "容量：", value: "xxxxxxxxx", border: true },

  { name: "燃料费用：", value: "xxxxxxxxx" },

  { name: "燃料限制：", value: "xxxxxxxxx" },

  { name: "Burnt Fees:", value: "xxxxxxxxx" },

  { name: "额外数据:", value: "xxxxxxxxx", border: true },

  { name: "哈希：", value: "xxxxxxxxx" },

  { name: "父区块哈希：", value: "xxxxxxxxx" },

  { name: "(Sha3) 叔区块:", value: "xxxxxxxxx" },
]);
</script>

<template>
  <div>
    <div
      v-for="item in dataList"
      :key="item.name"
      class="py-2"
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
  </div>
</template>
