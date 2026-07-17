<template>
  <StandardPage
    title="问卷填报与统计"
    :breadcrumbs="breadcrumbs"
    :description="pageDescription"
  >
    <SectionCard>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="问卷填报" name="fill">
          <div class="split-grid split-grid--detail">
            <div class="list-panel">
              <button
                v-for="item in surveys"
                :key="item.id"
                type="button"
                class="list-item dashboard-action"
                @click="openSurvey(item)"
              >
                <div class="dashboard-action__row">
                  <div>
                    <div class="dashboard-action__title">{{ item.name }}</div>
                    <div class="dashboard-action__desc">{{ item.status }} · {{ item.target }}</div>
                  </div>
                  <el-button type="primary" :loading="submitting && currentSurvey?.id === item.id">
                    {{ item.status === '待填' ? '去填报' : '已提交' }}
                  </el-button>
                </div>
              </button>
            </div>

            <SectionCard title="问卷填写区">
              <el-form label-position="top">
                <el-form-item label="1. 课程目标设置是否清晰？">
                  <el-radio-group model-value="非常清晰">
                    <el-radio label="非常清晰" value="非常清晰" />
                    <el-radio label="比较清晰" value="比较清晰" />
                    <el-radio label="一般" value="一般" />
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="2. 对课程改进的建议">
                  <el-input type="textarea" :rows="4" placeholder="请输入建议" />
                </el-form-item>
                <el-button type="primary" :loading="submitting" @click="submitSurvey">提交后不可修改</el-button>
              </el-form>
            </SectionCard>
          </div>
        </el-tab-pane>

        <el-tab-pane v-if="isSuper" label="统计分析" name="stats">
          <div class="info-grid">
            <div class="metric-card">
              <div class="metric-card__label">回收率</div>
              <div class="metric-card__value">72%</div>
            </div>
            <div class="metric-card">
              <div class="metric-card__label">已回收答卷</div>
              <div class="metric-card__value">186</div>
            </div>
            <div class="metric-card">
              <div class="metric-card__label">待催收</div>
              <div class="metric-card__value">73</div>
            </div>
          </div>
          <SectionCard title="统计结果">
            <el-table :data="statsRows" border stripe>
              <el-table-column prop="name" label="问卷名称" min-width="220" />
              <el-table-column prop="target" label="对象" min-width="120" />
              <el-table-column prop="recovery" label="回收率" min-width="100" />
              <el-table-column prop="pending" label="待催收" min-width="100" />
            </el-table>
          </SectionCard>
        </el-tab-pane>
      </el-tabs>
    </SectionCard>
  </StandardPage>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { ROLES } from '../../data/navigation';
import { useUserStore } from '../../store/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const isSuper = computed(() => userStore.userInfo.role === ROLES.SUPER);
const submitting = ref(false);
const activeTab = ref(isSuper.value ? String(route.query.tab || 'fill') : 'fill');

const breadcrumbs = computed(() => {
  if (userStore.userInfo.role === ROLES.STUDENT) {
    return ['首页', '问卷填报', '问卷填报'];
  }

  if (userStore.userInfo.role === ROLES.TEACHER) {
    return ['首页', '问卷与改进', '问卷填报'];
  }

  return ['首页', '问卷与改进', '问卷填报与统计'];
});

const pageDescription = computed(() => {
  if (userStore.userInfo.role === ROLES.STUDENT) {
    return '学生仅展示待填问卷与个人提交入口。';
  }

  if (userStore.userInfo.role === ROLES.TEACHER) {
    return '教师可参与问卷填报并查看个人反馈状态。';
  }

  return '管理员可统一查看问卷填报入口与回收统计结果。';
});

const surveys = [
  { id: 1, name: '毕业要求满意度调查', status: '待填', target: '毕业生' },
  { id: 2, name: '课程目标达成反馈问卷', status: '已提交', target: '任课教师' },
  { id: 3, name: '课程资源使用反馈问卷', status: '待填', target: '学生' }
];

const statsRows = [
  { name: '毕业要求满意度调查', target: '毕业生', recovery: '72%', pending: 73 },
  { name: '课程目标达成反馈问卷', target: '教师', recovery: '88%', pending: 12 },
  { name: '课程资源使用反馈问卷', target: '学生', recovery: '64%', pending: 95 }
];

const currentSurvey = computed(() => surveys.find((item) => String(item.id) === String(route.query.id || 1)) || surveys[0]);

watch(activeTab, async (value) => {
  if (!isSuper.value) {
    return;
  }

  await router.replace({ path: '/survey/fill', query: { ...route.query, tab: value } });
});

async function openSurvey(item) {
  await router.push({ path: '/survey/fill', query: { tab: 'fill', id: String(item.id) } });
}

async function submitSurvey() {
  submitting.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  submitting.value = false;
  ElMessage.success('提交成功');
}
</script>
