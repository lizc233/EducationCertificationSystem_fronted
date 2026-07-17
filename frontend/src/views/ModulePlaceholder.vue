<template>
  <div class="space-y-6">
    <section class="page-shell px-6 py-6 sm:px-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-[820px]">
          <p class="text-[12px] uppercase tracking-[0.3em] text-[var(--text-3)]">业务概览</p>
          <h2 class="serif-title mt-3 text-[30px] text-[var(--text-1)] sm:text-[34px]">{{ cur.title }}</h2>
          <p class="mt-3 text-[14px] leading-7 text-[var(--text-2)]">{{ cur.desc }}</p>
        </div>

        <div class="flex flex-wrap gap-2">
          <span class="small-tag tag-blue">{{ roleLabel }}</span>
          <span class="small-tag" :class="readOnly ? 'tag-yellow' : 'tag-green'">
            {{ readOnly ? '查询模式' : '可办理' }}
          </span>
        </div>
      </div>
    </section>

    <article
      v-if="!allow"
      class="rounded-[20px] border border-[rgba(197,48,48,0.22)] bg-[rgba(197,48,48,0.08)] px-5 py-4 text-[14px] leading-7 text-[var(--danger)]"
    >
      当前账号没有访问此模块的权限，请切换具备相应角色的账号后再访问。
    </article>

    <template v-else>
      <article
        v-if="readOnly"
        class="rounded-[20px] border border-[rgba(163,106,30,0.24)] bg-[rgba(163,106,30,0.08)] px-5 py-4 text-[14px] leading-7 text-[var(--accent-gold)]"
      >
        当前页面在本业务周期内仅开放查询，如需调整数据，请通过对应业务流程提交。
      </article>

      <section class="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <article class="page-box px-6 py-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 class="section-title text-[22px]">当前情况</h3>
              <p class="section-sub mt-2">查看本模块的关键数量、处理状态和近期同步情况。</p>
            </div>
            <span class="small-tag tag-blue">模块概览</span>
          </div>

          <div class="mt-5 overflow-hidden rounded-[22px] border border-[rgba(207,182,175,0.58)]">
            <table class="w-full border-collapse text-left">
              <thead>
                <tr class="bg-[rgba(127,29,45,0.06)] text-[13px] text-[var(--text-2)]">
                  <th class="px-4 py-3 font-medium">项目</th>
                  <th class="px-4 py-3 font-medium">数值</th>
                  <th class="px-4 py-3 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in cur.rows"
                  :key="row.a"
                  class="border-t border-[rgba(207,182,175,0.48)] text-[14px] text-[var(--text-1)]"
                >
                  <td class="px-4 py-3">{{ row.a }}</td>
                  <td class="px-4 py-3 font-semibold">{{ row.b }}</td>
                  <td class="px-4 py-3">
                    <span class="small-tag" :class="tagCls(row.c)">{{ row.c }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="page-box px-6 py-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 class="section-title text-[22px]">办理说明</h3>
              <p class="section-sub mt-2">说明当前模块的办理范围、使用方式和后续扩展方向。</p>
            </div>
            <span class="small-tag" :class="readOnly ? 'tag-yellow' : 'tag-green'">
              功能页
            </span>
          </div>

          <ul class="mt-5 space-y-3">
            <li
              v-for="(text, index) in cur.list"
              :key="text"
              class="rounded-[20px] border border-[rgba(207,182,175,0.58)] bg-[rgba(255,255,255,0.72)] px-4 py-4"
            >
              <div class="flex items-start gap-3">
                <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[rgba(127,29,45,0.08)] text-[12px] font-semibold text-[var(--brand)]">
                  {{ index + 1 }}
                </span>
                <span class="text-[14px] leading-7 text-[var(--text-2)]">{{ text }}</span>
              </div>
            </li>
          </ul>

          <div class="mt-5 flex flex-wrap gap-3">
            <button
              v-for="button in cur.btns"
              :key="button"
              type="button"
              class="portal-button secondary"
            >
              {{ button }}
            </button>
          </div>
        </article>
      </section>

      <section class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article class="page-box px-6 py-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 class="section-title text-[22px]">重点观察</h3>
              <p class="section-sub mt-2">通过卡片快速定位当前模块需要跟进的指标和状态。</p>
            </div>
            <span class="small-tag tag-green">{{ cur.rows.length }} 项指标</span>
          </div>

          <div class="mt-5 space-y-4">
            <article
              v-for="row in cur.rows"
              :key="row.a + row.c"
              class="rounded-[22px] border border-[rgba(207,182,175,0.58)] bg-[rgba(255,255,255,0.72)] p-5"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-[15px] font-semibold text-[var(--text-1)]">{{ row.a }}</div>
                  <div class="mt-2 text-[13px] text-[var(--text-2)]">当前数值：{{ row.b }}</div>
                </div>
                <span class="small-tag" :class="tagCls(row.c)">{{ row.c }}</span>
              </div>
            </article>
          </div>
        </article>

        <article class="page-box px-6 py-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 class="section-title text-[22px]">近期事项</h3>
              <p class="section-sub mt-2">查看当前模块已安排的工作项、责任人和时间节点。</p>
            </div>
            <span class="small-tag tag-blue">{{ cur.task.length }} 项安排</span>
          </div>

          <div class="mt-5 overflow-hidden rounded-[22px] border border-[rgba(207,182,175,0.58)]">
            <table class="w-full border-collapse text-left">
              <thead>
                <tr class="bg-[rgba(127,29,45,0.06)] text-[13px] text-[var(--text-2)]">
                  <th class="px-4 py-3 font-medium">事项</th>
                  <th class="px-4 py-3 font-medium">责任人</th>
                  <th class="px-4 py-3 font-medium">时间</th>
                  <th class="px-4 py-3 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in cur.task"
                  :key="row.name"
                  class="border-t border-[rgba(207,182,175,0.48)] text-[14px] text-[var(--text-1)]"
                >
                  <td class="px-4 py-3">{{ row.name }}</td>
                  <td class="px-4 py-3">{{ row.who }}</td>
                  <td class="px-4 py-3">{{ row.time }}</td>
                  <td class="px-4 py-3">
                    <span class="small-tag" :class="tagCls(row.st)">{{ row.st }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ROLE_LABEL_MAP, useUserStore } from '../store/user';
import { cycle, mods } from '../data/workspace';

const props = defineProps({
  name: {
    type: String,
    default: 'system-settings'
  }
});

const userStore = useUserStore();
const cur = computed(() => mods[props.name] || mods['system-settings']);
const allow = computed(() => cur.value.roles.includes(userStore.userInfo.role));
const readOnly = computed(() => cycle.locked && cur.value.byLock);
const roleLabel = computed(() => ROLE_LABEL_MAP[userStore.userInfo.role] || '未分配角色');

function tagCls(value) {
  if (['需关注', '待接入'].includes(value)) return 'tag-red';
  if (['处理中', '待确认', '待处理'].includes(value)) return 'tag-yellow';
  if (['正常', '已同步', '已排期', '已开放'].includes(value)) return 'tag-green';
  return 'tag-blue';
}
</script>
