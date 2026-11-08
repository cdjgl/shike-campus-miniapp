Page({
  data: {
    // 学年筛选
    academicYear: '2025-2026',
    academicYears: ['2024-2025', '2025-2026'],
    showYearPicker: false,

    // 学期筛选
    semester: '全部',
    semesters: ['全部', '第一学期', '第二学期'],
    showSemesterPicker: false,

    // 考试数据
    exams: [],
    displayExams: [],
    hasQueried: false
  },

  onLoad() {
    // 不自动查询，等待用户点击按钮
  },

  // 年份下拉
  toggleYearPicker() {
    this.setData({ showYearPicker: !this.data.showYearPicker, showSemesterPicker: false });
  },
  onSelectYear(e) {
    this.setData({
      academicYear: e.currentTarget.dataset.value,
      showYearPicker: false
    });
  },

  // 学期下拉
  toggleSemesterPicker() {
    this.setData({ showSemesterPicker: !this.data.showSemesterPicker, showYearPicker: false });
  },
  onSelectSemester(e) {
    this.setData({
      semester: e.currentTarget.dataset.value,
      showSemesterPicker: false
    });
  },

  // 查询考试信息
  onQuery() {
    wx.showLoading({ title: '查询中...' });
    setTimeout(() => {
      const filtered = this.filterExams();
      this.setData({ displayExams: filtered, hasQueried: true });
      wx.hideLoading();
      if (filtered.length === 0) {
        wx.showToast({ title: '暂无考试信息', icon: 'none', duration: 1500 });
      }
    }, 400);
  },

  // 考试模拟数据
  filterExams() {
    const year = this.data.academicYear;
    const sem = this.data.semester;

    const allExams = [
      // ==================== 2024-2025学年 ====================
      // 第一学期（大一上）
      { courseName: '高等数学A(1)', examName: '高等数学A(1)期末统考', status: '已结束', time: '2025年1月13日（09:00-11:00）', location: '5-301', academicYear: '2024-2025', semester: '第一学期', statusType: 'done' },
      { courseName: 'C语言程序设计', examName: 'C语言程序设计期末机考', status: '已结束', time: '2025年1月15日（14:30-16:30）', location: '9-201 机房', academicYear: '2024-2025', semester: '第一学期', statusType: 'done' },
      { courseName: '大学英语(1)', examName: '大学英语(1)期末统考', status: '已结束', time: '2025年1月17日（09:00-11:00）', location: '3-405', academicYear: '2024-2025', semester: '第一学期', statusType: 'done' },
      { courseName: '思想道德与法治', examName: '思想道德与法治期末考查', status: '已结束', time: '2025年1月20日（10:30-12:00）', location: '1-210', academicYear: '2024-2025', semester: '第一学期', statusType: 'done' },
      { courseName: '军事理论', examName: '军事理论期末机考', status: '已结束', time: '2025年1月8日（08:30-10:00）', location: '9-105 机房', academicYear: '2024-2025', semester: '第一学期', statusType: 'done' },
      { courseName: '大学生心理健康教育', examName: '心理健康期末论文考核', status: '已结束', time: '2025年1月10日（提交截止 17:00）', location: '线上提交', academicYear: '2024-2025', semester: '第一学期', statusType: 'done' },
      { courseName: '计算机科学导论', examName: '计算机导论期末大作业', status: '已结束', time: '2025年1月14日（提交截止 23:59）', location: '线上提交', academicYear: '2024-2025', semester: '第一学期', statusType: 'done' },

      // 第二学期（大一下）
      { courseName: '高等数学A(2)', examName: '高等数学A(2)期末统考', status: '已结束', time: '2025年6月23日（09:00-11:00）', location: '5-201', academicYear: '2024-2025', semester: '第二学期', statusType: 'done' },
      { courseName: '线性代数', examName: '线性代数期末统考', status: '已结束', time: '2025年6月25日（14:30-16:30）', location: '3-102', academicYear: '2024-2025', semester: '第二学期', statusType: 'done' },
      { courseName: '大学物理B(1)', examName: '大学物理B(1)期末统考', status: '已结束', time: '2025年6月27日（09:00-11:00）', location: '5-303', academicYear: '2024-2025', semester: '第二学期', statusType: 'done' },
      { courseName: '离散数学', examName: '离散数学期末统考', status: '已结束', time: '2025年6月30日（09:00-11:00）', location: '5-205', academicYear: '2024-2025', semester: '第二学期', statusType: 'done' },
      { courseName: '大学英语(2)', examName: '大学英语(2)期末统考', status: '已结束', time: '2025年7月2日（09:00-11:00）', location: '3-408', academicYear: '2024-2025', semester: '第二学期', statusType: 'done' },
      { courseName: '中国近现代史纲要', examName: '近现代史纲要期末考查', status: '已结束', time: '2025年6月24日（14:30-16:00）', location: '1-315', academicYear: '2024-2025', semester: '第二学期', statusType: 'done' },
      { courseName: 'Python程序设计', examName: 'Python程序设计期末项目', status: '已结束', time: '2025年7月4日（14:30-16:30）', location: '9-303 机房', academicYear: '2024-2025', semester: '第二学期', statusType: 'done' },

      // ==================== 2025-2026学年 ====================
      // 第一学期（大二上）
      { courseName: '数据结构', examName: '数据结构期末统考', status: '已结束', time: '2026年1月12日（09:00-11:00）', location: '5-401', academicYear: '2025-2026', semester: '第一学期', statusType: 'done' },
      { courseName: '面向对象程序设计', examName: '面向对象程序设计课程设计答辩', status: '已结束', time: '2026年1月14日（14:00-17:00）', location: '9-405 实验室', academicYear: '2025-2026', semester: '第一学期', statusType: 'done' },
      { courseName: '概率论与数理统计', examName: '概率论与数理统计期末统考', status: '已结束', time: '2026年1月16日（14:30-16:30）', location: '5-203', academicYear: '2025-2026', semester: '第一学期', statusType: 'done' },
      { courseName: '大学物理B(2)', examName: '大学物理B(2)期末统考', status: '已结束', time: '2026年1月19日（09:00-11:00）', location: '5-301', academicYear: '2025-2026', semester: '第一学期', statusType: 'done' },
      { courseName: '计算机组成原理', examName: '计算机组成原理期末统考', status: '已结束', time: '2026年1月21日（14:30-16:30）', location: '9-209', academicYear: '2025-2026', semester: '第一学期', statusType: 'done' },
      { courseName: '大学英语(3)', examName: '大学英语(3)期末统考', status: '已结束', time: '2026年1月22日（09:00-11:00）', location: '3-512', academicYear: '2025-2026', semester: '第一学期', statusType: 'done' },
      { courseName: '马克思主义基本原理', examName: '马克思主义基本原理期末考查', status: '已结束', time: '2026年1月15日（10:30-12:00）', location: '1-420', academicYear: '2025-2026', semester: '第一学期', statusType: 'done' },
      { courseName: '数字逻辑电路', examName: '数字逻辑电路期末统考', status: '已结束', time: '2026年1月20日（09:00-11:00）', location: '9-107', academicYear: '2025-2026', semester: '第一学期', statusType: 'done' },

      // 第二学期（大二下-当前，即将考试）
      { courseName: '计算机网络', examName: '计算机网络期末统考', status: '待考', time: '2026年6月15日（09:00-11:00）', location: '5-201', academicYear: '2025-2026', semester: '第二学期', statusType: 'upcoming' },
      { courseName: '操作系统原理', examName: '操作系统原理期末统考', status: '待考', time: '2026年6月17日（14:30-16:30）', location: '5-303', academicYear: '2025-2026', semester: '第二学期', statusType: 'upcoming' },
      { courseName: '数据库系统概论', examName: '数据库系统概论期末统考', status: '待考', time: '2026年6月19日（09:00-11:00）', location: '5-405', academicYear: '2025-2026', semester: '第二学期', statusType: 'upcoming' },
      { courseName: 'Web前端开发技术', examName: 'Web前端开发技术课程项目答辩', status: '待考', time: '2026年6月22日（14:00-17:00）', location: '9-401 实验室', academicYear: '2025-2026', semester: '第二学期', statusType: 'upcoming' },
      { courseName: '算法分析与设计', examName: '算法分析与设计期末统考', status: '待考', time: '2026年6月24日（14:30-16:30）', location: '9-209', academicYear: '2025-2026', semester: '第二学期', statusType: 'upcoming' },
      { courseName: '毛泽东思想和中国特色社会主义理论体系概论', examName: '毛概期末考查', status: '待考', time: '2026年6月23日（10:30-12:00）', location: '1-310', academicYear: '2025-2026', semester: '第二学期', statusType: 'upcoming' },
      { courseName: '软件需求工程', examName: '软件需求工程期末论文', status: '待考', time: '2026年6月26日（提交截止 17:00）', location: '线上提交', academicYear: '2025-2026', semester: '第二学期', statusType: 'upcoming' },
      { courseName: 'Java Web开发', examName: 'Java Web开发期末项目答辩', status: '待考', time: '2026年6月29日（14:00-17:00）', location: '9-405 实验室', academicYear: '2025-2026', semester: '第二学期', statusType: 'upcoming' },
    ];

    // 按学年筛选
    let result = allExams.filter(e => e.academicYear === year);

    // 按学期筛选
    if (sem !== '全部') {
      result = result.filter(e => e.semester === sem);
    }

    // 按时间排序（已结束的按时间倒序，待考的按时间正序）
    const done = result.filter(e => e.statusType === 'done').sort((a, b) => b.time.localeCompare(a.time));
    const up = result.filter(e => e.statusType === 'upcoming').sort((a, b) => a.time.localeCompare(b.time));
    return [...up, ...done];
  }
});
