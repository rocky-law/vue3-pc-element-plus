<script setup lang="ts" name="LanguageSelect">
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessage } from "element-plus";
import { useLayoutStore } from "@/pinia";
import bnbImg from "@/common/assets/images/chain/bnb.png?url";
import cncImg from "@/common/assets/images/chain/cnc.png?url";
import testBscImg from "@/common/assets/images/chain/testbsc.png?url";

// 链选项
const chainOptions = [
  { value: "BNB", label: "BNB", img: bnbImg },
  { value: "CNC", label: "CNC", img: cncImg },
  { value: "TestBSC", label: "Test BSC", img: testBscImg },
];

const i18n = useI18n();
const layoutStore = useLayoutStore();

const { chain } = storeToRefs(layoutStore);

/**
 * 切换链
 */
const handleSelectChain = (chainValue: string) => {
  layoutStore.$patch({ chain: chainValue });

  let message = i18n.t("_headerBar.changeChain");
  message = message === "_headerBar.changeChain" ? "修改链成功！" : message;
  ElMessage.success(message);
};
</script>

<template>
  <el-dropdown trigger="click" @command="handleSelectChain">
    <img :src="chainOptions.find(item => item.value === chain)?.img" alt="chain" style="width: 24px; height: 24px" />

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="chainItem in chainOptions"
          :key="chainItem.value"
          :command="chainItem.value"
          :disabled="chain === chainItem.value"
        >
          <img :src="chainItem.img" alt="chain" style="width: 24px; height: 24px; margin-right: 8px" />
          <span>{{ chainItem.label }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
