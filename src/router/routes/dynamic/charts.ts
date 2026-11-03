import { Tickets, Star } from "@element-plus/icons-vue";

export default {
  path: "/page-charts",
  //redirect: "/charts/chart02",
  name: "echarts",
  meta: {
    title: "echarts",
    icon: Tickets,
  },
  children: [
    {
      path: "page-chart01",
      component: () => import("@/views/echarts/chart01.vue"),
      name: "chart01",
      meta: { title: "chart01", icon: Star },
    },
    {
      path: "page-chart02",
      component: () => import("@/views/echarts/chart02.vue"),
      name: "chart02",
      meta: { title: "chart02", icon: Star },
    },
    {
      path: "page-chart03",
      component: () => import("@/views/echarts/chart03.vue"),
      name: "chart03",
      meta: { title: "chart03", icon: Star },
    },
    {
      path: "page-chart04",
      component: () => import("@/views/echarts/chart04.vue"),
      name: "chart04",
      meta: { title: "chart04", icon: Star },
    },
  ],
} as RouterConfigRaw;
