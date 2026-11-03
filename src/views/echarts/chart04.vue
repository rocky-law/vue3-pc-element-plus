<template>
  <div>
    <div ref="chartContainer" class="chart-container"></div>
    <button @click="zoomBy(1.2)">放大</button>
    <button @click="zoomBy(1 / 1.2)">缩小</button>
    <button @click="graph?.fitView({})">适应画布</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Rect as GRect, Text as GText } from "@antv/g";
import {
  Badge,
  CommonEvent,
  ExtensionCategory,
  Graph,
  GraphEvent,
  iconfont,
  Label,
  Rect,
  register,
  treeToGraphData,
} from "@antv/g6";

const style = document.createElement("style");
style.innerHTML = `@import url('${iconfont.css}');`;
document.head.appendChild(style);

const COLORS = {
  B: "#1783FF",
  R: "#F46649",
  Y: "#DB9D0D",
  G: "#60C42D",
  DI: "#A7A7A7",
};
const GREY_COLOR = "#CED4D9";

class TreeNode extends Rect {
  get data() {
    return this.context.model.getNodeLikeDatum(this.id);
  }

  get childrenData() {
    return this.context.model.getChildrenData(this.id);
  }

  getLabelStyle(attributes) {
    const [width, height] = this.getSize(attributes);
    return {
      x: -width / 2 + 8,
      y: -height / 2 + 16,
      text: this.data.name,
      fontSize: 12,
      opacity: 0.85,
      fill: "#000",
      cursor: "pointer",
    };
  }

  getPriceStyle(attributes) {
    const [width, height] = this.getSize(attributes);
    return {
      x: -width / 2 + 8,
      y: height / 2 - 8,
      text: this.data.label,
      fontSize: 16,
      fill: "#000",
      opacity: 0.85,
    };
  }

  drawPriceShape(attributes, container) {
    const priceStyle = this.getPriceStyle(attributes);
    this.upsert("price", GText, priceStyle, container);
  }

  getCurrencyStyle(attributes) {
    const [, height] = this.getSize(attributes);
    return {
      x: this.shapeMap["price"].getLocalBounds().max[0] + 4,
      y: height / 2 - 8,
      text: this.data.currency,
      fontSize: 12,
      fill: "#000",
      opacity: 0.75,
    };
  }

  drawCurrencyShape(attributes, container) {
    const currencyStyle = this.getCurrencyStyle(attributes);
    this.upsert("currency", GText, currencyStyle, container);
  }

  getPercentStyle(attributes) {
    const [width, height] = this.getSize(attributes);
    return {
      x: width / 2 - 4,
      y: height / 2 - 8,
      text: `${((Number(this.data.variableValue) || 0) * 100).toFixed(2)}%`,
      fontSize: 12,
      textAlign: "right",
      fill: COLORS[this.data.status],
    };
  }

  drawPercentShape(attributes, container) {
    const percentStyle = this.getPercentStyle(attributes);
    this.upsert("percent", GText, percentStyle, container);
  }

  getTriangleStyle(attributes) {
    const percentMinX = this.shapeMap["percent"].getLocalBounds().min[0];
    const [, height] = this.getSize(attributes);
    return {
      fill: COLORS[this.data.status],
      x: this.data.variableUp ? percentMinX - 18 : percentMinX,
      y: height / 2 - 16,
      fontFamily: "iconfont",
      fontSize: 16,
      text: "\ue62d",
      transform: this.data.variableUp ? [] : [["rotate", 180]],
    };
  }

  drawTriangleShape(attributes, container) {
    const triangleStyle = this.getTriangleStyle(attributes);
    this.upsert("triangle", Label, triangleStyle, container);
  }

  getVariableStyle(attributes) {
    const [, height] = this.getSize(attributes);
    return {
      fill: "#000",
      fontSize: 12,
      opacity: 0.45,
      text: this.data.variableName,
      textAlign: "right",
      x: this.shapeMap["triangle"].getLocalBounds().min[0] - 4,
      y: height / 2 - 8,
    };
  }

  drawVariableShape(attributes, container) {
    const variableStyle = this.getVariableStyle(attributes);
    this.upsert("variable", GText, variableStyle, container);
  }

  getCollapseStyle(attributes) {
    if (this.childrenData.length === 0) return false;
    const { collapsed } = attributes;
    const [width, height] = this.getSize(attributes);
    return {
      backgroundFill: "#fff",
      backgroundHeight: 16,
      backgroundLineWidth: 1,
      backgroundRadius: 0,
      backgroundStroke: GREY_COLOR,
      backgroundWidth: 16,
      cursor: "pointer",
      fill: GREY_COLOR,
      fontSize: 16,
      text: collapsed ? "+" : "-",
      textAlign: "center",
      textBaseline: "middle",
      x: width / 2,
      y: 0,
    };
  }

  drawCollapseShape(attributes, container) {
    const collapseStyle = this.getCollapseStyle(attributes);
    const btn = this.upsert("collapse", Badge, collapseStyle, container);

    if (btn && !Reflect.has(btn, "__bind__")) {
      Reflect.set(btn, "__bind__", true);
      btn.addEventListener(CommonEvent.CLICK, () => {
        const { collapsed } = this.attributes;
        const graph = this.context.graph;
        if (collapsed) graph.expandElement(this.id, { animation: false });
        else graph.collapseElement(this.id);
      });
    }
  }

  getProcessBarStyle(attributes) {
    const { rate, status } = this.data;
    const { radius } = attributes;
    const color = COLORS[status];
    const percent = `${Number(rate) * 100}%`;
    const [width, height] = this.getSize(attributes);
    return {
      x: -width / 2,
      y: height / 2 - 4,
      width: width,
      height: 4,
      radius: [0, 0, radius, radius],
      fill: `linear-gradient(to right, ${color} ${percent}, ${GREY_COLOR} ${percent})`,
    };
  }

  drawProcessBarShape(attributes, container) {
    const processBarStyle = this.getProcessBarStyle(attributes);
    this.upsert("process-bar", GRect, processBarStyle, container);
  }

  getKeyStyle(attributes) {
    const keyStyle = super.getKeyStyle(attributes);
    return {
      ...keyStyle,
      fill: "#fff",
      lineWidth: 1,
      stroke: GREY_COLOR,
    };
  }

  render(attributes = this.parsedAttributes, container) {
    super.render(attributes, container);

    this.drawPriceShape(attributes, container);
    this.drawCurrencyShape(attributes, container);
    this.drawPercentShape(attributes, container);
    this.drawTriangleShape(attributes, container);
    this.drawVariableShape(attributes, container);
    this.drawProcessBarShape(attributes, container);
    this.drawCollapseShape(attributes, container);
  }
}

register(ExtensionCategory.NODE, "tree-node", TreeNode);

// 模板引用，用于绑定 DOM 节点
const chartContainer = ref();

// ECharts 实例
let graph: Graph | null = null;
// ResizeObserver 实例，用于监听容器尺寸变化
let resizeObserver = null;

function zoomBy(factor: number) {
  if (!graph) return;
  graph.zoomTo((graph.getZoom() ?? 1) * factor, { duration: 150 });
}
onMounted(() => {
  if (!chartContainer.value) return;

  fetch("https://assets.antv.antgroup.com/g6/decision-tree.json")
    .then(res => res.json())
    .then(data => {
      graph = new Graph({
        container: chartContainer.value,
        autoFit: "view",
        autoResize: true,
        zoom: 0.8, // 初始缩放 80%，1 = 100%
        zoomRange: [0.3, 2], // 滚轮/手势缩放范围限制
        data: treeToGraphData(data, {
          getNodeData: (datum, depth) => {
            if (!datum.style) datum.style = {};
            // 设置默认折叠的层级
            datum.style.collapsed = depth >= 4;
            if (!datum.children) return datum;
            const { children, ...restDatum } = datum;
            return { ...restDatum, children: children.map(child => child.id) };
          },
        }),
        node: {
          type: "tree-node",
          style: {
            size: [202, 60],
            ports: [{ placement: "left" }, { placement: "right" }],
            radius: 4,
          },
        },
        edge: {
          type: "cubic-horizontal",
          style: {
            stroke: GREY_COLOR,
          },
        },
        layout: {
          // type: "compact-box",
          type: "indented",
          direction: "LR",
          dropCap: false,
          indent: 300,
          getHeight: () => 60,
          preLayout: false,
        },
        behaviors: ["zoom-canvas", "drag-canvas", { type: "collapse-expand", enable: true }],
      });

      graph.render();

      // tooltip
      graph.setPlugins([
        {
          type: "tooltip",
          key: "fund-tip",
          enable: (e: any) => e.targetType === "node",
          getContent: (e: any) => {
            debugger;
            console.log("getContent", e.target.data);
            const n = e.target?.data ?? {};
            return `<div style="padding:6px 10px">
          <b>${n.name}</b><br/>金额：${n.label}<br/>占比：${n.rate * 100}%
        </div>`;
          },
        },
      ]);
    });

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
