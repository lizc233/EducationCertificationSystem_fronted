<template>
  <StandardPage
    title="教学与考核设置"
    :breadcrumbs="['首页', '课程建设', '教学与考核设置']"
    description="选择课程后，集中维护教学内容、内容对应目标、考核方式和评分标准。"
  >
    <template #actions>
      <el-select v-model="selectedCourseId" filterable placeholder="先选择课程" style="width: 320px;" @change="loadAll">
        <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button @click="loadAll">刷新</el-button>
    </template>

    <SectionCard title="教学配置">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="教学内容" name="contents">
          <div class="tab-actions">
            <el-button type="primary" :disabled="!selectedCourseId" @click="openContentDialog()">新增内容</el-button>
          </div>
          <el-table v-loading="loading.contents" :data="contents" border stripe>
            <el-table-column prop="contentCode" label="编号" width="120" />
            <el-table-column prop="contentTitle" label="内容标题" min-width="180" />
            <el-table-column prop="contentDesc" label="内容说明" min-width="220" show-overflow-tooltip />
            <el-table-column prop="hours" label="学时" width="90" />
            <el-table-column prop="sortNo" label="排序" width="90" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.enabled === 1 ? 'success' : 'info'">{{ row.enabled === 1 ? '启用' : '停用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openContentDialog(row)">编辑</el-button>
                <el-button type="danger" link @click="removeContent(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="内容对应目标" name="relations">
          <div class="tab-actions">
            <el-select v-model="contentFilterId" clearable placeholder="按教学内容筛选" style="width: 240px;">
              <el-option v-for="item in contentOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button type="primary" :disabled="!selectedCourseId" @click="openRelationDialog()">新增对应关系</el-button>
          </div>
          <el-table v-loading="loading.relations" :data="filteredRelations" border stripe>
            <el-table-column label="教学内容" min-width="220">
              <template #default="{ row }">
                {{ resolveOptionLabel(contentOptions, row.contentId) }}
              </template>
            </el-table-column>
            <el-table-column label="课程目标" min-width="220">
              <template #default="{ row }">
                {{ resolveOptionLabel(objectiveOptions, row.objectiveId) }}
              </template>
            </el-table-column>
            <el-table-column prop="supportStrength" label="支撑强度" width="120" />
            <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openRelationDialog(row)">编辑</el-button>
                <el-button type="danger" link @click="removeRelation(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="考核方式" name="methods">
          <div class="tab-actions">
            <el-button type="primary" :disabled="!selectedCourseId" @click="openMethodDialog()">新增考核方式</el-button>
          </div>
          <el-table v-loading="loading.methods" :data="methods" border stripe>
            <el-table-column prop="methodCode" label="编号" width="120" />
            <el-table-column prop="methodName" label="方式名称" min-width="180" />
            <el-table-column prop="ratioPercent" label="权重(%)" width="120" />
            <el-table-column prop="dueRule" label="说明 / 规则" min-width="220" show-overflow-tooltip />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.enabled === 1 ? 'success' : 'info'">{{ row.enabled === 1 ? '启用' : '停用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openMethodDialog(row)">编辑</el-button>
                <el-button type="danger" link @click="removeMethod(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="评分标准" name="standards">
          <div class="tab-actions">
            <el-select v-model="methodFilterId" clearable placeholder="按考核方式筛选" style="width: 240px;">
              <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button type="primary" :disabled="!selectedCourseId || methodOptions.length === 0" @click="openStandardDialog()">新增标准</el-button>
          </div>
          <el-table v-loading="loading.standards" :data="filteredStandards" border stripe>
            <el-table-column label="考核方式" min-width="220">
              <template #default="{ row }">
                {{ resolveOptionLabel(methodOptions, row.methodId) }}
              </template>
            </el-table-column>
            <el-table-column prop="standardName" label="标准名称" min-width="180" />
            <el-table-column prop="standardDesc" label="标准说明" min-width="220" show-overflow-tooltip />
            <el-table-column prop="scoreMin" label="最低分" width="100" />
            <el-table-column prop="scoreMax" label="最高分" width="100" />
            <el-table-column prop="sortNo" label="排序" width="90" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openStandardDialog(row)">编辑</el-button>
                <el-button type="danger" link @click="removeStandard(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </SectionCard>

    <el-dialog v-model="contentDialog.visible" :title="contentDialog.form.id ? '编辑教学内容' : '新增教学内容'" width="680px">
      <el-form ref="contentFormRef" :model="contentDialog.form" :rules="contentRules" label-position="top">
        <el-form-item label="内容编号" prop="contentCode"><el-input v-model.trim="contentDialog.form.contentCode" /></el-form-item>
        <el-form-item label="内容标题" prop="contentTitle"><el-input v-model.trim="contentDialog.form.contentTitle" /></el-form-item>
        <el-form-item label="内容说明"><el-input v-model="contentDialog.form.contentDesc" type="textarea" :rows="3" /></el-form-item>
        <div class="form-grid">
          <el-form-item label="学时"><el-input-number v-model="contentDialog.form.hours" :min="0" style="width: 100%;" /></el-form-item>
          <el-form-item label="排序"><el-input-number v-model="contentDialog.form.sortNo" :min="0" style="width: 100%;" /></el-form-item>
        </div>
        <el-form-item label="状态"><el-switch v-model="contentDialog.form.enabled" :active-value="1" :inactive-value="0" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="contentDialog.form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="contentDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving.content" @click="submitContent">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="relationDialog.visible" :title="relationDialog.form.id ? '编辑内容关系' : '新增内容关系'" width="640px">
      <el-form ref="relationFormRef" :model="relationDialog.form" :rules="relationRules" label-position="top">
        <el-form-item label="教学内容" prop="contentId">
          <el-select v-model="relationDialog.form.contentId" filterable style="width: 100%;">
            <el-option v-for="item in contentOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程目标" prop="objectiveId">
          <el-select v-model="relationDialog.form.objectiveId" filterable style="width: 100%;">
            <el-option v-for="item in objectiveOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="支撑强度">
          <el-select v-model="relationDialog.form.supportStrength" style="width: 100%;">
            <el-option label="高" value="H" />
            <el-option label="中" value="M" />
            <el-option label="低" value="L" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="relationDialog.form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="relationDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving.relation" @click="submitRelation">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="methodDialog.visible" :title="methodDialog.form.id ? '编辑考核方式' : '新增考核方式'" width="680px">
      <el-form ref="methodFormRef" :model="methodDialog.form" :rules="methodRules" label-position="top">
        <div class="form-grid">
          <el-form-item label="方式编号" prop="methodCode"><el-input v-model.trim="methodDialog.form.methodCode" /></el-form-item>
          <el-form-item label="方式名称" prop="methodName"><el-input v-model.trim="methodDialog.form.methodName" /></el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="权重(%)" prop="ratioPercent"><el-input-number v-model="methodDialog.form.ratioPercent" :min="0" :max="100" :precision="2" style="width: 100%;" /></el-form-item>
          <el-form-item label="状态"><el-switch v-model="methodDialog.form.enabled" :active-value="1" :inactive-value="0" /></el-form-item>
        </div>
        <el-form-item label="规则 / 说明"><el-input v-model="methodDialog.form.dueRule" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="methodDialog.form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="methodDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving.method" @click="submitMethod">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="standardDialog.visible" :title="standardDialog.form.id ? '编辑评分标准' : '新增评分标准'" width="680px">
      <el-form ref="standardFormRef" :model="standardDialog.form" :rules="standardRules" label-position="top">
        <el-form-item label="考核方式" prop="methodId">
          <el-select v-model="standardDialog.form.methodId" filterable style="width: 100%;">
            <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="标准名称"><el-input v-model.trim="standardDialog.form.standardName" /></el-form-item>
        <el-form-item label="标准说明"><el-input v-model="standardDialog.form.standardDesc" type="textarea" :rows="3" /></el-form-item>
        <div class="form-grid form-grid--three">
          <el-form-item label="最低分"><el-input-number v-model="standardDialog.form.scoreMin" :min="0" :max="100" :precision="2" style="width: 100%;" /></el-form-item>
          <el-form-item label="最高分"><el-input-number v-model="standardDialog.form.scoreMax" :min="0" :max="100" :precision="2" style="width: 100%;" /></el-form-item>
          <el-form-item label="排序"><el-input-number v-model="standardDialog.form.sortNo" :min="0" style="width: 100%;" /></el-form-item>
        </div>
        <el-form-item label="备注"><el-input v-model="standardDialog.form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="standardDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving.standard" @click="submitStandard">保存</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { courseApi, lookupApi, resolveOptionLabel } from '../../api/bc';

const activeTab = ref('contents');
const selectedCourseId = ref(null);
const contentFilterId = ref(null);
const methodFilterId = ref(null);

const courseOptions = ref([]);
const contents = ref([]);
const objectives = ref([]);
const relations = ref([]);
const methods = ref([]);
const standards = ref([]);

const contentOptions = computed(() =>
  contents.value.map((item) => ({
    value: item.id,
    label: `${item.contentCode} ${item.contentTitle}`
  }))
);
const objectiveOptions = computed(() =>
  objectives.value.map((item) => ({
    value: item.id,
    label: `${item.objectiveCode} ${item.objectiveName}`
  }))
);
const methodOptions = computed(() =>
  methods.value.map((item) => ({
    value: item.id,
    label: `${item.methodCode} ${item.methodName}`
  }))
);

const filteredRelations = computed(() => {
  if (!contentFilterId.value) {
    return relations.value;
  }
  return relations.value.filter((item) => item.contentId === contentFilterId.value);
});
const filteredStandards = computed(() => {
  if (!methodFilterId.value) {
    return standards.value;
  }
  return standards.value.filter((item) => item.methodId === methodFilterId.value);
});

const loading = reactive({
  contents: false,
  relations: false,
  methods: false,
  standards: false
});

const saving = reactive({
  content: false,
  relation: false,
  method: false,
  standard: false
});

const contentDialog = reactive({ visible: false, form: {} });
const relationDialog = reactive({ visible: false, form: {} });
const methodDialog = reactive({ visible: false, form: {} });
const standardDialog = reactive({ visible: false, form: {} });

const contentFormRef = ref();
const relationFormRef = ref();
const methodFormRef = ref();
const standardFormRef = ref();

const contentRules = {
  contentCode: [{ required: true, message: '请输入内容编号', trigger: 'blur' }],
  contentTitle: [{ required: true, message: '请输入内容标题', trigger: 'blur' }]
};
const relationRules = {
  contentId: [{ required: true, message: '请选择教学内容', trigger: 'change' }],
  objectiveId: [{ required: true, message: '请选择课程目标', trigger: 'change' }]
};
const methodRules = {
  methodCode: [{ required: true, message: '请输入方式编号', trigger: 'blur' }],
  methodName: [{ required: true, message: '请输入方式名称', trigger: 'blur' }],
  ratioPercent: [{ required: true, message: '请输入权重', trigger: 'change' }]
};
const standardRules = {
  methodId: [{ required: true, message: '请选择考核方式', trigger: 'change' }]
};

function createContentForm(row = {}) {
  return {
    id: row.id || null,
    contentCode: row.contentCode || '',
    contentTitle: row.contentTitle || '',
    contentDesc: row.contentDesc || '',
    hours: row.hours ?? 0,
    sortNo: row.sortNo ?? 0,
    enabled: row.enabled ?? 1,
    remark: row.remark || ''
  };
}

function createRelationForm(row = {}) {
  return {
    id: row.id || null,
    contentId: row.contentId || contentOptions.value[0]?.value || null,
    objectiveId: row.objectiveId || objectiveOptions.value[0]?.value || null,
    supportStrength: row.supportStrength || 'M',
    remark: row.remark || ''
  };
}

function createMethodForm(row = {}) {
  return {
    id: row.id || null,
    methodCode: row.methodCode || '',
    methodName: row.methodName || '',
    ratioPercent: Number(row.ratioPercent || 0),
    dueRule: row.dueRule || '',
    enabled: row.enabled ?? 1,
    remark: row.remark || ''
  };
}

function createStandardForm(row = {}) {
  return {
    id: row.id || null,
    methodId: row.methodId || methodOptions.value[0]?.value || null,
    standardName: row.standardName || '',
    standardDesc: row.standardDesc || '',
    scoreMin: Number(row.scoreMin || 0),
    scoreMax: Number(row.scoreMax || 100),
    sortNo: row.sortNo ?? 0,
    remark: row.remark || ''
  };
}

async function loadLookups() {
  courseOptions.value = await lookupApi.courses();
  if (!selectedCourseId.value && courseOptions.value.length) {
    selectedCourseId.value = courseOptions.value[0].value;
  }
}

async function loadContents() {
  if (!selectedCourseId.value) {
    contents.value = [];
    return;
  }
  loading.contents = true;
  try {
    contents.value = await courseApi.listContents(selectedCourseId.value);
    if (!contentFilterId.value || !contents.value.some((item) => item.id === contentFilterId.value)) {
      contentFilterId.value = contents.value[0]?.id || null;
    }
  } finally {
    loading.contents = false;
  }
}

async function loadObjectives() {
  if (!selectedCourseId.value) {
    objectives.value = [];
    return;
  }
  objectives.value = await courseApi.listObjectives(selectedCourseId.value);
}

async function loadRelations() {
  if (!selectedCourseId.value) {
    relations.value = [];
    return;
  }
  loading.relations = true;
  try {
    relations.value = await courseApi.listContentRelations({ courseId: selectedCourseId.value });
  } finally {
    loading.relations = false;
  }
}

async function loadMethods() {
  if (!selectedCourseId.value) {
    methods.value = [];
    standards.value = [];
    return;
  }
  loading.methods = true;
  loading.standards = true;
  try {
    methods.value = await courseApi.listAssessmentMethods(selectedCourseId.value);
    if (!methodFilterId.value || !methods.value.some((item) => item.id === methodFilterId.value)) {
      methodFilterId.value = methods.value[0]?.id || null;
    }
    const standardGroups = await Promise.all(
      methods.value.map((item) => courseApi.listAssessmentStandards({ methodId: item.id }))
    );
    standards.value = standardGroups.flatMap((items) => items || []);
  } finally {
    loading.methods = false;
    loading.standards = false;
  }
}

async function loadAll() {
  await Promise.all([loadContents(), loadObjectives(), loadRelations(), loadMethods()]);
}

function openContentDialog(row) {
  contentDialog.form = createContentForm(row);
  contentDialog.visible = true;
}

async function submitContent() {
  const valid = await contentFormRef.value?.validate().catch(() => false);
  if (!valid || !selectedCourseId.value) {
    return;
  }
  saving.content = true;
  try {
    const { id, ...payload } = contentDialog.form;
    id ? await courseApi.updateContent(id, payload) : await courseApi.createContent(selectedCourseId.value, payload);
    contentDialog.visible = false;
    ElMessage.success('教学内容已保存');
    await loadAll();
  } finally {
    saving.content = false;
  }
}

function openRelationDialog(row) {
  relationDialog.form = createRelationForm(row);
  relationDialog.visible = true;
}

async function submitRelation() {
  const valid = await relationFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  saving.relation = true;
  try {
    const { id, ...payload } = relationDialog.form;
    id ? await courseApi.updateContentRelation(id, payload) : await courseApi.createContentRelation(payload);
    relationDialog.visible = false;
    ElMessage.success('内容对应关系已保存');
    await loadRelations();
  } finally {
    saving.relation = false;
  }
}

function openMethodDialog(row) {
  methodDialog.form = createMethodForm(row);
  methodDialog.visible = true;
}

async function submitMethod() {
  const valid = await methodFormRef.value?.validate().catch(() => false);
  if (!valid || !selectedCourseId.value) {
    return;
  }
  saving.method = true;
  try {
    const { id, ...payload } = methodDialog.form;
    id ? await courseApi.updateAssessmentMethod(id, payload) : await courseApi.createAssessmentMethod(selectedCourseId.value, payload);
    methodDialog.visible = false;
    ElMessage.success('考核方式已保存');
    await loadMethods();
  } finally {
    saving.method = false;
  }
}

function openStandardDialog(row) {
  standardDialog.form = createStandardForm(row);
  standardDialog.visible = true;
}

async function submitStandard() {
  const valid = await standardFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  saving.standard = true;
  try {
    const { id, ...payload } = standardDialog.form;
    id ? await courseApi.updateAssessmentStandard(id, payload) : await courseApi.createAssessmentStandard(payload);
    standardDialog.visible = false;
    ElMessage.success('评分标准已保存');
    await loadMethods();
  } finally {
    saving.standard = false;
  }
}

async function removeContent(row) {
  try {
    await ElMessageBox.confirm('确认删除这条教学内容吗？', '删除确认', { type: 'warning' });
    await courseApi.deleteContent(row.id);
    ElMessage.success('教学内容已删除');
    await loadAll();
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

async function removeRelation(row) {
  try {
    await ElMessageBox.confirm('确认删除这条内容对应关系吗？', '删除确认', { type: 'warning' });
    await courseApi.deleteContentRelation(row.id);
    ElMessage.success('内容对应关系已删除');
    await loadRelations();
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

async function removeMethod(row) {
  try {
    await ElMessageBox.confirm('确认删除这条考核方式吗？', '删除确认', { type: 'warning' });
    await courseApi.deleteAssessmentMethod(row.id);
    ElMessage.success('考核方式已删除');
    await loadMethods();
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

async function removeStandard(row) {
  try {
    await ElMessageBox.confirm('确认删除这条评分标准吗？', '删除确认', { type: 'warning' });
    await courseApi.deleteAssessmentStandard(row.id);
    ElMessage.success('评分标准已删除');
    await loadMethods();
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

onMounted(async () => {
  await loadLookups();
  await loadAll();
});
</script>

<style scoped>
.tab-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.form-grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 760px) {
  .tab-actions,
  .form-grid,
  .form-grid--three {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>
