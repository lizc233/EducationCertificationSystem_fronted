<template>
  <StandardPage title="培养目标与毕业要求" :breadcrumbs="['首页', '方案与课程', '培养目标与毕业要求']" description="维护培养目标、毕业要求和支撑矩阵。">
    <template #actions>
      <el-button type="primary" :loading="loading.goal" @click="mockAction('goal', '新增培养目标')">新增培养目标</el-button>
      <el-button :loading="loading.requirement" @click="mockAction('requirement', '新增毕业要求')">新增毕业要求</el-button>
    </template>

    <SectionCard>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="培养目标" name="goals">
          <el-table :data="goals" border stripe>
            <el-table-column prop="index" label="序号" width="80" />
            <el-table-column prop="desc" label="目标描述" min-width="420" />
            <el-table-column prop="owner" label="责任人" width="120" />
            <el-table-column prop="sort" label="排序" width="100" />
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openWorkspace('view', row, goalSchema)">查看详情</el-button>
                <el-button type="primary" link @click="openWorkspace('edit', row, goalSchema)">编辑</el-button>
                <el-button type="danger" link @click="removeItem('培养目标', row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="毕业要求" name="requirements">
          <el-table :data="requirements" border stripe>
            <el-table-column prop="code" label="编号" width="100" />
            <el-table-column prop="desc" label="要求描述" min-width="360" />
            <el-table-column prop="points" label="指标点列表" min-width="260" />
            <el-table-column prop="owner" label="责任人" width="120" />
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openWorkspace('view', row, requirementSchema)">查看详情</el-button>
                <el-button type="primary" link @click="openWorkspace('edit', row, requirementSchema)">编辑</el-button>
                <el-button type="danger" link @click="removeItem('毕业要求', row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="支撑矩阵" name="matrix">
          <el-table :data="matrixRows" border stripe>
            <el-table-column prop="requirement" label="毕业要求" min-width="220" fixed="left" />
            <el-table-column
              v-for="goal in goalColumns"
              :key="goal"
              :label="goal"
              min-width="140"
            >
              <template #default="{ row }">
                <el-checkbox v-model="row[goal]" />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </SectionCard>
  </StandardPage>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const router = useRouter();
const route = useRoute();
const activeTab = ref('goals');
const goalColumns = ['目标 1', '目标 2', '目标 3'];
const loading = reactive({
  goal: false,
  requirement: false
});

const goalSchema = [
  { prop: 'index', label: '序号', type: 'input' },
  { prop: 'desc', label: '目标描述', type: 'textarea' },
  { prop: 'owner', label: '责任人', type: 'input' },
  { prop: 'sort', label: '排序', type: 'input' }
];

const requirementSchema = [
  { prop: 'code', label: '编号', type: 'input' },
  { prop: 'desc', label: '要求描述', type: 'textarea' },
  { prop: 'points', label: '指标点列表', type: 'input' },
  { prop: 'owner', label: '责任人', type: 'input' }
];

const goals = ref([
  { id: 'goal-1', index: 1, desc: '具备扎实的工程基础知识与系统设计能力。', owner: '张敏', sort: 1 },
  { id: 'goal-2', index: 2, desc: '具备解决复杂工程问题的分析与实践能力。', owner: '李青', sort: 2 },
  { id: 'goal-3', index: 3, desc: '具备终身学习和跨学科协作能力。', owner: '周鹏', sort: 3 },
  { id: 'goal-4', index: 4, desc: '具备工程伦理与社会责任意识。', owner: '王静', sort: 4 },
  { id: 'goal-5', index: 5, desc: '具备国际视野与沟通表达能力。', owner: '陈曦', sort: 5 }
]);

const requirements = ref([
  { id: 'req-1', code: 'GR1', desc: '能够应用数学、自然科学和工程基础解决复杂问题。', points: '1.1、1.2、1.3', owner: '张敏' },
  { id: 'req-2', code: 'GR2', desc: '能够识别、表达并分析复杂工程问题。', points: '2.1、2.2', owner: '李青' },
  { id: 'req-3', code: 'GR3', desc: '能够设计满足特定需求的系统或模块。', points: '3.1、3.2、3.3', owner: '周鹏' },
  { id: 'req-4', code: 'GR4', desc: '能够开展研究并分析实验结果。', points: '4.1、4.2', owner: '王静' },
  { id: 'req-5', code: 'GR5', desc: '能够使用现代工程工具解决复杂工程问题。', points: '5.1、5.2', owner: '陈曦' }
]);

const matrixRows = ref([
  { requirement: 'GR1', '目标 1': true, '目标 2': true, '目标 3': false },
  { requirement: 'GR2', '目标 1': false, '目标 2': true, '目标 3': false },
  { requirement: 'GR3', '目标 1': true, '目标 2': true, '目标 3': true }
]);

async function mockAction(key, label) {
  loading[key] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  loading[key] = false;
  ElMessage.success(`${label}成功`);
}

async function openWorkspace(mode, row, schema) {
  await router.push({
    name: 'record-workspace',
    params: { pageKey: 'program-goals', mode, id: row.id },
    query: {
      from: route.path,
      title: '培养目标与毕业要求',
      payload: JSON.stringify(row),
      schema: JSON.stringify(schema)
    }
  });
}

async function removeItem(label, row) {
  try {
    await ElMessageBox.confirm(`确认删除该${label}吗？`, '删除确认', { type: 'warning' });
    if (label === '培养目标') {
      goals.value = goals.value.filter((item) => item.id !== row.id);
    } else {
      requirements.value = requirements.value.filter((item) => item.id !== row.id);
    }
    ElMessage.success('删除成功');
  } catch {
    ElMessage.info('已取消删除');
  }
}
</script>
