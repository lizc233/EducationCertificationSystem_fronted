<template>
  <StandardPage title="组织架构" :breadcrumbs="['首页', '基础管理', '组织架构']" description="维护院系、专业、班级和负责人信息。">
    <template #actions>
      <el-button type="primary" :loading="actionLoading.department" @click="openDialog('院系')">新增院系</el-button>
      <el-button :loading="actionLoading.classroom" @click="openDialog('班级')">新增班级</el-button>
    </template>

    <div class="split-grid split-grid--sidebar">
      <SectionCard title="院系树形结构">
        <el-tree :data="treeData" node-key="id" default-expand-all />
      </SectionCard>

      <SectionCard title="班级 / 专业列表">
        <el-table :data="tableData" border stripe>
          <el-table-column prop="name" label="名称" min-width="180" />
          <el-table-column prop="type" label="类型" min-width="100" />
          <el-table-column prop="director" label="负责人" min-width="110" />
          <el-table-column prop="students" label="人数" min-width="90" />
          <el-table-column prop="updatedAt" label="最近更新" min-width="150" />
          <el-table-column label="操作" fixed="right" width="220">
            <template #default="{ row }">
              <el-button type="primary" link @click="openWorkspace('view', row)">查看详情</el-button>
              <el-button type="primary" link @click="openWorkspace('edit', row)">编辑</el-button>
              <el-button type="danger" link @click="removeRow(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>
    </div>

    <el-dialog v-model="dialogVisible" :title="`新增${dialogType}`" width="520px">
      <el-form :model="dialogForm" label-position="top">
        <el-form-item label="名称">
          <el-input v-model="dialogForm.name" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="dialogForm.director" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="dialogForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveDialog">确定</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const router = useRouter();
const route = useRoute();
const dialogVisible = ref(false);
const dialogType = ref('院系');
const saving = ref(false);
const actionLoading = reactive({
  department: false,
  classroom: false
});

const dialogForm = reactive({
  name: '',
  director: '',
  remark: ''
});

const treeData = [
  {
    id: 0,
    label: '学校',
    children: [
      {
        id: 1,
        label: '计算机学院',
        children: [{ id: 11, label: '计算机科学与技术' }, { id: 12, label: '软件工程' }, { id: 13, label: '人工智能' }]
      },
      {
        id: 2,
        label: '自动化学院',
        children: [{ id: 21, label: '自动化' }, { id: 22, label: '机器人工程' }]
      },
      {
        id: 3,
        label: '电子信息学院',
        children: [{ id: 31, label: '电子信息工程' }, { id: 32, label: '通信工程' }]
      }
    ]
  }
];

const tableData = ref([
  { id: 'org-1', name: '计算机科学与技术', type: '专业', director: '陈老师', students: 356, updatedAt: '2026-07-16' },
  { id: 'org-2', name: '软件工程', type: '专业', director: '赵老师', students: 298, updatedAt: '2026-07-16' },
  { id: 'org-3', name: '人工智能', type: '专业', director: '李老师', students: 206, updatedAt: '2026-07-15' },
  { id: 'org-4', name: '计科 2501', type: '班级', director: '王老师', students: 42, updatedAt: '2026-07-14' },
  { id: 'org-5', name: '计科 2502', type: '班级', director: '周老师', students: 41, updatedAt: '2026-07-14' },
  { id: 'org-6', name: '软工 2401', type: '班级', director: '刘老师', students: 39, updatedAt: '2026-07-13' },
  { id: 'org-7', name: '软工 2402', type: '班级', director: '胡老师', students: 40, updatedAt: '2026-07-13' },
  { id: 'org-8', name: '自动化 2401', type: '班级', director: '孙老师', students: 38, updatedAt: '2026-07-12' },
  { id: 'org-9', name: '电子信息 2501', type: '班级', director: '高老师', students: 44, updatedAt: '2026-07-12' },
  { id: 'org-10', name: '通信工程 2501', type: '班级', director: '方老师', students: 43, updatedAt: '2026-07-11' }
]);

function openDialog(type) {
  dialogType.value = type;
  dialogVisible.value = true;
}

async function saveDialog() {
  saving.value = true;
  await new Promise((resolve) => window.setTimeout(resolve, 400));
  dialogVisible.value = false;
  saving.value = false;
  ElMessage.success('保存成功');
}

async function openWorkspace(mode, row) {
  await router.push({
    name: 'record-workspace',
    params: {
      pageKey: 'organization',
      mode,
      id: row.id
    },
    query: {
      from: route.path,
      title: '组织架构',
      payload: JSON.stringify(row),
      schema: JSON.stringify([
        { prop: 'name', label: '名称', type: 'input' },
        { prop: 'type', label: '类型', type: 'input' },
        { prop: 'director', label: '负责人', type: 'input' },
        { prop: 'students', label: '人数', type: 'input' },
        { prop: 'updatedAt', label: '最近更新', type: 'input' }
      ])
    }
  });
}

async function removeRow(row) {
  try {
    await ElMessageBox.confirm(`确认删除“${row.name}”吗？`, '删除确认', { type: 'warning' });
    tableData.value = tableData.value.filter((item) => item.id !== row.id);
    ElMessage.success('删除成功');
  } catch {
    ElMessage.info('已取消删除');
  }
}
</script>
