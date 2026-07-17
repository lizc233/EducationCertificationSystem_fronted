<template>
  <StandardPage title="课程体系与支撑矩阵" :breadcrumbs="['首页', '方案与课程', '课程体系与支撑矩阵']" description="按课程体系查看课程结构，并维护毕业要求支撑强度矩阵。">
    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="专业">
          <el-select v-model="filters.major" style="width: 220px;">
            <el-option label="计算机科学与技术" value="计算机科学与技术" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="filters.grade" style="width: 140px;">
            <el-option label="2025" value="2025" />
          </el-select>
        </el-form-item>
      </el-form>
    </template>

    <div class="split-grid split-grid--detail">
      <SectionCard title="课程列表">
        <el-table :data="courses" border stripe>
          <el-table-column prop="code" label="课程代码" width="120" />
          <el-table-column prop="name" label="名称" min-width="180" />
          <el-table-column prop="credit" label="学分" width="80" />
          <el-table-column prop="hours" label="学时" width="80" />
          <el-table-column prop="type" label="类别" min-width="120" />
          <el-table-column prop="term" label="开课学期" min-width="110" />
        </el-table>
      </SectionCard>

      <SectionCard title="支撑矩阵">
        <el-table :data="matrixRows" border stripe>
          <el-table-column prop="requirement" label="毕业要求" min-width="160" fixed="left" />
          <el-table-column
            v-for="course in matrixCourses"
            :key="course"
            :label="course"
            min-width="140"
          >
            <template #default="{ row }">
              <el-select v-model="row[course]" placeholder="强度">
                <el-option label="H" value="H" />
                <el-option label="M" value="M" />
                <el-option label="L" value="L" />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </SectionCard>
    </div>
  </StandardPage>
</template>

<script setup>
import { reactive, ref } from 'vue';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';

const filters = reactive({
  major: '计算机科学与技术',
  grade: '2025'
});

const courses = [
  { code: 'CS101', name: '程序设计基础', credit: 3, hours: 48, type: '专业基础课', term: '第 1 学期' },
  { code: 'CS102', name: '离散数学', credit: 3, hours: 48, type: '专业基础课', term: '第 1 学期' },
  { code: 'CS205', name: '软件工程', credit: 2.5, hours: 40, type: '专业核心课', term: '第 4 学期' },
  { code: 'CS206', name: '数据库原理', credit: 3, hours: 48, type: '专业核心课', term: '第 4 学期' },
  { code: 'CS301', name: '计算机网络', credit: 3, hours: 48, type: '专业核心课', term: '第 5 学期' },
  { code: 'CS302', name: '操作系统', credit: 3, hours: 48, type: '专业核心课', term: '第 5 学期' },
  { code: 'CS303', name: '人工智能导论', credit: 2, hours: 32, type: '专业选修课', term: '第 6 学期' },
  { code: 'CS304', name: '工程伦理', credit: 1, hours: 16, type: '通识课', term: '第 6 学期' },
  { code: 'CS401', name: '毕业实习', credit: 4, hours: 64, type: '实践环节', term: '第 7 学期' },
  { code: 'CS402', name: '毕业设计', credit: 8, hours: 128, type: '实践环节', term: '第 8 学期' }
];

const matrixCourses = ['程序设计基础', '软件工程', '数据库原理'];
const matrixRows = ref([
  { requirement: 'GR1', '程序设计基础': 'H', '软件工程': 'M', '数据库原理': 'L' },
  { requirement: 'GR2', '程序设计基础': 'M', '软件工程': 'H', '数据库原理': 'M' },
  { requirement: 'GR3', '程序设计基础': 'L', '软件工程': 'H', '数据库原理': 'H' },
  { requirement: 'GR4', '程序设计基础': 'L', '软件工程': 'M', '数据库原理': 'H' }
]);
</script>
