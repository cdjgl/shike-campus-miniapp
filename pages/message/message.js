var community = require('../../utils/community.js');

/* 消息类型元数据（颜色 + 文字头像） */
var TYPE_META = {
  like: { name: '点赞', color: '#ee4d6b', char: '赞' },
  comment: { name: '评论', color: '#367BFF', char: '评' },
  reply: { name: '回复', color: '#07c160', char: '回' },
  system: { name: '系统', color: '#8a6dff', char: '系' },
  report_result: { name: '举报', color: '#ff9800', char: '举' },
  announcement: { name: '公告', color: '#2E5496', char: '公' },
};

/* 私信种子：按角色区分，互不串（学生 / 教师 / 管理员） */
var CHAT_SEED = {
  student: [
    {
      id: 1, name: '跑腿小哥', lastMsg: '您的快递已放至菜鸟驿站', time: '10:30', unread: 1,
      detail: [
        { id: 1, fromMe: false, text: '您好，我是接单的跑腿同学', time: '10:20' },
        { id: 2, fromMe: true, text: '麻烦帮我放菜鸟驿站，谢谢', time: '10:25' },
        { id: 3, fromMe: false, text: '您的快递已放至菜鸟驿站', time: '10:30' },
      ],
    },
    {
      id: 2, name: '学习委员', lastMsg: '明天交实验报告，别忘了', time: '昨天', unread: 0,
      detail: [
        { id: 1, fromMe: false, text: '明天交实验报告，别忘了', time: '昨天 20:10' },
      ],
    },
  ],
  teacher: [
    {
      id: 1, name: '教务秘书', lastMsg: '请于本周五前提交本学期成绩', time: '09:15', unread: 1,
      detail: [
        { id: 1, fromMe: false, text: '老师，请于本周五前提交本学期成绩', time: '09:15' },
      ],
    },
    {
      id: 2, name: '张同学', lastMsg: '老师，作业提交系统打不开', time: '昨天', unread: 0,
      detail: [
        { id: 1, fromMe: false, text: '老师，作业提交系统打不开', time: '昨天 19:40' },
        { id: 2, fromMe: true, text: '我看看，稍后回复你', time: '昨天 19:50' },
      ],
    },
  ],
  admin: [
    {
      id: 1, name: '学生反馈', lastMsg: '管理员你好，校园墙有人发广告', time: '11:05', unread: 1,
      detail: [
        { id: 1, fromMe: false, text: '管理员你好，校园墙有人发广告', time: '11:05' },
      ],
    },
    {
      id: 2, name: '教师 · 王老师', lastMsg: '我这边有一篇活动资讯，申请发布', time: '昨天', unread: 0,
      detail: [
        { id: 1, fromMe: false, text: '我这边有一篇活动资讯，申请发布', time: '昨天 16:00' },
      ],
    },
  ],
};

/* 系统通知种子：按角色区分，仅写入一次 */
var NOTICE_SEED = {
  student: [
    { type: 'announcement', title: '期末考试安排已发布', content: '请登录教务系统查看各科考试时间与考场。' },
    { type: 'system', title: '欢迎使用拾刻校园通', content: '校园墙、代拿、失物招领等校园服务一站搞定。' },
  ],
  teacher: [
    { type: 'system', title: '教师专区已开通', content: '可在「我的 → 教师专区」发布课程通知与作业提醒。' },
    { type: 'system', title: '期中教学检查通知', content: '请各位老师于本周内完成教学进度自查。' },
  ],
  admin: [
    { type: 'system', title: '管理员权限已生效', content: '可在「我的 → 管理员后台」审核内容、处理举报、发布公告。' },
    { type: 'system', title: '系统提醒', content: '请及时处理用户举报，维护校园社区秩序。' },
  ],
};

Page({
  data: {
    activeTab: 'notice',
    notices: [],
    chats: [],
  },

  onShow() {
    var u = wx.getStorageSync('userInfo') || {};
    this._seedNotices(u);
    this._loadChats(u);
    this.loadNotices();
  },

  /* 首次进入按角色写入欢迎/系统通知（标记位防止重复） */
  _seedNotices(u) {
    var acc = u.account || '';
    if (!acc) return;
    var flag = 'msg_seeded_' + acc;
    if (wx.getStorageSync(flag)) return;
    var role = u.role || 'student';
    var seeds = NOTICE_SEED[role] || NOTICE_SEED.student;
    for (var i = seeds.length - 1; i >= 0; i--) {
      community.pushMessage({
        type: seeds[i].type,
        title: seeds[i].title,
        content: seeds[i].content,
        to: acc,
      });
    }
    wx.setStorageSync(flag, 1);
  },

  /* 私信按账号隔离存储，首次按角色写入种子 */
  _loadChats(u) {
    var acc = u.account || 'guest';
    var key = 'message_chats_' + acc;
    var saved = wx.getStorageSync(key);
    var chats;
    if (saved && saved.length) {
      chats = saved;
    } else {
      var role = u.role || 'student';
      chats = JSON.parse(JSON.stringify(CHAT_SEED[role] || CHAT_SEED.student));
    }
    for (var i = 0; i < chats.length; i++) {
      var av = community.avatarOf(chats[i].name);
      chats[i].avatarChar = av.char;
      chats[i].avatarColor = av.color;
    }
    wx.setStorageSync(key, chats);
    this.setData({ chats: chats });
  },

  /* 通知 = 真实的消息流（点赞/评论/回复/举报结果/公告 + 角色种子） */
  loadNotices() {
    var u = wx.getStorageSync('userInfo') || {};
    var list = community.getMessages(u.account, u.nickname);
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      var meta = TYPE_META[m.type] || TYPE_META.system;
      list[i].typeName = meta.name;
      list[i].typeColor = meta.color;
      list[i].typeChar = meta.char;
    }
    this.setData({ notices: list });
    // 打开消息页即标记已读，并清除 Tab 红点（消息在 tabBar 第 3 个，index=2）
    community.markAllRead(u.account, u.nickname);
    try { wx.removeTabBarBadge({ index: 2 }); } catch (e) {}
  },

  switchTab(e) {
    var tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  /* 点击通知 → 进入通知详情页 */
  onNoticeTap(e) {
    var idx = e.currentTarget.dataset.index;
    var notice = this.data.notices[idx];
    if (!notice) return;
    var app = getApp();
    if (app && app.globalData) app.globalData.pendingNotice = notice;
    wx.navigateTo({ url: '/pages/message/notice-detail?id=' + notice.id });
  },

  /* 打开私信 → 进入独立聊天页 */
  openChat(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/chat/chat?id=' + id });
  },
});
