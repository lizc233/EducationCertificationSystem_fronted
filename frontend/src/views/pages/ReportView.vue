<template>
  <StandardPage
    title="自评报告"
    :breadcrumbs="['首页', '报告中心', '自评报告']"
    description="维护报告项目、章节任务、进度看板和草稿内容，并提供 AI 章节初稿与润色入口。"
  >
    <template #actions>
      <el-button type="primary" @click="projectDialogVisible = true">新建项目</el-button>
      <el-button @click="openAssignmentDialog" :disabled="!selectedChapter">分配任务</el-button>
      <el-button @click="generateCurrentDraft" :disabled="!selectedProjectId" :loading="loading.operate">生成初稿</el-button>
      <el-button @click="openAiAssistant" :disabled="!selectedChapter">AI 润色</el-button>
      <el-button @click="downloadMergedReport" :disabled="!selectedProjectId">导出合并稿</el-button>
      <el-button :loading="loading.page" @click="loadProjects">刷新</el-button>
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
            <el-option v-for="item in semesterOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model.trim="filters.keyword" clearable placeholder="编码 / 项目名称" style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.page" @click="loadProjects">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <div class="report-shell">
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
                <div class="project-list-item__title">{{ item.projectName }}</div>
                <div class="project-list-item__code">{{ item.reportCode }}</div>
              </div>
              <el-tag :type="projectStatusType(item.status)">{{ item.status || 'DRAFT' }}</el-tag>
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
            @size-change="loadProjects"
          />
        </div>
      </SectionCard>

      <SectionCard title="章节树与草稿编辑" class="report-editor">
        <div v-if="projectDetail" class="report-meta-bar">
          <div>
            <h3 class="report-meta-bar__title">{{ projectDetail.projectName }}</h3>
            <div class="report-meta-bar__desc">
              {{ projectDetail.reportCode }} · {{ projectDetail.academicYear || '-' }} · {{ projectDetail.semesterName || '-' }}
            </div>
          </div>
          <div class="report-meta-bar__actions">
            <el-button type="primary" link @click="openChapterDialog()">新增根章节</el-button>
            <el-button type="primary" link :disabled="!selectedChapter" @click="openChapterDialog(selectedChapter)">新增子章节</el-button>
            <el-button type="warning" link :disabled="!selectedChapter" @click="toggleChapterLock">
              {{ selectedChapter?.lockedFlag === 1 ? '解锁章节' : '锁定章节' }}
            </el-button>
          </div>
        </div>

        <div class="report-editor-shell">
          <SectionCard title="章节结构">
            <el-tree
              v-if="projectDetail?.chapters?.length"
              :data="treeNodes"
              node-key="id"
              default-expand-all
              highlight-current
              :current-node-key="selectedChapterId"
              :props="{ label: 'label', children: 'children' }"
              @node-click="handleChapterClick"
            />
            <el-empty v-else description="当前项目尚未配置章节树" />
          </SectionCard>

          <SectionCard :title="selectedChapter ? `章节编辑：${selectedChapter.chapterTitle}` : '章节编辑区'">
            <template #extra>
              <el-button-group v-if="selectedChapter">
                <el-button @click="saveCurrentDraft" :loading="loading.operate">保存草稿</el-button>
                <el-button @click="saveCurrentProgress" :loading="loading.operate">记录进度</el-button>
              </el-button-group>
            </template>

            <div v-if="selectedChapter" class="chapter-editor-panel">
              <div class="chapter-editor-panel__meta">
                <article class="chapter-meta-card">
                  <div class="chapter-meta-card__label">状态</div>
                  <div class="chapter-meta-card__value">{{ selectedChapter.chapterStatus || 'TODO' }}</div>
                </article>
                <article class="chapter-meta-card">
                  <div class="chapter-meta-card__label">进度</div>
                  <div class="chapter-meta-card__value">{{ selectedChapter.progressPercent || 0 }}%</div>
                </article>
                <article class="chapter-meta-card">
                  <div class="chapter-meta-card__label">任务数</div>
                  <div class="chapter-meta-card__value">{{ selectedChapter.assignments?.length || 0 }}</div>
                </article>
              </div>

              <el-input
                v-model="editorState.draftContent"
                type="textarea"
                :rows="20"
                placeholder="输入或生成章节内容"
              />

              <div class="chapter-editor-form">
                <el-select v-model="editorState.chapterStatus" style="width: 180px;">
                  <el-option label="待开始" value="TODO" />
                  <el-option label="进行中" value="IN_PROGRESS" />
                  <el-option label="已完成" value="COMPLETED" />
                </el-select>
                <el-input-number v-model="editorState.progressPercent" :min="0" :max="100" :step="5" style="width: 180px;" />
                <el-input v-model="editorState.comment" placeholder="本次修改说明" />
              </div>
            </div>
            <el-empty v-else description="请选择左侧章节开始编辑" />
          </SectionCard>
        </div>
      </SectionCard>

      <SectionCard title="进度看板与任务">
        <div class="page-kpis">
          <article class="page-kpi">
            <div class="page-kpi__label">可见章节</div>
            <div class="page-kpi__value">{{ projectDetail?.progressBoard?.visibleChapterCount || projectDetail?.visibleChapterCount || 0 }}</div>
            <div class="page-kpi__desc">纳入当前导出范围的章节数</div>
          </article>
          <article class="page-kpi">
            <div class="page-kpi__label">已完成章节</div>
            <div class="page-kpi__value">{{ projectDetail?.progressBoard?.completedChapterCount || 0 }}</div>
            <div class="page-kpi__desc">已完成撰写并达到完成状态的章节</div>
          </article>
          <article class="page-kpi">
            <div class="page-kpi__label">超期任务</div>
            <div class="page-kpi__value">{{ projectDetail?.progressBoard?.overdueAssignmentCount || 0 }}</div>
            <div class="page-kpi__desc">已分配但超期未完成的章节任务数</div>
          </article>
          <article class="page-kpi">
            <div class="page-kpi__label">项目进度</div>
            <div class="page-kpi__value">{{ projectDetail?.progressBoard?.progressPercent || 0 }}%</div>
            <div class="page-kpi__desc">由章节完成度汇总得到的整体进度</div>
          </article>
        </div>

        <SectionCard title="当前章节任务" style="margin-top: 18px;">
          <el-table :data="selectedChapter?.assignments || []" border stripe>
            <el-table-column prop="assigneeUserName" label="负责人" min-width="120" />
            <el-table-column prop="roleType" label="角色" min-width="120" />
            <el-table-column prop="assignmentStatus" label="任务状态" min-width="120" />
            <el-table-column prop="dueDate" label="截止日期" min-width="120" />
            <el-table-column prop="remark" label="备注" min-width="180" />
          </el-table>
        </SectionCard>

        <SectionCard title="最新进度日志" style="margin-top: 18px;">
          <el-timeline v-if="projectDetail?.progressBoard?.latestLogs?.length">
            <el-timeline-item
              v-for="log in projectDetail.progressBoard.latestLogs"
              :key="log.id"
              :timestamp="formatDateTime(log.createdAt || log.logTime)"
            >
              <div>{{ log.comment || log.remark || '无日志说明' }}</div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无进度日志" />
        </SectionCard>
      </SectionCard>
    </div>

    <el-dialog v-model="projectDialogVisible" title="新建报告项目" width="620px">
      <el-form label-position="top" :model="projectForm">
        <div class="dialog-grid">
          <el-form-item label="项目编码">
            <el-input v-model.trim="projectForm.reportCode" />
          </el-form-item>
          <el-form-item label="项目名称">
            <el-input v-model.trim="projectForm.projectName" />
          </el-form-item>
          <el-form-item label="学年">
            <el-input v-model.trim="projectForm.academicYear" placeholder="如 2025-2026" />
          </el-form-item>
          <el-form-item label="学期">
            <el-select v-model="projectForm.semesterId" style="width: 100%;">
              <el-option v-for="item in semesterOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="项目负责人ID">
            <el-input-number v-model="projectForm.ownerUserId" :min="1" :step="1" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="生成模式">
            <el-select v-model="projectForm.generationMode" style="width: 100%;">
              <el-option label="手工撰写" value="MANUAL" />
              <el-option label="系统初稿" value="AUTO_DRAFT" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="备注">
          <el-input v-model="projectForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="projectDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.operate" @click="createProject">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="chapterDialogVisible" :title="chapterDialogTitle" width="520px">
      <el-form label-position="top" :model="chapterForm">
        <el-form-item label="章节编码">
          <el-input v-model.trim="chapterForm.chapterCode" />
        </el-form-item>
        <el-form-item label="章节标题">
          <el-input v-model.trim="chapterForm.chapterTitle" />
        </el-form-item>
        <el-form-item label="来源类型">
          <el-input v-model.trim="chapterForm.sourceType" placeholder="如 COURSE / REQUIREMENT" />
        </el-form-item>
        <el-form-item label="来源ID">
          <el-input-number v-model="chapterForm.sourceRefId" :min="1" :step="1" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="chapterDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.operate" @click="submitChapter">保存章节</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="assignmentDialogVisible" title="分配章节任务" width="520px">
      <el-form label-position="top" :model="assignmentForm">
        <el-form-item label="章节">
          <el-input :model-value="selectedChapter?.chapterTitle || ''" disabled />
        </el-form-item>
        <el-form-item label="负责人用户ID">
          <el-input-number v-model="assignmentForm.assigneeUserId" :min="1" :step="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="角色">
          <el-input v-model.trim="assignmentForm.roleType" placeholder="如 WRITER / REVIEWER" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="assignmentForm.dueDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="任务状态">
          <el-select v-model="assignmentForm.assignmentStatus" style="width: 100%;">
            <el-option label="待执行" value="PENDING" />
            <el-option label="执行中" value="IN_PROGRESS" />
            <el-option label="已完成" value="COMPLETED" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="assignmentForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignmentDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.operate" @click="submitAssignment">保存任务</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { fetchSemesters } from '../../api/lookups';
import {
  buildMergedReportDownloadUrl,
  createReportProject,
  fetchReportProjectDetail,
  fetchReportProjects,
  generateReportDrafts,
  lockReportChapter,
  previewMergedReport,
  saveReportAssignments,
  saveReportChapters,
  saveReportDraft,
  saveReportProgress
} from '../../api/report';
import { useUserStore } from '../../store/user';

const router = useRouter();
const userStore = useUserStore();

const loading = reactive({
  page: false,
  detail: false,
  operate: false
});

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

const semesterOptions = ref([]);
const projects = ref([]);
const selectedProjectId = ref(null);
const projectDetail = ref(null);
const selectedChapterId = ref(null);
const editorState = reactive({
  draftContent: '',
  chapterStatus: 'TODO',
  progressPercent: 0,
  comment: ''
});

const projectDialogVisible = ref(false);
const projectForm = reactive({
  reportCode: '',
  projectName: '',
  academicYear: '',
  semesterId: null,
  ownerUserId: userStore.userInfo.id || 1,
  generationMode: 'MANUAL',
  remark: ''
});

const chapterDialogVisible = ref(false);
const chapterDialogTitle = ref('新增章节');
const chapterParentId = ref(null);
const chapterForm = reactive({
  chapterCode: '',
  chapterTitle: '',
  sourceType: '',
  sourceRefId: null
});

const assignmentDialogVisible = ref(false);
const assignmentForm = reactive({
  assigneeUserId: userStore.userInfo.id || 1,
  roleType: 'WRITER',
  dueDate: '',
  assignmentStatus: 'PENDING',
  remark: ''
});

const selectedChapter = computed(() => findChapterById(projectDetail.value?.chapters || [], selectedChapterId.value));

const treeNodes = computed(() => mapChapterTree(projectDetail.value?.chapters || []));

function projectStatusType(status) {
  if (status === 'COMPLETED') return 'success';
  if (status === 'IN_PROGRESS') return 'warning';
  return 'info';
}

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

function resetFilters() {
  filters.status = '';
  filters.semesterId = null;
  filters.keyword = '';
  pager.pageNum = 1;
  loadProjects();
}

function mapChapterTree(nodes = []) {
  return nodes.map((node) => ({
    ...node,
    label: `${node.chapterCode || ''} ${node.chapterTitle || ''}`.trim(),
    children: mapChapterTree(node.children || [])
  }));
}

function flattenChapters(nodes = []) {
  return nodes.flatMap((node) => [node, ...flattenChapters(node.children || [])]);
}

function findChapterById(nodes = [], id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = findChapterById(node.children || [], id);
    if (child) return child;
  }
  return null;
}

function buildChapterPayload(nodes = []) {
  return nodes.map((node, index) => ({
    id: node.id,
    chapterCode: node.chapterCode,
    chapterTitle: node.chapterTitle,
    sourceType: node.sourceType,
    sourceRefId: node.sourceRefId,
    sortNo: node.sortNo ?? index + 1,
    remark: node.remark || '',
    children: buildChapterPayload(node.children || [])
  }));
}

function collectAssignments(nodes = []) {
  return nodes.flatMap((node) => {
    const currentAssignments = (node.assignments || []).map((assignment) => ({
      chapterId: node.id,
      assigneeUserId: assignment.assigneeUserId,
      roleType: assignment.roleType,
      dueDate: assignment.dueDate,
      assignmentStatus: assignment.assignmentStatus,
      remark: assignment.remark || ''
    }));
    return [...currentAssignments, ...collectAssignments(node.children || [])];
  });
}

function createChapterNode(formValue, parentId = null, sortNo = 1) {
  return {
    id: null,
    parentId,
    chapterCode: formValue.chapterCode,
    chapterTitle: formValue.chapterTitle,
    sourceType: formValue.sourceType,
    sourceRefId: formValue.sourceRefId,
    chapterStatus: 'TODO',
    sortNo,
    lockedFlag: 0,
    progressPercent: 0,
    editableFlag: 1,
    assignments: [],
    drafts: [],
    children: []
  };
}

async function loadSemesters() {
  semesterOptions.value = await fetchSemesters();
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
    });
    projects.value = (page.records || []).filter((item) => {
      if (!filters.semesterId) return true;
      return item.semesterId === filters.semesterId;
    });
    pager.total = Number(page.total || 0);
    if (!selectedProjectId.value && projects.value.length) {
      await selectProject(projects.value[0].id);
    }
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
    });
    const firstChapter = flattenChapters(projectDetail.value.chapters || [])[0];
    if (firstChapter) {
      handleChapterClick(firstChapter);
    } else {
      selectedChapterId.value = null;
    }
  } finally {
    loading.detail = false;
  }
}

function handleChapterClick(node) {
  selectedChapterId.value = node.id;
  const latestDraft = [...(node.drafts || [])].sort((left, right) => (right.versionNo || 0) - (left.versionNo || 0))[0];
  editorState.draftContent = latestDraft?.draftContent || node.contentText || '';
  editorState.chapterStatus = node.chapterStatus || 'TODO';
  editorState.progressPercent = Number(node.progressPercent || 0);
  editorState.comment = '';
}

async function createProject() {
  loading.operate = true;
  try {
    const saved = await createReportProject({
      reportCode: projectForm.reportCode,
      projectName: projectForm.projectName,
      academicYear: projectForm.academicYear,
      semesterId: projectForm.semesterId,
      ownerUserId: projectForm.ownerUserId,
      generationMode: projectForm.generationMode,
      remark: projectForm.remark,
      chapters: []
    });
    projectDialogVisible.value = false;
    Object.assign(projectForm, {
      reportCode: '',
      projectName: '',
      academicYear: '',
      semesterId: null,
      ownerUserId: userStore.userInfo.id || 1,
      generationMode: 'MANUAL',
      remark: ''
    });
    await loadProjects();
    await selectProject(saved.id);
    ElMessage.success('报告项目已创建');
  } finally {
    loading.operate = false;
  }
}

function openChapterDialog(parent = null) {
  chapterDialogTitle.value = parent ? `新增子章节：${parent.chapterTitle}` : '新增根章节';
  chapterParentId.value = parent?.id || null;
  Object.assign(chapterForm, {
    chapterCode: '',
    chapterTitle: '',
    sourceType: '',
    sourceRefId: null
  });
  chapterDialogVisible.value = true;
}

async function submitChapter() {
  if (!selectedProjectId.value || !projectDetail.value) return;
  loading.operate = true;
  try {
    const tree = structuredClone(projectDetail.value.chapters || []);
    if (chapterParentId.value) {
      const parent = findChapterById(tree, chapterParentId.value);
      parent.children = parent.children || [];
      parent.children.push(createChapterNode(chapterForm, parent.id, parent.children.length + 1));
    } else {
      tree.push(createChapterNode(chapterForm, null, tree.length + 1));
    }
    await saveReportChapters(selectedProjectId.value, buildChapterPayload(tree));
    chapterDialogVisible.value = false;
    await selectProject(selectedProjectId.value);
    ElMessage.success('章节树已更新');
  } finally {
    loading.operate = false;
  }
}

async function saveCurrentDraft() {
  if (!selectedChapter.value) return;
  loading.operate = true;
  try {
    await saveReportDraft(selectedChapter.value.id, {
      editedBy: userStore.userInfo.id,
      draftContent: editorState.draftContent,
      chapterStatus: editorState.chapterStatus,
      progressPercent: editorState.progressPercent,
      comment: editorState.comment,
      remark: '前端保存章节草稿'
    });
    await selectProject(selectedProjectId.value);
    ElMessage.success('章节草稿已保存');
  } finally {
    loading.operate = false;
  }
}

async function saveCurrentProgress() {
  if (!selectedProjectId.value || !selectedChapter.value) return;
  loading.operate = true;
  try {
    await saveReportProgress(selectedProjectId.value, {
      chapterId: selectedChapter.value.id,
      userId: userStore.userInfo.id,
      progressPercent: editorState.progressPercent,
      comment: editorState.comment || '前端更新章节进度',
      remark: '前端写入进度日志'
    });
    await selectProject(selectedProjectId.value);
    ElMessage.success('进度日志已记录');
  } finally {
    loading.operate = false;
  }
}

async function generateCurrentDraft() {
  if (!selectedProjectId.value) return;
  loading.operate = true;
  try {
    await generateReportDrafts(selectedProjectId.value, {
      editedBy: userStore.userInfo.id,
      overwriteEmptyOnly: 1,
      chapterIds: selectedChapter.value ? [selectedChapter.value.id] : [],
      remark: '前端生成初稿'
    });
    await selectProject(selectedProjectId.value);
    ElMessage.success('报告初稿生成完成');
  } finally {
    loading.operate = false;
  }
}

async function toggleChapterLock() {
  if (!selectedChapter.value) return;
  loading.operate = true;
  try {
    await lockReportChapter(selectedChapter.value.id, {
      lockedFlag: selectedChapter.value.lockedFlag === 1 ? 0 : 1,
      remark: '前端锁定状态切换'
    });
    await selectProject(selectedProjectId.value);
    ElMessage.success(selectedChapter.value.lockedFlag === 1 ? '章节已解锁' : '章节已锁定');
  } finally {
    loading.operate = false;
  }
}

function openAssignmentDialog() {
  if (!selectedChapter.value) return;
  Object.assign(assignmentForm, {
    assigneeUserId: userStore.userInfo.id || 1,
    roleType: 'WRITER',
    dueDate: '',
    assignmentStatus: 'PENDING',
    remark: ''
  });
  assignmentDialogVisible.value = true;
}

async function submitAssignment() {
  if (!selectedChapter.value || !projectDetail.value) return;
  loading.operate = true;
  try {
    const requests = collectAssignments(projectDetail.value.chapters || []);
    requests.push({
      chapterId: selectedChapter.value.id,
      assigneeUserId: assignmentForm.assigneeUserId,
      roleType: assignmentForm.roleType,
      dueDate: assignmentForm.dueDate,
      assignmentStatus: assignmentForm.assignmentStatus,
      remark: assignmentForm.remark
    });
    await saveReportAssignments(selectedProjectId.value, requests);
    assignmentDialogVisible.value = false;
    await selectProject(selectedProjectId.value);
    ElMessage.success('章节任务已分配');
  } finally {
    loading.operate = false;
  }
}

async function downloadMergedReport() {
  if (!selectedProjectId.value) return;
  await previewMergedReport(selectedProjectId.value);
  window.open(buildMergedReportDownloadUrl(selectedProjectId.value), '_blank');
}

function openAiAssistant() {
  if (!selectedChapter.value) return;
  router.push({
    path: '/ai',
    query: {
      mode: 'report',
      projectId: String(selectedProjectId.value),
      chapterId: String(selectedChapter.value.id)
    }
  });
}

onMounted(async () => {
  await Promise.all([loadSemesters(), loadProjects()]);
});
</script>

<style scoped>
.report-shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1.2fr) 360px;
  gap: 20px;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 760px;
  overflow: auto;
}

.project-list-item,
.chapter-meta-card {
  padding: 16px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
}

.project-list-item {
  width: 100%;
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
.report-meta-bar,
.report-meta-bar__actions,
.chapter-editor-form,
.chapter-editor-panel__meta {
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

.report-editor,
.report-editor-shell {
  display: grid;
  gap: 18px;
}

.report-editor-shell {
  grid-template-columns: 320px minmax(0, 1fr);
}

.chapter-editor-panel {
  display: grid;
  gap: 16px;
}

.chapter-meta-card__label {
  font-size: 12px;
  color: var(--text-light);
}

.chapter-meta-card__value {
  margin-top: 10px;
  font-weight: 600;
}

.dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1480px) {
  .report-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1080px) {
  .report-editor-shell,
  .dialog-grid {
    grid-template-columns: 1fr;
  }
  .report-meta-bar,
  .chapter-editor-form,
  .chapter-editor-panel__meta {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
