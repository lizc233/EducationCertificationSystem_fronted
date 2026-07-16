<template>
  <div class="home">
    <div class="row1">
      <div
        v-for="it in homeNum"
        :key="it.label"
        class="nbox page-box"
      >
        <div class="a">{{ it.label }}</div>
        <div class="b">{{ it.val }}</div>
        <div class="c">{{ it.tag }}</div>
      </div>
    </div>

    <div class="row2">
      <div class="blk page-box">
        <div class="t1">待办</div>
        <table class="tb">
          <tr>
            <th>事项</th>
            <th>负责人</th>
            <th>时间</th>
            <th>状态</th>
          </tr>
          <tr v-for="it in todo" :key="it.name">
            <td>{{ it.name }}</td>
            <td>{{ it.who }}</td>
            <td>{{ it.time }}</td>
            <td>
              <span :class="['small-tag', it.type === '急' ? 'tag-red' : 'tag-blue']">{{ it.type }}</span>
            </td>
          </tr>
        </table>
      </div>

      <div class="blk page-box">
        <div class="t1">提醒</div>
        <div class="warn-list">
          <div v-for="it in warn" :key="it.name" class="warn-item">
            <div class="w1">{{ it.name }}</div>
            <div class="w2">{{ it.note }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="blk page-box m1">
      <div class="bar">
        <div class="t1">模块进度</div>
        <span class="small-tag">{{ roleText }}</span>
      </div>
      <el-table :data="homeRows" border>
        <el-table-column prop="mod" label="模块" min-width="140" />
        <el-table-column prop="done" label="完成度" width="100" />
        <el-table-column prop="state" label="状态" width="120">
          <template #default="{ row }">
            <span :class="['small-tag', tagCls(row.state)]">{{ row.state }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="说明" min-width="220" />
      </el-table>
    </div>

    <div class="row3">
      <div class="blk page-box">
        <div class="t1">课程抽查</div>
        <el-table :data="courseRows" border>
          <el-table-column prop="course" label="课程" min-width="150" />
          <el-table-column prop="teacher" label="负责人" width="110" />
          <el-table-column prop="status" label="状态" width="110">
            <template #default="{ row }">
              <span :class="['small-tag', tagCls(row.status)]">{{ row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="completion" label="完整度" width="100" />
          <el-table-column prop="risk" label="备注" min-width="180" />
        </el-table>
      </div>

      <div class="blk page-box">
        <div class="t1">最近记录</div>
        <ul class="news">
          <li v-for="it in news" :key="it.time + it.text">
            <span>{{ it.time }}</span>
            <em>{{ it.text }}</em>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { courseSnapshot as courseRows, homeNum, homeRows, news, roleNote, todo, warn } from '../data/workspace';

const auth = useAuthStore();
const roleText = computed(() => roleNote[auth.role] || '');

function tagCls(v) {
  if (v === '需跟进' || v === '急' || v === '待补' || v === '待处理') return 'tag-red';
  if (v === '处理中' || v === '待发送' || v === '待复核') return 'tag-yellow';
  if (v === '正常' || v === '材料完整') return 'tag-green';
  return 'tag-blue';
}
</script>

<style scoped>
.home {
  display: grid;
  gap: 11px;
}

.row1 {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px 12px;
}

.nbox {
  padding: 12px 12px 10px;
  background: #fff;
}

.a {
  color: var(--sub);
  margin-bottom: 6px;
}

.b {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.c {
  font-size: 12px;
  color: var(--sub);
}

.row2 {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 12px 10px;
}

.row3 {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 10px 14px;
}

.blk {
  padding: 10px 12px 12px;
  background: #fff;
}

.t1 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.tb {
  width: 100%;
  border-collapse: collapse;
}

.tb th,
.tb td {
  border: 1px solid var(--line);
  padding: 8px 10px;
  text-align: left;
}

.warn-list {
  display: grid;
  gap: 8px;
}

.warn-item {
  border: 1px solid var(--line);
  padding: 9px 10px;
  background: #fbfbfb;
}

.w1 {
  margin-bottom: 4px;
}

.w2 {
  color: var(--sub);
  font-size: 13px;
}

.bar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.m1 {
  padding-top: 12px;
}

.news {
  margin: 0;
  padding-left: 18px;
}

.news li {
  margin-bottom: 10px;
  line-height: 1.8;
}

.news span {
  color: var(--sub);
  margin-right: 8px;
}

.news em {
  font-style: normal;
}

@media (max-width: 1000px) {
  .row1 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .row2,
  .row3 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 650px) {
  .row1 {
    grid-template-columns: 1fr;
  }
}
</style>
