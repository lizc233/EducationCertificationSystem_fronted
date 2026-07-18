<template>
  <StandardPage
    title="系统参数"
    :breadcrumbs="['首页', '基础管理', '系统参数']"
    description="维护基础参数、认证参数与邮件参数。"
  >
    <template #actions>
      <el-button @click="loadRows" :loading="loading">刷新</el-button>
      <el-button type="primary" @click="openCreateDialog">新增参数</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters" class="crud-filter-form">
        <el-form-item>
          <el-input
            v-model.trim="filters.keyword"
            placeholder="搜索参数键、参数值或说明"
            clearable
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.group" clearable placeholder="分组" style="width: 160px">
            <el-option label="全部分组" value="" />
            <el-option label="基础参数" value="basic" />
            <el-option label="认证参数" value="certification" />
            <el-option label="邮件参数" value="mail" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.status" clearable placeholder="状态" style="width: 140px">
            <el-option label="全部状态" value="" />
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="pagination.currentPage = 1">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <section class="page-kpis">
      <article class="page-kpi">
        <div class="page-kpi__label">参数总数</div>
        <div class="page-kpi__value">{{ normalizedRows.length }}</div>
        <div class="page-kpi__desc">当前系统中已维护的参数条目总量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">启用参数</div>
        <div class="page-kpi__value">{{ activeCount }}</div>
        <div class="page-kpi__desc">当前参与业务计算和系统运行的参数数量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">认证参数</div>
        <div class="page-kpi__value">{{ certificationCount }}</div>
        <div class="page-kpi__desc">与达成度、问卷提醒等业务相关的参数数量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">邮件参数</div>
        <div class="page-kpi__value">{{ mailCount }}</div>
        <div class="page-kpi__desc">通知发件配置与相关参数数量。</div>
      </article>
    </section>

    <SectionCard title="参数列表">
      <el-table v-loading="loading" :data="pagedRows" border stripe>
        <el-table-column prop="groupLabel" label="分组" min-width="120" />
        <el-table-column prop="key" label="参数键" min-width="190" />
        <el-table-column prop="value" label="参数值" min-width="160" />
        <el-table-column prop="type" label="类型" min-width="110" />
        <el-table-column prop="desc" label="说明" min-width="200" />
        <el-table-column label="状态" min-width="90">
          <template #default="{ row }">
            <el-tag :type="row.statusValue === 1 ? 'success' : 'info'" effect="light">
              {{ row.statusValue === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" min-width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="crud-pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          background
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          :total="filteredRows.length"
        />
      </div>
    </SectionCard>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增参数' : '编辑参数'"
      width="620px"
      destroy-on-close
    >
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="90px">
        <el-form-item label="参数键" prop="paramKey">
          <el-input v-model.trim="dialogForm.paramKey" placeholder="例如：system.name" />
        </el-form-item>
        <el-form-item label="参数值" prop="paramValue">
          <el-input v-model.trim="dialogForm.paramValue" />
        </el-form-item>
        <el-form-item label="类型" prop="paramType">
          <el-select v-model="dialogForm.paramType" class="w-full">
            <el-option label="STRING" value="STRING" />
            <el-option label="NUMBER" value="NUMBER" />
            <el-option label="BOOLEAN" value="BOOLEAN" />
          </el-select>
        </el-form-item>
        <el-form-item label="系统参数" prop="isSystem">
          <el-select v-model="dialogForm.isSystem" class="w-full">
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="dialogForm.status" class="w-full">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明" prop="remark">
          <el-input v-model.trim="dialogForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveDialog">确定</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import request from '../../utils/request';

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref('create');
const dialogFormRef = ref();
const rows = ref([]);

const filters = reactive({
  keyword: '',
  group: '',
  status: ''
});

const pagination = reactive({
  currentPage: 1,
  pageSize: 10
});

const dialogForm = reactive(createDialogForm());

const dialogRules = {
  paramKey: [{ required: true, message: '请输入参数键', trigger: 'blur' }],
  paramValue: [{ required: true, message: '请输入参数值', trigger: 'blur' }],
  paramType: [{ required: true, message: '请选择类型', trigger: 'change' }]
};

const normalizedRows = computed(() => rows.value.map(normalizeParam));

const filteredRows = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase();
  return normalizedRows.value.filter((item) => {
    if (keyword) {
      const matched = [item.key, item.value, item.desc].some((field) =>
        String(field || '').toLowerCase().includes(keyword)
      );
      if (!matched) {
        return false;
      }
    }

    if (filters.group && item.group !== filters.group) {
      return false;
    }

    if (filters.status !== '' && item.statusValue !== Number(filters.status)) {
      return false;
    }

    return true;
  });
});

const pagedRows = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  return filteredRows.value.slice(start, start + pagination.pageSize);
});

const activeCount = computed(() => normalizedRows.value.filter((item) => item.statusValue === 1).length);
const certificationCount = computed(() => normalizedRows.value.filter((item) => item.group === 'certification').length);
const mailCount = computed(() => normalizedRows.value.filter((item) => item.group === 'mail').length);

onMounted(() => {
  loadRows();
});

function createDialogForm() {
  return {
    id: null,
    paramKey: '',
    paramValue: '',
    paramType: 'STRING',
    isSystem: 0,
    status: 1,
    remark: ''
  };
}

function resolveGroup(key = '') {
  if (String(key).startsWith('mail.')) {
    return 'mail';
  }
  if (String(key).startsWith('achievement.') || String(key).startsWith('questionnaire.')) {
    return 'certification';
  }
  return 'basic';
}

function resolveGroupLabel(group) {
  return {
    basic: '基础参数',
    certification: '认证参数',
    mail: '邮件参数'
  }[group] || '基础参数';
}

function resolveStatusValue(value) {
  const text = String(value ?? '').toLowerCase();
  return text.includes('disable') || text.includes('停') || text.includes('鍋') ? 0 : 1;
}

function normalizeParam(item) {
  const group = resolveGroup(item.key);
  const statusValue = resolveStatusValue(item.status);
  return {
    ...item,
    group,
    groupLabel: resolveGroupLabel(group),
    statusValue
  };
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  return String(value).replace('T', ' ').slice(0, 19);
}

async function loadRows() {
  loading.value = true;
  try {
    rows.value = await request.get('/system/params');
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.keyword = '';
  filters.group = '';
  filters.status = '';
  pagination.currentPage = 1;
}

function openCreateDialog() {
  dialogMode.value = 'create';
  Object.assign(dialogForm, createDialogForm());
  dialogVisible.value = true;
}

function openEditDialog(row) {
  dialogMode.value = 'edit';
  Object.assign(dialogForm, {
    id: row.id,
    paramKey: row.key,
    paramValue: row.value,
    paramType: row.type,
    isSystem: 0,
    status: row.statusValue,
    remark: row.desc || ''
  });
  dialogVisible.value = true;
}

async function saveDialog() {
  const valid = await dialogFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  saving.value = true;
  try {
    const payload = {
      paramKey: dialogForm.paramKey.trim(),
      paramValue: dialogForm.paramValue.trim(),
      paramType: dialogForm.paramType,
      isSystem: Number(dialogForm.isSystem),
      status: Number(dialogForm.status),
      remark: dialogForm.remark?.trim() || ''
    };

    if (dialogMode.value === 'create') {
      await request.post('/system/params', payload);
      ElMessage.success('参数新增成功');
    } else {
      await request.put(`/system/params/${dialogForm.id}`, payload);
      ElMessage.success('参数已更新');
    }

    dialogVisible.value = false;
    await loadRows();
  } finally {
    saving.value = false;
  }
}
</script>
