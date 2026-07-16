import { navs } from './navigation';

export const cycle = {
  name: '2026版工程教育认证',
  term: '2025-2026-2',
  locked: true,
  msg: '当前周期已锁定。课程成绩、支撑矩阵、报告章节默认只读，确需修改找管理员开锁。'
};

export const homeNum = [
  { label: '方案版本', val: '3', tag: '正常' },
  { label: '课程总数', val: '36', tag: '正常' },
  { label: '待办', val: '7', tag: '处理中' },
  { label: '预警', val: '4', tag: '需跟进' }
];

export const todo = [
  { name: '2024级培养方案年级绑定再核对', who: '专业负责人', time: '今天', type: '急' },
  { name: '软件测试课程资源说明补齐', who: '课程组', time: '7月18日', type: '一般' },
  { name: '毕业生问卷第二轮提醒', who: '问卷组', time: '7月20日', type: '一般' },
  { name: '章节5.1课程达成分析复核', who: '报告组', time: '7月19日', type: '急' }
];

export const warn = [
  { name: '软件体系结构课程目标2偏低', note: '先查成绩映射和权重' },
  { name: '毕业生问卷回收率还没到80%', note: '建议继续发提醒' },
  { name: '章节5.1有2条引用失效', note: '附件编号要重绑' }
];

export const homeRows = [
  { mod: '培养方案', done: '86%', state: '正常', note: '版本结构已定' },
  { mod: '课程管理', done: '71%', state: '处理中', note: '实验材料还差一些' },
  { mod: '达成评价', done: '64%', state: '处理中', note: '正在复算本学期结果' },
  { mod: '调查问卷', done: '78%', state: '需跟进', note: '毕业生回收率偏低' },
  { mod: '持续改进', done: '57%', state: '需跟进', note: '有2项还没闭环' },
  { mod: '自评报告', done: '58%', state: '处理中', note: '章节5和7还在补' }
];

export const news = [
  { time: '今天 14:30', text: '课程资源目录已更新' },
  { time: '今天 11:10', text: '达成评价完成一次复算' },
  { time: '昨天 18:20', text: '毕业生问卷第二批已发布' }
];

export const courseSnapshot = [
  { course: '软件体系结构', teacher: '张岚', status: '待复核', completion: '82%', risk: '课程目标2偏低' },
  { course: '数据库系统原理', teacher: '李南', status: '材料完整', completion: '96%', risk: '可引用章节4' },
  { course: '软件测试', teacher: '陈溪', status: '补充中', completion: '74%', risk: '资源说明待补' }
];

export const roleNote = {
  admin: '管理员可以看全部模块，也可以开锁周期。',
  teacher: '课程负责人只看课程、评价、报告几个常用模块。',
  leader: '专业负责人主要看方案、评价、问卷、改进和报告。'
};

export const mods = {
  system: {
    title: '系统基础',
    desc: '账号、角色、组织、字典这几块。',
    roles: ['admin'],
    byLock: false,
    rows: [
      { a: '用户数', b: '186', c: '正常' },
      { a: '角色数', b: '9', c: '正常' },
      { a: '组织节点', b: '28', c: '正常' },
      { a: '今日日志', b: '43', c: '已记录' }
    ],
    list: [
      '系统基础这块只给管理员。',
      '角色权限先做粗一点，菜单级别就够用。',
      '组织树保留到班级，没必要一开始做太细。'
    ],
    task: [
      { name: '角色菜单模板复核', who: '王磊', time: '7月18日', st: '待确认' },
      { name: '班级导入模板整理', who: '苏晴', time: '7月19日', st: '处理中' },
      { name: '高风险日志筛查', who: '管理员', time: '7月20日', st: '已排期' }
    ],
    btns: ['新增用户', '导入班级']
  },
  program: {
    title: '培养方案',
    desc: '方案版本、培养目标、毕业要求、支撑矩阵。',
    roles: ['admin', 'leader'],
    byLock: true,
    rows: [
      { a: '方案版本', b: '3', c: '正常' },
      { a: '培养目标', b: '12', c: '正常' },
      { a: '毕业要求', b: '18', c: '处理中' },
      { a: '矩阵覆盖率', b: '89%', c: '待补' }
    ],
    list: [
      '当前版本和年级绑定要再核一下。',
      '矩阵先满足能查、能改、能导出，不追求太花。',
      '锁定后默认只读。'
    ],
    task: [
      { name: '2025级方案复制成2026草案', who: '赵宁', time: '7月18日', st: '待评审' },
      { name: '毕业要求3说明补充', who: '韩雪', time: '7月19日', st: '处理中' },
      { name: '支撑矩阵复核', who: '专业委员会', time: '7月22日', st: '待复核' }
    ],
    btns: ['新建版本', '复制版本', '导出矩阵']
  },
  course: {
    title: '课程管理',
    desc: '课程库、课程目标、资源材料、授课任务。',
    roles: ['admin', 'teacher', 'leader'],
    byLock: true,
    rows: [
      { a: '课程数', b: '36', c: '正常' },
      { a: '授课任务', b: '58', c: '正常' },
      { a: '资源文件', b: '214', c: '处理中' },
      { a: '材料完整度', b: '81%', c: '待补' }
    ],
    list: [
      '课程资料先按课程和任务两层放。',
      '成绩入口先不用拆太细。',
      '锁定后老师只能看，不能改。'
    ],
    task: [
      { name: '软件测试资源说明补齐', who: '陈溪', time: '7月18日', st: '处理中' },
      { name: '数据库系统原理目标复核', who: '李南', time: '7月19日', st: '待确认' },
      { name: '软件体系结构实验材料归档', who: '张岚', time: '7月22日', st: '需跟进' }
    ],
    btns: ['新增课程', '导入课程', '查看材料']
  },
  evaluation: {
    title: '达成评价',
    desc: '课程目标结果、评价模型、毕业要求达成。',
    roles: ['admin', 'teacher', 'leader'],
    byLock: true,
    rows: [
      { a: '评价模型', b: '4', c: '正常' },
      { a: '复算任务', b: '9', c: '处理中' },
      { a: '低达成项', b: '6', c: '需跟进' },
      { a: '达标率', b: '83%', c: '正常' }
    ],
    list: [
      '先把结果算准，比图表好不好看更重要。',
      '低达成项能落到改进单就行。',
      '锁定后不再随便重算。'
    ],
    task: [
      { name: '本学期课程目标复算', who: '张岚', time: '7月17日', st: '处理中' },
      { name: '低达成项原因整理', who: '周婷', time: '7月19日', st: '待处理' },
      { name: '毕业要求4.1阈值确认', who: '专业委员会', time: '7月21日', st: '待评审' }
    ],
    btns: ['发起复算', '查看明细', '导出结果']
  },
  survey: {
    title: '调查问卷',
    desc: '问卷设计、发布、回收统计。',
    roles: ['admin', 'leader'],
    byLock: false,
    rows: [
      { a: '问卷模板', b: '7', c: '正常' },
      { a: '发布批次', b: '12', c: '正常' },
      { a: '平均回收率', b: '84%', c: '处理中' },
      { a: '提醒轮次', b: '2', c: '已发送' }
    ],
    list: [
      '题型别做太多，够用就行。',
      '重点看回收率和名单范围。',
      '问卷结束后不允许再填。'
    ],
    task: [
      { name: '毕业生问卷二次提醒', who: '周宁', time: '7月20日', st: '待发送' },
      { name: '用人单位问卷结果导出', who: '宋涵', time: '7月18日', st: '准备中' },
      { name: '教师问卷开放题整理', who: '刘悦', time: '7月22日', st: '待汇总' }
    ],
    btns: ['新建问卷', '发布批次']
  },
  improve: {
    title: '持续改进',
    desc: '低达成问题、问卷反馈、整改记录。',
    roles: ['admin', 'leader'],
    byLock: false,
    rows: [
      { a: '改进计划', b: '14', c: '正常' },
      { a: '执行中', b: '6', c: '处理中' },
      { a: '已完成', b: '5', c: '正常' },
      { a: '超期', b: '2', c: '需跟进' }
    ],
    list: [
      '这块不用做很细的流程。',
      '能看到问题、责任人、时间、记录就够了。',
      '超期的单子单独标出来。'
    ],
    task: [
      { name: '课程目标2低达成改进计划', who: '张岚', time: '7月21日', st: '处理中' },
      { name: '毕业生问卷反馈归类', who: '周宁', time: '7月18日', st: '待汇总' },
      { name: '实验课程资源补齐方案', who: '课程组', time: '7月24日', st: '已立项' }
    ],
    btns: ['新建改进单', '查看超期']
  },
  report: {
    title: '自评报告',
    desc: '章节任务、草稿、材料引用。',
    roles: ['admin', 'teacher', 'leader'],
    byLock: true,
    rows: [
      { a: '报告项目', b: '1', c: '正常' },
      { a: '章节任务', b: '18', c: '处理中' },
      { a: '完成进度', b: '58%', c: '处理中' },
      { a: '失效引用', b: '2', c: '需处理' }
    ],
    list: [
      '报告页重点放任务和章节进度。',
      '引用材料别做太复杂，能定位就行。',
      '锁定后章节默认只读。'
    ],
    task: [
      { name: '章节3.2补写', who: '李晨', time: '7月18日', st: '处理中' },
      { name: '章节5.1复核', who: '张岚', time: '7月19日', st: '待复核' },
      { name: '章节7案例整理', who: '周婷', time: '7月22日', st: '需跟进' }
    ],
    btns: ['新建章节任务', '检查引用']
  }
};

export function canSee(role) {
  return navs.filter((it) => it.roles.includes(role));
}
