Page({
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    chatTarget: { name: '' },
    isBlocked: false,
    isPinned: false,
  },

  onLoad(options) {
    var sysInfo = wx.getSystemInfoSync();
    var name = decodeURIComponent(options.chatUser || '');
    var blockedList = wx.getStorageSync('chat_blocked_list') || [];
    var pinnedList = wx.getStorageSync('chat_pinned_list') || [];
    var isBlocked = false;
    for (var i = 0; i < blockedList.length; i++) { if (blockedList[i] === name) { isBlocked = true; break; } }
    var isPinned = false;
    for (var j = 0; j < pinnedList.length; j++) { if (pinnedList[j] === name) { isPinned = true; break; } }
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20,
      chatTarget: { name: name },
      isBlocked: isBlocked,
      isPinned: isPinned,
    });
  },

  goBack() {
    wx.navigateBack();
  },

  /** 清空聊天记录 */
  onClearChatHistory() {
    var that = this;
    wx.showModal({
      title: '清空聊天记录',
      content: '确定要清空与 ' + that.data.chatTarget.name + ' 的聊天记录吗？此操作无法撤销。',
      confirmColor: '#e74c3c',
      success: function(res) {
        if (res.confirm) {
          var name = that.data.chatTarget.name;
          var key = 'chat_' + name;
          wx.removeStorageSync(key);
          // 清除列表中的预览和未读数
          var list = wx.getStorageSync('chat_list_meta') || [];
          for (var i = 0; i < list.length; i++) {
            if (list[i].name === name) { list[i].preview = ''; list[i].time = ''; list[i].unread = 0; }
          }
          wx.setStorageSync('chat_list_meta', list);
          // 通知消息页刷新聊天记录
          var app = getApp();
          app.globalData._chatCleared = name;
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  /** 拉黑 / 取消拉黑 */
  onToggleBlock() {
    var name = this.data.chatTarget.name;
    var blockedList = wx.getStorageSync('chat_blocked_list') || [];
    if (this.data.isBlocked) {
      var newList = [];
      for (var i = 0; i < blockedList.length; i++) { if (blockedList[i] !== name) newList.push(blockedList[i]); }
      wx.setStorageSync('chat_blocked_list', newList);
      this.setData({ isBlocked: false });
      wx.showToast({ title: '已取消拉黑', icon: 'success' });
    } else {
      var that = this;
      wx.showModal({
        title: '拉黑用户',
        content: '拉黑后将收不到该用户的消息，确定吗？',
        confirmColor: '#e74c3c',
        success: function(res) {
          if (res.confirm) {
            blockedList.push(name);
            wx.setStorageSync('chat_blocked_list', blockedList);
            that.setData({ isBlocked: true });
            wx.showToast({ title: '已拉黑', icon: 'none' });
          }
        }
      });
    }
  },

  /** 置顶 / 取消置顶 */
  onTogglePin() {
    var name = this.data.chatTarget.name;
    var pinnedList = wx.getStorageSync('chat_pinned_list') || [];
    if (this.data.isPinned) {
      var newList = [];
      for (var j = 0; j < pinnedList.length; j++) { if (pinnedList[j] !== name) newList.push(pinnedList[j]); }
      wx.setStorageSync('chat_pinned_list', newList);
      this.setData({ isPinned: false });
      wx.showToast({ title: '已取消置顶', icon: 'success' });
    } else {
      pinnedList.push(name);
      wx.setStorageSync('chat_pinned_list', pinnedList);
      this.setData({ isPinned: true });
      wx.showToast({ title: '已置顶', icon: 'success' });
    }
  },
});
