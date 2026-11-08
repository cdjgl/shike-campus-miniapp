var community = require('../../utils/community.js');
var auth = require('../../utils/auth.js');

var TABS = ['posts', 'comments', 'reports', 'banner', 'account', 'stats'];

Page({
  data: {
    activeTab: 'posts',
    tabs: [
      { key: 'posts', name: '帖子审核' },
      { key: 'comments', name: '评论审核' },
      { key: 'reports', name: '举报处理' },
      { key: 'banner', name: '公告发布' },
      { key: 'account', name: '账号管理' },
      { key: 'stats', name: '数据看板' },
    ],

    posts: [],
    comments: [],
    reports: [],
    banners: [],
    accounts: [],

    bannerTitle: '',
    bannerContent: '',
  },

  onShow() {
    this.loadAll();
  },

  loadAll() {
    this.loadPosts();
    this.loadComments();
    this.loadReports();
    this.loadBanners();
    this.loadAccounts();
    this.loadStats();
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  /* ========== 帖子审核 ========== */
  loadPosts() {
    var posts = wx.getStorageSync('wall_posts') || [];
    var list = [];
    for (var i = 0; i < posts.length; i++) {
      list.push({
        id: posts[i].id,
        publisher: posts[i].publisher || '匿名',
        content: (posts[i].content || '').slice(0, 60),
        removed: !!posts[i].removed,
      });
    }
    this.setData({ posts: list });
  },

  postRemove(e) {
    var id = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '下架帖子',
      content: '确定下架该帖子？用户将不可见。',
      confirmColor: '#e74c3c',
      success: function (res) {
        if (res.confirm) { community.removePost(id, true); that.loadPosts(); wx.showToast({ title: '已下架', icon: 'none' }); }
      }
    });
  },

  postRestore(e) {
    var id = e.currentTarget.dataset.id;
    community.restorePost(id);
    this.loadPosts();
    wx.showToast({ title: '已恢复', icon: 'none' });
  },

  /* ========== 评论审核 ========== */
  loadComments() {
    this.setData({ comments: community.flattenComments() });
  },

  commentDelete(e) {
    var postId = e.currentTarget.dataset.post;
    var text = e.currentTarget.dataset.text;
    var that = this;
    wx.showModal({
      title: '删除评论',
      content: '确定删除该评论/回复？',
      confirmColor: '#e74c3c',
      success: function (res) {
        if (res.confirm) { community.removeCommentByText(postId, text); that.loadComments(); wx.showToast({ title: '已删除', icon: 'none' }); }
      }
    });
  },

  /* ========== 举报处理 ========== */
  loadReports() {
    this.setData({ reports: community.pendingReports() });
  },

  reportAccept(e) {
    var id = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '受理举报',
      content: '受理后将对该内容做下架/删除处理，并通知举报人。',
      confirmColor: '#e74c3c',
      success: function (res) {
        if (res.confirm) {
          community.handleReport(id, 'accept', '已核实违规并处置', '管理员');
          that.loadReports();
          that.loadPosts();
          that.loadComments();
          wx.showToast({ title: '已受理', icon: 'none' });
        }
      }
    });
  },

  reportReject(e) {
    var id = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '驳回举报',
      content: '确认举报不成立？将通知举报人。',
      success: function (res) {
        if (res.confirm) { community.handleReport(id, 'reject', '', '管理员'); that.loadReports(); wx.showToast({ title: '已驳回', icon: 'none' }); }
      }
    });
  },

  /* ========== 公告发布 ========== */
  loadBanners() {
    this.setData({ banners: community.getBanners() });
  },

  onBannerInput(e) {
    var field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  bannerAdd() {
    var title = this.data.bannerTitle.trim();
    var content = this.data.bannerContent.trim();
    if (!title) { wx.showToast({ title: '请输入公告标题', icon: 'none' }); return; }
    community.addBanner({ title: title, content: content });
    this.setData({ bannerTitle: '', bannerContent: '' });
    this.loadBanners();
    community.pushMessage({ type: 'announcement', title: '新公告', content: title, to: 'all' });
    wx.showToast({ title: '已发布', icon: 'success' });
  },

  bannerDelete(e) {
    var id = e.currentTarget.dataset.id;
    community.deleteBanner(id);
    this.loadBanners();
  },

  /* ========== 账号管理 ========== */
  loadAccounts() {
    var users = auth.getUsers();
    var disabled = community.disabledList();
    var list = [];
    for (var acc in users) {
      if (!users.hasOwnProperty(acc)) continue;
      list.push({
        account: acc,
        role: users[acc].role,
        roleText: users[acc].role === 'admin' ? '管理员' : (users[acc].role === 'teacher' ? '教师' : '学生'),
        disabled: disabled.indexOf(acc) >= 0,
      });
    }
    this.setData({ accounts: list });
  },

  toggleDisable(e) {
    var acc = e.currentTarget.dataset.acc;
    var disabled = e.currentTarget.dataset.disabled;
    if (disabled) { community.enableAccount(acc); }
    else { community.disableAccount(acc); }
    this.loadAccounts();
  },

  /* ========== 数据看板 ========== */
  loadStats() {
    var posts = wx.getStorageSync('wall_posts') || [];
    var removed = 0;
    for (var i = 0; i < posts.length; i++) { if (posts[i].removed) removed++; }
    var users = auth.getUsers();
    var userCount = 0; for (var k in users) { if (users.hasOwnProperty(k)) userCount++; }
    this.setData({
      stats: {
        postCount: posts.length,
        removedCount: removed,
        commentCount: community.flattenComments().length,
        reportCount: community.pendingReports().length,
        accountCount: userCount,
        bannerCount: community.getBanners().length,
        orderCount: (wx.getStorageSync('express_orders') || []).length +
                    (wx.getStorageSync('errand_orders') || []).length +
                    (wx.getStorageSync('wash_orders') || []).length +
                    (wx.getStorageSync('print_orders') || []).length,
      }
    });
  },
});
