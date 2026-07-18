<template>
  <StandardPage
    title="持续改进计划"
    :breadcrumbs="['首页', '问卷与改进', '持续改进计划']"
    description="围绕达成度问题项、问卷结论和责任落实做改进闭环，直接接入 F23 后端接口，并预留 AI 建议入口。"
  >
    <template #actions>
      <el-button type="primary" @click="startCreate">新建改进单</el-button>
      <el-button @click="openAiAssistant" :disabled="!detail?.id">AI 改进建议</el-button>
      <el-button :loading="loading.page" @click="loadAll">刷新</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable placeholder="全部状态" style="width: 160px;">
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
        <el-form-item label="仅超期">
          <el-switch v-model="filters.overdueOnly" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model.trim="filters.keyword" clearable placeholder="编码 / 名称" style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.page" @click="loadAll">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <div class="improve-shell">
      <SectionCard title="改进单清单">
        <div v-loading="loading.page" class="plan-list soft-scrollbar">
          <button
            v-for="item in plans"
            :key="item.id"
            type="button"
            class="plan-list-item"
            :class="{ 'is-active': item.id === activeId }"
            @click="selectPlan(item.id)"
          >
            <div class="plan-list-item__head">
              <div>
                <div class="plan-list-item__title">{{ item.planName }}</div>
                <div class="plan-list-item__code">{{ item.planCode }}</div>
              </div>
              <el-tag :type="planStatusType(item.status)">{{ item.status || 'PENDING' }}</el-tag>
            </div>
            <div class="plan-list-item__meta">
              <span class="small-tag">{{ item.sourceType || '-' }}</span>
              <span class="small-tag">{{ item.targetType || '-' }}</span>
              <span class="small-tag">P{{ item.priority ?? 3 }}</span>
            </div>
            <div class="plan-list-item__desc">
              {{ item.ownerUserName || '未分配责任人' }} · 截止 {{ item.dueDate || '-' }}
              <span v-if="item.overdueFlag === 1" class="danger-text"> · 已超期</span>
            </div>
          </button>
          <el-empty v-if="!loading.page && !plans.length" description="暂无改进单" />
        </div>

        <div class="crud-pagination">
          <el-pagination
            v-model:current-page="pager.pageNum"
            v-model:page-size="pager.pageSize"
            background
            layout="total, prev, pager, next"
            :total="pager.total"
            @current-change="loadAll"
            @size-change="loadAll"
          />
        </div>
      </SectionCard>

      <SectionCard :title="form.id ? '改进单维护' : '新建改进单'" class="plan-editor">
        <el-form label-position="top">
          <div class="plan-form-grid">
            <el-form-item label="改进单编码">
              <el-input v-model.trim="form.planCode" placeholder="如 IMP-2026-001" />
            </el-form-item>
            <el-form-item label="改进单名称">
              <el-input v-model.trim="form.planName" placeholder="请输入改进单名称" />
            </el-form-item>
            <el-form-item label="来源类型">
              <el-input v-model.trim="form.sourceType" placeholder="如 EVAL_RESULT / SURVEY" />
            </el-form-item>
            <el-form-item label="来源 ID">
              <el-input-number v-model="form.sourceId" :min="1" :step="1" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="目标类型">
              <el-input v-model.trim="form.targetType" placeholder="如 COURSE / REQUIREMENT" />
            </el-form-item>
            <el-form-item label="目标 ID">
              <el-input-number v-model="form.targetId" :min="1" :step="1" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="负责人用户ID">
              <el-input-number v-model="form.ownerUserId" :min="1" :step="1" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="优先级">
              <el-input-number v-model="form.priority" :min="1" :max="5" :step="1" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="开始日期">
              <el-date-picker v-model="form.startDate" value-format="YYYY-MM-DD" type="date" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="截止日期">
              <el-date-picker v-model="form.dueDate" value-format="YYYY-MM-DD" type="date" style="width: 100%;" />
            </el-form-item>
          </div>

          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="填写改进背景或问题摘要" />
          </el-form-item>
        </el-form>

        <div class="editor-block">
          <div class="editor-block__head">
            <h4>执行动作</h4>
            <el-button type="primary" link @click="addAction">新增动作</el-button>
          </div>
          <div v-if="form.actions.length" class="action-list">
            <article v-for="(action, index) in form.actions" :key="action.key" class="action-card">
              <div class="action-card__head">
                <strong>动作 {{ index + 1 }}</strong>
                <el-button type="danger" link @click="removeAction(index)">删除</el-button>
              </div>
              <div class="action-grid">
                <el-input v-model.trim="action.actionCode" placeholder="动作编码" />
                <el-input v-model.trim="action.actionTitle" placeholder="动作标题" />
                <el-input-number v-model="action.responsibleUserId" :min="1" :step="1" style="width: 100%;" />
                <el-select v-model="action.status" placeholder="动作状态">
                  <el-option label="待执行" value="PENDING" />
                  <el-option label="执行中" value="IN_PROGRESS" />
                  <el-option label="已完成" value="COMPLETED" />
                  <el-option label="已验证" value="VERIFIED" />
                </el-select>
                <el-date-picker v-model="action.startDate" value-format="YYYY-MM-DD" type="date" style="width: 100%;" />
                <el-date-picker v-model="action.dueDate" value-format="YYYY-MM-DD" type="date" style="width: 100%;" />
                <el-input-number v-model="action.progressPercent" :min="0" :max="100" :step="5" style="width: 100%;" />
                <el-input-number v-model="action.sortNo" :min="1" :step="1" style="width: 100%;" />
              </div>
              <el-input
                v-model="action.actionDesc"
                type="textarea"
                :rows="2"
                placeholder="填写具体执行措施"
                style="margin-top: 12px;"
              />
            </article>
          </div>
          <el-empty v-else description="尚未配置执行动作" />
        </div>

        <div class="editor-actions">
          <el-button type="primary" :loading="loading.save" @click="savePlan">保存改进单</el-button>
          <el-button v-if="form.id" :loading="loading.operate" @click="handleStart">开始执行</el-button>
          <el-button v-if="form.id" :loading="loading.operate" @click="handleComplete">标记完成</el-button>
          <el-button v-if="form.id" :loading="loading.operate" @click="handleVerify">效果验证</el-button>
          <el-button v-if="form.id" :loading="loading.operate" @click="handleRemind">发送提醒</el-button>
          <el-button v-if="form.id" type="danger" plain :loading="loading.delete" @click="handleDelete">删除</el-button>
        </div>
      </SectionCard>

      <SectionCard title="执行详情与记录">
        <div class="plan-kpis">
          <article class="plan-kpi">
            <div class="plan-kpi__label">计划状态</div>
            <div class="plan-kpi__value">{{ detail?.status || 'PENDING' }}</div>
          </article>
          <article class="plan-kpi">
            <div class="plan-kpi__label">动作完成数</div>
            <div class="plan-kpi__value">{{ detail?.completedActionCount || 0 }}/{{ detail?.actionCount || 0 }}</div>
          </article>
          <article class="plan-kpi">
            <div class="plan-kpi__label">效果复核</div>
            <div class="plan-kpi__value plan-kpi__value--small">{{ detail?.effectReview || '-' }}</div>
          </article>
        </div>

        <div v-if="detail?.actions?.length" class="detail-action-list">
          <article v-for="action in detail.actions" :key="action.id" class="detail-action-card">
            <div class="detail-action-card__head">
              <div>
                <div class="detail-action-card__title">{{ action.actionTitle }}</div>
                <div class="detail-action-card__meta">
                  {{ action.actionCode }} · {{ action.responsibleUserName || action.responsibleUserId || '-' }} · {{ action.status }}
                </div>
              </div>
              <el-button type="primary" link @click="openProgressDialog(action)">更新进度</el-button>
            </div>
            <el-progress :percentage="Number(action.progressPercent || 0)" :stroke-width="12" />

            <div class="detail-record-list">
              <div class="detail-record-list__head">
                <span>执行记录</span>
                <el-button type="primary" link @click="openRecordDialog(action)">新增记录</el-button>
              </div>
              <el-timeline v-if="action.records?.length">
                <el-timeline-item
                  v-for="record in action.records"
                  :key="record.id"
                  :timestamp="formatDateTime(record.recordTime)"
                >
                  <div class="record-item">
                    <div class="record-item__title">{{ record.recordType || 'PROGRESS' }}</div>
                    <div class="record-item__content">{{ record.recordContent }}</div>
                    <div class="record-item__meta">{{ record.recorderUserName || record.recorderUserId || '-' }}</div>
                    <div class="record-item__actions">
                      <el-button type="primary" link @click="editRecord(action, record)">编辑</el-button>
                      <el-button type="danger" link @click="removeRecord(record.id)">删除</el-button>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="暂无执行记录" />
            </div>
          </article>
        </div>
        <el-empty v-else description="选择左侧改进单查看动作与记录" />
      </SectionCard>
    </div>

    <el-dialog v-model="progressVisible" title="更新动作进度" width="460px">
      <el-form label-position="top" :model="progressForm">
        <el-form-item label="进度百分比">
          <el-input-number v-model="progressForm.progressPercent" :min="0" :max="100" :step="5" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="progressForm.status" style="width: 100%;">
            <el-option label="待执行" value="PENDING" />
            <el-option label="执行中" value="IN_PROGRESS" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已验证" value="VERIFIED" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="progressForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.operate" @click="submitProgress">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="recordVisible" :title="recordForm.id ? '编辑执行记录' : '新增执行记录'" width="520px">
      <el-form label-position="top" :model="recordForm">
        <el-form-item label="记录类型">
          <el-input v-model.trim="recordForm.recordType" placeholder="如 PROGRESS / CHECK" />
        </el-form-item>
        <el-form-item label="记录内容">
          <el-input v-model="recordForm.recordContent" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="记录时间">
          <el-date-picker
            v-model="recordForm.recordTime"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="附件文件ID">
          <el-input-number v-model="recordForm.attachmentFileId" :min="1" :step="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="recordForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.operate" @click="submitRecord">保存</el-button>
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
  save: false,
  operate: false,
  delete: false
});

const filters = reactive({
  status: '',
  sourceType: '',
  targetType: '',
  overdueOnly: 0,
  keyword: ''
});

const pager = reactive({
  pageNum: 1,
  pageSize: 8,
  total: 0
});

const plans = ref([]);
const activeId = ref(null);
const detail = ref(null);
const progressVisible = ref(false);
const progressActionId = ref(null);
const progressForm = reactive({
  progressPercent: 0,
  status: 'IN_PROGRESS',
  remark: ''
});
const recordVisible = ref(false);
const recordActionId = ref(null);
const recordForm = reactive({
  id: null,
  recordType: 'PROGRESS',
  recordContent: '',
  recordTime: '',
  attachmentFileId: null,
  remark: ''
});

function nextKey(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function createAction(index = 1) {
  return {
    key: nextKey('action'),
    actionCode: `ACT_${index}`,
    actionTitle: '',
    actionDesc: '',
    responsibleUserId: userStore.userInfo.id || 1,
    startDate: '',
    dueDate: '',
    progressPercent: 0,
    status: 'PENDING',
    sortNo: index,
    remark: ''
  };
}

function createForm() {
  return {
    id: null,
    planCode: '',
    planName: '',
    sourceType: '',
    sourceId: null,
    targetType: '',
    targetId: null,
    ownerUserId: userStore.userInfo.id || 1,
    startDate: '',
    dueDate: '',
    priority: 3,
    remark: '',
    actions: [createAction(1)]
  };
}

const form = reactive(createForm());

function planStatusType(status) {
  if (status === 'VERIFIED') return 'success';
  if (status === 'COMPLETED') return 'primary';
  if (status === 'IN_PROGRESS') return 'warning';
  return 'info';
}

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

function resetForm() {
  Object.assign(form, createForm());
  detail.value = null;
  activeId.value = null;
}

function fillForm(data) {
  Object.assign(form, {
    id: data.id || null,
    planCode: data.planCode || '',
    planName: data.planName || '',
    sourceType: data.sourceType || '',
    sourceId: data.sourceId || null,
    targetType: data.targetType || '',
    targetId: data.targetId || null,
    ownerUserId: data.ownerUserId || userStore.userInfo.id || 1,
    startDate: data.startDate || '',
    dueDate: data.dueDate || '',
    priority: data.priority ?? 3,
    remark: data.remark || ''
  });
  form.actions = (data.actions || []).map((action, index) => ({
    key: nextKey('action'),
    actionCode: action.actionCode || `ACT_${index + 1}`,
    actionTitle: action.actionTitle || '',
    actionDesc: action.actionDesc || '',
    responsibleUserId: action.responsibleUserId || null,
    startDate: action.startDate || '',
    dueDate: action.dueDate || '',
    progressPercent: Number(action.progressPercent || 0),
    status: action.status || 'PENDING',
    sortNo: action.sortNo ?? index + 1,
    remark: action.remark || ''
  }));
}

function buildPayload() {
  return {
    planCode: form.planCode,
    planName: form.planName,
    sourceType: form.sourceType,
    sourceId: form.sourceId,
    targetType: form.targetType,
    targetId: form.targetId,
    ownerUserId: form.ownerUserId,
    startDate: form.startDate || null,
    dueDate: form.dueDate || null,
    priority: form.priority,
    remark: form.remark,
    actions: form.actions.map((action, index) => ({
      actionCode: action.actionCode || `ACT_${index + 1}`,
      actionTitle: action.actionTitle,
      actionDesc: action.actionDesc,
      responsibleUserId: action.responsibleUserId,
      startDate: action.startDate || null,
      dueDate: action.dueDate || null,
      progressPercent: action.progressPercent,
      status: action.status,
      sortNo: action.sortNo ?? index + 1,
      remark: action.remark || ''
    }))
  };
}

async function loadAll() {
  loading.page = true;
  try {
    const page = await fetchImprovePlans({
      pageNum: pager.pageNum,
      pageSize: pager.pageSize,
      status: filters.status,
      sourceType: filters.sourceType,
      targetType: filters.targetType,
      ownerUserId: userStore.userInfo.role === 'ROLE_TEACHER' ? userStore.userInfo.id : undefined,
      overdueOnly: filters.overdueOnly,
      keyword: filters.keyword
    });
    plans.value = page.records || [];
    pager.total = Number(page.total || 0);
    if (!activeId.value && plans.value.length) {
      await selectPlan(plans.value[0].id);
    }
  } finally {
    loading.page = false;
  }
}

async function selectPlan(id) {
  if (!id) return;
  activeId.value = id;
  const response = await fetchImprovePlanDetail(id);
  detail.value = response;
  fillForm(response);
}

function addAction() {
  form.actions.push(createAction(form.actions.length + 1));
}

function removeAction(index) {
  form.actions.splice(index, 1);
  if (!form.actions.length) {
    form.actions.push(createAction(1));
  }
}

function startCreate() {
  resetForm();
}

function resetFilters() {
  filters.status = '';
  filters.sourceType = '';
  filters.targetType = '';
  filters.overdueOnly = 0;
  filters.keyword = '';
  pager.pageNum = 1;
  loadAll();
}

async function savePlan() {
  loading.save = true;
  try {
    const payload = buildPayload();
    const saved = form.id
      ? await updateImprovePlan(form.id, payload)
      : await createImprovePlan(payload);
    detail.value = saved;
    fillForm(saved);
    activeId.value = saved.id;
    await loadAll();
    ElMessage.success(form.id ? '改进单已更新' : '改进单已创建');
  } finally {
    loading.save = false;
  }
}

async function operatePlan(action) {
  if (!form.id) return;
  loading.operate = true;
  try {
    if (action === 'start') {
      await startImprovePlan(form.id);
      ElMessage.success('改进单已开始执行');
    } else if (action === 'complete') {
      await completeImprovePlan(form.id);
      ElMessage.success('改进单已标记完成');
    } else if (action === 'verify') {
      await verifyImprovePlan(form.id, {
        effectReview: '前端完成效果验证',
        remark: '前端验证'
      });
      ElMessage.success('改进单已完成验证');
    } else if (action === 'remind') {
      await remindImprovePlan(form.id, {
        operatorUserId: userStore.userInfo.id,
        remark: '前端发送改进提醒'
      });
      ElMessage.success('提醒已发送');
    }
    await selectPlan(form.id);
    await loadAll();
  } finally {
    loading.operate = false;
  }
}

function handleStart() {
  return operatePlan('start');
}

function handleComplete() {
  return operatePlan('complete');
}

function handleVerify() {
  return operatePlan('verify');
}

function handleRemind() {
  return operatePlan('remind');
}

async function handleDelete() {
  if (!form.id) return;
  try {
    await ElMessageBox.confirm('删除后改进单及其动作记录将一并移除，是否继续？', '删除确认', { type: 'warning' });
  } catch {
    return;
  }
  loading.delete = true;
  try {
    await deleteImprovePlan(form.id);
    resetForm();
    await loadAll();
    ElMessage.success('改进单已删除');
  } finally {
    loading.delete = false;
  }
}

function openProgressDialog(action) {
  progressActionId.value = action.id;
  progressForm.progressPercent = Number(action.progressPercent || 0);
  progressForm.status = action.status || 'IN_PROGRESS';
  progressForm.remark = '';
  progressVisible.value = true;
}

async function submitProgress() {
  if (!progressActionId.value) return;
  loading.operate = true;
  try {
    await updateImproveActionProgress(progressActionId.value, {
      progressPercent: progressForm.progressPercent,
      status: progressForm.status,
      remark: progressForm.remark
    });
    progressVisible.value = false;
    await selectPlan(activeId.value);
    ElMessage.success('动作进度已更新');
  } finally {
    loading.operate = false;
  }
}

function openRecordDialog(action) {
  recordActionId.value = action.id;
  Object.assign(recordForm, {
    id: null,
    recordType: 'PROGRESS',
    recordContent: '',
    recordTime: '',
    attachmentFileId: null,
    remark: ''
  });
  recordVisible.value = true;
}

function editRecord(action, record) {
  recordActionId.value = action.id;
  Object.assign(recordForm, {
    id: record.id,
    recordType: record.recordType || 'PROGRESS',
    recordContent: record.recordContent || '',
    recordTime: record.recordTime ? String(record.recordTime).slice(0, 19) : '',
    attachmentFileId: record.attachmentFileId || null,
    remark: record.remark || ''
  });
  recordVisible.value = true;
}

async function submitRecord() {
  if (!recordActionId.value) return;
  loading.operate = true;
  try {
    const payload = {
      recordType: recordForm.recordType,
      recordContent: recordForm.recordContent,
      recordTime: recordForm.recordTime || null,
      recorderUserId: userStore.userInfo.id,
      attachmentFileId: recordForm.attachmentFileId,
      progressPercent: null,
      actionStatus: null,
      remark: recordForm.remark
    };
    if (recordForm.id) {
      await updateImproveRecord(recordForm.id, payload);
    } else {
      await addImproveRecord(recordActionId.value, payload);
    }
    recordVisible.value = false;
    await selectPlan(activeId.value);
    ElMessage.success(recordForm.id ? '记录已更新' : '记录已新增');
  } finally {
    loading.operate = false;
  }
}

async function removeRecord(recordId) {
  try {
    await ElMessageBox.confirm('确认删除这条执行记录吗？', '删除确认', { type: 'warning' });
  } catch {
    return;
  }
  loading.operate = true;
  try {
    await deleteImproveRecord(recordId);
    await selectPlan(activeId.value);
    ElMessage.success('执行记录已删除');
  } finally {
    loading.operate = false;
  }
}

function openAiAssistant() {
  if (!detail.value?.id) return;
  router.push({
    path: '/ai',
    query: {
      mode: 'improve',
      planId: String(detail.value.id),
      sourceType: detail.value.sourceType || '',
      sourceId: detail.value.sourceId ? String(detail.value.sourceId) : '',
      targetType: detail.value.targetType || '',
      targetId: detail.value.targetId ? String(detail.value.targetId) : ''
    }
  });
}

onMounted(async () => {
  await loadAll();
});
</script>

<style scoped>
.improve-shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1.1fr) 380px;
  gap: 20px;
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 760px;
  overflow: auto;
}

.plan-list-item,
.action-card,
.plan-kpi,
.detail-action-card {
  padding: 16px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
}

.plan-list-item {
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.plan-list-item:hover,
.plan-list-item.is-active {
  transform: translateY(-2px);
  border-color: rgba(27, 76, 87, 0.28);
  box-shadow: 0 12px 24px rgba(27, 76, 87, 0.08);
}

.plan-list-item__head,
.editor-block__head,
.action-card__head,
.detail-action-card__head,
.detail-record-list__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.plan-list-item__title,
.detail-action-card__title {
  font-weight: 600;
  color: var(--text-primary);
}

.plan-list-item__code,
.plan-list-item__desc,
.detail-action-card__meta,
.record-item__meta {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-light);
}

.plan-list-item__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.danger-text {
  color: #c53030;
}

.plan-editor,
.editor-block,
.action-list,
.detail-action-list,
.detail-record-list {
  display: grid;
  gap: 14px;
}

.plan-form-grid,
.action-grid,
.plan-kpis {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.editor-actions,
.record-item__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.plan-kpi__label {
  font-size: 12px;
  color: var(--text-light);
}

.plan-kpi__value {
  margin-top: 12px;
  font-family: var(--font-serif);
  font-size: 26px;
  color: #1b4c57;
}

.plan-kpi__value--small {
  font-size: 16px;
  line-height: 1.6;
}

.record-item__title {
  font-weight: 600;
}

.record-item__content {
  margin-top: 8px;
  line-height: 1.8;
  color: var(--text-secondary);
  white-space: pre-wrap;
}

@media (max-width: 1480px) {
  .improve-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .plan-form-grid,
  .action-grid,
  .plan-kpis {
    grid-template-columns: 1fr;
  }
}
</style>
