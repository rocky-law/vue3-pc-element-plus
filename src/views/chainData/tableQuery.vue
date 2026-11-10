<script setup lang="tsx">
import type { TableColumnCtx } from "element-plus";
import type { PageColumn, ProPageInstance, TableRow, ElFormProps, FormColumn } from "@/components";
import { ref, useTemplateRef, withModifiers } from "vue";
import { ElButton, ElMessage, ElMessageBox, ElSwitch, ElTag } from "element-plus";
import { DocumentCopy, Delete, EditPen, Download, Upload, View, Refresh, Search } from "@element-plus/icons-vue";
import { exportJsonToExcel, formatJsonToArray } from "@/common/utils";
import { ProPage, setProp } from "@/components";
import { useConfirm, usePermission } from "@/composables";
import { tableData } from "@/mock/pro-component/pro-table";

import { ProFormDialog } from "@/components";

export interface ResUserList {
  id: string;
  username: string;
  gender: number;
  user: { detail: { age: number } };
  idCard: string;
  email: string;
  address: string;
  createTime: string;
  status: number;
  avatar: string;
  photo: any[];
  children?: ResUserList[];
}
const input2 = ref("");
const select = ref("1");
const { hasAuth } = usePermission();

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proPageInstance = useTemplateRef<ProPageInstance>("proPageInstance");

const data = ref(tableData);

const columns: PageColumn<ResUserList>[] = [
  //{ type: "selection", fixed: "left", width: 60 },
  { type: "index", label: "序号", width: 60 },
  // { type: "sort", label: "Sort", width: 80 },
  { type: "expand", label: "Expand", width: 80 },
  {
    prop: "username",
    label: "交易哈希",
    el: "copy",
    search: {
      el: "el-input",
      beforeSearch: (searchValue, searchParams, column) => {
        return searchValue ? `#${searchValue}` : undefined;
      },
    },
    //   render: ({ value }) => {
    //     return (
    //       <div>
    //         {" "}
    //         <ElButton
    //           type="primary"
    //           link
    //           onClick={withModifiers(() => ElMessage.success("我是通过 tsx 语法渲染的内容"), ["stop"])}
    //         >
    //           {value}
    //           <el-icon>
    //             <DocumentCopy />
    //           </el-icon>
    //         </ElButton>
    //       </div>
    //     );
    //   },
  },
  {
    prop: "gender",
    label: "Action",
    hidden: true,
    options: [
      { genderLabel: "男", genderValue: 1 },
      { genderLabel: "女", genderValue: 2 },
    ],
    optionField: { label: "genderLabel", value: "genderValue" },
    search: { el: "el-select", elProps: { filterable: true } },
    filters: [
      { text: "男", value: "1" },
      { text: "女", value: "2" },
    ],
    filterMethod: (value: string, row: any, column: TableColumnCtx<any>) => {
      const property = column["property"];
      return row[property] === Number(value);
    },
    editable: true,
    editProps: {
      el: "el-select",
    },
  },
  {
    // 多级 prop
    prop: "user.detail.age",
    label: "块",
    filterProps: {
      formColumn: { width: 400 },
      // 自定义过滤规则
      rule: (model, row) => {
        const value = row.user.detail.age;
        return value >= model.minAge && value <= model.maxAge;
      },
    },
    search: {
      el: "el-input-number",
      // 自定义 search 显示内容
      render: ({ model }) => {
        return (
          <div class="flx-center">
            <el-input vModel_trim={model.minAge} placeholder="最小年龄" />
            <span style="margin: 0 10px">-</span>
            <el-input vModel_trim={model.maxAge} placeholder="最大年龄" />
          </div>
        );
      },
    },
    editProps: {
      el: "el-input-number",
      prop: "age",
      formItemProps: { required: true },
    },
  },
  {
    prop: "createTime",
    label: "时间",
    renderHeader: scope => {
      return (
        <ElButton type="primary" onClick={() => ElMessage.success("我是通过 tsx 语法渲染的表头")}>
          {scope.column.label}
        </ElButton>
      );
    },
    width: 180,
    filterProps: {
      formColumn: { width: 400 },
    },
    search: {
      el: "el-date-picker",
      span: 2, // 占两个位置
      elProps: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" },
      defaultValue: ["1900-11-12 11:35:00", "2024-12-12 11:35:00"],
    },
  },
  {
    prop: "idCard",
    label: "转出方",
    filterProps: {
      rule: "like",
    },
    search: { el: "el-input" },
    editProps: {
      formItemProps: { required: true },
    },
    width: 220,
  },
  { prop: "email", label: "接收方", width: 220 },
  { prop: "address", label: "数量", showOverflowTooltip: true },
  {
    prop: "status",
    label: "代币",
    options: [
      { userLabel: "启用", userStatus: 1 },
      { userLabel: "禁用", userStatus: 0 },
    ],
    search: { el: "el-select", props: { filterable: true } },
    optionField: { label: "userLabel", value: "userStatus" },
    editProps: {
      el: "el-switch",
      elProps: {
        activeText: "启用",
        inactiveText: "禁用",
        activeValue: 1,
        inactiveValue: 0,
      },
    },
    render: ({ value, row }) => {
      return (
        <>
          {hasAuth("edit") ? (
            <ElSwitch
              model-value={value}
              active-text={value ? "启用" : "禁用"}
              active-value={1}
              inactive-value={0}
              {...{ onClick: () => changeStatus(row) }}
            />
          ) : (
            <ElTag type={value ? "success" : "danger"}>{value ? "启用" : "禁用"}</ElTag>
          )}
        </>
      );
    },
  },

  { prop: "operation", label: "操作", fixed: "right", width: 130 },
];

// 删除用户信息
const deleteAccount = async (params: TableRow<ResUserList>) => {
  await useConfirm(() => {
    data.value = data.value.filter(item => item.id !== params.id);
  }, `删除【${params.username}】用户`);
  proPageInstance.value?.proTableInstance?.fetch();
};

// 批量删除用户信息
const batchDelete = async (id: string[]) => {
  await useConfirm(() => {
    data.value = data.value.filter(item => !id.includes(item.id));
  }, "删除所选用户信息");
  proPageInstance.value?.proTableInstance?.tableMainInstance?.clearSelection();
  proPageInstance.value?.proTableInstance?.fetch();
};

// 重置用户密码
const resetPass = async (params: TableRow<ResUserList>) => {
  await useConfirm(() => {}, `重置【${params.username}】用户密码`);
  proPageInstance.value?.proTableInstance?.fetch();
};

// 切换用户状态
const changeStatus = async (row: TableRow<ResUserList>) => {
  await useConfirm(() => {
    row.status === 0 ? (row.status = 1) : (row.status = 0);
  }, `切换【${row.username}】用户状态`);
};

// 导出用户列表
const downloadFile = async () => {
  ElMessageBox.confirm("确认导出用户数据?", "温馨提示", { type: "warning" }).then(() => {
    const tHeader = [] as string[];
    columns.forEach(item => {
      if (!item.type && item.prop !== "operation") tHeader.push(item.prop!);
    });
    const filterVal = tHeader;
    const d = formatJsonToArray(data.value, filterVal);
    exportJsonToExcel(tHeader, d, "proTable", undefined, undefined, true, "xlsx");
  });
};

const handleFormChange = async (fromValue: unknown, prop: string, scope: Recordable) => {
  setProp(data.value[scope.rowIndex], prop, fromValue);
};

const model = ref({ name: "aaa" });
const dialogVisible = ref(false);
const confirmLoading = ref(false);

const elFormProps: Partial<ElFormProps> = {
  rules: {
    name: [{ required: true, message: "请输入名称" }],
    tag: [{ required: true, message: "请输入标签" }],
  },
};

const columns2: FormColumn[] = [
  {
    label: "名称",
    prop: "name",
    tooltip: "名称最多显示6个字符",
    editable: false,
  },
  {
    label: "状态",
    prop: "status",
    el: "el-select",
    options: [
      { label: "未解决", value: "0", color: "red" },
      { label: "已解决", value: "1", color: "blue" },
      { label: "解决中", value: "2", color: "yellow" },
      { label: "失败", value: "3", color: "red" },
    ],
  },
  {
    label: "是否显示",
    prop: "switch",
    el: "el-switch",
  },

  {
    label: "时间",
    prop: "time",
    el: "el-date-picker",
  },
  {
    label: "数量",
    prop: "number",
    el: "el-input-number",
    elProps: { precision: 2, step: 2 },
  },
  {
    label: "城市",
    prop: "city",
    el: "el-cascader",
    options: [
      {
        value: "0",
        label: "陕西",
        children: [
          {
            value: "0-0",
            label: "西安",
            children: [
              { value: "0-0-0", label: "新城区" },
              { value: "0-0-1", label: "高新区" },
              { value: "0-0-2", label: "灞桥区" },
            ],
          },
        ],
      },
      {
        value: "1",
        label: "山西",
        children: [
          {
            value: "1-0",
            label: "太原",
            children: [
              { value: "1-0-0", label: "小店区" },
              { value: "1-0-1", label: "古交市" },
              { value: "1-0-2", label: "万柏林区" },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "地区",
    prop: "place",
    tooltip: "请精确到门牌号",
    elProps: {
      placeholder: "请精确到门牌号",
    },
  },
  {
    label: "要求",
    prop: "demand",
    el: "el-checkbox",
    options: [
      { label: "四六级", value: "0" },
      { label: "计算机二级证书", value: "1" },
      { label: "普通话证书", value: "2" },
    ],
  },
  {
    label: "梦想",
    prop: "gift",
    el: "el-radio",
    options: [
      { label: "诗", value: "0" },
      { label: "远方", value: "1" },
      { label: "美食", value: "2" },
    ],
  },
  {
    label: "到期时间",
    prop: "endTime",
    el: "el-date-picker",
    elProps: {
      type: "datetimerange",
      startPlaceholder: "请选择开始时间",
      endPlaceholder: "请选择结束时间",
    },
  },
  {
    label: "说明",
    prop: "desc",
    el: "el-input",
    colProps: {
      span: 24,
    },
    elProps: {
      type: "textarea",
      maxlength: 10,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 4 },
    },
  },
];

const handleSubmit = () => {
  confirmLoading.value = true;
  console.log("提交表单", model.value);
  setTimeout(() => {
    confirmLoading.value = false;
    dialogVisible.value = false;
  }, 2000);
};
</script>

<template>
  <el-input
    size="large"
    v-model="input2"
    style="width: 500px; margin-bottom: 20px"
    placeholder="Please input"
    :prefix-icon="Search"
  >
    <template #prepend>
      <el-select size="large" v-model="select" placeholder="Select" style="width: 150px">
        <el-option label="查询钱包地址" value="1" />
        <el-option label="查询Token地址" value="2" />
      </el-select>
    </template>
    <template #append>
      <el-button :icon="Search" />
    </template>
  </el-input>

  <ProPage
    :title="`标题xxxxxxxx`"
    ref="proPageInstance"
    :columns="columns"
    :data="data"
    height="calc(100% - 124px)"
    page-scope
    init-native-row-field
    @form-change="handleFormChange"
  >
    <template #head-left>
      <el-button type="primary" :icon="Download" plain @click="downloadFile">导出数据</el-button>
    </template>

    <template #expand="scope">
      {{ scope.row }}
    </template>

    <template #createTime="scope">
      <el-button type="primary" link @click="ElMessage.success('我是通过作用域插槽渲染的内容')">
        {{ scope.row?.createTime }}
      </el-button>
    </template>
    <template #email="scope">
      <div>
        {{ scope.row?.email }}
      </div>
      <div class="tag-content">
        <el-tag type="primary" effect="dark">Tag 1</el-tag>
        <el-tag type="success" effect="dark">Tag 2</el-tag>
        <el-tag type="info" effect="dark">Tag 3</el-tag>
        <el-tag type="warning" effect="light">Tag 4</el-tag>
        <el-tag type="danger" effect="dark" closable>Tag 5</el-tag>
      </div>
    </template>

    <template #operation="{ row }">
      <el-button
        v-if="!row._editable"
        type="primary"
        link
        :icon="EditPen"
        @click="
          () => {
            dialogVisible = true;
          }
        "
      >
        打标签
      </el-button>
      <!-- <el-button
        v-if="!row._editable"
        type="primary"
        link
        :icon="Delete"
        @click="deleteAccount(row as TableRow<ResUserList>)"
      >
        删除
      </el-button> -->
    </template>
  </ProPage>
  <ProFormDialog
    v-model:visible="dialogVisible"
    v-model="model"
    :dialog="{ title: '添加标签', confirmLoading, fullscreenIcon: false }"
    :form="{ elFormProps, columns: columns2 }"
    @confirm="handleSubmit"
  />
</template>
<style lang="scss" scoped>
.tag-content {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}
</style>
