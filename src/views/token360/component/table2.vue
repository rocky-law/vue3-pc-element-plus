<script setup lang="ts">
import type { PaginationInfo } from "@/components";
import { ref, reactive, computed } from "vue";
import { Star } from "@element-plus/icons-vue";
import { tableStatusFilter } from "@/common/config";
import { Pagination, defaultPaginationInfo } from "@/components";
import { largeData } from "@/mock/table/common";
defineOptions({ name: "blockTable" });
const tableData = ref(largeData);
const paging = reactive(defaultPaginationInfo);

const tablePageData = computed(() =>
  tableData.value.slice((paging.pageNum - 1) * paging.pageSize, paging.pageNum * paging.pageSize)
);

const handleSizeChange = (pagingParam: PaginationInfo) => {
  paging.pageNum = pagingParam.pageNum;
  paging.pageSize = pagingParam.pageSize;
};
</script>

<template>
  <div class="pb-2">持有者</div>
  <el-table
    :data="tablePageData"
    :border="false"
    highlight-current-row
    stripe
    row-key="id"
    style="width: 100%"
    height="calc(100% - 80px)"
  >
    <el-table-column prop="id" label="ID" width="70" align="center" sortable></el-table-column>
    <el-table-column prop="date" label="地址" show-overflow-tooltip></el-table-column>
    <el-table-column prop="name" label="数量" sortable></el-table-column>
    <el-table-column prop="address" label="百分比">
      <template #default="scope">
        <el-progress
          :percentage="scope.row.pro ?? 88"
          :color="scope.row.color ?? 'var(--tk-color-success)'"
          :stroke-width="4"
        />
      </template>
    </el-table-column>
  </el-table>

  <pagination v-show="tableData.length > 0" :total="tableData.length" v-model="paging" @change="handleSizeChange" />
</template>
