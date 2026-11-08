const { computeTodayCourses } = require('./utils/course-data.js');
const auth = require('./utils/auth.js');

App({
  onLaunch() {
    // 写入三类初始账号（管理员 / 教师 / 学生）
    auth.seedInitialUsers();

    // 启动时同步今日课程
    this.syncTodayCourses();

    wx.login({
      success: res => {
        if (res.code) {
          console.log('wx.login 成功, code:', res.code);
        }
      },
      fail: err => {
        console.log('wx.login 失败:', err);
      },
    });
  },

  /** 同步今日课程到 globalData，供所有页面读取 */
  syncTodayCourses() {
    this.globalData.todayCourses = computeTodayCourses();
  },

  globalData: {
    userInfo: null,
    token: '',
    pendingChat: null,           // 来自校园墙等的「私信TA」待打开会话
    todayCourses: [],
    expressOrders: [],           // 自己提交的代取订单
    acceptedExpressOrders: [],   // 自己接的他人订单（存储订单id列表）
    errandOrders: [],            // 自己提交的跑腿订单
    acceptedErrandOrders: [],    // 自己接的他人跑腿订单（存储订单id列表）
    washOrders: [],              // 自己提交的清洗订单
    acceptedWashOrders: [],      // 自己接的他人清洗订单（存储订单id列表）
    printOrders: [],             // 自己提交的打印订单
    acceptedPrintOrders: [],     // 自己接的他人打印订单（存储订单id列表）
    cancelRecord: {              // 接单取消记录（惩罚机制）
      date: '',                  // 记录日期 'YYYY-MM-DD'
      count: 0,                  // 当天取消次数
      penaltyUntil: '',          // 惩罚截止时间 ISO string，空=无惩罚
    },
  },
});
