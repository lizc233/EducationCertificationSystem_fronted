<template>
  <StandardPage
    title="方案课程安排"
    :breadcrumbs="['首页', '方案设计', '方案课程安排']"
    description="在方案版本下维护课程清单，并配置课程对毕业要求的支撑关系。"
  >
    <template #actions>
      <el-select v-model="selectedVersionId" filterable placeholder="先选择方案版本" style="width: 320px;" @change="loadAll">
        <el-option v-for="item in versionOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button @click="loadAll">刷新</el-button>
    </template>

    <SectionCard title="版本内课程">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="课程清单" name="courses">
          <div class="tab-actions">
            <el-button type="primary" :disabled="!selectedVersionId" @click="openProgramCourseDialog()">添加课程</el-button>
          </div>
          <el-table v-loading="loading.courses" :data="programCourses" border stripe>
            <el-table-column label="课程" min-width="220">
              <template #default="{ row }">
                {{ resolveOptionLabel(courseOptions, row.courseId) }}
              </template>
            </el-table-column>
            <el-table-column prop="semesterRecommend" label="建议学期" min-width="140" />
            <el-table-column prop="courseCategory" label="课程类别" min-width="140" />
            <el-table-column label="是否必修" width="100">
              <template #default="{ row }">
                <el-tag :type="row.isRequired === 1 ? 'danger' : 'info'">{{ row.isRequired === 1 ? '必修' : '选修' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sortNo" label="排序" width="90" />
            <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openProgramCourseDialog(row)">编辑</el-button>
                <el-button type="danger" link @click="removeProgramCourse(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="课程支撑关系" name="supports">
          <div class="tab-actions">
            <el-select v-model="courseFilterId" clearable placeholder="按课程筛选" style="width: 240px;">
              <el-option
                v-for="item in selectedCourseOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-button type="primary" :disabled="!selectedVersionId" @click="openCourseSupportDialog()">新增支撑关系</el-button>
          </div>
          <el-table v-loading="loading.supports" :data="filteredSupports" border stripe>
            <el-table-column label="课程" min-width="220">
              <template #default="{ row }">
                {{ resolveOptionLabel(courseOptions, row.courseId) }}
              </template>
            </el-table-column>
            <el-table-column label="毕业要求" min-width="200">
              <template #default="{ row }">
                {{ resolveOptionLabel(requirementOptions, row.graduationRequirementId) }}
              </template>
            </el-table-column>
            <el-table-column prop="supportLevel" label="支撑强度" width="110" />
            <el-table-column prop="supportWeight" label="支撑权重" width="120" />
            <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openCourseSupportDialog(row)">编辑</el-button>
                <el-button type="danger" link @click="removeCourseSupport(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </SectionCard>

    <el-dialog v-model="programCourseDialog.visible" :title="programCourseDialog.form.id ? '编辑方案课程' : '添加方案课程'" width="640px">
      <el-form ref="programCourseFormRef" :model="programCourseDialog.form" :rules="programCourseRules" label-position="top">
        <el-form-item label="课程" prop="courseId">
          <el-select v-model="programCourseDialog.form.courseId" filterable style="width: 100%;">
            <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <div class="form-grid">
          <el-form-item label="建议学期"><el-input v-model.trim="programCourseDialog.form.semesterRecommend" /></el-form-item>
          <el-form-item label="课程类别"><el-input v-model.trim="programCourseDialog.form.courseCategory" /></el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item label="是否必修">
            <el-switch v-model="programCourseDialog.form.isRequired" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="排序"><el-input-number v-model="programCourseDialog.form.sortNo" :min="0" style="width: 100%;" /></el-form-item>
        </div>
        <el-form-item label="备注"><el-input v-model="programCourseDialog.form.remark" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="programCourseDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="savingProgramCourse" @click="submitProgramCourse">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="courseSupportDialog.visible" :title="courseSupportDialog.form.id ? '编辑课程支撑关系' : '新增课程支撑关系'" width="640px">
      <el-form ref="courseSupportFormRef" :model="courseSupportDialog.form" :rules="courseSupportRules" label-position="top">
        <el-form-item label="课程" prop="courseId">
          <el-select v-model="courseSupportDialog.form.courseId" filterable style="width: 100%;">
            <el-option v-for="item in selectedCourseOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="毕业要求" prop="graduationRequirementId">
          <el-select v-model="courseSupportDialog.form.graduationRequirementId" filterable style="width: 100%;">
            <el-option v-for="item in requirementOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <div class="form-grid">
          <el-form-item label="支撑强度">
            <el-select v-model="courseSupportDialog.form.supportLevel" style="width: 100%;">
              <el-option v-for="item in supportLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="支撑权重">
            <el-input-number v-model="courseSupportDialog.form.supportWeight" :min="0" :max="100" :precision="2" style="width: 100%;" />
          </el-form-item>
        </div>
        <el-form-item label="备注"><el-input v-model="courseSupportDialog.form.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="courseSupportDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="savingCourseSupport" @click="submitCourseSupport">保存</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { lookupApi, programApi, resolveOptionLabel, supportLevelOptions } from '../../api/bc';

const activeTab = ref('courses');
const selectedVersionId = ref(null);
const courseFilterId = ref(null);

const versionOptions = ref([]);
const courseOptions = ref([]);
const requirementOptions = ref([]);

const loading = reactive({
  courses: false,
  supports: false
});

const programCourses = ref([]);
const courseSupports = ref([]);

const selectedCourseOptions = computed(() =>
  programCourses.value.map((item) => ({
    value: item.courseId,
    label: resolveOptionLabel(courseOptions.value, item.courseId)
  }))
);

const filteredSupports = computed(() => {
  if (!courseFilterId.value) {
    return courseSupports.value;
  }
  return courseSupports.value.filter((item) => item.courseId === courseFilterId.value);
});

const programCourseDialog = reactive({
  visible: false,
  form: {}
});
const courseSupportDialog = reactive({
  visible: false,
  form: {}
});

const savingProgramCourse = ref(false);
const savingCourseSupport = ref(false);
const programCourseFormRef = ref();
const courseSupportFormRef = ref();

const programCourseRules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }]
};

const courseSupportRules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  graduationRequirementId: [{ required: true, message: '请选择毕业要求', trigger: 'change' }]
};

function createProgramCourseForm(row = {}) {
  return {
    id: row.id || null,
    programVersionId: selectedVersionId.value,
    courseId: row.courseId || null,
    semesterRecommend: row.semesterRecommend || '',
    courseCategory: row.courseCategory || '',
    isRequired: row.isRequired ?? 1,
    sortNo: row.sortNo ?? 0,
    remark: row.remark || ''
  };
}

function createCourseSupportForm(row = {}) {
  return {
    id: row.id || null,
    programVersionId: selectedVersionId.value,
    courseId: row.courseId || null,
    graduationRequirementId: row.graduationRequirementId || null,
    supportLevel: row.supportLevel || 'M',
    supportWeight: Number(row.supportWeight || 0),
    remark: row.remark || ''
  };
}

async function loadStaticLookups() {
  const [versions, courses] = await Promise.all([lookupApi.programVersions(), lookupApi.courses()]);
  versionOptions.value = versions;
  courseOptions.value = courses;
  if (!selectedVersionId.value && versionOptions.value.length) {
    selectedVersionId.value = versionOptions.value[0].value;
  }
}

async function loadRequirements() {
  if (!selectedVersionId.value) {
    requirementOptions.value = [];
    return;
  }
  const pageData = await programApi.listRequirements({ page: 1, size: 200, programVersionId: selectedVersionId.value });
  requirementOptions.value = (pageData.records || []).map((item) => ({
    value: item.id,
    label: `${item.requirementCode} ${item.requirementName}`
  }));
}

async function loadProgramCourses() {
  if (!selectedVersionId.value) {
    programCourses.value = [];
    return;
  }
  loading.courses = true;
  try {
    const pageData = await programApi.listProgramCourses({ page: 1, size: 200, programVersionId: selectedVersionId.value });
    programCourses.value = pageData.records || [];
  } finally {
    loading.courses = false;
  }
}

async function loadCourseSupports() {
  if (!selectedVersionId.value) {
    courseSupports.value = [];
    return;
  }
  loading.supports = true;
  try {
    const pageData = await programApi.listCourseSupports({ page: 1, size: 200, programVersionId: selectedVersionId.value });
    courseSupports.value = pageData.records || [];
  } finally {
    loading.supports = false;
  }
}

async function loadAll() {
  await Promise.all([loadRequirements(), loadProgramCourses(), loadCourseSupports()]);
}

function openProgramCourseDialog(row) {
  programCourseDialog.form = createProgramCourseForm(row);
  programCourseDialog.visible = true;
}

async function submitProgramCourse() {
  const valid = await programCourseFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  savingProgramCourse.value = true;
  try {
    const { id, ...payload } = programCourseDialog.form;
    id ? await programApi.updateProgramCourse(id, payload) : await programApi.createProgramCourse(payload);
    programCourseDialog.visible = false;
    ElMessage.success('课程清单已保存');
    await loadProgramCourses();
    await loadCourseSupports();
  } finally {
    savingProgramCourse.value = false;
  }
}

function openCourseSupportDialog(row) {
  courseSupportDialog.form = createCourseSupportForm(row);
  courseSupportDialog.visible = true;
}

async function submitCourseSupport() {
  const valid = await courseSupportFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  savingCourseSupport.value = true;
  try {
    const { id, ...payload } = courseSupportDialog.form;
    id ? await programApi.updateCourseSupport(id, payload) : await programApi.createCourseSupport(payload);
    courseSupportDialog.visible = false;
    ElMessage.success('课程支撑关系已保存');
    await loadCourseSupports();
  } finally {
    savingCourseSupport.value = false;
  }
}

async function removeProgramCourse(row) {
  try {
    await ElMessageBox.confirm('确认从该方案版本中移除这门课程吗？', '删除确认', { type: 'warning' });
    await programApi.deleteProgramCourse(row.id);
    ElMessage.success('课程已移除');
    await loadProgramCourses();
    await loadCourseSupports();
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

async function removeCourseSupport(row) {
  try {
    await ElMessageBox.confirm('确认删除这条课程支撑关系吗？', '删除确认', { type: 'warning' });
    await programApi.deleteCourseSupport(row.id);
    ElMessage.success('支撑关系已删除');
    await loadCourseSupports();
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

onMounted(async () => {
  await loadStaticLookups();
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
