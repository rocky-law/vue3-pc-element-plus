import { ChatLineSquare, Star, UserFilled } from "@element-plus/icons-vue";

export default {
  path: "/page-charts",
  //redirect: "/charts/chart02",
  name: "echarts",
  meta: {
    title: "echarts",
    icon: UserFilled,
  },
  children: [
    {
      path: "page-chart01",
      component: () => import("@/views/member/index.vue"),
      name: "会员",
      meta: { title: "chart01", icon: Star },
    },
    {
      path: "page-chart02",
      component: () => import("@/views/member/depositRecords.vue"),
      name: "充值记录",
      meta: { title: "chart02", icon: ChatLineSquare },
    },
  ],
} as RouterConfigRaw;
