function expandRows(seeds, total, mapper) {
  return Array.from({ length: total }, (_, index) => {
    const seed = seeds[index % seeds.length];
    return mapper({ ...seed }, index);
  });
}

function createSchema(fields) {
  return fields.map((field) => ({
    ...field,
    required: field.required !== false
  }));
}

const colleges = ['计算机学院', '自动化学院', '电子信息学院', '机械工程学院'];
const userRoles = ['系统管理员', '教师', '学生'];
const enableStatuses = ['启用', '停用'];

const userFields = createSchema([
  { prop: 'studentId', label: '学号', type: 'input' },
  { prop: 'name', label: '姓名', type: 'input' },
  { prop: 'email', label: '邮箱', type: 'input' },
  { prop: 'phone', label: '手机号', type: 'input' },
  { prop: 'department', label: '院系', type: 'input' },
  { prop: 'role', label: '角色', type: 'select', options: userRoles },
  { prop: 'status', label: '状态', type: 'select', options: enableStatuses }
]);

const userSeeds = [
  { name: '张敏', role: '系统管理员', department: '教务处', status: '启用' },
  { name: '李青', role: '教师', department: '计算机学院', status: '启用' },
  { name: '王悦', role: '学生', department: '自动化学院', status: '停用' }
];

const paramFields = createSchema([
  { prop: 'group', label: '参数分组', type: 'select', options: ['基础设置', '通知配置', '统计规则'] },
  { prop: 'key', label: '参数键', type: 'input' },
  { prop: 'value', label: '参数值', type: 'input' },
  { prop: 'type', label: '类型', type: 'select', options: ['字符串', '数字', '布尔值'] },
  { prop: 'desc', label: '说明', type: 'textarea' },
  { prop: 'status', label: '状态', type: 'select', options: enableStatuses }
]);

const logRows = expandRows(
  [
    { operator: '张敏', module: '用户管理', type: '新增', ip: '10.10.0.12', result: '成功' },
    { operator: '李青', module: '方案管理', type: '归档', ip: '10.10.0.35', result: '成功' },
    { operator: '王悦', module: '成绩管理', type: '导入', ip: '10.10.0.56', result: '失败' }
  ],
  12,
  (row, index) => ({
    id: `logs-${index + 1}`,
    time: `2026-07-${String((index % 7) + 10).padStart(2, '0')} ${String(9 + (index % 8)).padStart(2, '0')}:1${index % 6}:00`,
    ...row,
    detail: `${row.operator} 在 ${row.module} 执行了${row.type}操作。`
  })
);

export const crudPageConfigs = {
  users: {
    layout: 'list',
    title: '用户管理',
    description: '维护账号档案、角色授权与状态信息。',
    breadcrumbs: ['首页', '基础管理', '用户管理'],
    pageActions: [
      { label: '新增用户', type: 'primary', behavior: 'dialog' },
      { label: '导入用户', behavior: 'async' },
      { label: '导出用户', behavior: 'async' }
    ],
    filters: [
      { prop: 'keyword', label: '关键词', type: 'input', placeholder: '搜索学号 / 姓名 / 手机号' },
      { prop: 'role', label: '角色', type: 'select', options: userRoles },
      { prop: 'status', label: '状态', type: 'select', options: enableStatuses }
    ],
    keywordFields: ['studentId', 'name', 'phone'],
    tableTitle: '用户列表',
    columns: [
      { prop: 'studentId', label: '学号', minWidth: 130 },
      { prop: 'name', label: '姓名', minWidth: 110 },
      { prop: 'role', label: '角色', minWidth: 110, type: 'tag', tagType: { 系统管理员: 'danger', 教师: 'success', 学生: 'warning' } },
      { prop: 'department', label: '院系', minWidth: 150 },
      { prop: 'phone', label: '手机号', minWidth: 140 },
      { prop: 'status', label: '状态', width: 100, type: 'tag', tagType: { 启用: 'success', 停用: 'info' } },
      { prop: 'createdAt', label: '创建时间', minWidth: 170 },
      { prop: 'actions', label: '操作', fixed: 'right', width: 220, type: 'actions' }
    ],
    rowActions: [
      { label: '查看详情', type: 'route', mode: 'view' },
      { label: '编辑', type: 'route', mode: 'edit' },
      { label: '删除', type: 'delete' }
    ],
    rows: expandRows(userSeeds, 12, (row, index) => ({
      id: `users-${index + 1}`,
      studentId: `2026${String(1001 + index).padStart(4, '0')}`,
      email: `user${index + 1}@tsinghua.edu.cn`,
      phone: `1380000${String(100 + index).padStart(4, '0')}`,
      createdAt: `2026-07-${String((index % 9) + 1).padStart(2, '0')} 09:${String(index % 6).padStart(2, '0')}:00`,
      ...row
    })),
    dialog: {
      title: '用户',
      fields: userFields
    }
  },
  params: {
    layout: 'config',
    title: '系统参数',
    description: '按参数分组维护基础设置、通知规则和评价阈值。',
    breadcrumbs: ['首页', '基础管理', '系统参数'],
    pageActions: [{ label: '新增参数', type: 'primary', behavior: 'dialog' }],
    filters: [
      { prop: 'keyword', label: '关键词', type: 'input', placeholder: '搜索参数键 / 参数值' },
      { prop: 'group', label: '分组', type: 'select', options: ['基础设置', '通知配置', '统计规则'] },
      { prop: 'status', label: '状态', type: 'select', options: enableStatuses }
    ],
    tabs: [
      { label: '全部', value: '全部' },
      { label: '基础设置', value: '基础设置' },
      { label: '通知配置', value: '通知配置' },
      { label: '统计规则', value: '统计规则' }
    ],
    tabField: 'group',
    keywordFields: ['key', 'value', 'desc'],
    tableTitle: '参数配置清单',
    columns: [
      { prop: 'group', label: '参数分组', minWidth: 120 },
      { prop: 'key', label: '参数键', minWidth: 180 },
      { prop: 'value', label: '参数值', minWidth: 140 },
      { prop: 'type', label: '类型', minWidth: 100 },
      { prop: 'status', label: '状态', width: 100, type: 'tag', tagType: { 启用: 'success', 停用: 'info' } },
      { prop: 'updatedAt', label: '更新时间', minWidth: 170 },
      { prop: 'actions', label: '操作', fixed: 'right', width: 180, type: 'actions' }
    ],
    rowActions: [
      { label: '查看详情', type: 'route', mode: 'view' },
      { label: '编辑', type: 'route', mode: 'edit' }
    ],
    rows: expandRows(
      [
        { group: '基础设置', key: 'system.name', value: '工程教育认证系统', type: '字符串', desc: '系统名称', status: '启用' },
        { group: '通知配置', key: 'notice.expire.days', value: '30', type: '数字', desc: '通知保留天数', status: '启用' },
        { group: '统计规则', key: 'achievement.threshold', value: '0.75', type: '数字', desc: '达成度预警阈值', status: '启用' }
      ],
      12,
      (row, index) => ({
        id: `params-${index + 1}`,
        updatedAt: `2026-07-${String((index % 8) + 9).padStart(2, '0')} 10:${String(index % 6).padStart(2, '0')}:00`,
        ...row
      })
    ),
    dialog: {
      title: '系统参数',
      fields: paramFields
    }
  },
  logs: {
    layout: 'list',
    title: '操作日志',
    description: '查看登录记录、业务操作结果与导出历史。',
    breadcrumbs: ['首页', '基础管理', '操作日志'],
    pageActions: [{ label: '导出日志', behavior: 'async' }],
    filters: [
      { prop: 'range', label: '时间范围', type: 'daterange' },
      { prop: 'operator', label: '操作人', type: 'input', placeholder: '输入操作人姓名' },
      { prop: 'module', label: '模块', type: 'select', options: ['用户管理', '方案管理', '成绩管理'] }
    ],
    keywordFields: ['operator', 'detail'],
    tableTitle: '日志列表',
    columns: [
      { prop: 'time', label: '操作时间', minWidth: 170 },
      { prop: 'operator', label: '操作人', minWidth: 110 },
      { prop: 'module', label: '模块', minWidth: 120 },
      { prop: 'type', label: '操作类型', minWidth: 100 },
      { prop: 'ip', label: 'IP 地址', minWidth: 120 },
      { prop: 'result', label: '结果', minWidth: 100, type: 'tag', tagType: { 成功: 'success', 失败: 'danger' } },
      { prop: 'actions', label: '操作', fixed: 'right', width: 120, type: 'actions' }
    ],
    rowActions: [{ label: '查看详情', type: 'route', mode: 'view' }],
    rows: logRows,
    dialog: {
      title: '日志明细',
      fields: createSchema([
        { prop: 'operator', label: '操作人', type: 'input' },
        { prop: 'module', label: '模块', type: 'input' },
        { prop: 'type', label: '操作类型', type: 'input' },
        { prop: 'detail', label: '详情', type: 'textarea' }
      ])
    }
  },
  program: {
    layout: 'list',
    title: '方案管理',
    description: '维护培养方案版本、适用年级、专业和归档状态。',
    breadcrumbs: ['首页', '方案与课程', '方案管理'],
    pageActions: [
      { label: '新增方案', type: 'primary', behavior: 'dialog' },
      { label: '复制版本', behavior: 'async' },
      { label: '导出方案', behavior: 'async' }
    ],
    filters: [
      { prop: 'keyword', label: '方案名称', type: 'input', placeholder: '搜索方案名称 / 专业' },
      { prop: 'major', label: '专业', type: 'select', options: ['计算机科学与技术', '软件工程', '自动化'] },
      { prop: 'status', label: '状态', type: 'select', options: ['启用', '停用', '归档'] }
    ],
    keywordFields: ['name', 'major'],
    tableTitle: '培养方案列表',
    columns: [
      { prop: 'name', label: '方案名称', minWidth: 220 },
      { prop: 'major', label: '专业', minWidth: 160 },
      { prop: 'grade', label: '适用年级', minWidth: 100 },
      { prop: 'version', label: '版本号', minWidth: 100 },
      { prop: 'status', label: '状态', minWidth: 100, type: 'tag', tagType: { 启用: 'success', 停用: 'info', 归档: 'warning' } },
      { prop: 'owner', label: '负责人', minWidth: 110 },
      { prop: 'createdAt', label: '创建时间', minWidth: 170 },
      { prop: 'actions', label: '操作', fixed: 'right', width: 220, type: 'actions' }
    ],
    rowActions: [
      { label: '查看详情', type: 'route', mode: 'view' },
      { label: '编辑', type: 'route', mode: 'edit' },
      { label: '删除', type: 'delete' }
    ],
    rows: expandRows(
      [
        { name: '2025 版计算机科学与技术培养方案', major: '计算机科学与技术', grade: '2025', version: 'V2.0', status: '启用', owner: '张老师' },
        { name: '2024 版软件工程培养方案', major: '软件工程', grade: '2024', version: 'V1.3', status: '停用', owner: '李老师' },
        { name: '2023 版自动化培养方案', major: '自动化', grade: '2023', version: 'V1.0', status: '归档', owner: '周老师' }
      ],
      12,
      (row, index) => ({
        id: `program-${index + 1}`,
        createdAt: `2026-0${(index % 5) + 3}-1${index % 8} 14:00:00`,
        ...row
      })
    ),
    dialog: {
      title: '培养方案',
      fields: createSchema([
        { prop: 'name', label: '方案名称', type: 'input' },
        { prop: 'major', label: '专业', type: 'select', options: ['计算机科学与技术', '软件工程', '自动化'] },
        { prop: 'grade', label: '适用年级', type: 'input' },
        { prop: 'version', label: '版本号', type: 'input' },
        { prop: 'owner', label: '负责人', type: 'input' },
        { prop: 'status', label: '状态', type: 'select', options: ['启用', '停用', '归档'] },
        { prop: 'remark', label: '版本说明', type: 'textarea' }
      ])
    }
  },
  courses: {
    layout: 'list',
    title: '课程管理',
    description: '维护课程编码、学分学时、课程性质和开课单位。',
    breadcrumbs: ['首页', '方案与课程', '课程管理'],
    pageActions: [
      { label: '新增课程', type: 'primary', behavior: 'dialog' },
      { label: '导入课程', behavior: 'async' },
      { label: '导出课程', behavior: 'async' }
    ],
    filters: [
      { prop: 'keyword', label: '关键词', type: 'input', placeholder: '搜索课程代码 / 名称' },
      { prop: 'nature', label: '课程性质', type: 'select', options: ['必修', '选修'] },
      { prop: 'status', label: '状态', type: 'select', options: enableStatuses }
    ],
    keywordFields: ['code', 'name'],
    tableTitle: '课程列表',
    columns: [
      { prop: 'code', label: '课程代码', minWidth: 110 },
      { prop: 'name', label: '课程名称', minWidth: 180 },
      { prop: 'credit', label: '学分', minWidth: 80 },
      { prop: 'hours', label: '学时', minWidth: 80 },
      { prop: 'nature', label: '性质', minWidth: 90 },
      { prop: 'department', label: '开课单位', minWidth: 150 },
      { prop: 'status', label: '状态', minWidth: 100, type: 'tag', tagType: { 启用: 'success', 停用: 'info' } },
      { prop: 'actions', label: '操作', fixed: 'right', width: 220, type: 'actions' }
    ],
    rowActions: [
      { label: '查看详情', type: 'route', mode: 'view' },
      { label: '编辑', type: 'route', mode: 'edit' },
      { label: '删除', type: 'delete' }
    ],
    rows: expandRows(
      [
        { code: 'CS101', name: '程序设计基础', credit: 3, hours: 48, nature: '必修', department: '计算机学院', status: '启用' },
        { code: 'CS205', name: '软件工程', credit: 2.5, hours: 40, nature: '必修', department: '计算机学院', status: '启用' },
        { code: 'EE110', name: '电路分析', credit: 3.5, hours: 56, nature: '选修', department: '电子信息学院', status: '停用' }
      ],
      12,
      (row, index) => ({
        id: `courses-${index + 1}`,
        code: `${row.code}-${String(index + 1).padStart(2, '0')}`,
        ...row
      })
    ),
    dialog: {
      title: '课程',
      fields: createSchema([
        { prop: 'code', label: '课程代码', type: 'input' },
        { prop: 'name', label: '课程名称', type: 'input' },
        { prop: 'credit', label: '学分', type: 'input' },
        { prop: 'hours', label: '学时', type: 'input' },
        { prop: 'nature', label: '课程性质', type: 'select', options: ['必修', '选修'] },
        { prop: 'department', label: '开课单位', type: 'input' },
        { prop: 'status', label: '状态', type: 'select', options: enableStatuses }
      ])
    }
  },
  teaching: {
    layout: 'list',
    title: '授课任务分配',
    description: '维护课程、班级、学期与任课教师的授课安排。',
    breadcrumbs: ['首页', '方案与课程', '授课任务分配'],
    pageActions: [
      { label: '新增任务', type: 'primary', behavior: 'dialog' },
      { label: '批量分配教师', behavior: 'async' }
    ],
    filters: [
      { prop: 'term', label: '学期', type: 'select', options: ['2025-2026-2', '2025-2026-1'] },
      { prop: 'course', label: '课程', type: 'select', options: ['程序设计基础', '软件工程', '数据库原理'] },
      { prop: 'teacher', label: '教师', type: 'input', placeholder: '搜索教师姓名' }
    ],
    keywordFields: ['teacher', 'className'],
    tableTitle: '授课任务列表',
    columns: [
      { prop: 'term', label: '学期', minWidth: 120 },
      { prop: 'course', label: '课程', minWidth: 160 },
      { prop: 'className', label: '班级', minWidth: 140 },
      { prop: 'teacher', label: '任课教师', minWidth: 120 },
      { prop: 'status', label: '状态', minWidth: 100, type: 'tag', tagType: { 已分配: 'success', 待分配: 'warning' } },
      { prop: 'location', label: '上课地点', minWidth: 130 },
      { prop: 'actions', label: '操作', fixed: 'right', width: 220, type: 'actions' }
    ],
    rowActions: [
      { label: '查看详情', type: 'route', mode: 'view' },
      { label: '编辑', type: 'route', mode: 'edit' },
      { label: '删除', type: 'delete' }
    ],
    rows: expandRows(
      [
        { term: '2025-2026-2', course: '程序设计基础', className: '计科 2501', teacher: '李青', status: '已分配', location: '主楼 301' },
        { term: '2025-2026-2', course: '软件工程', className: '软工 2402', teacher: '周鹏', status: '已分配', location: '主楼 402' },
        { term: '2025-2026-2', course: '数据库原理', className: '计科 2403', teacher: '待分配', status: '待分配', location: '待定' }
      ],
      12,
      (row, index) => ({
        id: `teaching-${index + 1}`,
        ...row
      })
    ),
    dialog: {
      title: '授课任务',
      fields: createSchema([
        { prop: 'term', label: '学期', type: 'input' },
        { prop: 'course', label: '课程', type: 'input' },
        { prop: 'className', label: '班级', type: 'input' },
        { prop: 'teacher', label: '任课教师', type: 'input' },
        { prop: 'location', label: '上课地点', type: 'input' },
        { prop: 'status', label: '状态', type: 'select', options: ['已分配', '待分配'] }
      ])
    }
  },
  'evaluation-materials': {
    layout: 'list',
    title: '考核证据材料管理',
    description: '管理课程证据材料、考核方式和审核归档状态。',
    breadcrumbs: ['首页', '评价与达成', '考核证据材料管理'],
    pageActions: [
      { label: '上传材料', type: 'primary', behavior: 'dialog' },
      { label: '批量导出', behavior: 'async' }
    ],
    filters: [
      { prop: 'course', label: '课程', type: 'select', options: ['程序设计基础', '软件工程'] },
      { prop: 'assessment', label: '考核方式', type: 'select', options: ['期末考试', '实验报告', '平时作业'] },
      { prop: 'status', label: '状态', type: 'select', options: ['待审核', '已通过', '已退回'] }
    ],
    tableTitle: '证据材料列表',
    columns: [
      { prop: 'name', label: '材料名称', minWidth: 220 },
      { prop: 'course', label: '关联课程', minWidth: 150 },
      { prop: 'assessment', label: '考核方式', minWidth: 140 },
      { prop: 'uploader', label: '上传人', minWidth: 110 },
      { prop: 'uploadedAt', label: '上传时间', minWidth: 170 },
      { prop: 'status', label: '状态', minWidth: 100, type: 'tag', tagType: { 待审核: 'warning', 已通过: 'success', 已退回: 'danger' } },
      { prop: 'actions', label: '操作', fixed: 'right', width: 220, type: 'actions' }
    ],
    rowActions: [
      { label: '查看详情', type: 'route', mode: 'view' },
      { label: '审核', type: 'route', mode: 'edit' },
      { label: '删除', type: 'delete' }
    ],
    rows: expandRows(
      [
        { name: '软件工程-期末试卷.pdf', course: '软件工程', assessment: '期末考试', uploader: '李青', status: '待审核' },
        { name: '程序设计基础-实验报告.zip', course: '程序设计基础', assessment: '实验报告', uploader: '周鹏', status: '已通过' },
        { name: '软件工程-平时作业汇总.xlsx', course: '软件工程', assessment: '平时作业', uploader: '张敏', status: '已退回' }
      ],
      12,
      (row, index) => ({
        id: `materials-${index + 1}`,
        uploadedAt: `2026-07-${String((index % 6) + 11).padStart(2, '0')} 16:${String(index % 6).padStart(2, '0')}:00`,
        ...row
      })
    ),
    dialog: {
      title: '证据材料',
      fields: createSchema([
        { prop: 'name', label: '材料名称', type: 'input' },
        { prop: 'course', label: '关联课程', type: 'select', options: ['程序设计基础', '软件工程'] },
        { prop: 'assessment', label: '考核方式', type: 'select', options: ['期末考试', '实验报告', '平时作业'] },
        { prop: 'uploader', label: '上传人', type: 'input' },
        { prop: 'status', label: '状态', type: 'select', options: ['待审核', '已通过', '已退回'] }
      ])
    }
  },
  'achievement-model': {
    layout: 'config',
    title: '达成度评价模型配置',
    description: '配置评价模型、数据来源、阈值和启用状态。',
    breadcrumbs: ['首页', '评价与达成', '达成度评价模型配置'],
    pageActions: [
      { label: '新增模型', type: 'primary', behavior: 'dialog' },
      { label: '复制模型', behavior: 'async' }
    ],
    filters: [
      { prop: 'major', label: '适用专业', type: 'select', options: ['计算机科学与技术', '软件工程', '自动化'] },
      { prop: 'status', label: '状态', type: 'select', options: enableStatuses },
      { prop: 'keyword', label: '关键词', type: 'input', placeholder: '搜索模型名称' }
    ],
    keywordFields: ['name', 'rule'],
    tableTitle: '评价模型清单',
    columns: [
      { prop: 'name', label: '模型名称', minWidth: 180 },
      { prop: 'major', label: '适用专业', minWidth: 150 },
      { prop: 'threshold', label: '预警阈值', minWidth: 100 },
      { prop: 'source', label: '数据来源', minWidth: 140 },
      { prop: 'status', label: '状态', minWidth: 100, type: 'tag', tagType: { 启用: 'success', 停用: 'info' } },
      { prop: 'updatedAt', label: '更新时间', minWidth: 170 },
      { prop: 'actions', label: '操作', fixed: 'right', width: 180, type: 'actions' }
    ],
    rowActions: [
      { label: '查看详情', type: 'route', mode: 'view' },
      { label: '编辑', type: 'route', mode: 'edit' }
    ],
    rows: expandRows(
      [
        { name: '课程目标默认模型', major: '计算机科学与技术', threshold: '0.75', source: '考核方式权重', status: '启用', rule: '课程项目、实验报告、平时作业加权计算。' },
        { name: '毕业要求汇总模型', major: '软件工程', threshold: '0.72', source: '课程目标映射', status: '启用', rule: '按课程支撑强度进行汇总计算。' },
        { name: '预警联动模型', major: '自动化', threshold: '0.70', source: '历史趋势', status: '停用', rule: '结合近三学期趋势进行异常预警。' }
      ],
      10,
      (row, index) => ({
        id: `achievement-model-${index + 1}`,
        updatedAt: `2026-07-${String((index % 7) + 8).padStart(2, '0')} 11:${String(index % 6).padStart(2, '0')}:00`,
        ...row
      })
    ),
    dialog: {
      title: '评价模型',
      fields: createSchema([
        { prop: 'name', label: '模型名称', type: 'input' },
        { prop: 'major', label: '适用专业', type: 'select', options: ['计算机科学与技术', '软件工程', '自动化'] },
        { prop: 'source', label: '数据来源', type: 'select', options: ['考核方式权重', '课程目标映射', '历史趋势'] },
        { prop: 'threshold', label: '预警阈值', type: 'input' },
        { prop: 'status', label: '状态', type: 'select', options: enableStatuses },
        { prop: 'rule', label: '计算规则', type: 'textarea' }
      ])
    }
  },
  survey: {
    layout: 'list',
    title: '问卷设计与管理',
    description: '维护问卷模板、发布状态、回收进度与对象范围。',
    breadcrumbs: ['首页', '问卷与改进', '问卷设计与管理'],
    pageActions: [
      { label: '新增问卷', type: 'primary', behavior: 'dialog' },
      { label: '发布问卷', behavior: 'async' }
    ],
    filters: [
      { prop: 'keyword', label: '问卷名称', type: 'input', placeholder: '搜索问卷名称' },
      { prop: 'type', label: '问卷类型', type: 'select', options: ['毕业调查', '课程调查', '外部评价'] },
      { prop: 'status', label: '状态', type: 'select', options: ['草稿', '发布中', '已结束'] }
    ],
    keywordFields: ['name'],
    tableTitle: '问卷列表',
    columns: [
      { prop: 'name', label: '问卷名称', minWidth: 220 },
      { prop: 'type', label: '类型', minWidth: 120 },
      { prop: 'target', label: '填报对象', minWidth: 120 },
      { prop: 'status', label: '状态', minWidth: 100, type: 'tag', tagType: { 草稿: 'info', 发布中: 'success', 已结束: 'warning' } },
      { prop: 'count', label: '回收份数', minWidth: 100 },
      { prop: 'deadline', label: '截止时间', minWidth: 160 },
      { prop: 'actions', label: '操作', fixed: 'right', width: 220, type: 'actions' }
    ],
    rowActions: [
      { label: '查看详情', type: 'route', mode: 'view' },
      { label: '编辑', type: 'route', mode: 'edit' },
      { label: '删除', type: 'delete' }
    ],
    rows: expandRows(
      [
        { name: '2026 届毕业要求满意度调查', type: '毕业调查', target: '应届毕业生', status: '发布中', count: 186, deadline: '2026-07-30' },
        { name: '课程目标达成反馈问卷', type: '课程调查', target: '任课教师', status: '草稿', count: 0, deadline: '2026-08-05' },
        { name: '企业导师评价问卷', type: '外部评价', target: '企业导师', status: '已结束', count: 42, deadline: '2026-06-30' }
      ],
      10,
      (row, index) => ({
        id: `survey-${index + 1}`,
        ...row
      })
    ),
    dialog: {
      title: '问卷',
      fields: createSchema([
        { prop: 'name', label: '问卷名称', type: 'input' },
        { prop: 'type', label: '问卷类型', type: 'select', options: ['毕业调查', '课程调查', '外部评价'] },
        { prop: 'target', label: '填报对象', type: 'input' },
        { prop: 'deadline', label: '截止时间', type: 'input' },
        { prop: 'status', label: '状态', type: 'select', options: ['草稿', '发布中', '已结束'] },
        { prop: 'questions', label: '题目设计', type: 'textarea' }
      ])
    }
  },
  improve: {
    layout: 'list',
    title: '持续改进计划',
    description: '维护问题台账、责任人、期限和整改状态。',
    breadcrumbs: ['首页', '问卷与改进', '持续改进计划'],
    pageActions: [{ label: '新增改进项', type: 'primary', behavior: 'dialog' }],
    filters: [
      { prop: 'status', label: '状态', type: 'select', options: ['待执行', '执行中', '已完成', '已验收'] },
      { prop: 'owner', label: '责任人', type: 'input', placeholder: '搜索责任人' },
      { prop: 'range', label: '期限范围', type: 'daterange' }
    ],
    keywordFields: ['owner', 'topic', 'problem'],
    tableTitle: '持续改进清单',
    columns: [
      { prop: 'topic', label: '改进主题', minWidth: 180 },
      { prop: 'problem', label: '关联问题', minWidth: 240 },
      { prop: 'owner', label: '责任人', minWidth: 110 },
      { prop: 'deadline', label: '期限', minWidth: 120 },
      { prop: 'status', label: '状态', minWidth: 100, type: 'tag', tagType: { 待执行: 'info', 执行中: 'warning', 已完成: 'success', 已验收: 'success' } },
      { prop: 'updatedAt', label: '最近跟进', minWidth: 160 },
      { prop: 'actions', label: '操作', fixed: 'right', width: 220, type: 'actions' }
    ],
    rowActions: [
      { label: '查看详情', type: 'route', mode: 'view' },
      { label: '编辑', type: 'route', mode: 'edit' },
      { label: '删除', type: 'delete' }
    ],
    rows: expandRows(
      [
        { topic: '强化实践环节', problem: '实验课程证据材料不完整', owner: '李青', deadline: '2026-08-15', status: '待执行' },
        { topic: '优化课程目标描述', problem: '目标描述与指标点关联不清晰', owner: '周鹏', deadline: '2026-07-30', status: '执行中' },
        { topic: '完善毕业要求支撑矩阵', problem: '矩阵覆盖度存在空白项', owner: '张敏', deadline: '2026-07-20', status: '已完成' }
      ],
      10,
      (row, index) => ({
        id: `improve-${index + 1}`,
        updatedAt: `2026-07-${String((index % 8) + 8).padStart(2, '0')} 15:${String(index % 6).padStart(2, '0')}:00`,
        ...row
      })
    ),
    dialog: {
      title: '持续改进项',
      fields: createSchema([
        { prop: 'topic', label: '改进主题', type: 'input' },
        { prop: 'problem', label: '关联问题', type: 'textarea' },
        { prop: 'owner', label: '责任人', type: 'input' },
        { prop: 'deadline', label: '期限', type: 'input' },
        { prop: 'status', label: '状态', type: 'select', options: ['待执行', '执行中', '已完成', '已验收'] }
      ])
    }
  }
};
