<template>
  <StandardPage
    title="组织架构"
    :breadcrumbs="['首页', '基础管理', '组织架构']"
    description="维护学院、专业、年级和班级组织关系。"
  >
    <template #actions>
      <el-button @click="reloadAll" :loading="loading">刷新</el-button>
      <el-button type="primary" @click="openCreateDialog">新增{{ currentTabLabel }}</el-button>
    </template>

    <section class="page-kpis">
      <article class="page-kpi">
        <div class="page-kpi__label">学院</div>
        <div class="page-kpi__value">{{ colleges.length }}</div>
        <div class="page-kpi__desc">组织目录中的学院与部门数量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">专业</div>
        <div class="page-kpi__value">{{ majors.length }}</div>
        <div class="page-kpi__desc">当前维护的专业条目数量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">年级</div>
        <div class="page-kpi__value">{{ grades.length }}</div>
        <div class="page-kpi__desc">已纳入管理的招生年级数量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">班级</div>
        <div class="page-kpi__value">{{ classes.length }}</div>
        <div class="page-kpi__desc">当前班级总量与负责人配置情况。</div>
      </article>
    </section>

    <div class="split-grid split-grid--sidebar">
      <SectionCard title="组织树">
        <el-tree :data="treeData" node-key="id" default-expand-all />
      </SectionCard>

      <SectionCard title="概览">
        <el-table :data="overviewRows" border stripe max-height="520">
          <el-table-column prop="name" label="名称" min-width="180" />
          <el-table-column prop="typeLabel" label="类型" min-width="100" />
          <el-table-column prop="director" label="负责人" min-width="130" />
          <el-table-column prop="students" label="人数" min-width="90" />
          <el-table-column label="最近更新" min-width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.updatedAt) }}
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>
    </div>

    <SectionCard class="org-section" :title="`${currentTabLabel}维护`">
      <template #extra>
        <el-tabs v-model="activeTab" class="org-tabs">
          <el-tab-pane label="学院" name="colleges" />
          <el-tab-pane label="专业" name="majors" />
          <el-tab-pane label="年级" name="grades" />
          <el-tab-pane label="班级" name="classes" />
        </el-tabs>
      </template>

      <el-table v-loading="loading" :data="currentRows" border stripe>
        <el-table-column v-if="activeTab === 'colleges'" prop="collegeCode" label="学院编码" min-width="120" />
        <el-table-column v-if="activeTab === 'colleges'" prop="collegeName" label="学院名称" min-width="180" />
        <el-table-column v-if="activeTab === 'majors'" prop="majorCode" label="专业编码" min-width="120" />
        <el-table-column v-if="activeTab === 'majors'" prop="majorName" label="专业名称" min-width="180" />
        <el-table-column v-if="activeTab === 'majors'" prop="collegeName" label="所属学院" min-width="160" />
        <el-table-column v-if="activeTab === 'majors'" prop="degreeType" label="培养层次" min-width="110" />
        <el-table-column v-if="activeTab === 'grades'" prop="gradeYear" label="年级" min-width="100" />
        <el-table-column v-if="activeTab === 'grades'" prop="admissionYear" label="入学年份" min-width="110" />
        <el-table-column v-if="activeTab === 'grades'" prop="expectedGraduationYear" label="预计毕业" min-width="120" />
        <el-table-column v-if="activeTab === 'classes'" prop="classCode" label="班级编码" min-width="120" />
        <el-table-column v-if="activeTab === 'classes'" prop="className" label="班级名称" min-width="160" />
        <el-table-column v-if="activeTab === 'classes'" prop="headTeacherName" label="班主任" min-width="120" />
        <el-table-column v-if="activeTab === 'classes'" prop="studentCount" label="人数" min-width="90" />
        <el-table-column label="状态" min-width="90">
          <template #default="{ row }">
            <el-tag :type="Number(row.status) === 1 ? 'success' : 'info'" effect="light">
              {{ Number(row.status) === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="activeTab === 'colleges' || activeTab === 'majors' || activeTab === 'grades'" prop="remark" label="备注" min-width="180" />
        <el-table-column v-if="activeTab === 'classes'" prop="remark" label="备注" min-width="180" />
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link @click="removeRow(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <el-dialog
      v-model="dialogVisible"
      :title="`${dialogMode === 'create' ? '新增' : '编辑'}${currentTabLabel}`"
      width="620px"
      destroy-on-close
    >
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="100px">
        <template v-if="activeTab === 'colleges'">
          <el-form-item label="学院编码" prop="collegeCode">
            <el-input v-model.trim="dialogForm.collegeCode" />
          </el-form-item>
          <el-form-item label="学院名称" prop="collegeName">
            <el-input v-model.trim="dialogForm.collegeName" />
          </el-form-item>
          <el-form-item label="排序" prop="sortNo">
            <el-input-number v-model="dialogForm.sortNo" :min="0" />
          </el-form-item>
        </template>

        <template v-if="activeTab === 'majors'">
          <el-form-item label="所属学院" prop="collegeId">
            <el-select v-model="dialogForm.collegeId" class="w-full">
              <el-option v-for="item in options.colleges" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="专业编码" prop="majorCode">
            <el-input v-model.trim="dialogForm.majorCode" />
          </el-form-item>
          <el-form-item label="专业名称" prop="majorName">
            <el-input v-model.trim="dialogForm.majorName" />
          </el-form-item>
          <el-form-item label="培养层次" prop="degreeType">
            <el-input v-model.trim="dialogForm.degreeType" placeholder="例如：Bachelor" />
          </el-form-item>
          <el-form-item label="排序" prop="sortNo">
            <el-input-number v-model="dialogForm.sortNo" :min="0" />
          </el-form-item>
        </template>

        <template v-if="activeTab === 'grades'">
          <el-form-item label="年级" prop="gradeYear">
            <el-input-number v-model="dialogForm.gradeYear" :min="2000" :max="2100" />
          </el-form-item>
          <el-form-item label="入学年份" prop="admissionYear">
            <el-input-number v-model="dialogForm.admissionYear" :min="2000" :max="2100" />
          </el-form-item>
          <el-form-item label="预计毕业" prop="expectedGraduationYear">
            <el-input-number v-model="dialogForm.expectedGraduationYear" :min="2000" :max="2100" />
          </el-form-item>
        </template>

        <template v-if="activeTab === 'classes'">
          <el-form-item label="所属专业" prop="majorId">
            <el-select v-model="dialogForm.majorId" class="w-full">
              <el-option v-for="item in options.majors" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属年级" prop="gradeId">
            <el-select v-model="dialogForm.gradeId" class="w-full">
              <el-option v-for="item in options.grades" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="班级编码" prop="classCode">
            <el-input v-model.trim="dialogForm.classCode" />
          </el-form-item>
          <el-form-item label="班级名称" prop="className">
            <el-input v-model.trim="dialogForm.className" />
          </el-form-item>
          <el-form-item label="班主任" prop="headTeacherId">
            <el-select v-model="dialogForm.headTeacherId" clearable class="w-full">
              <el-option v-for="item in options.teachers" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="学生人数" prop="studentCount">
            <el-input-number v-model="dialogForm.studentCount" :min="0" />
          </el-form-item>
        </template>

        <el-form-item label="状态" prop="status">
          <el-select v-model="dialogForm.status" class="w-full">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model.trim="dialogForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveDialog">确定</el-button>
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
const saving = ref(false);
const activeTab = ref('colleges');
const dialogVisible = ref(false);
const dialogMode = ref('create');
const dialogFormRef = ref();

const colleges = ref([]);
const majors = ref([]);
const grades = ref([]);
const classes = ref([]);

const options = reactive({
  colleges: [],
  majors: [],
  grades: [],
  teachers: []
});

const dialogForm = reactive(createDialogForm());

const dialogRules = {
  collegeName: [{ required: true, message: '请输入学院名称', trigger: 'blur' }],
  majorName: [{ required: true, message: '请输入专业名称', trigger: 'blur' }],
  gradeYear: [{ required: true, message: '请输入年级', trigger: 'change' }],
  className: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  collegeId: [{ required: true, message: '请选择学院', trigger: 'change' }],
  majorId: [{ required: true, message: '请选择专业', trigger: 'change' }],
  gradeId: [{ required: true, message: '请选择年级', trigger: 'change' }]
};

const currentTabLabel = computed(() => {
  return {
    colleges: '学院',
    majors: '专业',
    grades: '年级',
    classes: '班级'
  }[activeTab.value];
});

const currentRows = computed(() => {
  return {
    colleges: colleges.value,
    majors: majors.value,
    grades: grades.value,
    classes: classes.value
  }[activeTab.value];
});

const treeData = computed(() => {
  const majorMap = majors.value.reduce((map, item) => {
    if (!map[item.collegeId]) {
      map[item.collegeId] = [];
    }
    map[item.collegeId].push(item);
    return map;
  }, {});

  const classMap = classes.value.reduce((map, item) => {
    if (!map[item.majorId]) {
      map[item.majorId] = [];
    }
    map[item.majorId].push(item);
    return map;
  }, {});

  return [
    {
      id: 'root',
      label: '学校',
      children: colleges.value.map((college) => ({
        id: `college-${college.id}`,
        label: college.collegeName,
        children: (majorMap[college.id] || []).map((major) => ({
          id: `major-${major.id}`,
          label: major.majorName,
          children: (classMap[major.id] || []).map((clazz) => ({
            id: `class-${clazz.id}`,
            label: clazz.className
          }))
        }))
      }))
    }
  ];
});

const overviewRows = computed(() => {
  const teacherMap = Object.fromEntries(options.teachers.map((item) => [item.id, item.label]));
  const majorRows = majors.value.map((item) => ({
    id: `major-${item.id}`,
    name: item.majorName,
    typeLabel: '专业',
    director: item.collegeName || '-',
    students: classes.value
      .filter((clazz) => clazz.majorId === item.id)
      .reduce((sum, clazz) => sum + Number(clazz.studentCount || 0), 0),
    updatedAt: item.updatedAt
  }));
  const classRows = classes.value.map((item) => ({
    id: `class-${item.id}`,
    name: item.className,
    typeLabel: '班级',
    director: teacherMap[item.headTeacherId] || '-',
    students: Number(item.studentCount || 0),
    updatedAt: item.updatedAt
  }));
  return [...majorRows, ...classRows].sort((left, right) => {
    return new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime();
  });
});

onMounted(() => {
  reloadAll();
});

function createDialogForm() {
  return {
    id: null,
    collegeCode: '',
    collegeName: '',
    majorCode: '',
    majorName: '',
    degreeType: 'Bachelor',
    gradeYear: new Date().getFullYear(),
    admissionYear: new Date().getFullYear(),
    expectedGraduationYear: new Date().getFullYear() + 4,
    classCode: '',
    className: '',
    collegeId: null,
    majorId: null,
    gradeId: null,
    headTeacherId: null,
    studentCount: 0,
    sortNo: 0,
    status: 1,
    remark: ''
  };
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  return String(value).replace('T', ' ').slice(0, 19);
}

async function reloadAll() {
  loading.value = true;
  try {
    const [collegeRows, majorRows, gradeRows, classRows, orgOptions] = await Promise.all([
      request.get('/org/colleges'),
      request.get('/org/majors'),
      request.get('/org/grades'),
      request.get('/org/classes'),
      request.get('/org/options')
    ]);

    colleges.value = collegeRows || [];
    majors.value = majorRows || [];
    grades.value = gradeRows || [];
    classes.value = classRows || [];

    options.colleges = orgOptions.colleges || [];
    options.majors = orgOptions.majors || [];
    options.grades = orgOptions.grades || [];
    options.teachers = orgOptions.teachers || [];
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  dialogMode.value = 'create';
  Object.assign(dialogForm, createDialogForm());
  dialogVisible.value = true;
}

function openEditDialog(row) {
  dialogMode.value = 'edit';
  Object.assign(dialogForm, createDialogForm(), row);
  dialogVisible.value = true;
}

function buildPayload() {
  if (activeTab.value === 'colleges') {
    return {
      collegeCode: dialogForm.collegeCode,
      collegeName: dialogForm.collegeName,
      sortNo: Number(dialogForm.sortNo || 0),
      status: Number(dialogForm.status),
      remark: dialogForm.remark
    };
  }

  if (activeTab.value === 'majors') {
    return {
      collegeId: dialogForm.collegeId,
      majorCode: dialogForm.majorCode,
      majorName: dialogForm.majorName,
      degreeType: dialogForm.degreeType,
      sortNo: Number(dialogForm.sortNo || 0),
      status: Number(dialogForm.status),
      remark: dialogForm.remark
    };
  }

  if (activeTab.value === 'grades') {
    return {
      gradeYear: Number(dialogForm.gradeYear),
      admissionYear: Number(dialogForm.admissionYear),
      expectedGraduationYear: Number(dialogForm.expectedGraduationYear),
      status: Number(dialogForm.status),
      remark: dialogForm.remark
    };
  }

  return {
    majorId: dialogForm.majorId,
    gradeId: dialogForm.gradeId,
    classCode: dialogForm.classCode,
    className: dialogForm.className,
    headTeacherId: dialogForm.headTeacherId,
    studentCount: Number(dialogForm.studentCount || 0),
    status: Number(dialogForm.status),
    remark: dialogForm.remark
  };
}

function buildEndpoint(id = null) {
  const baseMap = {
    colleges: '/org/colleges',
    majors: '/org/majors',
    grades: '/org/grades',
    classes: '/org/classes'
  };
  return id ? `${baseMap[activeTab.value]}/${id}` : baseMap[activeTab.value];
}

async function saveDialog() {
  const valid = await dialogFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  saving.value = true;
  try {
    const payload = buildPayload();
    if (dialogMode.value === 'create') {
      await request.post(buildEndpoint(), payload);
      ElMessage.success(`${currentTabLabel.value}新增成功`);
    } else {
      await request.put(buildEndpoint(dialogForm.id), payload);
      ElMessage.success(`${currentTabLabel.value}已更新`);
    }
    dialogVisible.value = false;
    await reloadAll();
  } finally {
    saving.value = false;
  }
}

async function removeRow(row) {
  try {
    await ElMessageBox.confirm(`确认删除${currentTabLabel.value}“${resolveRowName(row)}”吗？`, '删除确认', {
      type: 'warning'
    });
  } catch {
    return;
  }

  await request.delete(buildEndpoint(row.id));
  ElMessage.success('删除成功');
  await reloadAll();
}

function resolveRowName(row) {
  return row.collegeName || row.majorName || row.className || row.gradeYear;
}
</script>

<style scoped>
.org-section {
  margin-top: 24px;
}

.org-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}
</style>
