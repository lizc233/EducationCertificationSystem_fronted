<template>
  <StandardPage
    title="达成度评价模型配置"
    :breadcrumbs="['首页', '评价与达成', '达成度评价模型配置']"
    description="维护课程目标与毕业要求达成度模型，配置权重项、适用范围和阈值规则，并支持启停和状态切换。"
  >
    <template #actions>
      <el-button type="primary" @click="startCreate">新建模型</el-button>
      <el-button :loading="listLoading" @click="loadPage">刷新列表</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="模型类型">
          <el-select v-model="filters.modelType" clearable placeholder="全部类型" style="width: 180px;">
            <el-option label="课程目标模型" value="COURSE_TARGET" />
            <el-option label="毕业要求模型" value="GRADUATION_REQUIREMENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用范围">
          <el-select v-model="filters.scopeType" clearable placeholder="全部范围" style="width: 180px;">
            <el-option label="课程" value="COURSE" />
            <el-option label="方案版本" value="PROGRAM_VERSION" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable placeholder="全部状态" style="width: 160px;">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="启用" value="ACTIVE" />
            <el-option label="归档" value="ARCHIVED" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model.trim="filters.keyword" clearable placeholder="编码 / 名称" style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="listLoading" @click="loadPage">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <div class="model-shell">
      <SectionCard title="模型清单">
        <div v-loading="listLoading" class="model-list soft-scrollbar">
          <button
            v-for="item in models"
            :key="item.id"
            type="button"
            class="model-list-item"
            :class="{ 'is-active': item.id === activeModelId }"
            @click="selectModel(item.id)"
          >
            <div class="model-list-item__head">
              <div>
                <div class="model-list-item__title">{{ item.modelName }}</div>
                <div class="model-list-item__code">{{ item.modelCode }}</div>
              </div>
              <el-tag :type="item.enabled === 1 ? 'success' : 'info'">
                {{ item.enabled === 1 ? '启用' : '停用' }}
              </el-tag>
            </div>
            <div class="model-list-item__meta">
              <span class="small-tag">{{ item.modelType }}</span>
              <span class="small-tag">{{ item.scopeType }}</span>
              <span class="small-tag">{{ item.status || 'DRAFT' }}</span>
            </div>
            <div class="model-list-item__desc">
              权重项 {{ item.itemCount || 0 }} 个，作用域 {{ item.scopeCount || 0 }} 个，阈值 {{ item.thresholdValue ?? '-' }}
            </div>
          </button>
          <el-empty v-if="!listLoading && !models.length" description="暂无模型数据" />
        </div>

        <div class="model-pagination">
          <el-pagination
            v-model:current-page="pager.pageNum"
            v-model:page-size="pager.pageSize"
            background
            layout="total, prev, pager, next"
            :total="pager.total"
            @current-change="loadPage"
            @size-change="loadPage"
          />
        </div>
      </SectionCard>

      <SectionCard :title="form.id ? '模型维护' : '新建模型'" class="model-editor-card">
        <el-form label-position="top" class="model-form">
          <div class="model-form__grid">
            <el-form-item label="模型编码">
              <el-input v-model.trim="form.modelCode" placeholder="例如 ECM-COURSE-01" />
            </el-form-item>
            <el-form-item label="模型名称">
              <el-input v-model.trim="form.modelName" placeholder="请输入模型名称" />
            </el-form-item>
            <el-form-item label="模型类型">
              <el-select v-model="form.modelType" placeholder="请选择模型类型">
                <el-option label="课程目标模型" value="COURSE_TARGET" />
                <el-option label="毕业要求模型" value="GRADUATION_REQUIREMENT" />
              </el-select>
            </el-form-item>
            <el-form-item label="作用域类型">
              <el-select v-model="form.scopeType" placeholder="请选择作用域类型" @change="form.scopeIds = []">
                <el-option label="课程" value="COURSE" />
                <el-option label="方案版本" value="PROGRAM_VERSION" />
              </el-select>
            </el-form-item>
            <el-form-item label="阈值">
              <el-input-number v-model="form.thresholdValue" :min="0" :precision="2" :step="1" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="模型状态">
              <el-select v-model="form.status" placeholder="请选择状态">
                <el-option label="草稿" value="DRAFT" />
                <el-option label="启用" value="ACTIVE" />
                <el-option label="归档" value="ARCHIVED" />
              </el-select>
            </el-form-item>
            <el-form-item label="是否纳入问卷评价">
              <el-switch v-model="form.includeQuestionnaireFlag" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="是否启用">
              <el-switch v-model="form.enabled" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </div>

          <el-form-item label="公式表达式">
            <el-input
              v-model="form.formulaExpression"
              type="textarea"
              :rows="3"
              placeholder="例如：sum(weightPercent * sourceValue)"
            />
          </el-form-item>

          <el-form-item label="适用范围">
            <el-select
              v-model="form.scopeIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择作用域"
              style="width: 100%;"
            >
              <el-option
                v-for="option in scopeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="补充模型用途和注意事项" />
          </el-form-item>
        </el-form>

        <div class="model-subsection">
          <div class="model-subsection__head">
            <h4>权重项配置</h4>
            <el-button type="primary" link @click="addItem">新增权重项</el-button>
          </div>
          <el-table :data="form.items" border stripe class="model-item-table">
            <el-table-column label="编码" min-width="120">
              <template #default="{ row }">
                <el-input v-model.trim="row.itemCode" />
              </template>
            </el-table-column>
            <el-table-column label="名称" min-width="140">
              <template #default="{ row }">
                <el-input v-model.trim="row.itemName" />
              </template>
            </el-table-column>
            <el-table-column label="类型" min-width="140">
              <template #default="{ row }">
                <el-select v-model="row.itemType">
                  <el-option label="考核方式" value="ASSESSMENT_METHOD" />
                  <el-option label="问卷评价" value="QUESTIONNAIRE" />
                  <el-option label="人工修正" value="MANUAL" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="权重%" width="120">
              <template #default="{ row }">
                <el-input-number v-model="row.weightPercent" :min="0" :max="100" :precision="2" style="width: 100%;" />
              </template>
            </el-table-column>
            <el-table-column label="阈值" width="120">
              <template #default="{ row }">
                <el-input-number v-model="row.thresholdValue" :min="0" :precision="2" style="width: 100%;" />
              </template>
            </el-table-column>
            <el-table-column label="规则" min-width="150">
              <template #default="{ row }">
                <el-input v-model.trim="row.calcRule" />
              </template>
            </el-table-column>
            <el-table-column label="启用" width="90">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" :active-value="1" :inactive-value="0" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="88" fixed="right">
              <template #default="{ $index }">
                <el-button type="danger" link @click="removeItem($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="model-editor-actions">
          <el-button type="primary" :loading="saving" @click="saveModel">保存模型</el-button>
          <el-button
            v-if="form.id"
            :loading="switching"
            @click="toggleEnabled"
          >
            {{ form.enabled === 1 ? '停用模型' : '启用模型' }}
          </el-button>
          <el-button
            v-if="form.id"
            type="warning"
            plain
            :loading="switching"
            @click="archiveModel"
          >
            归档
          </el-button>
          <el-button
            v-if="form.id"
            type="danger"
            plain
            :loading="deleting"
            @click="removeModel"
          >
            删除
          </el-button>
        </div>
      </SectionCard>

      <SectionCard title="配置预览">
        <div class="model-preview">
          <article class="model-preview-card">
            <div class="model-preview-card__label">启用权重总和</div>
            <div class="model-preview-card__value">{{ enabledWeightTotal }}%</div>
            <div class="model-preview-card__desc">
              后端要求启用权重项之和必须等于 100。
            </div>
          </article>
          <article class="model-preview-card">
            <div class="model-preview-card__label">作用域数量</div>
            <div class="model-preview-card__value">{{ form.scopeIds.length }}</div>
            <div class="model-preview-card__desc">
              当前模型将应用到这些课程或方案版本。
            </div>
          </article>
          <article class="model-preview-card">
            <div class="model-preview-card__label">状态快照</div>
            <div class="model-preview-card__value">{{ form.status || 'DRAFT' }}</div>
            <div class="model-preview-card__desc">
              {{ form.enabled === 1 ? '模型已启用，可参与计算。' : '模型已停用，不会参与新计算。' }}
            </div>
          </article>
        </div>

        <div class="paper-note" style="margin-top: 18px;">
          <div>公式：{{ form.formulaExpression || '未设置公式表达式' }}</div>
          <div style="margin-top: 8px;">范围：{{ scopeSummary || '未选择作用域' }}</div>
          <div style="margin-top: 8px;">说明：{{ form.remark || '暂无说明' }}</div>
        </div>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import {
  createEvalModel,
  deleteEvalModel,
  disableEvalModel,
  enableEvalModel,
  fetchEvalModelDetail,
  fetchEvalModels,
  updateEvalModel,
  updateEvalModelStatus
} from '../../api/eval';
import { fetchCourses, fetchProgramVersions } from '../../api/lookups';

const listLoading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const switching = ref(false);
const models = ref([]);
const activeModelId = ref(null);
const courseOptions = ref([]);
const programVersionOptions = ref([]);

const filters = reactive({
  modelType: '',
  scopeType: '',
  status: '',
  keyword: ''
});

const pager = reactive({
  pageNum: 1,
  pageSize: 8,
  total: 0
});

function createItem(sortNo = 1) {
  return {
    itemCode: '',
    itemName: '',
    itemType: 'ASSESSMENT_METHOD',
    weightPercent: 0,
    thresholdValue: 0,
    calcRule: '',
    sortNo,
    enabled: 1,
    remark: ''
  };
}

function createForm() {
  return {
    id: null,
    modelCode: '',
    modelName: '',
    modelType: 'COURSE_TARGET',
    scopeType: 'COURSE',
    formulaExpression: '',
    thresholdValue: 0,
    includeQuestionnaireFlag: 0,
    enabled: 1,
    status: 'DRAFT',
    remark: '',
    items: [createItem(1)],
    scopeIds: []
  };
}

const form = reactive(createForm());

const scopeOptions = computed(() =>
  form.scopeType === 'PROGRAM_VERSION' ? programVersionOptions.value : courseOptions.value
);

const enabledWeightTotal = computed(() =>
  form.items
    .filter((item) => item.enabled !== 0)
    .reduce((sum, item) => sum + Number(item.weightPercent || 0), 0)
    .toFixed(2)
);

const scopeSummary = computed(() => {
  if (!form.scopeIds.length) return '';
  const optionMap = new Map(scopeOptions.value.map((item) => [item.value, item.label]));
  return form.scopeIds.map((id) => optionMap.get(id) || id).join('、');
});

function resetForm() {
  Object.assign(form, createForm());
  activeModelId.value = null;
}

function fillForm(detail) {
  form.id = detail.id;
  form.modelCode = detail.modelCode || '';
  form.modelName = detail.modelName || '';
  form.modelType = detail.modelType || 'COURSE_TARGET';
  form.scopeType = detail.scopeType || 'COURSE';
  form.formulaExpression = detail.formulaExpression || '';
  form.thresholdValue = detail.thresholdValue ?? 0;
  form.includeQuestionnaireFlag = detail.includeQuestionnaireFlag ?? 0;
  form.enabled = detail.enabled ?? 1;
  form.status = detail.status || 'DRAFT';
  form.remark = detail.remark || '';
  form.items = (detail.items || []).map((item, index) => ({
    itemCode: item.itemCode || '',
    itemName: item.itemName || '',
    itemType: item.itemType || 'ASSESSMENT_METHOD',
    weightPercent: Number(item.weightPercent || 0),
    thresholdValue: Number(item.thresholdValue || 0),
    calcRule: item.calcRule || '',
    sortNo: item.sortNo ?? index + 1,
    enabled: item.enabled ?? 1,
    remark: item.remark || ''
  }));
  form.scopeIds = (detail.scopes || []).map((scope) => scope.scopeId);
}

async function loadLookups() {
  const [courses, programVersions] = await Promise.all([fetchCourses(), fetchProgramVersions()]);
  courseOptions.value = (courses || []).map((item) => ({ value: item.value, label: item.label }));
  programVersionOptions.value = (programVersions || []).map((item) => ({ value: item.value, label: item.label }));
}

async function loadPage() {
  listLoading.value = true;
  try {
    const page = await fetchEvalModels({
      pageNum: pager.pageNum,
      pageSize: pager.pageSize,
      modelType: filters.modelType,
      scopeType: filters.scopeType,
      status: filters.status,
      keyword: filters.keyword
    });
    models.value = page.records || [];
    pager.total = Number(page.total || 0);

    if (!activeModelId.value && models.value.length) {
      await selectModel(models.value[0].id);
    }
  } finally {
    listLoading.value = false;
  }
}

async function selectModel(id) {
  if (!id) return;
  activeModelId.value = id;
  const detail = await fetchEvalModelDetail(id);
  fillForm(detail);
}

function startCreate() {
  resetForm();
}

function addItem() {
  form.items.push(createItem(form.items.length + 1));
}

function removeItem(index) {
  form.items.splice(index, 1);
  if (!form.items.length) {
    form.items.push(createItem(1));
  }
}

function resetFilters() {
  filters.modelType = '';
  filters.scopeType = '';
  filters.status = '';
  filters.keyword = '';
  pager.pageNum = 1;
  loadPage();
}

function buildPayload() {
  return {
    modelCode: form.modelCode,
    modelName: form.modelName,
    modelType: form.modelType,
    scopeType: form.scopeType,
    formulaExpression: form.formulaExpression,
    thresholdValue: form.thresholdValue,
    includeQuestionnaireFlag: form.includeQuestionnaireFlag,
    enabled: form.enabled,
    status: form.status,
    remark: form.remark,
    items: form.items.map((item, index) => ({
      itemCode: item.itemCode,
      itemName: item.itemName,
      itemType: item.itemType,
      weightPercent: item.weightPercent,
      thresholdValue: item.thresholdValue,
      calcRule: item.calcRule,
      sortNo: index + 1,
      enabled: item.enabled,
      remark: item.remark
    })),
    scopes: form.scopeIds.map((scopeId) => ({
      scopeType: form.scopeType,
      scopeId,
      remark: ''
    }))
  };
}

async function saveModel() {
  saving.value = true;
  try {
    const payload = buildPayload();
    const detail = form.id
      ? await updateEvalModel(form.id, payload)
      : await createEvalModel(payload);
    fillForm(detail);
    activeModelId.value = detail.id;
    await loadPage();
    ElMessage.success(form.id ? '模型已更新' : '模型已创建');
  } finally {
    saving.value = false;
  }
}

async function toggleEnabled() {
  if (!form.id) return;
  switching.value = true;
  try {
    if (form.enabled === 1) {
      await disableEvalModel(form.id);
      form.enabled = 0;
      ElMessage.success('模型已停用');
    } else {
      await enableEvalModel(form.id);
      form.enabled = 1;
      ElMessage.success('模型已启用');
    }
    await loadPage();
  } finally {
    switching.value = false;
  }
}

async function archiveModel() {
  if (!form.id) return;
  switching.value = true;
  try {
    await updateEvalModelStatus(form.id, 'ARCHIVED');
    form.status = 'ARCHIVED';
    await loadPage();
    ElMessage.success('模型已归档');
  } finally {
    switching.value = false;
  }
}

async function removeModel() {
  if (!form.id) return;
  await ElMessageBox.confirm('删除后将移除当前模型及其权重项配置，是否继续？', '删除确认', {
    type: 'warning'
  });
  deleting.value = true;
  try {
    await deleteEvalModel(form.id);
    resetForm();
    await loadPage();
    ElMessage.success('模型已删除');
  } finally {
    deleting.value = false;
  }
}

watch(
  () => form.scopeType,
  async () => {
    if (!scopeOptions.value.length) {
      await loadLookups();
    }
  }
);

onMounted(async () => {
  await Promise.all([loadLookups(), loadPage()]);
});
</script>

<style scoped>
.model-shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1.2fr) 320px;
  gap: 20px;
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 760px;
  overflow: auto;
}

.model-list-item {
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #fcfaf7 100%);
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.model-list-item:hover,
.model-list-item.is-active {
  transform: translateY(-2px);
  border-color: rgba(27, 76, 87, 0.28);
  box-shadow: 0 12px 24px rgba(27, 76, 87, 0.08);
}

.model-list-item__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.model-list-item__title {
  font-weight: 600;
  color: var(--text-primary);
}

.model-list-item__code {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-light);
}

.model-list-item__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.model-list-item__desc {
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.model-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.model-editor-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.model-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.model-subsection {
  margin-top: 6px;
}

.model-subsection__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.model-subsection__head h4 {
  margin: 0;
  font-size: 16px;
  color: #1b4c57;
}

.model-editor-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.model-preview {
  display: grid;
  gap: 12px;
}

.model-preview-card {
  padding: 18px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
}

.model-preview-card__label {
  font-size: 12px;
  color: var(--text-light);
}

.model-preview-card__value {
  margin-top: 12px;
  font-family: var(--font-serif);
  font-size: 28px;
  color: #1b4c57;
}

.model-preview-card__desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary);
}

@media (max-width: 1320px) {
  .model-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .model-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>
