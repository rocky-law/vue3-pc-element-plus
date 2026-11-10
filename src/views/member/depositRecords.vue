<script setup lang="ts">
import type { PaginationInfo } from "@/components";
import { ref, reactive, computed } from "vue";
import { Star } from "@element-plus/icons-vue";
import { tableStatusFilter } from "@/common/config";
import { Pagination, defaultPaginationInfo } from "@/components";
import { largeData } from "@/mock/table/common";

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
  <div class="tk-card-minimal" style="height: 100%">
    <el-table
      :data="tablePageData"
      :border="false"
      highlight-current-row
      stripe
      row-key="id"
      style="width: 100%"
      height="calc(100% - 50px)"
    >
      <el-table-column prop="id" label="ID" width="70" align="center" sortable></el-table-column>
      <el-table-column prop="date" label="订单编号"></el-table-column>
      <el-table-column prop="name" label="充值地址" sortable></el-table-column>
      <el-table-column prop="address" label="接收地址"></el-table-column>
      <el-table-column prop="status" label="充值数量（USDT）">
        <template #default="{ row }">
          <el-tag :type="tableStatusFilter(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="充值时间">
        <template #default="{ row }">
          {{ row.date }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="充值状态">
        <template #default>
          {{ "充值成功" }}
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="tableData.length > 0" :total="tableData.length" v-model="paging" @change="handleSizeChange" />
  </div>
</template>
