<template>
  <StandardPage
    title="课程评价"
    :breadcrumbs="['首页', '课程评价', '课程评价']"
    description="对已修读课程进行评价，提交评分和文字反馈，形成课程改进依据。"
  >
    <SectionCard title="待评价课程列表">
      <el-table :data="rows" border stripe>
        <el-table-column prop="course" label="课程名称" min-width="180" />
        <el-table-column prop="teacher" label="授课教师" min-width="120" />
        <el-table-column prop="term" label="学期" min-width="120" />
        <el-table-column prop="status" label="评价状态" min-width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === '已评价' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :loading="rowLoading[row.id]" @click="openDialog(row)">
              {{ row.status === '已评价' ? '查看评价' : '评价' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <el-dialog v-model="dialogVisible" :title="currentRow?.course || '课程评价'" width="640px">
      <el-form :model="form" label-position="top">
        <el-form-item label="课程评分">
          <el-rate v-model="form.score" />
        </el-form-item>
        <el-form-item label="课程反馈">
          <el-input v-model="form.comment" type="textarea" :rows="5" placeholder="请输入课程评价与建议" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveEvaluation">提交评价</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const dialogVisible = ref(false);
const saving = ref(false);
const currentRow = ref(null);
const rowLoading = reactive({});
const form = reactive({
  score: 4,
  comment: ''
});

const rows = reactive([
  { id: 'eval-1', course: '软件工程', teacher: '李老师', term: '2025-2026-2', status: '未评价' },
  { id: 'eval-2', course: '数据库原理', teacher: '陈老师', term: '2025-2026-2', status: '未评价' },
  { id: 'eval-3', course: '计算机网络', teacher: '何老师', term: '2025-2026-2', status: '已评价' },
  { id: 'eval-4', course: '操作系统', teacher: '周老师', term: '2025-2026-2', status: '未评价' },
  { id: 'eval-5', course: '工程伦理', teacher: '王老师', term: '2025-2026-2', status: '已评价' },
  { id: 'eval-6', course: '人工智能导论', teacher: '赵老师', term: '2025-2026-1', status: '已评价' },
  { id: 'eval-7', course: '软件测试', teacher: '黄老师', term: '2025-2026-1', status: '未评价' },
  { id: 'eval-8', course: '编译原理', teacher: '孙老师', term: '2025-2026-1', status: '未评价' },
  { id: 'eval-9', course: '离散数学', teacher: '张老师', term: '2025-2026-1', status: '已评价' },
  { id: 'eval-10', course: '数据结构', teacher: '吴老师', term: '2025-2026-1', status: '已评价' }
]);

function openDialog(row) {
  currentRow.value = row;
  form.score = row.status === '已评价' ? 5 : 4;
  form.comment = row.status === '已评价' ? '课程组织清晰，内容安排合理。' : '';
  dialogVisible.value = true;
}

async function saveEvaluation() {
  saving.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  if (currentRow.value) {
    currentRow.value.status = '已评价';
  }
  saving.value = false;
  dialogVisible.value = false;
  ElMessage.success('评价提交成功');
}
</script>
