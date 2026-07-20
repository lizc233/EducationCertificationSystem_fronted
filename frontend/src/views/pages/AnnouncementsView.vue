<template>
  <StandardPage
    title="系统公告管理"
    :breadcrumbs="['首页', '基础管理', '系统公告管理']"
    description="维护全站系统公告，列表、发布和删除均直接连接后端通知消息接口。后端暂无数据时页面显示为空。"
  >
    <template #actions>
      <el-button type="primary" @click="openCreateDialog">新增公告</el-button>
      <el-button :loading="loading.refresh" @click="refreshPage">刷新</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="发布状态">
          <el-select v-model="filters.publishStatus" clearable placeholder="全部状态" style="width: 180px;">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model.trim="filters.keyword" clearable placeholder="搜索公告标题" style="width: 240px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.page" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <div class="announcement-kpis">
      <article class="announcement-kpi">
        <div class="announcement-kpi__label">公告总数</div>
        <div class="announcement-kpi__value">{{ pager.total }}</div>
        <div class="announcement-kpi__desc">当前筛选条件下的后端公告记录数</div>
      </article>
      <article class="announcement-kpi">
        <div class="announcement-kpi__label">草稿数</div>
        <div class="announcement-kpi__value">{{ summary.draftCount }}</div>
        <div class="announcement-kpi__desc">当前页仍可继续编辑或发布的公告</div>
      </article>
      <article class="announcement-kpi">
        <div class="announcement-kpi__label">已发布</div>
        <div class="announcement-kpi__value">{{ summary.publishedCount }}</div>
        <div class="announcement-kpi__desc">当前页已进入发送流程或已发送完成的公告</div>
      </article>
    </div>

    <SectionCard title="公告列表">
      <el-result
        v-if="loadFailed"
        icon="warning"
        title="公告数据加载失败"
        sub-title="请检查后端 notice/messages 接口是否可用，或确认已启用 generated-notice 配置。"
      />

      <template v-else>
        <el-table
          v-loading="loading.page"
          :data="rows"
          border
          stripe
          empty-text="暂无数据"
        >
          <el-table-column prop="title" label="公告标题" min-width="260" show-overflow-tooltip />
          <el-table-column label="发布人" min-width="140">
            <template #default="{ row }">
              {{ resolvePublisherName(row.senderUserId) }}
            </template>
          </el-table-column>
          <el-table-column label="发送范围" min-width="120">
            <template #default>
              全体用户
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="120">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.publishStatus)">{{ resolveStatusLabel(row.publishStatus) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" min-width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.sendAt) }}
            </template>
          </el-table-column>
          <el-table-column label="更新时间" min-width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.updatedAt || row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
          <el-table-column label="操作" width="260" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
              <el-button
                type="primary"
                link
                :disabled="!canPublish(row)"
                :loading="rowLoading[`publish-${row.id}`]"
                @click="publishAnnouncement(row)"
              >
                {{ row.publishStatus === 'PUBLISH_FAILED' ? '重新发布' : '发布' }}
              </el-button>
              <el-button
                type="danger"
                link
                :loading="rowLoading[`delete-${row.id}`]"
                @click="removeAnnouncement(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading.page && !rows.length" description="暂无数据" />

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
      </template>
    </SectionCard>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.mode === 'create' ? '新增公告' : '编辑公告'"
      width="720px"
      destroy-on-close
    >
      <el-form label-position="top">
        <el-form-item label="公告标题" required>
          <el-input v-model.trim="form.title" maxlength="120" show-word-limit placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="公告内容" required>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            maxlength="5000"
            show-word-limit
            placeholder="请输入公告正文"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model.trim="form.remark" maxlength="200" show-word-limit placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="loading.save" @click="saveAnnouncement">保存</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import {
  createNoticeMessage,
  deleteNoticeMessage,
  fetchNoticeMessageList,
  publishNoticeMessage,
  retryPublishNoticeMessage,
  updateNoticeMessage
} from '../../api/notice';
import { get } from '../../api/http';
import { useUserStore } from '../../store/user';

const NOTICE_TYPE = 'SYSTEM';
const CHANNEL_TYPE = 'IN_APP';

const userStore = useUserStore();

const statusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '发布中', value: 'PUBLISHING' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '发布失败', value: 'PUBLISH_FAILED' }
];

const loading = reactive({
  page: false,
  save: false,
  refresh: false,
  users: false
});

const rowLoading = reactive({});
const rows = ref([]);
const users = ref([]);
const loadFailed = ref(false);

const filters = reactive({
  publishStatus: '',
  keyword: ''
});

const pager = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const dialog = reactive({
  visible: false,
  mode: 'create'
});

const form = reactive(createEmptyForm());

const userMap = computed(() => {
  const map = new Map();
  users.value.forEach((item) => {
    map.set(Number(item.id), item.realName || item.accountId || `用户${item.id}`);
  });
  return map;
});

const summary = computed(() => ({
  draftCount: rows.value.filter((item) => item.publishStatus === 'DRAFT' || item.publishStatus === 'PUBLISH_FAILED').length,
  publishedCount: rows.value.filter((item) => item.publishStatus === 'PUBLISHED' || item.publishStatus === 'PUBLISHING').length
}));

function createEmptyForm() {
  return {
    id: null,
    title: '',
    content: '',
    remark: '',
    publishStatus: 'DRAFT'
  };
}

function resetForm() {
  Object.assign(form, createEmptyForm());
}

function resolveStatusLabel(status) {
  return statusOptions.find((item) => item.value === status)?.label || status || '草稿';
}

function statusTagType(status) {
  if (status === 'PUBLISHED') return 'success';
  if (status === 'PUBLISHING') return 'warning';
  if (status === 'PUBLISH_FAILED') return 'danger';
  return 'info';
}

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

function resolvePublisherName(senderUserId) {
  if (!senderUserId) {
    return '未设置';
  }
  return userMap.value.get(Number(senderUserId)) || `用户ID ${senderUserId}`;
}

function canPublish(row) {
  return ['DRAFT', 'PUBLISH_FAILED'].includes(row.publishStatus || 'DRAFT');
}

function buildListQuery() {
  return {
    pageNum: pager.pageNum,
    pageSize: pager.pageSize,
    noticeType: NOTICE_TYPE,
    channelType: CHANNEL_TYPE,
    publishStatus: filters.publishStatus || undefined,
    title: filters.keyword || undefined
  };
}

function buildSavePayload() {
  return {
    noticeType: NOTICE_TYPE,
    title: form.title,
    content: form.content,
    senderUserId: userStore.userInfo?.id || null,
    channelType: CHANNEL_TYPE,
    priorityLevel: 0,
    publishStatus: form.publishStatus || 'DRAFT',
    remark: form.remark || ''
  };
}

function buildPublishPayload() {
  const recipientUserIds = users.value
    .filter((item) => Number(item.status) === 1)
    .map((item) => Number(item.id))
    .filter((id) => Number.isFinite(id) && id > 0);

  return {
    recipientUserIds,
    operatorUserId: userStore.userInfo?.id || null,
    remark: '系统公告全员发布'
  };
}

async function loadUsers() {
  loading.users = true;
  try {
    const page = await get('/user/list', { pageNum: 1, pageSize: 1000 }, { skipErrorMessage: true });
    users.value = Array.isArray(page?.records) ? page.records : [];
  } catch {
    users.value = [];
  } finally {
    loading.users = false;
  }
}

async function loadPage() {
  loading.page = true;
  try {
    const page = await fetchNoticeMessageList(buildListQuery());
    rows.value = Array.isArray(page?.records) ? page.records : [];
    pager.total = Number(page?.total || 0);
    loadFailed.value = false;
  } catch {
    rows.value = [];
    pager.total = 0;
    loadFailed.value = true;
  } finally {
    loading.page = false;
  }
}

async function loadAll() {
  await Promise.all([loadUsers(), loadPage()]);
}

function openCreateDialog() {
  resetForm();
  dialog.mode = 'create';
  dialog.visible = true;
}

function openEditDialog(row) {
  resetForm();
  dialog.mode = 'edit';
  form.id = row.id;
  form.title = row.title || '';
  form.content = row.content || '';
  form.remark = row.remark || '';
  form.publishStatus = row.publishStatus || 'DRAFT';
  dialog.visible = true;
}

function validateForm() {
  if (!form.title) {
    ElMessage.warning('请输入公告标题');
    return false;
  }
  if (!form.content) {
    ElMessage.warning('请输入公告内容');
    return false;
  }
  return true;
}

async function saveAnnouncement() {
  if (!validateForm()) {
    return;
  }

  loading.save = true;
  try {
    const payload = buildSavePayload();
    if (dialog.mode === 'create') {
      await createNoticeMessage(payload);
      ElMessage.success('公告已创建');
      pager.pageNum = 1;
    } else {
      await updateNoticeMessage(form.id, payload);
      ElMessage.success('公告已更新');
    }
    dialog.visible = false;
    await loadPage();
  } finally {
    loading.save = false;
  }
}

async function publishAnnouncement(row) {
  const payload = buildPublishPayload();
  if (!payload.recipientUserIds.length) {
    ElMessage.warning('没有可发布的有效用户数据');
    return;
  }

  rowLoading[`publish-${row.id}`] = true;
  try {
    if (row.publishStatus === 'PUBLISH_FAILED') {
      await retryPublishNoticeMessage(row.id, payload);
      ElMessage.success('公告已提交重新发布');
    } else {
      await publishNoticeMessage(row.id, payload);
      ElMessage.success('公告已提交发布');
    }
    await loadPage();
  } finally {
    rowLoading[`publish-${row.id}`] = false;
  }
}

async function removeAnnouncement(row) {
  try {
    await ElMessageBox.confirm(`确认删除公告“${row.title || '未命名公告'}”吗？`, '删除确认', {
      type: 'warning'
    });
  } catch {
    return;
  }

  rowLoading[`delete-${row.id}`] = true;
  try {
    await deleteNoticeMessage(row.id);
    ElMessage.success('公告已删除');
    if (rows.value.length === 1 && pager.pageNum > 1) {
      pager.pageNum -= 1;
    }
    await loadPage();
  } finally {
    rowLoading[`delete-${row.id}`] = false;
  }
}

function handleSearch() {
  pager.pageNum = 1;
  loadPage();
}

function resetFilters() {
  filters.publishStatus = '';
  filters.keyword = '';
  pager.pageNum = 1;
  loadPage();
}

async function refreshPage() {
  loading.refresh = true;
  try {
    await loadAll();
    if (!loadFailed.value) {
      ElMessage.success('公告数据已刷新');
    }
  } finally {
    loading.refresh = false;
  }
}

onMounted(async () => {
  await loadAll();
});
</script>

<style scoped>
.announcement-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 20px;
}

.announcement-kpi {
  padding: 18px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
}

.announcement-kpi__label {
  font-size: 12px;
  color: var(--text-light);
}

.announcement-kpi__value {
  margin-top: 12px;
  font-family: var(--font-serif);
  font-size: 32px;
  color: #173f49;
}

.announcement-kpi__desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.crud-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

@media (max-width: 960px) {
  .announcement-kpis {
    grid-template-columns: 1fr;
  }
}
</style>
