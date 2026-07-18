<template>
  <StandardPage title="个人设置" :breadcrumbs="['首页', '个人设置']">
    <SectionCard>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="个人信息" name="profile">
          <div class="split-grid split-grid--detail">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="账号">{{ userStore.userInfo.accountId }}</el-descriptions-item>
              <el-descriptions-item label="姓名">{{ userStore.userInfo.realName }}</el-descriptions-item>
              <el-descriptions-item label="角色">{{ roleLabel }}</el-descriptions-item>
              <el-descriptions-item label="部门/班级">{{ userStore.userInfo.department || '-' }}</el-descriptions-item>
            </el-descriptions>

            <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="90px">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model.trim="profileForm.phone" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model.trim="profileForm.email" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="profileLoading" @click="saveProfile">保存</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="安全设置" name="security">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            style="max-width: 520px"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="passwordLoading" @click="changePassword">确认修改</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </SectionCard>
  </StandardPage>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import StandardPage from '../components/page/StandardPage.vue';
import SectionCard from '../components/page/SectionCard.vue';
import request from '../utils/request';
import { ROLE_LABEL_MAP, useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref('profile');
const profileFormRef = ref();
const passwordFormRef = ref();
const profileLoading = ref(false);
const passwordLoading = ref(false);

const roleLabel = computed(() => ROLE_LABEL_MAP[userStore.userInfo.role] || '未分配角色');

const profileForm = reactive({
  phone: userStore.userInfo.phone,
  email: userStore.userInfo.email
});

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const profileRules = {
  phone: [
    {
      validator: (_, value, callback) => {
        if (!value) {
          callback();
          return;
        }
        if (!/^1\d{10}$/.test(String(value).trim())) {
          callback(new Error('手机号格式不正确'));
          return;
        }
        callback();
      },
      trigger: ['blur', 'change']
    }
  ],
  email: [
    {
      type: 'email',
      message: '邮箱格式不正确',
      trigger: ['blur', 'change']
    }
  ]
};

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的新密码不一致'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }
  ]
};

async function saveProfile() {
  const valid = await profileFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  profileLoading.value = true;
  try {
    await request.put('/user/profile', {
      phone: profileForm.phone,
      email: profileForm.email
    });
    await userStore.getUserInfo();
    profileForm.phone = userStore.userInfo.phone;
    profileForm.email = userStore.userInfo.email;
    ElMessage.success('保存成功');
  } finally {
    profileLoading.value = false;
  }
}

async function changePassword() {
  const valid = await passwordFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  passwordLoading.value = true;
  try {
    await request.put('/user/password', {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });
    ElMessage.success('密码修改成功，请重新登录');
    await userStore.logout();
    await router.push('/login');
  } finally {
    passwordLoading.value = false;
  }
}
</script>
