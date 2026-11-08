var community = require('../../utils/community.js');
var emojiData = require('../../utils/emoji.js');

/* 表情面板分类：通用 Emoji 分类 + 颜文字 */
var FACE_TABS = [];
for (var ei = 0; ei < emojiData.EMOJI_TABS.length; ei++) {
  FACE_TABS.push(emojiData.EMOJI_TABS[ei].name);
}
FACE_TABS.push('颜文字');
var KAOMOJI_INDEX = FACE_TABS.length - 1;

/* 颜文字（符号组合，非 emoji） */
var KAOMOJI = [
  '(^_^)', '(￣▽￣)', '(*^_^*)', '(^o^)', '(｡･ω･｡)', '(・∀・)', '(´∀｀)', '(●´ω｀●)', '(￣ー￣)', '(°ー°〃)',
  '(T_T)', '(＞﹏＜)', 'QAQ', 'TAT', '(╥﹏╥)', '(；′⌒`)', 'Orz', '-_-', '>_<', '@_@',
  '(°Д°)', '(⊙﹏⊙)', '(= =)', '(ーー;)', '(¬_¬)', '(｀・ω・´)', '(・_・;)', '(／。＼)', '(；一_一)', '(⇀‸↼)',
  '(╯°Д°)╯', '~\\(≧▽≦)/~', '(ง •_•)ง', '(๑•̀ㅂ•́)و', '(づ｡◕‿‿◕｡)づ', '(๑´•ᴗ•̀๑)', '(っ˘̩╭╮˘̩)っ', '(￣へ￣)', '(╬ Ò﹏Ó)', '(・∀・)つ'
];

var MORE_ITEMS = [
  { key: 'album', name: '相册', icon: 'album' },
  { key: 'camera', name: '拍摄', icon: 'camera' },
  { key: 'file', name: '文件', icon: 'file' },
  { key: 'location', name: '位置', icon: 'location' }
];

var WAVE_BARS = [
  { k: 1, h: 16 }, { k: 2, h: 30 }, { k: 3, h: 48 }, { k: 4, h: 26 },
  { k: 5, h: 40 }, { k: 6, h: 22 }, { k: 7, h: 34 }
];

var HINT_NORMAL = '手指上滑 转文字 / 取消';
var HINT_TEXT = '松开转文字';
var HINT_CANCEL = '松开取消';

function formatTime(d) {
  var p = function (n) { return ('0' + n).slice(-2); };
  return p(d.getHours()) + ':' + p(d.getMinutes());
}

function fileSize(n) {
  n = Number(n) || 0;
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(1) + ' MB';
}

function uid() {
  return 'm' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

/* 计算哪些消息需要显示时间分隔条（首条 + 跨天） */
function decorateDetail(detail) {
  for (var i = 0; i < detail.length; i++) {
    var cur = detail[i];
    if (i === 0) { cur.showTime = true; continue; }
    var prev = detail[i - 1];
    var curYesterday = (cur.time || '').indexOf('昨天') === 0;
    var prevYesterday = (prev.time || '').indexOf('昨天') === 0;
    cur.showTime = (curYesterday !== prevYesterday);
  }
}

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    windowWidth: 375,
    chat: null,
    myChar: '我',
    myName: '我',
    inputValue: '',
    scrollTo: '',

    mode: 'text',            // text | voice
    panel: '',               // '' | emoji | more
    faceTabs: FACE_TABS,
    faceGroupIndex: 0,
    kaomojiIndex: KAOMOJI_INDEX,
    faceTextList: KAOMOJI,
    emojiList: emojiData.EMOJI_TABS[0].list,
    emojiCatName: emojiData.EMOJI_TABS[0].name,
    moreItems: MORE_ITEMS,
    waveBars: WAVE_BARS,

    recording: false,
    recordSeconds: 0,
    recordState: 'normal',   // normal | text | cancel
    recordHint: HINT_NORMAL,
    showTextConfirm: false,
    textConfirmValue: '',
    playingId: '',
  },

  onLoad(options) {
    var self = this;
    var sys = wx.getSystemInfoSync();
    var statusBarHeight = sys.statusBarHeight || 20;
    var navBarHeight = 44;
    if (wx.getMenuButtonBoundingClientRect) {
      var menu = wx.getMenuButtonBoundingClientRect();
      if (menu && menu.top) navBarHeight = (menu.top - statusBarHeight) * 2 + menu.height;
    }

    /* 录音管理器：只注册一次 */
    if (wx.getRecorderManager) {
      this._recorder = wx.getRecorderManager();
      this._recorder.onStop(function (res) { self._onRecordStop(res || {}); });
      this._recorder.onError(function () {
        self._recordStarted = false;
        wx.showToast({ title: '麦克风不可用，请检查权限', icon: 'none' });
      });
    }

    var u = wx.getStorageSync('userInfo') || {};
    var key = 'message_chats_' + (u.account || 'guest');
    var chats = wx.getStorageSync(key) || [];
    var chat = null;
    for (var i = 0; i < chats.length; i++) {
      if (String(chats[i].id) === String(options.id)) { chat = chats[i]; break; }
    }

    if (!chat) {
      wx.showToast({ title: '会话不存在', icon: 'none' });
      this.setData({ statusBarHeight: statusBarHeight, navBarHeight: navBarHeight });
      setTimeout(function () { wx.navigateBack({ delta: 1 }); }, 800);
      return;
    }

    if (!chat.avatarChar) {
      var av = community.avatarOf(chat.name);
      chat.avatarChar = av.char;
      chat.avatarColor = av.color;
    }
    if (!chat.detail) chat.detail = [];
    if (chat.unread) { chat.unread = 0; wx.setStorageSync(key, chats); }
    decorateDetail(chat.detail);

    this.setData({
      statusBarHeight: statusBarHeight,
      navBarHeight: navBarHeight,
      windowWidth: sys.windowWidth || 375,
      chat: chat,
      myChar: (u.nickname || '我').charAt(0) || '我',
      myName: u.nickname || '我',
    });
    this._scrollBottom(chat);
  },

  onUnload() {
    this._stopTimer();
    clearTimeout(this._fallbackTimer);
    clearTimeout(this._fakePlayTimer);
    if (this._recordingStarted && this._recorder) {
      try { this._recorder.stop(); } catch (e) {}
    }
    if (this._audio) {
      try { this._audio.destroy(); } catch (e) {}
      this._audio = null;
    }
  },

  _scrollBottom(chat) {
    var d = chat && chat.detail;
    if (d && d.length) this.setData({ scrollTo: 'msg-' + d[d.length - 1].id });
  },

  /* ============ 统一写入一条消息 ============ */
  _push(fields) {
    var chat = this.data.chat;
    if (!chat) return;
    var u = wx.getStorageSync('userInfo') || {};
    var key = 'message_chats_' + (u.account || 'guest');
    var chats = wx.getStorageSync(key) || [];
    var idx = -1;
    for (var i = 0; i < chats.length; i++) {
      if (String(chats[i].id) === String(chat.id)) { idx = i; break; }
    }
    if (idx === -1) return;

    var nid = uid();
    var item = { id: nid, fromMe: true, type: 'text', time: formatTime(new Date()), showTime: false };
    for (var k in fields) {
      if (k !== 'lastMsg' && Object.prototype.hasOwnProperty.call(fields, k)) item[k] = fields[k];
    }
    chats[idx].detail.push(item);
    chats[idx].lastMsg = fields.lastMsg || fields.text || '[消息]';
    chats[idx].time = item.time;
    chats[idx].unread = 0;
    wx.setStorageSync(key, chats);
    this.setData({ chat: chats[idx], scrollTo: 'msg-' + nid });
  },

  /* ============ 导航 ============ */
  backToList() { wx.navigateBack({ delta: 1 }); },

  onAvatarTap(e) {
    var me = Number(e.currentTarget.dataset.me) === 1;
    var name = me ? this.data.myName : (this.data.chat && this.data.chat.name);
    if (!name) return;
    wx.navigateTo({
      url: '/pages/profile/profile?name=' + encodeURIComponent(name) + '&me=' + (me ? 1 : 0),
    });
  },

  onOpenPeerProfile() {
    var name = this.data.chat && this.data.chat.name;
    if (!name) return;
    wx.navigateTo({
      url: '/pages/profile/profile?name=' + encodeURIComponent(name) + '&me=0',
    });
  },

  /* ============ 工具栏 / 面板切换 ============ */
  toggleVoiceMode() {
    this.setData({ mode: this.data.mode === 'voice' ? 'text' : 'voice', panel: '' });
  },
  toggleEmoji() {
    this.setData({ mode: 'text', panel: this.data.panel === 'emoji' ? '' : 'emoji' });
  },
  toggleMore() {
    this.setData({ mode: 'text', panel: this.data.panel === 'more' ? '' : 'more' });
  },
  onInputFocus() {
    if (this.data.panel) this.setData({ panel: '' });
  },
  switchFaceGroup(e) {
    var i = Number(e.currentTarget.dataset.index) || 0;
    var d = { faceGroupIndex: i };
    if (i >= 0 && i < KAOMOJI_INDEX) {
      var cat = emojiData.EMOJI_TABS[i];
      d.emojiList = cat.list;
      d.emojiCatName = cat.name;
    }
    this.setData(d);
  },

  /* ============ 文字 / 表情 ============ */
  onInput(e) { this.setData({ inputValue: e.detail.value }); },

  sendMessage() {
    var text = (this.data.inputValue || '').trim();
    if (!text) return;
    this._push({ type: 'text', text: text, lastMsg: text });
    this.setData({ inputValue: '' });
    this._faceStack = [];
  },

  /* Emojiall emoji：点即发送一条普通尺寸的消息 */
  sendEmoji(e) {
    var ch = e.currentTarget.dataset.ch;
    if (!ch) return;
    this._push({ type: 'emoji', text: ch, lastMsg: ch });
  },

  insertFace(e) {
    var f = e.currentTarget.dataset.face || '';
    if (!f) return;
    if (!this._faceStack) this._faceStack = [];
    this._faceStack.push(f.length);
    this.setData({ inputValue: (this.data.inputValue || '') + f });
  },

  onFaceDelete() {
    var v = this.data.inputValue || '';
    if (!v) return;
    var stack = this._faceStack || [];
    var n = stack.length ? stack.pop() : 1;
    this.setData({ inputValue: v.slice(0, Math.max(0, v.length - n)) });
  },

  /* ============ ＋：相册 / 拍摄 / 文件 / 位置 ============ */
  onMoreItem(e) {
    var k = e.currentTarget.dataset.key;
    if (k === 'album') this._chooseImage('album');
    else if (k === 'camera') this._chooseImage('camera');
    else if (k === 'file') this._chooseFile();
    else if (k === 'location') this._chooseLocation();
  },

  _chooseImage(sourceType) {
    var self = this;
    var done = function (path) {
      if (!path) return;
      self._push({ type: 'image', path: path, lastMsg: '[图片]' });
      self.setData({ panel: '' });
    };
    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: 1, mediaType: ['image'], sourceType: [sourceType], sizeType: ['compressed'],
        success: function (res) {
          var f = res && res.tempFiles && res.tempFiles[0];
          done(f && f.tempFilePath);
        },
        fail: function () {},
      });
    } else if (wx.chooseImage) {
      wx.chooseImage({
        count: 1, sourceType: [sourceType],
        success: function (res) { done(res && res.tempFilePaths && res.tempFilePaths[0]); },
        fail: function () {},
      });
    } else {
      wx.showToast({ title: '当前环境不支持图片选择', icon: 'none' });
    }
  },

  _chooseFile() {
    var self = this;
    if (!wx.chooseMessageFile) {
      wx.showToast({ title: '当前环境不支持文件选择', icon: 'none' });
      return;
    }
    wx.chooseMessageFile({
      count: 1, type: 'all',
      success: function (res) {
        var f = res && res.tempFiles && res.tempFiles[0];
        if (!f) return;
        var name = f.name || '文件';
        self._push({ type: 'file', fileName: name, fileSize: fileSize(f.size), lastMsg: '[文件] ' + name });
        self.setData({ panel: '' });
      },
      fail: function () {},
    });
  },

  _chooseLocation() {
    var self = this;
    if (!wx.chooseLocation) {
      wx.showToast({ title: '当前环境不支持位置选择', icon: 'none' });
      return;
    }
    wx.chooseLocation({
      success: function (res) {
        var name = res.name || '位置';
        self._push({ type: 'location', name: name, address: res.address || '', lastMsg: '[位置] ' + name });
        self.setData({ panel: '' });
      },
      fail: function () {},
    });
  },

  previewImage(e) {
    var p = e.currentTarget.dataset.path;
    if (!p) return;
    wx.previewImage({ urls: [p], current: p });
  },

  /* 录音临时文件会失效，转存到 USER_DATA_PATH 永久目录 */
  _persistVoice(tempPath, cb) {
    if (!tempPath) { cb(''); return; }
    var fs = wx.getFileSystemManager && wx.getFileSystemManager();
    if (!fs || !fs.saveFile || !wx.env || !wx.env.USER_DATA_PATH) { cb(tempPath); return; }
    var dest = wx.env.USER_DATA_PATH + '/voice_' + Date.now();
    fs.saveFile({
      tempFilePath: tempPath,
      filePath: dest,
      success: function (r) { cb((r && r.savedFilePath) || dest); },
      fail: function () { cb(tempPath); },
    });
  },

  playVoice(e) {
    var id = e.currentTarget.dataset.id;
    var path = e.currentTarget.dataset.path;
    var self = this;

    /* 无音频（开发者工具 / 录音失败）：点击仍要有可见反馈 + 明确原因 */
    if (!path) {
      wx.showToast({ title: '未录到音频，请在真机预览录制', icon: 'none' });
      this.setData({ playingId: id });
      clearTimeout(this._fakePlayTimer);
      this._fakePlayTimer = setTimeout(function () {
        self.setData({ playingId: '' });
      }, 1800);
      return;
    }

    if (this._audio) {
      try { this._audio.stop(); this._audio.destroy(); } catch (err) {}
      this._audio = null;
    }
    if (this.data.playingId === id) { this.setData({ playingId: '' }); return; }
    if (!wx.createInnerAudioContext) {
      wx.showToast({ title: '当前环境不支持音频播放', icon: 'none' });
      return;
    }

    var ctx = wx.createInnerAudioContext();
    this._audio = ctx;
    ctx.obeyMuteSwitch = false;
    ctx.src = path;
    ctx.onEnded(function () { self.setData({ playingId: '' }); });
    ctx.onError(function () {
      self.setData({ playingId: '' });
      wx.showToast({ title: '音频已失效，请重新录制', icon: 'none' });
    });
    ctx.onCanplay(function () { try { ctx.play(); } catch (err) {} });
    try { ctx.play(); } catch (err) {}
    this.setData({ playingId: id });
  },

  /* ============ 语音：按住说话 / 上滑转文字 / 取消 ============ */
  _touchPoint(e) {
    if (e && e.touches && e.touches[0]) return e.touches[0];
    if (e && e.changedTouches && e.changedTouches[0]) return e.changedTouches[0];
    return null;
  },

  _startTimer() {
    var self = this;
    this._stopTimer();
    this._timer = setInterval(function () {
      var n = self.data.recordSeconds + 1;
      self.setData({ recordSeconds: n });
      if (n >= 60) {
        self._stopTimer();
        self.setData({ recording: false });
        self._finishRecord('send');
      }
    }, 1000);
  },

  _stopTimer() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  },

  onTalkStart(e) {
    var t = this._touchPoint(e);
    if (!t || this.data.recording) return;
    this._startY = t.clientY;
    this._startX = t.clientX;
    this._recordStarted = false;
    this._awaitingStop = false;
    this._stopHandled = false;
    this.setData({
      recording: true, recordSeconds: 0, recordState: 'normal',
      recordHint: HINT_NORMAL, panel: '',
    });
    this._startTimer();
    if (this._recorder) {
      try {
        this._recorder.start({ duration: 60000 });
        this._recordStarted = true;
      } catch (err) {
        this._recordStarted = false;
      }
    }
  },

  onTalkMove(e) {
    if (!this.data.recording) return;
    var t = this._touchPoint(e);
    if (!t) return;
    var dy = this._startY - t.clientY;
    var state = 'normal';
    if (dy > 70) state = (t.clientX < this.data.windowWidth / 2) ? 'text' : 'cancel';
    var hint = state === 'text' ? HINT_TEXT : (state === 'cancel' ? HINT_CANCEL : HINT_NORMAL);
    if (state !== this.data.recordState || hint !== this.data.recordHint) {
      this.setData({ recordState: state, recordHint: hint });
    }
  },

  onTalkEnd() {
    if (!this.data.recording) return;
    var state = this.data.recordState;
    this._finishRecord(state === 'cancel' ? 'cancel' : (state === 'text' ? 'text' : 'send'));
  },

  onTalkCancel() { this._finishRecord('cancel'); },

  _stopRecorder() {
    if (this._recorder && this._recordStarted) {
      try { this._recorder.stop(); } catch (e) {}
    }
    this._recordStarted = false;
  },

  _finishRecord(action) {
    this._stopTimer();
    var secs = this.data.recordSeconds;
    this.setData({ recording: false, recordState: 'normal', recordHint: HINT_NORMAL });
    this._awaitingStop = false;
    this._stopHandled = false;

    if (action === 'cancel') {
      wx.showToast({ title: '已取消', icon: 'none' });
      this._stopRecorder();
      return;
    }
    if (secs < 1) {
      wx.showToast({ title: '说话时间太短', icon: 'none' });
      this._stopRecorder();
      return;
    }

    var self = this;
    this._pendingAction = action;
    this._recordSecondsAtEnd = secs;
    this._awaitingStop = true;
    if (this._recordStarted && this._recorder) {
      this._recorder.stop();
      this._fallbackTimer = setTimeout(function () {
        if (self._awaitingStop && !self._stopHandled) self._onRecordStop({});
      }, 1500);
    } else {
      this._onRecordStop({});
    }
    this._recordStarted = false;
  },

  _onRecordStop(res) {
    if (!this._awaitingStop || this._stopHandled) return;
    this._awaitingStop = false;
    this._stopHandled = true;
    clearTimeout(this._fallbackTimer);

    var action = this._pendingAction || 'send';
    var secs = this._recordSecondsAtEnd || 1;
    if (action === 'text') {
      this.setData({ showTextConfirm: true, textConfirmValue: '' });
      return;
    }
    var self = this;
    this._persistVoice((res && res.tempFilePath) || '', function (path) {
      self._push({ type: 'voice', path: path, duration: secs, lastMsg: '[语音]' });
    });
  },

  /* ============ 语音转文字确认 ============ */
  onTextConfirmInput(e) { this.setData({ textConfirmValue: e.detail.value }); },
  cancelTextConfirm() { this.setData({ showTextConfirm: false, textConfirmValue: '' }); },
  confirmTextSend() {
    var v = (this.data.textConfirmValue || '').trim();
    if (!v) { wx.showToast({ title: '请输入文字', icon: 'none' }); return; }
    this._push({ type: 'text', text: v, lastMsg: v });
    this.setData({ showTextConfirm: false, textConfirmValue: '' });
  },
});
