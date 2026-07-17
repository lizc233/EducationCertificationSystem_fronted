<template>
  <StandardPage
    title="教学反馈查看"
    :breadcrumbs="['首页', '成绩管理', '教学反馈查看']"
    description="查看学生对课程的匿名评价反馈，按课程和评价类型筛选并查看摘要。"
  >
    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="课程">
          <el-select v-model="filters.course" clearable style="width: 220px;">
            <el-option v-for="item in courseOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="评价类型">
          <el-select v-model="filters.type" clearable style="width: 180px;">
            <el-option label="课程评价" value="课程评价" />
            <el-option label="资源反馈" value="资源反馈" />
            <el-option label="课堂建议" value="课堂建议" />
          </el-select>
        </el-form-item>
      </el-form>
    </template>

    <div class="split-grid" style="grid-template-columns: minmax(0, 1.15fr) 360px;">
      <SectionCard title="反馈列表">
        <el-table :data="filteredRows" border stripe @row-click="selectRow">
          <el-table-column prop="course" label="课程名称" min-width="170" />
          <el-table-column prop="type" label="评价类型" min-width="120" />
          <el-table-column prop="submittedAt" label="提交时间" min-width="180" />
          <el-table-column prop="summary" label="内容摘要" min-width="260" show-overflow-tooltip />
        </el-table>
      </SectionCard>

      <SectionCard title="反馈详情">
        <div class="paper-note">
          匿名课程：{{ currentRow.course }}<br />
          类型：{{ currentRow.type }}<br />
          时间：{{ currentRow.submittedAt }}
        </div>
        <div class="editor-shell" style="min-height: 280px; margin-top: 16px;">
          {{ currentRow.detail }}
        </div>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const filters = reactive({
  course: '',
  type: ''
});

const courseOptions = ['软件工程', '需求分析与建模', '课程设计', '软件测试'];

const rows = [
  { course: '软件工程', type: '课程评价', submittedAt: '2026-07-17 09:10', summary: '项目实践环节很有帮助，但希望增加中期指导次数。', detail: '课程案例和项目实践帮助很大，希望在中期阶段增加一次集中点评，方便团队及时纠偏。' },
  { course: '软件工程', type: '课堂建议', submittedAt: '2026-07-17 08:40', summary: '课堂讨论氛围很好，建议增加实际案例复盘。', detail: '课堂讨论氛围很好，如果能在每次课后增加真实案例复盘会更有帮助。' },
  { course: '需求分析与建模', type: '资源反馈', submittedAt: '2026-07-16 16:20', summary: '案例模板很清晰，希望课件同步更新到课程群。', detail: '案例模板对作业帮助很大，希望每周课件都能在当天同步上传。' },
  { course: '需求分析与建模', type: '课程评价', submittedAt: '2026-07-16 15:10', summary: '课堂讲解细致，作业点评很具体。', detail: '老师对作业点评很细致，希望继续保持。' },
  { course: '课程设计', type: '课堂建议', submittedAt: '2026-07-15 18:00', summary: '答辩要求说明得更详细会更好。', detail: '课程设计答辩前希望能有一次专项说明，明确评分标准与展示重点。' },
  { course: '课程设计', type: '资源反馈', submittedAt: '2026-07-15 17:30', summary: '模板文件实用，希望补充示例工程。', detail: '模板文件很好用，如果能再补充一个完整示例工程会更直观。' },
  { course: '软件测试', type: '课程评价', submittedAt: '2026-07-15 09:30', summary: '案例讲解效果很好，课后练习难度适中。', detail: '课程测试案例结合真实项目问题很有帮助。' },
  { course: '软件测试', type: '课堂建议', submittedAt: '2026-07-14 14:00', summary: '希望增加小组互评环节。', detail: '建议在案例讨论环节加入小组互评，帮助大家理解测试设计差异。' },
  { course: '软件工程', type: '资源反馈', submittedAt: '2026-07-14 11:20', summary: '课程项目资料完整，建议增加演示视频。', detail: '项目说明书和模板完整，如果增加一段演示视频会更易理解。' },
  { course: '需求分析与建模', type: '课堂建议', submittedAt: '2026-07-13 16:50', summary: '小组展示时间稍紧，希望每组多 3 分钟。', detail: '小组展示反馈时间略短，希望适当延长。' }
];

const currentRow = ref(rows[0]);

const filteredRows = computed(() => {
  return rows.filter((item) => {
    const courseMatched = !filters.course || item.course === filters.course;
    const typeMatched = !filters.type || item.type === filters.type;
    return courseMatched && typeMatched;
  });
});

function selectRow(row) {
  currentRow.value = row;
}
</script>
