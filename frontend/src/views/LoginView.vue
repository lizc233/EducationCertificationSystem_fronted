<template>
  <div class="login-wrap">
    <div class="login-box page-box">
      <div class="left">
        <h1>工程教育认证系统</h1>
        <div class="txt">前端演示页。当前先用本地账号登录。</div>

        <div class="info page-box">
          <div class="hd">当前说明</div>
          <ul>
            <li>系统基础只给管理员。</li>
            <li>课程、评价、报告在锁定周期下默认只读。</li>
            <li>这里只保留认证常用模块。</li>
          </ul>
        </div>

        <div class="info page-box">
          <div class="hd">测试账号</div>
          <table class="acc-table">
            <tr>
              <th>账号</th>
              <th>角色</th>
            </tr>
            <tr @click="pick('admin')">
              <td>admin</td>
              <td>管理员</td>
            </tr>
            <tr @click="pick('leader')">
              <td>leader</td>
              <td>专业负责人</td>
            </tr>
            <tr @click="pick('teacher')">
              <td>teacher</td>
              <td>课程负责人</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="right">
        <div class="form-hd">登录</div>
        <el-form @submit.prevent>
          <el-form-item>
            <el-input v-model="form.username" placeholder="账号" />
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.password" type="password" show-password placeholder="密码" />
          </el-form-item>
          <el-button class="btn" type="primary" :loading="loading" @click="go">登录</el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const loading = ref(false);
const form = reactive({
  username: 'admin',
  password: '123456'
});

function pick(name) {
  form.username = name;
  form.password = '123456';
}

async function go() {
  if (!form.username || !form.password) {
    ElMessage.warning('账号和密码不能为空');
    return;
  }
  loading.value = true;
  try {
    await auth.doLogin(form);
    router.push('/dashboard');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.login-box {
  width: 920px;
  max-width: 100%;
  display: grid;
  grid-template-columns: 1.3fr 0.9fr;
  background: #fff;
}

.left {
  padding: 28px 24px 24px 24px;
  border-right: 1px solid var(--line);
}

.left h1 {
  margin: 0 0 10px;
  font-size: 24px;
  font-weight: 600;
}

.txt {
  color: var(--sub);
  margin-bottom: 14px;
}

.info {
  padding: 10px 12px;
  margin-bottom: 12px;
}

.hd {
  font-weight: 600;
  margin-bottom: 8px;
}

.info ul {
  margin: 0;
  padding-left: 18px;
  color: #4d5560;
  line-height: 1.9;
}

.acc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.acc-table th,
.acc-table td {
  border: 1px solid var(--line);
  padding: 8px 10px;
  text-align: left;
}

.acc-table tr:nth-child(n + 2) {
  cursor: pointer;
}

.right {
  padding: 30px 26px 24px 26px;
}

.form-hd {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

.btn {
  width: 100%;
  margin-top: 6px;
}

@media (max-width: 860px) {
  .login-box {
    grid-template-columns: 1fr;
  }

  .left {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
}
</style>
