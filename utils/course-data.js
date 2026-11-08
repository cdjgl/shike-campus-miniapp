/**
 * 公共课程数据模块
 * 提供学期判断、周次计算、课表数据、今日课程同步等能力
 */

/** 根据月份+年份动态计算学期信息（22级最早 2022-09） */
function getSemesterInfo(month, year) {
  if (month >= 9 && month <= 12) {
    return { key: 'fall', label: year + '年秋季', startDate: new Date(year, 8, 1) };
  } else if (month === 1) {
    return { key: 'fall', label: (year - 1) + '年秋季', startDate: new Date(year - 1, 8, 1) };
  } else {
    return { key: 'spring', label: year + '年春季', startDate: new Date(year, 1, 23) };
  }
}

/** 根据日期计算该学期中的周次 */
function calcWeekNum(date, semester) {
  const diffMs = date - semester.startDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7) + 1;
  return Math.max(1, Math.min(20, week));
}

/** 周次微变化：课程名 */
function getVariedCourseName(name, weekNum) {
  switch (name) {
    case '物理实验':
      return weekNum % 4 === 0 ? '物理演示实验' : name;
    case '数据结构':
      return weekNum % 3 === 0 ? '数据结构(上机)' : name;
    case '体育':
      return ['体育(篮球)', '体育(排球)', '体育(羽毛球)', '体育'][weekNum % 4];
    case '体育(足球)':
      return ['体育(足球)', '体育(排球)', '体育(羽毛球)', '体育(篮球)'][weekNum % 4];
    default:
      return name;
  }
}

function getVariedLocation(loc, weekNum) {
  if (weekNum % 5 === 0 && loc.includes('实训')) {
    return loc.replace('实训', '机房');
  }
  return loc;
}

/** 获取当前学期的基础课表 */
function getBaseCourses(semesterKey) {
  const spring = {
    1: {
      slots: [0, 2, 4],
      courses: [
        { name: '高等数学', location: 'A-301', teacher: '张老师', type: '必修' },
        null,
        { name: '体育', location: '体育馆', teacher: '刘老师', type: '必修' },
        null,
        { name: '数据库原理', location: '机房B1', teacher: '陆老师', type: '选修' },
      ],
    },
    2: {
      slots: [0, 2],
      courses: [
        { name: '物理实验', location: '实验A-102', teacher: '赵老师', type: '实验' },
        null,
        { name: '线性代数', location: 'A-402', teacher: '周老师', type: '必修' },
        null,
      ],
    },
    3: {
      slots: [0, 1, 3],
      courses: [
        { name: '数据结构', location: '实训301', teacher: '吴老师', type: '专业' },
        { name: '大学英语', location: 'B-205', teacher: '李老师', type: '必修' },
        null,
        { name: '马克思主义', location: 'C-101', teacher: '郑老师', type: '通识' },
      ],
    },
    4: {
      slots: [0, 2, 3],
      courses: [
        { name: '软件工程', location: '实训202', teacher: '孙老师', type: '专业' },
        null,
        { name: '概率论', location: 'A-201', teacher: '钱老师', type: '必修' },
        { name: '大学英语', location: 'B-205', teacher: '李老师', type: '必修' },
      ],
    },
    5: {
      slots: [1, 2],
      courses: [
        null,
        { name: '计算机基础', location: '实训101', teacher: '王老师', type: '专业' },
        { name: '数据结构', location: '实训301', teacher: '吴老师', type: '专业' },
        null,
      ],
    },
  };

  const fall = {
    1: {
      slots: [0, 1, 3],
      courses: [
        { name: '操作系统', location: 'A-201', teacher: '杨老师', type: '专业' },
        { name: '英语写作', location: 'B-103', teacher: '陈老师', type: '必修' },
        null,
        { name: '中国近现代史', location: 'C-202', teacher: '郑老师', type: '通识' },
      ],
    },
    2: {
      slots: [0, 2, 4],
      courses: [
        { name: '计算机网络', location: '实训201', teacher: '王老师', type: '专业' },
        null,
        { name: '高等数学(二)', location: 'A-301', teacher: '张老师', type: '必修' },
        null,
        { name: 'Python编程', location: '机房A2', teacher: '林老师', type: '选修' },
      ],
    },
    3: {
      slots: [0, 1],
      courses: [
        { name: '编译原理', location: '实训303', teacher: '吴老师', type: '专业' },
        { name: '形势与政策', location: 'C-101', teacher: '郑老师', type: '通识' },
      ],
    },
    4: {
      slots: [0, 2],
      courses: [
        { name: '人工智能', location: '实训401', teacher: '孙老师', type: '专业' },
        null,
        { name: '概率论', location: 'A-201', teacher: '钱老师', type: '必修' },
      ],
    },
    5: {
      slots: [1, 3],
      courses: [
        null,
        { name: 'Java高级编程', location: '机房C1', teacher: '黄老师', type: '专业' },
        null,
        { name: '体育(足球)', location: '操场', teacher: '刘老师', type: '必修' },
      ],
    },
  };

  return semesterKey === 'fall' ? fall : spring;
}

/**
 * 核心方法：计算今日课程列表
 * @returns {Array} [{ name, time, location }, ...]
 */
function computeTodayCourses(refDate) {
  const now = refDate || new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const dayOfWeek = now.getDay(); // 0=周日, 1=周一...
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=周一...6=周日

  const semester = getSemesterInfo(month, year);
  const weekNum = calcWeekNum(now, semester);
  const baseCourses = getBaseCourses(semester.key);

  const dayKey = dayIndex + 1;
  const dayData = baseCourses[dayKey];

  if (!dayData || !dayData.slots || dayData.slots.length === 0) {
    return [];
  }

  const times = ['08:00-09:40', '10:00-11:40', '14:00-15:40', '16:00-17:40', '18:40-20:20'];
  const courses = [];

  dayData.slots.forEach((slot) => {
    const raw = dayData.courses[slot];
    if (!raw) return;

    courses.push({
      name: getVariedCourseName(raw.name, weekNum),
      time: times[slot] || '',
      location: getVariedLocation(raw.location, weekNum),
    });
  });

  return courses.sort((a, b) => {
    return times.indexOf(a.time) - times.indexOf(b.time);
  });
}

module.exports = {
  getSemesterInfo,
  calcWeekNum,
  getBaseCourses,
  getVariedCourseName,
  getVariedLocation,
  computeTodayCourses,
};
