<template>
  <div
    class="app-shell"
    style="
      display: grid;
      place-items: center;
      min-height: 100vh;
      padding: 32px;
      background:
        radial-gradient(circle at top left, rgba(181, 146, 86, 0.16), transparent 26%),
        radial-gradient(circle at right 20%, rgba(96, 28, 47, 0.14), transparent 22%),
        linear-gradient(180deg, #f8f3ec 0%, #efe6d9 100%);
    "
  >
    <section
      class="login-shell"
      style="
        width: min(1260px, 100%);
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(380px, 430px);
        border-radius: 34px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.82);
        box-shadow: 0 34px 90px rgba(33, 10, 17, 0.16);
        border: 1px solid rgba(255, 255, 255, 0.72);
      "
    >
      <div
        class="login-visual"
        style="
          position: relative;
          min-height: 720px;
          padding: 52px 54px;
          background:
            linear-gradient(135deg, rgba(41, 13, 18, 0.96) 0%, rgba(92, 31, 42, 0.94) 48%, rgba(145, 75, 53, 0.9) 100%);
          color: #fff;
        "
      >
        <div
          style="
            position: absolute;
            inset: 0;
            background:
              linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
            background-size: 46px 46px;
            opacity: 0.14;
          "
        />
        <div style="position: relative; z-index: 1;">
          <div style="display: flex; align-items: center; gap: 18px;">
            <div
              style="
                display: grid;
                place-items: center;
                width: 78px;
                height: 78px;
                border-radius: 22px;
                border: 1px solid rgba(255, 255, 255, 0.18);
                background:
                  linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.08) 100%);
                font-family: var(--font-serif);
                font-size: 19px;
                font-weight: 700;
                letter-spacing: 0.12em;
              "
            >
              EEA
            </div>
            <div>
              <div style="font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255, 255, 255, 0.72);">
                Engineering Education Accreditation
              </div>
              <h1 style="margin: 10px 0 0; font-family: var(--font-serif); font-size: 42px; line-height: 1.12;">工程教育认证系统</h1>
            </div>
          </div>

          <div style="margin-top: 86px; max-width: 620px;">
            <div style="font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255, 255, 255, 0.66);">
              System Access
            </div>
            <h2 style="margin: 18px 0 0; font-family: var(--font-serif); font-size: 58px; line-height: 1.12; max-width: 720px;">
              面向认证周期的
              <br />
              工程教育业务工作台
            </h2>
            <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.95; color: rgba(255, 255, 255, 0.82);">
              覆盖培养方案、课程体系、达成度评价、持续改进、自评报告与 AI 助手等核心业务，支持认证工作全流程在线处理。
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 30px; max-width: 620px;">
            <article style="padding: 18px; border-radius: 18px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);">
              <div style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.66);">Scheme</div>
              <div style="margin-top: 12px; font-size: 28px; font-family: var(--font-serif);">18</div>
              <div style="margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.78);">有效方案版本</div>
            </article>
            <article style="padding: 18px; border-radius: 18px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);">
              <div style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.66);">Course</div>
              <div style="margin-top: 12px; font-size: 28px; font-family: var(--font-serif);">246</div>
              <div style="margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.78);">课程与资源条目</div>
            </article>
            <article style="padding: 18px; border-radius: 18px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);">
              <div style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.66);">Review</div>
              <div style="margin-top: 12px; font-size: 28px; font-family: var(--font-serif);">07</div>
              <div style="margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.78);">待处理预警项</div>
            </article>
          </div>

          <div style="display: grid; gap: 16px; margin-top: 42px; max-width: 540px;">
            <article
              v-for="item in highlights"
              :key="item.title"
              style="
                padding: 18px 20px;
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 18px;
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(4px);
              "
            >
              <div style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255, 255, 255, 0.66);">
                {{ item.eyebrow }}
              </div>
              <div style="margin-top: 10px; font-size: 22px; font-family: var(--font-serif);">{{ item.title }}</div>
              <div style="margin-top: 8px; font-size: 13px; line-height: 1.85; color: rgba(255, 255, 255, 0.76);">
                {{ item.detail }}
              </div>
            </article>
          </div>
        </div>
      </div>

      <div class="login-form-panel" style="padding: 52px 40px 38px; background: rgba(255, 255, 255, 0.98);">
        <div style="font-size: 12px; letter-spacing: 0.26em; text-transform: uppercase; color: var(--text-light);">Secure Access</div>
        <h2 style="margin: 16px 0 10px; font-family: var(--font-serif); font-size: 34px; color: var(--primary-dark);">统一登录入口</h2>
        <p style="margin: 0; line-height: 1.9; color: var(--text-secondary);">
          输入账号、密码和验证码后进入系统。当前账号仍为前端 Mock 登录。
        </p>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          style="margin-top: 28px;"
          @keyup.enter.prevent="submit"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model.trim="form.username" placeholder="请输入用户名" size="large" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" size="large" />
          </el-form-item>
          <el-form-item label="验证码" prop="captcha">
            <div style="display: grid; grid-template-columns: minmax(0, 1fr) 116px; gap: 12px; width: 100%;">
              <el-input v-model.trim="form.captcha" placeholder="请输入验证码" size="large" />
              <button
                type="button"
                style="border: 1px solid var(--border-color); border-radius: 8px; background: #fff; cursor: pointer;"
                @click="refreshCaptcha"
              >
                <img :src="captchaImage" alt="验证码" style="display: block; width: 100%; height: 40px; object-fit: cover;" />
              </button>
            </div>
          </el-form-item>

          <el-button type="primary" size="large" style="width: 100%; margin-top: 10px;" :loading="loading" @click="submit">
            登录系统
          </el-button>
        </el-form>

        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 18px; flex-wrap: wrap;">
          <el-space wrap>
            <el-tag @click="applyPreset('admin')" style="cursor: pointer;">管理员</el-tag>
            <el-tag type="success" @click="applyPreset('teacher')" style="cursor: pointer;">教师</el-tag>
            <el-tag type="warning" @click="applyPreset('student')" style="cursor: pointer;">学生</el-tag>
          </el-space>
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

const highlights = [
  {
    eyebrow: 'Scheme',
    title: '方案与课程',
    detail: '覆盖培养方案、课程目标、教学内容、授课任务和课程资源等主要业务。'
  },
  {
    eyebrow: 'Evaluation',
    title: '达成度评价',
    detail: '支持课程目标、毕业要求、模型配置、统计分析看板和预警处理。'
  },
  {
    eyebrow: 'Report',
    title: '报告与 AI',
    detail: '支持自评报告编写、问卷统计、消息通知以及 AI 辅助分析与采纳。'
  }
];

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
@media (max-width: 980px) {
  .login-shell {
    grid-template-columns: 1fr !important;
  }

  .login-visual {
    min-height: auto !important;
  }
}

@media (max-width: 640px) {
  .login-form-panel {
    padding: 32px 22px 26px !important;
  }

  .login-visual {
    padding: 30px 22px !important;
  }
}
</style>
