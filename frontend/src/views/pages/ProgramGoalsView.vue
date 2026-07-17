<template>
  <StandardPage
    title="毕业要求配置"
    :breadcrumbs="['首页', '方案设计', '毕业要求配置']"
    description="围绕选中的方案版本维护培养目标、毕业要求、指标点以及两张支撑关系表。"
  >
    <template #actions>
      <el-select v-model="selectedVersionId" filterable placeholder="先选择方案版本" style="width: 320px;" @change="loadAll">
        <el-option v-for="item in versionOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button @click="loadAll">刷新</el-button>
    </template>

    <template #filters>
      <el-alert
        title="这里的名称做了前端语义化处理：把“培养目标、毕业要求与支撑矩阵”拆成更容易理解的 5 个维护页签。"
        type="info"
        show-icon
        :closable="false"
      />
    </template>

    <SectionCard title="方案内配置">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="培养目标" name="targets">
          <div class="tab-actions">
            <el-button type="primary" :disabled="!selectedVersionId" @click="openDialog('target')">新增目标</el-button>
          </div>
          <el-table v-loading="loading.targets" :data="targets" border stripe>
            <el-table-column prop="targetCode" label="编号" width="120" />
            <el-table-column prop="targetName" label="名称" min-width="180" />
            <el-table-column prop="targetDesc" label="说明" min-width="220" show-overflow-tooltip />
            <el-table-column prop="sortNo" label="排序" width="90" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.enabled === 1 ? 'success' : 'info'">{{ row.enabled === 1 ? '启用' : '停用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openDialog('target', row)">编辑</el-button>
                <el-button type="danger" link @click="removeRecord('target', row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="毕业要求" name="requirements">
          <div class="tab-actions">
            <el-button type="primary" :disabled="!selectedVersionId" @click="openDialog('requirement')">新增要求</el-button>
          </div>
          <el-table v-loading="loading.requirements" :data="requirements" border stripe>
            <el-table-column prop="requirementCode" label="编号" width="120" />
            <el-table-column prop="requirementName" label="名称" min-width="180" />
            <el-table-column prop="requirementDesc" label="说明" min-width="220" show-overflow-tooltip />
            <el-table-column prop="sortNo" label="排序" width="90" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.enabled === 1 ? 'success' : 'info'">{{ row.enabled === 1 ? '启用' : '停用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openDialog('requirement', row)">编辑</el-button>
                <el-button type="danger" link @click="removeRecord('requirement', row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="指标点" name="indicators">
          <div class="tab-actions">
            <el-select v-model="indicatorRequirementId" clearable placeholder="按毕业要求筛选" style="width: 260px;">
              <el-option v-for="item in requirementOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button type="primary" :disabled="!selectedVersionId || requirementOptions.length === 0" @click="openDialog('indicator')">新增指标点</el-button>
          </div>
          <el-table v-loading="loading.indicators" :data="filteredIndicators" border stripe>
            <el-table-column label="所属要求" min-width="180">
              <template #default="{ row }">
                {{ resolveOptionLabel(requirementOptions, row.graduationRequirementId) }}
              </template>
            </el-table-column>
            <el-table-column prop="indicatorCode" label="编号" width="120" />
            <el-table-column prop="indicatorName" label="名称" min-width="180" />
            <el-table-column prop="indicatorDesc" label="说明" min-width="220" show-overflow-tooltip />
            <el-table-column prop="sortNo" label="排序" width="90" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.enabled === 1 ? 'success' : 'info'">{{ row.enabled === 1 ? '启用' : '停用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openDialog('indicator', row)">编辑</el-button>
                <el-button type="danger" link @click="removeRecord('indicator', row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="目标关联要求" name="target-supports">
          <div class="tab-actions">
            <el-button type="primary" :disabled="!selectedVersionId" @click="openDialog('targetSupport')">新增关联</el-button>
          </div>
          <el-table v-loading="loading.targetSupports" :data="targetSupports" border stripe>
            <el-table-column label="培养目标" min-width="180">
              <template #default="{ row }">
                {{ resolveOptionLabel(targetOptions, row.programTargetId) }}
              </template>
            </el-table-column>
            <el-table-column label="毕业要求" min-width="180">
              <template #default="{ row }">
                {{ resolveOptionLabel(requirementOptions, row.graduationRequirementId) }}
              </template>
            </el-table-column>
            <el-table-column prop="supportLevel" label="强度" width="100" />
            <el-table-column prop="supportWeight" label="权重" width="120" />
            <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openDialog('targetSupport', row)">编辑</el-button>
                <el-button type="danger" link @click="removeRecord('targetSupport', row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="要求关联指标点" name="indicator-supports">
          <div class="tab-actions">
            <el-button type="primary" :disabled="!selectedVersionId" @click="openDialog('indicatorSupport')">新增关联</el-button>
          </div>
          <el-table v-loading="loading.indicatorSupports" :data="indicatorSupports" border stripe>
            <el-table-column label="毕业要求" min-width="180">
              <template #default="{ row }">
                {{ resolveOptionLabel(requirementOptions, row.graduationRequirementId) }}
              </template>
            </el-table-column>
            <el-table-column label="指标点" min-width="180">
              <template #default="{ row }">
                {{ resolveOptionLabel(indicatorOptions, row.indicatorPointId) }}
              </template>
            </el-table-column>
            <el-table-column prop="supportLevel" label="强度" width="100" />
            <el-table-column prop="supportWeight" label="权重" width="120" />
            <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openDialog('indicatorSupport', row)">编辑</el-button>
                <el-button type="danger" link @click="removeRecord('indicatorSupport', row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </SectionCard>

    <el-dialog v-model="dialog.visible" :title="dialogTitle" width="680px">
      <el-form ref="dialogFormRef" :model="dialog.form" :rules="dialogRules" label-position="top">
        <template v-if="dialog.type === 'target'">
          <el-form-item label="目标编号" prop="targetCode"><el-input v-model.trim="dialog.form.targetCode" /></el-form-item>
          <el-form-item label="目标名称" prop="targetName"><el-input v-model.trim="dialog.form.targetName" /></el-form-item>
          <el-form-item label="目标说明"><el-input v-model="dialog.form.targetDesc" type="textarea" :rows="3" /></el-form-item>
          <div class="form-grid">
            <el-form-item label="排序"><el-input-number v-model="dialog.form.sortNo" :min="0" style="width: 100%;" /></el-form-item>
            <el-form-item label="状态"><el-switch v-model="dialog.form.enabled" :active-value="1" :inactive-value="0" /></el-form-item>
          </div>
          <el-form-item label="备注"><el-input v-model="dialog.form.remark" /></el-form-item>
        </template>

        <template v-else-if="dialog.type === 'requirement'">
          <el-form-item label="要求编号" prop="requirementCode"><el-input v-model.trim="dialog.form.requirementCode" /></el-form-item>
          <el-form-item label="要求名称" prop="requirementName"><el-input v-model.trim="dialog.form.requirementName" /></el-form-item>
          <el-form-item label="要求说明"><el-input v-model="dialog.form.requirementDesc" type="textarea" :rows="3" /></el-form-item>
          <div class="form-grid">
            <el-form-item label="排序"><el-input-number v-model="dialog.form.sortNo" :min="0" style="width: 100%;" /></el-form-item>
            <el-form-item label="状态"><el-switch v-model="dialog.form.enabled" :active-value="1" :inactive-value="0" /></el-form-item>
          </div>
          <el-form-item label="备注"><el-input v-model="dialog.form.remark" /></el-form-item>
        </template>

        <template v-else-if="dialog.type === 'indicator'">
          <el-form-item label="所属毕业要求" prop="graduationRequirementId">
            <el-select v-model="dialog.form.graduationRequirementId" filterable style="width: 100%;">
              <el-option v-for="item in requirementOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="指标点编号" prop="indicatorCode"><el-input v-model.trim="dialog.form.indicatorCode" /></el-form-item>
          <el-form-item label="指标点名称" prop="indicatorName"><el-input v-model.trim="dialog.form.indicatorName" /></el-form-item>
          <el-form-item label="指标点说明"><el-input v-model="dialog.form.indicatorDesc" type="textarea" :rows="3" /></el-form-item>
          <div class="form-grid">
            <el-form-item label="排序"><el-input-number v-model="dialog.form.sortNo" :min="0" style="width: 100%;" /></el-form-item>
            <el-form-item label="状态"><el-switch v-model="dialog.form.enabled" :active-value="1" :inactive-value="0" /></el-form-item>
          </div>
          <el-form-item label="备注"><el-input v-model="dialog.form.remark" /></el-form-item>
        </template>

        <template v-else-if="dialog.type === 'targetSupport'">
          <el-form-item label="培养目标" prop="programTargetId">
            <el-select v-model="dialog.form.programTargetId" filterable style="width: 100%;">
              <el-option v-for="item in targetOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="毕业要求" prop="graduationRequirementId">
            <el-select v-model="dialog.form.graduationRequirementId" filterable style="width: 100%;">
              <el-option v-for="item in requirementOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <div class="form-grid">
            <el-form-item label="支撑强度">
              <el-select v-model="dialog.form.supportLevel" style="width: 100%;">
                <el-option v-for="item in supportLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="支撑权重">
              <el-input-number v-model="dialog.form.supportWeight" :min="0" :max="100" :precision="2" style="width: 100%;" />
            </el-form-item>
          </div>
          <el-form-item label="备注"><el-input v-model="dialog.form.remark" /></el-form-item>
        </template>

        <template v-else-if="dialog.type === 'indicatorSupport'">
          <el-form-item label="毕业要求" prop="graduationRequirementId">
            <el-select v-model="dialog.form.graduationRequirementId" filterable style="width: 100%;">
              <el-option v-for="item in requirementOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="指标点" prop="indicatorPointId">
            <el-select v-model="dialog.form.indicatorPointId" filterable style="width: 100%;">
              <el-option v-for="item in indicatorOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <div class="form-grid">
            <el-form-item label="支撑强度">
              <el-select v-model="dialog.form.supportLevel" style="width: 100%;">
                <el-option v-for="item in supportLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="支撑权重">
              <el-input-number v-model="dialog.form.supportWeight" :min="0" :max="100" :precision="2" style="width: 100%;" />
            </el-form-item>
          </div>
          <el-form-item label="备注"><el-input v-model="dialog.form.remark" /></el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="dialogSaving" @click="submitDialog">保存</el-button>
      </template>
    </el-dialog>
  </StandardPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import StandardPage from '../../components/page/StandardPage.vue';
import SectionCard from '../../components/page/SectionCard.vue';
import { lookupApi, programApi, resolveOptionLabel, supportLevelOptions } from '../../api/bc';

const activeTab = ref('targets');
const selectedVersionId = ref(null);
const indicatorRequirementId = ref(null);
const versionOptions = ref([]);
const targetOptions = computed(() => targets.value.map((item) => ({ value: item.id, label: `${item.targetCode} ${item.targetName}` })));
const requirementOptions = computed(() => requirements.value.map((item) => ({ value: item.id, label: `${item.requirementCode} ${item.requirementName}` })));
const indicatorOptions = computed(() => indicators.value.map((item) => ({ value: item.id, label: `${item.indicatorCode} ${item.indicatorName}` })));
const filteredIndicators = computed(() => {
  if (!indicatorRequirementId.value) {
    return indicators.value;
  }
  return indicators.value.filter((item) => item.graduationRequirementId === indicatorRequirementId.value);
});

const loading = reactive({
  targets: false,
  requirements: false,
  indicators: false,
  targetSupports: false,
  indicatorSupports: false
});

const targets = ref([]);
const requirements = ref([]);
const indicators = ref([]);
const targetSupports = ref([]);
const indicatorSupports = ref([]);

const dialog = reactive({
  visible: false,
  type: 'target',
  form: {}
});

const dialogFormRef = ref();
const dialogSaving = ref(false);

const dialogTitleMap = {
  target: '培养目标',
  requirement: '毕业要求',
  indicator: '指标点',
  targetSupport: '目标关联要求',
  indicatorSupport: '要求关联指标点'
};

const dialogTitle = computed(() => `${dialog.form.id ? '编辑' : '新增'}${dialogTitleMap[dialog.type] || ''}`);

const dialogRules = computed(() => {
  const rules = {};
  if (dialog.type === 'target') {
    rules.targetCode = [{ required: true, message: '请输入目标编号', trigger: 'blur' }];
    rules.targetName = [{ required: true, message: '请输入目标名称', trigger: 'blur' }];
  } else if (dialog.type === 'requirement') {
    rules.requirementCode = [{ required: true, message: '请输入要求编号', trigger: 'blur' }];
    rules.requirementName = [{ required: true, message: '请输入要求名称', trigger: 'blur' }];
  } else if (dialog.type === 'indicator') {
    rules.graduationRequirementId = [{ required: true, message: '请选择毕业要求', trigger: 'change' }];
    rules.indicatorCode = [{ required: true, message: '请输入指标点编号', trigger: 'blur' }];
    rules.indicatorName = [{ required: true, message: '请输入指标点名称', trigger: 'blur' }];
  } else if (dialog.type === 'targetSupport') {
    rules.programTargetId = [{ required: true, message: '请选择培养目标', trigger: 'change' }];
    rules.graduationRequirementId = [{ required: true, message: '请选择毕业要求', trigger: 'change' }];
  } else if (dialog.type === 'indicatorSupport') {
    rules.graduationRequirementId = [{ required: true, message: '请选择毕业要求', trigger: 'change' }];
    rules.indicatorPointId = [{ required: true, message: '请选择指标点', trigger: 'change' }];
  }
  return rules;
});

function createForm(type, row = {}) {
  if (type === 'target') {
    return {
      id: row.id || null,
      programVersionId: selectedVersionId.value,
      targetCode: row.targetCode || '',
      targetName: row.targetName || '',
      targetDesc: row.targetDesc || '',
      sortNo: row.sortNo ?? 0,
      enabled: row.enabled ?? 1,
      remark: row.remark || ''
    };
  }
  if (type === 'requirement') {
    return {
      id: row.id || null,
      programVersionId: selectedVersionId.value,
      requirementCode: row.requirementCode || '',
      requirementName: row.requirementName || '',
      requirementDesc: row.requirementDesc || '',
      sortNo: row.sortNo ?? 0,
      enabled: row.enabled ?? 1,
      remark: row.remark || ''
    };
  }
  if (type === 'indicator') {
    return {
      id: row.id || null,
      graduationRequirementId: row.graduationRequirementId || indicatorRequirementId.value || requirementOptions.value[0]?.value || null,
      indicatorCode: row.indicatorCode || '',
      indicatorName: row.indicatorName || '',
      indicatorDesc: row.indicatorDesc || '',
      sortNo: row.sortNo ?? 0,
      enabled: row.enabled ?? 1,
      remark: row.remark || ''
    };
  }
  if (type === 'targetSupport') {
    return {
      id: row.id || null,
      programTargetId: row.programTargetId || null,
      graduationRequirementId: row.graduationRequirementId || null,
      supportLevel: row.supportLevel || 'M',
      supportWeight: Number(row.supportWeight || 0),
      remark: row.remark || ''
    };
  }
  return {
    id: row.id || null,
    graduationRequirementId: row.graduationRequirementId || null,
    indicatorPointId: row.indicatorPointId || null,
    supportLevel: row.supportLevel || 'M',
    supportWeight: Number(row.supportWeight || 0),
    remark: row.remark || ''
  };
}

async function loadVersions() {
  versionOptions.value = await lookupApi.programVersions();
  if (!selectedVersionId.value && versionOptions.value.length) {
    selectedVersionId.value = versionOptions.value[0].value;
  }
}

async function loadTargets() {
  if (!selectedVersionId.value) {
    targets.value = [];
    return;
  }
  loading.targets = true;
  try {
    const pageData = await programApi.listTargets({ page: 1, size: 200, programVersionId: selectedVersionId.value });
    targets.value = pageData.records || [];
  } finally {
    loading.targets = false;
  }
}

async function loadRequirements() {
  if (!selectedVersionId.value) {
    requirements.value = [];
    indicators.value = [];
    return;
  }
  loading.requirements = true;
  loading.indicators = true;
  try {
    const pageData = await programApi.listRequirements({ page: 1, size: 200, programVersionId: selectedVersionId.value });
    requirements.value = pageData.records || [];
    if (!indicatorRequirementId.value || !requirements.value.some((item) => item.id === indicatorRequirementId.value)) {
      indicatorRequirementId.value = requirements.value[0]?.id || null;
    }

    const indicatorPages = await Promise.all(
      requirements.value.map((item) => programApi.listIndicators({ page: 1, size: 200, graduationRequirementId: item.id }))
    );
    indicators.value = indicatorPages.flatMap((page) => page.records || []);
  } finally {
    loading.requirements = false;
    loading.indicators = false;
  }
}

async function loadSupports() {
  if (!selectedVersionId.value) {
    targetSupports.value = [];
    indicatorSupports.value = [];
    return;
  }
  loading.targetSupports = true;
  loading.indicatorSupports = true;
  try {
    const [targetPage, indicatorPage] = await Promise.all([
      programApi.listTargetSupports({ page: 1, size: 200, programVersionId: selectedVersionId.value }),
      programApi.listIndicatorSupports({ page: 1, size: 200, programVersionId: selectedVersionId.value })
    ]);
    targetSupports.value = targetPage.records || [];
    indicatorSupports.value = indicatorPage.records || [];
  } finally {
    loading.targetSupports = false;
    loading.indicatorSupports = false;
  }
}

async function loadAll() {
  if (!selectedVersionId.value) {
    return;
  }
  await Promise.all([loadTargets(), loadRequirements(), loadSupports()]);
}

function openDialog(type, row) {
  dialog.type = type;
  dialog.form = createForm(type, row);
  dialog.visible = true;
}

async function submitDialog() {
  const valid = await dialogFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  dialogSaving.value = true;
  try {
    const { id, ...payload } = dialog.form;
    if (dialog.type === 'target') {
      id ? await programApi.updateTarget(id, payload) : await programApi.createTarget(payload);
      await loadTargets();
    } else if (dialog.type === 'requirement') {
      id ? await programApi.updateRequirement(id, payload) : await programApi.createRequirement(payload);
      await loadRequirements();
      await loadSupports();
    } else if (dialog.type === 'indicator') {
      id ? await programApi.updateIndicator(id, payload) : await programApi.createIndicator(payload);
      await loadRequirements();
      await loadSupports();
    } else if (dialog.type === 'targetSupport') {
      id ? await programApi.updateTargetSupport(id, payload) : await programApi.createTargetSupport(payload);
      await loadSupports();
    } else if (dialog.type === 'indicatorSupport') {
      id ? await programApi.updateIndicatorSupport(id, payload) : await programApi.createIndicatorSupport(payload);
      await loadSupports();
    }
    dialog.visible = false;
    ElMessage.success('保存成功');
  } finally {
    dialogSaving.value = false;
  }
}

async function removeRecord(type, row) {
  try {
    await ElMessageBox.confirm('删除后将无法恢复，确认继续吗？', '删除确认', { type: 'warning' });
    if (type === 'target') {
      await programApi.deleteTarget(row.id);
      await loadTargets();
      await loadSupports();
    } else if (type === 'requirement') {
      await programApi.deleteRequirement(row.id);
      await loadRequirements();
      await loadSupports();
    } else if (type === 'indicator') {
      await programApi.deleteIndicator(row.id);
      await loadRequirements();
      await loadSupports();
    } else if (type === 'targetSupport') {
      await programApi.deleteTargetSupport(row.id);
      await loadSupports();
    } else if (type === 'indicatorSupport') {
      await programApi.deleteIndicatorSupport(row.id);
      await loadSupports();
    }
    ElMessage.success('删除成功');
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error;
    }
  }
}

onMounted(async () => {
  await loadVersions();
  await loadAll();
});
</script>

<style scoped>
.tab-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 760px) {
  .tab-actions,
  .form-grid {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>
