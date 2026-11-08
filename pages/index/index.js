Page({
  data: {
    searchValue: '',
    features: [
      { name: '快递代拿', icon: 'logistics', path: '/pages/express/index' },
      { name: '校园导航', icon: 'location-o', path: '/pages/navigate/index' },
      { name: '学校社团', icon: 'friends-o', path: '/pages/club/index' },
      { name: '班级教材', icon: 'bookmark-o', path: '/pages/textbook/index' },
      { name: '成绩清单', icon: 'records', path: '/pages/score/index' },
      { name: '考试查询', icon: 'edit', path: '/pages/exam/index' },
      { name: '体测计算', icon: 'chart-trending-o', path: '/pages/fitness/index' },
      { name: '失物招领', icon: 'gift-o', path: '/pages/lost/index' },
      { name: '校园咨询', icon: 'newspaper-o', path: '/pages/news/index' },
    ],
    todayCourses: [],
    weekendDays: 2,
    nextHolidayName: '端午节',
    holidayDays: 20,
    vacationDays: 45,
    showHolidayModal: false,
    holidayList: [],
    waterBalance: 58.5,
    electricBalance: 120.8,
    posts: [
      {
        userName: '小明',
        avatar: '',
        content: '今天天气真好，适合在校园里散步',
        image: '',
        likes: 128,
        comments: 23,
      },
      {
        userName: '小红',
        avatar: '',
        content: '图书馆新到了一批书，大家快去看呀！',
        image: '',
        likes: 256,
        comments: 45,
      },
      {
        userName: '学霸张',
        avatar: '',
        content: '期末复习资料分享，有需要的同学联系我',
        image: '',
        likes: 512,
        comments: 89,
      },
    ],
    // 搜索相关
    searchResults: [],
    showSearchPanel: false,
    searchFocused: false,
    // 首页公告横幅
    banners: [],
  },

  onLoad() {
    this.loadTodayCourses();
    this.calculateCountdown();
    this.loadBanners();
  },

  onShow() {
    // 每次显示页面时确保课程数据是最新的
    getApp().syncTodayCourses();
    this.loadTodayCourses();
    this.loadBanners();
  },

  loadBanners() {
    var community = require('../../utils/community.js');
    this.setData({ banners: community.getBanners() });
  },

  loadTodayCourses() {
    const app = getApp();
    const courses = app.globalData.todayCourses || [];
    this.setData({ todayCourses: courses });
  },

  calculateCountdown() {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // 周六(6)和周日(0)都是周末，显示0天
    const daysToWeekend = (dayOfWeek === 0 || dayOfWeek === 6) ? 0 : 6 - dayOfWeek;

    const holidayInfo = this.getNextHoliday();
    const daysToVacation = this.getDaysUntilVacation();
    const holidayList = this.buildHolidayList();

    this.setData({
      weekendDays: daysToWeekend,
      nextHolidayName: holidayInfo.name,
      holidayDays: holidayInfo.days,
      vacationDays: daysToVacation,
      holidayList: holidayList,
    });
  },

  /** 构建完整的节假日列表（含倒计时天数） */
  buildHolidayList() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allHolidays = [
      { name: '端午节',       date: '2026-06-19', icon: 'flag-o', type: '法定节假日' },
      { name: '国庆节',       date: '2026-10-01', icon: 'star-o', type: '法定节假日' },
      { name: '元旦',         date: '2027-01-01', icon: 'fire-o', type: '法定节假日' },
      { name: '春节',         date: '2027-02-17', icon: 'flower-o', type: '法定节假日' },
      { name: '清明节',       date: '2027-04-05', icon: 'underway-o', type: '法定节假日' },
      { name: '劳动节',       date: '2027-05-01', icon: 'award-o', type: '法定节假日' },
      { name: '端午节',       date: '2027-05-31', icon: 'flag-o', type: '法定节假日' },
      { name: '中秋节',       date: '2027-09-18', icon: 'star-o', type: '法定节假日' },
      { name: '国庆节',       date: '2027-10-01', icon: 'star-o', type: '法定节假日' },
    ];

    // 添加寒暑假
    allHolidays.push(
      { name: '暑假开始',     date: '2026-07-10', icon: 'smile-o', type: '寒暑假' }
    );

    return allHolidays.map(h => {
      const hDate = new Date(h.date);
      hDate.setHours(0, 0, 0, 0);
      const diff = Math.ceil((hDate - today) / (1000 * 60 * 60 * 24));
      const isPassed = diff <= 0;
      return {
        ...h,
        daysLeft: diff > 0 ? diff : 0,
        statusText: isPassed ? '已过去' : (diff === 0 ? '今天' : `${diff}天后`),
        dateStr: h.date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1年$2月$3日'),
      };
    });
  },

  /** 获取下一个最近的节假日（动态计算） */
  getNextHoliday() {
    const today = new Date();
    // 重置为当天00:00:00
    today.setHours(0, 0, 0, 0);

    // 关键节日列表（按时间顺序，覆盖2026-2027年）
    const holidays = [
      { name: '端午节',       date: '2026-06-19', icon: 'flag-o' },
      { name: '国庆节',       date: '2026-10-01', icon: 'star-o' },
      { name: '元旦',         date: '2027-01-01', icon: 'fire-o' },
      { name: '春节',         date: '2027-02-17', icon: 'flower-o' },
      { name: '清明节',       date: '2027-04-05', icon: 'underway-o' },
      { name: '劳动节',       date: '2027-05-01', icon: 'award-o' },
      { name: '端午节',       date: '2027-05-31', icon: 'flag-o' },
      { name: '中秋节',       date: '2027-09-18', icon: 'star-o' },
      { name: '国庆节',       date: '2027-10-01', icon: 'star-o' },
    ];

    for (let i = 0; i < holidays.length; i++) {
      const hDate = new Date(holidays[i].date);
      hDate.setHours(0, 0, 0, 0);
      const diff = Math.ceil((hDate - today) / (1000 * 60 * 60 * 24));
      if (diff > 0) {
        return { name: holidays[i].name, days: diff };
      }
    }
    return { name: '节假日', days: 0 };
  },

  getDaysUntilVacation() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // 2026年暑假：7月10日
    const summerVacation = new Date('2026-07-10');
    summerVacation.setHours(0, 0, 0, 0);
    const diffTime = summerVacation - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  },

  navigateTo(e) {
    const path = e.currentTarget.dataset.path;
    if (!path) return;
    if (path === '/pages/express/index') {
      wx.navigateTo({ url: path });
      return;
    }
    if (path === '/pages/navigate/index') {
      wx.navigateTo({ url: path });
      return;
    }
    if (path === '/pages/club/index') {
      wx.navigateTo({ url: path });
      return;
    }
    if (path === '/pages/textbook/index') {
      wx.navigateTo({ url: path });
      return;
    }
    if (path === '/pages/score/index') {
      wx.navigateTo({ url: path });
      return;
    }
    if (path === '/pages/exam/index') {
      wx.navigateTo({ url: path });
      return;
    }
    if (path === '/pages/fitness/index') {
      wx.navigateTo({ url: path });
      return;
    }
    if (path === '/pages/lost/index') {
      wx.navigateTo({ url: path });
      return;
    }
    if (path === '/pages/news/index') {
      wx.navigateTo({ url: path });
      return;
    }
    wx.showToast({
      title: '功能开发中',
      icon: 'none',
    });
  },

  goToCourse() {
    wx.switchTab({
      url: '/pages/course/course',
    });
  },

  goToRecharge() {
    wx.showToast({
      title: '充值功能开发中',
      icon: 'none',
    });
  },

  goToWall() {
    wx.navigateTo({ url: '/pages/wall/index' });
  },

  onInput(e) {
    const value = e.detail.value;
    this.setData({ searchValue: value });
    if (value && value.trim()) {
      this.doSearch(value.trim());
    } else {
      this.setData({ searchResults: [], showSearchPanel: false });
    }
  },

  onSearchFocus() {
    this.setData({ searchFocused: true });
    if (this.data.searchValue && this.data.searchValue.trim()) {
      this.doSearch(this.data.searchValue.trim());
    }
  },

  onSearchBlur() {
    // 延迟关闭，让点击事件能触发
    setTimeout(() => {
      this.setData({ searchFocused: false, showSearchPanel: false });
    }, 200);
  },

  doSearch(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    const results = [];

    // 搜索功能模块
    this.data.features.forEach(item => {
      if (item.name.toLowerCase().includes(lowerKeyword)) {
        results.push({
          type: 'feature',
          name: item.name,
          icon: item.icon,
          path: item.path,
          highlight: item.name,
        });
      }
    });

    // 搜索今日课程
    const todayCourses = this.data.todayCourses || [];
    todayCourses.forEach(course => {
      if (course.name && course.name.toLowerCase().includes(lowerKeyword)) {
        results.push({
          type: 'course',
          name: course.name,
          icon: 'bookmark-o',
          path: '/pages/course/course',
          highlight: course.name,
        });
      }
    });

    this.setData({
      searchResults: results,
      showSearchPanel: true,
    });
  },

  onSearch(e) {
    const value = (e.detail && e.detail.value) || this.data.searchValue;
    if (!value || !value.trim()) return;
    this.doSearch(value.trim());
  },

  onTapResult(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      searchValue: '',
      searchResults: [],
      showSearchPanel: false,
      searchFocused: false,
    });
    if (!item || !item.path) return;
    if (item.path === '/pages/express/index' || item.path === '/pages/navigate/index' || item.path === '/pages/club/index' || item.path === '/pages/textbook/index' || item.path === '/pages/score/index' || item.path === '/pages/exam/index' || item.path === '/pages/fitness/index' || item.path === '/pages/lost/index' || item.path === '/pages/news/index') {
      wx.navigateTo({ url: item.path });
      return;
    }
    if (item.path === '/pages/course/course') {
      wx.switchTab({ url: item.path });
      return;
    }
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  onClear() {
    this.setData({
      searchValue: '',
      searchResults: [],
      showSearchPanel: false,
      searchFocused: false,
    });
  },

  openHolidayList() {
    this.setData({ showHolidayModal: true });
  },

  closeHolidayList() {
    this.setData({ showHolidayModal: false });
  },
});
