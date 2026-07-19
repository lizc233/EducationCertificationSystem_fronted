<template>
  <StandardPage
    title="用户管理"
    :breadcrumbs="['首页', '用户管理', '用户管理']"
    description="统一维护系统用户账号与组织架构基础数据。"
  >
    <section class="section-card tabs-card">
      <el-tabs v-model="activeTab" @tab-change="normalizeUsersRoute">
        <el-tab-pane label="用户管理" name="users" />
        <el-tab-pane label="学院管理" name="colleges" />
        <el-tab-pane label="专业管理" name="majors" />
        <el-tab-pane label="年级管理" name="grades" />
        <el-tab-pane label="班级管理" name="classes" />
      </el-tabs>
    </section>

    <section class="section-card page-heading-card">
      <div class="page-heading-card__title">{{ currentPanelTitle }}</div>
      <div class="page-heading-card__desc">{{ currentPanelDesc }}</div>
    </section>

    <template v-if="activeTab === 'users'">
      <section class="page-kpis">
        <article v-for="card in userCards" :key="card.label" class="page-kpi">
          <div class="page-kpi__label">{{ card.label }}</div>
          <div class="page-kpi__value">{{ card.value }}</div>
          <div class="page-kpi__desc">{{ card.desc }}</div>
        </article>
      </section>

      <section class="section-card">
        <el-form :inline="true" :model="userFilters" class="filter-form">
          <el-form-item>
            <el-input
              v-model.trim="userFilters.keyword"
              placeholder="请输入姓名、账号、手机号或邮箱"
              clearable
              style="width: 280px"
            />
          </el-form-item>
          <el-form-item>
            <el-select
              v-model="userFilters.userType"
              placeholder="用户类型"
              clearable
              style="width: 160px"
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="userFilters.status" placeholder="状态" clearable style="width: 140px">
              <el-option label="全部" value="" />
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="applyUserFilters">搜索</el-button>
            <el-button @click="resetUserFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section class="section-card">
        <div class="action-bar">
          <el-button type="primary" @click="openUserDialog()">新增用户</el-button>
          <el-button @click="exportUsers">导出</el-button>
        </div>

        <el-table v-loading="userLoading" :data="userRows" border stripe empty-text="暂无数据">
          <el-table-column label="序号" width="72" align="center">
            <template #default="{ $index }">
              {{ (userPager.page - 1) * userPager.size + $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="accountId" label="账号" min-width="140" />
          <el-table-column prop="realName" label="姓名" min-width="120" />
          <el-table-column label="用户类型" min-width="110">
            <template #default="{ row }">
              <el-tag :type="typeTag(row.role)" effect="light">{{ typeLabel(row.role) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="department" label="所属组织" min-width="200" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="Number(row.status) === 1 ? 'success' : 'info'" effect="light">
                {{ Number(row.status) === 1 ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" min-width="170" />
          <el-table-column label="操作" min-width="220" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openUserDialog(row)">编辑</el-button>
              <el-button type="primary" link @click="toggleUserStatus(row)">
                {{ Number(row.status) === 1 ? '停用' : '启用' }}
              </el-button>
              <el-button type="danger" link @click="removeUser(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="crud-pagination">
          <el-pagination
            v-model:current-page="userPager.page"
            v-model:page-size="userPager.size"
            background
            layout="total, sizes, prev, pager, next"
            :page-sizes="[5, 10, 20, 50]"
            :total="userPager.total"
            @current-change="loadUsers"
            @size-change="handleUserPageSize"
          />
        </div>
      </section>
    </template>

    <template v-else>
      <section class="page-kpis">
        <article v-for="card in orgCards" :key="card.label" class="page-kpi">
          <div class="page-kpi__label">{{ card.label }}</div>
          <div class="page-kpi__value">{{ card.value }}</div>
          <div class="page-kpi__desc">{{ card.desc }}</div>
        </article>
      </section>

      <section class="section-card">
        <el-form :inline="true" class="filter-form">
          <el-form-item>
            <el-input
              v-model.trim="currentFilter.keyword"
              :placeholder="currentFilterPlaceholder"
              clearable
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item v-if="activeTab === 'majors'">
            <el-select
              v-model="filters.majors.collegeId"
              placeholder="所属学院"
              clearable
              style="width: 180px"
            >
              <el-option label="全部" value="" />
              <el-option v-for="item in collegeOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="activeTab === 'grades'">
            <el-select
              v-model="filters.grades.majorId"
              placeholder="所属专业"
              clearable
              style="width: 220px"
            >
              <el-option label="全部" value="" />
              <el-option v-for="item in majorOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="activeTab === 'classes'">
            <el-select
              v-model="filters.classes.gradeName"
              placeholder="所属年级"
              clearable
              style="width: 160px"
            >
              <el-option label="全部" value="" />
              <el-option label="2025级" value="2025级" />
              <el-option label="2024级" value="2024级" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="activeTab === 'classes'">
            <el-select
              v-model="filters.classes.majorId"
              placeholder="所属专业"
              clearable
              style="width: 220px"
            >
              <el-option label="全部" value="" />
              <el-option v-for="item in majorOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="currentFilter.status" placeholder="状态" clearable style="width: 140px">
              <el-option label="全部" value="" />
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="currentPager.page = 1">搜索</el-button>
            <el-button @click="resetOrgFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section class="section-card">
        <div class="action-bar">
          <el-button type="primary" @click="openOrgDialog()">新增{{ currentLabel }}</el-button>
          <el-button @click="ElMessage.info(`导入${currentLabel}功能预留`)">导入{{ currentLabel }}</el-button>
          <el-button @click="exportOrg">导出</el-button>
        </div>

        <el-table :data="currentPageRows" border stripe empty-text="暂无数据">
          <el-table-column label="序号" width="72" align="center">
            <template #default="{ $index }">
              {{ (currentPager.page - 1) * currentPager.size + $index + 1 }}
            </template>
          </el-table-column>

          <template v-if="activeTab === 'colleges'">
            <el-table-column prop="name" label="学院名称" min-width="180" />
            <el-table-column prop="code" label="学院编码" min-width="130" />
            <el-table-column prop="majorCount" label="专业数量" width="100" align="center" />
            <el-table-column prop="teacherCount" label="教师人数" width="100" align="center" />
            <el-table-column prop="studentCount" label="学生人数" width="100" align="center" />
          </template>

          <template v-else-if="activeTab === 'majors'">
            <el-table-column prop="name" label="专业名称" min-width="180" />
            <el-table-column prop="code" label="专业编码" min-width="130" />
            <el-table-column prop="collegeName" label="所属学院" min-width="160" />
            <el-table-column prop="gradeCount" label="年级数量" width="100" align="center" />
            <el-table-column prop="classCount" label="班级数量" width="100" align="center" />
          </template>

          <template v-else-if="activeTab === 'grades'">
            <el-table-column prop="name" label="年级名称" min-width="120" />
            <el-table-column prop="majorName" label="所属专业" min-width="180" />
            <el-table-column prop="collegeName" label="所属学院" min-width="160" />
            <el-table-column prop="classCount" label="班级数量" width="100" align="center" />
          </template>

          <template v-else>
            <el-table-column prop="name" label="班级名称" min-width="150" />
            <el-table-column prop="code" label="班级编码" min-width="130" />
            <el-table-column prop="gradeName" label="所属年级" min-width="110" />
            <el-table-column prop="majorName" label="所属专业" min-width="180" />
            <el-table-column prop="collegeName" label="所属学院" min-width="160" />
          </template>

          <el-table-column label="状态" width="96" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="light">
                {{ row.status === 1 ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" min-width="170" />
          <el-table-column label="操作" min-width="220" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openOrgDialog(row)">编辑</el-button>
              <el-button type="primary" link @click="toggleOrgStatus(row)">
                {{ row.status === 1 ? '停用' : '启用' }}
              </el-button>
              <el-button type="danger" link @click="removeOrg(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="crud-pagination">
          <el-pagination
            v-model:current-page="currentPager.page"
            v-model:page-size="currentPager.size"
            background
            layout="total, sizes, prev, pager, next"
            :page-sizes="[5, 10, 20, 50]"
            :total="currentRows.length"
            @size-change="currentPager.page = 1"
          />
        </div>
      </section>
    </template>

    <el-dialog v-model="userDialog.visible" :title="userDialog.id ? '编辑用户' : '新增用户'" width="620px">
      <el-form ref="userFormRef" :model="userDialog" :rules="userRules" label-width="88px">
        <el-form-item label="用户类型" prop="role">
          <el-select v-model="userDialog.role" class="w-full">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号" prop="accountId">
          <el-input v-model.trim="userDialog.accountId" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model.trim="userDialog.realName" placeholder="请输入姓名" />
        </el-form-item>

        <template v-if="userDialog.role === 'ROLE_TEACHER'">
          <el-form-item label="所属学院" prop="collegeId">
            <el-select v-model="userDialog.collegeId" class="w-full" placeholder="请选择所属学院">
              <el-option v-for="item in collegeOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
        </template>

        <template v-else-if="userDialog.role === 'ROLE_STUDENT'">
          <el-form-item label="所属学院" prop="collegeId">
            <el-select v-model="userDialog.collegeId" class="w-full" placeholder="请选择所属学院">
              <el-option v-for="item in collegeOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属专业" prop="majorId">
            <el-select
              v-model="userDialog.majorId"
              class="w-full"
              placeholder="请选择所属专业"
              :disabled="!userDialog.collegeId"
            >
              <el-option v-for="item in userMajorOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属年级" prop="gradeId">
            <el-select
              v-model="userDialog.gradeId"
              class="w-full"
              placeholder="请选择所属年级"
              :disabled="!userDialog.majorId"
            >
              <el-option v-for="item in userGradeOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属班级" prop="classId">
            <el-select
              v-model="userDialog.classId"
              class="w-full"
              placeholder="请选择所属班级"
              :disabled="!userDialog.gradeId"
            >
              <el-option v-for="item in userClassOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model.trim="userDialog.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model.trim="userDialog.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="userSaving" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="orgDialog.visible" :title="orgDialog.id ? `编辑${currentLabel}` : `新增${currentLabel}`" width="620px">
      <el-form ref="orgFormRef" :model="orgDialog" :rules="orgRules" label-width="88px">
        <template v-if="activeTab === 'colleges'">
          <el-form-item label="学院名称" prop="name">
            <el-input v-model.trim="orgDialog.name" placeholder="请输入学院名称" />
          </el-form-item>
          <el-form-item label="学院编码" prop="code">
            <el-input v-model.trim="orgDialog.code" placeholder="请输入学院编码" />
          </el-form-item>
        </template>

        <template v-else-if="activeTab === 'majors'">
          <el-form-item label="专业名称" prop="name">
            <el-input v-model.trim="orgDialog.name" placeholder="请输入专业名称" />
          </el-form-item>
          <el-form-item label="专业编码" prop="code">
            <el-input v-model.trim="orgDialog.code" placeholder="请输入专业编码" />
          </el-form-item>
          <el-form-item label="所属学院" prop="collegeId">
            <el-select v-model="orgDialog.collegeId" class="w-full">
              <el-option v-for="item in collegeOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
        </template>

        <template v-else-if="activeTab === 'grades'">
          <el-form-item label="年级名称" prop="name">
            <el-input v-model.trim="orgDialog.name" placeholder="请输入年级名称" />
          </el-form-item>
          <el-form-item label="所属专业" prop="majorId">
            <el-select v-model="orgDialog.majorId" class="w-full">
              <el-option v-for="item in majorOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="班级名称" prop="name">
            <el-input v-model.trim="orgDialog.name" placeholder="请输入班级名称" />
          </el-form-item>
          <el-form-item label="班级编码" prop="code">
            <el-input v-model.trim="orgDialog.code" placeholder="请输入班级编码" />
          </el-form-item>
          <el-form-item label="所属年级" prop="gradeId">
            <el-select v-model="orgDialog.gradeId" class="w-full">
              <el-option v-for="item in gradeDialogOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item label="状态" prop="status">
          <el-select v-model="orgDialog.status" class="w-full">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model.trim="orgDialog.remark" type="textarea" :rows="3" placeholder="请输入说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orgDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="orgSaving" @click="saveOrg">保存</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../components/page/StandardPage.vue';
import request from '../utils/request';

const props = defineProps({
  initialTab: {
    type: String,
    default: 'users'
  }
});

const route = useRoute();
const router = useRouter();
const activeTab = ref(['users', 'colleges', 'majors', 'grades', 'classes'].includes(props.initialTab) ? props.initialTab : 'users');

const typeOptions = [
  { label: '管理员', value: 'ROLE_SUPER_ADMIN' },
  { label: '教师', value: 'ROLE_TEACHER' },
  { label: '学生', value: 'ROLE_STUDENT' }
];

const userLoading = ref(false);
const userSaving = ref(false);
const userRows = ref([]);
const userSnapshot = ref([]);
const userPager = reactive({ page: 1, size: 10, total: 0 });
const userFilters = reactive({ keyword: '', userType: '', status: '' });
const userDialog = reactive({
  visible: false,
  id: null,
  role: 'ROLE_TEACHER',
  accountId: '',
  realName: '',
  department: '',
  phone: '',
  email: '',
  collegeId: null,
  majorId: null,
  gradeId: null,
  classId: null,
  admissionYear: null
});
const userFormRef = ref();

const filters = reactive({
  colleges: { keyword: '', status: '' },
  majors: { keyword: '', collegeId: '', status: '' },
  grades: { keyword: '', majorId: '', status: '' },
  classes: { keyword: '', gradeName: '', majorId: '', status: '' }
});
const pagers = reactive({
  colleges: { page: 1, size: 10 },
  majors: { page: 1, size: 10 },
  grades: { page: 1, size: 10 },
  classes: { page: 1, size: 10 }
});

const orgSaving = ref(false);
const orgDialog = reactive({
  visible: false,
  id: null,
  name: '',
  code: '',
  collegeId: null,
  majorId: null,
  gradeId: null,
  status: 1,
  remark: '',
  studentCount: 0,
  admissionYear: null,
  expectedGraduationYear: null
});
const orgFormRef = ref();

const orgState = reactive({
  colleges: [],
  majors: [],
  grades: [],
  classes: [],
  teacherBindings: [],
  studentBindings: []
});

const currentLabel = computed(() => ({
  colleges: '学院',
  majors: '专业',
  grades: '年级',
  classes: '班级'
}[activeTab.value] || '学院'));

const currentPanelTitle = computed(() => ({
  users: '用户管理',
  colleges: '学院管理',
  majors: '专业管理',
  grades: '年级管理',
  classes: '班级管理'
}[activeTab.value] || '用户管理'));

const currentPanelDesc = computed(() => ({
  users: '统一维护系统用户账号信息，并支持教师、学生组织归属配置。',
  colleges: '维护学院基础信息，支撑专业、年级和班级数据管理。',
  majors: '维护专业基础信息及所属学院关系。',
  grades: '维护年级基础信息及所属专业关系。',
  classes: '维护班级基础信息及年级、专业关联。'
}[activeTab.value] || '统一维护系统用户账号信息，并支持教师、学生组织归属配置。'));

const currentFilter = computed(() => filters[activeTab.value] || filters.colleges);
const currentPager = computed(() => pagers[activeTab.value] || pagers.colleges);
const currentFilterPlaceholder = computed(() => ({
  colleges: '请输入学院名称',
  majors: '请输入专业名称',
  grades: '请输入年级名称',
  classes: '请输入班级名称'
}[activeTab.value] || '请输入名称'));

const collegeMap = computed(() => new Map(orgState.colleges.map((item) => [Number(item.id), item])));
const majorMap = computed(() => new Map(orgState.majors.map((item) => [Number(item.id), item])));
const gradeMap = computed(() => new Map(orgState.grades.map((item) => [Number(item.id), item])));
const classMap = computed(() => new Map(orgState.classes.map((item) => [Number(item.id), item])));

const collegeRows = computed(() => orgState.colleges.map((item) => ({
  ...item,
  majorCount: orgState.majors.filter((major) => Number(major.collegeId) === Number(item.id)).length,
  teacherCount: orgState.teacherBindings.filter((teacher) => Number(teacher.collegeId) === Number(item.id)).length,
  studentCount: orgState.studentBindings.filter((student) => {
    const clazz = orgState.classes.find((classItem) => Number(classItem.id) === Number(student.classId));
    const major = clazz ? majorMap.value.get(Number(clazz.majorId)) : null;
    return major && Number(major.collegeId) === Number(item.id);
  }).length
})));

const majorRows = computed(() => orgState.majors.map((item) => ({
  ...item,
  collegeName: item.collegeName || collegeMap.value.get(Number(item.collegeId))?.name || '',
  gradeCount: orgState.grades.filter((grade) => Number(grade.majorId) === Number(item.id)).length,
  classCount: orgState.classes.filter((clazz) => Number(clazz.majorId) === Number(item.id)).length
})));

const gradeRows = computed(() => orgState.grades.map((item) => ({
  ...item,
  majorName: item.majorName || majorMap.value.get(Number(item.majorId))?.name || '',
  collegeName: item.collegeName || collegeMap.value.get(Number(majorMap.value.get(Number(item.majorId))?.collegeId))?.name || '',
  classCount: orgState.classes.filter((clazz) => Number(clazz.gradeId) === Number(item.id)).length
})));

const classRows = computed(() => orgState.classes.map((item) => ({
  ...item,
  gradeName: item.gradeName || gradeMap.value.get(Number(item.gradeId))?.name || '',
  majorName: item.majorName || majorMap.value.get(Number(item.majorId))?.name || '',
  collegeName: item.collegeName || collegeMap.value.get(Number(majorMap.value.get(Number(item.majorId))?.collegeId))?.name || ''
})));

const collegeOptions = computed(() => collegeRows.value.map((item) => ({ id: item.id, label: item.name })));
const majorOptions = computed(() => majorRows.value.map((item) => ({ id: item.id, label: item.name })));
const gradeDialogOptions = computed(() => gradeRows.value.map((item) => ({ id: item.id, label: `${item.name} / ${item.majorName}` })));

const userMajorOptions = computed(() => majorRows.value
  .filter((item) => !userDialog.collegeId || Number(item.collegeId) === Number(userDialog.collegeId))
  .map((item) => ({ id: item.id, label: item.name })));

const userGradeOptions = computed(() => gradeRows.value
  .filter((item) => !userDialog.majorId || Number(item.majorId) === Number(userDialog.majorId))
  .map((item) => ({ id: item.id, label: `${item.name} / ${item.majorName}` })));

const userClassOptions = computed(() => classRows.value
  .filter((item) => (!userDialog.majorId || Number(item.majorId) === Number(userDialog.majorId))
    && (!userDialog.gradeId || Number(item.gradeId) === Number(userDialog.gradeId)))
  .map((item) => ({ id: item.id, label: `${item.name} / ${item.gradeName}` })));

const userRules = computed(() => {
  const rules = {
    role: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
    accountId: [{ required: true, message: '请输入账号', trigger: 'blur' }],
    realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
  };

  if (userDialog.role === 'ROLE_TEACHER') {
    rules.collegeId = [{ required: true, message: '请选择所属学院', trigger: 'change' }];
  } else if (userDialog.role === 'ROLE_STUDENT') {
    rules.collegeId = [{ required: true, message: '请选择所属学院', trigger: 'change' }];
    rules.majorId = [{ required: true, message: '请选择所属专业', trigger: 'change' }];
    rules.gradeId = [{ required: true, message: '请选择所属年级', trigger: 'change' }];
    rules.classId = [{ required: true, message: '请选择所属班级', trigger: 'change' }];
  }

  return rules;
});

const currentRows = computed(() => {
  const keyword = String(currentFilter.value.keyword || '').trim().toLowerCase();
  const status = currentFilter.value.status;
  const source = activeTab.value === 'colleges'
    ? collegeRows.value
    : activeTab.value === 'majors'
      ? majorRows.value
      : activeTab.value === 'grades'
        ? gradeRows.value
        : classRows.value;

  return source.filter((item) => {
    if (status !== '' && Number(item.status) !== Number(status)) return false;
    if (activeTab.value === 'majors' && filters.majors.collegeId && Number(item.collegeId) !== Number(filters.majors.collegeId)) return false;
    if (activeTab.value === 'grades' && filters.grades.majorId && Number(item.majorId) !== Number(filters.grades.majorId)) return false;
    if (activeTab.value === 'classes' && filters.classes.gradeName && item.gradeName !== filters.classes.gradeName) return false;
    if (activeTab.value === 'classes' && filters.classes.majorId && Number(item.majorId) !== Number(filters.classes.majorId)) return false;
    if (!keyword) return true;
    return Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(keyword));
  });
});

const currentPageRows = computed(() => currentRows.value.slice(
  (currentPager.value.page - 1) * currentPager.value.size,
  (currentPager.value.page - 1) * currentPager.value.size + currentPager.value.size
));

const userCards = computed(() => {
  const total = userSnapshot.value.length;
  const active = userSnapshot.value.filter((item) => Number(item.status) === 1).length;
  const admins = userSnapshot.value.filter((item) => item.role === 'ROLE_SUPER_ADMIN').length;
  const teachers = userSnapshot.value.filter((item) => item.role === 'ROLE_TEACHER').length;
  const students = userSnapshot.value.filter((item) => item.role === 'ROLE_STUDENT').length;

  return [
    { label: '用户总数', value: total, desc: '当前系统中的全部账号数量。' },
    { label: '启用账号', value: active, desc: '当前允许登录系统的账号数量。' },
    { label: '管理员 / 教师', value: `${admins} / ${teachers}`, desc: '管理员与教师账号分布。' },
    { label: '学生账号', value: students, desc: '学生账号数量统计。' }
  ];
});

const orgCards = computed(() => {
  if (activeTab.value === 'colleges') {
    return [
      { label: '学院总数', value: collegeRows.value.length, desc: '当前维护的学院数量。' },
      { label: '启用学院', value: collegeRows.value.filter((item) => item.status === 1).length, desc: '当前处于启用状态的学院数量。' },
      { label: '教师所属学院', value: collegeRows.value.filter((item) => item.teacherCount > 0).length, desc: '已有教师归属数据的学院数量。' },
      { label: '学生所属学院', value: collegeRows.value.filter((item) => item.studentCount > 0).length, desc: '已有学生归属数据的学院数量。' }
    ];
  }

  if (activeTab.value === 'majors') {
    return [
      { label: '专业总数', value: majorRows.value.length, desc: '当前维护的专业数量。' },
      { label: '启用专业', value: majorRows.value.filter((item) => item.status === 1).length, desc: '当前处于启用状态的专业数量。' },
      { label: '关联学院', value: new Set(majorRows.value.map((item) => item.collegeId)).size, desc: '已有专业归属的学院数量。' },
      { label: '关联班级', value: classRows.value.length, desc: '所有专业下的班级数量。' }
    ];
  }

  if (activeTab.value === 'grades') {
    return [
      { label: '年级总数', value: new Set(gradeRows.value.map((item) => item.name)).size, desc: '当前维护的年级名称数量。' },
      { label: '启用年级', value: new Set(gradeRows.value.filter((item) => item.status === 1).map((item) => item.name)).size, desc: '当前处于启用状态的年级数量。' },
      { label: '关联专业', value: new Set(gradeRows.value.map((item) => item.majorId)).size, desc: '已有年级数据的专业数量。' },
      { label: '关联班级', value: classRows.value.length, desc: '所有年级下的班级数量。' }
    ];
  }

  return [
    { label: '班级总数', value: classRows.value.length, desc: '当前维护的班级数量。' },
    { label: '启用班级', value: classRows.value.filter((item) => item.status === 1).length, desc: '当前处于启用状态的班级数量。' },
    { label: '关联年级', value: new Set(gradeRows.value.map((item) => item.name)).size, desc: '可供班级使用的年级数量。' },
    { label: '关联专业', value: new Set(classRows.value.map((item) => item.majorId)).size, desc: '已建立班级数据的专业数量。' }
  ];
});

const orgRules = computed(() => {
  if (activeTab.value === 'colleges') {
    return {
      name: [{ required: true, message: '请输入学院名称', trigger: 'blur' }],
      code: [{ required: true, message: '请输入学院编码', trigger: 'blur' }]
    };
  }
  if (activeTab.value === 'majors') {
    return {
      name: [{ required: true, message: '请输入专业名称', trigger: 'blur' }],
      code: [{ required: true, message: '请输入专业编码', trigger: 'blur' }],
      collegeId: [{ required: true, message: '请选择所属学院', trigger: 'change' }]
    };
  }
  if (activeTab.value === 'grades') {
    return {
      name: [{ required: true, message: '请输入年级名称', trigger: 'blur' }],
      majorId: [{ required: true, message: '请选择所属专业', trigger: 'change' }]
    };
  }
  return {
    name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入班级编码', trigger: 'blur' }],
    gradeId: [{ required: true, message: '请选择所属年级', trigger: 'change' }]
  };
});

onMounted(() => {
  normalizeUsersRoute();
  loadUsers();
  loadOrgData();
});

watch(() => userDialog.role, async (role, previousRole) => {
  if (role === 'ROLE_SUPER_ADMIN') {
    userDialog.collegeId = null;
    userDialog.majorId = null;
    userDialog.gradeId = null;
    userDialog.classId = null;
    userDialog.admissionYear = null;
  } else if (role === 'ROLE_TEACHER') {
    userDialog.gradeId = null;
    userDialog.classId = null;
    userDialog.admissionYear = null;
  }

  await nextTick();
  userFormRef.value?.clearValidate();
});

watch(() => userDialog.collegeId, (collegeId) => {
  if (!collegeId) {
    userDialog.majorId = null;
    if (userDialog.role === 'ROLE_STUDENT') {
      userDialog.gradeId = null;
      userDialog.classId = null;
      userDialog.admissionYear = null;
    }
    return;
  }

  const selectedMajor = majorMap.value.get(Number(userDialog.majorId));
  if (selectedMajor && Number(selectedMajor.collegeId) !== Number(collegeId)) {
    userDialog.majorId = null;
  }
});

watch(() => userDialog.majorId, (majorId) => {
  if (!majorId) {
    if (userDialog.role === 'ROLE_STUDENT') {
      userDialog.gradeId = null;
      userDialog.classId = null;
      userDialog.admissionYear = null;
    }
    return;
  }

  const selectedMajor = majorMap.value.get(Number(majorId));
  if (selectedMajor && Number(userDialog.collegeId) !== Number(selectedMajor.collegeId)) {
    userDialog.collegeId = selectedMajor.collegeId;
  }

  const selectedGrade = gradeMap.value.get(Number(userDialog.gradeId));
  if (selectedGrade && Number(selectedGrade.majorId) !== Number(majorId)) {
    userDialog.gradeId = null;
  }

  const selectedClass = classMap.value.get(Number(userDialog.classId));
  if (selectedClass && Number(selectedClass.majorId) !== Number(majorId)) {
    userDialog.classId = null;
  }
});

watch(() => userDialog.gradeId, (gradeId) => {
  if (!gradeId) {
    userDialog.classId = null;
    userDialog.admissionYear = null;
    return;
  }

  const selectedGrade = gradeMap.value.get(Number(gradeId));
  if (!selectedGrade) return;

  userDialog.majorId = selectedGrade.majorId;
  userDialog.admissionYear = Number(selectedGrade.admissionYear || selectedGrade.gradeYear);

  const selectedMajor = majorMap.value.get(Number(selectedGrade.majorId));
  if (selectedMajor) {
    userDialog.collegeId = selectedMajor.collegeId;
  }

  const selectedClass = classMap.value.get(Number(userDialog.classId));
  if (selectedClass && Number(selectedClass.gradeId) !== Number(gradeId)) {
    userDialog.classId = null;
  }
});

watch(() => userDialog.classId, (classId) => {
  if (!classId) return;

  const selectedClass = classMap.value.get(Number(classId));
  if (!selectedClass) return;

  userDialog.gradeId = selectedClass.gradeId;
  userDialog.majorId = selectedClass.majorId;

  const selectedGrade = gradeMap.value.get(Number(selectedClass.gradeId));
  if (selectedGrade) {
    userDialog.admissionYear = Number(selectedGrade.admissionYear || selectedGrade.gradeYear);
  }
});

function normalizeUsersRoute() {
  if (route.path !== '/users') router.replace('/users');
}

function typeLabel(role) {
  return typeOptions.find((item) => item.value === role)?.label || role;
}

function typeTag(role) {
  return role === 'ROLE_SUPER_ADMIN' ? 'danger' : role === 'ROLE_TEACHER' ? 'warning' : 'success';
}

function toNullableNumber(value) {
  return value === null || value === undefined || value === '' ? null : Number(value);
}

function buildUserDepartment(role = userDialog.role) {
  if (role === 'ROLE_SUPER_ADMIN') return '';

  const collegeName = collegeMap.value.get(Number(userDialog.collegeId))?.name || '';
  const majorName = majorMap.value.get(Number(userDialog.majorId))?.name || '';
  const gradeName = gradeMap.value.get(Number(userDialog.gradeId))?.name || '';
  const className = classMap.value.get(Number(userDialog.classId))?.name || '';

  if (role === 'ROLE_TEACHER') {
    return collegeName;
  }
  if (role === 'ROLE_STUDENT') {
    return [collegeName, majorName, gradeName, className].filter(Boolean).join(' / ');
  }
  return '';
}

async function loadUsers() {
  userLoading.value = true;
  try {
    const [page, snapshotPage] = await Promise.all([
      request.get('/user/list', {
        params: {
          pageNum: userPager.page,
          pageSize: userPager.size,
          keyword: userFilters.keyword || undefined,
          role: userFilters.userType || undefined,
          status: userFilters.status === '' ? undefined : Number(userFilters.status)
        }
      }),
      request.get('/user/list', { params: { pageNum: 1, pageSize: 1000 } })
    ]);

    userRows.value = page.records || [];
    userSnapshot.value = snapshotPage.records || [];
    userPager.total = page.total || 0;
  } finally {
    userLoading.value = false;
  }
}

function applyUserFilters() {
  userPager.page = 1;
  loadUsers();
}

function resetUserFilters() {
  Object.assign(userFilters, { keyword: '', userType: '', status: '' });
  applyUserFilters();
}

function handleUserPageSize() {
  userPager.page = 1;
  loadUsers();
}

async function openUserDialog(row) {
  if (!orgState.colleges.length || !orgState.majors.length || !orgState.grades.length || !orgState.classes.length) {
    await loadOrgData();
  }

  const selectedClass = row?.classId ? classMap.value.get(Number(row.classId)) : null;
  const majorId = toNullableNumber(row?.majorId) ?? selectedClass?.majorId ?? null;
  const collegeId = toNullableNumber(row?.collegeId) ?? (majorId ? majorMap.value.get(Number(majorId))?.collegeId : null) ?? null;
  const gradeId = selectedClass?.gradeId ?? null;
  const admissionYear = row?.admissionYear ?? gradeMap.value.get(Number(gradeId))?.admissionYear ?? null;

  Object.assign(userDialog, {
    visible: true,
    id: row?.id || null,
    role: row?.role || 'ROLE_TEACHER',
    accountId: row?.accountId || '',
    realName: row?.realName || '',
    department: row?.department || '',
    phone: row?.phone || '',
    email: row?.email || '',
    collegeId,
    majorId,
    gradeId,
    classId: row?.classId || null,
    admissionYear
  });

  await nextTick();
  userFormRef.value?.clearValidate();
}

async function saveUser() {
  const valid = await userFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  userSaving.value = true;
  try {
    const payload = {
      role: userDialog.role,
      accountId: userDialog.accountId.trim(),
      realName: userDialog.realName.trim(),
      department: buildUserDepartment(userDialog.role),
      phone: userDialog.phone.trim(),
      email: userDialog.email.trim(),
      collegeId: userDialog.role === 'ROLE_SUPER_ADMIN' ? null : toNullableNumber(userDialog.collegeId),
      majorId: userDialog.role === 'ROLE_STUDENT' ? toNullableNumber(userDialog.majorId) : null,
      classId: userDialog.role === 'ROLE_STUDENT' ? toNullableNumber(userDialog.classId) : null,
      admissionYear: userDialog.role === 'ROLE_STUDENT' ? toNullableNumber(userDialog.admissionYear) : null
    };

    if (userDialog.id) {
      await request.put(`/user/${userDialog.id}`, payload);
      ElMessage.success('用户更新成功');
    } else {
      await request.post('/user', payload);
      ElMessage.success('用户新增成功');
    }

    userDialog.visible = false;
    await Promise.all([loadUsers(), loadOrgData()]);
  } finally {
    userSaving.value = false;
  }
}

async function toggleUserStatus(row) {
  await request.put(`/user/${row.id}/status`, { status: Number(row.status) === 1 ? 0 : 1 });
  ElMessage.success(`${row.realName} 已${Number(row.status) === 1 ? '停用' : '启用'}`);
  await loadUsers();
}

async function removeUser(row) {
  try {
    await ElMessageBox.confirm(`确认删除用户【${row.realName}】吗？`, '删除确认', { type: 'warning' });
  } catch {
    return;
  }

  await request.delete(`/user/${row.id}`);
  ElMessage.success('用户已删除');
  await Promise.all([loadUsers(), loadOrgData()]);
}

function exportUsers() {
  const lines = [
    '用户类型,账号,姓名,所属组织,状态,创建时间',
    ...userRows.value.map((item) => [
      typeLabel(item.role),
      item.accountId,
      item.realName,
      item.department,
      Number(item.status) === 1 ? '启用' : '停用',
      item.createdAt || ''
    ].join(','))
  ];
  downloadCsv(lines.join('\n'), `user-list-${new Date().toISOString().slice(0, 10)}.csv`);
}

async function loadOrgData() {
  const [colleges, majors, grades, classes, teacherBindings, studentBindings] = await Promise.all([
    request.get('/org/colleges'),
    request.get('/org/majors'),
    request.get('/org/grades'),
    request.get('/org/classes'),
    request.get('/org/teacher-bindings'),
    request.get('/org/student-bindings')
  ]);

  orgState.colleges = (colleges || []).map((item) => ({
    id: item.id,
    name: item.collegeName,
    code: item.collegeCode,
    status: Number(item.status),
    remark: item.remark || '',
    createdAt: item.createdAt || ''
  }));

  orgState.majors = (majors || []).map((item) => ({
    id: item.id,
    name: item.majorName,
    code: item.majorCode,
    collegeId: item.collegeId,
    collegeName: item.collegeName || '',
    status: Number(item.status),
    remark: item.remark || '',
    createdAt: item.createdAt || ''
  }));

  orgState.grades = (grades || []).map((item) => ({
    id: item.id,
    name: `${item.gradeYear}级`,
    majorId: item.majorId,
    majorName: item.majorName || '',
    collegeName: item.collegeName || '',
    gradeYear: Number(item.gradeYear),
    admissionYear: Number(item.admissionYear || item.gradeYear),
    expectedGraduationYear: Number(item.expectedGraduationYear || (Number(item.gradeYear) + 4)),
    status: Number(item.status),
    remark: item.remark || '',
    createdAt: item.createdAt || ''
  }));

  orgState.classes = (classes || []).map((item) => ({
    id: item.id,
    name: item.className,
    code: item.classCode,
    majorId: item.majorId,
    majorName: item.majorName || '',
    gradeId: item.gradeId,
    gradeName: item.gradeName || '',
    collegeName: item.collegeName || '',
    studentCount: Number(item.studentCount || 0),
    status: Number(item.status),
    remark: item.remark || '',
    createdAt: item.createdAt || ''
  }));

  orgState.teacherBindings = teacherBindings || [];
  orgState.studentBindings = studentBindings || [];
}

function resetOrgFilters() {
  Object.assign(
    filters[activeTab.value],
    activeTab.value === 'colleges'
      ? { keyword: '', status: '' }
      : activeTab.value === 'majors'
        ? { keyword: '', collegeId: '', status: '' }
        : activeTab.value === 'grades'
          ? { keyword: '', majorId: '', status: '' }
          : { keyword: '', gradeName: '', majorId: '', status: '' }
  );
  currentPager.value.page = 1;
}

function openOrgDialog(row) {
  Object.assign(orgDialog, {
    visible: true,
    id: row?.id || null,
    name: row?.name || '',
    code: row?.code || '',
    collegeId: row?.collegeId || null,
    majorId: row?.majorId || null,
    gradeId: row?.gradeId || null,
    status: row?.status ?? 1,
    remark: row?.remark || '',
    studentCount: row?.studentCount ?? 0,
    admissionYear: row?.admissionYear ?? null,
    expectedGraduationYear: row?.expectedGraduationYear ?? null
  });
}

async function saveOrg() {
  const valid = await orgFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  orgSaving.value = true;
  try {
    if (activeTab.value === 'colleges') {
      const payload = {
        collegeName: orgDialog.name.trim(),
        collegeCode: orgDialog.code.trim(),
        status: Number(orgDialog.status),
        remark: orgDialog.remark.trim()
      };
      if (orgDialog.id) {
        await request.put(`/org/colleges/${orgDialog.id}`, payload);
      } else {
        await request.post('/org/colleges', payload);
      }
      ElMessage.success(orgDialog.id ? '学院更新成功' : '学院新增成功');
    } else if (activeTab.value === 'majors') {
      const payload = {
        majorName: orgDialog.name.trim(),
        majorCode: orgDialog.code.trim(),
        collegeId: Number(orgDialog.collegeId),
        degreeType: '本科',
        status: Number(orgDialog.status),
        remark: orgDialog.remark.trim()
      };
      if (orgDialog.id) {
        await request.put(`/org/majors/${orgDialog.id}`, payload);
      } else {
        await request.post('/org/majors', payload);
      }
      ElMessage.success(orgDialog.id ? '专业更新成功' : '专业新增成功');
    } else if (activeTab.value === 'grades') {
      const gradeYear = Number(String(orgDialog.name || '').replace('级', '').trim());
      if (!Number.isInteger(gradeYear) || gradeYear <= 0) {
        ElMessage.error('年级名称请使用如“2025级”的格式');
        return;
      }
      const payload = {
        majorId: Number(orgDialog.majorId),
        gradeYear,
        admissionYear: gradeYear,
        expectedGraduationYear: gradeYear + 4,
        status: Number(orgDialog.status),
        remark: orgDialog.remark.trim()
      };
      if (orgDialog.id) {
        await request.put(`/org/grades/${orgDialog.id}`, payload);
      } else {
        await request.post('/org/grades', payload);
      }
      ElMessage.success(orgDialog.id ? '年级更新成功' : '年级新增成功');
    } else {
      const grade = gradeMap.value.get(Number(orgDialog.gradeId));
      if (!grade) {
        ElMessage.error('请选择所属年级');
        return;
      }
      const payload = {
        majorId: Number(grade.majorId),
        gradeId: Number(orgDialog.gradeId),
        className: orgDialog.name.trim(),
        classCode: orgDialog.code.trim(),
        headTeacherId: null,
        studentCount: Number(orgDialog.studentCount || 0),
        status: Number(orgDialog.status),
        remark: orgDialog.remark.trim()
      };
      if (orgDialog.id) {
        await request.put(`/org/classes/${orgDialog.id}`, payload);
      } else {
        await request.post('/org/classes', payload);
      }
      ElMessage.success(orgDialog.id ? '班级更新成功' : '班级新增成功');
    }

    orgDialog.visible = false;
    await loadOrgData();
  } finally {
    orgSaving.value = false;
  }
}

async function toggleOrgStatus(row) {
  if (activeTab.value === 'colleges') {
    await request.put(`/org/colleges/${row.id}`, {
      collegeName: row.name,
      collegeCode: row.code,
      status: row.status === 1 ? 0 : 1,
      remark: row.remark || ''
    });
  } else if (activeTab.value === 'majors') {
    await request.put(`/org/majors/${row.id}`, {
      majorName: row.name,
      majorCode: row.code,
      collegeId: row.collegeId,
      degreeType: '本科',
      status: row.status === 1 ? 0 : 1,
      remark: row.remark || ''
    });
  } else if (activeTab.value === 'grades') {
    await request.put(`/org/grades/${row.id}`, {
      majorId: row.majorId,
      gradeYear: row.gradeYear,
      admissionYear: row.admissionYear || row.gradeYear,
      expectedGraduationYear: row.expectedGraduationYear || row.gradeYear + 4,
      status: row.status === 1 ? 0 : 1,
      remark: row.remark || ''
    });
  } else {
    await request.put(`/org/classes/${row.id}`, {
      majorId: row.majorId,
      gradeId: row.gradeId,
      className: row.name,
      classCode: row.code,
      headTeacherId: null,
      studentCount: Number(row.studentCount || 0),
      status: row.status === 1 ? 0 : 1,
      remark: row.remark || ''
    });
  }

  ElMessage.success(`${currentLabel.value}已${row.status === 1 ? '停用' : '启用'}`);
  await loadOrgData();
}

async function removeOrg(row) {
  const message = activeTab.value === 'colleges'
    ? `确认删除【${row.name}】吗？该学院下的专业、年级、班级将一并删除。`
    : activeTab.value === 'majors'
      ? `确认删除【${row.name}】吗？该专业下的年级、班级将一并删除。`
      : activeTab.value === 'grades'
        ? `确认删除【${row.name}】吗？该年级下的班级将一并删除。`
        : `确认删除【${row.name}】吗？`;

  try {
    await ElMessageBox.confirm(message, '删除确认', { type: 'warning' });
  } catch {
    return;
  }

  const base = activeTab.value === 'colleges'
    ? '/org/colleges'
    : activeTab.value === 'majors'
      ? '/org/majors'
      : activeTab.value === 'grades'
        ? '/org/grades'
        : '/org/classes';

  await request.delete(`${base}/${row.id}`);
  ElMessage.success('删除成功');
  currentPager.value.page = 1;
  await loadOrgData();
}

function exportOrg() {
  const headers = activeTab.value === 'colleges'
    ? '学院名称,学院编码,专业数量,教师人数,学生人数,状态,创建时间'
    : activeTab.value === 'majors'
      ? '专业名称,专业编码,所属学院,年级数量,班级数量,状态,创建时间'
      : activeTab.value === 'grades'
        ? '年级名称,所属专业,所属学院,班级数量,状态,创建时间'
        : '班级名称,班级编码,所属年级,所属专业,所属学院,状态,创建时间';

  const body = currentRows.value.map((item) => {
    if (activeTab.value === 'colleges') {
      return [item.name, item.code, item.majorCount, item.teacherCount, item.studentCount, item.status === 1 ? '启用' : '停用', item.createdAt];
    }
    if (activeTab.value === 'majors') {
      return [item.name, item.code, item.collegeName, item.gradeCount, item.classCount, item.status === 1 ? '启用' : '停用', item.createdAt];
    }
    if (activeTab.value === 'grades') {
      return [item.name, item.majorName, item.collegeName, item.classCount, item.status === 1 ? '启用' : '停用', item.createdAt];
    }
    return [item.name, item.code, item.gradeName, item.majorName, item.collegeName, item.status === 1 ? '启用' : '停用', item.createdAt];
  }).map((row) => row.join(','));

  downloadCsv([headers, ...body].join('\n'), `${activeTab.value}-${new Date().toISOString().slice(0, 10)}.csv`);
}

function downloadCsv(content, fileName) {
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}
</script>

<style scoped>
.tabs-card {
  padding-bottom: 0;
}

.tabs-card :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.page-heading-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-heading-card__title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.page-heading-card__desc {
  color: #6b7280;
  font-size: 13px;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.action-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
</style>
