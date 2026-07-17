<template>
  <StandardPage
    title="用户管理"
    :breadcrumbs="['首页', '用户管理', '用户管理']"
    description="账号不开放自助注册，管理员和教务老师统一负责管理员、老师、学生三类用户的新增、批量添加、启停与密码重置。"
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
            placeholder="搜索姓名、工号/学号、手机号或邮箱"
            clearable
            style="width: 280px"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.role" placeholder="角色" clearable style="width: 160px">
            <el-option label="全部角色" value="" />
            <el-option
              v-for="item in ROLE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.department" placeholder="院系" clearable style="width: 180px">
            <el-option label="全部院系" value="" />
            <el-option
              v-for="item in DEPARTMENT_OPTIONS"
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
      <el-result icon="warning" title="无权限" sub-title="仅管理员和教务老师可访问用户管理模块。" />
    </section>

    <template v-else>
      <section class="page-kpis">
        <article class="page-kpi">
          <div class="page-kpi__label">用户总数</div>
          <div class="page-kpi__value">{{ userStats.total }}</div>
          <div class="page-kpi__desc">当前统一用户目录中的全部账号数量。</div>
        </article>
        <article class="page-kpi">
          <div class="page-kpi__label">启用账号</div>
          <div class="page-kpi__value">{{ userStats.active }}</div>
          <div class="page-kpi__desc">允许登录系统并参与业务办理的账号数量。</div>
        </article>
        <article class="page-kpi">
          <div class="page-kpi__label">管理员 / 老师</div>
          <div class="page-kpi__value">{{ userStats.admins }} / {{ userStats.teachers }}</div>
          <div class="page-kpi__desc">管理员负责全局治理，老师可协同维护用户信息。</div>
        </article>
        <article class="page-kpi">
          <div class="page-kpi__label">学生账号</div>
          <div class="page-kpi__value">{{ userStats.students }}</div>
          <div class="page-kpi__desc">学生使用学号、手机号或邮箱登录学习端业务。</div>
        </article>
      </section>

      <section class="section-card">
        <div class="section-card__header">
          <div>
            <h3 class="section-card__title">用户清单</h3>
            <p class="user-manage__sub">管理员和老师使用工号、手机号或邮箱登录，学生使用学号、手机号或邮箱登录。</p>
          </div>
          <div class="section-card__extra">
            <el-button @click="handleExport">导出筛选结果</el-button>
          </div>
        </div>

        <el-table :data="pagedData" border stripe>
          <el-table-column label="序号" width="72" align="center">
            <template #default="{ $index }">
              {{ (pagination.currentPage - 1) * pagination.pageSize + $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="accountId" label="工号 / 学号" min-width="130" />
          <el-table-column prop="realName" label="姓名" min-width="110" />
          <el-table-column label="角色" min-width="100">
            <template #default="{ row }">
              <el-tag :type="roleTagType(row.role)" effect="light">
                {{ roleLabel(row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="department" label="院系" min-width="130" />
          <el-table-column label="登录账号" min-width="280">
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
          <el-table-column prop="createdAt" label="创建时间" min-width="160" />
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
            :page-sizes="[5, 10, 20]"
            :total="filteredData.length"
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
          label-width="88px"
        >
          <el-form-item label="角色" prop="role">
            <el-select v-model="dialogForm.role" placeholder="请选择角色" class="w-full">
              <el-option
                v-for="item in ROLE_OPTIONS"
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
          <el-form-item label="院系" prop="department">
            <el-select v-model="dialogForm.department" placeholder="请选择院系" class="w-full">
              <el-option
                v-for="item in DEPARTMENT_OPTIONS"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model.trim="dialogForm.phone" placeholder="请输入手机号，可作为登录账号" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="dialogForm.email" placeholder="请输入邮箱，可作为登录账号" />
          </el-form-item>
          <div class="paper-note">
            {{ loginRuleText }}
            初始密码统一为 {{ DEFAULT_PASSWORD }}，系统不提供注册入口，账号仅能由用户管理模块创建。
          </div>
        </el-form>

        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitDialog">确定</el-button>
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
            title="每行一条记录，按“角色,工号/学号,姓名,院系,手机号,邮箱”填写。支持角色写管理员、老师、学生。"
            type="info"
            show-icon
            :closable="false"
          />

          <div class="batch-toolbar">
            <el-button @click="fillBatchTemplate">填充示例模板</el-button>
            <el-button @click="batchForm.content = ''">清空内容</el-button>
            <span class="batch-toolbar__text">成功解析 {{ batchParseResult.records.length }} 条，错误 {{ batchParseResult.errors.length }} 条</span>
          </div>

          <el-input
            v-model="batchForm.content"
            type="textarea"
            :rows="9"
            resize="none"
            placeholder="角色,工号/学号,姓名,院系,手机号,邮箱"
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
            <el-table-column prop="accountId" label="工号 / 学号" min-width="130" />
            <el-table-column prop="realName" label="姓名" min-width="100" />
            <el-table-column label="角色" min-width="100">
              <template #default="{ row }">
                {{ roleLabel(row.role) }}
              </template>
            </el-table-column>
            <el-table-column prop="department" label="院系" min-width="120" />
            <el-table-column prop="phone" label="手机号" min-width="120" />
            <el-table-column prop="email" label="邮箱" min-width="180" />
          </el-table>
        </div>

        <template #footer>
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchCreate">确认添加</el-button>
        </template>
      </el-dialog>
    </template>
  </StandardPage>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../components/page/StandardPage.vue';
import { useUserStore } from '../store/user';
import {
  DEFAULT_PASSWORD,
  DEPARTMENT_OPTIONS,
  ROLE_LABEL_MAP,
  ROLE_OPTIONS,
  USER_ROLES,
  batchCreateUsers,
  buildLoginAccounts,
  createUser,
  createUserTemplateText,
  deleteUser,
  getAccountLabel,
  getLoginRuleText,
  getRoleStatSummary,
  getUserDirectory,
  parseBatchUsers,
  resetUserPassword,
  setUserStatus,
  updateUser,
  validateUserPayload
} from '../data/users';

const userStore = useUserStore();

const canManageUsers = computed(() => userStore.isSuperAdmin || userStore.isTeacher);
const tableData = ref(getUserDirectory());

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
  pageSize: 10
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
  accountId: [{ required: true, message: '请输入工号或学号', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请选择院系', trigger: 'change' }],
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

const userStats = computed(() => getRoleStatSummary(tableData.value));
const accountLabel = computed(() => getAccountLabel(dialogForm.role));
const loginRuleText = computed(() => getLoginRuleText(dialogForm.role));

const filteredData = computed(() => {
  return tableData.value.filter((item) => {
    const keyword = appliedFilters.keyword.trim();
    const keywordMatched =
      !keyword
      || item.realName.includes(keyword)
      || item.accountId.includes(keyword)
      || item.phone.includes(keyword)
      || item.email.includes(keyword);
    const roleMatched = !appliedFilters.role || item.role === appliedFilters.role;
    const departmentMatched = !appliedFilters.department || item.department === appliedFilters.department;
    const statusMatched = appliedFilters.status === '' || item.status === appliedFilters.status;

    return keywordMatched && roleMatched && departmentMatched && statusMatched;
  });
});

const pagedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  return filteredData.value.slice(start, start + pagination.pageSize);
});

const batchParseResult = computed(() => parseBatchUsers(batchForm.content, tableData.value));

watch(
  () => filteredData.value.length,
  (length) => {
    const maxPage = Math.max(1, Math.ceil(length / pagination.pageSize));
    if (pagination.currentPage > maxPage) {
      pagination.currentPage = maxPage;
    }
  }
);

watch(dialogVisible, async (visible) => {
  if (!visible) {
    return;
  }

  await nextTick();
  dialogFormRef.value?.clearValidate();
});

function createDialogForm() {
  return {
    id: null,
    role: USER_ROLES.TEACHER,
    accountId: '',
    realName: '',
    department: '',
    phone: '',
    email: ''
  };
}

function syncTableData() {
  tableData.value = getUserDirectory();
}

function roleLabel(role) {
  return ROLE_LABEL_MAP[role] || role;
}

function roleTagType(role) {
  if (role === USER_ROLES.ADMIN) {
    return 'danger';
  }
  if (role === USER_ROLES.TEACHER) {
    return 'warning';
  }
  return 'success';
}

function applyFilters() {
  appliedFilters.keyword = filters.keyword;
  appliedFilters.role = filters.role;
  appliedFilters.department = filters.department;
  appliedFilters.status = filters.status;
  pagination.currentPage = 1;
}

function resetFilters() {
  filters.keyword = '';
  filters.role = '';
  filters.department = '';
  filters.status = '';
  applyFilters();
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

  const validation = validateUserPayload(dialogForm, tableData.value, {
    excludeId: dialogMode.value === 'edit' ? dialogForm.id : undefined
  });

  if (!validation.valid) {
    ElMessage.error(validation.errors[0]);
    return;
  }

  try {
    if (dialogMode.value === 'create') {
      createUser(dialogForm);
      ElMessage.success('用户新增成功');
    } else {
      updateUser(dialogForm);
      ElMessage.success('用户信息已更新');
    }

    syncTableData();
    dialogVisible.value = false;

    if (dialogForm.id === userStore.userInfo.id) {
      await userStore.getUserInfo();
    }
  } catch (error) {
    ElMessage.error(error?.message || '保存失败');
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

  deleteUser(row.id);
  syncTableData();
  ElMessage.success('用户已删除');
}

function handleResetPassword(row) {
  resetUserPassword(row.id);
  ElMessage.success(`已将 ${row.realName} 的密码重置为 ${DEFAULT_PASSWORD}`);
}

async function toggleStatus(row) {
  if (row.id === userStore.userInfo.id) {
    ElMessage.warning('当前登录账号不能被停用');
    return;
  }

  const targetStatus = row.status === 1 ? 0 : 1;
  setUserStatus(row.id, targetStatus);
  syncTableData();
  ElMessage.success(`${row.realName} 已${targetStatus === 1 ? '启用' : '停用'}`);
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

function handleBatchCreate() {
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

  try {
    const result = batchCreateUsers(batchForm.content);
    syncTableData();
    batchDialogVisible.value = false;
    ElMessage.success(`批量添加成功，共新增 ${result.createdCount} 个用户`);
  } catch (error) {
    ElMessage.error(error?.message || '批量添加失败');
  }
}

function handleExport() {
  if (!filteredData.value.length) {
    ElMessage.warning('当前没有可导出的用户数据');
    return;
  }

  const lines = [
    '角色,工号/学号,姓名,院系,手机号,邮箱,状态,创建时间',
    ...filteredData.value.map((item) => {
      return [
        roleLabel(item.role),
        item.accountId,
        item.realName,
        item.department,
        item.phone,
        item.email,
        item.status === 1 ? '启用' : '停用',
        item.createdAt
      ].join(',');
    })
  ];

  downloadTextFile(lines.join('\n'), `user-list-${new Date().toISOString().slice(0, 10)}.csv`);
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
