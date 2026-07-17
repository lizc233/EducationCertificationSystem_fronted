<template>
  <div class="app-shell login-page">
    <section class="login-shell">
      <div class="login-visual">
        <div class="login-visual__grid"></div>
        <div class="login-visual__content">
          <div class="login-brand">
            <div class="login-brand__emblem">工教</div>
            <div>
              <div class="login-brand__meta">工程教育认证智能服务系统</div>
              <h1 class="login-brand__title">统一业务登录入口</h1>
            </div>
          </div>

          <div class="login-hero">
            <h2 class="login-hero__title">面向教学运行与认证工作的业务协同平台</h2>
            <p class="login-hero__desc">
              统一处理选课、教学、评价、改进与报告等业务，支持多角色分级访问和全过程在线办理。
            </p>
          </div>

          <div class="login-stats">
            <article
              v-for="item in visualStats"
              :key="item.label"
              class="login-stat-card"
            >
              <div class="login-stat-card__label">{{ item.label }}</div>
              <div class="login-stat-card__value">{{ item.value }}</div>
              <div class="login-stat-card__desc">{{ item.desc }}</div>
            </article>
          </div>

          <div class="login-highlights">
            <article
              v-for="item in highlights"
              :key="item.title"
              class="login-highlight-card"
            >
              <div class="login-highlight-card__title">{{ item.title }}</div>
              <div class="login-highlight-card__detail">{{ item.detail }}</div>
            </article>
          </div>
        </div>
      </div>

      <div class="login-form-panel">
        <div class="login-form-panel__meta">账号登录</div>
        <h2 class="login-form-panel__title">欢迎进入系统</h2>
        <p class="login-form-panel__desc">请输入账号、密码和验证码后登录。</p>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="login-form"
          @keyup.enter.prevent="submit"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model.trim="form.username" placeholder="请输入用户名" size="large" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" size="large" />
          </el-form-item>
          <el-form-item label="验证码" prop="captcha">
            <div class="captcha-row">
              <el-input v-model.trim="form.captcha" placeholder="请输入验证码" size="large" />
              <button
                type="button"
                class="captcha-button"
                @click="refreshCaptcha"
              >
                <img :src="captchaImage" alt="验证码" class="captcha-image" />
              </button>
            </div>
          </el-form-item>

          <el-button type="primary" size="large" class="login-submit" :loading="loading" @click="submit">
            登录系统
          </el-button>
        </el-form>

        <div class="login-shortcuts">
          <div class="preset-role-tip">选择角色后将自动填入账号，密码统一为 123456。</div>
          <div class="preset-role-grid">
            <button
              v-for="item in rolePresets"
              :key="item.value"
              type="button"
              :class="['preset-role', { 'is-active': form.username === item.value }]"
              @click="applyPreset(item.value)"
            >
              <span class="preset-role__label">{{ item.label }}</span>
              <span class="preset-role__account">{{ item.account }}</span>
              <span class="preset-role__desc">{{ item.desc }}</span>
            </button>
          </div>
        </div>

        <div class="login-panel-footer">
          <span>如需修改账户信息，请联系系统管理员。</span>
          <a href="#" @click.prevent>忘记密码</a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../store/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const formRef = ref();
const loading = ref(false);
const captchaCode = ref(generateCaptchaCode());

const rolePresets = [
  {
    value: 'admin',
    label: '超级管理员',
    account: 'admin',
    desc: '教务与系统管理'
  },
  {
    value: 'teacher',
    label: '教学老师',
    account: 'teacher',
    desc: '课程与成绩办理'
  },
  {
    value: 'student',
    label: '学生',
    account: 'student',
    desc: '学习与填报服务'
  }
];

const visualStats = [
  { label: '培养方案', value: '18', desc: '在用版本' },
  { label: '课程资源', value: '246', desc: '已归集条目' },
  { label: '待办预警', value: '07', desc: '需跟进事项' }
];

const highlights = [
  {
    title: '统一入口',
    detail: '覆盖方案、课程、评价、问卷、报告等核心业务。'
  },
  {
    title: '分级授权',
    detail: '按教务老师、教学老师、学生展示不同菜单与页面。'
  },
  {
    title: '过程留痕',
    detail: '通知、资料、成绩与反馈统一在线归档。'
  }
];

const form = reactive({
  username: 'admin',
  password: '123456',
  captcha: ''
});

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
};

function resetLoginState() {
  form.username = 'admin';
  form.password = '123456';
  form.captcha = '';
  loading.value = false;
  if (formRef.value) {
    formRef.value.clearValidate();
  }
  captchaCode.value = generateCaptchaCode();
}

const captchaImage = computed(() => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="116" height="40" viewBox="0 0 116 40">
      <rect width="116" height="40" rx="8" fill="#f9f3f4"></rect>
      <path d="M0 28 C18 10 40 34 58 18 C80 4 96 30 116 13" stroke="#debdc7" stroke-width="2" fill="none"></path>
      <text x="58" y="27" text-anchor="middle" font-size="20" font-family="Arial" letter-spacing="4" fill="#6f1836">${captchaCode.value}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${window.btoa(svg)}`;
});

function generateCaptchaCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function refreshCaptcha() {
  captchaCode.value = generateCaptchaCode();
  form.captcha = '';
}

function applyPreset(role) {
  form.username = role;
  form.password = '123456';
  refreshCaptcha();
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  if (form.captcha.toUpperCase() !== captchaCode.value) {
    ElMessage.error('验证码错误');
    refreshCaptcha();
    return;
  }

  loading.value = true;
  try {
    await userStore.login(form.username, form.password, form.captcha);
    ElMessage.success('登录成功');
    await router.push('/dashboard');
  } catch (error) {
    ElMessage.error(error?.message || '登录失败');
    refreshCaptcha();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  resetLoginState();
});

watch(
  () => route.fullPath,
  () => {
    resetLoginState();
  }
);
</script>

<style scoped>
.login-page {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(181, 146, 86, 0.16), transparent 26%),
    radial-gradient(circle at right 20%, rgba(96, 28, 47, 0.14), transparent 22%),
    linear-gradient(180deg, #f8f3ec 0%, #efe6d9 100%);
}

.login-shell {
  width: min(1240px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1.22fr) minmax(390px, 430px);
  border-radius: 34px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 34px 90px rgba(33, 10, 17, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.72);
}

.login-visual {
  position: relative;
  min-height: 720px;
  padding: 54px;
  background:
    linear-gradient(135deg, rgba(41, 13, 18, 0.97) 0%, rgba(88, 29, 41, 0.95) 52%, rgba(141, 73, 56, 0.92) 100%);
  color: #fff;
}

.login-visual__grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
  background-size: 46px 46px;
  opacity: 0.14;
}

.login-visual__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 18px;
}

.login-brand__emblem {
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.08) 100%);
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.login-brand__meta {
  font-size: 13px;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.74);
}

.login-brand__title {
  margin: 10px 0 0;
  font-family: var(--font-serif);
  font-size: 42px;
  line-height: 1.12;
}

.login-hero {
  margin-top: 84px;
  max-width: 640px;
}

.login-hero__title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 56px;
  line-height: 1.12;
}

.login-hero__desc {
  margin: 24px 0 0;
  font-size: 15px;
  line-height: 1.95;
  color: rgba(255, 255, 255, 0.82);
}

.login-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 34px;
  max-width: 640px;
}

.login-stat-card,
.login-highlight-card {
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
}

.login-stat-card {
  padding: 18px;
}

.login-stat-card__label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.68);
}

.login-stat-card__value {
  margin-top: 14px;
  font-family: var(--font-serif);
  font-size: 30px;
}

.login-stat-card__desc {
  margin-top: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.78);
}

.login-highlights {
  display: grid;
  gap: 16px;
  margin-top: auto;
  max-width: 560px;
  padding-top: 48px;
}

.login-highlight-card {
  padding: 18px 20px;
}

.login-highlight-card__title {
  font-size: 22px;
  font-family: var(--font-serif);
}

.login-highlight-card__detail {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.85;
  color: rgba(255, 255, 255, 0.76);
}

.login-form-panel {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 52px 40px 38px;
  background:
    radial-gradient(circle at top right, rgba(111, 24, 54, 0.08), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 250, 244, 0.98) 100%);
}

.login-form-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.52), transparent 42%),
    radial-gradient(circle at bottom right, rgba(179, 139, 87, 0.08), transparent 30%);
  pointer-events: none;
}

.login-form-panel__meta {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(111, 24, 54, 0.08);
  font-size: 12px;
  letter-spacing: 0.22em;
  color: var(--primary-color);
}

.login-form-panel__title {
  position: relative;
  z-index: 1;
  margin: 16px 0 10px;
  font-family: var(--font-serif);
  font-size: 36px;
  color: var(--primary-dark);
}

.login-form-panel__desc {
  position: relative;
  z-index: 1;
  margin: 0;
  max-width: 320px;
  line-height: 1.9;
  color: var(--text-secondary);
}

.preset-role-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.preset-role {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-height: 78px;
  padding: 10px 8px;
  border: 1px solid rgba(207, 182, 175, 0.68);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #fbf7f2 100%);
  text-align: center;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.preset-role:hover {
  transform: translateY(-1px);
  border-color: rgba(111, 24, 54, 0.32);
  box-shadow: 0 12px 22px rgba(111, 24, 54, 0.08);
}

.preset-role.is-active {
  border-color: rgba(111, 24, 54, 0.58);
  background: linear-gradient(180deg, rgba(111, 24, 54, 0.08) 0%, rgba(255, 248, 241, 0.98) 100%);
  box-shadow: 0 12px 20px rgba(111, 24, 54, 0.08);
}

.preset-role__label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.preset-role__account {
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--primary-color);
}

.preset-role__desc {
  display: none;
}

.preset-role-tip {
  font-size: 12px;
  line-height: 1.8;
  color: var(--text-light);
}

.login-form {
  position: relative;
  z-index: 1;
  margin-top: 28px;
  padding: 22px 22px 18px;
  border: 1px solid rgba(231, 223, 213, 0.9);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow:
    0 18px 36px rgba(60, 25, 32, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 116px;
  gap: 12px;
  width: 100%;
}

.captcha-button {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  overflow: hidden;
}

.captcha-image {
  display: block;
  width: 100%;
  height: 40px;
  object-fit: cover;
}

.login-submit {
  width: 100%;
  margin-top: 10px;
  height: 48px;
  border-radius: 14px;
  box-shadow: 0 16px 28px rgba(111, 24, 54, 0.16);
}

.login-shortcuts {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(231, 223, 213, 0.9);
}

.login-panel-footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  font-size: 13px;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.login-panel-footer a {
  color: var(--primary-color);
}

@media (max-width: 980px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-visual {
    min-height: auto;
  }

  .login-highlights {
    margin-top: 32px;
    padding-top: 0;
  }
}

@media (max-width: 640px) {
  .login-page {
    padding: 18px;
  }

  .login-form-panel {
    padding: 32px 22px 26px;
  }

  .login-visual {
    padding: 30px 22px;
  }

  .login-hero {
    margin-top: 44px;
  }

  .login-hero__title {
    font-size: 38px;
  }

  .login-brand__title {
    font-size: 32px;
  }

  .login-stats {
    grid-template-columns: 1fr;
  }

  .login-form {
    padding: 18px 16px 14px;
    border-radius: 22px;
  }

  .captcha-row {
    grid-template-columns: 1fr;
  }
}
</style>
