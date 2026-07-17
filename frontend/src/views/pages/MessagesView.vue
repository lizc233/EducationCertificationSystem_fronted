<template>
  <StandardPage title="消息通知中心" :breadcrumbs="['首页', '工作台', '消息通知中心']" description="统一查看认证业务通知、审批提醒和系统消息。">
    <template #actions>
      <el-badge :value="unreadCount">
        <el-button type="primary" :loading="marking" @click="markAllRead">全部已读</el-button>
      </el-badge>
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

const router = useRouter();
const route = useRoute();
const marking = ref(false);

const messages = ref([
  { id: 1, title: '2026 届培养方案归档提醒', time: '2026-07-16 09:20', read: false, content: '请在本周内完成 2026 届培养方案归档与审批流程，确保后续达成度计算使用的方案版本准确。' },
  { id: 2, title: '软件工程课程成绩已提交', time: '2026-07-15 18:30', read: false, content: '《软件工程》课程目标成绩已由任课教师提交并锁定，请相关管理员复核。' },
  { id: 3, title: '问卷回收率日报', time: '2026-07-15 08:10', read: true, content: '当前毕业要求满意度问卷回收率已达 72%，建议向未填报人员再次发送提醒。' },
  { id: 4, title: '达成度预警已生成', time: '2026-07-14 17:20', read: false, content: 'GR2 / 2.1 达成度低于阈值，请进入毕业要求达成度评价与预警页面查看。' },
  { id: 5, title: '新问卷已发布', time: '2026-07-14 09:05', read: true, content: '毕业要求满意度调查已面向 2026 届毕业生发布。' },
  { id: 6, title: '课程资源上传成功', time: '2026-07-13 16:10', read: true, content: '《程序设计基础》课程资源已完成归档。' },
  { id: 7, title: '报告章节任务更新', time: '2026-07-13 14:45', read: false, content: '自评报告第 3 章内容已指派至课程组负责人。' },
  { id: 8, title: '系统参数变更提醒', time: '2026-07-12 20:00', read: true, content: '达成度阈值已更新为 0.75。' },
  { id: 9, title: '授课任务待确认', time: '2026-07-12 11:30', read: false, content: '软件工程课程 2025-2026-2 学期授课安排待确认。' },
  { id: 10, title: '持续改进计划验收提醒', time: '2026-07-11 18:00', read: true, content: '请在本周内完成改进计划验收记录。' }
]);

const activeId = computed(() => Number(route.query.id || 1));
const currentMessage = computed(() => messages.value.find((item) => item.id === activeId.value) || messages.value[0]);
const unreadCount = computed(() => messages.value.filter((item) => !item.read).length);

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
</script>
