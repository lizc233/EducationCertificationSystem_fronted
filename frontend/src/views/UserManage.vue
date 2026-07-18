<template>
  <StandardPage
    title="用户管理"
    :breadcrumbs="['首页', '用户管理', '用户管理']"
    description="系统不开放注册，用户账号统一由管理员维护，支持管理员、老师、学生三类账号的新增、批量导入、启停和密码重置。"
  >
    <template #actions>
      <el-button @click="downloadTemplate">下载模板</el-button>
      <el-button @click="openBatchDialog">批量添加</el-button>
      <el-button type="primary" @click="openCreateDialog">新增用户</el-button>
    </template>

    <template v-if="canManageUsers" #filters>
      <el-form :inline="true" :model="filters" class="user-filter-form">
        <el-form-item>
          <el-input
            v-model.trim="filters.keyword"
            placeholder="搜索姓名、账号、手机号或邮箱"
            clearable
            style="width: 280px"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.role" placeholder="角色" clearable style="width: 160px">
            <el-option label="全部角色" value="" />
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.department" placeholder="部门/班级" clearable style="width: 190px">
            <el-option label="全部部门" value="" />
            <el-option
              v-for="item in departmentOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.status" placeholder="状态" clearable style="width: 140px">
            <el-option label="全部状态" value="" />
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="applyFilters">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <section v-if="!canManageUsers" class="section-card">
      <el-result icon="warning" title="无权限" sub-title="只有管理员可以访问用户管理模块。" />
    </section>

    <template v-else>
      <section class="page-kpis">
        <article class="page-kpi">
          <div class="page-kpi__label">用户总数</div>
          <div class="page-kpi__value">{{ userStats.total }}</div>
          <div class="page-kpi__desc">当前统一用户目录中的账号总量。</div>
        </article>
        <article class="page-kpi">
          <div class="page-kpi__label">启用账号</div>
          <div class="page-kpi__value">{{ userStats.active }}</div>
          <div class="page-kpi__desc">允许登录系统并参与业务处理的账号数量。</div>
        </article>
        <article class="page-kpi">
          <div class="page-kpi__label">管理员 / 老师</div>
          <div class="page-kpi__value">{{ userStats.admins }} / {{ userStats.teachers }}</div>
          <div class="page-kpi__desc">管理员统一负责账号治理和用户信息维护。</div>
        </article>
        <article class="page-kpi">
          <div class="page-kpi__label">学生账号</div>
          <div class="page-kpi__value">{{ userStats.students }}</div>
          <div class="page-kpi__desc">学生使用学号、手机号或邮箱登录。</div>
        </article>
      </section>

      <section class="section-card">
        <div class="section-card__header">
          <div>
            <h3 class="section-card__title">用户清单</h3>
            <p class="user-manage__sub">
              管理员和老师使用工号、手机号或邮箱登录，学生使用学号、手机号或邮箱登录。
            </p>
          </div>
          <div class="section-card__extra">
            <el-button :loading="exporting" @click="handleExport">导出筛选结果</el-button>
          </div>
        </div>

        <el-table v-loading="loading" :data="tableData" border stripe>
          <el-table-column label="序号" width="72" align="center">
            <template #default="{ $index }">
              {{ (pagination.currentPage - 1) * pagination.pageSize + $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="accountId" label="账号" min-width="130" />
          <el-table-column prop="realName" label="姓名" min-width="110" />
          <el-table-column label="角色" min-width="100">
            <template #default="{ row }">
              <el-tag :type="roleTagType(row.role)" effect="light">
                {{ roleLabel(row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="department" label="部门/班级" min-width="150" />
          <el-table-column label="可用登录账号" min-width="300">
            <template #default="{ row }">
              <div class="login-account-stack">
                <el-tag
                  v-for="item in buildLoginAccounts(row)"
                  :key="`${row.id}-${item}`"
                  effect="plain"
                  class="login-account-tag"
                >
                  {{ item }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="96" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="light">
                {{ row.status === 1 ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" min-width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="300" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
              <el-button type="primary" link @click="handleResetPassword(row)">重置密码</el-button>
              <el-button type="primary" link @click="toggleStatus(row)">
                {{ row.status === 1 ? '停用' : '启用' }}
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="crud-pagination">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            background
            layout="total, sizes, prev, pager, next"
            :page-sizes="[5, 10, 20, 50]"
            :total="pagination.total"
            @current-change="loadTable"
            @size-change="handlePageSizeChange"
          />
        </div>
      </section>

      <el-dialog
        v-model="dialogVisible"
        :title="dialogMode === 'create' ? '新增用户' : '编辑用户'"
        width="620px"
        destroy-on-close
      >
        <el-form
          ref="dialogFormRef"
          :model="dialogForm"
          :rules="dialogRules"
          label-width="90px"
        >
          <el-form-item label="角色" prop="role">
            <el-select v-model="dialogForm.role" placeholder="请选择角色" class="w-full">
              <el-option
                v-for="item in roleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="accountLabel" prop="accountId">
            <el-input v-model.trim="dialogForm.accountId" :placeholder="`请输入${accountLabel}`" />
          </el-form-item>
          <el-form-item label="姓名" prop="realName">
            <el-input v-model.trim="dialogForm.realName" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="部门/班级" prop="department">
            <el-input v-model.trim="dialogForm.department" placeholder="请输入部门、学院或班级名称" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model.trim="dialogForm.phone" placeholder="可作为登录账号" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="dialogForm.email" placeholder="可作为登录账号" />
          </el-form-item>
          <div class="paper-note">
            {{ loginRuleText }} 初始密码统一为 {{ DEFAULT_PASSWORD }}，账号仅能由管理员创建和维护。
          </div>
        </el-form>

        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmitDialog">确定</el-button>
        </template>
      </el-dialog>

      <el-dialog
        v-model="batchDialogVisible"
        title="批量添加用户"
        width="900px"
        destroy-on-close
      >
        <div class="batch-dialog">
          <el-alert
            title="每行一条记录，格式为“角色,账号,姓名,部门/班级,手机号,邮箱”。角色支持：管理员、老师、学生。"
            type="info"
            show-icon
            :closable="false"
          />

          <div class="batch-toolbar">
            <el-button @click="fillBatchTemplate">填充示例模板</el-button>
            <el-button @click="batchForm.content = ''">清空内容</el-button>
            <span class="batch-toolbar__text">
              成功解析 {{ batchParseResult.records.length }} 条，错误 {{ batchParseResult.errors.length }} 条
            </span>
          </div>

          <el-input
            v-model="batchForm.content"
            type="textarea"
            :rows="9"
            resize="none"
            placeholder="角色,账号,姓名,部门/班级,手机号,邮箱"
          />

          <div v-if="batchParseResult.errors.length" class="batch-error-list">
            <div
              v-for="item in batchParseResult.errors.slice(0, 6)"
              :key="item"
              class="batch-error-item"
            >
              {{ item }}
            </div>
          </div>

          <el-table
            v-if="batchParseResult.records.length"
            :data="batchParseResult.records"
            border
            max-height="260"
          >
            <el-table-column prop="accountId" label="账号" min-width="130" />
            <el-table-column prop="realName" label="姓名" min-width="100" />
            <el-table-column label="角色" min-width="100">
              <template #default="{ row }">
                {{ roleLabel(row.role) }}
              </template>
            </el-table-column>
            <el-table-column prop="department" label="部门/班级" min-width="140" />
            <el-table-column prop="phone" label="手机号" min-width="120" />
            <el-table-column prop="email" label="邮箱" min-width="180" />
          </el-table>
        </div>

        <template #footer>
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="batchSubmitting" @click="handleBatchCreate">确认添加</el-button>
        </template>
      </el-dialog>
    </template>
  </StandardPage>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../components/page/StandardPage.vue';
import { ROLE_LABEL_MAP, useUserStore } from '../store/user';
import request from '../utils/request';

const DEFAULT_PASSWORD = '123456';
const ROLE_ORDER = ['ROLE_SUPER_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT'];
const ROLE_ALIAS_MAP = {
  管理员: 'ROLE_SUPER_ADMIN',
  admin: 'ROLE_SUPER_ADMIN',
  administrator: 'ROLE_SUPER_ADMIN',
  老师: 'ROLE_TEACHER',
  教师: 'ROLE_TEACHER',
  teacher: 'ROLE_TEACHER',
  学生: 'ROLE_STUDENT',
  student: 'ROLE_STUDENT'
};

const userStore = useUserStore();

const canManageUsers = computed(() => userStore.isSuperAdmin);
const loading = ref(false);
const submitting = ref(false);
const batchSubmitting = ref(false);
const exporting = ref(false);

const tableData = ref([]);
const snapshotRecords = ref([]);
const roleOptions = ref([]);

const filters = reactive({
  keyword: '',
  role: '',
  department: '',
  status: ''
});

const appliedFilters = reactive({
  keyword: '',
  role: '',
  department: '',
  status: ''
});

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const dialogVisible = ref(false);
const dialogMode = ref('create');
const dialogFormRef = ref();
const dialogForm = reactive(createDialogForm());

const batchDialogVisible = ref(false);
const batchForm = reactive({
  content: ''
});

const dialogRules = {
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  accountId: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请输入部门或班级', trigger: 'blur' }],
  phone: [
    {
      validator: (_, value, callback) => {
        if (!value) {
          callback();
          return;
        }
        if (!/^1\d{10}$/.test(String(value).trim())) {
          callback(new Error('手机号格式不正确'));
          return;
        }
        callback();
      },
      trigger: ['blur', 'change']
    }
  ],
  email: [
    {
      type: 'email',
      message: '邮箱格式不正确',
      trigger: ['blur', 'change']
    }
  ]
};

const departmentOptions = computed(() => {
  return Array.from(
    new Set(
      snapshotRecords.value
        .map((item) => item.department)
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right, 'zh-CN'));
});

const userStats = computed(() => {
  return snapshotRecords.value.reduce(
    (stats, item) => {
      stats.total += 1;
      if (item.status === 1) {
        stats.active += 1;
      }
      if (item.role === 'ROLE_SUPER_ADMIN') {
        stats.admins += 1;
      } else if (item.role === 'ROLE_TEACHER') {
        stats.teachers += 1;
      } else if (item.role === 'ROLE_STUDENT') {
        stats.students += 1;
      }
      return stats;
    },
    { total: 0, active: 0, admins: 0, teachers: 0, students: 0 }
  );
});

const accountLabel = computed(() => (dialogForm.role === 'ROLE_STUDENT' ? '学号' : '工号'));
const loginRuleText = computed(() => {
  if (dialogForm.role === 'ROLE_STUDENT') {
    return '学生使用学号、手机号或邮箱登录。';
  }
  return '管理员和老师使用工号、手机号或邮箱登录。';
});

const batchParseResult = computed(() => parseBatchUsers(batchForm.content));

watch(dialogVisible, async (visible) => {
  if (!visible) {
    return;
  }
  await nextTick();
  dialogFormRef.value?.clearValidate();
});

onMounted(async () => {
  if (canManageUsers.value) {
    await initializePage();
  }
});

function createDialogForm() {
  return {
    id: null,
    role: 'ROLE_TEACHER',
    accountId: '',
    realName: '',
    department: '',
    phone: '',
    email: ''
  };
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  return String(value).replace('T', ' ').slice(0, 19);
}

function roleLabel(role) {
  return ROLE_LABEL_MAP[role] || role;
}

function roleTagType(role) {
  if (role === 'ROLE_SUPER_ADMIN') {
    return 'danger';
  }
  if (role === 'ROLE_TEACHER') {
    return 'warning';
  }
  return 'success';
}

function buildLoginAccounts(row) {
  const accounts = row.loginAccounts?.length
    ? row.loginAccounts
    : [row.accountId, row.phone, row.email];
  return accounts.filter(Boolean);
}

function buildQueryParams(override = {}) {
  const status = override.status ?? appliedFilters.status;
  return {
    pageNum: override.pageNum ?? pagination.currentPage,
    pageSize: override.pageSize ?? pagination.pageSize,
    keyword: override.keyword ?? appliedFilters.keyword,
    role: override.role ?? appliedFilters.role,
    department: override.department ?? appliedFilters.department,
    status: status === '' || status === null || typeof status === 'undefined' ? undefined : Number(status)
  };
}

async function initializePage() {
  await fetchRoleOptions();
  await Promise.all([loadSnapshot(), loadTable()]);
}

async function fetchRoleOptions() {
  const rows = await request.get('/user/roles');
  roleOptions.value = rows
    .map((item) => ({
      label: ROLE_LABEL_MAP[item.roleCode] || item.roleName || item.roleCode || item.code || item.name,
      value: item.roleCode || item.code || ''
    }))
    .filter((item) => item.value)
    .sort((left, right) => {
      const leftIndex = ROLE_ORDER.indexOf(left.value);
      const rightIndex = ROLE_ORDER.indexOf(right.value);
      return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex)
        - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
    });
}

async function loadSnapshot() {
  const page = await request.get('/user/list', {
    params: {
      pageNum: 1,
      pageSize: 500
    }
  });
  snapshotRecords.value = page.records || [];
}

async function loadTable() {
  loading.value = true;
  try {
    const page = await request.get('/user/list', {
      params: buildQueryParams()
    });
    tableData.value = page.records || [];
    pagination.total = page.total || 0;
  } finally {
    loading.value = false;
  }
}

async function refreshTableAndSnapshot() {
  await Promise.all([loadSnapshot(), loadTable()]);
}

function applyFilters() {
  appliedFilters.keyword = filters.keyword;
  appliedFilters.role = filters.role;
  appliedFilters.department = filters.department;
  appliedFilters.status = filters.status;
  pagination.currentPage = 1;
  loadTable();
}

function resetFilters() {
  filters.keyword = '';
  filters.role = '';
  filters.department = '';
  filters.status = '';
  applyFilters();
}

function handlePageSizeChange() {
  pagination.currentPage = 1;
  loadTable();
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
    role: row.role,
    accountId: row.accountId,
    realName: row.realName,
    department: row.department,
    phone: row.phone,
    email: row.email
  });
  dialogVisible.value = true;
}

async function handleSubmitDialog() {
  const valid = await dialogFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      role: dialogForm.role,
      accountId: dialogForm.accountId.trim(),
      realName: dialogForm.realName.trim(),
      department: dialogForm.department.trim(),
      phone: dialogForm.phone.trim(),
      email: dialogForm.email.trim()
    };

    if (dialogMode.value === 'create') {
      await request.post('/user', payload);
      ElMessage.success('用户新增成功');
    } else {
      await request.put(`/user/${dialogForm.id}`, payload);
      ElMessage.success('用户信息已更新');
    }

    dialogVisible.value = false;
    await refreshTableAndSnapshot();

    if (dialogForm.id === userStore.userInfo.id) {
      await userStore.getUserInfo();
    }
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row) {
  if (row.id === userStore.userInfo.id) {
    ElMessage.warning('当前登录账号不能删除');
    return;
  }

  try {
    await ElMessageBox.confirm(`确认删除用户“${row.realName}”吗？删除后该账号将无法登录系统。`, '删除确认', {
      type: 'warning'
    });
  } catch {
    return;
  }

  await request.delete(`/user/${row.id}`);
  ElMessage.success('用户已删除');
  await refreshTableAndSnapshot();
}

async function handleResetPassword(row) {
  try {
    await ElMessageBox.confirm(
      `确认将 ${row.realName} 的密码重置为 ${DEFAULT_PASSWORD} 吗？`,
      '重置密码',
      { type: 'warning' }
    );
  } catch {
    return;
  }

  await request.post(`/user/${row.id}/reset-password`, {
    password: DEFAULT_PASSWORD
  });
  ElMessage.success(`已将 ${row.realName} 的密码重置为 ${DEFAULT_PASSWORD}`);
}

async function toggleStatus(row) {
  if (row.id === userStore.userInfo.id) {
    ElMessage.warning('当前登录账号不能被停用');
    return;
  }

  const targetStatus = row.status === 1 ? 0 : 1;
  await request.put(`/user/${row.id}/status`, {
    status: targetStatus
  });
  ElMessage.success(`${row.realName} 已${targetStatus === 1 ? '启用' : '停用'}`);
  await refreshTableAndSnapshot();
}

function openBatchDialog() {
  batchForm.content = '';
  batchDialogVisible.value = true;
}

function fillBatchTemplate() {
  batchForm.content = createUserTemplateText();
}

function downloadTemplate() {
  downloadTextFile(createUserTemplateText(), 'user-import-template.csv');
}

async function handleBatchCreate() {
  if (!batchForm.content.trim()) {
    ElMessage.warning('请先填写批量导入内容');
    return;
  }

  if (!batchParseResult.value.records.length) {
    ElMessage.warning(batchParseResult.value.errors[0] || '没有可添加的数据');
    return;
  }

  if (batchParseResult.value.errors.length) {
    ElMessage.error(batchParseResult.value.errors[0]);
    return;
  }

  batchSubmitting.value = true;
  try {
    await request.post('/user/batch', {
      users: batchParseResult.value.records
    });
    ElMessage.success(`批量添加成功，共新增 ${batchParseResult.value.records.length} 个用户`);
    batchDialogVisible.value = false;
    await refreshTableAndSnapshot();
  } finally {
    batchSubmitting.value = false;
  }
}

async function handleExport() {
  exporting.value = true;
  try {
    const page = await request.get('/user/list', {
      params: {
        ...buildQueryParams({
          pageNum: 1,
          pageSize: 500
        })
      }
    });

    const lines = [
      '角色,账号,姓名,部门/班级,手机号,邮箱,状态,创建时间',
      ...(page.records || []).map((item) => {
        return [
          roleLabel(item.role),
          item.accountId,
          item.realName,
          item.department,
          item.phone,
          item.email,
          item.status === 1 ? '启用' : '停用',
          formatDateTime(item.createdAt)
        ].join(',');
      })
    ];

    downloadTextFile(lines.join('\n'), `user-list-${new Date().toISOString().slice(0, 10)}.csv`);
  } finally {
    exporting.value = false;
  }
}

function normalizeRole(value) {
  const key = String(value || '').trim();
  return ROLE_ALIAS_MAP[key] || ROLE_ALIAS_MAP[key.toLowerCase()] || '';
}

function parseBatchUsers(content) {
  const records = [];
  const errors = [];
  const lines = String(content || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  lines.forEach((line, index) => {
    const parts = line.split(/[,，]/).map((item) => item.trim());
    if (parts.length < 4) {
      errors.push(`第 ${index + 1} 行格式不正确，至少需要：角色,账号,姓名,部门/班级`);
      return;
    }

    const role = normalizeRole(parts[0]);
    if (!role) {
      errors.push(`第 ${index + 1} 行角色无效：${parts[0]}`);
      return;
    }

    const record = {
      role,
      accountId: parts[1] || '',
      realName: parts[2] || '',
      department: parts[3] || '',
      phone: parts[4] || '',
      email: parts[5] || ''
    };

    if (!record.accountId || !record.realName || !record.department) {
      errors.push(`第 ${index + 1} 行缺少必要字段`);
      return;
    }

    records.push(record);
  });

  return { records, errors };
}

function createUserTemplateText() {
  return [
    '管理员,A2026010,管理员示例,教务处,13800000100,admin-demo@school.edu',
    '老师,T2026010,老师示例,计算机学院,13800000101,teacher-demo@school.edu',
    '学生,S2026010,学生示例,计科 2501,13800000102,student-demo@school.edu'
  ].join('\n');
}

function downloadTextFile(content, fileName) {
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}
</script>

<style scoped>
.user-filter-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.user-manage__sub {
  margin: 10px 0 0;
  color: var(--text-secondary);
  line-height: 1.8;
}

.login-account-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.login-account-tag {
  margin-right: 0;
}

.batch-dialog {
  display: grid;
  gap: 16px;
}

.batch-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.batch-toolbar__text {
  font-size: 13px;
  color: var(--text-secondary);
}

.batch-error-list {
  display: grid;
  gap: 8px;
}

.batch-error-item {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(196, 71, 71, 0.08);
  color: #a33f3f;
  font-size: 13px;
  line-height: 1.7;
}
</style>
