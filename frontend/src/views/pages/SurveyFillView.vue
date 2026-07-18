<template>
  <StandardPage
    title="问卷填报与统计"
    :breadcrumbs="breadcrumbs"
    :description="pageDescription"
  >
    <template #actions>
      <el-button :loading="loading.page" @click="loadPage">刷新</el-button>
    </template>

    <SectionCard v-if="apiUnavailable" title="接口状态">
      <el-result
        icon="warning"
        title="问卷填报接口不可用"
        sub-title="当前运行的后端没有提供 /api/surveys/questionnaires，因此这里不显示任何本地假数据。"
      />
    </SectionCard>

    <template v-else>
      <SectionCard title="已发布问卷">
        <el-table v-loading="loading.page" :data="questionnaires" border stripe>
          <el-table-column prop="questionnaireCode" label="编码" min-width="160" />
          <el-table-column prop="title" label="标题" min-width="240" />
          <el-table-column prop="questionnaireType" label="类型" min-width="140" />
          <el-table-column prop="targetObjectType" label="对象" min-width="140" />
          <el-table-column prop="startTime" label="开始时间" min-width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间" min-width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.endTime) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="crud-pagination">
          <el-pagination
            v-model:current-page="pager.pageNum"
            v-model:page-size="pager.pageSize"
            background
            layout="total, prev, pager, next"
            :total="pager.total"
            @current-change="loadPage"
          />
        </div>
      </SectionCard>

      <SectionCard title="页面说明">
        <el-alert
          type="info"
          :closable="false"
          show-icon
          title="当前页面已改为只展示真实后端返回的数据。"
          description="如果后端问卷填报、统计、答卷详情等接口恢复可用，再继续接回完整填报流程。"
        />
      </SectionCard>
    </template>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { ROLES } from '../../data/navigation';
import { useUserStore } from '../../store/user';
import { fetchSurveyQuestionnaires } from '../../api/survey';

const userStore = useUserStore();

const loading = reactive({ page: false });
const apiUnavailable = ref(false);
const questionnaires = ref([]);

const pager = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const breadcrumbs = computed(() => {
  if (userStore.userInfo.role === ROLES.STUDENT) {
    return ['首页', '学习服务', '问卷填报'];
  }
  if (userStore.userInfo.role === ROLES.TEACHER) {
    return ['首页', '问卷与改进', '问卷填报'];
  }
  return ['首页', '问卷与改进', '问卷填报与统计'];
});

const pageDescription = computed(() => {
  if (userStore.userInfo.role === ROLES.STUDENT) {
    return '仅展示真实后端已发布问卷；后端接口未启用时会明确提示。';
  }
  if (userStore.userInfo.role === ROLES.TEACHER) {
    return '教师视图当前只展示真实后端已发布问卷；不再显示本地静态数据。';
  }
  return '管理员视图当前只展示真实后端已发布问卷；统计能力等待后端接口恢复后再接回。';
});

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

async function loadPage() {
  loading.page = true;
  try {
    const page = await fetchSurveyQuestionnaires({
      pageNum: pager.pageNum,
      pageSize: pager.pageSize,
      publishStatus: 'PUBLISHED'
    }, { skipErrorMessage: true });

    apiUnavailable.value = false;
    questionnaires.value = page?.records || [];
    pager.total = Number(page?.total || 0);
  } catch (error) {
    if (error?.response?.status === 404) {
      apiUnavailable.value = true;
      questionnaires.value = [];
      pager.total = 0;
      return;
    }
    throw error;
  } finally {
    loading.page = false;
  }
}

onMounted(async () => {
  try {
    await loadPage();
  } catch {
    // Error toast is handled by the shared request layer when needed.
  }
});
</script>
