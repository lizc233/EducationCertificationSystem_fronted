<template>
  <StandardPage title="消息通知中心" :breadcrumbs="['首页', '工作台', '消息通知中心']" description="统一查看认证业务通知、审批提醒和系统消息。">
    <template #actions>
      <el-badge :value="unreadCount">
        <el-button type="primary" :loading="marking" @click="markAllRead">全部已读</el-button>
      </el-badge>
      <el-button :loading="deleting" @click="deleteRead">删除已读</el-button>
    </template>

    <div class="split-grid split-grid--detail">
      <SectionCard title="通知列表">
        <div class="list-panel">
          <button
            v-for="item in messages"
            :key="item.id"
            type="button"
            class="list-item dashboard-action"
            :class="{ 'is-active': activeId === item.id }"
            @click="openMessage(item.id)"
          >
            <div class="dashboard-action__row">
              <div>
                <div class="dashboard-action__title">{{ item.title }}</div>
                <div class="dashboard-action__desc">{{ item.time }}</div>
              </div>
              <el-tag :type="item.read ? 'info' : 'danger'">{{ item.read ? '已读' : '未读' }}</el-tag>
            </div>
          </button>
        </div>
      </SectionCard>

      <SectionCard title="通知详情">
        <h3 style="margin-top: 0;">{{ currentMessage.title }}</h3>
        <p style="color: var(--text-light);">{{ currentMessage.time }}</p>
        <div style="line-height: 1.9; color: var(--text-secondary);">
          {{ currentMessage.content }}
        </div>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { countUnreadMessages, messageItems } from '../../data/messages';

const router = useRouter();
const route = useRoute();
const marking = ref(false);
const deleting = ref(false);
const messages = messageItems;

const activeId = computed(() => Number(route.query.id || 1));
const currentMessage = computed(() => messages.value.find((item) => item.id === activeId.value) || messages.value[0]);
const unreadCount = computed(() => countUnreadMessages());

async function openMessage(id) {
  const target = messages.value.find((item) => item.id === id);
  if (target) {
    target.read = true;
  }
  await router.push({ path: '/messages', query: { id: String(id) } });
}

async function markAllRead() {
  marking.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  messages.value = messages.value.map((item) => ({ ...item, read: true }));
  marking.value = false;
  ElMessage.success('已全部标记为已读');
}

async function deleteRead() {
  deleting.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  messages.value = messages.value.filter((item) => !item.read);
  deleting.value = false;
  ElMessage.success('已删除已读通知');
}
</script>
