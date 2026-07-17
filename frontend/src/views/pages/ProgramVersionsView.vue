<template>
  <StandardPage
    title="方案版本"
    :breadcrumbs="['首页', '方案设计', '方案版本']"
    description="维护培养方案版本、启停状态和适用年级。"
  >
    <template #actions>
      <el-button type="primary" @click="openVersionDialog()">新建版本</el-button>
      <el-button @click="loadData">刷新</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters" class="crud-filter-form">
        <el-form-item label="专业">
          <el-select v-model="filters.majorId" clearable filterable style="width: 220px;">
            <el-option v-for="item in majorOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable style="width: 180px;">
            <el-option v-for="item in versionStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model.trim="filters.keyword" clearable placeholder="版本号 / 版本名 / 备注" style="width: 260px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="loadData">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <SectionCard title="版本列表">
      <el-table v-loading="loading" :data="versions.records" border stripe>
        <el-table-column prop="versionNo" label="版本号" min-width="140" />
        <el-table-column prop="versionName" label="版本名称" min-width="200" />
        <el-table-column label="专业" min-width="180">
          <template #default="{ row }">
            {{ resolveOptionLabel(majorOptions, row.majorId) }}
          </template>
        </el-table-column>
        <el-table-column label="生效日期" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.effectiveDate) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType[row.status] || 'info'">
              {{ resolveOptionLabel(versionStatusOptions, row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布于" min-width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.releasedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" min-width="360" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openVersionDialog(row)">编辑</el-button>
            <el-button type="primary" link @click="openCopyDialog(row)">复制</el-button>
            <el-button type="primary" link @click="openGradeDialog(row)">适用年级</el-button>
            <el-dropdown trigger="click" @command="(status) => changeStatus(row, status)">
              <el-button type="primary" link>状态</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="item in versionStatusOptions" :key="item.value" :command="item.value">
                    {{ item.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="danger" link @click="removeVersion(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="crud-pagination">
        <el-pagination
          v-model:current-page="filters.page"
          v-model:page-size="filters.size"
          background
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          :total="versions.total"
          @current-change="loadData"
          @size-change="loadData"
        />
      </div>
    </SectionCard>

    <el-dialog v-model="versionDialog.visible" :title="versionDialog.form.id ? '编辑版本' : '新建版本'" width="620px">
      <el-form ref="versionFormRef" :model="versionDialog.form" :rules="versionRules" label-position="top">
        <el-form-item label="专业" prop="majorId">
          <el-select v-model="versionDialog.form.majorId" filterable style="width: 100%;">
            <el-option v-for="item in majorOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本号" prop="versionNo">
          <el-input v-model.trim="versionDialog.form.versionNo" />
        </el-form-item>
        <el-form-item label="版本名称" prop="versionName">
          <el-input v-model.trim="versionDialog.form.versionName" />
        </el-form-item>
        <el-form-item label="生效日期" prop="effectiveDate">
          <el-date-picker v-model="versionDialog.form.effectiveDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="versionDialog.form.status" style="width: 100%;">
            <el-option v-for="item in versionStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="versionDialog.form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="versionDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="savingVersion" @click="submitVersion">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="copyDialog.visible" title="复制版本" width="560px">
      <el-form ref="copyFormRef" :model="copyDialog.form" :rules="copyRules" label-position="top">
        <el-form-item label="新版本号" prop="versionNo">
          <el-input v-model.trim="copyDialog.form.versionNo" />
        </el-form-item>
        <el-form-item label="新版本名称" prop="versionName">
          <el-input v-model.trim="copyDialog.form.versionName" />
        </el-form-item>
        <el-form-item label="复制到专业">
          <el-select v-model="copyDialog.form.majorId" filterable style="width: 100%;">
            <el-option v-for="item in majorOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="copyDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="copying" @click="submitCopy">确认复制</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="gradeDialog.visible" :title="`适用年级 - ${gradeDialog.versionName}`" width="560px">
      <el-checkbox-group v-model="gradeDialog.gradeIds">
        <div class="grade-grid">
          <el-checkbox v-for="item in gradeOptions" :key="item.value" :label="item.value">
            {{ item.label }}
          </el-checkbox>
        </div>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="gradeDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="savingGrades" @click="submitGrades">保存年级</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { lookupApi, programApi, resolveOptionLabel, versionStatusOptions } from '../../api/bc';
import { formatDate, formatDateTime } from '../../utils/format';

const loading = ref(false);
const savingVersion = ref(false);
const savingGrades = ref(false);
const copying = ref(false);

const majorOptions = ref([]);
const gradeOptions = ref([]);
const versions = reactive({
  records: [],
  total: 0
});

const filters = reactive({
  page: 1,
  size: 10,
  majorId: null,
  status: '',
  keyword: ''
});

const statusTagType = {
  DRAFT: 'info',
  RELEASED: 'success',
  DISABLED: 'warning',
  ARCHIVED: ''
};

const versionDialog = reactive({
  visible: false,
  form: createVersionForm()
});

const copyDialog = reactive({
  visible: false,
  sourceId: null,
  form: {
    versionNo: '',
    versionName: '',
    majorId: null
  }
});

const gradeDialog = reactive({
  visible: false,
  versionId: null,
  versionName: '',
  gradeIds: []
});

const versionFormRef = ref();
const copyFormRef = ref();

const versionRules = {
  majorId: [{ required: true, message: '请选择专业', trigger: 'change' }],
  versionNo: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
  versionName: [{ required: true, message: '请输入版本名称', trigger: 'blur' }],
  effectiveDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};

const copyRules = {
  versionNo: [{ required: true, message: '请输入新版本号', trigger: 'blur' }],
  versionName: [{ required: true, message: '请输入新版本名称', trigger: 'blur' }]
};

function createVersionForm(row = {}) {
  return {
    id: row.id || null,
    majorId: row.majorId || null,
    versionNo: row.versionNo || '',
    versionName: row.versionName || '',
    effectiveDate: row.effectiveDate || '',
    status: row.status || 'DRAFT',
    remark: row.remark || ''
  };
}

async function loadLookups() {
  const [majors, grades] = await Promise.all([lookupApi.majors(), lookupApi.grades()]);
  majorOptions.value = majors;
  gradeOptions.value = grades;
}

async function loadData() {
  loading.value = true;
  try {
    const pageData = await programApi.listVersions(filters);
    versions.records = pageData.records || [];
    versions.total = pageData.total || 0;
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.page = 1;
  filters.size = 10;
  filters.majorId = null;
  filters.status = '';
  filters.keyword = '';
  loadData();
}

function openVersionDialog(row) {
  versionDialog.form = createVersionForm(row);
  versionDialog.visible = true;
}

async function submitVersion() {
  const valid = await versionFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  savingVersion.value = true;
  try {
    const payload = { ...versionDialog.form };
    if (payload.id) {
      await programApi.updateVersion(payload.id, payload);
      ElMessage.success('版本已更新');
    } else {
      await programApi.createVersion(payload);
      ElMessage.success('版本已创建');
    }
    versionDialog.visible = false;
    await loadData();
  } finally {
    savingVersion.value = false;
  }
}

function openCopyDialog(row) {
  copyDialog.sourceId = row.id;
  copyDialog.form = {
    versionNo: `${row.versionNo || ''}-COPY`,
    versionName: `${row.versionName || row.versionNo || ''} 副本`,
    majorId: row.majorId || null
  };
  copyDialog.visible = true;
}

async function submitCopy() {
  const valid = await copyFormRef.value?.validate().catch(() => false);
  if (!valid || !copyDialog.sourceId) {
    return;
  }
  copying.value = true;
  try {
    await programApi.copyVersion(copyDialog.sourceId, copyDialog.form);
    copyDialog.visible = false;
    ElMessage.success('版本复制成功');
    await loadData();
  } finally {
    copying.value = false;
  }
}

async function openGradeDialog(row) {
  gradeDialog.visible = true;
  gradeDialog.versionId = row.id;
  gradeDialog.versionName = row.versionName || row.versionNo;
  gradeDialog.gradeIds = await programApi.listVersionGrades(row.id);
}

async function submitGrades() {
  if (!gradeDialog.versionId) {
    return;
  }
  savingGrades.value = true;
  try {
    await programApi.replaceVersionGrades(gradeDialog.versionId, gradeDialog.gradeIds);
    gradeDialog.visible = false;
    ElMessage.success('适用年级已保存');
  } finally {
    savingGrades.value = false;
  }
}

async function changeStatus(row, status) {
  if (!row?.id || row.status === status) {
    return;
  }
  await programApi.updateVersionStatus(row.id, status);
  ElMessage.success('状态已更新');
  await loadData();
}

async function removeVersion(row) {
  try {
    await ElMessageBox.confirm(`确认删除版本“${row.versionName || row.versionNo}”吗？`, '删除确认', {
      type: 'warning'
    });
    await programApi.deleteVersion(row.id);
    ElMessage.success('版本已删除');
    await loadData();
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

onMounted(async () => {
  await loadLookups();
  await loadData();
});
</script>

<style scoped>
.grade-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}
</style>
