<template>
  <StandardPage
    title="持续改进计划"
    :breadcrumbs="['首页', '问卷与改进', '持续改进计划']"
    description="维护改进计划、行动项、执行进度和过程记录。"
  >
    <template #actions>
      <el-button @click="openCreate">新建计划</el-button>
      <el-button :loading="loading.page" @click="loadPage">刷新</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable placeholder="全部" style="width: 160px;">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源类型">
          <el-input v-model.trim="filters.sourceType" clearable placeholder="如 EVAL_RESULT" style="width: 170px;" />
        </el-form-item>
        <el-form-item label="目标类型">
          <el-input v-model.trim="filters.targetType" clearable placeholder="如 COURSE" style="width: 170px;" />
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

    <div class="improve-shell">
      <SectionCard title="计划列表">
        <el-table
          v-loading="loading.page"
          :data="plans"
          border
          stripe
          highlight-current-row
          @current-change="handleCurrentChange"
        >
          <el-table-column prop="planCode" label="编码" min-width="150" />
          <el-table-column prop="planName" label="名称" min-width="220" />
          <el-table-column prop="sourceType" label="来源类型" min-width="130" />
          <el-table-column prop="targetType" label="目标类型" min-width="130" />
          <el-table-column prop="ownerUserName" label="负责人" min-width="130" />
          <el-table-column label="状态" min-width="110">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" width="90" />
          <el-table-column prop="dueDate" label="截止日期" min-width="120" />
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openEdit(row.id)">编辑</el-button>
              <el-button type="primary" link @click="openVerify(row)">验证</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
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

      <SectionCard title="计划详情">
        <template #extra>
          <div class="detail-actions">
            <el-button :disabled="!detail" @click="openEdit(detail?.id)">编辑</el-button>
            <el-button :disabled="!detail" :loading="loading.action" @click="handlePlanAction('start')">开始执行</el-button>
            <el-button :disabled="!detail" :loading="loading.action" @click="handlePlanAction('complete')">完成计划</el-button>
            <el-button :disabled="!detail" :loading="loading.action" @click="sendReminder">催办提醒</el-button>
            <el-button :disabled="!detail" @click="openAiPage">AI建议</el-button>
          </div>
        </template>

        <template v-if="detail">
          <div class="page-kpis">
            <article class="page-kpi">
              <div class="page-kpi__label">计划状态</div>
              <div class="page-kpi__value page-kpi__value--small">{{ statusLabel(detail.status) }}</div>
              <div class="page-kpi__desc">当前计划的执行阶段</div>
            </article>
            <article class="page-kpi">
              <div class="page-kpi__label">行动项</div>
              <div class="page-kpi__value">{{ detail.actionCount || 0 }}</div>
              <div class="page-kpi__desc">计划下的行动项数量</div>
            </article>
            <article class="page-kpi">
              <div class="page-kpi__label">已完成</div>
              <div class="page-kpi__value">{{ detail.completedActionCount || 0 }}</div>
              <div class="page-kpi__desc">已完成行动项数量</div>
            </article>
            <article class="page-kpi">
              <div class="page-kpi__label">截止日期</div>
              <div class="page-kpi__value page-kpi__value--small">{{ detail.dueDate || '-' }}</div>
              <div class="page-kpi__desc">{{ detail.overdueFlag === 1 ? '当前已逾期' : '当前未逾期' }}</div>
            </article>
          </div>

          <div class="detail-summary">
            <article class="summary-card">
              <span>计划名称</span>
              <strong>{{ detail.planName }}</strong>
            </article>
            <article class="summary-card">
              <span>来源</span>
              <strong>{{ detail.sourceType }} / {{ detail.sourceDisplayName || detail.sourceId || '-' }}</strong>
            </article>
            <article class="summary-card">
              <span>目标</span>
              <strong>{{ detail.targetType }} / {{ detail.targetDisplayName || detail.targetId || '-' }}</strong>
            </article>
            <article class="summary-card">
              <span>负责人</span>
              <strong>{{ detail.ownerUserName || detail.ownerUserId || '-' }}</strong>
            </article>
          </div>

          <el-alert
            v-if="detail.effectReview"
            :title="`验证结论：${detail.effectReview}`"
            type="success"
            :closable="false"
            show-icon
            style="margin-top: 18px;"
          />

          <SectionCard title="行动项" style="margin-top: 18px;">
            <div v-if="detail.actions?.length" class="action-list">
              <article v-for="action in detail.actions" :key="action.id" class="action-card">
                <div class="action-card__head">
                  <div>
                    <h4>{{ action.actionCode }} {{ action.actionTitle }}</h4>
                    <div class="action-card__meta">
                      <span>{{ action.responsibleUserName || action.responsibleUserId || '-' }}</span>
                      <span>{{ statusLabel(action.status) }}</span>
                      <span>{{ action.startDate || '-' }} ~ {{ action.dueDate || '-' }}</span>
                    </div>
                  </div>
                  <div class="action-card__tools">
                    <el-button type="primary" link @click="openProgressDialog(action)">更新进度</el-button>
                    <el-button type="primary" link @click="openRecordDialog(action)">新增记录</el-button>
                  </div>
                </div>
                <el-progress :percentage="toPercent(action.progressPercent)" :stroke-width="14" />
                <div class="action-card__desc">{{ action.actionDesc || '暂无行动说明' }}</div>

                <div class="record-list">
                  <article v-for="record in action.records || []" :key="record.id" class="record-card">
                    <div class="record-card__head">
                      <strong>{{ record.recordType || '记录' }}</strong>
                      <div class="record-card__tools">
                        <el-button type="primary" link @click="openRecordDialog(action, record)">编辑</el-button>
                        <el-button type="danger" link @click="handleDeleteRecord(record)">删除</el-button>
                      </div>
                    </div>
                    <div class="record-card__meta">
                      <span>{{ formatDateTime(record.recordTime) }}</span>
                      <span>{{ record.recorderUserName || record.recorderUserId || '-' }}</span>
                    </div>
                    <div class="record-card__content">{{ record.recordContent || '暂无记录内容' }}</div>
                  </article>
                  <el-empty v-if="!(action.records || []).length" description="暂无过程记录" />
                </div>
              </article>
            </div>
            <el-empty v-else description="暂无行动项" />
          </SectionCard>
        </template>

        <el-empty v-else description="请选择一条改进计划查看详情" />
      </SectionCard>
    </div>

    <el-dialog v-model="formVisible" :title="form.id ? '编辑改进计划' : '新建改进计划'" width="980px">
      <el-form label-position="top">
        <div class="editor-grid">
          <el-form-item label="计划编码">
            <el-input v-model.trim="form.planCode" placeholder="如 IMP-20260718-01" />
          </el-form-item>
          <el-form-item label="计划名称">
            <el-input v-model.trim="form.planName" placeholder="请输入计划名称" />
          </el-form-item>
          <el-form-item label="来源类型">
            <el-input v-model.trim="form.sourceType" placeholder="如 EVAL_RESULT" />
          </el-form-item>
          <el-form-item label="来源ID">
            <el-input-number v-model="form.sourceId" :min="1" :step="1" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="目标类型">
            <el-input v-model.trim="form.targetType" placeholder="如 COURSE" />
          </el-form-item>
          <el-form-item label="目标ID">
            <el-input-number v-model="form.targetId" :min="1" :step="1" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="负责人用户ID">
            <el-input-number v-model="form.ownerUserId" :min="1" :step="1" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="优先级">
            <el-input-number v-model="form.priority" :min="1" :max="5" :step="1" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="开始日期">
            <el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="截止日期">
            <el-date-picker v-model="form.dueDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
          </el-form-item>
        </div>

        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>

        <div class="subsection">
          <div class="subsection__head">
            <h4>行动项</h4>
            <el-button type="primary" link @click="addFormAction">新增行动项</el-button>
          </div>
          <el-table :data="form.actions" border stripe>
            <el-table-column label="编码" min-width="120">
              <template #default="{ row }"><el-input v-model.trim="row.actionCode" /></template>
            </el-table-column>
            <el-table-column label="标题" min-width="160">
              <template #default="{ row }"><el-input v-model.trim="row.actionTitle" /></template>
            </el-table-column>
            <el-table-column label="责任人ID" width="120">
              <template #default="{ row }"><el-input-number v-model="row.responsibleUserId" :min="1" :step="1" style="width: 100%;" /></template>
            </el-table-column>
            <el-table-column label="进度%" width="120">
              <template #default="{ row }"><el-input-number v-model="row.progressPercent" :min="0" :max="100" :step="5" style="width: 100%;" /></template>
            </el-table-column>
            <el-table-column label="状态" min-width="140">
              <template #default="{ row }">
                <el-select v-model="row.status">
                  <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="说明" min-width="180">
              <template #default="{ row }"><el-input v-model="row.actionDesc" /></template>
            </el-table-column>
            <el-table-column label="操作" width="90">
              <template #default="{ $index }">
                <el-button type="danger" link @click="removeFormAction($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!form.actions.length" description="暂无行动项" />
        </div>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.save" @click="savePlan">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="progressVisible" title="更新行动进度" width="520px">
      <el-form label-position="top">
        <el-form-item label="进度百分比">
          <el-input-number v-model="progressForm.progressPercent" :min="0" :max="100" :step="5" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="progressForm.status" style="width: 100%;">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="progressForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.action" @click="saveActionProgress">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="recordVisible" :title="recordForm.id ? '编辑过程记录' : '新增过程记录'" width="620px">
      <el-form label-position="top">
        <div class="editor-grid">
          <el-form-item label="记录类型">
            <el-input v-model.trim="recordForm.recordType" placeholder="如 CHECKPOINT" />
          </el-form-item>
          <el-form-item label="记录时间">
            <el-date-picker
              v-model="recordForm.recordTime"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="记录人用户ID">
            <el-input-number v-model="recordForm.recorderUserId" :min="1" :step="1" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="行动状态">
            <el-select v-model="recordForm.actionStatus" style="width: 100%;">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="记录内容">
          <el-input v-model="recordForm.recordContent" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="recordForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.action" @click="saveRecord">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="verifyVisible" title="验证改进计划" width="560px">
      <el-form label-position="top">
        <el-form-item label="效果评价">
          <el-input v-model="verifyForm.effectReview" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="verifyForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="verifyVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.action" @click="submitVerify">提交验证</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import {
  addImproveRecord,
  completeImprovePlan,
  createImprovePlan,
  deleteImprovePlan,
  deleteImproveRecord,
  fetchImprovePlanDetail,
  fetchImprovePlans,
  remindImprovePlan,
  startImprovePlan,
  updateImproveActionProgress,
  updateImprovePlan,
  updateImproveRecord,
  verifyImprovePlan
} from '../../api/improve';
import { useUserStore } from '../../store/user';

const router = useRouter();
const userStore = useUserStore();

const loading = reactive({
  page: false,
  detail: false,
  save: false,
  action: false
});

const statusOptions = [
  { label: '待执行', value: 'PENDING' },
  { label: '执行中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已验证', value: 'VERIFIED' }
];

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

const plans = ref([]);
const selectedId = ref(null);
const detail = ref(null);

const formVisible = ref(false);
const form = reactive(createEmptyForm());

const progressVisible = ref(false);
const progressActionId = ref(null);
const progressForm = reactive({
  progressPercent: 0,
  status: 'IN_PROGRESS',
  remark: ''
});

const recordVisible = ref(false);
const recordActionId = ref(null);
const recordForm = reactive(createEmptyRecordForm());

const verifyVisible = ref(false);
const verifyPlanId = ref(null);
const verifyForm = reactive({
  effectReview: '',
  remark: ''
});

function createEmptyAction() {
  return {
    actionCode: '',
    actionTitle: '',
    actionDesc: '',
    responsibleUserId: null,
    startDate: '',
    dueDate: '',
    progressPercent: 0,
    status: 'PENDING',
    sortNo: 1,
    remark: ''
  };
}

function createEmptyForm() {
  return {
    id: null,
    planCode: '',
    planName: '',
    sourceType: '',
    sourceId: null,
    targetType: '',
    targetId: null,
    ownerUserId: userStore.userInfo.id || null,
    startDate: '',
    dueDate: '',
    priority: 3,
    remark: '',
    actions: []
  };
}

function createEmptyRecordForm() {
  return {
    id: null,
    recordType: '',
    recordContent: '',
    recordTime: '',
    recorderUserId: userStore.userInfo.id || null,
    progressPercent: null,
    actionStatus: 'IN_PROGRESS',
    remark: ''
  };
}

function resetForm() {
  Object.assign(form, createEmptyForm());
  form.actions = [];
}

function resetRecordForm() {
  Object.assign(recordForm, createEmptyRecordForm());
}

function statusLabel(status) {
  return statusOptions.find((item) => item.value === status)?.label || status || '-';
}

function statusTagType(status) {
  if (status === 'VERIFIED') return 'success';
  if (status === 'COMPLETED') return 'warning';
  if (status === 'IN_PROGRESS') return 'primary';
  return 'info';
}

function toPercent(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? Math.max(0, Math.min(100, num)) : 0;
}

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

function buildQuery() {
  return {
    pageNum: pager.pageNum,
    pageSize: pager.pageSize,
    status: filters.status,
    sourceType: filters.sourceType,
    targetType: filters.targetType,
    keyword: filters.keyword
  };
}

async function loadPage() {
  loading.page = true;
  try {
    const page = await fetchImprovePlans(buildQuery());
    plans.value = page?.records || [];
    pager.total = Number(page?.total || 0);
    if (!plans.value.length) {
      selectedId.value = null;
      detail.value = null;
      return;
    }
    const nextId = plans.value.some((item) => item.id === selectedId.value)
      ? selectedId.value
      : plans.value[0].id;
    await openDetail(nextId);
  } finally {
    loading.page = false;
  }
}

async function openDetail(id) {
  if (!id) return;
  loading.detail = true;
  try {
    selectedId.value = id;
    detail.value = await fetchImprovePlanDetail(id);
  } finally {
    loading.detail = false;
  }
}

function handleCurrentChange(row) {
  if (!row?.id || row.id === selectedId.value) {
    return;
  }
  openDetail(row.id);
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

function openCreate() {
  resetForm();
  form.actions = [createEmptyAction()];
  formVisible.value = true;
}

async function openEdit(id) {
  const targetId = id || detail.value?.id;
  if (!targetId) return;
  const planDetail = await fetchImprovePlanDetail(targetId);
  resetForm();
  Object.assign(form, {
    id: planDetail.id,
    planCode: planDetail.planCode || '',
    planName: planDetail.planName || '',
    sourceType: planDetail.sourceType || '',
    sourceId: planDetail.sourceId ?? null,
    targetType: planDetail.targetType || '',
    targetId: planDetail.targetId ?? null,
    ownerUserId: planDetail.ownerUserId ?? userStore.userInfo.id ?? null,
    startDate: planDetail.startDate || '',
    dueDate: planDetail.dueDate || '',
    priority: planDetail.priority ?? 3,
    remark: planDetail.remark || ''
  });
  form.actions = (planDetail.actions || []).map((item, index) => ({
    actionCode: item.actionCode || '',
    actionTitle: item.actionTitle || '',
    actionDesc: item.actionDesc || '',
    responsibleUserId: item.responsibleUserId ?? null,
    startDate: item.startDate || '',
    dueDate: item.dueDate || '',
    progressPercent: Number(item.progressPercent || 0),
    status: item.status || 'PENDING',
    sortNo: item.sortNo || index + 1,
    remark: item.remark || ''
  }));
  formVisible.value = true;
}

function addFormAction() {
  form.actions.push({
    ...createEmptyAction(),
    sortNo: form.actions.length + 1
  });
}

function removeFormAction(index) {
  form.actions.splice(index, 1);
  form.actions.forEach((item, actionIndex) => {
    item.sortNo = actionIndex + 1;
  });
}

function validateForm() {
  if (!form.planCode || !form.planName) {
    ElMessage.warning('请先填写计划编码和计划名称');
    return false;
  }
  if (!form.actions.length) {
    ElMessage.warning('请至少维护一个行动项');
    return false;
  }
  for (const [index, action] of form.actions.entries()) {
    if (!action.actionTitle) {
      ElMessage.warning(`请填写第 ${index + 1} 个行动项标题`);
      return false;
    }
  }
  return true;
}

function buildSavePayload() {
  return {
    planCode: form.planCode || '',
    planName: form.planName || '',
    sourceType: form.sourceType || '',
    sourceId: form.sourceId || null,
    targetType: form.targetType || '',
    targetId: form.targetId || null,
    ownerUserId: form.ownerUserId || userStore.userInfo.id || null,
    startDate: form.startDate || null,
    dueDate: form.dueDate || null,
    priority: form.priority ?? 3,
    remark: form.remark || '',
    actions: form.actions.map((item, index) => ({
      actionCode: item.actionCode || `ACT-${index + 1}`,
      actionTitle: item.actionTitle || '',
      actionDesc: item.actionDesc || '',
      responsibleUserId: item.responsibleUserId || null,
      startDate: item.startDate || null,
      dueDate: item.dueDate || null,
      progressPercent: item.progressPercent ?? 0,
      status: item.status || 'PENDING',
      sortNo: index + 1,
      remark: item.remark || ''
    }))
  };
}

async function savePlan() {
  if (!validateForm()) {
    return;
  }
  loading.save = true;
  try {
    const payload = buildSavePayload();
    const saved = form.id
      ? await updateImprovePlan(form.id, payload)
      : await createImprovePlan(payload);
    ElMessage.success(form.id ? '改进计划已更新' : '改进计划已创建');
    formVisible.value = false;
    selectedId.value = saved?.id || selectedId.value;
    await loadPage();
    if (saved?.id) {
      await openDetail(saved.id);
    }
  } finally {
    loading.save = false;
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确认删除改进计划“${row.planName || row.planCode}”吗？`, '删除确认', { type: 'warning' });
  await deleteImprovePlan(row.id);
  ElMessage.success('改进计划已删除');
  if (selectedId.value === row.id) {
    selectedId.value = null;
    detail.value = null;
  }
  await loadPage();
}

async function handlePlanAction(action) {
  if (!detail.value?.id) return;
  loading.action = true;
  try {
    if (action === 'start') {
      await startImprovePlan(detail.value.id);
      ElMessage.success('计划已开始执行');
    } else if (action === 'complete') {
      await completeImprovePlan(detail.value.id);
      ElMessage.success('计划已标记完成');
    }
    await openDetail(detail.value.id);
    await loadPage();
  } finally {
    loading.action = false;
  }
}

async function sendReminder() {
  if (!detail.value?.id) return;
  const { value } = await ElMessageBox.prompt('请输入提醒备注', '催办提醒', {
    inputPlaceholder: '可选备注',
    confirmButtonText: '发送',
    cancelButtonText: '取消'
  }).catch(() => ({ value: null }));
  if (value === null) {
    return;
  }
  loading.action = true;
  try {
    await remindImprovePlan(detail.value.id, {
      operatorUserId: userStore.userInfo.id || null,
      remark: value || ''
    });
    ElMessage.success('催办提醒已发送');
  } finally {
    loading.action = false;
  }
}

function openProgressDialog(action) {
  progressActionId.value = action.id;
  progressForm.progressPercent = toPercent(action.progressPercent);
  progressForm.status = action.status || 'IN_PROGRESS';
  progressForm.remark = '';
  progressVisible.value = true;
}

async function saveActionProgress() {
  if (!progressActionId.value) return;
  loading.action = true;
  try {
    await updateImproveActionProgress(progressActionId.value, {
      progressPercent: progressForm.progressPercent,
      status: progressForm.status,
      remark: progressForm.remark || ''
    });
    ElMessage.success('行动进度已更新');
    progressVisible.value = false;
    await openDetail(selectedId.value);
    await loadPage();
  } finally {
    loading.action = false;
  }
}

function openRecordDialog(action, record = null) {
  recordActionId.value = action.id;
  resetRecordForm();
  if (record) {
    Object.assign(recordForm, {
      id: record.id,
      recordType: record.recordType || '',
      recordContent: record.recordContent || '',
      recordTime: record.recordTime ? String(record.recordTime).slice(0, 19) : '',
      recorderUserId: record.recorderUserId ?? userStore.userInfo.id ?? null,
      progressPercent: null,
      actionStatus: action.status || 'IN_PROGRESS',
      remark: record.remark || ''
    });
  } else {
    recordForm.recordTime = new Date().toISOString().slice(0, 19);
  }
  recordVisible.value = true;
}

async function saveRecord() {
  if (!recordActionId.value) return;
  if (!recordForm.recordType || !recordForm.recordContent) {
    ElMessage.warning('请填写记录类型和记录内容');
    return;
  }
  loading.action = true;
  try {
    const payload = {
      recordType: recordForm.recordType || '',
      recordContent: recordForm.recordContent || '',
      recordTime: recordForm.recordTime || null,
      recorderUserId: recordForm.recorderUserId || userStore.userInfo.id || null,
      progressPercent: recordForm.progressPercent,
      actionStatus: recordForm.actionStatus || '',
      remark: recordForm.remark || ''
    };
    if (recordForm.id) {
      await updateImproveRecord(recordForm.id, payload);
      ElMessage.success('过程记录已更新');
    } else {
      await addImproveRecord(recordActionId.value, payload);
      ElMessage.success('过程记录已新增');
    }
    recordVisible.value = false;
    await openDetail(selectedId.value);
  } finally {
    loading.action = false;
  }
}

async function handleDeleteRecord(record) {
  await ElMessageBox.confirm('确认删除这条过程记录吗？', '删除确认', { type: 'warning' });
  await deleteImproveRecord(record.id);
  ElMessage.success('过程记录已删除');
  await openDetail(selectedId.value);
}

function openVerify(row) {
  verifyPlanId.value = row?.id || detail.value?.id || null;
  verifyForm.effectReview = detail.value?.effectReview || '';
  verifyForm.remark = '';
  verifyVisible.value = true;
}

async function submitVerify() {
  if (!verifyPlanId.value) return;
  if (!verifyForm.effectReview.trim()) {
    ElMessage.warning('请填写效果评价');
    return;
  }
  loading.action = true;
  try {
    await verifyImprovePlan(verifyPlanId.value, {
      effectReview: verifyForm.effectReview || '',
      remark: verifyForm.remark || ''
    });
    ElMessage.success('计划已验证');
    verifyVisible.value = false;
    await openDetail(verifyPlanId.value);
    await loadPage();
  } finally {
    loading.action = false;
  }
}

function openAiPage() {
  if (!detail.value?.id) return;
  router.push({
    path: '/ai',
    query: {
      mode: 'improve',
      planId: detail.value.id,
      sourceType: detail.value.sourceType || '',
      sourceId: detail.value.sourceId || '',
      targetType: detail.value.targetType || '',
      targetId: detail.value.targetId || ''
    }
  });
}

onMounted(() => {
  loadPage();
});
</script>

<style scoped>
.improve-shell,
.detail-summary,
.action-list,
.record-list {
  display: grid;
  gap: 18px;
}

.editor-grid,
.page-kpis {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.detail-actions,
.subsection__head,
.action-card__head,
.action-card__tools,
.record-card__head,
.record-card__tools,
.action-card__meta,
.record-card__meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.detail-summary {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 18px;
}

.summary-card,
.action-card,
.record-card {
  border: 1px solid rgba(220, 227, 233, 0.9);
  border-radius: 14px;
  padding: 16px;
  background: #fff;
}

.summary-card span,
.action-card__meta,
.record-card__meta,
.action-card__desc {
  color: #64748b;
  font-size: 13px;
}

.summary-card strong {
  display: block;
  margin-top: 8px;
}

.subsection {
  margin-top: 18px;
  display: grid;
  gap: 14px;
}

.action-card__head,
.record-card__head {
  justify-content: space-between;
  margin-bottom: 12px;
}

.action-card__desc,
.record-card__content {
  margin-top: 12px;
  line-height: 1.7;
  white-space: pre-wrap;
}

@media (max-width: 960px) {
  .editor-grid,
  .page-kpis,
  .detail-summary {
    grid-template-columns: 1fr;
  }
}
</style>
