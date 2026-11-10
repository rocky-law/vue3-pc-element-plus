<template>
  <div class="block-container">
    <div class="block-header">
      <span class="block-title">Block</span>
      <span class="block-id">#{{ id }}</span>
    </div>
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

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import blockList from "./block/list.vue";
import blockTable from "./block/table.vue";

const route = useRoute();
const router = useRouter();
const id = route.query?.id ?? "";
const buttons = [
  { label: "概况", index: 0, component: blockList },
  { label: "参与方", index: 1, component: blockTable },
];
const currentSelectIndex = ref(0);
function changeIndex(index) {
  currentSelectIndex.value = index;
}
</script>

<style scoped lang="scss">
.block-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  padding: 20px;
  .block-title {
    font-size: 20px;
    font-weight: 500;
    color: var(--tk-gray-color-900);
  }
  .block-id {
    font-size: 16px;
    color: var(--tk-gray-color-600);
    opacity: 0.9;
    margin-left: 10px;
  }
  .block-header {
    margin-bottom: 20px;
  }
}
</style>
