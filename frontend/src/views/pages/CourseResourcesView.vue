<template>
  <StandardPage title="课程资源管理" :breadcrumbs="['首页', '方案与课程', '课程资源管理']" description="按课程归档教学文档、课件和考核资源。">
    <div class="split-grid split-grid--sidebar">
      <SectionCard title="课程树">
        <el-tree :data="treeData" node-key="id" default-expand-all />
      </SectionCard>

      <SectionCard title="文件列表">
        <template #extra>
          <el-button type="primary" :loading="uploading" @click="mockUpload">上传资源</el-button>
        </template>
        <el-table :data="files" border stripe>
          <el-table-column prop="name" label="文件名" min-width="220" />
          <el-table-column prop="type" label="类型" min-width="100" />
          <el-table-column prop="size" label="大小" min-width="90" />
          <el-table-column prop="uploader" label="上传人" min-width="100" />
          <el-table-column prop="uploadedAt" label="上传时间" min-width="160" />
          <el-table-column label="操作" fixed="right" width="220">
            <template #default="{ row }">
              <el-button type="primary" link @click="openWorkspace('view', row)">查看详情</el-button>
              <el-button type="primary" link @click="openWorkspace('edit', row)">编辑</el-button>
              <el-button type="danger" link @click="removeFile(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const router = useRouter();
const route = useRoute();
const uploading = ref(false);

const treeData = [
  { id: 1, label: '程序设计基础' },
  { id: 2, label: '软件工程' },
  { id: 3, label: '数据库原理' },
  { id: 4, label: '计算机网络' }
];

const files = ref([
  { id: 'res-1', name: '软件工程教学大纲.pdf', type: 'PDF', size: '1.2MB', uploader: '李青', uploadedAt: '2026-07-14 10:20:00' },
  { id: 'res-2', name: '实验指导书.docx', type: 'Word', size: '860KB', uploader: '周鹏', uploadedAt: '2026-07-15 09:00:00' },
  { id: 'res-3', name: '第 5 讲课件.pptx', type: 'PPT', size: '3.5MB', uploader: '张敏', uploadedAt: '2026-07-15 16:40:00' },
  { id: 'res-4', name: '课程目标说明.xlsx', type: 'Excel', size: '240KB', uploader: '王静', uploadedAt: '2026-07-15 17:10:00' },
  { id: 'res-5', name: '课堂案例合集.zip', type: 'ZIP', size: '12MB', uploader: '刘洋', uploadedAt: '2026-07-15 17:30:00' },
  { id: 'res-6', name: '期中试题.docx', type: 'Word', size: '420KB', uploader: '陈曦', uploadedAt: '2026-07-16 08:20:00' },
  { id: 'res-7', name: '课程项目模板.rar', type: 'RAR', size: '8.1MB', uploader: '赵磊', uploadedAt: '2026-07-16 09:30:00' },
  { id: 'res-8', name: '作业评分细则.pdf', type: 'PDF', size: '560KB', uploader: '何宇', uploadedAt: '2026-07-16 10:10:00' },
  { id: 'res-9', name: '实验评分记录.xlsx', type: 'Excel', size: '300KB', uploader: '马琳', uploadedAt: '2026-07-16 14:00:00' },
  { id: 'res-10', name: '课程总结报告.docx', type: 'Word', size: '610KB', uploader: '吴涛', uploadedAt: '2026-07-16 16:20:00' }
]);

async function mockUpload() {
  uploading.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  uploading.value = false;
  ElMessage.success('上传成功');
}

async function openWorkspace(mode, row) {
  await router.push({
    name: 'record-workspace',
    params: { pageKey: 'course-resources', mode, id: row.id },
    query: {
      from: route.path,
      title: '课程资源管理',
      payload: JSON.stringify(row),
      schema: JSON.stringify([
        { prop: 'name', label: '文件名', type: 'input' },
        { prop: 'type', label: '文件类型', type: 'input' },
        { prop: 'size', label: '文件大小', type: 'input' },
        { prop: 'uploader', label: '上传人', type: 'input' },
        { prop: 'uploadedAt', label: '上传时间', type: 'input' }
      ])
    }
  });
}

async function removeFile(row) {
  try {
    await ElMessageBox.confirm(`确认删除“${row.name}”吗？`, '删除确认', { type: 'warning' });
    files.value = files.value.filter((item) => item.id !== row.id);
    ElMessage.success('删除成功');
  } catch {
    ElMessage.info('已取消删除');
  }
}
</script>
