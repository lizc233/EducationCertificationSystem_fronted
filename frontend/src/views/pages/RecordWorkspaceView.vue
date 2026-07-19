<template>
  <StandardPage :title="pageTitle" :breadcrumbs="breadcrumbs" :description="pageDescription">
    <template #actions>
      <el-button @click="router.back()">返回上一页</el-button>
      <el-button v-if="isEdit" type="primary" :loading="saving" @click="saveRecord">保存修改</el-button>
    </template>

    <div class="split-grid split-grid--detail">
      <SectionCard :title="isEdit ? '业务表单' : '业务详情'">
        <el-form label-position="top" :model="formModel">
          <el-form-item
            v-for="field in formFields"
            :key="field.prop"
            :label="field.label"
          >
            <el-input
              v-if="field.type === 'textarea'"
              v-model="formModel[field.prop]"
              type="textarea"
              :rows="4"
              :disabled="!isEdit"
            />
            <el-input
              v-else
              v-model="formModel[field.prop]"
              :disabled="!isEdit"
            />
          </el-form-item>
        </el-form>
      </SectionCard>

      <SectionCard title="业务说明">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="所属页面">{{ sourceTitle }}</el-descriptions-item>
          <el-descriptions-item label="当前模式">{{ isEdit ? '编辑' : '查看详情' }}</el-descriptions-item>
          <el-descriptions-item label="记录编号">{{ route.params.id }}</el-descriptions-item>
        </el-descriptions>

        <div class="paper-note" style="margin-top: 18px;">
          当前页面为独立业务路由，列表中的“查看详情”“编辑”等操作统一跳转到此页面处理，不再在原页面下方展开内容。
        </div>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { buildBreadcrumbs, resolveNavItem } from '../../data/navigationV2';
import { useUserStore } from '../../store/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const saving = ref(false);

function parseQueryJSON(key, fallback) {
  const raw = route.query[key];
  if (typeof raw !== 'string') {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

const payload = parseQueryJSON('payload', {});
const schema = parseQueryJSON('schema', []);
const formModel = reactive({ ...payload });

const sourcePath = computed(() => String(route.query.from || '/dashboard'));
const sourceTitle = computed(() => resolveNavItem(sourcePath.value, userStore.userInfo.role).label);
const isEdit = computed(() => route.params.mode === 'edit');
const pageTitle = computed(() => `${sourceTitle.value}${isEdit.value ? '编辑' : '详情'}`);
const pageDescription = computed(() => `处理“${sourceTitle.value}”页面中的单条业务记录。`);
const breadcrumbs = computed(() => buildBreadcrumbs(sourcePath.value, [isEdit.value ? '编辑' : '详情'], userStore.userInfo.role));
const formFields = computed(() => {
  if (schema.length) {
    return schema;
  }

  return Object.keys(payload).map((key) => ({
    prop: key,
    label: key,
    type: String(payload[key]).length > 36 ? 'textarea' : 'input'
  }));
});

async function saveRecord() {
  saving.value = true;
  try {
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    ElMessage.success('保存成功');
    await router.push(sourcePath.value);
  } catch {
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
}
</script>
