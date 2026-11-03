<template>
  <div ref="chartContainer" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Graph } from "@antv/g6";
// 模板引用，用于绑定 DOM 节点
const chartContainer = ref(null);

// ECharts 实例
let graph: Graph | null = null;
// ResizeObserver 实例，用于监听容器尺寸变化
let resizeObserver = null;

onMounted(() => {
  if (!chartContainer.value) return;
  graph = new Graph({
    container: chartContainer.value,
    width: 500,
    height: 500,
    data: {
      nodes: [
        {
          id: "node-1",
          style: { x: 50, y: 100 },
        },
        {
          id: "node-2",
          style: { x: 150, y: 100 },
        },
      ],
      edges: [{ id: "edge-1", source: "node-1", target: "node-2" }],
    },
    behaviors: ["drag-canvas", "zoom-canvas", "drag-element"],
  });

  graph.render();
  // 4. 使用 ResizeObserver 监听容器大小变化，实现响应式
  resizeObserver = new ResizeObserver(() => {
    graph && graph.resize();
  });
  resizeObserver.observe(chartContainer.value);
});

onBeforeUnmount(() => {
  // 5. 组件销毁前，清理监听并释放图表实例，防止内存泄漏
  if (resizeObserver && chartContainer.value) {
    resizeObserver.unobserve(chartContainer.value);
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (graph) {
    graph = null;
  }
});
</script>

<style scoped>
/* 容器必须显式设置宽高，这里设置为撑满父容器 */
.chart-container {
  width: 100%;
  height: 80vh;
  padding: 0;
  min-height: 400px;
}
</style>
