<template>
  <div class="graph-wrapper">
    <div class="hint">💡 点击节点查看上下游依赖（带流动动画），点击空白处重置</div>

    <div class="chart-box">
      <div ref="chartContainer" class="chart-container"></div>

      <svg class="svg-overlay">
        <path v-for="(path, index) in svgPaths" :key="index" :d="path" class="animated-path" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";

const chartContainer = ref(null);
const svgPaths = ref([]);

let myChart = null;
let resizeObserver = null;

// 用普通数组存高亮边的索引
let highlightLinkIndexes = [];
let clickedNodeName = "";

// 数据定义（移到外面，确保引用稳定）
const NODES = [
  { name: "App", category: 0, categoryName: "应用入口" },
  { name: "UserPage", category: 1, categoryName: "页面模块" },
  { name: "OrderPage", category: 1, categoryName: "页面模块" },
  { name: "HeaderComp", category: 2, categoryName: "公共组件" },
  { name: "SidebarComp", category: 2, categoryName: "公共组件" },
  { name: "UserService", category: 3, categoryName: "服务/工具" },
  { name: "OrderService", category: 3, categoryName: "服务/工具" },
  { name: "Utils", category: 3, categoryName: "服务/工具" },
];

const LINKS = [
  { source: "UserPage", target: "HeaderComp", label: "依赖" },
  { source: "UserPage", target: "UserService", label: "调用" },
  { source: "OrderPage", target: "HeaderComp", label: "依赖" },
  { source: "OrderPage", target: "OrderService", label: "调用" },
  { source: "App", target: "UserPage", label: "加载" },
  { source: "App", target: "OrderPage", label: "加载" },
  { source: "App", target: "SidebarComp", label: "加载" },
  { source: "UserService", target: "Utils", label: "使用" },
  { source: "OrderService", target: "Utils", label: "使用" },
];

onMounted(() => {
  if (!chartContainer.value) return;
  myChart = echarts.init(chartContainer.value);

  const categories = [
    { name: "应用入口", itemStyle: { color: "#c23531" } },
    { name: "页面模块", itemStyle: { color: "#2f4554" } },
    { name: "公共组件", itemStyle: { color: "#61a0a8" } },
    { name: "服务/工具", itemStyle: { color: "#d48265" } },
  ];

  const option = {
    title: { text: "有向依赖关系图", subtext: "点击节点高亮上下游", left: "center" },
    tooltip: {
      formatter: params => {
        if (params.dataType === "node") return `<b>${params.data.name}</b><br/>类型：${params.data.categoryName}`;
        if (params.dataType === "edge") return `${params.data.sourceName} <b>依赖于</b> ${params.data.targetName}`;
        return "";
      },
    },
    legend: { data: categories.map(c => c.name), bottom: 10 },
    animationDurationUpdate: 1500,
    animationEasingUpdate: "quinticInOut",
    series: [
      {
        type: "graph",
        layout: "force",
        force: { repulsion: 1200, edgeLength: [100, 200], gravity: 0.1 },
        roam: true,
        draggable: true,
        symbolSize: 50,
        edgeSymbol: ["none", "arrow"],
        edgeSymbolSize: [0, 12],
        edgeLabel: { fontSize: 12 },
        categories,
        data: NODES.map(n => ({ ...n, label: { show: true } })),
        links: LINKS.map((l, i) => ({
          ...l,
          sourceName: l.source,
          targetName: l.target,
          label: { show: true, formatter: l.label },
          lineStyle: { curveness: 0.2, width: 2, color: "#aaa", opacity: 0.9 },
        })),
        lineStyle: { opacity: 0.9 },
      },
    ],
  };

  myChart.setOption(option);

  myChart.on("click", handleChartClick);
  //myChart.on("finished", drawSvgLines);
  //myChart.on("graphRoam", drawSvgLines);

  resizeObserver = new ResizeObserver(() => {
    myChart && myChart.resize();
    //drawSvgLines();
  });
  resizeObserver.observe(chartContainer.value);
});

// ===== 点击处理 =====
const handleChartClick = params => {
  console.log("🖱️ Click event:", params?.dataType, params?.data?.name);

  if (!params || params.dataType !== "node") {
    resetHighlight();
    return;
  }

  const name = params.data.name;
  console.log("🎯 Clicked node:", name);

  if (clickedNodeName === name) {
    resetHighlight();
    return;
  }

  clickedNodeName = name;
  highlightLinkIndexes = [];

  // 找到所有关联的边
  LINKS.forEach((link, index) => {
    if (link.source === name || link.target === name) {
      highlightLinkIndexes.push(index);
    }
  });

  console.log("🔗 Highlight link indexes:", highlightLinkIndexes);
  console.log("🔗 Total links:", LINKS.length);

  // 收集关联节点
  const relatedNodes = new Set([name]);
  highlightLinkIndexes.forEach(i => {
    relatedNodes.add(LINKS[i].source);
    relatedNodes.add(LINKS[i].target);
  });

  console.log("📦 Related nodes:", Array.from(relatedNodes));

  // 更新 ECharts
  const newData = NODES.map(item => {
    if (relatedNodes.has(item.name)) {
      return { ...item, label: { show: true }, itemStyle: { opacity: 1 } };
    } else {
      return { ...item, label: { show: false }, itemStyle: { opacity: 0.1 } };
    }
  });

  const newLinks = LINKS.map((item, index) => ({
    ...item,
    sourceName: item.source,
    targetName: item.target,
    label: { show: highlightLinkIndexes.includes(index) ? true : false, formatter: item.label },
    lineStyle: {
      curveness: 0.2,
      width: highlightLinkIndexes.includes(index) ? 2 : 1,
      color: highlightLinkIndexes.includes(index) ? "#ff6b6b" : "#aaa",
      opacity: highlightLinkIndexes.includes(index) ? 0.9 : 0.05,
    },
  }));

  myChart.setOption({
    series: [
      {
        data: newData,
        links: newLinks,
      },
    ],
  });

  // 等布局完成后再画 SVG
  setTimeout(() => {
    console.log("⏰ setTimeout triggered, calling drawSvgLines");
    // drawSvgLines();
  }, 1600);
};

// ===== 画 SVG 线 =====
const drawSvgLines = () => {
  console.log("🎨 drawSvgLines called, highlightLinkIndexes:", highlightLinkIndexes);

  if (!myChart || highlightLinkIndexes.length === 0) {
    console.log("❌ No highlights, clearing paths");
    svgPaths.value = [];
    return;
  }

  const option = myChart.getOption();
  const nodes = option.series[0].data;
  console.log("📊 Nodes from option:", nodes.length);

  const nodeMap = {};
  nodes.forEach(n => {
    nodeMap[n.name] = n;
  });

  const paths = [];
  highlightLinkIndexes.forEach(index => {
    const link = LINKS[index];
    const sourceNode = nodeMap[link.source];
    const targetNode = nodeMap[link.target];

    console.log(`🔍 Link ${index}: ${link.source} → ${link.target}`);
    console.log("  Source node:", sourceNode?.name, "x:", sourceNode?.x, "y:", sourceNode?.y);
    console.log("  Target node:", targetNode?.name, "x:", targetNode?.x, "y:", targetNode?.y);

    if (sourceNode && targetNode && sourceNode.x != null && targetNode.x != null) {
      try {
        const [x1, y1] = myChart.convertToPixel({ seriesIndex: 0 }, [sourceNode.x, sourceNode.y]);
        const [x2, y2] = myChart.convertToPixel({ seriesIndex: 0 }, [targetNode.x, targetNode.y]);

        console.log(`  Pixel coords: (${x1}, ${y1}) → (${x2}, ${y2})`);

        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
          console.log("  ❌ NaN coordinates!");
          return;
        }

        // 贝塞尔曲线
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) {
          paths.push(`M ${x1} ${y1} L ${x2} ${y2}`);
          return;
        }
        const nx = -dy / dist;
        const ny = dx / dist;
        const cx = (x1 + x2) / 2 + nx * dist * 0.2;
        const cy = (y1 + y2) / 2 + ny * dist * 0.2;

        const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
        console.log("  ✅ Path:", d);
        paths.push(d);
      } catch (e) {
        console.log("  ❌ convertToPixel error:", e);
      }
    } else {
      console.log("  ❌ Missing node or coordinates");
    }
  });

  console.log("📐 Total paths generated:", paths.length);
  svgPaths.value = paths;
};

// ===== 重置 =====
const resetHighlight = () => {
  console.log("🔄 Reset highlight");
  clickedNodeName = "";
  highlightLinkIndexes = [];
  svgPaths.value = [];

  myChart.setOption({
    series: [
      {
        data: NODES.map(n => ({
          ...n,
          label: { show: true },
          itemStyle: { opacity: 1 },
        })),
        links: LINKS.map((l, i) => ({
          ...l,
          sourceName: l.source,
          targetName: l.target,
          label: { show: true, formatter: l.label },
          lineStyle: { curveness: 0.2, width: 2, color: "#aaa", opacity: 0.9 },
        })),
      },
    ],
  });
};

onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
.graph-wrapper {
  width: 100%;
  height: 90vh;
  display: flex;
  flex-direction: column;
}
.hint {
  padding: 10px;
  font-size: 14px;
  color: #666;
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
  text-align: center;
  flex-shrink: 0;
}
.chart-box {
  flex: 1;
  position: relative;
  min-height: 500px;
}
.chart-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.svg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  overflow: visible;
}
.animated-path {
  fill: none;
  stroke: #ff6b6b;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 12 12;
  animation: flow 1s linear infinite;
}
@keyframes flow {
  from {
    stroke-dashoffset: 24;
  }
  to {
    stroke-dashoffset: 0;
  }
}
</style>
