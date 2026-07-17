<template>
  <StandardPage title="课程目标与指标点映射" :breadcrumbs="['首页', '方案与课程', '课程目标与指标点映射']" description="维护课程目标、达成标准及指标点映射关系。">
    <template #filters>
      <el-form :inline="true" :model="form">
        <el-form-item label="课程">
          <el-select v-model="form.course" style="width: 260px;">
            <el-option label="软件工程" value="软件工程" />
            <el-option label="数据库原理" value="数据库原理" />
          </el-select>
        </el-form-item>
      </el-form>
    </template>

    <div class="split-grid split-grid--detail">
      <SectionCard title="课程目标列表">
        <template #extra>
          <el-button type="primary" :loading="saving" @click="saveConfig">保存映射</el-button>
        </template>
        <div class="list-panel">
          <article
            v-for="item in goals"
            :key="item.id"
            class="list-item"
          >
            <div style="display: flex; justify-content: space-between; gap: 16px;">
              <div>
                <div style="font-weight: 600; margin-bottom: 8px;">{{ item.title }}</div>
                <div style="color: var(--text-secondary); line-height: 1.8;">{{ item.desc }}</div>
                <div style="margin-top: 8px; color: var(--text-light);">达成标准：{{ item.standard }}</div>
                <div style="margin-top: 10px;">
                  <el-tag v-for="point in item.points" :key="point" class="mr-2">{{ point }}</el-tag>
                </div>
              </div>
              <div>
                <el-button type="primary" link @click="openWorkspace('view', item)">查看详情</el-button>
                <el-button type="primary" link @click="openWorkspace('edit', item)">编辑</el-button>
                <el-button type="danger" link @click="removeGoal(item)">删除</el-button>
              </div>
            </div>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="映射说明">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="当前课程">{{ form.course }}</el-descriptions-item>
          <el-descriptions-item label="目标数量">{{ goals.length }}</el-descriptions-item>
          <el-descriptions-item label="映射指标点">2.1、2.2、3.1、3.2、9.1、10.2</el-descriptions-item>
          <el-descriptions-item label="维护建议">优先检查低达成度目标对应的考核权重与指标点覆盖情况。</el-descriptions-item>
        </el-descriptions>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const route = useRoute();
const router = useRouter();
const saving = ref(false);

const form = reactive({
  course: '软件工程'
});

const goals = ref([
  { id: 1, title: '课程目标 1', desc: '能够理解软件工程过程、方法与标准。', standard: '平均得分达到 75 分', points: ['2.1', '2.2'] },
  { id: 2, title: '课程目标 2', desc: '能够完成需求分析、设计与测试文档编写。', standard: '项目文档评分不低于 80 分', points: ['3.1', '3.2'] },
  { id: 3, title: '课程目标 3', desc: '能够在团队协作中完成软件开发任务。', standard: '团队项目评价达到良好及以上', points: ['9.1', '10.2'] },
  { id: 4, title: '课程目标 4', desc: '能够识别课程项目中的质量风险并给出改进方案。', standard: '质量分析报告评分不低于 78 分', points: ['4.1', '5.2'] }
]);

async function saveConfig() {
  saving.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  saving.value = false;
  ElMessage.success('保存成功');
}

async function openWorkspace(mode, item) {
  await router.push({
    name: 'record-workspace',
    params: { pageKey: 'course-goals', mode, id: String(item.id) },
    query: {
      from: route.path,
      title: '课程目标与指标点映射',
      payload: JSON.stringify(item),
      schema: JSON.stringify([
        { prop: 'title', label: '课程目标', type: 'input' },
        { prop: 'desc', label: '目标描述', type: 'textarea' },
        { prop: 'standard', label: '达成标准', type: 'input' },
        { prop: 'points', label: '指标点', type: 'input' }
      ])
    }
  });
}

async function removeGoal(item) {
  try {
    await ElMessageBox.confirm(`确认删除“${item.title}”吗？`, '删除确认', { type: 'warning' });
    goals.value = goals.value.filter((goal) => goal.id !== item.id);
    ElMessage.success('删除成功');
  } catch {
    ElMessage.info('已取消删除');
  }
}
</script>
