<template>
  <StandardPage
    title="持续改进计划"
    :breadcrumbs="['首页', '问卷与改进', '持续改进计划']"
    description="仅展示真实后端数据；有数据就显示数据，空列表就显示暂无数据。"
  >
    <template #actions>
      <el-button :loading="loading.page" @click="loadPage">刷新</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable placeholder="全部" style="width: 160px;">
            <el-option label="待执行" value="PENDING" />
            <el-option label="执行中" value="IN_PROGRESS" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已验证" value="VERIFIED" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源类型">
          <el-input v-model.trim="filters.sourceType" clearable placeholder="如 EVAL_RESULT" style="width: 180px;" />
        </el-form-item>
        <el-form-item label="目标类型">
          <el-input v-model.trim="filters.targetType" clearable placeholder="如 COURSE" style="width: 180px;" />
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model.trim="filters.keyword" clearable placeholder="编码 / 名称" style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.page" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <SectionCard v-if="apiUnavailable" title="加载状态">
      <el-result
        icon="warning"
        title="改进计划数据暂时无法加载"
        sub-title="当前运行实例请求 /api/improve/plans 返回 404。若你确认源码已实现该接口，请检查现在启动的后端实例是否是最新版本。"
      />
    </SectionCard>

    <SectionCard v-else title="改进计划列表">
      <el-table v-loading="loading.page" :data="plans" border stripe>
        <el-table-column prop="planCode" label="编码" min-width="160" />
        <el-table-column prop="planName" label="名称" min-width="220" />
        <el-table-column prop="sourceType" label="来源类型" min-width="140" />
        <el-table-column prop="targetType" label="目标类型" min-width="140" />
        <el-table-column prop="status" label="状态" min-width="120" />
        <el-table-column prop="priority" label="优先级" min-width="90" />
        <el-table-column prop="dueDate" label="截止日期" min-width="120" />
      </el-table>

      <el-empty v-if="!loading.page && !plans.length" description="暂无改进计划数据" />

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
import { fetchImprovePlans } from '../../api/improve';

const loading = reactive({ page: false });
const apiUnavailable = ref(false);
const plans = ref([]);

const filters = reactive({
  status: '',
  sourceType: '',
  targetType: '',
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
    const page = await fetchImprovePlans({
      pageNum: pager.pageNum,
      pageSize: pager.pageSize,
      status: filters.status,
      sourceType: filters.sourceType,
      targetType: filters.targetType,
      keyword: filters.keyword
    }, { skipErrorMessage: true });

    apiUnavailable.value = false;
    plans.value = page?.records || [];
    pager.total = Number(page?.total || 0);
  } catch (error) {
    if (error?.response?.status === 404) {
      apiUnavailable.value = true;
      plans.value = [];
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
  filters.status = '';
  filters.sourceType = '';
  filters.targetType = '';
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
