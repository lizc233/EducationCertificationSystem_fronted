<template>
  <StandardPage
    title="组织绑定"
    :breadcrumbs="['首页', '基础管理', '组织绑定']"
    description="维护教师与学生档案绑定关系，补齐用户、组织和学籍之间的映射。"
  >
    <template #actions>
      <el-button @click="loadAll" :loading="loading">刷新</el-button>
      <el-button type="primary" @click="openCreateDialog">
        新增{{ activeTab === 'teachers' ? '教师绑定' : '学生绑定' }}
      </el-button>
    </template>

    <section class="page-kpis">
      <article class="page-kpi">
        <div class="page-kpi__label">教师绑定</div>
        <div class="page-kpi__value">{{ teacherRows.length }}</div>
        <div class="page-kpi__desc">已建立教师用户和组织档案映射的记录数。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">学生绑定</div>
        <div class="page-kpi__value">{{ studentRows.length }}</div>
        <div class="page-kpi__desc">已建立学生用户和班级学籍映射的记录数。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">教师用户</div>
        <div class="page-kpi__value">{{ options.teacherUsers.length }}</div>
        <div class="page-kpi__desc">可用于绑定教师档案的老师账号数量。</div>
      </article>
      <article class="page-kpi">
        <div class="page-kpi__label">学生用户</div>
        <div class="page-kpi__value">{{ options.studentUsers.length }}</div>
        <div class="page-kpi__desc">可用于绑定学生档案的学生账号数量。</div>
      </article>
    </section>

    <SectionCard title="绑定维护">
      <template #extra>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="教师绑定" name="teachers" />
          <el-tab-pane label="学生绑定" name="students" />
        </el-tabs>
      </template>

      <el-table v-if="activeTab === 'teachers'" v-loading="loading" :data="teacherRows" border stripe>
        <el-table-column prop="realName" label="教师姓名" min-width="140" />
        <el-table-column prop="teacherNo" label="工号" min-width="140" />
        <el-table-column prop="collegeName" label="所属学院" min-width="160" />
        <el-table-column prop="majorName" label="所属专业" min-width="160" />
        <el-table-column prop="title" label="职称" min-width="120" />
        <el-table-column prop="jobTitle" label="岗位" min-width="120" />
        <el-table-column prop="phone" label="电话" min-width="140" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="Number(row.status) === 1 ? 'success' : 'info'" effect="light">
              {{ Number(row.status) === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-table v-else v-loading="loading" :data="studentRows" border stripe>
        <el-table-column prop="realName" label="学生姓名" min-width="140" />
        <el-table-column prop="studentNo" label="学号" min-width="140" />
        <el-table-column prop="className" label="所属班级" min-width="180" />
        <el-table-column prop="admissionYear" label="入学年份" min-width="110" />
        <el-table-column prop="gender" label="性别" min-width="90" />
        <el-table-column label="毕业状态" min-width="110" align="center">
          <template #default="{ row }">
            {{ Number(row.graduationStatus) === 1 ? '已毕业' : '在读' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="Number(row.status) === 1 ? 'success' : 'info'" effect="light">
              {{ Number(row.status) === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create'
        ? `新增${activeTab === 'teachers' ? '教师绑定' : '学生绑定'}`
        : `编辑${activeTab === 'teachers' ? '教师绑定' : '学生绑定'}`"
      width="720px"
      destroy-on-close
    >
      <el-form
        v-if="activeTab === 'teachers'"
        ref="teacherFormRef"
        :model="teacherForm"
        :rules="teacherRules"
        label-width="96px"
      >
        <div class="binding-form-grid">
          <el-form-item label="教师用户" prop="userId">
            <el-select v-model="teacherForm.userId" class="w-full" :disabled="dialogMode === 'edit'">
              <el-option v-for="item in options.teacherUsers" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="工号" prop="teacherNo">
            <el-input v-model.trim="teacherForm.teacherNo" />
          </el-form-item>
          <el-form-item label="所属学院" prop="collegeId">
            <el-select v-model="teacherForm.collegeId" class="w-full">
              <el-option v-for="item in options.colleges" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属专业" prop="majorId">
            <el-select v-model="teacherForm.majorId" clearable class="w-full">
              <el-option v-for="item in options.majors" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="职称" prop="title">
            <el-input v-model.trim="teacherForm.title" />
          </el-form-item>
          <el-form-item label="岗位" prop="jobTitle">
            <el-input v-model.trim="teacherForm.jobTitle" />
          </el-form-item>
          <el-form-item label="电话" prop="phone">
            <el-input v-model.trim="teacherForm.phone" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="teacherForm.email" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="teacherForm.status" class="w-full">
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="备注" prop="remark">
          <el-input v-model.trim="teacherForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <el-form
        v-else
        ref="studentFormRef"
        :model="studentForm"
        :rules="studentRules"
        label-width="96px"
      >
        <div class="binding-form-grid">
          <el-form-item label="学生用户" prop="userId">
            <el-select v-model="studentForm.userId" class="w-full" :disabled="dialogMode === 'edit'">
              <el-option v-for="item in options.studentUsers" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="学号" prop="studentNo">
            <el-input v-model.trim="studentForm.studentNo" />
          </el-form-item>
          <el-form-item label="所属班级" prop="classId">
            <el-select v-model="studentForm.classId" class="w-full">
              <el-option v-for="item in options.classes" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="入学年份" prop="admissionYear">
            <el-input-number v-model="studentForm.admissionYear" :min="2000" :max="2100" class="w-full" />
          </el-form-item>
          <el-form-item label="性别" prop="gender">
            <el-select v-model="studentForm.gender" class="w-full">
              <el-option label="男" value="男" />
              <el-option label="女" value="女" />
            </el-select>
          </el-form-item>
          <el-form-item label="毕业状态" prop="graduationStatus">
            <el-select v-model="studentForm.graduationStatus" class="w-full">
              <el-option label="在读" :value="0" />
              <el-option label="已毕业" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="studentForm.status" class="w-full">
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="备注" prop="remark">
          <el-input v-model.trim="studentForm.remark" type="textarea" :rows="3" />
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
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import request from '../../utils/request';

const loading = ref(false);
const saving = ref(false);
const activeTab = ref('teachers');
const dialogVisible = ref(false);
const dialogMode = ref('create');
const teacherFormRef = ref();
const studentFormRef = ref();
const teacherRows = ref([]);
const studentRows = ref([]);

const options = reactive({
  colleges: [],
  majors: [],
  classes: [],
  teacherUsers: [],
  studentUsers: []
});

const teacherForm = reactive(createTeacherForm());
const studentForm = reactive(createStudentForm());

const teacherRules = {
  userId: [{ required: true, message: '请选择教师用户', trigger: 'change' }],
  teacherNo: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  collegeId: [{ required: true, message: '请选择所属学院', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};

const studentRules = {
  userId: [{ required: true, message: '请选择学生用户', trigger: 'change' }],
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  classId: [{ required: true, message: '请选择所属班级', trigger: 'change' }],
  admissionYear: [{ required: true, message: '请输入入学年份', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};

onMounted(() => {
  loadAll();
});

function createTeacherForm() {
  return {
    id: null,
    userId: null,
    teacherNo: '',
    collegeId: null,
    majorId: null,
    title: '',
    jobTitle: '',
    phone: '',
    email: '',
    status: 1,
    remark: ''
  };
}

function createStudentForm() {
  return {
    id: null,
    userId: null,
    studentNo: '',
    classId: null,
    admissionYear: new Date().getFullYear(),
    gender: '男',
    status: 1,
    graduationStatus: 0,
    remark: ''
  };
}

async function loadAll() {
  loading.value = true;
  try {
    const [orgOptions, teachers, students] = await Promise.all([
      request.get('/org/options'),
      request.get('/org/teacher-bindings'),
      request.get('/org/student-bindings')
    ]);
    options.colleges = orgOptions.colleges || [];
    options.majors = orgOptions.majors || [];
    options.classes = orgOptions.classes || [];
    options.teacherUsers = orgOptions.teacherUsers || [];
    options.studentUsers = orgOptions.studentUsers || [];
    teacherRows.value = teachers || [];
    studentRows.value = students || [];
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  dialogMode.value = 'create';
  if (activeTab.value === 'teachers') {
    Object.assign(teacherForm, createTeacherForm());
    teacherFormRef.value?.clearValidate?.();
  } else {
    Object.assign(studentForm, createStudentForm());
    studentFormRef.value?.clearValidate?.();
  }
  dialogVisible.value = true;
}

function openEditDialog(row) {
  dialogMode.value = 'edit';
  if (activeTab.value === 'teachers') {
    Object.assign(teacherForm, createTeacherForm(), row, {
      status: Number(row.status ?? 1)
    });
    teacherFormRef.value?.clearValidate?.();
  } else {
    Object.assign(studentForm, createStudentForm(), row, {
      admissionYear: Number(row.admissionYear ?? new Date().getFullYear()),
      status: Number(row.status ?? 1),
      graduationStatus: Number(row.graduationStatus ?? 0)
    });
    studentFormRef.value?.clearValidate?.();
  }
  dialogVisible.value = true;
}

async function saveDialog() {
  if (activeTab.value === 'teachers') {
    const valid = await teacherFormRef.value?.validate().catch(() => false);
    if (!valid) {
      return;
    }
    await saveTeacher();
    return;
  }

  const valid = await studentFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  await saveStudent();
}

async function saveTeacher() {
  saving.value = true;
  try {
    const payload = {
      userId: teacherForm.userId,
      teacherNo: teacherForm.teacherNo,
      collegeId: teacherForm.collegeId,
      majorId: teacherForm.majorId,
      title: teacherForm.title,
      jobTitle: teacherForm.jobTitle,
      phone: teacherForm.phone,
      email: teacherForm.email,
      status: Number(teacherForm.status || 0),
      remark: teacherForm.remark
    };
    if (dialogMode.value === 'create') {
      await request.post('/org/teacher-bindings', payload);
      ElMessage.success('教师绑定新增成功');
    } else {
      await request.put(`/org/teacher-bindings/${teacherForm.id}`, payload);
      ElMessage.success('教师绑定更新成功');
    }
    dialogVisible.value = false;
    await loadAll();
  } finally {
    saving.value = false;
  }
}

async function saveStudent() {
  saving.value = true;
  try {
    const payload = {
      userId: studentForm.userId,
      studentNo: studentForm.studentNo,
      classId: studentForm.classId,
      admissionYear: Number(studentForm.admissionYear),
      gender: studentForm.gender,
      status: Number(studentForm.status || 0),
      graduationStatus: Number(studentForm.graduationStatus || 0),
      remark: studentForm.remark
    };
    if (dialogMode.value === 'create') {
      await request.post('/org/student-bindings', payload);
      ElMessage.success('学生绑定新增成功');
    } else {
      await request.put(`/org/student-bindings/${studentForm.id}`, payload);
      ElMessage.success('学生绑定更新成功');
    }
    dialogVisible.value = false;
    await loadAll();
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.binding-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

@media (max-width: 900px) {
  .binding-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
