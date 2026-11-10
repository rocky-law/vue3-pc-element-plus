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
  <div class="pb-2">前100名参与者</div>
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
    <el-table-column prop="date" label="参与地址"></el-table-column>
    <el-table-column prop="name" label="交易计数" sortable></el-table-column>
    <el-table-column prop="address" label="Gas Used"></el-table-column>
    <el-table-column prop="status" label="交易手续费（USDT）">
      <template #default="{ row }">
        <el-tag :type="tableStatusFilter(row.status)">
          {{ row.status }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>

  <pagination v-show="tableData.length > 0" :total="tableData.length" v-model="paging" @change="handleSizeChange" />
</template>
