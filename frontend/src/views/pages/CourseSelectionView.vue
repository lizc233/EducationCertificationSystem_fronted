<template>
  <StandardPage
    title="选课中心"
    :breadcrumbs="['首页', '我的学习', '选课中心']"
    description="查看当前可选课程、容量、截止时间，并进行选课或退选。"
  >
    <template #actions>
      <el-button type="primary" @click="router.push('/my-courses')">查看我的课程</el-button>
      <el-button @click="router.push('/my-schedule')">查看我的课表</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="学期">
          <el-select v-model="filters.term" clearable style="width: 180px;">
            <el-option label="2025-2026-2" value="2025-2026-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model.trim="filters.keyword" placeholder="搜索课程名称或教师" clearable style="width: 240px;" />
        </el-form-item>
      </el-form>
    </template>

    <SectionCard title="可选课程列表">
      <el-table :data="filteredRows" border stripe>
        <el-table-column prop="course" label="课程名称" min-width="180" />
        <el-table-column prop="teacher" label="授课教师" min-width="120" />
        <el-table-column prop="credit" label="学分" min-width="80" />
        <el-table-column prop="capacityText" label="可选人数 / 已选人数" min-width="150" />
        <el-table-column prop="deadline" label="选课截止时间" min-width="180" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag[row.status]">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === '可选'"
              type="primary"
              link
              :loading="rowLoading[`select-${row.id}`]"
              @click="selectCourse(row)"
            >
              选课
            </el-button>
            <el-button
              v-else-if="row.status === '已选'"
              type="danger"
              link
              :loading="rowLoading[`drop-${row.id}`]"
              @click="dropCourse(row)"
            >
              退选
            </el-button>
            <span v-else>已满</span>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>
  </StandardPage>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const router = useRouter();
const filters = reactive({
  term: '2025-2026-2',
  keyword: ''
});
const rowLoading = reactive({});

const rows = reactive([
  { id: 'cs-1', term: '2025-2026-2', course: '软件工程', teacher: '李老师', credit: 3, selected: 76, capacity: 80, deadline: '2026-07-25 18:00', status: '可选' },
  { id: 'cs-2', term: '2025-2026-2', course: '数据库原理', teacher: '陈老师', credit: 3.5, selected: 70, capacity: 70, deadline: '2026-07-25 18:00', status: '已满' },
  { id: 'cs-3', term: '2025-2026-2', course: '计算机网络', teacher: '何老师', credit: 3, selected: 58, capacity: 60, deadline: '2026-07-25 18:00', status: '可选' },
  { id: 'cs-4', term: '2025-2026-2', course: '操作系统', teacher: '周老师', credit: 4, selected: 55, capacity: 55, deadline: '2026-07-25 18:00', status: '已满' },
  { id: 'cs-5', term: '2025-2026-2', course: '工程伦理', teacher: '王老师', credit: 1.5, selected: 30, capacity: 45, deadline: '2026-07-27 18:00', status: '可选' },
  { id: 'cs-6', term: '2025-2026-2', course: '人工智能导论', teacher: '赵老师', credit: 2, selected: 35, capacity: 40, deadline: '2026-07-24 18:00', status: '可选' },
  { id: 'cs-7', term: '2025-2026-2', course: '软件测试', teacher: '黄老师', credit: 2, selected: 48, capacity: 50, deadline: '2026-07-25 18:00', status: '可选' },
  { id: 'cs-8', term: '2025-2026-2', course: '编译原理', teacher: '孙老师', credit: 3, selected: 44, capacity: 45, deadline: '2026-07-25 18:00', status: '已选' },
  { id: 'cs-9', term: '2025-2026-2', course: '离散数学', teacher: '张老师', credit: 3, selected: 60, capacity: 65, deadline: '2026-07-25 18:00', status: '可选' },
  { id: 'cs-10', term: '2025-2026-2', course: '数据结构', teacher: '吴老师', credit: 3.5, selected: 64, capacity: 68, deadline: '2026-07-25 18:00', status: '已选' }
]);

const statusTag = {
  可选: 'success',
  已选: 'warning',
  已满: 'info'
};

const filteredRows = computed(() => {
  return rows
    .map((item) => ({
      ...item,
      capacityText: `${item.capacity} / ${item.selected}`
    }))
    .filter((item) => {
      const termMatched = !filters.term || item.term === filters.term;
      const keywordMatched = !filters.keyword || item.course.includes(filters.keyword) || item.teacher.includes(filters.keyword);
      return termMatched && keywordMatched;
    });
});

async function selectCourse(row) {
  rowLoading[`select-${row.id}`] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  row.status = '已选';
  row.selected += 1;
  rowLoading[`select-${row.id}`] = false;
  ElMessage.success(`已选上 ${row.course}`);
}

async function dropCourse(row) {
  try {
    await ElMessageBox.confirm(`确认退选“${row.course}”吗？仅在截止时间 2026 年 7 月 25 日 18:00 前允许退选。`, '退选确认', {
      type: 'warning'
    });
    rowLoading[`drop-${row.id}`] = true;
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    row.status = '可选';
    row.selected -= 1;
    rowLoading[`drop-${row.id}`] = false;
    ElMessage.success('退选成功');
  } catch {
    ElMessage.info('已取消退选');
  }
}
</script>
