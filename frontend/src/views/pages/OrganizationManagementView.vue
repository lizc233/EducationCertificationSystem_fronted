<template>
  <StandardPage
    :title="pageTitle"
    :breadcrumbs="breadcrumbs"
    :description="description"
  >
    <template #actions>
      <el-button :loading="loading" @click="reloadAll">刷新</el-button>
      <el-button type="primary" @click="openCreateDialog">新增{{ currentEntityLabel }}</el-button>
    </template>

    <section class="page-kpis">
      <article
        v-for="card in summaryCards"
        :key="card.label"
        class="page-kpi"
      >
        <div class="page-kpi__label">{{ card.label }}</div>
        <div class="page-kpi__value">{{ card.value }}</div>
        <div class="page-kpi__desc">{{ card.desc }}</div>
      </article>
    </section>

    <div class="org-panel-grid">
      <SectionCard title="管理说明">
        <div class="org-note-list">
          <div class="org-note-item">当前页面只维护{{ currentEntityLabel }}，不再在页内切换其它目录。</div>
          <div class="org-note-item">所有字段均使用中文展示，新增用户时可直接从这些主数据中下拉选择。</div>
          <div class="org-note-item">{{ relationHint }}</div>
        </div>
      </SectionCard>

      <SectionCard title="当前层级关系">
        <div class="org-relation-card">
          <div class="org-relation-card__title">{{ currentEntityLabel }}</div>
          <div class="org-relation-card__text">{{ relationChain }}</div>
        </div>
      </SectionCard>
    </div>

    <SectionCard :title="`${currentEntityLabel}列表`">
      <template #extra>
        <el-form :inline="true" :model="filters" class="org-filter-form">
          <el-form-item>
            <el-input
              v-model.trim="filters.keyword"
              :placeholder="`搜索${currentEntityLabel}名称或编码`"
              clearable
              style="width: 220px"
            />
          </el-form-item>
          <el-form-item v-if="showCollegeFilter">
            <el-select v-model="filters.collegeId" clearable placeholder="全部学院" style="width: 180px">
              <el-option
                v-for="item in options.colleges"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="showMajorFilter">
            <el-select v-model="filters.majorId" clearable placeholder="全部专业" style="width: 180px">
              <el-option
                v-for="item in filterMajorOptions"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="showGradeFilter">
            <el-select v-model="filters.gradeId" clearable placeholder="全部年级" style="width: 160px">
              <el-option
                v-for="item in options.grades"
                :key="item.id"
                :label="formatGradeLabel(item.label)"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.status" clearable placeholder="全部状态" style="width: 140px">
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </template>

      <el-table v-loading="loading" :data="filteredRows" border stripe>
        <template v-if="entityType === 'colleges'">
          <el-table-column prop="collegeCode" label="学院编码" min-width="140" />
          <el-table-column prop="collegeName" label="学院名称" min-width="180" />
          <el-table-column prop="sortNo" label="排序" width="90" align="center" />
        </template>

        <template v-else-if="entityType === 'majors'">
          <el-table-column prop="majorCode" label="专业编码" min-width="140" />
          <el-table-column prop="majorName" label="专业名称" min-width="180" />
          <el-table-column prop="collegeName" label="所属学院" min-width="160" />
          <el-table-column prop="degreeType" label="培养层次" min-width="120" />
          <el-table-column prop="sortNo" label="排序" width="90" align="center" />
        </template>

        <template v-else-if="entityType === 'grades'">
          <el-table-column prop="gradeYear" label="年级" min-width="120">
            <template #default="{ row }">
              {{ formatGradeLabel(row.gradeYear) }}
            </template>
          </el-table-column>
          <el-table-column prop="admissionYear" label="入学年份" min-width="120" />
          <el-table-column prop="expectedGraduationYear" label="预计毕业年份" min-width="140" />
        </template>

        <template v-else>
          <el-table-column prop="classCode" label="班级编码" min-width="140" />
          <el-table-column prop="className" label="班级名称" min-width="180" />
          <el-table-column prop="collegeName" label="所属学院" min-width="150" />
          <el-table-column prop="majorName" label="所属专业" min-width="160" />
          <el-table-column prop="gradeLabel" label="所属年级" min-width="110" />
          <el-table-column prop="headTeacherName" label="班主任" min-width="140" />
          <el-table-column prop="studentCount" label="学生人数" width="100" align="center" />
        </template>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="Number(row.status) === 1 ? 'success' : 'info'" effect="light">
              {{ Number(row.status) === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link @click="removeRow(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <el-dialog
      v-model="dialogVisible"
      :title="`${dialogMode === 'create' ? '新增' : '编辑'}${currentEntityLabel}`"
      width="680px"
      destroy-on-close
    >
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="108px">
        <div v-if="entityType === 'colleges'" class="org-form-grid">
          <el-form-item label="学院编码" prop="collegeCode">
            <el-input v-model.trim="dialogForm.collegeCode" placeholder="请输入学院编码" />
          </el-form-item>
          <el-form-item label="学院名称" prop="collegeName">
            <el-input v-model.trim="dialogForm.collegeName" placeholder="请输入学院名称" />
          </el-form-item>
          <el-form-item label="排序" prop="sortNo">
            <el-input-number v-model="dialogForm.sortNo" :min="0" class="w-full" />
          </el-form-item>
        </div>

        <div v-else-if="entityType === 'majors'" class="org-form-grid">
          <el-form-item label="所属学院" prop="collegeId">
            <el-select v-model="dialogForm.collegeId" class="w-full" placeholder="请选择学院">
              <el-option
                v-for="item in options.colleges"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="专业编码" prop="majorCode">
            <el-input v-model.trim="dialogForm.majorCode" placeholder="请输入专业编码" />
          </el-form-item>
          <el-form-item label="专业名称" prop="majorName">
            <el-input v-model.trim="dialogForm.majorName" placeholder="请输入专业名称" />
          </el-form-item>
          <el-form-item label="培养层次" prop="degreeType">
            <el-input v-model.trim="dialogForm.degreeType" placeholder="例如：本科" />
          </el-form-item>
          <el-form-item label="排序" prop="sortNo">
            <el-input-number v-model="dialogForm.sortNo" :min="0" class="w-full" />
          </el-form-item>
        </div>

        <div v-else-if="entityType === 'grades'" class="org-form-grid">
          <el-form-item label="年级" prop="gradeYear">
            <el-input-number v-model="dialogForm.gradeYear" :min="2000" :max="2100" class="w-full" />
          </el-form-item>
          <el-form-item label="入学年份" prop="admissionYear">
            <el-input-number v-model="dialogForm.admissionYear" :min="2000" :max="2100" class="w-full" />
          </el-form-item>
          <el-form-item label="预计毕业年份" prop="expectedGraduationYear">
            <el-input-number v-model="dialogForm.expectedGraduationYear" :min="2000" :max="2100" class="w-full" />
          </el-form-item>
        </div>

        <div v-else class="org-form-grid">
          <el-form-item label="所属学院" prop="collegeId">
            <el-select v-model="dialogForm.collegeId" class="w-full" placeholder="请选择学院">
              <el-option
                v-for="item in options.colleges"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="所属专业" prop="majorId">
            <el-select v-model="dialogForm.majorId" class="w-full" placeholder="请选择专业">
              <el-option
                v-for="item in dialogMajorOptions"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="所属年级" prop="gradeId">
            <el-select v-model="dialogForm.gradeId" class="w-full" placeholder="请选择年级">
              <el-option
                v-for="item in options.grades"
                :key="item.id"
                :label="formatGradeLabel(item.label)"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="班级编码" prop="classCode">
            <el-input v-model.trim="dialogForm.classCode" placeholder="请输入班级编码" />
          </el-form-item>
          <el-form-item label="班级名称" prop="className">
            <el-input v-model.trim="dialogForm.className" placeholder="请输入班级名称" />
          </el-form-item>
          <el-form-item label="班主任" prop="headTeacherId">
            <el-select v-model="dialogForm.headTeacherId" clearable class="w-full" placeholder="请选择班主任">
              <el-option
                v-for="item in options.teachers"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="学生人数" prop="studentCount">
            <el-input-number v-model="dialogForm.studentCount" :min="0" class="w-full" />
          </el-form-item>
        </div>

        <el-form-item label="状态" prop="status">
          <el-select v-model="dialogForm.status" class="w-full">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model.trim="dialogForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveDialog">保存</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import request from '../../utils/request';

const props = defineProps({
  initialTab: {
    type: String,
    default: 'colleges'
  },
  pageTitle: {
    type: String,
    default: '组织管理'
  },
  breadcrumbs: {
    type: Array,
    default: () => ['首页', '用户管理', '组织管理']
  }
});

const ENTITY_LABEL_MAP = {
  colleges: '学院',
  majors: '专业',
  grades: '年级',
  classes: '班级'
};

const ENTITY_CHAIN_MAP = {
  colleges: '学院',
  majors: '学院 / 专业',
  grades: '年级',
  classes: '学院 / 专业 / 年级 / 班级'
};

const loading = ref(false);
const saving = ref(false);
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

const filters = reactive({
  keyword: '',
  status: '',
  collegeId: null,
  majorId: null,
  gradeId: null
});

const dialogForm = reactive(createDialogForm());

const entityType = computed(() => ENTITY_LABEL_MAP[props.initialTab] ? props.initialTab : 'colleges');
const currentEntityLabel = computed(() => ENTITY_LABEL_MAP[entityType.value]);
const description = computed(() => `管理员可在此维护${currentEntityLabel.value}主数据，新增教师和学生用户时可直接下拉选择。`);
const relationChain = computed(() => ENTITY_CHAIN_MAP[entityType.value]);
const relationHint = computed(() => {
  if (entityType.value === 'colleges') {
    return '学院是教师归属和专业归属的上层主数据。';
  }
  if (entityType.value === 'majors') {
    return '专业从属于学院，后续班级和培养方案都会引用专业。';
  }
  if (entityType.value === 'grades') {
    return '年级决定学生入学届别和预计毕业年份。';
  }
  return '班级需要绑定专业和年级，新增学生用户时直接选择班级即可。';
});

const collegeMap = computed(() => new Map(colleges.value.map((item) => [item.id, item])));
const majorMap = computed(() => new Map(majors.value.map((item) => [item.id, item])));
const gradeMap = computed(() => new Map(grades.value.map((item) => [item.id, item])));
const teacherMap = computed(() => new Map(options.teachers.map((item) => [item.id, item.label])));

const classRows = computed(() => classes.value.map((item) => {
  const major = majorMap.value.get(item.majorId);
  const college = major ? collegeMap.value.get(major.collegeId) : null;
  const grade = gradeMap.value.get(item.gradeId);
  return {
    ...item,
    collegeId: major?.collegeId ?? null,
    collegeName: major?.collegeName || college?.collegeName || '',
    majorName: major?.majorName || '',
    gradeLabel: grade ? formatGradeLabel(grade.gradeYear) : '',
    headTeacherName: item.headTeacherName || teacherMap.value.get(item.headTeacherId) || ''
  };
}));

const baseRows = computed(() => {
  if (entityType.value === 'colleges') {
    return colleges.value;
  }
  if (entityType.value === 'majors') {
    return majors.value;
  }
  if (entityType.value === 'grades') {
    return grades.value;
  }
  return classRows.value;
});

const showCollegeFilter = computed(() => ['majors', 'classes'].includes(entityType.value));
const showMajorFilter = computed(() => entityType.value === 'classes');
const showGradeFilter = computed(() => entityType.value === 'classes');

const filterMajorOptions = computed(() => {
  if (!filters.collegeId) {
    return options.majors;
  }
  return options.majors.filter((item) => item.parentId === filters.collegeId);
});

const dialogMajorOptions = computed(() => {
  if (!dialogForm.collegeId) {
    return options.majors;
  }
  return options.majors.filter((item) => item.parentId === dialogForm.collegeId);
});

const filteredRows = computed(() => {
  const keyword = String(filters.keyword || '').trim().toLowerCase();
  return baseRows.value.filter((item) => {
    if (filters.status !== '' && Number(item.status) !== Number(filters.status)) {
      return false;
    }
    if (entityType.value === 'majors' && filters.collegeId && item.collegeId !== filters.collegeId) {
      return false;
    }
    if (entityType.value === 'classes') {
      if (filters.collegeId && item.collegeId !== filters.collegeId) {
        return false;
      }
      if (filters.majorId && item.majorId !== filters.majorId) {
        return false;
      }
      if (filters.gradeId && item.gradeId !== filters.gradeId) {
        return false;
      }
    }
    if (!keyword) {
      return true;
    }
    const candidates = [
      item.collegeCode,
      item.collegeName,
      item.majorCode,
      item.majorName,
      item.classCode,
      item.className,
      item.gradeYear,
      item.remark,
      item.degreeType,
      item.collegeName,
      item.gradeLabel
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());
    return candidates.some((value) => value.includes(keyword));
  });
});

const summaryCards = computed(() => {
  const enabledCount = baseRows.value.filter((item) => Number(item.status) === 1).length;
  if (entityType.value === 'colleges') {
    return [
      { label: '学院总数', value: colleges.value.length, desc: '当前已维护的学院主数据数量。' },
      { label: '启用学院', value: enabledCount, desc: '当前可用于教师和专业关联的学院数量。' },
      { label: '关联专业', value: majors.value.length, desc: '所有学院下已配置的专业数量。' },
      { label: '教师账号', value: options.teachers.length, desc: '当前可供班级选择的教师账号数量。' }
    ];
  }
  if (entityType.value === 'majors') {
    return [
      { label: '专业总数', value: majors.value.length, desc: '当前已维护的专业主数据数量。' },
      { label: '启用专业', value: enabledCount, desc: '当前可用于班级和方案引用的专业数量。' },
      { label: '覆盖学院', value: new Set(majors.value.map((item) => item.collegeId)).size, desc: '已有专业归属的学院数量。' },
      { label: '关联班级', value: classes.value.length, desc: '当前已配置的班级数量。' }
    ];
  }
  if (entityType.value === 'grades') {
    return [
      { label: '年级总数', value: grades.value.length, desc: '当前已维护的年级数据数量。' },
      { label: '启用年级', value: enabledCount, desc: '当前可用于班级与学生关联的年级数量。' },
      { label: '入学届别', value: new Set(grades.value.map((item) => item.admissionYear)).size, desc: '已覆盖的入学年份数量。' },
      { label: '关联班级', value: new Set(classes.value.map((item) => item.gradeId)).size, desc: '已经建立班级关系的年级数量。' }
    ];
  }
  return [
    { label: '班级总数', value: classes.value.length, desc: '当前已维护的班级数量。' },
    { label: '启用班级', value: enabledCount, desc: '当前可供学生用户直接选择的班级数量。' },
    { label: '班主任已配置', value: classRows.value.filter((item) => item.headTeacherId).length, desc: '已分配班主任的班级数量。' },
    { label: '学生容量', value: classRows.value.reduce((sum, item) => sum + Number(item.studentCount || 0), 0), desc: '班级配置中的学生人数总计。' }
  ];
});

const dialogRules = computed(() => ({
  collegeName: [{ required: entityType.value === 'colleges', message: '请输入学院名称', trigger: 'blur' }],
  majorName: [{ required: entityType.value === 'majors', message: '请输入专业名称', trigger: 'blur' }],
  gradeYear: [{ required: entityType.value === 'grades', message: '请输入年级', trigger: 'change' }],
  className: [{ required: entityType.value === 'classes', message: '请输入班级名称', trigger: 'blur' }],
  collegeId: [{ required: ['majors', 'classes'].includes(entityType.value), message: '请选择所属学院', trigger: 'change' }],
  majorId: [{ required: entityType.value === 'classes', message: '请选择所属专业', trigger: 'change' }],
  gradeId: [{ required: entityType.value === 'classes', message: '请选择所属年级', trigger: 'change' }]
}));

watch(
  () => props.initialTab,
  () => {
    resetFilters();
  }
);

watch(
  () => filters.collegeId,
  () => {
    if (entityType.value === 'classes' && !filterMajorOptions.value.some((item) => item.id === filters.majorId)) {
      filters.majorId = null;
    }
  }
);

watch(
  () => dialogForm.collegeId,
  () => {
    if (entityType.value === 'classes' && !dialogMajorOptions.value.some((item) => item.id === dialogForm.majorId)) {
      dialogForm.majorId = null;
    }
  }
);

onMounted(() => {
  reloadAll();
});

function createDialogForm() {
  const year = new Date().getFullYear();
  return {
    id: null,
    collegeCode: '',
    collegeName: '',
    majorCode: '',
    majorName: '',
    degreeType: '本科',
    gradeYear: year,
    admissionYear: year,
    expectedGraduationYear: year + 4,
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

function formatGradeLabel(value) {
  if (!value) {
    return '';
  }
  const text = String(value);
  return text.endsWith('级') ? text : `${text}级`;
}

async function reloadAll() {
  loading.value = true;
  try {
    const [collegeRows, majorRows, gradeRows, classRowsResponse, orgOptions] = await Promise.all([
      request.get('/org/colleges'),
      request.get('/org/majors'),
      request.get('/org/grades'),
      request.get('/org/classes'),
      request.get('/org/options')
    ]);

    colleges.value = collegeRows || [];
    majors.value = majorRows || [];
    grades.value = gradeRows || [];
    classes.value = classRowsResponse || [];
    options.colleges = orgOptions.colleges || [];
    options.majors = orgOptions.majors || [];
    options.grades = orgOptions.grades || [];
    options.teachers = orgOptions.teachers || [];
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.keyword = '';
  filters.status = '';
  filters.collegeId = null;
  filters.majorId = null;
  filters.gradeId = null;
}

function openCreateDialog() {
  dialogMode.value = 'create';
  Object.assign(dialogForm, createDialogForm());
  dialogFormRef.value?.clearValidate?.();
  dialogVisible.value = true;
}

function openEditDialog(row) {
  dialogMode.value = 'edit';
  const major = row.majorId ? majorMap.value.get(row.majorId) : null;
  Object.assign(dialogForm, createDialogForm(), row, {
    collegeId: row.collegeId ?? major?.collegeId ?? row.collegeId ?? null,
    status: Number(row.status ?? 1),
    studentCount: Number(row.studentCount ?? 0),
    sortNo: Number(row.sortNo ?? 0),
    gradeYear: Number(row.gradeYear ?? new Date().getFullYear()),
    admissionYear: Number(row.admissionYear ?? new Date().getFullYear()),
    expectedGraduationYear: Number(row.expectedGraduationYear ?? new Date().getFullYear() + 4)
  });
  dialogFormRef.value?.clearValidate?.();
  dialogVisible.value = true;
}

function buildPayload() {
  if (entityType.value === 'colleges') {
    return {
      collegeCode: dialogForm.collegeCode,
      collegeName: dialogForm.collegeName,
      sortNo: Number(dialogForm.sortNo || 0),
      status: Number(dialogForm.status),
      remark: dialogForm.remark
    };
  }

  if (entityType.value === 'majors') {
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

  if (entityType.value === 'grades') {
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
  const base = baseMap[entityType.value];
  return id ? `${base}/${id}` : base;
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
      ElMessage.success(`${currentEntityLabel.value}新增成功`);
    } else {
      await request.put(buildEndpoint(dialogForm.id), payload);
      ElMessage.success(`${currentEntityLabel.value}更新成功`);
    }
    dialogVisible.value = false;
    await reloadAll();
  } finally {
    saving.value = false;
  }
}

async function removeRow(row) {
  try {
    await ElMessageBox.confirm(
      `确认删除${currentEntityLabel.value}“${resolveRowName(row)}”吗？`,
      '删除确认',
      { type: 'warning' }
    );
  } catch {
    return;
  }

  await request.delete(buildEndpoint(row.id));
  ElMessage.success('删除成功');
  await reloadAll();
}

function resolveRowName(row) {
  if (entityType.value === 'colleges') {
    return row.collegeName || '';
  }
  if (entityType.value === 'majors') {
    return row.majorName || '';
  }
  if (entityType.value === 'grades') {
    return formatGradeLabel(row.gradeYear);
  }
  return row.className || '';
}
</script>

<style scoped>
.org-panel-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.org-note-list {
  display: grid;
  gap: 12px;
}

.org-note-item {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(30, 136, 229, 0.08);
  color: var(--text-primary);
  line-height: 1.8;
}

.org-relation-card {
  display: grid;
  gap: 12px;
  min-height: 100%;
  align-content: center;
  padding: 8px 0;
}

.org-relation-card__title {
  font-size: 18px;
  font-weight: 700;
}

.org-relation-card__text {
  color: var(--text-secondary);
  line-height: 1.8;
}

.org-filter-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.org-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

@media (max-width: 900px) {
  .org-panel-grid,
  .org-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
