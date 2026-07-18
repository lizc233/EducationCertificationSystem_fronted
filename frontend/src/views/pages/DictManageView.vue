<template>
  <StandardPage
    title="数据字典"
    :breadcrumbs="['首页', '基础管理', '数据字典']"
    description="统一维护字典类型和字典项，供组织、用户与业务表单复用。"
  >
    <template #actions>
      <el-button @click="loadData" :loading="loading">刷新</el-button>
      <el-button type="primary" @click="openTypeDialog()">新增字典类型</el-button>
      <el-button type="primary" plain :disabled="!currentType" @click="openItemDialog()">新增字典项</el-button>
    </template>

    <section class="page-kpis">
      <article class="page-kpi">
        <div class="page-kpi__label">字典类型</div>
        <div class="page-kpi__value">{{ dictTypes.length }}</div>
        <div class="page-kpi__desc">系统中已维护的字典类型数量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">字典项</div>
        <div class="page-kpi__value">{{ itemCount }}</div>
        <div class="page-kpi__desc">所有字典类型下累计维护的字典项数量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">启用类型</div>
        <div class="page-kpi__value">{{ enabledTypeCount }}</div>
        <div class="page-kpi__desc">当前状态为启用的字典类型，可被前端表单正常引用。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">当前项数</div>
        <div class="page-kpi__value">{{ currentItems.length }}</div>
        <div class="page-kpi__desc">当前选中字典类型下的可维护字典项数量。</div>
      </article>
    </section>

    <div class="split-grid split-grid--sidebar">
      <SectionCard title="字典类型">
        <el-table
          v-loading="loading"
          :data="dictTypes"
          border
          stripe
          highlight-current-row
          max-height="540"
          @current-change="handleCurrentTypeChange"
        >
          <el-table-column prop="dictName" label="字典名称" min-width="150" />
          <el-table-column prop="dictType" label="类型编码" min-width="160" />
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="Number(row.status) === 1 ? 'success' : 'info'" effect="light">
                {{ Number(row.status) === 1 ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click.stop="openTypeDialog(row)">编辑</el-button>
              <el-button type="danger" link @click.stop="removeType(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>

      <SectionCard :title="currentType ? `${currentType.dictName} 字典项` : '字典项'">
        <el-empty v-if="!currentType" description="请先从左侧选择字典类型" />
        <el-table v-else :data="currentItems" border stripe max-height="540">
          <el-table-column prop="itemLabel" label="显示名称" min-width="160" />
          <el-table-column prop="itemValue" label="字典值" min-width="160" />
          <el-table-column prop="itemSort" label="排序" width="90" align="center" />
          <el-table-column label="默认" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="Number(row.isDefault) === 1 ? 'success' : 'info'" effect="light">
                {{ Number(row.isDefault) === 1 ? '默认' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="Number(row.status) === 1 ? 'success' : 'info'" effect="light">
                {{ Number(row.status) === 1 ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openItemDialog(row)">编辑</el-button>
              <el-button type="danger" link @click="removeItem(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>
    </div>

    <el-dialog v-model="typeDialogVisible" :title="typeDialogMode === 'create' ? '新增字典类型' : '编辑字典类型'" width="560px">
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="90px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model.trim="typeForm.dictName" />
        </el-form-item>
        <el-form-item label="类型编码" prop="dictType">
          <el-input v-model.trim="typeForm.dictType" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="typeForm.status" class="w-full">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model.trim="typeForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="typeSaving" @click="saveType">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="itemDialogVisible" :title="itemDialogMode === 'create' ? '新增字典项' : '编辑字典项'" width="560px">
      <el-form ref="itemFormRef" :model="itemForm" :rules="itemRules" label-width="90px">
        <el-form-item label="所属类型" prop="dictTypeId">
          <el-select v-model="itemForm.dictTypeId" class="w-full">
            <el-option v-for="item in dictTypes" :key="item.id" :label="item.dictName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示名称" prop="itemLabel">
          <el-input v-model.trim="itemForm.itemLabel" />
        </el-form-item>
        <el-form-item label="字典值" prop="itemValue">
          <el-input v-model.trim="itemForm.itemValue" />
        </el-form-item>
        <el-form-item label="排序" prop="itemSort">
          <el-input-number v-model="itemForm.itemSort" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="默认项" prop="isDefault">
          <el-select v-model="itemForm.isDefault" class="w-full">
            <el-option label="否" :value="0" />
            <el-option label="是" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="itemForm.status" class="w-full">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model.trim="itemForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="itemSaving" @click="saveItem">保存</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import request from '../../utils/request';

const loading = ref(false);
const typeSaving = ref(false);
const itemSaving = ref(false);
const typeDialogVisible = ref(false);
const itemDialogVisible = ref(false);
const typeDialogMode = ref('create');
const itemDialogMode = ref('create');
const typeFormRef = ref();
const itemFormRef = ref();
const dictTypes = ref([]);
const currentTypeId = ref(null);

const typeForm = reactive(createTypeForm());
const itemForm = reactive(createItemForm());

const typeRules = {
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dictType: [{ required: true, message: '请输入类型编码', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};

const itemRules = {
  dictTypeId: [{ required: true, message: '请选择所属类型', trigger: 'change' }],
  itemLabel: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
  itemValue: [{ required: true, message: '请输入字典值', trigger: 'blur' }],
  itemSort: [{ required: true, message: '请输入排序', trigger: 'change' }],
  isDefault: [{ required: true, message: '请选择是否默认', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};

const currentType = computed(() => dictTypes.value.find((item) => item.id === currentTypeId.value) || null);
const currentItems = computed(() => currentType.value?.items || []);
const itemCount = computed(() => dictTypes.value.reduce((sum, item) => sum + (item.items?.length || 0), 0));
const enabledTypeCount = computed(() => dictTypes.value.filter((item) => Number(item.status) === 1).length);

onMounted(() => {
  loadData();
});

function createTypeForm() {
  return {
    id: null,
    dictName: '',
    dictType: '',
    status: 1,
    remark: ''
  };
}

function createItemForm() {
  return {
    id: null,
    dictTypeId: null,
    itemLabel: '',
    itemValue: '',
    itemSort: 0,
    isDefault: 0,
    status: 1,
    remark: ''
  };
}

async function loadData() {
  loading.value = true;
  try {
    const rows = await request.get('/system/dicts');
    dictTypes.value = rows || [];
    if (!currentTypeId.value || !dictTypes.value.some((item) => item.id === currentTypeId.value)) {
      currentTypeId.value = dictTypes.value[0]?.id || null;
    }
  } finally {
    loading.value = false;
  }
}

function handleCurrentTypeChange(row) {
  currentTypeId.value = row?.id || null;
}

function openTypeDialog(row = null) {
  typeDialogMode.value = row ? 'edit' : 'create';
  Object.assign(typeForm, createTypeForm(), row || {});
  typeDialogVisible.value = true;
  typeFormRef.value?.clearValidate?.();
}

function openItemDialog(row = null) {
  itemDialogMode.value = row ? 'edit' : 'create';
  Object.assign(itemForm, createItemForm(), row || {}, {
    dictTypeId: row?.dictTypeId || currentTypeId.value || null,
    itemSort: Number(row?.itemSort ?? 0),
    isDefault: Number(row?.isDefault ?? 0),
    status: Number(row?.status ?? 1)
  });
  itemDialogVisible.value = true;
  itemFormRef.value?.clearValidate?.();
}

async function saveType() {
  const valid = await typeFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  typeSaving.value = true;
  try {
    const payload = {
      dictName: typeForm.dictName,
      dictType: typeForm.dictType,
      status: Number(typeForm.status || 0),
      remark: typeForm.remark
    };
    if (typeDialogMode.value === 'create') {
      await request.post('/system/dicts/types', payload);
      ElMessage.success('字典类型新增成功');
    } else {
      await request.put(`/system/dicts/types/${typeForm.id}`, payload);
      ElMessage.success('字典类型更新成功');
    }
    typeDialogVisible.value = false;
    await loadData();
    if (!currentTypeId.value) {
      currentTypeId.value = dictTypes.value[0]?.id || null;
    }
  } finally {
    typeSaving.value = false;
  }
}

async function saveItem() {
  const valid = await itemFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  itemSaving.value = true;
  try {
    const payload = {
      dictTypeId: itemForm.dictTypeId,
      itemLabel: itemForm.itemLabel,
      itemValue: itemForm.itemValue,
      itemSort: Number(itemForm.itemSort || 0),
      isDefault: Number(itemForm.isDefault || 0),
      status: Number(itemForm.status || 0),
      remark: itemForm.remark
    };
    if (itemDialogMode.value === 'create') {
      await request.post('/system/dicts/items', payload);
      ElMessage.success('字典项新增成功');
    } else {
      await request.put(`/system/dicts/items/${itemForm.id}`, payload);
      ElMessage.success('字典项更新成功');
    }
    currentTypeId.value = itemForm.dictTypeId;
    itemDialogVisible.value = false;
    await loadData();
  } finally {
    itemSaving.value = false;
  }
}

async function removeType(row) {
  try {
    await ElMessageBox.confirm(`确认删除字典类型“${row.dictName}”吗？`, '删除确认', {
      type: 'warning'
    });
  } catch {
    return;
  }

  await request.delete(`/system/dicts/types/${row.id}`);
  ElMessage.success('字典类型删除成功');
  if (currentTypeId.value === row.id) {
    currentTypeId.value = null;
  }
  await loadData();
}

async function removeItem(row) {
  try {
    await ElMessageBox.confirm(`确认删除字典项“${row.itemLabel}”吗？`, '删除确认', {
      type: 'warning'
    });
  } catch {
    return;
  }

  await request.delete(`/system/dicts/items/${row.id}`);
  ElMessage.success('字典项删除成功');
  await loadData();
}
</script>
