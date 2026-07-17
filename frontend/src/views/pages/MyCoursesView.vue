<template>
  <StandardPage
    title="课程资源管理"
    :breadcrumbs="['首页', '我的工作台', '课程资源管理']"
    description="按教师个人课程组织教学资源、考核附件与资源完备度检查。"
  >
    <template #actions>
      <el-button type="primary" :loading="uploading" @click="mockUpload">上传资源</el-button>
      <el-button @click="router.push('/evaluation/materials')">进入证据材料</el-button>
    </template>

    <div class="split-grid" style="grid-template-columns: 320px minmax(0, 1fr);">
      <SectionCard title="我的课程资源树">
        <div class="resource-tree-list">
          <button
            v-for="course in courseCards"
            :key="course.name"
            type="button"
            class="resource-tree-item"
          >
            <div class="resource-tree-item__title">{{ course.name }}</div>
            <div class="resource-tree-item__meta">{{ course.term }} · {{ course.classCount }} 个班级</div>
            <el-progress :percentage="course.completion" :stroke-width="10" />
          </button>
        </div>
      </SectionCard>

      <SectionCard title="资源清单">
        <el-table :data="resourceRows" border stripe>
          <el-table-column prop="name" label="资源名称" min-width="220" />
          <el-table-column prop="course" label="课程" min-width="140" />
          <el-table-column prop="type" label="类型" min-width="100" />
          <el-table-column prop="updatedAt" label="更新时间" min-width="160" />
          <el-table-column prop="status" label="完备度" min-width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '完整' ? 'success' : 'warning'">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="previewResource(row)">查看</el-button>
              <el-button type="primary" link @click="mockUpload">替换</el-button>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const router = useRouter();
const uploading = ref(false);

const courseCards = [
  { name: '软件工程', term: '2025-2026-2', classCount: 2, completion: 84 },
  { name: '需求分析与建模', term: '2025-2026-2', classCount: 2, completion: 76 },
  { name: '课程设计', term: '2025-2026-2', classCount: 1, completion: 63 }
];

const resourceRows = [
  { name: '软件工程教学大纲.pdf', course: '软件工程', type: '教学文档', updatedAt: '2026-07-16 09:30', status: '完整' },
  { name: '软件工程实验指导书.docx', course: '软件工程', type: '实验文档', updatedAt: '2026-07-15 14:20', status: '完整' },
  { name: '需求分析第 6 周课件.pptx', course: '需求分析与建模', type: '课件', updatedAt: '2026-07-14 18:00', status: '待补充' },
  { name: '需求分析评分细则.xlsx', course: '需求分析与建模', type: '评分规则', updatedAt: '2026-07-13 11:10', status: '待补充' },
  { name: '课程设计案例包.zip', course: '课程设计', type: '案例资料', updatedAt: '2026-07-12 20:30', status: '完整' }
];

async function mockUpload() {
  uploading.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  uploading.value = false;
  ElMessage.success('资源上传成功');
}

function previewResource(row) {
  ElMessage.success(`已打开 ${row.name}`);
}
</script>
