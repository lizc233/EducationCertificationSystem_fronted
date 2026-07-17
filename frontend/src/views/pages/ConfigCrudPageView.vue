<template>
  <StandardPage :title="config.title" :breadcrumbs="config.breadcrumbs" :description="config.description">
    <template #actions>
      <el-button
        v-for="action in config.pageActions || []"
        :key="action.label"
        :type="action.type || 'default'"
        :loading="Boolean(actionLoading[action.label])"
        @click="handlePageAction(action)"
      >
        {{ action.label }}
      </el-button>
    </template>

    <template v-if="config.filters?.length" #filters>
      <el-form :inline="true" :model="filters" class="crud-filter-form">
        <el-form-item
          v-for="filter in config.filters"
          :key="filter.prop"
          :label="filter.label"
        >
          <el-input
            v-if="filter.type === 'input'"
            v-model.trim="filters[filter.prop]"
            :placeholder="filter.placeholder"
            clearable
            style="width: 220px;"
          />
          <el-select
            v-else-if="filter.type === 'select'"
            v-model="filters[filter.prop]"
            clearable
            placeholder="请选择"
            style="width: 180px;"
          >
            <el-option
              v-for="option in filter.options"
              :key="option"
              :label="option"
              :value="option"
            />
          </el-select>
          <el-date-picker
            v-else-if="filter.type === 'daterange'"
            v-model="filters[filter.prop]"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 280px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="searchLoading" @click="runSearch">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <div v-if="config.layout === 'config'" class="split-grid split-grid--detail">
      <SectionCard title="当前配置说明">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="页面名称">{{ config.title }}</el-descriptions-item>
          <el-descriptions-item label="配置总数">{{ sourceRows.length }}</el-descriptions-item>
          <el-descriptions-item label="当前筛选结果">{{ filteredRows.length }}</el-descriptions-item>
          <el-descriptions-item label="维护说明">{{ config.description }}</el-descriptions-item>
        </el-descriptions>
        <div class="paper-note" style="margin-top: 16px;">
          配置类页面采用“说明 + 配置清单”的方式组织，减少大面积表格堆叠，便于快速定位规则和阈值。
        </div>
      </SectionCard>

      <SectionCard :title="config.dialog?.title ? `新增 / 维护${config.dialog.title}` : '配置表单'">
        <el-form ref="quickFormRef" :model="quickForm" :rules="dialogRules" label-position="top">
          <el-form-item
            v-for="field in config.dialog?.fields || []"
            :key="field.prop"
            :label="field.label"
            :prop="field.prop"
          >
            <el-input
              v-if="field.type === 'input'"
              v-model="quickForm[field.prop]"
            />
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="quickForm[field.prop]"
              type="textarea"
              :rows="3"
            />
            <el-select
              v-else-if="field.type === 'select'"
              v-model="quickForm[field.prop]"
            >
              <el-option
                v-for="option in field.options"
                :key="option"
                :label="option"
                :value="option"
              />
            </el-select>
          </el-form-item>
          <el-button type="primary" :loading="dialogSubmitting" @click="submitQuickForm">保存配置</el-button>
        </el-form>
      </SectionCard>
    </div>

    <SectionCard :title="config.tableTitle || '数据列表'" class="crud-table-card">
      <template v-if="config.tabs?.length" #extra>
        <el-tabs v-model="activeTab">
          <el-tab-pane
            v-for="tab in config.tabs"
            :key="tab.value"
            :label="tab.label"
            :name="tab.value"
          />
        </el-tabs>
      </template>

      <div class="crud-table-shell">
        <el-table v-loading="tableLoading" :data="pagedRows" border stripe class="crud-table" :height="config.layout === 'list' ? '100%' : undefined">
          <el-table-column
            v-for="column in config.columns"
            :key="column.label"
            :prop="column.prop === 'actions' ? undefined : column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :fixed="column.fixed"
          >
            <template #default="{ row }">
              <template v-if="column.type === 'tag'">
                <el-tag :type="column.tagType?.[row[column.prop]] || 'info'">
                  {{ row[column.prop] }}
                </el-tag>
              </template>
              <template v-else-if="column.type === 'actions'">
                <el-button
                  v-for="action in config.rowActions || []"
                  :key="action.label"
                  type="primary"
                  link
                  :loading="Boolean(actionLoading[`${action.label}-${row.id}`])"
                  @click="handleRowAction(action, row)"
                >
                  {{ action.label }}
                </el-button>
              </template>
              <template v-else>
                {{ row[column.prop] }}
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="crud-pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          background
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 30]"
          :total="filteredRows.length"
        />
      </div>
    </SectionCard>

    <el-dialog
      v-if="config.dialog"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="620px"
      destroy-on-close
    >
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-position="top">
        <el-form-item
          v-for="field in config.dialog.fields"
          :key="field.prop"
          :label="field.label"
          :prop="field.prop"
        >
          <el-input
            v-if="field.type === 'input'"
            v-model="dialogForm[field.prop]"
          />
          <el-input
            v-else-if="field.type === 'textarea'"
            v-model="dialogForm[field.prop]"
            type="textarea"
            :rows="4"
          />
          <el-select
            v-else-if="field.type === 'select'"
            v-model="dialogForm[field.prop]"
          >
            <el-option
              v-for="option in field.options"
              :key="option"
              :label="option"
              :value="option"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogSubmitting" @click="submitDialog">确定</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { crudPageConfigs } from '../../data/crudPages';

const props = defineProps({
  pageKey: {
    type: String,
    required: true
  }
});

const route = useRoute();
const router = useRouter();
const config = crudPageConfigs[props.pageKey];
const sourceRows = ref(config.rows.map((row) => ({ ...row })));
const dialogVisible = ref(false);
const dialogMode = ref('create');
const dialogFormRef = ref();
const quickFormRef = ref();
const dialogSubmitting = ref(false);
const searchLoading = ref(false);
const tableLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const activeTab = ref(config.tabs?.[0]?.value || '全部');
const actionLoading = reactive({});
const dialogForm = reactive({});
const quickForm = reactive({});

const filters = reactive(
  Object.fromEntries((config.filters || []).map((item) => [item.prop, item.type === 'daterange' ? [] : '']))
);

const dialogRules = Object.fromEntries(
  (config.dialog?.fields || []).map((field) => [
    field.prop,
    field.required === false
      ? []
      : [{ required: true, message: `请输入${field.label}`, trigger: field.type === 'select' ? 'change' : 'blur' }]
  ])
);

const filteredRows = computed(() => {
  return sourceRows.value.filter((row) => {
    if (config.tabs?.length && config.tabField && activeTab.value !== '全部' && row[config.tabField] !== activeTab.value) {
      return false;
    }

    return (config.filters || []).every((filter) => {
      const value = filters[filter.prop];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return true;
      }

      if (filter.type === 'input') {
        const fields = config.keywordFields || [filter.prop];
        return fields.some((field) => String(row[field] || '').includes(value));
      }

      if (filter.type === 'select') {
        return row[filter.prop] === value;
      }

      if (filter.type === 'daterange') {
        const [start, end] = value || [];
        const current = new Date(row.time || row.createdAt || row.updatedAt || row.deadline || row.uploadedAt || Date.now()).getTime();
        return (!start || current >= new Date(start).getTime()) && (!end || current <= new Date(end).getTime());
      }

      return true;
    });
  });
});

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

const dialogTitle = computed(() => `${dialogMode.value === 'create' ? '新增' : '编辑'}${config.dialog?.title || ''}`);

function buildRecordSchema() {
  if (config.dialog?.fields?.length) {
    return config.dialog.fields.map(({ prop, label, type }) => ({ prop, label, type }));
  }

  return config.columns
    .filter((column) => column.prop && column.prop !== 'actions')
    .map((column) => ({
      prop: column.prop,
      label: column.label,
      type: 'input'
    }));
}

function resetDialogForm(payload = {}) {
  Object.keys(dialogForm).forEach((key) => delete dialogForm[key]);
  (config.dialog?.fields || []).forEach((field) => {
    dialogForm[field.prop] = payload[field.prop] || '';
  });
}

function resetQuickForm() {
  Object.keys(quickForm).forEach((key) => delete quickForm[key]);
  (config.dialog?.fields || []).forEach((field) => {
    quickForm[field.prop] = '';
  });
}

async function simulateAsync(label, callback) {
  actionLoading[label] = true;
  try {
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    callback?.();
    ElMessage.success(`${label}成功`);
  } catch {
    ElMessage.error(`${label}失败`);
  } finally {
    actionLoading[label] = false;
  }
}

async function runSearch() {
  searchLoading.value = true;
  tableLoading.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 300));
  currentPage.value = 1;
  searchLoading.value = false;
  tableLoading.value = false;
  ElMessage.success('查询完成');
}

function resetFilters() {
  (config.filters || []).forEach((filter) => {
    filters[filter.prop] = filter.type === 'daterange' ? [] : '';
  });
  currentPage.value = 1;
  ElMessage.success('筛选条件已重置');
}

function openDialog(payload = {}) {
  dialogMode.value = payload.id ? 'edit' : 'create';
  resetDialogForm(payload);
  dialogVisible.value = true;
}

async function handlePageAction(action) {
  if (action.behavior === 'dialog' && config.dialog) {
    openDialog();
    return;
  }

  await simulateAsync(action.label);
}

async function handleRowAction(action, row) {
  const loadingKey = `${action.label}-${row.id}`;

  if (action.type === 'route') {
    actionLoading[loadingKey] = true;
    try {
      await router.push({
        name: 'record-workspace',
        params: {
          pageKey: props.pageKey,
          mode: action.mode || 'view',
          id: String(row.id)
        },
        query: {
          from: route.path,
          title: config.title,
          payload: JSON.stringify(row),
          schema: JSON.stringify(buildRecordSchema())
        }
      });
    } finally {
      actionLoading[loadingKey] = false;
    }
    return;
  }

  if (action.type === 'delete') {
    try {
      await ElMessageBox.confirm('删除后将无法恢复，是否继续？', '删除确认', {
        type: 'warning'
      });

      await simulateAsync(loadingKey, () => {
        sourceRows.value = sourceRows.value.filter((item) => item.id !== row.id);
        currentPage.value = 1;
      });
    } catch {
      ElMessage.info('已取消删除');
    }
    return;
  }

  await simulateAsync(loadingKey);
}

async function submitDialog() {
  const valid = await dialogFormRef.value?.validate().catch(() => false);
  if (!valid) {
    ElMessage.error('请先完善表单内容');
    return;
  }

  dialogSubmitting.value = true;
  try {
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    if (dialogMode.value === 'create') {
      sourceRows.value.unshift({
        id: `${props.pageKey}-${Date.now()}`,
        ...dialogForm
      });
    }
    ElMessage.success(`${dialogTitle.value}成功`);
    dialogVisible.value = false;
    currentPage.value = 1;
  } catch {
    ElMessage.error(`${dialogTitle.value}失败`);
  } finally {
    dialogSubmitting.value = false;
  }
}

async function submitQuickForm() {
  const valid = await quickFormRef.value?.validate().catch(() => false);
  if (!valid) {
    ElMessage.error('请先完善表单内容');
    return;
  }

  dialogSubmitting.value = true;
  try {
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    sourceRows.value.unshift({
      id: `${props.pageKey}-quick-${Date.now()}`,
      ...quickForm
    });
    resetQuickForm();
    ElMessage.success('保存成功');
    currentPage.value = 1;
  } catch {
    ElMessage.error('保存失败');
  } finally {
    dialogSubmitting.value = false;
  }
}

watch(pageSize, () => {
  currentPage.value = 1;
});

resetQuickForm();
</script>
