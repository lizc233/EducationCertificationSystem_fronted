<template>
  <StandardPage
    title="消息通知中心"
    :breadcrumbs="['首页', '工作台', '消息通知中心']"
    description="查看站内消息、已读状态和发送时间。"
  >
    <template #actions>
      <el-badge :value="unreadCount" :hidden="!unreadCount">
        <el-button
          type="primary"
          :loading="markingAll"
          :disabled="!messages.length"
          @click="handleMarkAllRead"
        >
          全部标为已读
        </el-button>
      </el-badge>
      <el-button :loading="refreshing" @click="refreshAll">刷新</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters" class="message-filter-form">
        <el-form-item label="阅读状态">
          <el-select v-model="filters.readStatus" clearable placeholder="全部状态" style="width: 180px;">
            <el-option label="未读" :value="0" />
            <el-option label="已读" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <div class="message-shell">
      <div class="message-sidebar">
        <SectionCard title="收件概览">
          <div class="message-kpis">
            <article class="message-kpi">
              <div class="message-kpi__label">消息总数</div>
              <div class="message-kpi__value">{{ pager.total }}</div>
              <div class="message-kpi__desc">当前筛选条件下的消息数量。</div>
            </article>
            <article class="message-kpi">
              <div class="message-kpi__label">未读消息</div>
              <div class="message-kpi__value">{{ unreadCount }}</div>
              <div class="message-kpi__desc">等待处理的消息提醒。</div>
            </article>
            <article class="message-kpi">
              <div class="message-kpi__label">当前查看</div>
              <div class="message-kpi__value">{{ currentMessage ? 1 : 0 }}</div>
              <div class="message-kpi__desc">右侧展示当前选中的消息详情。</div>
            </article>
          </div>
        </SectionCard>

        <SectionCard title="消息列表">
          <el-result
            v-if="loadFailed"
            icon="warning"
            title="消息暂时无法加载"
            sub-title="请稍后刷新重试。"
          />

          <template v-else>
            <div v-loading="loading" class="message-list soft-scrollbar">
              <button
                v-for="item in messages"
                :key="item.recipientId"
                type="button"
                class="message-list-item"
                :class="{ 'is-active': item.recipientId === activeRecipientId }"
                @click="openMessage(item)"
              >
                <div class="message-list-item__head">
                  <span class="message-list-item__title">{{ item.title || '未命名消息' }}</span>
                  <span class="message-list-item__time">{{ formatDateTime(item.sendAt || item.recipientCreatedAt) }}</span>
                </div>
                <div class="message-list-item__meta">
                  <span class="small-tag">{{ resolveNoticeType(item.noticeType) }}</span>
                  <span :class="['small-tag', item.readStatus === 1 ? 'tag-blue' : 'tag-red']">
                    {{ item.readStatus === 1 ? '已读' : '未读' }}
                  </span>
                </div>
                <p class="message-list-item__snippet">{{ ellipsis(item.content) }}</p>
              </button>

              <el-empty v-if="!loading && !messages.length" description="暂无消息" />
            </div>

            <div class="message-pagination">
              <el-pagination
                v-model:current-page="pager.pageNum"
                v-model:page-size="pager.pageSize"
                background
                layout="total, prev, pager, next"
                :total="pager.total"
                @current-change="loadMessageList"
              />
            </div>
          </template>
        </SectionCard>
      </div>

      <SectionCard title="消息详情" class="message-detail-card">
        <el-result
          v-if="loadFailed && !currentMessage"
          icon="warning"
          title="消息暂时无法加载"
          sub-title="请稍后刷新重试。"
        />

        <template v-else-if="currentMessage">
          <div class="message-detail__header">
            <div>
              <h3 class="message-detail__title">{{ currentMessage.title || '未命名消息' }}</h3>
              <div class="message-detail__meta">
                <span class="small-tag">{{ resolveNoticeType(currentMessage.noticeType) }}</span>
                <span class="small-tag">{{ currentMessage.channelType || '站内信' }}</span>
                <span :class="['small-tag', currentMessage.readStatus === 1 ? 'tag-blue' : 'tag-red']">
                  {{ currentMessage.readStatus === 1 ? '已读' : '未读' }}
                </span>
              </div>
            </div>
            <div class="message-detail__actions">
              <el-button
                v-if="currentMessage.readStatus !== 1"
                type="primary"
                :loading="detailActionLoading"
                @click="handleMarkSingleRead()"
              >
                标为已读
              </el-button>
              <el-button
                type="danger"
                plain
                :loading="deleting"
                @click="handleDeleteCurrent"
              >
                删除消息
              </el-button>
            </div>
          </div>

          <div class="message-detail__info-grid">
            <article class="message-info-card">
              <div class="message-info-card__label">发送时间</div>
              <div class="message-info-card__value">{{ formatDateTime(currentMessage.sendAt || currentMessage.recipientCreatedAt) }}</div>
            </article>
            <article class="message-info-card">
              <div class="message-info-card__label">发送渠道</div>
              <div class="message-info-card__value">{{ currentMessage.channelType || '站内信' }}</div>
            </article>
            <article class="message-info-card">
              <div class="message-info-card__label">业务来源</div>
              <div class="message-info-card__value">{{ currentMessage.bizType || '-' }}</div>
            </article>
            <article class="message-info-card">
              <div class="message-info-card__label">关联业务 ID</div>
              <div class="message-info-card__value">{{ currentMessage.bizId || '-' }}</div>
            </article>
          </div>

          <div class="message-detail__body">
            <h4>消息正文</h4>
            <div class="message-detail__content">
              {{ currentMessage.content || '暂无正文内容。' }}
            </div>
          </div>
        </template>

        <el-empty v-else description="暂无消息" />
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import {
  deleteNoticeRecipient,
  fetchInbox,
  fetchUnreadCount,
  markAllNoticeRead,
  markNoticeRead
} from '../../api/notice';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();

const loading = ref(false);
const refreshing = ref(false);
const markingAll = ref(false);
const deleting = ref(false);
const detailActionLoading = ref(false);
const loadFailed = ref(false);
const messages = ref([]);
const unreadCount = ref(0);
const selectedRecipientId = ref(0);

const filters = reactive({
  readStatus: null
});

const pager = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const noticeTypeLabels = {
  SYSTEM: '系统通知',
  ACHIEVEMENT_WARNING: '达成度预警',
  SURVEY: '问卷提醒',
  REPORT_TASK: '报告任务',
  AI_ASSISTANT: 'AI 建议'
};

const activeRecipientId = computed(() => selectedRecipientId.value || messages.value[0]?.recipientId || 0);
const currentMessage = computed(() =>
  messages.value.find((item) => item.recipientId === activeRecipientId.value) || null
);

function resolveNoticeType(type) {
  return noticeTypeLabels[type] || type || '系统通知';
}

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

function ellipsis(text) {
  if (!text) return '暂无摘要内容';
  return text.length > 72 ? `${text.slice(0, 72)}...` : text;
}

function emitUnreadChanged() {
  window.dispatchEvent(new CustomEvent('notice-unread-changed', {
    detail: unreadCount.value
  }));
}

function getCurrentUserId() {
  return Number(userStore.userInfo?.id || 0);
}

function syncSelection() {
  if (!messages.value.length) {
    selectedRecipientId.value = 0;
    return;
  }
  const exists = messages.value.some((item) => item.recipientId === selectedRecipientId.value);
  if (!exists) {
    selectedRecipientId.value = messages.value[0].recipientId;
  }
}

function normalizeMessage(item) {
  return {
    recipientId: item.recipientId,
    noticeId: item.noticeId,
    readStatus: item.readStatus ?? 0,
    readAt: item.readAt || '',
    recipientCreatedAt: item.recipientCreatedAt || '',
    title: item.title || '消息通知',
    content: item.content || '',
    noticeType: item.noticeType || '',
    channelType: item.channelType || '',
    bizType: item.bizType || '',
    bizId: item.bizId || '',
    sendAt: item.sendAt || item.recipientCreatedAt || '',
    expireAt: item.expireAt || ''
  };
}

async function fetchUnread() {
  const userId = getCurrentUserId();
  if (!userId) {
    unreadCount.value = 0;
    emitUnreadChanged();
    return;
  }

  try {
    const count = await fetchUnreadCount(userId, { skipErrorMessage: true });
    unreadCount.value = Number(count || 0);
  } catch {
    unreadCount.value = 0;
  }
  emitUnreadChanged();
}

async function loadMessageList() {
  const userId = getCurrentUserId();
  if (!userId) {
    loadFailed.value = false;
    messages.value = [];
    pager.total = 0;
    syncSelection();
    return;
  }

  loading.value = true;
  try {
    const page = await fetchInbox({
      recipientUserId: userId,
      pageNum: pager.pageNum,
      pageSize: pager.pageSize,
      readStatus: filters.readStatus
    }, {
      skipErrorMessage: true
    });

    const records = Array.isArray(page?.records) ? page.records : [];
    const detailList = records.map((item) => normalizeMessage(item));

    loadFailed.value = false;
    messages.value = detailList;
    pager.total = Number(page?.total || 0);
    syncSelection();
  } catch {
    loadFailed.value = true;
    messages.value = [];
    pager.total = 0;
    syncSelection();
  } finally {
    loading.value = false;
  }
}

async function loadPage() {
  await Promise.allSettled([fetchUnread(), loadMessageList()]);
}

async function refreshAll() {
  refreshing.value = true;
  try {
    await loadPage();
    if (!loadFailed.value) {
      ElMessage.success('消息列表已刷新');
    }
  } finally {
    refreshing.value = false;
  }
}

async function openMessage(item) {
  selectedRecipientId.value = item.recipientId;
  if (item.readStatus !== 1) {
    await handleMarkSingleRead(item.recipientId, false);
  }
}

async function handleMarkSingleRead(recipientId = currentMessage.value?.recipientId, toast = true) {
  const resolvedRecipientId = typeof recipientId === 'number'
    ? recipientId
    : Number(recipientId || currentMessage.value?.recipientId || 0);
  if (!resolvedRecipientId) return;

  detailActionLoading.value = true;
  try {
    await markNoticeRead(resolvedRecipientId);
    messages.value = messages.value.map((item) => (
      item.recipientId === resolvedRecipientId
        ? { ...item, readStatus: 1, readAt: new Date().toISOString() }
        : item
    ));
    await fetchUnread();
    if (toast) {
      ElMessage.success('消息已标为已读');
    }
  } finally {
    detailActionLoading.value = false;
  }
}

async function handleMarkAllRead() {
  const userId = getCurrentUserId();
  if (!userId) return;

  markingAll.value = true;
  try {
    await markAllNoticeRead(userId);
    await loadPage();
    ElMessage.success('全部消息已标为已读');
  } finally {
    markingAll.value = false;
  }
}

async function handleDeleteCurrent() {
  if (!currentMessage.value?.recipientId) return;

  try {
    await ElMessageBox.confirm('删除后，这条消息将不再显示。是否继续？', '删除确认', {
      type: 'warning'
    });
  } catch {
    return;
  }

  deleting.value = true;
  try {
    await deleteNoticeRecipient(currentMessage.value.recipientId);
    await loadPage();
    ElMessage.success('消息已删除');
  } finally {
    deleting.value = false;
  }
}

function handleSearch() {
  pager.pageNum = 1;
  loadMessageList();
}

function resetFilters() {
  filters.readStatus = null;
  pager.pageNum = 1;
  loadMessageList();
}

onMounted(() => {
  loadPage();
});
</script>

<style scoped>
.message-shell {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 20px;
}

.message-sidebar {
  display: grid;
  gap: 20px;
}

.message-kpis {
  display: grid;
  gap: 12px;
}

.message-kpi {
  padding: 16px 18px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
}

.message-kpi__label {
  font-size: 12px;
  color: var(--text-secondary);
}

.message-kpi__value {
  margin-top: 12px;
  font-family: var(--font-serif);
  font-size: 30px;
  color: #1b4c57;
}

.message-kpi__desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-light);
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 220px;
  max-height: 720px;
  overflow: auto;
}

.message-list-item {
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #fcfaf7 100%);
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.message-list-item:hover,
.message-list-item.is-active {
  transform: translateY(-2px);
  border-color: rgba(30, 73, 87, 0.28);
  box-shadow: 0 12px 26px rgba(30, 73, 87, 0.08);
}

.message-list-item__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.message-list-item__title {
  font-weight: 600;
  color: var(--text-primary);
}

.message-list-item__time {
  font-size: 12px;
  color: var(--text-light);
}

.message-list-item__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.message-list-item__snippet {
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.message-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.message-detail-card {
  min-height: 100%;
}

.message-detail__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.message-detail__title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 28px;
  color: #173f49;
}

.message-detail__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.message-detail__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.message-detail__info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 22px;
}

.message-info-card {
  padding: 16px 18px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbfc 100%);
}

.message-info-card__label {
  font-size: 12px;
  color: var(--text-light);
}

.message-info-card__value {
  margin-top: 10px;
  font-weight: 600;
  color: var(--text-primary);
}

.message-detail__body {
  margin-top: 24px;
}

.message-detail__body h4 {
  margin: 0 0 14px;
  font-size: 16px;
  color: #1b4c57;
}

.message-detail__content {
  min-height: 280px;
  padding: 20px;
  border: 1px solid rgba(231, 223, 213, 0.92);
  border-radius: 18px;
  background: linear-gradient(180deg, #fff 0%, #faf8f4 100%);
  line-height: 1.95;
  color: var(--text-secondary);
  white-space: pre-wrap;
}

@media (max-width: 1180px) {
  .message-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .message-detail__header,
  .message-list-item__head {
    flex-direction: column;
  }

  .message-detail__info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
