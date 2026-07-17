<template>
  <StandardPage
    title="课程目标对照"
    :breadcrumbs="['首页', '课程建设', '课程目标对照']"
    description="选择课程后，维护课程目标，并把课程目标映射到方案指标点。"
  >
    <template #actions>
      <el-select v-model="selectedCourseId" filterable placeholder="先选择课程" style="width: 320px;" @change="loadAll">
        <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button @click="loadAll">刷新</el-button>
    </template>

    <SectionCard title="目标与映射">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="课程目标" name="objectives">
          <div class="tab-actions">
            <el-button type="primary" :disabled="!selectedCourseId" @click="openObjectiveDialog()">新增课程目标</el-button>
          </div>
          <el-table v-loading="loading.objectives" :data="objectives" border stripe>
            <el-table-column prop="objectiveCode" label="编号" width="120" />
            <el-table-column prop="objectiveName" label="名称" min-width="180" />
            <el-table-column prop="objectiveDesc" label="说明" min-width="220" show-overflow-tooltip />
            <el-table-column prop="achievementStandard" label="达成标准" min-width="220" show-overflow-tooltip />
            <el-table-column prop="sortNo" label="排序" width="90" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.enabled === 1 ? 'success' : 'info'">{{ row.enabled === 1 ? '启用' : '停用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openObjectiveDialog(row)">编辑</el-button>
                <el-button type="danger" link @click="removeObjective(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="指标点映射" name="supports">
          <div class="tab-actions">
            <el-select v-model="objectiveFilterId" clearable placeholder="按课程目标筛选" style="width: 240px;">
              <el-option v-for="item in objectiveOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button type="primary" :disabled="!selectedCourseId" @click="openSupportDialog()">新增映射</el-button>
          </div>
          <el-table v-loading="loading.supports" :data="filteredSupports" border stripe>
            <el-table-column label="课程目标" min-width="220">
              <template #default="{ row }">
                {{ resolveOptionLabel(objectiveOptions, row.courseObjectiveId) }}
              </template>
            </el-table-column>
            <el-table-column label="指标点" min-width="220">
              <template #default="{ row }">
                {{ resolveOptionLabel(indicatorOptions, row.indicatorPointId) }}
              </template>
            </el-table-column>
            <el-table-column prop="supportWeight" label="权重" width="120" />
            <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openSupportDialog(row)">编辑</el-button>
                <el-button type="danger" link @click="removeSupport(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </SectionCard>

    <el-dialog v-model="objectiveDialog.visible" :title="objectiveDialog.form.id ? '编辑课程目标' : '新增课程目标'" width="680px">
      <el-form ref="objectiveFormRef" :model="objectiveDialog.form" :rules="objectiveRules" label-position="top">
        <el-form-item label="目标编号" prop="objectiveCode"><el-input v-model.trim="objectiveDialog.form.objectiveCode" /></el-form-item>
        <el-form-item label="目标名称" prop="objectiveName"><el-input v-model.trim="objectiveDialog.form.objectiveName" /></el-form-item>
        <el-form-item label="目标说明"><el-input v-model="objectiveDialog.form.objectiveDesc" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="达成标准"><el-input v-model="objectiveDialog.form.achievementStandard" type="textarea" :rows="2" /></el-form-item>
        <div class="form-grid">
          <el-form-item label="排序"><el-input-number v-model="objectiveDialog.form.sortNo" :min="0" style="width: 100%;" /></el-form-item>
          <el-form-item label="状态"><el-switch v-model="objectiveDialog.form.enabled" :active-value="1" :inactive-value="0" /></el-form-item>
        </div>
        <el-form-item label="备注"><el-input v-model="objectiveDialog.form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="objectiveDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="savingObjective" @click="submitObjective">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="supportDialog.visible" :title="supportDialog.form.id ? '编辑指标点映射' : '新增指标点映射'" width="640px">
      <el-form ref="supportFormRef" :model="supportDialog.form" :rules="supportRules" label-position="top">
        <el-form-item label="课程目标" prop="courseObjectiveId">
          <el-select v-model="supportDialog.form.courseObjectiveId" filterable style="width: 100%;">
            <el-option v-for="item in objectiveOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="指标点" prop="indicatorPointId">
          <el-select v-model="supportDialog.form.indicatorPointId" filterable style="width: 100%;">
            <el-option v-for="item in indicatorOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="支撑权重">
          <el-input-number v-model="supportDialog.form.supportWeight" :min="0" :max="100" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="supportDialog.form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="supportDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="savingSupport" @click="submitSupport">保存</el-button>
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

const activeTab = ref('objectives');
const selectedCourseId = ref(null);
const objectiveFilterId = ref(null);

const courseOptions = ref([]);
const indicatorOptions = ref([]);
const objectives = ref([]);
const supports = ref([]);

const objectiveOptions = computed(() =>
  objectives.value.map((item) => ({
    value: item.id,
    label: `${item.objectiveCode} ${item.objectiveName}`
  }))
);

const filteredSupports = computed(() => {
  if (!objectiveFilterId.value) {
    return supports.value;
  }
  return supports.value.filter((item) => item.courseObjectiveId === objectiveFilterId.value);
});

const loading = reactive({
  objectives: false,
  supports: false
});

const objectiveDialog = reactive({
  visible: false,
  form: {}
});
const supportDialog = reactive({
  visible: false,
  form: {}
});

const savingObjective = ref(false);
const savingSupport = ref(false);
const objectiveFormRef = ref();
const supportFormRef = ref();

const objectiveRules = {
  objectiveCode: [{ required: true, message: '请输入目标编号', trigger: 'blur' }],
  objectiveName: [{ required: true, message: '请输入目标名称', trigger: 'blur' }]
};

const supportRules = {
  courseObjectiveId: [{ required: true, message: '请选择课程目标', trigger: 'change' }],
  indicatorPointId: [{ required: true, message: '请选择指标点', trigger: 'change' }]
};

function createObjectiveForm(row = {}) {
  return {
    id: row.id || null,
    objectiveCode: row.objectiveCode || '',
    objectiveName: row.objectiveName || '',
    objectiveDesc: row.objectiveDesc || '',
    achievementStandard: row.achievementStandard || '',
    sortNo: row.sortNo ?? 0,
    enabled: row.enabled ?? 1,
    remark: row.remark || ''
  };
}

function createSupportForm(row = {}) {
  return {
    id: row.id || null,
    courseObjectiveId: row.courseObjectiveId || objectiveOptions.value[0]?.value || null,
    indicatorPointId: row.indicatorPointId || null,
    supportWeight: Number(row.supportWeight || 0),
    remark: row.remark || ''
  };
}

async function loadLookups() {
  const [courses, indicators] = await Promise.all([lookupApi.courses(), lookupApi.indicators()]);
  courseOptions.value = courses;
  indicatorOptions.value = indicators;
  if (!selectedCourseId.value && courseOptions.value.length) {
    selectedCourseId.value = courseOptions.value[0].value;
  }
}

async function loadObjectives() {
  if (!selectedCourseId.value) {
    objectives.value = [];
    return;
  }
  loading.objectives = true;
  try {
    objectives.value = await courseApi.listObjectives(selectedCourseId.value);
    if (!objectiveFilterId.value || !objectives.value.some((item) => item.id === objectiveFilterId.value)) {
      objectiveFilterId.value = objectives.value[0]?.id || null;
    }
  } finally {
    loading.objectives = false;
  }
}

async function loadSupports() {
  if (!selectedCourseId.value) {
    supports.value = [];
    return;
  }
  loading.supports = true;
  try {
    supports.value = await courseApi.listObjectiveSupports({ courseId: selectedCourseId.value });
  } finally {
    loading.supports = false;
  }
}

async function loadAll() {
  await Promise.all([loadObjectives(), loadSupports()]);
}

function openObjectiveDialog(row) {
  objectiveDialog.form = createObjectiveForm(row);
  objectiveDialog.visible = true;
}

async function submitObjective() {
  const valid = await objectiveFormRef.value?.validate().catch(() => false);
  if (!valid || !selectedCourseId.value) {
    return;
  }
  savingObjective.value = true;
  try {
    const { id, ...payload } = objectiveDialog.form;
    id ? await courseApi.updateObjective(id, payload) : await courseApi.createObjective(selectedCourseId.value, payload);
    objectiveDialog.visible = false;
    ElMessage.success('课程目标已保存');
    await loadAll();
  } finally {
    savingObjective.value = false;
  }
}

function openSupportDialog(row) {
  supportDialog.form = createSupportForm(row);
  supportDialog.visible = true;
}

async function submitSupport() {
  const valid = await supportFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  savingSupport.value = true;
  try {
    const { id, ...payload } = supportDialog.form;
    id ? await courseApi.updateObjectiveSupport(id, payload) : await courseApi.createObjectiveSupport(payload);
    supportDialog.visible = false;
    ElMessage.success('指标点映射已保存');
    await loadSupports();
  } finally {
    savingSupport.value = false;
  }
}

async function removeObjective(row) {
  try {
    await ElMessageBox.confirm(`确认删除课程目标“${row.objectiveName}”吗？`, '删除确认', { type: 'warning' });
    await courseApi.deleteObjective(row.id);
    ElMessage.success('课程目标已删除');
    await loadAll();
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

async function removeSupport(row) {
  try {
    await ElMessageBox.confirm('确认删除这条指标点映射吗？', '删除确认', { type: 'warning' });
    await courseApi.deleteObjectiveSupport(row.id);
    ElMessage.success('映射已删除');
    await loadSupports();
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

@media (max-width: 760px) {
  .tab-actions,
  .form-grid {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>
