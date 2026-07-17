<template>
  <StandardPage
    title="自评报告"
    :breadcrumbs="breadcrumbs"
    :description="pageDescription"
  >
    <template #actions>
      <el-button
        v-for="action in actions"
        :key="action.key"
        :type="action.type || 'default'"
        :loading="loading[action.key]"
        @click="runAction(action.key, action.label)"
      >
        {{ action.label }}
      </el-button>
    </template>

    <SectionCard>
      <div class="report-meta-bar">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="报告名称">{{ isTeacher ? '软件工程专业课程支撑章节报告' : '2026 年工程教育认证自评报告' }}</el-descriptions-item>
          <el-descriptions-item label="范围">{{ isTeacher ? '本人任课课程相关章节' : '计算机学院全部专业' }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ isTeacher ? '协同编辑中' : '统稿进行中' }}</el-descriptions-item>
        </el-descriptions>
        <div class="report-progress-panel">
          <div class="report-progress-panel__label">完成进度</div>
          <el-progress :percentage="isTeacher ? 74 : 68" />
        </div>
      </div>

      <div class="split-grid split-grid--sidebar">
        <SectionCard :title="isTeacher ? '我的负责章节' : '报告大纲树'">
          <el-tree
            :data="outlineTree"
            node-key="id"
            default-expand-all
            :current-node-key="1"
          />
        </SectionCard>

        <SectionCard :title="isTeacher ? '章节内容编辑区' : '内容编辑区'">
          <template #extra>
            <el-button-group>
              <el-button>标题</el-button>
              <el-button>加粗</el-button>
              <el-button>列表</el-button>
            </el-button-group>
          </template>
          <div class="editor-shell" contenteditable="true">
            {{ editorContent }}
          </div>
        </SectionCard>
      </div>
    </SectionCard>
  </StandardPage>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { ROLES } from '../../data/navigation';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();
const isTeacher = computed(() => userStore.userInfo.role === ROLES.TEACHER);

const loading = reactive({
  assign: false,
  generate: false,
  export: false,
  save: false
});

const breadcrumbs = computed(() => {
  return ['首页', '报告中心', '自评报告'];
});

const pageDescription = computed(() => {
  return isTeacher.value
    ? '教师仅维护本人课程相关章节内容，支持局部编辑、生成草稿和导出。'
    : '管理员统一维护报告大纲、编写进度、章节任务分配与报告导出。';
});

const actions = computed(() => {
  if (isTeacher.value) {
    return [
      { key: 'save', label: '保存章节', type: 'primary' },
      { key: 'generate', label: '生成初稿' },
      { key: 'export', label: '导出章节' }
    ];
  }

  return [
    { key: 'assign', label: '分配任务', type: 'primary' },
    { key: 'generate', label: '生成初稿' },
    { key: 'export', label: '导出完整报告' }
  ];
});

const outlineTree = computed(() => {
  if (isTeacher.value) {
    return [
      { id: 1, label: '3.2 课程体系与毕业要求支撑关系' },
      { id: 2, label: '4.1 课程目标达成情况分析' },
      { id: 3, label: '4.3 课程持续改进案例' }
    ];
  }

  return [
    { id: 1, label: '1. 学院与专业概况' },
    { id: 2, label: '2. 培养目标与毕业要求' },
    { id: 3, label: '3. 课程体系与教学实施' },
    { id: 4, label: '4. 达成评价与持续改进' },
    { id: 5, label: '5. 支撑材料目录' }
  ];
});

const editorContent = computed(() => {
  return isTeacher.value
    ? '本章节由任课教师补充课程目标达成结果、教学实施证据和改进建议，系统已预填课程成绩汇总、问卷反馈摘要和资源建设情况。'
    : '本章节内容由系统数据自动填充初稿后，可继续进行编辑、润色、分工协同与统一导出。';
});

async function runAction(key, label) {
  loading[key] = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  loading[key] = false;
  ElMessage.success(`${label}成功`);
}
</script>
