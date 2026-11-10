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
  <div class="pb-2">代币转移事件</div>
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
    <el-table-column prop="date" label="交易哈希值" show-overflow-tooltip></el-table-column>
    <el-table-column prop="name" label="Active" sortable></el-table-column>
    <el-table-column prop="address" label="区块"></el-table-column>
    <el-table-column prop="status" label="时间">
      <template #default="{ row }">
        <el-tag :type="tableStatusFilter(row.status)">
          {{ row.status }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="address" label="转出方"></el-table-column>
    <el-table-column prop="address" label="接收方"></el-table-column>
    <el-table-column prop="address" label="数量"></el-table-column>
    <el-table-column prop="address" label="代币"></el-table-column>
  </el-table>

  <pagination v-show="tableData.length > 0" :total="tableData.length" v-model="paging" @change="handleSizeChange" />
</template>
