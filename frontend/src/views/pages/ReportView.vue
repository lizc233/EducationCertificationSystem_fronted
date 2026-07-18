<template>
  <StandardPage
    title="自评报告"
    :breadcrumbs="['首页', '报告中心', '自评报告']"
    description="查看报告项目、章节结构和当前进度。"
  >
    <template #actions>
      <el-button :loading="loading.page" @click="loadPage">刷新</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable placeholder="全部状态" style="width: 160px;">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="进行中" value="IN_PROGRESS" />
            <el-option label="已完成" value="COMPLETED" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-select v-model="filters.semesterId" clearable placeholder="全部学期" style="width: 180px;">
            <el-option
              v-for="item in semesterOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model.trim="filters.keyword" clearable placeholder="编码 / 项目名称" style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.page" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <SectionCard v-if="loadFailed" title="页面状态">
      <el-result
        icon="warning"
        title="报告数据暂时无法加载"
        sub-title="请稍后刷新重试。"
      />
    </SectionCard>

    <div v-else class="report-shell">
      <SectionCard title="报告项目">
        <div v-loading="loading.page" class="project-list soft-scrollbar">
          <button
            v-for="item in projects"
            :key="item.id"
            type="button"
            class="project-list-item"
            :class="{ 'is-active': item.id === selectedProjectId }"
            @click="selectProject(item.id)"
          >
            <div class="project-list-item__head">
              <div>
                <div class="project-list-item__title">{{ item.projectName || '未命名项目' }}</div>
                <div class="project-list-item__code">{{ item.reportCode || '-' }}</div>
              </div>
              <el-tag :type="projectStatusType(item.status)">{{ statusLabel(item.status) }}</el-tag>
            </div>
            <div class="project-list-item__meta">
              <span class="small-tag">{{ item.academicYear || '-' }}</span>
              <span class="small-tag">{{ item.semesterName || '-' }}</span>
            </div>
            <div class="project-list-item__desc">
              章节 {{ item.completedChapterCount || 0 }}/{{ item.totalChapters || 0 }}，
              进度 {{ item.progressPercent || 0 }}%
            </div>
          </button>
          <el-empty v-if="!loading.page && !projects.length" description="暂无报告项目" />
        </div>

        <div class="crud-pagination">
          <el-pagination
            v-model:current-page="pager.pageNum"
            v-model:page-size="pager.pageSize"
            background
            layout="total, prev, pager, next"
            :total="pager.total"
            @current-change="loadProjects"
          />
        </div>
      </SectionCard>

      <SectionCard title="项目详情" class="report-detail-card">
        <el-result
          v-if="detailFailed"
          icon="warning"
          title="当前报告详情暂时无法加载"
          sub-title="请重新选择项目或稍后重试。"
        />

        <template v-else-if="projectDetail">
          <div class="report-meta-bar">
            <div>
              <h3 class="report-meta-bar__title">{{ projectDetail.projectName || '未命名项目' }}</h3>
              <div class="report-meta-bar__desc">
                {{ projectDetail.reportCode || '-' }} / {{ projectDetail.academicYear || '-' }} / {{ projectDetail.semesterName || '-' }}
              </div>
            </div>
            <el-tag :type="projectStatusType(projectDetail.status)">
              {{ statusLabel(projectDetail.status) }}
            </el-tag>
          </div>

          <div class="page-kpis">
            <article class="page-kpi">
              <div class="page-kpi__label">项目进度</div>
              <div class="page-kpi__value">{{ projectDetail.progressBoard?.progressPercent || projectDetail.progressPercent || 0 }}%</div>
              <div class="page-kpi__desc">按章节完成情况统计。</div>
            </article>
            <article class="page-kpi">
              <div class="page-kpi__label">可见章节</div>
              <div class="page-kpi__value">{{ projectDetail.progressBoard?.visibleChapterCount || projectDetail.visibleChapterCount || 0 }}</div>
              <div class="page-kpi__desc">当前纳入统计的章节数量。</div>
            </article>
            <article class="page-kpi">
              <div class="page-kpi__label">已完成章节</div>
              <div class="page-kpi__value">{{ projectDetail.progressBoard?.completedChapterCount || projectDetail.completedChapterCount || 0 }}</div>
              <div class="page-kpi__desc">已经完成撰写的章节数量。</div>
            </article>
            <article class="page-kpi">
              <div class="page-kpi__label">逾期任务</div>
              <div class="page-kpi__value">{{ projectDetail.progressBoard?.overdueAssignmentCount || 0 }}</div>
              <div class="page-kpi__desc">当前逾期未完成的任务数量。</div>
            </article>
          </div>

          <div class="report-detail-grid">
            <SectionCard title="章节结构">
              <el-tree
                v-if="chapterTree.length"
                :data="chapterTree"
                node-key="id"
                default-expand-all
                :props="{ label: 'label', children: 'children' }"
              />
              <el-empty v-else description="暂无章节数据" />
            </SectionCard>

            <SectionCard title="最新进度">
              <el-timeline v-if="latestLogs.length">
                <el-timeline-item
                  v-for="log in latestLogs"
                  :key="log.id || `${log.createdAt}-${log.comment}`"
                  :timestamp="formatDateTime(log.createdAt || log.logTime)"
                >
                  <div>{{ log.comment || log.remark || '暂无进度说明' }}</div>
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="暂无进度记录" />
            </SectionCard>
          </div>
        </template>

        <el-empty v-else description="暂无报告项目" />
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { fetchSemesters } from '../../api/lookups';
import { fetchReportProjectDetail, fetchReportProjects } from '../../api/report';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();

const loading = reactive({
  page: false,
  detail: false
});

const loadFailed = ref(false);
const detailFailed = ref(false);
const semesterOptions = ref([]);
const projects = ref([]);
const selectedProjectId = ref(null);
const projectDetail = ref(null);

const filters = reactive({
  status: '',
  semesterId: null,
  keyword: ''
});

const pager = reactive({
  pageNum: 1,
  pageSize: 8,
  total: 0
});

const chapterTree = computed(() => mapChapterTree(projectDetail.value?.chapters || []));
const latestLogs = computed(() => projectDetail.value?.progressBoard?.latestLogs || []);

function statusLabel(status) {
  if (status === 'COMPLETED') return '已完成';
  if (status === 'IN_PROGRESS') return '进行中';
  return '草稿';
}

function projectStatusType(status) {
  if (status === 'COMPLETED') return 'success';
  if (status === 'IN_PROGRESS') return 'warning';
  return 'info';
}

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

function mapChapterTree(nodes = []) {
  return nodes.map((node) => ({
    ...node,
    label: `${node.chapterCode || ''} ${node.chapterTitle || ''}`.trim() || '未命名章节',
    children: mapChapterTree(node.children || [])
  }));
}

async function loadSemesters() {
  try {
    semesterOptions.value = await fetchSemesters();
  } catch {
    semesterOptions.value = [];
  }
}

async function loadProjects() {
  loading.page = true;
  try {
    const page = await fetchReportProjects({
      pageNum: pager.pageNum,
      pageSize: pager.pageSize,
      status: filters.status,
      viewerUserId: userStore.userInfo.role === 'ROLE_TEACHER' ? userStore.userInfo.id : undefined,
      keyword: filters.keyword
    }, {
      skipErrorMessage: true
    });

    const records = Array.isArray(page?.records) ? page.records : [];
    projects.value = records.filter((item) => (
      !filters.semesterId || item.semesterId === filters.semesterId
    ));
    pager.total = Number(page?.total || 0);
    loadFailed.value = false;

    if (!projects.value.length) {
      selectedProjectId.value = null;
      projectDetail.value = null;
      detailFailed.value = false;
      return;
    }

    if (!projects.value.some((item) => item.id === selectedProjectId.value)) {
      await selectProject(projects.value[0].id);
    }
  } catch {
    loadFailed.value = true;
    detailFailed.value = false;
    projects.value = [];
    selectedProjectId.value = null;
    projectDetail.value = null;
    pager.total = 0;
  } finally {
    loading.page = false;
  }
}

async function selectProject(id) {
  if (!id) return;

  selectedProjectId.value = id;
  loading.detail = true;
  try {
    projectDetail.value = await fetchReportProjectDetail(id, {
      viewerUserId: userStore.userInfo.role === 'ROLE_TEACHER' ? userStore.userInfo.id : undefined
    }, {
      skipErrorMessage: true
    });
    detailFailed.value = false;
  } catch {
    projectDetail.value = null;
    detailFailed.value = true;
  } finally {
    loading.detail = false;
  }
}

async function loadPage() {
  await Promise.allSettled([loadSemesters(), loadProjects()]);
}

function handleSearch() {
  pager.pageNum = 1;
  loadProjects();
}

function resetFilters() {
  filters.status = '';
  filters.semesterId = null;
  filters.keyword = '';
  pager.pageNum = 1;
  loadProjects();
}

onMounted(() => {
  loadPage();
});
</script>

<style scoped>
.report-shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 220px;
  max-height: 760px;
  overflow: auto;
}

.project-list-item {
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.project-list-item:hover,
.project-list-item.is-active {
  transform: translateY(-2px);
  border-color: rgba(27, 76, 87, 0.28);
  box-shadow: 0 12px 24px rgba(27, 76, 87, 0.08);
}

.project-list-item__head,
.report-meta-bar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.project-list-item__title,
.report-meta-bar__title {
  font-weight: 600;
  color: var(--text-primary);
}

.project-list-item__code,
.project-list-item__desc,
.project-list-item__meta,
.report-meta-bar__desc {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-light);
}

.project-list-item__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.report-detail-card {
  min-height: 100%;
}

.page-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 20px;
}

.page-kpi {
  padding: 16px 18px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
}

.page-kpi__label {
  font-size: 12px;
  color: var(--text-light);
}

.page-kpi__value {
  margin-top: 10px;
  font-family: var(--font-serif);
  font-size: 30px;
  color: #1b4c57;
}

.page-kpi__desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-light);
}

.report-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 20px;
}

@media (max-width: 1320px) {
  .report-shell {
    grid-template-columns: 1fr;
  }

  .page-kpis,
  .report-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .page-kpis,
  .report-detail-grid {
    grid-template-columns: 1fr;
  }

  .project-list-item__head,
  .report-meta-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
