<template>
  <StandardPage
    title="系统公告管理"
    :breadcrumbs="['首页', '基础管理', '系统公告管理']"
    description="维护面向全体用户的系统公告，并同步到各角色首页的通知区域。"
  >
    <template #actions>
      <el-button type="primary" :loading="loading.create" @click="openDialog()">新增公告</el-button>
      <el-button :loading="loading.export" @click="runAction('export', '导出公告列表')">导出</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable style="width: 180px;">
            <el-option label="草稿" value="草稿" />
            <el-option label="已发布" value="已发布" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model.trim="filters.keyword" placeholder="搜索公告标题" clearable style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.search" @click="runAction('search', '查询公告')">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <SectionCard title="公告列表">
      <el-table :data="filteredRows" border stripe>
        <el-table-column prop="title" label="公告标题" min-width="260" />
        <el-table-column prop="publisher" label="发布人" min-width="120" />
        <el-table-column prop="publishedAt" label="发布时间" min-width="180" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已发布' ? 'success' : 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="audience" label="面向对象" min-width="140" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="primary" link :loading="rowLoading[`publish-${row.id}`]" @click="publish(row)">发布</el-button>
            <el-button type="danger" link :loading="rowLoading[`delete-${row.id}`]" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增公告' : '编辑公告'" width="720px">
      <el-form :model="dialogForm" label-position="top">
        <el-form-item label="公告标题">
          <el-input v-model="dialogForm.title" />
        </el-form-item>
        <el-form-item label="公告内容">
          <el-input v-model="dialogForm.content" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item label="面向对象">
          <el-select v-model="dialogForm.audience">
            <el-option label="全体用户" value="全体用户" />
            <el-option label="教师与管理员" value="教师与管理员" />
            <el-option label="学生" value="学生" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="dialogForm.status">
            <el-option label="草稿" value="草稿" />
            <el-option label="已发布" value="已发布" />
          </el-select>
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

const filters = reactive({
  status: '',
  keyword: ''
});

const dialogVisible = ref(false);
const dialogMode = ref('create');
const loading = reactive({
  create: false,
  search: false,
  export: false,
  save: false
});
const rowLoading = reactive({});
const dialogForm = reactive({
  id: '',
  title: '',
  content: '',
  audience: '全体用户',
  status: '草稿'
});

const rows = ref([
  { id: 'notice-1', title: '2026 年暑期选课系统开放通知', publisher: '教务处', publishedAt: '2026-07-17 09:00', status: '已发布', audience: '全体用户', content: '暑期选课将于 7 月 18 日正式开放。' },
  { id: 'notice-2', title: '成绩审核流程调整说明', publisher: '教务处', publishedAt: '2026-07-16 14:20', status: '已发布', audience: '教师与管理员', content: '成绩审核驳回后需补充原因说明。' },
  { id: 'notice-3', title: '课程评价填写提醒', publisher: '教学质量中心', publishedAt: '2026-07-16 10:00', status: '已发布', audience: '学生', content: '请在规定时间内完成课程评价。' },
  { id: 'notice-4', title: '专业认证材料归档安排', publisher: '认证办公室', publishedAt: '2026-07-15 17:30', status: '已发布', audience: '全体用户', content: '请各专业完成归档检查。' },
  { id: 'notice-5', title: '软件工程课程公告模板更新', publisher: '教务处', publishedAt: '2026-07-15 09:10', status: '草稿', audience: '教师与管理员', content: '课程公告模板增加附件说明字段。' },
  { id: 'notice-6', title: '学生学业进度页即将更新', publisher: '信息化中心', publishedAt: '2026-07-14 16:05', status: '草稿', audience: '学生', content: '学分结构图即将上线。' },
  { id: 'notice-7', title: '问卷回收率阶段性通报', publisher: '教学质量中心', publishedAt: '2026-07-14 11:20', status: '已发布', audience: '全体用户', content: '毕业要求满意度问卷回收率达到 72%。' },
  { id: 'notice-8', title: '课程资源上传截止提醒', publisher: '教务处', publishedAt: '2026-07-13 18:10', status: '已发布', audience: '教师与管理员', content: '请在周五前补齐资源。' },
  { id: 'notice-9', title: '系统维护窗口通知', publisher: '信息化中心', publishedAt: '2026-07-13 09:00', status: '已发布', audience: '全体用户', content: '周末凌晨系统进行例行维护。' },
  { id: 'notice-10', title: '选课容量调整预案', publisher: '教务处', publishedAt: '2026-07-12 15:40', status: '草稿', audience: '教师与管理员', content: '针对热门课程准备扩容方案。' }
]);

const filteredRows = computed(() => {
  return rows.value.filter((item) => {
    const statusMatched = !filters.status || item.status === filters.status;
    const keywordMatched = !filters.keyword || item.title.includes(filters.keyword);
    return statusMatched && keywordMatched;
  });
});

function resetFilters() {
  filters.status = '';
  filters.keyword = '';
  ElMessage.success('已重置筛选条件');
}

function openDialog(row) {
  dialogMode.value = row ? 'edit' : 'create';
  dialogForm.id = row?.id || '';
  dialogForm.title = row?.title || '';
  dialogForm.content = row?.content || '';
  dialogForm.audience = row?.audience || '全体用户';
  dialogForm.status = row?.status || '草稿';
  dialogVisible.value = true;
}

async function saveAnnouncement() {
  loading.save = true;
  await new Promise((resolve) => window.setTimeout(resolve, 500));

  if (dialogMode.value === 'create') {
    rows.value.unshift({
      id: `notice-${Date.now()}`,
      title: dialogForm.title,
      content: dialogForm.content,
      audience: dialogForm.audience,
      status: dialogForm.status,
      publisher: '教务处',
      publishedAt: '2026-07-17 15:00'
    });
  } else {
    const target = rows.value.find((item) => item.id === dialogForm.id);
    if (target) {
      target.title = dialogForm.title;
      target.content = dialogForm.content;
      target.audience = dialogForm.audience;
      target.status = dialogForm.status;
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

async function runAction(key, label) {
  loading[key] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  loading[key] = false;
  ElMessage.success(`${label}成功`);
}
</script>
