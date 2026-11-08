/**
 * 社区治理共享模块（本地存储版）
 * 负责：消息中心、内容举报与审核、首页公告、账号禁用、教师资讯审核
 * 全部基于本地 storage，无后端。
 */

var MSG_KEY = 'app_messages';        // 消息中心
var REPORT_KEY = 'app_reports';      // 举报队列
var BANNER_KEY = 'app_banners';      // 首页公告
var DISABLED_KEY = 'disabled_accounts'; // 被禁用账号
var NEWS_KEY = 'teacher_news';       // 教师提交待审资讯
var POSTS_KEY = 'wall_posts';        // 校园墙帖子（下架标记）

/* ============ 基础工具 ============ */
function _fmt() {
  var d = new Date();
  var p = function (n) { return ('0' + n).slice(-2); };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

function _account() {
  var u = wx.getStorageSync('userInfo') || {};
  return u.account || '';
}

function _name() {
  var u = wx.getStorageSync('userInfo') || {};
  return u.nickname || '我';
}

/* 文字头像：按名字哈希取色 + 首字（不依赖字体图标） */
var AVATAR_COLORS = ['#367BFF', '#07c160', '#ff9800', '#ee4d6b', '#8a6dff', '#2E5496', '#26a69a'];
function avatarOf(name) {
  name = name || '?';
  var sum = 0;
  for (var i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return { char: name.charAt(0), color: AVATAR_COLORS[sum % AVATAR_COLORS.length] };
}

/* ============ 消息中心 ============ */
function pushMessage(msg) {
  // msg: {type, title, content, to, link}
  var list = wx.getStorageSync(MSG_KEY) || [];
  list.unshift({
    id: Date.now() + '_' + Math.floor(Math.random() * 1000),
    type: msg.type || 'system',
    title: msg.title || '',
    content: msg.content || '',
    to: msg.to || 'all',
    link: msg.link || '',
    read: false,
    time: _fmt(),
  });
  wx.setStorageSync(MSG_KEY, list);
}

function getMessages(account, name) {
  var list = wx.getStorageSync(MSG_KEY) || [];
  var res = [];
  for (var i = 0; i < list.length; i++) {
    var m = list[i];
    if (m.to === 'all' || m.to === account || m.to === name) res.push(m);
  }
  return res;
}

function unreadCount(account, name) {
  var list = getMessages(account, name);
  var n = 0;
  for (var i = 0; i < list.length; i++) { if (!list[i].read) n++; }
  return n;
}

function markAllRead(account, name) {
  var list = wx.getStorageSync(MSG_KEY) || [];
  for (var i = 0; i < list.length; i++) {
    var m = list[i];
    if ((m.to === 'all' || m.to === account || m.to === name) && !m.read) m.read = true;
  }
  wx.setStorageSync(MSG_KEY, list);
}

/* ============ 内容举报与审核 ============ */
function pushReport(r) {
  // r: {targetType:'post'|'comment', targetId, targetText, reason, reporter}
  var list = wx.getStorageSync(REPORT_KEY) || [];
  list.unshift({
    id: Date.now(),
    targetType: r.targetType,
    targetId: r.targetId,
    targetText: r.targetText || '',
    reason: r.reason || '',
    reporter: r.reporter || '',
    status: 'pending',
    time: _fmt(),
  });
  wx.setStorageSync(REPORT_KEY, list);
}

function getReports() {
  return wx.getStorageSync(REPORT_KEY) || [];
}

function pendingReports() {
  return getReports().filter(function (r) { return r.status === 'pending'; });
}

function handleReport(id, action, result, handler) {
  // action: 'accept' | 'reject'
  var list = getReports();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list[i].status = action === 'accept' ? 'handled' : 'rejected';
      list[i].result = result || '';
      list[i].handledBy = handler || '';
      list[i].handledTime = _fmt();
      var reporter = list[i].reporter;
      if (action === 'accept') {
        pushMessage({ type: 'report_result', title: '举报已处理', content: '您举报的内容已被处理：' + (result || ''), to: reporter });
        if (list[i].targetType === 'post') {
          removePost(list[i].targetId, true);
        } else if (list[i].targetType === 'comment') {
          removeCommentByText(list[i].targetId, list[i].targetText);
        }
      } else {
        pushMessage({ type: 'report_result', title: '举报已处理', content: '您举报的内容经核查未违规。', to: reporter });
      }
      break;
    }
  }
  wx.setStorageSync(REPORT_KEY, list);
}

/* ============ 帖子 / 评论处置 ============ */
function _loadPosts() {
  return wx.getStorageSync(POSTS_KEY) || [];
}

function removePost(id, asRemoved) {
  var posts = _loadPosts();
    for (var i = 0; i < posts.length; i++) {
    if (posts[i].id === id) {
      if (asRemoved) {
        posts[i].removed = true;
        posts[i].removedReason = '因涉嫌违规，已被管理员下架';
      } else {
        posts.splice(i, 1);
      }
      break;
    }
  }
  wx.setStorageSync(POSTS_KEY, posts);
}

function restorePost(id) {
  var posts = _loadPosts();
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].id === id) {
      posts[i].removed = false;
      posts[i].removedReason = '';
      break;
    }
  }
  wx.setStorageSync(POSTS_KEY, posts);
}

// 按文本内容定位并删除评论/回复（用于举报受理）
function removeCommentByText(postId, text) {
  if (!text) return;
  var posts = _loadPosts();
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].id !== postId) continue;
    var p = posts[i];
    if (!p.comments) continue;
    var changed = false;
    var newCmts = [];
    for (var c = 0; c < p.comments.length; c++) {
      var cmt = p.comments[c];
      if (cmt.text === text && !changed) { changed = true; p.commentCount = Math.max(0, (p.commentCount || 0) - 1); continue; }
      if (cmt.replies && cmt.replies.length > 0) {
        var newRep = [];
        for (var r = 0; r < cmt.replies.length; r++) {
          if (cmt.replies[r].text === text && !changed) { changed = true; p.commentCount = Math.max(0, (p.commentCount || 0) - 1); continue; }
          newRep.push(cmt.replies[r]);
        }
        cmt.replies = newRep;
      }
      newCmts.push(cmt);
    }
    p.comments = newCmts;
    break;
  }
  if (changed) wx.setStorageSync(POSTS_KEY, posts);
}

// 列出全部评论（扁平化，供管理端评论审核）
function flattenComments() {
  var posts = _loadPosts();
  var res = [];
  for (var i = 0; i < posts.length; i++) {
    var p = posts[i];
    if (!p.comments) continue;
    for (var c = 0; c < p.comments.length; c++) {
      var cmt = p.comments[c];
      res.push({ postId: p.id, postContent: p.content || '', user: cmt.user, text: cmt.text, time: cmt.time, kind: '主评论' });
      if (cmt.replies) {
        for (var r = 0; r < cmt.replies.length; r++) {
          res.push({ postId: p.id, postContent: p.content || '', user: cmt.replies[r].user, text: cmt.replies[r].text, time: cmt.replies[r].time, kind: '回复' });
        }
      }
    }
  }
  return res;
}

/* ============ 首页公告 ============ */
function getBanners() {
  var list = wx.getStorageSync(BANNER_KEY) || [];
  var res = [];
  for (var i = 0; i < list.length; i++) { if (list[i].active) res.push(list[i]); }
  return res;
}

function addBanner(b) {
  var list = wx.getStorageSync(BANNER_KEY) || [];
  list.unshift({ id: Date.now(), title: b.title, content: b.content, active: true, time: _fmt() });
  wx.setStorageSync(BANNER_KEY, list);
}

function deleteBanner(id) {
  var list = wx.getStorageSync(BANNER_KEY) || [];
  var res = [];
  for (var i = 0; i < list.length; i++) { if (list[i].id !== id) res.push(list[i]); }
  wx.setStorageSync(BANNER_KEY, res);
}

/* ============ 账号禁用 ============ */
function isDisabled(account) {
  var list = wx.getStorageSync(DISABLED_KEY) || [];
  return list.indexOf(account) >= 0;
}

function disableAccount(account) {
  var list = wx.getStorageSync(DISABLED_KEY) || [];
  if (list.indexOf(account) < 0) list.push(account);
  wx.setStorageSync(DISABLED_KEY, list);
}

function enableAccount(account) {
  var list = wx.getStorageSync(DISABLED_KEY) || [];
  var res = [];
  for (var i = 0; i < list.length; i++) { if (list[i] !== account) res.push(list[i]); }
  wx.setStorageSync(DISABLED_KEY, res);
}

function disabledList() {
  return (wx.getStorageSync(DISABLED_KEY) || []).slice();
}

/* ============ 教师资讯审核 ============ */
function submitNews(n) {
  // n: {title, content, category, publisher}
  var list = wx.getStorageSync(NEWS_KEY) || [];
  list.unshift({
    id: Date.now(),
    title: n.title,
    content: n.content,
    category: n.category,
    publisher: n.publisher,
    status: 'pending',
    time: _fmt(),
  });
  wx.setStorageSync(NEWS_KEY, list);
}

function getPendingNews() {
  return getNews().filter(function (x) { return x.status === 'pending'; });
}

function getNewsByPublisher(p) {
  return getNews().filter(function (x) { return x.publisher === p; });
}

function getNews() {
  return wx.getStorageSync(NEWS_KEY) || [];
}

function approveNews(id) {
  var list = getNews();
  var approved = null;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list[i].status = 'published';
      approved = list[i];
      break;
    }
  }
  wx.setStorageSync(NEWS_KEY, list);
  if (approved) {
    // 推送到校园资讯「我的发布」让其在广场展示
    var myNews = wx.getStorageSync('my_news') || [];
    myNews.unshift({
      id: approved.id,
      title: approved.title,
      content: approved.content,
      category: approved.category,
      publisher: approved.publisher,
      publisherAvatar: '',
      time: approved.time,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      liked: false,
      favorited: false,
      hot: false,
      top: false,
      comments: [],
    });
    wx.setStorageSync('my_news', myNews);
    // 通知全体学生
    pushMessage({ type: 'announcement', title: '新资讯发布', content: approved.title, to: 'all' });
  }
}

function rejectNews(id, reason) {
  var list = getNews();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) { list[i].status = 'rejected'; list[i].reason = reason || ''; break; }
  }
  wx.setStorageSync(NEWS_KEY, list);
}

module.exports = {
  avatarOf: avatarOf,
  pushMessage: pushMessage,
  getMessages: getMessages,
  unreadCount: unreadCount,
  markAllRead: markAllRead,
  pushReport: pushReport,
  getReports: getReports,
  pendingReports: pendingReports,
  handleReport: handleReport,
  removePost: removePost,
  restorePost: restorePost,
  removeCommentByText: removeCommentByText,
  flattenComments: flattenComments,
  getBanners: getBanners,
  addBanner: addBanner,
  deleteBanner: deleteBanner,
  isDisabled: isDisabled,
  disableAccount: disableAccount,
  enableAccount: enableAccount,
  disabledList: disabledList,
  submitNews: submitNews,
  getPendingNews: getPendingNews,
  getNewsByPublisher: getNewsByPublisher,
  getNews: getNews,
  approveNews: approveNews,
  rejectNews: rejectNews,
};
