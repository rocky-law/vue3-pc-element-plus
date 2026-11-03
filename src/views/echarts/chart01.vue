<template>
  <div>
    <!--在 views 下开发组件的时候，必须要有根元素包起来，否则动画失效，从而导致路由切换失败, 注释也不行-->
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";

// 模板引用，用于绑定 DOM 节点
const chartContainer = ref(null);

// ECharts 实例
let myChart = null;
// ResizeObserver 实例，用于监听容器尺寸变化
let resizeObserver = null;

onMounted(() => {
  if (!chartContainer.value) return;

  // 1. 初始化图表
  myChart = echarts.init(chartContainer.value);

  // 2. 配置项（增加了 effect 路径动画）
  const option = {
    title: {
      text: "Basic Graph",
    },
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: "quinticInOut",
    series: [
      {
        type: "graph",
        layout: "none",
        symbolSize: 50,
        roam: true,
        label: {
          show: true,
        },
        edgeSymbol: ["circle", "arrow"],
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          fontSize: 20,
        },

        // 👇👇👇 核心：全局路径动画配置 👇👇👇
        effect: {
          show: true, // 是否显示动画
          period: 3, // 动画周期（秒），数值越小动画越快
          symbol: "arrow", // 流动标记图形：'circle', 'arrow', 'rect' 等
          symbolSize: 10, // 标记大小
          trailLength: 0.2, // 尾迹长度（0-1 之间，越大尾迹越长）
          color: "#409EFF", // 标记颜色
        },

        data: [
          { name: "Node 1", x: 300, y: 300 },
          { name: "Node 2", x: 800, y: 300 },
          { name: "Node 3", x: 550, y: 100 },
          { name: "Node 4", x: 550, y: 500 },
        ],
        links: [
          {
            source: 0,
            target: 1,
            label: { show: true },
            lineStyle: { width: 5, curveness: 0.2 },
            // 👇 也可以在单条连线上单独配置 effect，覆盖全局设置
            effect: {
              color: "#F56C6C", // 这条线用红色动画
              symbolSize: 12,
              period: 2, // 这条线动画更快
            },
          },
          {
            source: "Node 2",
            target: "Node 1",
            label: { show: true },
            lineStyle: { curveness: 0.2 },
          },
          {
            source: "Node 1",
            target: "Node 3",
          },
          {
            source: "Node 2",
            target: "Node 3",
          },
          {
            source: "Node 2",
            target: "Node 4",
          },
          {
            source: "Node 1",
            target: "Node 4",
          },
        ],
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0,
        },
      },
    ],
  };

  // 3. 渲染图表
  myChart.setOption(option);

  // 4. 使用 ResizeObserver 监听容器大小变化，实现响应式
  resizeObserver = new ResizeObserver(() => {
    myChart && myChart.resize();
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
  if (myChart) {
    myChart.dispose();
    myChart = null;
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
