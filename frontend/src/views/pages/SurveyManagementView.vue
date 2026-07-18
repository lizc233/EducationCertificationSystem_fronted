<template>
  <StandardPage
    title="问卷设计与发布"
    :breadcrumbs="['首页', '问卷与改进', '问卷设计与发布']"
    description="仅展示真实后端数据；如果当前后端未提供接口，本页会明确提示，不显示本地静态数据。"
  >
    <template #actions>
      <el-button :loading="loading.page" @click="loadPage">刷新</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="发布状态">
          <el-select v-model="filters.publishStatus" clearable placeholder="全部" style="width: 180px;">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="发布中" value="PUBLISHING" />
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="发布失败" value="PUBLISH_FAILED" />
            <el-option label="已撤回" value="REVOKED" />
            <el-option label="已结束" value="ENDED" />
          </el-select>
        </el-form-item>
        <el-form-item label="问卷类型">
          <el-input v-model.trim="filters.questionnaireType" clearable placeholder="如 COURSE_EVAL" style="width: 180px;" />
        </el-form-item>
        <el-form-item label="目标对象">
          <el-select v-model="filters.targetObjectType" clearable placeholder="全部" style="width: 180px;">
            <el-option label="在校学生" value="IN_SCHOOL_STUDENT" />
            <el-option label="学生" value="STUDENT" />
            <el-option label="毕业生" value="GRADUATE" />
            <el-option label="教师" value="TEACHER" />
            <el-option label="用人单位" value="EMPLOYER" />
            <el-option label="全部" value="ALL" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model.trim="filters.keyword" clearable placeholder="编码 / 标题" style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.page" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <SectionCard v-if="apiUnavailable" title="接口状态">
      <el-result
        icon="warning"
        title="问卷接口不可用"
        sub-title="当前运行的后端没有提供 /api/surveys/questionnaires，因此这里不显示任何本地假数据。"
      />
    </SectionCard>

    <SectionCard v-else title="问卷列表">
      <el-table v-loading="loading.page" :data="questionnaires" border stripe>
        <el-table-column prop="questionnaireCode" label="编码" min-width="160" />
        <el-table-column prop="title" label="标题" min-width="220" />
        <el-table-column prop="questionnaireType" label="类型" min-width="140" />
        <el-table-column prop="targetObjectType" label="对象" min-width="140" />
        <el-table-column prop="publishStatus" label="状态" min-width="120" />
        <el-table-column prop="questionCount" label="题目数" min-width="90" />
        <el-table-column prop="scopeCount" label="范围数" min-width="90" />
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
  </StandardPage>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { fetchSurveyQuestionnaires } from '../../api/survey';

const loading = reactive({ page: false });
const apiUnavailable = ref(false);
const questionnaires = ref([]);

const filters = reactive({
  publishStatus: '',
  questionnaireType: '',
  targetObjectType: '',
  keyword: ''
});

const pager = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

async function loadPage() {
  loading.page = true;
  try {
    const page = await fetchSurveyQuestionnaires({
      pageNum: pager.pageNum,
      pageSize: pager.pageSize,
      publishStatus: filters.publishStatus,
      questionnaireType: filters.questionnaireType,
      targetObjectType: filters.targetObjectType,
      keyword: filters.keyword
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

function handleSearch() {
  pager.pageNum = 1;
  loadPage();
}

function resetFilters() {
  filters.publishStatus = '';
  filters.questionnaireType = '';
  filters.targetObjectType = '';
  filters.keyword = '';
  pager.pageNum = 1;
  loadPage();
}

onMounted(async () => {
  try {
    await loadPage();
  } catch {
    // Error toast is handled by the shared request layer when needed.
  }
});
</script>
