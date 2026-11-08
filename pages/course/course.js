const { getSemesterInfo, calcWeekNum, getBaseCourses, getVariedCourseName, getVariedLocation } = require('../../utils/course-data.js');

Page({
  data: {
    weekOffset: 0,
    weekLabel: '',
    currentWeekIndex: 0,
    currentMonthNum: '',
    currentYearMonth: '',
    className: 'A22软件工程5班',
    semesterLabel: '春季学期',
    weekDays: [],
    periods: [
      { label: '1', time: '8:00\n9:40' },
      { label: '2', time: '10:00\n11:40' },
      { label: '3', time: '14:00\n15:40' },
      { label: '4', time: '16:00\n17:40' },
      { label: '5', time: '18:40\n20:20' },
    ],
    gridData: [],
    colors: [
      '#4a90d9', '#5cb85c', '#f0ad4e', '#d9534f',
      '#8e44ad', '#2ecc71', '#e67e22', '#3498db',
      '#1abc9c', '#e74c3c', '#9b59b6', '#2c3e50',
      '#16a085', '#27ae60', '#f39c12', '#c0392b',
      '#2980b9', '#d35400', '#7f8c8d', '#bdc3c7',
    ],
    weekOptions: [],
    customDate: null,   // 月份选择器设定后的自定义参考日期
    pickerEnd: '',      // 月份选择器上限（当前年月）
  },

  onLoad() {
    this.initWeekOptions();
    const now = new Date();
    this.setData({
      pickerEnd: now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0'),
    });
    this.refreshWeek();
  },

  onShow() {
    // 每次显示时同步今日课程到首页
    this.syncTodayCourses();
  },

  initWeekOptions() {
    const options = [];
    for (let i = 1; i <= 20; i++) {
      options.push('第 ' + i + ' 周');
    }
    this.setData({ weekOptions: options });
  },

  refreshWeek() {
    const today = new Date();
    const ref = this.data.customDate || today;
    const now = new Date(ref);
    now.setDate(now.getDate() + this.data.weekOffset * 7);

    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const semester = getSemesterInfo(month, year);
    const weekNum = calcWeekNum(now, semester);

    // 计算本周一的日期
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
    const weekDays = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = !this.data.customDate
        && d.toDateString() === today.toDateString();

      weekDays.push({
        name: '周' + dayNames[i],
        date: d.getDate(),
        isToday,
        courseCount: 0,
        fullDate: d,
      });
    }

    // 生成该周的 gridData
    const baseCourses = getBaseCourses(semester.key);
    const gridData = [];
    const colors = this.data.colors;

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const dayKey = dayIdx + 1; // 1=周一...6=周六, 7=周日
      const dayData = baseCourses[dayKey] || { slots: [], courses: [] };

      if (!dayData.slots || dayData.slots.length === 0) {
        gridData.push([]);
        continue;
      }

      const dayCourses = [];
      dayData.slots.forEach((slot) => {
        const rawCourse = dayData.courses[slot];
        if (!rawCourse) return;

        const colorShift = (weekNum + dayIdx + slot) % colors.length;
        const courseName = getVariedCourseName(rawCourse.name, weekNum);
        const loc = getVariedLocation(rawCourse.location, weekNum);

        const top = slot * 220;
        const height = 212;

        dayCourses.push({
          ...rawCourse,
          name: courseName,
          location: loc,
          color: colors[colorShift],
          top,
          height,
          slot,
        });
      });

      gridData.push(dayCourses);
      weekDays[dayIdx].courseCount = dayCourses.length;
    }

    this.setData({
      weekLabel: String(weekNum),
      currentWeekIndex: Math.min(weekNum - 1, 19),
      currentMonthNum: month,
      currentYearMonth: `${now.getFullYear()}-${String(month).padStart(2, '0')}`,
      semesterLabel: semester.label,
      weekDays,
      gridData,
    });

    // 同步今日课程到全局数据
    this.syncTodayCourses();
  },

  /** 同步今日课程到 app.globalData */
  syncTodayCourses() {
    getApp().syncTodayCourses();
  },

  prevWeek() {
    this.setData({ weekOffset: this.data.weekOffset - 1 });
    this.refreshWeek();
  },

  nextWeek() {
    this.setData({ weekOffset: this.data.weekOffset + 1 });
    this.refreshWeek();
  },

  goToday() {
    this.setData({ weekOffset: 0, customDate: null });
    this.refreshWeek();
  },

  onWeekPick(e) {
    const idx = parseInt(e.detail.value);
    const targetWeek = idx + 1;
    const ref = this.data.customDate || new Date();
    const year = ref.getFullYear();
    const month = ref.getMonth() + 1;
    const semester = getSemesterInfo(month, year);

    // 直接计算目标周的一个日期（取周三，避免周一/周日跨月边界）
    const targetDate = new Date(semester.startDate);
    targetDate.setDate(targetDate.getDate() + (targetWeek - 1) * 7 + 3);

    this.setData({ customDate: targetDate, weekOffset: 0 });
    this.refreshWeek();
  },

  /** 月份切换：改变学期和课程表，同步对应周次 */
  onMonthPick(e) {
    const val = e.detail.value; // YYYY-MM
    if (!val) return;
    const parts = val.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);

    // 最早 2022-09（22级入学时间）
    if (year < 2022 || (year === 2022 && month < 9)) {
      wx.showToast({ title: '最早只能查看 2022年9月', icon: 'none' });
      return;
    }

    const semester = getSemesterInfo(month, year);

    // 取该月中旬，准确计算属于本学期的第几周
    const customDate = new Date(year, month - 1, 10);
    const weekNum = calcWeekNum(customDate, semester);

    this.setData({ customDate, weekOffset: 0 });
    this.refreshWeek();

    wx.showToast({
      title: month + '月 · ' + semester.label + ' · 第' + weekNum + '周',
      icon: 'none',
    });
  },

  selectDay(e) {
    const index = e.currentTarget.dataset.index;
    const courses = this.data.gridData[index];
    if (!courses || courses.length === 0) {
      wx.showToast({ title: '当天无课程安排', icon: 'none' });
    } else {
      wx.showToast({ title: `共${courses.length}节课`, icon: 'none' });
    }
  },

  viewCourseDetail(e) {
    const course = e.currentTarget.dataset.course;
    if (!course) return;
    wx.showModal({
      title: course.name,
      content: `教室：${course.location}\n教师：${course.teacher}\n类型：${course.type}`,
      showCancel: false,
      confirmText: '知道了',
    });
  },
});
