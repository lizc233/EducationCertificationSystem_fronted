<template>
  <StandardPage
    title="问卷设计与发布"
    :breadcrumbs="['首页', '问卷与改进', '问卷设计与发布']"
    description="维护问卷、题目、发布范围、发布时间和回收进度。"
  >
    <template #actions>
      <el-button @click="openCreate">新建问卷</el-button>
      <el-button :loading="loading.page" @click="loadPage">刷新</el-button>
    </template>

    <template #filters>
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.publishStatus" clearable placeholder="全部" style="width: 160px;">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model.trim="filters.questionnaireType" clearable placeholder="如 COURSE_EVALUATION" style="width: 180px;" />
        </el-form-item>
        <el-form-item label="对象">
          <el-select v-model="filters.targetObjectType" clearable placeholder="全部" style="width: 160px;">
            <el-option v-for="item in targetTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model.trim="filters.keyword" clearable placeholder="编码 / 标题" style="width: 220px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading.page" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <div class="survey-page">
      <SectionCard title="问卷列表">
        <el-table
          v-loading="loading.page"
          :data="questionnaires"
          border
          stripe
          highlight-current-row
          @current-change="handleCurrentChange"
        >
          <el-table-column prop="questionnaireCode" label="编码" min-width="160" />
          <el-table-column prop="title" label="标题" min-width="220" />
          <el-table-column prop="questionnaireType" label="类型" min-width="150" />
          <el-table-column prop="targetObjectType" label="对象" min-width="140" />
          <el-table-column label="匿名" width="90">
            <template #default="{ row }">
              {{ row.anonymousFlag === 1 ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column prop="publishStatus" label="状态" min-width="120">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.publishStatus)">{{ statusLabel(row.publishStatus) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="questionCount" label="题目数" width="90" />
          <el-table-column prop="scopeCount" label="范围数" width="90" />
          <el-table-column prop="updatedAt" label="更新时间" min-width="170">
            <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openEdit(row.id)">编辑</el-button>
              <el-button type="primary" link @click="openPreview(row.id)">预览</el-button>
              <el-button type="primary" link @click="openTaskHistory(row.id)">发布记录</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading.page && !questionnaires.length" description="暂无问卷数据" />

        <div class="crud-pagination">
          <el-pagination
            v-model:current-page="pager.pageNum"
            v-model:page-size="pager.pageSize"
            background
            layout="total, prev, pager, next"
            :total="pager.total"
            @current-change="loadPage"
          />
        </div>
      </SectionCard>

      <SectionCard :title="form.id ? '问卷维护' : '新建问卷'">
        <template #extra>
          <div class="editor-actions">
            <el-button :disabled="!form.id" @click="openPreview(form.id)">预览</el-button>
            <el-button :disabled="!form.id" @click="openTaskHistory(form.id)">发布记录</el-button>
            <el-button type="primary" :loading="loading.save" @click="saveCurrent">保存</el-button>
          </div>
        </template>

        <el-form label-position="top">
          <div class="editor-grid">
            <el-form-item label="问卷编码">
              <el-input v-model.trim="form.questionnaireCode" placeholder="如 SURVEY-20260718-01" />
            </el-form-item>
            <el-form-item label="问卷标题">
              <el-input v-model.trim="form.title" placeholder="请输入标题" />
            </el-form-item>
            <el-form-item label="副标题">
              <el-input v-model.trim="form.subtitle" placeholder="可选" />
            </el-form-item>
            <el-form-item label="问卷类型">
              <el-select v-model="form.questionnaireType" placeholder="请选择类型">
                <el-option v-for="item in questionnaireTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="目标对象类型">
              <el-select v-model="form.targetObjectType" placeholder="请选择对象类型">
                <el-option v-for="item in targetTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="目标对象ID">
              <el-input-number v-model="form.targetObjectId" :min="1" :step="1" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                value-format="YYYY-MM-DDTHH:mm:ss"
                placeholder="选择开始时间"
                style="width: 100%;"
              />
            </el-form-item>
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                value-format="YYYY-MM-DDTHH:mm:ss"
                placeholder="选择结束时间"
                style="width: 100%;"
              />
            </el-form-item>
            <el-form-item label="匿名填写">
              <el-switch v-model="form.anonymousFlag" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </div>

          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可选备注" />
          </el-form-item>

          <div class="subsection">
            <div class="subsection__head">
              <h4>发布范围</h4>
              <el-button type="primary" link @click="addScope">新增范围</el-button>
            </div>
            <el-table :data="form.scopes" border stripe>
              <el-table-column label="范围类型" min-width="150">
                <template #default="{ row }">
                  <el-select v-model="row.scopeType">
                    <el-option v-for="item in scopeTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="范围ID" min-width="120">
                <template #default="{ row }">
                  <el-input-number v-model="row.scopeId" :min="1" :step="1" style="width: 100%;" />
                </template>
              </el-table-column>
              <el-table-column label="备注" min-width="180">
                <template #default="{ row }">
                  <el-input v-model="row.remark" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90">
                <template #default="{ $index }">
                  <el-button type="danger" link @click="removeScope($index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="!form.scopes.length" description="暂无发布范围" />
          </div>

          <div class="subsection">
            <div class="subsection__head">
              <h4>题目设计</h4>
              <div class="question-actions">
                <el-button type="primary" link @click="addQuestion('SINGLE')">单选题</el-button>
                <el-button type="primary" link @click="addQuestion('MULTIPLE')">多选题</el-button>
                <el-button type="primary" link @click="addQuestion('SCALE')">量表题</el-button>
                <el-button type="primary" link @click="addQuestion('TEXT')">文本题</el-button>
                <el-button type="primary" link @click="addQuestion('MATRIX')">矩阵题</el-button>
              </div>
            </div>

            <div v-if="form.questions.length" class="question-list">
              <article v-for="(question, qIndex) in form.questions" :key="question.__key" class="question-card">
                <div class="question-card__head">
                  <h5>第 {{ qIndex + 1 }} 题</h5>
                  <div class="question-card__tools">
                    <el-button link @click="moveQuestion(qIndex, -1)" :disabled="qIndex === 0">上移</el-button>
                    <el-button link @click="moveQuestion(qIndex, 1)" :disabled="qIndex === form.questions.length - 1">下移</el-button>
                    <el-button type="danger" link @click="removeQuestion(qIndex)">删除</el-button>
                  </div>
                </div>

                <div class="editor-grid">
                  <el-form-item label="题目编码">
                    <el-input v-model.trim="question.questionCode" placeholder="如 Q1" />
                  </el-form-item>
                  <el-form-item label="题目类型">
                    <el-select v-model="question.questionType">
                      <el-option v-for="item in questionTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="题目排序">
                    <el-input-number v-model="question.sortNo" :min="1" :step="1" style="width: 100%;" />
                  </el-form-item>
                  <el-form-item label="是否必填">
                    <el-switch v-model="question.isRequired" :active-value="1" :inactive-value="0" />
                  </el-form-item>
                  <el-form-item label="最少选择">
                    <el-input-number v-model="question.minSelect" :min="0" :step="1" style="width: 100%;" />
                  </el-form-item>
                  <el-form-item label="最多选择">
                    <el-input-number v-model="question.maxSelect" :min="0" :step="1" style="width: 100%;" />
                  </el-form-item>
                </div>

                <el-form-item label="题目内容">
                  <el-input v-model="question.questionText" type="textarea" :rows="2" placeholder="请输入题目内容" />
                </el-form-item>
                <el-form-item label="备注">
                  <el-input v-model="question.remark" placeholder="可选备注" />
                </el-form-item>

                <div v-if="usesOptions(question.questionType)" class="nested-section">
                  <div class="subsection__head">
                    <h6>选项</h6>
                    <el-button type="primary" link @click="addOption(question)">新增选项</el-button>
                  </div>
                  <el-table :data="question.options" border stripe>
                    <el-table-column label="编码" min-width="120">
                      <template #default="{ row }"><el-input v-model.trim="row.optionCode" /></template>
                    </el-table-column>
                    <el-table-column label="文本" min-width="180">
                      <template #default="{ row }"><el-input v-model="row.optionText" /></template>
                    </el-table-column>
                    <el-table-column label="提交值" min-width="120">
                      <template #default="{ row }"><el-input v-model="row.optionValue" /></template>
                    </el-table-column>
                    <el-table-column label="排序" width="100">
                      <template #default="{ row }"><el-input-number v-model="row.sortNo" :min="1" :step="1" style="width: 100%;" /></template>
                    </el-table-column>
                    <el-table-column label="操作" width="90">
                      <template #default="{ $index }">
                        <el-button type="danger" link @click="removeOption(question, $index)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>

                <div v-if="question.questionType === 'MATRIX'" class="matrix-grid">
                  <div class="nested-section">
                    <div class="subsection__head">
                      <h6>矩阵行</h6>
                      <el-button type="primary" link @click="addMatrixRow(question)">新增行</el-button>
                    </div>
                    <el-table :data="question.matrixRows" border stripe>
                      <el-table-column label="编码" min-width="120">
                        <template #default="{ row }"><el-input v-model.trim="row.rowCode" /></template>
                      </el-table-column>
                      <el-table-column label="文本" min-width="180">
                        <template #default="{ row }"><el-input v-model="row.rowText" /></template>
                      </el-table-column>
                      <el-table-column label="排序" width="100">
                        <template #default="{ row }"><el-input-number v-model="row.sortNo" :min="1" :step="1" style="width: 100%;" /></template>
                      </el-table-column>
                      <el-table-column label="操作" width="90">
                        <template #default="{ $index }">
                          <el-button type="danger" link @click="removeMatrixRow(question, $index)">删除</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>

                  <div class="nested-section">
                    <div class="subsection__head">
                      <h6>矩阵列</h6>
                      <el-button type="primary" link @click="addMatrixColumn(question)">新增列</el-button>
                    </div>
                    <el-table :data="question.matrixColumns" border stripe>
                      <el-table-column label="编码" min-width="120">
                        <template #default="{ row }"><el-input v-model.trim="row.colCode" /></template>
                      </el-table-column>
                      <el-table-column label="文本" min-width="180">
                        <template #default="{ row }"><el-input v-model="row.colText" /></template>
                      </el-table-column>
                      <el-table-column label="提交值" min-width="120">
                        <template #default="{ row }"><el-input v-model="row.colValue" /></template>
                      </el-table-column>
                      <el-table-column label="排序" width="100">
                        <template #default="{ row }"><el-input-number v-model="row.sortNo" :min="1" :step="1" style="width: 100%;" /></template>
                      </el-table-column>
                      <el-table-column label="操作" width="90">
                        <template #default="{ $index }">
                          <el-button type="danger" link @click="removeMatrixColumn(question, $index)">删除</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
              </article>
            </div>

            <el-empty v-else description="暂无题目，请先添加题目" />
          </div>

          <div v-if="form.id" class="subsection">
            <div class="subsection__head">
              <h4>发布动作</h4>
            </div>
            <div class="publish-actions">
              <el-button type="primary" :loading="loading.publish" @click="handlePublish('publish')">发布</el-button>
              <el-button :loading="loading.publish" @click="handlePublish('retry')">重试发布</el-button>
              <el-button :loading="loading.publish" @click="handlePublish('remind')">截止提醒</el-button>
              <el-button :loading="loading.publish" @click="handlePublish('revoke')">撤回</el-button>
              <el-button :loading="loading.publish" @click="handlePublish('end')">结束</el-button>
            </div>
            <el-input
              v-model="dispatchRemark"
              type="textarea"
              :rows="2"
              placeholder="发布、撤回、结束、催填备注"
            />
          </div>
        </el-form>
      </SectionCard>
    </div>

    <el-dialog v-model="previewVisible" title="问卷预览" width="900px">
      <div v-if="previewData" class="preview-box">
        <h3>{{ previewData.title }}</h3>
        <p class="preview-subtitle">{{ previewData.subtitle || '无副标题' }}</p>
        <div class="preview-meta">
          <span>类型：{{ previewData.questionnaireType || '-' }}</span>
          <span>对象：{{ previewData.targetObjectType || '-' }}</span>
          <span>状态：{{ statusLabel(previewData.publishStatus) }}</span>
        </div>
        <div class="preview-question-list">
          <article v-for="question in previewData.questions || []" :key="question.id || question.questionCode" class="preview-question">
            <strong>{{ question.sortNo }}. {{ question.questionText }}</strong>
            <div class="preview-question__meta">{{ question.questionType }} / {{ question.isRequired === 1 ? '必填' : '选填' }}</div>
            <ul v-if="question.options?.length">
              <li v-for="option in question.options" :key="option.id || option.optionCode">{{ option.optionText }}</li>
            </ul>
            <div v-else-if="question.matrixRows?.length || question.matrixColumns?.length">
              行：{{ (question.matrixRows || []).map((item) => item.rowText).join(' / ') || '-' }}
              <br>
              列：{{ (question.matrixColumns || []).map((item) => item.colText).join(' / ') || '-' }}
            </div>
          </article>
        </div>
      </div>
      <el-empty v-else description="暂无预览数据" />
    </el-dialog>

    <el-dialog v-model="taskDialogVisible" title="发布记录" width="900px">
      <el-table v-loading="loading.tasks" :data="publishTasks" border stripe>
        <el-table-column prop="publishBatchNo" label="批次号" min-width="180" />
        <el-table-column prop="publishStatus" label="发布状态" min-width="120" />
        <el-table-column prop="mqStatus" label="消息状态" min-width="120" />
        <el-table-column prop="retryCount" label="重试次数" width="100" />
        <el-table-column prop="publishedAt" label="发布时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.publishedAt) }}</template>
        </el-table-column>
        <el-table-column prop="revokedAt" label="撤回时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.revokedAt) }}</template>
        </el-table-column>
        <el-table-column prop="errorMessage" label="错误信息" min-width="180" />
        <el-table-column prop="remark" label="备注" min-width="140" />
      </el-table>
      <el-empty v-if="!loading.tasks && !publishTasks.length" description="暂无发布记录" />
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import {
  createSurveyQuestionnaire,
  deleteSurveyQuestionnaire,
  endSurveyQuestionnaire,
  fetchSurveyPublishTasks,
  fetchSurveyQuestionnaireDetail,
  fetchSurveyQuestionnaires,
  previewSurveyQuestionnaire,
  publishSurveyQuestionnaire,
  remindSurveyQuestionnaire,
  retryPublishSurveyQuestionnaire,
  revokeSurveyQuestionnaire,
  updateSurveyQuestionnaire
} from '../../api/survey';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();

const loading = reactive({
  page: false,
  detail: false,
  save: false,
  publish: false,
  tasks: false
});

const filters = reactive({
  publishStatus: '',
  questionnaireType: '',
  targetObjectType: '',
  keyword: ''
});

const pager = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const questionnaires = ref([]);
const selectedId = ref(null);
const previewVisible = ref(false);
const previewData = ref(null);
const taskDialogVisible = ref(false);
const publishTasks = ref([]);
const dispatchRemark = ref('');

const statusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '发布中', value: 'PUBLISHING' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '发布失败', value: 'PUBLISH_FAILED' },
  { label: '已撤回', value: 'REVOKED' },
  { label: '已结束', value: 'ENDED' }
];

const questionnaireTypeOptions = [
  { label: '课程评价', value: 'COURSE_EVALUATION' },
  { label: '教学反馈', value: 'TEACHING_FEEDBACK' },
  { label: '毕业跟踪', value: 'GRADUATION_TRACKING' },
  { label: '通用问卷', value: 'GENERAL' }
];

const targetTypeOptions = [
  { label: '在校学生', value: 'IN_SCHOOL_STUDENT' },
  { label: '学生', value: 'STUDENT' },
  { label: '毕业生', value: 'GRADUATE' },
  { label: '教师', value: 'TEACHER' },
  { label: '用人单位', value: 'EMPLOYER' },
  { label: '全部', value: 'ALL' }
];

const scopeTypeOptions = [
  { label: '角色', value: 'ROLE' },
  { label: '年级', value: 'GRADE' },
  { label: '班级', value: 'CLASS' },
  { label: '专业', value: 'MAJOR' },
  { label: '用户', value: 'USER' }
];

const questionTypeOptions = [
  { label: '单选题', value: 'SINGLE' },
  { label: '多选题', value: 'MULTIPLE' },
  { label: '量表题', value: 'SCALE' },
  { label: '文本题', value: 'TEXT' },
  { label: '矩阵题', value: 'MATRIX' }
];

const form = reactive(createEmptyForm());

function nextKey(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function createEmptyScope() {
  return {
    __key: nextKey('scope'),
    scopeType: 'ROLE',
    scopeId: null,
    remark: ''
  };
}

function createEmptyOption(sortNo = 1) {
  return {
    __key: nextKey('option'),
    optionCode: '',
    optionText: '',
    optionValue: '',
    optionScore: null,
    isOther: 0,
    sortNo,
    remark: ''
  };
}

function createEmptyMatrixRow(sortNo = 1) {
  return {
    __key: nextKey('row'),
    rowCode: '',
    rowText: '',
    sortNo,
    remark: ''
  };
}

function createEmptyMatrixColumn(sortNo = 1) {
  return {
    __key: nextKey('col'),
    colCode: '',
    colText: '',
    colValue: '',
    sortNo,
    remark: ''
  };
}

function createEmptyQuestion(questionType = 'SINGLE', sortNo = 1) {
  return {
    __key: nextKey('question'),
    questionCode: '',
    questionText: '',
    questionType,
    isRequired: 1,
    sortNo,
    minSelect: questionType === 'MULTIPLE' ? 1 : 0,
    maxSelect: questionType === 'MULTIPLE' ? 3 : 1,
    scoreWeight: null,
    matrixType: '',
    remark: '',
    options: usesOptions(questionType) ? [createEmptyOption(1), createEmptyOption(2)] : [],
    matrixRows: questionType === 'MATRIX' ? [createEmptyMatrixRow(1), createEmptyMatrixRow(2)] : [],
    matrixColumns: questionType === 'MATRIX' ? [createEmptyMatrixColumn(1), createEmptyMatrixColumn(2)] : []
  };
}

function createEmptyForm() {
  return {
    id: null,
    questionnaireCode: '',
    title: '',
    subtitle: '',
    questionnaireType: 'COURSE_EVALUATION',
    targetObjectType: 'STUDENT',
    targetObjectId: null,
    anonymousFlag: 1,
    startTime: '',
    endTime: '',
    remark: '',
    publishStatus: 'DRAFT',
    scopes: [],
    questions: []
  };
}

function resetForm() {
  Object.assign(form, createEmptyForm());
  form.scopes = [];
  form.questions = [];
  dispatchRemark.value = '';
}

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

function statusLabel(status) {
  return statusOptions.find((item) => item.value === status)?.label || status || '-';
}

function statusTagType(status) {
  if (status === 'PUBLISHED') return 'success';
  if (status === 'PUBLISHING') return 'warning';
  if (status === 'PUBLISH_FAILED') return 'danger';
  return 'info';
}

function usesOptions(questionType) {
  return ['SINGLE', 'MULTIPLE', 'SCALE'].includes(questionType);
}

function buildListQuery() {
  return {
    pageNum: pager.pageNum,
    pageSize: pager.pageSize,
    publishStatus: filters.publishStatus,
    questionnaireType: filters.questionnaireType,
    targetObjectType: filters.targetObjectType,
    keyword: filters.keyword
  };
}

function mapDetailToForm(detail) {
  resetForm();
  Object.assign(form, {
    id: detail.id,
    questionnaireCode: detail.questionnaireCode || '',
    title: detail.title || '',
    subtitle: detail.subtitle || '',
    questionnaireType: detail.questionnaireType || 'COURSE_EVALUATION',
    targetObjectType: detail.targetObjectType || 'STUDENT',
    targetObjectId: detail.targetObjectId ?? null,
    anonymousFlag: detail.anonymousFlag ?? 1,
    startTime: normalizeDateTime(detail.startTime),
    endTime: normalizeDateTime(detail.endTime),
    remark: detail.remark || '',
    publishStatus: detail.publishStatus || 'DRAFT'
  });
  form.scopes = (detail.scopes || []).map((item) => ({
    __key: nextKey('scope'),
    scopeType: item.scopeType || 'ROLE',
    scopeId: item.scopeId ?? null,
    remark: item.remark || ''
  }));
  form.questions = (detail.questions || []).map((question, index) => ({
    __key: nextKey('question'),
    questionCode: question.questionCode || '',
    questionText: question.questionText || '',
    questionType: question.questionType || 'SINGLE',
    isRequired: question.isRequired ?? 1,
    sortNo: question.sortNo || index + 1,
    minSelect: question.minSelect ?? 0,
    maxSelect: question.maxSelect ?? 1,
    scoreWeight: question.scoreWeight ?? null,
    matrixType: question.matrixType || '',
    remark: question.remark || '',
    options: (question.options || []).map((option, optionIndex) => ({
      __key: nextKey('option'),
      optionCode: option.optionCode || '',
      optionText: option.optionText || '',
      optionValue: option.optionValue || '',
      optionScore: option.optionScore ?? null,
      isOther: option.isOther ?? 0,
      sortNo: option.sortNo || optionIndex + 1,
      remark: option.remark || ''
    })),
    matrixRows: (question.matrixRows || []).map((row, rowIndex) => ({
      __key: nextKey('row'),
      rowCode: row.rowCode || '',
      rowText: row.rowText || '',
      sortNo: row.sortNo || rowIndex + 1,
      remark: row.remark || ''
    })),
    matrixColumns: (question.matrixColumns || []).map((column, columnIndex) => ({
      __key: nextKey('col'),
      colCode: column.colCode || '',
      colText: column.colText || '',
      colValue: column.colValue || '',
      sortNo: column.sortNo || columnIndex + 1,
      remark: column.remark || ''
    }))
  }));
}

function normalizeDateTime(value) {
  if (!value) return '';
  return String(value).slice(0, 19);
}

function buildSavePayload() {
  return {
    questionnaireCode: form.questionnaireCode || '',
    title: form.title || '',
    subtitle: form.subtitle || '',
    questionnaireType: form.questionnaireType || '',
    targetObjectType: form.targetObjectType || '',
    targetObjectId: form.targetObjectId || null,
    anonymousFlag: form.anonymousFlag ?? 1,
    startTime: form.startTime || null,
    endTime: form.endTime || null,
    remark: form.remark || '',
    scopes: form.scopes
      .filter((item) => item.scopeType && item.scopeId)
      .map((item) => ({
        scopeType: item.scopeType,
        scopeId: item.scopeId,
        remark: item.remark || ''
      })),
    questions: form.questions.map((question, index) => ({
      questionCode: question.questionCode || `Q${index + 1}`,
      questionText: question.questionText || '',
      questionType: question.questionType,
      isRequired: question.isRequired ?? 1,
      sortNo: index + 1,
      minSelect: question.minSelect ?? 0,
      maxSelect: question.maxSelect ?? 1,
      scoreWeight: question.scoreWeight ?? null,
      matrixType: question.matrixType || '',
      remark: question.remark || '',
      options: usesOptions(question.questionType)
        ? question.options
          .filter((item) => item.optionText)
          .map((item, optionIndex) => ({
            optionCode: item.optionCode || `OPT${optionIndex + 1}`,
            optionText: item.optionText || '',
            optionValue: item.optionValue || item.optionText || '',
            optionScore: item.optionScore ?? null,
            isOther: item.isOther ?? 0,
            sortNo: optionIndex + 1,
            remark: item.remark || ''
          }))
        : [],
      matrixRows: question.questionType === 'MATRIX'
        ? question.matrixRows
          .filter((item) => item.rowText)
          .map((item, rowIndex) => ({
            rowCode: item.rowCode || `ROW${rowIndex + 1}`,
            rowText: item.rowText || '',
            sortNo: rowIndex + 1,
            remark: item.remark || ''
          }))
        : [],
      matrixColumns: question.questionType === 'MATRIX'
        ? question.matrixColumns
          .filter((item) => item.colText)
          .map((item, columnIndex) => ({
            colCode: item.colCode || `COL${columnIndex + 1}`,
            colText: item.colText || '',
            colValue: item.colValue || item.colText || '',
            sortNo: columnIndex + 1,
            remark: item.remark || ''
          }))
        : []
    }))
  };
}

async function loadPage() {
  loading.page = true;
  try {
    const page = await fetchSurveyQuestionnaires(buildListQuery());
    questionnaires.value = page?.records || [];
    pager.total = Number(page?.total || 0);
    if (!questionnaires.value.length) {
      selectedId.value = null;
      resetForm();
      return;
    }
    const nextId = questionnaires.value.some((item) => item.id === selectedId.value)
      ? selectedId.value
      : questionnaires.value[0].id;
    await openEdit(nextId, false);
  } finally {
    loading.page = false;
  }
}

async function openEdit(id, fetchOnly = true) {
  if (!id) return;
  loading.detail = true;
  try {
    const detail = await fetchSurveyQuestionnaireDetail(id);
    selectedId.value = id;
    mapDetailToForm(detail || {});
    if (!fetchOnly) {
      return;
    }
  } finally {
    loading.detail = false;
  }
}

function openCreate() {
  selectedId.value = null;
  resetForm();
  form.scopes = [createEmptyScope()];
  form.questions = [createEmptyQuestion('SINGLE', 1)];
}

function handleCurrentChange(row) {
  if (!row?.id || row.id === selectedId.value) {
    return;
  }
  openEdit(row.id);
}

function handleSearch() {
  pager.pageNum = 1;
  loadPage();
}

function resetFilters() {
  filters.publishStatus = '';
  filters.questionnaireType = '';
  filters.targetObjectType = '';
  filters.keyword = '';
  pager.pageNum = 1;
  loadPage();
}

function addScope() {
  form.scopes.push(createEmptyScope());
}

function removeScope(index) {
  form.scopes.splice(index, 1);
}

function addQuestion(questionType) {
  form.questions.push(createEmptyQuestion(questionType, form.questions.length + 1));
}

function removeQuestion(index) {
  form.questions.splice(index, 1);
  syncQuestionSort();
}

function moveQuestion(index, offset) {
  const target = index + offset;
  if (target < 0 || target >= form.questions.length) {
    return;
  }
  const [current] = form.questions.splice(index, 1);
  form.questions.splice(target, 0, current);
  syncQuestionSort();
}

function syncQuestionSort() {
  form.questions.forEach((item, index) => {
    item.sortNo = index + 1;
  });
}

function addOption(question) {
  question.options.push(createEmptyOption(question.options.length + 1));
}

function removeOption(question, index) {
  question.options.splice(index, 1);
  question.options.forEach((item, optionIndex) => {
    item.sortNo = optionIndex + 1;
  });
}

function addMatrixRow(question) {
  question.matrixRows.push(createEmptyMatrixRow(question.matrixRows.length + 1));
}

function removeMatrixRow(question, index) {
  question.matrixRows.splice(index, 1);
  question.matrixRows.forEach((item, rowIndex) => {
    item.sortNo = rowIndex + 1;
  });
}

function addMatrixColumn(question) {
  question.matrixColumns.push(createEmptyMatrixColumn(question.matrixColumns.length + 1));
}

function removeMatrixColumn(question, index) {
  question.matrixColumns.splice(index, 1);
  question.matrixColumns.forEach((item, columnIndex) => {
    item.sortNo = columnIndex + 1;
  });
}

function validateForm() {
  if (!form.questionnaireCode || !form.title) {
    ElMessage.warning('请先填写问卷编码和标题');
    return false;
  }
  if (!form.questions.length) {
    ElMessage.warning('请至少配置一个题目');
    return false;
  }
  for (const [index, question] of form.questions.entries()) {
    if (!question.questionText) {
      ElMessage.warning(`请填写第 ${index + 1} 题的题目内容`);
      return false;
    }
    if (usesOptions(question.questionType) && !question.options.some((item) => item.optionText)) {
      ElMessage.warning(`第 ${index + 1} 题至少需要一个选项`);
      return false;
    }
    if (question.questionType === 'MATRIX') {
      if (!question.matrixRows.some((item) => item.rowText) || !question.matrixColumns.some((item) => item.colText)) {
        ElMessage.warning(`第 ${index + 1} 题的矩阵行列不能为空`);
        return false;
      }
    }
  }
  return true;
}

async function saveCurrent() {
  if (!validateForm()) {
    return;
  }
  loading.save = true;
  try {
    const payload = buildSavePayload();
    const detail = form.id
      ? await updateSurveyQuestionnaire(form.id, payload)
      : await createSurveyQuestionnaire(payload);
    ElMessage.success(form.id ? '问卷已更新' : '问卷已创建');
    selectedId.value = detail?.id || selectedId.value;
    if (detail?.id) {
      mapDetailToForm(detail);
    }
    await loadPage();
  } finally {
    loading.save = false;
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确认删除问卷“${row.title || row.questionnaireCode}”吗？`, '删除确认', { type: 'warning' });
  await deleteSurveyQuestionnaire(row.id);
  ElMessage.success('问卷已删除');
  if (selectedId.value === row.id) {
    resetForm();
    selectedId.value = null;
  }
  await loadPage();
}

async function openPreview(id) {
  if (!id) return;
  previewData.value = await previewSurveyQuestionnaire(id);
  previewVisible.value = true;
}

async function openTaskHistory(id) {
  if (!id) return;
  loading.tasks = true;
  taskDialogVisible.value = true;
  try {
    const page = await fetchSurveyPublishTasks(id, { pageNum: 1, pageSize: 100 });
    publishTasks.value = page?.records || [];
  } finally {
    loading.tasks = false;
  }
}

function buildDispatchPayload() {
  return {
    operatorUserId: userStore.userInfo?.id || null,
    remark: dispatchRemark.value || ''
  };
}

async function handlePublish(action) {
  if (!form.id) return;
  loading.publish = true;
  try {
    if (action === 'publish') {
      await publishSurveyQuestionnaire(form.id, buildDispatchPayload());
      ElMessage.success('发布请求已提交');
    } else if (action === 'retry') {
      await retryPublishSurveyQuestionnaire(form.id, buildDispatchPayload());
      ElMessage.success('已提交重试发布');
    } else if (action === 'remind') {
      await remindSurveyQuestionnaire(form.id, buildDispatchPayload());
      ElMessage.success('已发送截止提醒');
    } else if (action === 'revoke') {
      await revokeSurveyQuestionnaire(form.id, buildDispatchPayload());
      ElMessage.success('已撤回问卷');
    } else if (action === 'end') {
      await endSurveyQuestionnaire(form.id, buildDispatchPayload());
      ElMessage.success('已结束问卷');
    }
    await openEdit(form.id, false);
    await loadPage();
  } finally {
    loading.publish = false;
  }
}

onMounted(() => {
  loadPage();
});
</script>

<style scoped>
.survey-page,
.question-list,
.nested-section,
.preview-question-list {
  display: grid;
  gap: 18px;
}

.editor-grid,
.matrix-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.editor-actions,
.subsection__head,
.question-actions,
.question-card__head,
.question-card__tools,
.publish-actions,
.preview-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.subsection {
  margin-top: 22px;
  display: grid;
  gap: 16px;
}

.subsection__head {
  justify-content: space-between;
}

.question-card,
.preview-question {
  border: 1px solid rgba(220, 227, 233, 0.9);
  border-radius: 14px;
  padding: 18px;
  background: #fff;
}

.question-card__head {
  justify-content: space-between;
  margin-bottom: 12px;
}

.preview-subtitle {
  margin: 8px 0 12px;
  color: #64748b;
}

.preview-meta {
  margin-bottom: 16px;
  color: #475569;
}

.preview-question__meta {
  margin: 8px 0 10px;
  color: #64748b;
  font-size: 13px;
}

@media (max-width: 960px) {
  .editor-grid,
  .matrix-grid {
    grid-template-columns: 1fr;
  }
}
</style>
