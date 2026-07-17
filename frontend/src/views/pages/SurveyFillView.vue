<template>
  <StandardPage title="问卷填报与统计" :breadcrumbs="['首页', '问卷与改进', '问卷填报与统计']" description="分离展示问卷填报端与统计端，支持独立路由切换。">
    <SectionCard>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="学生 / 教师端" name="fill">
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
                    <div class="dashboard-action__desc">{{ item.status }}</div>
                  </div>
                  <el-button type="primary" :loading="submitting && currentSurvey?.id === item.id">
                    {{ item.status === '待填' ? '去填报' : '已提交' }}
                  </el-button>
                </div>
              </button>
            </div>

            <SectionCard title="问卷填报页">
              <el-form label-position="top">
                <el-form-item label="1. 课程目标设置是否清晰？">
                  <el-radio-group model-value="非常清晰">
                    <el-radio label="非常清晰" value="非常清晰" />
                    <el-radio label="较清晰" value="较清晰" />
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

        <el-tab-pane label="管理员统计端" name="stats">
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
              <el-table-column prop="name" label="问卷名称" min-width="200" />
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

const route = useRoute();
const router = useRouter();
const activeTab = ref(String(route.query.tab || 'fill'));
const submitting = ref(false);

const surveys = [
  { id: 1, name: '毕业要求满意度调查', status: '待填' },
  { id: 2, name: '课程目标达成反馈问卷', status: '已填' },
  { id: 3, name: '课程资源使用反馈问卷', status: '待填' }
];

const statsRows = [
  { name: '毕业要求满意度调查', target: '毕业生', recovery: '72%', pending: 73 },
  { name: '课程目标达成反馈问卷', target: '教师', recovery: '88%', pending: 12 },
  { name: '课程资源使用反馈问卷', target: '学生', recovery: '64%', pending: 95 }
];

const currentSurvey = computed(() => surveys.find((item) => String(item.id) === String(route.query.id || 1)) || surveys[0]);

watch(activeTab, async (value) => {
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
