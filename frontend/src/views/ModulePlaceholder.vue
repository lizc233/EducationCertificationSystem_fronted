<template>
  <div class="mod-page">
    <div class="top page-box">
      <div>
        <h2>{{ cur.title }}</h2>
        <div class="sub-txt">{{ cur.desc }}</div>
      </div>
      <div class="top-r">
        <span class="small-tag">{{ auth.user?.roleName }}</span>
        <span v-if="readOnly" class="small-tag tag-yellow">当前只读</span>
      </div>
    </div>

    <div v-if="!allow" class="deny page-box">
      当前账号没有这个模块权限。
    </div>

    <template v-else>
      <div v-if="readOnly" class="ro page-box">
        周期已锁定，当前模块只能看，不能改。
      </div>

      <div class="mid">
        <div class="page-box box1">
          <div class="hd">当前情况</div>
          <table class="tb">
            <tr>
              <th>项目</th>
              <th>数值</th>
              <th>状态</th>
            </tr>
            <tr v-for="it in cur.rows" :key="it.a">
              <td>{{ it.a }}</td>
              <td>{{ it.b }}</td>
              <td>
                <span :class="['small-tag', tagCls(it.c)]">{{ it.c }}</span>
              </td>
            </tr>
          </table>
        </div>

        <div class="page-box box2">
          <div class="hd">处理说明</div>
          <ul>
            <li v-for="txt in cur.list" :key="txt">{{ txt }}</li>
          </ul>
          <div class="btns">
            <el-button
              v-for="b in cur.btns"
              :key="b"
              size="small"
              :disabled="readOnly && !auth.isAdmin"
            >
              {{ b }}
            </el-button>
          </div>
        </div>
      </div>

      <div class="page-box box3">
        <div class="hd">本周事项</div>
        <el-table :data="cur.task" border>
          <el-table-column prop="name" label="事项" min-width="210" />
          <el-table-column prop="who" label="负责人" width="130" />
          <el-table-column prop="time" label="时间" width="120" />
          <el-table-column prop="st" label="状态" width="120">
            <template #default="{ row }">
              <span :class="['small-tag', tagCls(row.st)]">{{ row.st }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { cycle, mods } from '../data/workspace';

const props = defineProps({
  name: {
    type: String,
    default: 'system'
  }
});

const auth = useAuthStore();
const cur = computed(() => mods[props.name] || mods.system);
const allow = computed(() => auth.can(cur.value.roles));
const readOnly = computed(() => cycle.locked && cur.value.byLock);

function tagCls(v) {
  if (v === '需跟进' || v === '待补' || v === '需处理') return 'tag-red';
  if (v === '处理中' || v === '待评审' || v === '待复核' || v === '待确认' || v === '待发送') return 'tag-yellow';
  if (v === '正常' || v === '已记录' || v === '已立项') return 'tag-green';
  return 'tag-blue';
}
</script>

<style scoped>
.mod-page {
  display: grid;
  gap: 10px;
}

.top {
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  background: #fff;
}

.top h2 {
  margin: 0 0 4px;
  font-size: 22px;
}

.top-r {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.deny,
.ro {
  padding: 10px 12px;
  background: #fff;
}

.deny {
  border-color: #e2b9b9;
  background: #fff7f7;
  color: #9b4646;
}

.ro {
  border-color: #ead9b2;
  background: #fffdf6;
  color: #8a631b;
}

.mid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 13px 9px;
}

.box1,
.box2,
.box3 {
  background: #fff;
  padding: 10px 12px 12px;
}

.hd {
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

.box2 ul {
  margin: 0;
  padding-left: 18px;
  line-height: 1.9;
}

.btns {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .mid {
    grid-template-columns: 1fr;
  }

  .top {
    display: block;
  }

  .top-r {
    margin-top: 10px;
  }
}
</style>
