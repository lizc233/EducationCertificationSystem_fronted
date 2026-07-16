<template>
  <div class="login-page">
    <div class="login-card glass">
      <div class="hero">
        <div class="logo">EC</div>
        <h1>工程教育专业认证智能服务系统</h1>
        <p>前后端分离 · Vue 3 · Element Plus · MyBatis-Plus</p>
      </div>

      <el-form :model="form" ref="formRef" class="form" @submit.prevent>
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="密码" />
        </el-form-item>
        <el-button type="primary" class="submit" :loading="loading" @click="handleLogin">登录</el-button>
      </el-form>
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
const formRef = ref();

const form = reactive({
  username: 'admin',
  password: '123456'
});

async function handleLogin() {
  loading.value = true;
  try {
    await auth.login(form);
    ElMessage.success('登录成功');
    router.push('/dashboard');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.login-card {
  width: min(960px, 100%);
  min-height: 560px;
  border-radius: 32px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  overflow: hidden;
}

.hero {
  padding: 56px;
  color: var(--text);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 138, 0, 0.18), transparent 32%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
}

.logo {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  color: #111827;
  font-weight: 900;
  font-size: 24px;
  background: linear-gradient(135deg, var(--brand), var(--brand-2));
  margin-bottom: 22px;
}

.hero h1 {
  margin: 0;
  font-size: 40px;
  line-height: 1.08;
}

.hero p {
  color: var(--text-dim);
  margin: 16px 0 0;
}

.form {
  padding: 56px 40px;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.submit {
  width: 100%;
}

@media (max-width: 900px) {
  .login-card {
    grid-template-columns: 1fr;
  }
}
</style>
