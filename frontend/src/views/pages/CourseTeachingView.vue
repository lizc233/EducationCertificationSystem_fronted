<template>
  <StandardPage title="教学内容与考核方式配置" :breadcrumbs="['首页', '方案与课程', '教学内容与考核方式配置']" description="采用“左侧配置、右侧预览”的页面结构维护课程教学内容与考核方式。">
    <template #actions>
      <el-button type="primary" :loading="saving" @click="saveConfig">保存配置</el-button>
    </template>

    <div class="split-grid split-grid--detail">
      <SectionCard title="教学内容配置">
        <el-form label-position="top" :model="teachingForm">
          <el-form-item label="课程名称">
            <el-input v-model="teachingForm.course" />
          </el-form-item>
          <el-form-item label="教学内容条目">
            <el-select v-model="teachingForm.contents" multiple>
              <el-option label="软件过程模型与需求分析" value="软件过程模型与需求分析" />
              <el-option label="概要设计与详细设计文档编写" value="概要设计与详细设计文档编写" />
              <el-option label="团队项目开发与代码评审" value="团队项目开发与代码评审" />
            </el-select>
          </el-form-item>
          <el-form-item label="考核方式">
            <el-table :data="assessments" border stripe>
              <el-table-column prop="name" label="方式名称" min-width="120" />
              <el-table-column prop="weight" label="权重（%）" min-width="100" />
              <el-table-column prop="goal" label="关联目标" min-width="140" />
            </el-table>
          </el-form-item>
        </el-form>
      </SectionCard>

      <SectionCard title="配置预览">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="课程名称">{{ teachingForm.course }}</el-descriptions-item>
          <el-descriptions-item label="教学内容">{{ teachingForm.contents.join('、') }}</el-descriptions-item>
          <el-descriptions-item label="当前权重合计">{{ totalWeight }}%</el-descriptions-item>
          <el-descriptions-item label="配置说明">考核方式权重需合计为 100%，并与课程目标一一对应。</el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 16px;">
          <el-alert
            :title="`当前权重合计：${totalWeight}%`"
            :type="totalWeight === 100 ? 'success' : 'error'"
            show-icon
          />
        </div>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const saving = ref(false);
const teachingForm = reactive({
  course: '软件工程',
  contents: ['软件过程模型与需求分析', '概要设计与详细设计文档编写', '团队项目开发与代码评审']
});

const assessments = [
  { name: '平时作业', weight: 20, goal: '课程目标 1' },
  { name: '实验报告', weight: 30, goal: '课程目标 2' },
  { name: '课程项目', weight: 50, goal: '课程目标 3' }
];

const totalWeight = computed(() => assessments.reduce((sum, item) => sum + item.weight, 0));

async function saveConfig() {
  saving.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  saving.value = false;
  ElMessage.success('保存成功');
}
</script>
