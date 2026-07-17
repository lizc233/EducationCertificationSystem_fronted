<template>
  <div class="space-y-5">
    <section class="page-shell px-6 py-6 sm:px-8">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-[12px] uppercase tracking-[0.32em] text-[var(--text-3)]">基础管理</p>
          <h2 class="serif-title mt-3 text-[30px] text-[var(--text-1)]">用户管理</h2>
          <p class="mt-3 text-[14px] leading-7 text-[var(--text-2)]">
            统一维护账号、角色、院系与启停状态，支持筛选查询、分页浏览和信息维护。
          </p>
        </div>
      </div>
    </section>

    <el-card v-if="!userStore.isSuperAdmin" shadow="never" class="!border-[var(--line)]">
      <el-result icon="warning" title="无权限" sub-title="仅超级管理员可访问用户管理页面" />
    </el-card>

    <template v-else>
      <el-card shadow="never" class="!border-[var(--line)]">
        <el-form :inline="true" :model="filters" class="filter-form">
          <el-form-item>
            <el-input
              v-model.trim="filters.keyword"
              placeholder="搜索姓名/学号"
              clearable
              style="width: 220px"
            />
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.role" placeholder="角色" clearable style="width: 180px">
              <el-option label="全部" value="" />
              <el-option
                v-for="item in roleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.status" placeholder="状态" clearable style="width: 160px">
              <el-option label="全部" value="" />
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card shadow="never" class="!border-[var(--line)]">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="text-[16px] font-semibold text-[var(--text-1)]">用户列表</div>
            <div class="flex flex-wrap gap-2">
              <el-button type="primary" @click="openCreateDialog">新增用户</el-button>
              <el-button @click="handleImport">导入用户</el-button>
              <el-button @click="handleExport">导出</el-button>
            </div>
          </div>
        </template>

        <el-table :data="pagedData" border>
          <el-table-column label="序号" width="70">
            <template #default="{ $index }">
              {{ (pagination.currentPage - 1) * pagination.pageSize + $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="accountId" label="学号/工号" min-width="140" />
          <el-table-column prop="realName" label="姓名" min-width="110" />
          <el-table-column label="角色" min-width="120">
            <template #default="{ row }">
              <el-tag :type="roleTagType(row.role)" effect="light">
                {{ roleLabel(row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="department" label="院系" min-width="140" />
          <el-table-column prop="phone" label="手机号" min-width="130" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="light">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" min-width="160" />
          <el-table-column label="操作" min-width="280" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
              <el-button type="primary" link @click="handleResetPassword(row)">重置密码</el-button>
              <el-button type="primary" link @click="toggleStatus(row)">
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="mt-5 flex justify-end">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            background
            layout="total, sizes, prev, pager, next"
            :page-sizes="[5, 10, 20]"
            :total="filteredData.length"
          />
        </div>
      </el-card>

      <el-dialog
        v-model="dialogVisible"
        :title="dialogMode === 'create' ? '新增用户' : '编辑用户'"
        width="560px"
        destroy-on-close
      >
        <el-form
          ref="dialogFormRef"
          :model="dialogForm"
          :rules="dialogRules"
          label-width="90px"
        >
          <el-form-item label="学号/工号" prop="accountId">
            <el-input v-model.trim="dialogForm.accountId" />
          </el-form-item>
          <el-form-item label="姓名" prop="realName">
            <el-input v-model.trim="dialogForm.realName" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="dialogForm.email" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model.trim="dialogForm.phone" />
          </el-form-item>
          <el-form-item label="院系" prop="department">
            <el-select v-model="dialogForm.department" placeholder="请选择院系" class="w-full">
              <el-option
                v-for="item in departmentOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
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
        </el-form>

        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitDialog">确定</el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ROLE_LABEL_MAP, useUserStore } from '../store/user';

const userStore = useUserStore();

const roleOptions = [
  { label: '超级管理员', value: 'ROLE_SUPER_ADMIN' },
  { label: '教学老师', value: 'ROLE_TEACHER' },
  { label: '学生', value: 'ROLE_STUDENT' }
];

const departmentOptions = ['教务处', '计算机学院', '电子信息学院', '自动化学院'];

const mockUsers = [
  { id: 1, accountId: 'T2026001', realName: '张教务', role: 'ROLE_SUPER_ADMIN', department: '教务处', phone: '13800000001', email: 'admin@school.edu', status: 1, createdAt: '2026-07-01 09:00:00' },
  { id: 2, accountId: 'T2026002', realName: '李老师', role: 'ROLE_TEACHER', department: '计算机学院', phone: '13800000002', email: 'teacher@school.edu', status: 1, createdAt: '2026-07-01 09:10:00' },
  { id: 3, accountId: 'S2026001', realName: '王同学', role: 'ROLE_STUDENT', department: '计算机学院', phone: '13800000003', email: 'student@school.edu', status: 1, createdAt: '2026-07-01 09:20:00' },
  { id: 4, accountId: 'S2026002', realName: '赵同学', role: 'ROLE_STUDENT', department: '电子信息学院', phone: '13800000004', email: 'zhao@school.edu', status: 1, createdAt: '2026-07-02 10:00:00' },
  { id: 5, accountId: 'T2026003', realName: '陈老师', role: 'ROLE_TEACHER', department: '自动化学院', phone: '13800000005', email: 'chen@school.edu', status: 0, createdAt: '2026-07-02 10:20:00' },
  { id: 6, accountId: 'S2026003', realName: '周同学', role: 'ROLE_STUDENT', department: '计算机学院', phone: '13800000006', email: 'zhou@school.edu', status: 1, createdAt: '2026-07-03 11:00:00' },
  { id: 7, accountId: 'S2026004', realName: '吴同学', role: 'ROLE_STUDENT', department: '电子信息学院', phone: '13800000007', email: 'wu@school.edu', status: 0, createdAt: '2026-07-03 11:15:00' },
  { id: 8, accountId: 'T2026004', realName: '黄老师', role: 'ROLE_TEACHER', department: '计算机学院', phone: '13800000008', email: 'huang@school.edu', status: 1, createdAt: '2026-07-04 08:30:00' },
  { id: 9, accountId: 'A2026001', realName: '孙主任', role: 'ROLE_SUPER_ADMIN', department: '教务处', phone: '13800000009', email: 'sun@school.edu', status: 1, createdAt: '2026-07-04 09:30:00' },
  { id: 10, accountId: 'S2026005', realName: '郑同学', role: 'ROLE_STUDENT', department: '自动化学院', phone: '13800000010', email: 'zheng@school.edu', status: 1, createdAt: '2026-07-05 13:20:00' },
  { id: 11, accountId: 'T2026005', realName: '何老师', role: 'ROLE_TEACHER', department: '电子信息学院', phone: '13800000011', email: 'he@school.edu', status: 1, createdAt: '2026-07-05 14:10:00' },
  { id: 12, accountId: 'S2026006', realName: '林同学', role: 'ROLE_STUDENT', department: '计算机学院', phone: '13800000012', email: 'lin@school.edu', status: 0, createdAt: '2026-07-06 16:45:00' }
];

const tableData = ref(mockUsers.map((item) => ({ ...item })));
const filters = reactive({
  keyword: '',
  role: '',
  status: ''
});
const appliedFilters = reactive({
  keyword: '',
  role: '',
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

const dialogRules = {
  accountId: [{ required: true, message: '请输入学号/工号', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请选择院系', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  email: [
    {
      type: 'email',
      message: '邮箱格式不正确',
      trigger: ['blur', 'change']
    }
  ],
  phone: [
    {
      validator: (_, value, callback) => {
        if (!value) {
          callback();
          return;
        }

        if (!/^1\d{10}$/.test(value)) {
          callback(new Error('手机号格式不正确'));
          return;
        }

        callback();
      },
      trigger: ['blur', 'change']
    }
  ]
};

const filteredData = computed(() => {
  return tableData.value.filter((item) => {
    const keyword = appliedFilters.keyword.trim();
    const keywordMatched =
      !keyword ||
      item.realName.includes(keyword) ||
      item.accountId.includes(keyword);
    const roleMatched = !appliedFilters.role || item.role === appliedFilters.role;
    const statusMatched =
      appliedFilters.status === '' || item.status === appliedFilters.status;

    return keywordMatched && roleMatched && statusMatched;
  });
});

const pagedData = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return filteredData.value.slice(start, end);
});

watch(
  () => filteredData.value.length,
  (length) => {
    const maxPage = Math.max(1, Math.ceil(length / pagination.pageSize));
    if (pagination.currentPage > maxPage) {
      pagination.currentPage = maxPage;
    }
  }
);

function createDialogForm() {
  return {
    id: null,
    accountId: '',
    realName: '',
    email: '',
    phone: '',
    department: '',
    role: ''
  };
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

function handleSearch() {
  appliedFilters.keyword = filters.keyword;
  appliedFilters.role = filters.role;
  appliedFilters.status = filters.status;
  pagination.currentPage = 1;
}

function handleReset() {
  filters.keyword = '';
  filters.role = '';
  filters.status = '';
  handleSearch();
}

function openCreateDialog() {
  dialogMode.value = 'create';
  Object.assign(dialogForm, createDialogForm());
  dialogVisible.value = true;
}

function openEditDialog(row) {
  dialogMode.value = 'edit';
  Object.assign(dialogForm, { ...row });
  dialogVisible.value = true;
}

async function handleSubmitDialog() {
  const valid = await dialogFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  if (dialogMode.value === 'create') {
    tableData.value.unshift({
      ...dialogForm,
      id: Date.now(),
      status: 1,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\\//g, '-')
    });
    ElMessage.success('新增成功');
  } else {
    const target = tableData.value.find((item) => item.id === dialogForm.id);
    if (target) {
      Object.assign(target, { ...dialogForm });
    }
    ElMessage.success('编辑成功');
  }

  dialogVisible.value = false;
  handleSearch();
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确认删除用户“${row.realName}”吗？`, '删除确认', {
      type: 'warning'
    });
  } catch {
    return;
  }

  tableData.value = tableData.value.filter((item) => item.id !== row.id);
  ElMessage.success('删除成功');
}

function handleResetPassword(row) {
  ElMessage.success(`已为 ${row.realName} 重置密码，密码已重置为：123456`);
}

function toggleStatus(row) {
  row.status = row.status === 1 ? 0 : 1;
  ElMessage.success(`${row.realName} 已${row.status === 1 ? '启用' : '禁用'}`);
}

function handleImport() {
  ElMessage.warning('导入用户功能暂未实现');
}

function handleExport() {
  ElMessage.warning('导出功能暂未实现');
}
</script>

<style scoped>
.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
