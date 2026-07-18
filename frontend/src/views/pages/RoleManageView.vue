<template>
  <StandardPage
    title="角色与授权"
    :breadcrumbs="['首页', '基础管理', '角色与授权']"
    description="维护角色编码、数据范围与菜单授权，支持按角色配置系统可见页面。"
  >
    <template #actions>
      <el-button @click="loadData" :loading="loading">刷新</el-button>
      <el-button type="primary" @click="openCreateDialog">新增角色</el-button>
    </template>

    <section class="page-kpis">
      <article class="page-kpi">
        <div class="page-kpi__label">角色总数</div>
        <div class="page-kpi__value">{{ roleRows.length }}</div>
        <div class="page-kpi__desc">当前系统中可配置和使用的全部角色数量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">启用角色</div>
        <div class="page-kpi__value">{{ enabledCount }}</div>
        <div class="page-kpi__desc">状态为启用的角色，可正常分配给用户使用。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">内置角色</div>
        <div class="page-kpi__value">{{ builtInCount }}</div>
        <div class="page-kpi__desc">系统内置角色仅允许调整展示信息与菜单权限。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">菜单节点</div>
        <div class="page-kpi__value">{{ menuNodeCount }}</div>
        <div class="page-kpi__desc">可分配到角色的菜单节点总数，包含目录和页面。</div>
      </article>
    </section>

    <SectionCard title="角色列表">
      <el-table v-loading="loading" :data="roleRows" border stripe>
        <el-table-column prop="roleName" label="角色名称" min-width="160" />
        <el-table-column prop="roleCode" label="角色编码" min-width="180" />
        <el-table-column prop="roleType" label="角色类型" min-width="120" />
        <el-table-column prop="dataScope" label="数据范围" min-width="120" />
        <el-table-column prop="sortNo" label="排序" width="90" align="center" />
        <el-table-column prop="userCount" label="关联用户" width="100" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="Number(row.status) === 1 ? 'success' : 'info'" effect="light">
              {{ Number(row.status) === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link :disabled="isBuiltIn(row)" @click="removeRole(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增角色' : '编辑角色'"
      width="980px"
      destroy-on-close
    >
      <div class="role-dialog">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
          <div class="role-form-grid">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model.trim="form.roleName" />
            </el-form-item>
            <el-form-item label="角色编码" prop="roleCode">
              <el-input v-model.trim="form.roleCode" :disabled="codeLocked" placeholder="如 ROLE_AUDITOR" />
            </el-form-item>
            <el-form-item label="角色类型" prop="roleType">
              <el-select v-model="form.roleType" class="w-full">
                <el-option label="系统角色" value="SYSTEM" />
                <el-option label="业务角色" value="BUSINESS" />
                <el-option label="自定义角色" value="CUSTOM" />
              </el-select>
            </el-form-item>
            <el-form-item label="数据范围" prop="dataScope">
              <el-select v-model="form.dataScope" class="w-full">
                <el-option label="全部数据" value="ALL" />
                <el-option label="本部门" value="DEPARTMENT" />
                <el-option label="仅本人" value="SELF" />
                <el-option label="自定义" value="CUSTOM" />
              </el-select>
            </el-form-item>
            <el-form-item label="排序" prop="sortNo">
              <el-input-number v-model="form.sortNo" :min="0" class="w-full" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" class="w-full">
                <el-option label="启用" :value="1" />
                <el-option label="停用" :value="0" />
              </el-select>
            </el-form-item>
          </div>
          <el-form-item label="备注" prop="remark">
            <el-input v-model.trim="form.remark" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>

        <SectionCard title="菜单授权">
          <el-tree
            ref="menuTreeRef"
            :data="menuTree"
            node-key="id"
            show-checkbox
            default-expand-all
            :props="treeProps"
            class="role-menu-tree"
          />
        </SectionCard>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import request from '../../utils/request';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();

const BUILT_IN_ROLE_CODES = ['ROLE_SUPER_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT'];

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref('create');
const formRef = ref();
const menuTreeRef = ref();
const roleRows = ref([]);
const menuTree = ref([]);
const currentRoleCode = ref('');

const treeProps = {
  label: 'menuName',
  children: 'children'
};

const form = reactive(createForm());

const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  roleType: [{ required: true, message: '请选择角色类型', trigger: 'change' }],
  dataScope: [{ required: true, message: '请选择数据范围', trigger: 'change' }],
  sortNo: [{ required: true, message: '请输入排序', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};

const enabledCount = computed(() => roleRows.value.filter((item) => Number(item.status) === 1).length);
const builtInCount = computed(() => roleRows.value.filter((item) => isBuiltIn(item)).length);
const menuNodeCount = computed(() => flattenMenus(menuTree.value).length);
const codeLocked = computed(() => dialogMode.value === 'edit' && BUILT_IN_ROLE_CODES.includes(currentRoleCode.value));

onMounted(() => {
  loadData();
});

function createForm() {
  return {
    id: null,
    roleName: '',
    roleCode: '',
    roleType: 'CUSTOM',
    dataScope: 'ALL',
    sortNo: 0,
    status: 1,
    remark: '',
    menuIds: []
  };
}

function flattenMenus(nodes = []) {
  return nodes.flatMap((node) => [node, ...flattenMenus(node.children || [])]);
}

function isBuiltIn(row) {
  return BUILT_IN_ROLE_CODES.includes(row.roleCode);
}

async function loadData() {
  loading.value = true;
  try {
    const [roles, menus] = await Promise.all([
      request.get('/user/role-management'),
      request.get('/user/menu-tree')
    ]);
    roleRows.value = roles || [];
    menuTree.value = menus || [];
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  dialogMode.value = 'create';
  currentRoleCode.value = '';
  Object.assign(form, createForm());
  dialogVisible.value = true;
  nextTick(() => {
    formRef.value?.clearValidate();
    menuTreeRef.value?.setCheckedKeys([]);
  });
}

function openEditDialog(row) {
  dialogMode.value = 'edit';
  currentRoleCode.value = row.roleCode || '';
  Object.assign(form, createForm(), row, {
    sortNo: Number(row.sortNo ?? 0),
    status: Number(row.status ?? 1)
  });
  dialogVisible.value = true;
  nextTick(() => {
    formRef.value?.clearValidate();
    menuTreeRef.value?.setCheckedKeys(row.menuIds || []);
  });
}

function buildPayload() {
  const checkedKeys = menuTreeRef.value?.getCheckedKeys(false) || [];
  const halfCheckedKeys = menuTreeRef.value?.getHalfCheckedKeys() || [];
  return {
    roleName: form.roleName,
    roleCode: String(form.roleCode || '').trim().toUpperCase(),
    roleType: form.roleType,
    dataScope: form.dataScope,
    sortNo: Number(form.sortNo || 0),
    status: Number(form.status || 0),
    remark: form.remark,
    menuIds: Array.from(new Set([...checkedKeys, ...halfCheckedKeys]))
  };
}

async function saveRole() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  saving.value = true;
  try {
    const payload = buildPayload();
    if (dialogMode.value === 'create') {
      await request.post('/user/roles/manage', payload);
      ElMessage.success('角色新增成功');
    } else {
      await request.put(`/user/roles/manage/${form.id}`, payload);
      ElMessage.success('角色更新成功');
    }
    dialogVisible.value = false;
    await loadData();
    if ([currentRoleCode.value, payload.roleCode].includes(userStore.userInfo.role)) {
      await userStore.getUserInfo();
    }
  } finally {
    saving.value = false;
  }
}

async function removeRole(row) {
  try {
    await ElMessageBox.confirm(`确认删除角色“${row.roleName}”吗？`, '删除确认', {
      type: 'warning'
    });
  } catch {
    return;
  }

  await request.delete(`/user/roles/manage/${row.id}`);
  ElMessage.success('角色删除成功');
  await loadData();
}
</script>

<style scoped>
.role-dialog {
  display: grid;
  gap: 18px;
}

.role-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.role-menu-tree {
  max-height: 420px;
  overflow: auto;
  padding-right: 6px;
}

@media (max-width: 900px) {
  .role-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
