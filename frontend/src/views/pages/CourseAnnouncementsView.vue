<template>
  <StandardPage
    title="课程公告"
    :breadcrumbs="['首页', '我的工作台', '课程公告']"
    description="向任课班级发布课程通知、教学提醒和作业安排，学生可在课程端查看。"
  >
    <template #actions>
      <el-button type="primary" :loading="loading.create" @click="openDialog()">新增公告</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="课程">
          <el-select v-model="filters.course" clearable style="width: 220px;">
            <el-option v-for="item in courseOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable style="width: 180px;">
            <el-option label="草稿" value="草稿" />
            <el-option label="已发布" value="已发布" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model.trim="filters.keyword" placeholder="搜索公告标题" clearable style="width: 220px;" />
        </el-form-item>
      </el-form>
    </template>

    <SectionCard title="课程公告列表">
      <el-table :data="filteredRows" border stripe>
        <el-table-column prop="title" label="公告标题" min-width="220" />
        <el-table-column prop="course" label="关联课程" min-width="160" />
        <el-table-column prop="className" label="班级" min-width="120" />
        <el-table-column prop="publishedAt" label="发布时间" min-width="180" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已发布' ? 'success' : 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="primary" link :loading="rowLoading[`publish-${row.id}`]" @click="publish(row)">发布</el-button>
            <el-button type="danger" link :loading="rowLoading[`delete-${row.id}`]" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增课程公告' : '编辑课程公告'" width="680px">
      <el-form :model="dialogForm" label-position="top">
        <el-form-item label="课程">
          <el-select v-model="dialogForm.course">
            <el-option v-for="item in courseOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="dialogForm.className">
            <el-option label="软工 2301" value="软工 2301" />
            <el-option label="软工 2302" value="软工 2302" />
            <el-option label="软工 2303" value="软工 2303" />
          </el-select>
        </el-form-item>
        <el-form-item label="公告标题">
          <el-input v-model="dialogForm.title" />
        </el-form-item>
        <el-form-item label="公告内容">
          <el-input v-model="dialogForm.content" type="textarea" :rows="5" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.save" @click="saveAnnouncement">保存</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const courseOptions = ['软件工程', '需求分析与建模', '课程设计', '软件测试'];

const filters = reactive({
  course: '',
  status: '',
  keyword: ''
});

const loading = reactive({
  create: false,
  save: false
});

const rowLoading = reactive({});
const dialogVisible = ref(false);
const dialogMode = ref('create');
const dialogForm = reactive({
  id: '',
  course: '软件工程',
  className: '软工 2301',
  title: '',
  content: ''
});

const rows = ref([
  { id: 'ca-1', title: '软件工程课程项目分组公布', course: '软件工程', className: '软工 2301', publishedAt: '2026-07-17 09:00', status: '已发布', content: '请于 2026 年 7 月 18 日前完成组队确认。' },
  { id: 'ca-2', title: '软件工程课程中期检查安排', course: '软件工程', className: '软工 2302', publishedAt: '2026-07-16 14:20', status: '已发布', content: '本周四进行项目中期检查。' },
  { id: 'ca-3', title: '需求分析案例讨论材料', course: '需求分析与建模', className: '软工 2301', publishedAt: '2026-07-16 10:00', status: '已发布', content: '请提前阅读讨论案例。' },
  { id: 'ca-4', title: '需求分析作业提交提醒', course: '需求分析与建模', className: '软工 2302', publishedAt: '2026-07-15 17:30', status: '已发布', content: '作业提交截止到 2026 年 7 月 19 日。' },
  { id: 'ca-5', title: '课程设计答辩顺序草稿', course: '课程设计', className: '软工 2303', publishedAt: '2026-07-15 09:10', status: '草稿', content: '答辩顺序将于明天正式发布。' },
  { id: 'ca-6', title: '软件测试案例讲解安排', course: '软件测试', className: '软工 2303', publishedAt: '2026-07-14 16:05', status: '已发布', content: '周四课程将新增案例讲解环节。' },
  { id: 'ca-7', title: '课程设计资源包更新', course: '课程设计', className: '软工 2303', publishedAt: '2026-07-14 11:20', status: '已发布', content: '资源包已补充模板文件。' },
  { id: 'ca-8', title: '软件工程阶段汇报提醒', course: '软件工程', className: '软工 2301', publishedAt: '2026-07-13 18:10', status: '草稿', content: '阶段汇报 PPT 模板已准备。' },
  { id: 'ca-9', title: '软件测试课后练习说明', course: '软件测试', className: '软工 2303', publishedAt: '2026-07-13 09:00', status: '已发布', content: '请按要求完成课后练习。' },
  { id: 'ca-10', title: '需求分析课堂展示安排', course: '需求分析与建模', className: '软工 2301', publishedAt: '2026-07-12 15:40', status: '已发布', content: '展示顺序已更新。' }
]);

const filteredRows = computed(() => {
  return rows.value.filter((item) => {
    const courseMatched = !filters.course || item.course === filters.course;
    const statusMatched = !filters.status || item.status === filters.status;
    const keywordMatched = !filters.keyword || item.title.includes(filters.keyword);
    return courseMatched && statusMatched && keywordMatched;
  });
});

function openDialog(row) {
  dialogMode.value = row ? 'edit' : 'create';
  dialogForm.id = row?.id || '';
  dialogForm.course = row?.course || '软件工程';
  dialogForm.className = row?.className || '软工 2301';
  dialogForm.title = row?.title || '';
  dialogForm.content = row?.content || '';
  dialogVisible.value = true;
}

async function saveAnnouncement() {
  loading.save = true;
  await new Promise((resolve) => window.setTimeout(resolve, 500));
  if (dialogMode.value === 'create') {
    rows.value.unshift({
      id: `ca-${Date.now()}`,
      title: dialogForm.title,
      course: dialogForm.course,
      className: dialogForm.className,
      publishedAt: '2026-07-17 16:00',
      status: '草稿',
      content: dialogForm.content
    });
  } else {
    const target = rows.value.find((item) => item.id === dialogForm.id);
    if (target) {
      target.course = dialogForm.course;
      target.className = dialogForm.className;
      target.title = dialogForm.title;
      target.content = dialogForm.content;
    }
  }
  loading.save = false;
  dialogVisible.value = false;
  ElMessage.success('保存成功');
}

async function publish(row) {
  rowLoading[`publish-${row.id}`] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  row.status = '已发布';
  rowLoading[`publish-${row.id}`] = false;
  ElMessage.success('公告发布成功');
}

async function remove(row) {
  try {
    await ElMessageBox.confirm(`确认删除“${row.title}”吗？`, '删除公告确认', { type: 'warning' });
    rowLoading[`delete-${row.id}`] = true;
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    rows.value = rows.value.filter((item) => item.id !== row.id);
    rowLoading[`delete-${row.id}`] = false;
    ElMessage.success('删除成功');
  } catch {
    ElMessage.info('已取消删除');
  }
}
</script>
