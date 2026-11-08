Page({
  data: {
    // 当前tab: 0=失物列表 1=招领列表 2=发布信息
    activeTab: 0,

    // 列表筛选
    typeFilter: '\u5168\u90e8',
    typeOptions: ['\u5168\u90e8', '\u8bc1\u4ef6\u7c7b', '\u7535\u5b50\u7c7b', '\u751f\u6d3b\u7c7b', '\u4e66\u7c4d\u7c7b', '\u670d\u88c5\u7c7b', '\u94a5\u5319\u7c7b', '\u5176\u4ed6'],

    // 搜索关键词
    searchKey: '',

    // 筛选后的列表
    filteredItems: [],

    // 原始数据源
    lostItems: [],
    foundItems: [],

    // 发布表单
    publishType: 'lost',
    itemName: '',
    itemLocation: '',
    itemType: '',
    itemDescription: '',
    fileList: [],
    contactWay: '',

    // 评论弹窗
    showComment: false,
    currentItem: null,
    currentComments: [],
    commentText: '',
    commentImages: [],
    showEmoji: false,

    // 详情弹窗
    showDetail: false,

    // 物品类型选择器
    showTypePicker: false,

    // 评论左滑删除
    cmtSwipeIndex: -1,
    cmtSwipeX: 0,
    cmtTouchStartX: 0,
    cmtStartSwipeX: 0,
  },

  onLoad() {
    this.loadMockItems();
  },

  /* ========== 加载模拟数据 ========== */
  loadMockItems() {
    var lostItems = [
      {
        id: 1, type: 'lost', name: '\u6821\u56ed\u5361', location: '\u56fe\u4e66\u9986\u4e8c\u697c\u9605\u89c8\u5ba4',
        itemType: '\u8bc1\u4ef6\u7c7b', images: [],
        description: '\u84dd\u8272\u6821\u56ed\u5361\uff0c\u59d3\u540d\u5f20\u4e09\uff0c\u5b66\u53f72024001\uff0c\u8bf7\u6361\u5230\u7684\u540c\u5b66\u8054\u7cfb\u6211\uff0c\u6025\uff01',
        time: '2026-05-29 14:30', publisher: '\u5f20\u4e09', commentCount: 2,
        comments: [
          { user: '\u597d\u5fc3\u4eba\u674e\u56db', text: '\u6211\u5728\u56fe\u4e66\u9986\u95e8\u53e3\u6361\u5230\u4e00\u5f20\u6821\u56ed\u5361\uff0c\u4f60\u770b\u770b\u662f\u4e0d\u662f\u8fd9\u5f20\uff1f', time: '2026-05-29 15:10' },
          { user: '\u5f20\u4e09', text: '\u662f\u7684\uff01\u4f60\u5728\u54ea\u91cc\u6211\u8fc7\u53bb\u627e\u4f60', time: '2026-05-29 15:15' }
        ]
      },
      {
        id: 2, type: 'lost', name: 'AirPods Pro', location: '9\u53f7\u6559\u5b66\u697c301\u6559\u5ba4',
        itemType: '\u7535\u5b50\u7c7b', images: [],
        description: '\u767d\u8272AirPods Pro\uff0c\u88c5\u5728\u9ed1\u8272\u4fdd\u62a4\u5957\u91cc\uff0c\u8033\u673a\u76d2\u4e0a\u6709\u8d34\u7eb8',
        time: '2026-05-28 10:15', publisher: '\u738b\u4e94', commentCount: 0, comments: []
      },
      {
        id: 3, type: 'lost', name: '\u94a5\u5319\u4e32', location: '\u7bee\u7403\u573a\u65c1\u8fb9',
        itemType: '\u94a5\u5319\u7c7b', images: [],
        description: '\u4e00\u4e32\u94a5\u5319\uff0c\u6709\u84dd\u8272\u5c0f\u718a\u6302\u4ef6\uff0c\u5927\u6982\u4e22\u4e863\u628a\u94a5\u5319',
        time: '2026-05-27 16:40', publisher: '\u8d75\u516d', commentCount: 1,
        comments: [{ user: '\u4fdd\u5b89\u5927\u53d4', text: '\u6709\u540c\u5b66\u6361\u5230\u4e00\u4e32\u94a5\u5319\u4ea4\u5230\u4fdd\u536b\u5904\u4e86\uff0c\u53ef\u4ee5\u53bb\u770b\u770b', time: '2026-05-28 09:00' }]
      },
      {
        id: 4, type: 'lost', name: '\u9ad8\u7b49\u6570\u5b66\u8bfe\u672c', location: '1\u53f7\u98df\u5802\u4e1c\u533a',
        itemType: '\u4e66\u7c4d\u7c7b', images: [],
        description: '\u540c\u6d4e\u5927\u5b66\u51fa\u7248\u793e\u7b2c\u4e03\u7248\u9ad8\u7b49\u6570\u5b66\uff0c\u4e66\u76ae\u6709\u70b9\u7834\uff0c\u91cc\u9762\u6709\u8bfe\u5802\u7b14\u8bb0',
        time: '2026-05-26 12:00', publisher: '\u5b59\u4e03', commentCount: 0, comments: []
      }
    ];

    var foundItems = [
      {
        id: 5, type: 'found', name: '\u9ed1\u8272\u94b1\u5305', location: '7\u53f7\u6559\u5b66\u697c\u5927\u5385',
        itemType: '\u751f\u6d3b\u7c7b', images: [],
        description: '\u9ed1\u8272\u76ae\u8d28\u94b1\u5305\uff0c\u91cc\u9762\u6709\u5c11\u91cf\u73b0\u91d1\u548c\u4e00\u5f20\u996d\u5361\uff0c\u8bf7\u5931\u4e3b\u5e26\u597d\u8bc1\u4ef6\u8054\u7cfb\u6211\u9886\u53d6',
        time: '2026-05-30 08:20', publisher: '\u597d\u5fc3\u540c\u5b66A', commentCount: 2,
        comments: [
          { user: '\u5931\u4e3b\u5c0f\u660e', text: '\u662f\u6211\u7684\u94b1\u5305\uff01\u6211\u8054\u7cfb\u4f60\u4e86', time: '2026-05-30 09:00' },
          { user: '\u597d\u5fc3\u540c\u5b66A', text: '\u597d\u7684\uff0c\u4e2d\u534812\u70b9\u56fe\u4e66\u9986\u95e8\u53e3\u89c1', time: '2026-05-30 09:05' }
        ]
      },
      {
        id: 6, type: 'found', name: '\u6c34\u676f', location: '5\u53f7\u6559\u5b66\u697c303\u6559\u5ba4',
        itemType: '\u751f\u6d3b\u7c7b', images: [],
        description: '\u4e0d\u9508\u94a2\u4fdd\u6e29\u676f\uff0c400ml\uff0c\u94f6\u8272\u676f\u8eab\uff0c\u653e\u5728\u6559\u5ba4\u6700\u540e\u4e00\u6392\u6ca1\u62ff\u8d70',
        time: '2026-05-28 18:00', publisher: '\u503c\u65e5\u540c\u5b66B', commentCount: 0, comments: []
      },
      {
        id: 7, type: 'found', name: 'U\u76d8', location: '\u8ba1\u7b97\u673a\u5b66\u9662\u673a\u623f',
        itemType: '\u7535\u5b50\u7c7b', images: [],
        description: '\u91d1\u58eb\u987f32G\u84dd\u8272U\u76d8\uff0c\u63d2\u5728\u673a\u623f3\u53f7\u673a\u4e0a\u5fd8\u4e86\u62d4',
        time: '2026-05-27 11:30', publisher: '\u673a\u623f\u7ba1\u7406\u5458', commentCount: 1,
        comments: [{ user: '\u5931\u4e3b', text: '\u662f\u6211\u7684U\u76d8\uff01\u91cc\u9762\u662f\u6211\u8bfe\u7a0b\u8bbe\u8ba1\u7684\u4e1c\u897f', time: '2026-05-27 14:00' }]
      }
    ];

    var lostStorage = wx.getStorageSync('lost_items') || [];
    var foundStorage = wx.getStorageSync('found_items') || [];
    // 加载所有物品的评论/浏览量持久化更新
    var itemUpdates = wx.getStorageSync('lost_found_item_updates') || {};

    function applyUpdates(arr) {
      var result = [];
      for (var i = 0; i < arr.length; i++) {
        var itm = arr[i];
        var upd = itemUpdates[itm.id] || {};
        if (upd.comments !== undefined) {
          result.push({
            ...itm,
            commentCount: upd.commentCount !== undefined ? upd.commentCount : itm.commentCount,
            comments: upd.comments !== undefined ? upd.comments : itm.comments,
          });
        } else {
          result.push(itm);
        }
      }
      return result;
    }

    // 合并 mock + 用户发布（用户发布的 id > 1000）
    var rawLost = lostStorage.slice();
    for (var b = 0; b < lostItems.length; b++) { rawLost.push(lostItems[b]); }
    var rawFound = foundStorage.slice();
    for (var d = 0; d < foundItems.length; d++) { rawFound.push(foundItems[d]); }

    this.setData({ lostItems: applyUpdates(rawLost), foundItems: applyUpdates(rawFound) });
    this.updateFilteredList();
  },

  /* ========== 核心方法：更新筛选结果 ========== */
  updateFilteredList() {
    var isLost = this.data.activeTab === 0;
    var items = isLost ? this.data.lostItems : this.data.foundItems;
    var filtered = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (this.data.typeFilter !== '\u5168\u90e8' && item.itemType !== this.data.typeFilter) {
        continue;
      }
      if (this.data.searchKey.trim()) {
        var kw = this.data.searchKey.trim().toLowerCase();
        if (item.name.toLowerCase().indexOf(kw) === -1 &&
            item.location.toLowerCase().indexOf(kw) === -1 &&
            item.description.toLowerCase().indexOf(kw) === -1) {
          continue;
        }
      }
      filtered.push(item);
    }
    filtered.sort(function(a, b) {
      return new Date(b.time.replace(/-/g, '/')) - new Date(a.time.replace(/-/g, '/'));
    });
    this.setData({ filteredItems: filtered });
  },

  /* ========== Tab切换 ========== */
  onTabChange(e) {
    var index = Number(e.currentTarget.dataset.index);
    this.setData({ activeTab: index });
    if (index !== 2) {
      this.updateFilteredList();
    }
  },

  /* ========== 筛选 ========== */
  onTypeFilter(e) {
    var type = e.currentTarget.dataset.type;
    this.setData({ typeFilter: type });
    this.updateFilteredList();
  },

  /* ========== 搜索 ========== */
  onSearchInput(e) {
    this.setData({ searchKey: e.detail.value });
    this.updateFilteredList();
  },

  /* ========== 点击卡片查看详情 ========== */
  onItemClick(e) {
    var item = e.currentTarget.dataset.item;
    var comments = [];
    if (item.comments) {
      for (var i = 0; i < item.comments.length; i++) {
        comments.push(item.comments[i]);
      }
    }
    this.setData({
      showDetail: true,
      currentItem: item,
      currentComments: comments,
    });
  },

  onCloseDetail() {
    this.setData({ showDetail: false, currentItem: null, currentComments: [] });
  },

  /* ========== 图片预览（全屏放大） ========== */
  onPreviewImage(e) {
    var url = e.currentTarget.dataset.url;
    var urls = e.currentTarget.dataset.urls || [url];
    wx.previewImage({ current: url, urls: urls });
  },

  /* ========== 删除物品（仅自己发布的能删除） ========== */
  onDeleteItem(e) {
    var item = e.currentTarget.dataset.item;
    if (item.publisher !== '\u6211') {
      wx.showToast({ title: '\u53ea\u80fd\u5220\u9664\u81ea\u5df1\u53d1\u5e03\u7684\u4fe1\u606f', icon: 'none' });
      return;
    }
    var that = this;
    wx.showModal({
      title: '\u786e\u8ba4\u5220\u9664',
      content: '\u786e\u5b9a\u8981\u5220\u9664\u201c' + item.name + '\u201d\u8fd9\u6761\u4fe1\u606f\u5417\uff1f',
      confirmColor: '#e74c3c',
      success: function(res) {
        if (res.confirm) {
          if (item.type === 'lost') {
            var newList = [];
            for (var i = 0; i < that.data.lostItems.length; i++) {
              if (that.data.lostItems[i].id !== item.id) { newList.push(that.data.lostItems[i]); }
            }
            that.setData({ lostItems: newList });
            var toSave = [];
            for (var j = 0; j < newList.length; j++) {
              if (newList[j].id > 1000) { toSave.push(newList[j]); }
            }
            wx.setStorageSync('lost_items', toSave);
          } else {
            var newList = [];
            for (var i2 = 0; i2 < that.data.foundItems.length; i2++) {
              if (that.data.foundItems[i2].id !== item.id) { newList.push(that.data.foundItems[i2]); }
            }
            that.setData({ foundItems: newList });
            var toSave = [];
            for (var j2 = 0; j2 < newList.length; j2++) {
              if (newList[j2].id > 1000) { toSave.push(newList[j2]); }
            }
            wx.setStorageSync('found_items', toSave);
          }
          // 清理该物品的持久化评论
          var updates = wx.getStorageSync('lost_found_item_updates') || {};
          delete updates[item.id];
          wx.setStorageSync('lost_found_item_updates', updates);
          that.updateFilteredList();
          that.setData({ showDetail: false, showComment: false });
          wx.showToast({ title: '\u5df2\u5220\u9664', icon: 'success' });
        }
      }
    });
  },

  /* ========== 发布类型切换 ========== */
  switchPublishType() {
    var newType = this.data.publishType === 'lost' ? 'found' : 'lost';
    this.setData({ publishType: newType });
  },

  /* ========== 物品类型选择 ========== */
  openTypePicker() {
    this.setData({ showTypePicker: true });
  },

  onSelectItemType(e) {
    var type = e.currentTarget.dataset.type;
    this.setData({ itemType: type, showTypePicker: false });
  },

  closeTypePicker() {
    this.setData({ showTypePicker: false });
  },

  /* ========== 图片上传 ========== */
  afterRead(e) {
    var file = e.detail.file || e.detail;
    var newList = [];
    for (var i = 0; i < this.data.fileList.length; i++) { newList.push(this.data.fileList[i]); }
    newList.push({
      url: file.url || file.path || file.tempFilePath,
      name: file.name || 'image',
      type: file.type || 'image',
      size: file.size
    });
    this.setData({ fileList: newList });
  },

  onDelete(e) {
    var idx = e.detail.index;
    var list = [];
    for (var i = 0; i < this.data.fileList.length; i++) {
      if (i !== idx) { list.push(this.data.fileList[i]); }
    }
    this.setData({ fileList: list });
  },

  /* ========== 提交发布 ========== */
  onSubmit() {
    var d = this.data;

    if (!d.itemName || !d.itemName.trim()) {
      wx.showToast({ title: '\u8bf7\u8f93\u5165\u7269\u54c1\u540d\u79f0', icon: 'none' });
      return;
    }
    if (!d.itemLocation || !d.itemLocation.trim()) {
      wx.showToast({ title: '\u8bf7\u8f93\u5165\u5730\u70b9', icon: 'none' });
      return;
    }
    if (!d.itemType) {
      wx.showToast({ title: '\u8bf7\u9009\u62e9\u7269\u54c1\u7c7b\u578b', icon: 'none' });
      return;
    }
    if (!d.itemDescription || !d.itemDescription.trim()) {
      wx.showToast({ title: '\u8bf7\u8f93\u5165\u63cf\u8ff0\u4fe1\u606f', icon: 'none' });
      return;
    }

    var now = new Date();
    var y = now.getFullYear();
    var m = ('0' + (now.getMonth() + 1)).slice(-2);
    var day = ('0' + now.getDate()).slice(-2);
    var h = ('0' + now.getHours()).slice(-2);
    var min = ('0' + now.getMinutes()).slice(-2);
    var timeStr = y + '-' + m + '-' + day + ' ' + h + ':' + min;

    var imgUrls = [];
    for (var k = 0; k < d.fileList.length; k++) {
      imgUrls.push(d.fileList[k].url || d.fileList[k].path || d.fileList[k].tempFilePath);
    }

    var newItem = {
      id: Date.now(),
      type: d.publishType,
      name: d.itemName.trim(),
      location: d.itemLocation.trim(),
      itemType: d.itemType,
      images: imgUrls,
      description: d.itemDescription.trim(),
      contactWay: d.contactWay ? d.contactWay.trim() : '',
      time: timeStr,
      publisher: '\u6211',
      commentCount: 0,
      comments: []
    };

    if (d.publishType === 'lost') {
      var newLost = [newItem];
      for (var i = 0; i < this.data.lostItems.length; i++) { newLost.push(this.data.lostItems[i]); }
      this.setData({ lostItems: newLost });
      var toSave = [];
      for (var j = 0; j < newLost.length; j++) {
        if (newLost[j].id > 1000) { toSave.push(newLost[j]); }
      }
      wx.setStorageSync('lost_items', toSave);
    } else {
      var newFound = [newItem];
      for (var i3 = 0; i3 < this.data.foundItems.length; i3++) { newFound.push(this.data.foundItems[i3]); }
      this.setData({ foundItems: newFound });
      var toSave = [];
      for (var j3 = 0; j3 < newFound.length; j3++) {
        if (newFound[j3].id > 1000) { toSave.push(newFound[j3]); }
      }
      wx.setStorageSync('found_items', toSave);
    }

    var targetTab = d.publishType === 'lost' ? 0 : 1;

    this.setData({
      activeTab: targetTab,
      itemName: '',
      itemLocation: '',
      itemType: '',
      itemDescription: '',
      fileList: [],
      contactWay: '',
      showTypePicker: false
    });

    this.updateFilteredList();
    wx.showToast({ title: '\u53d1\u5e03\u6210\u529f\uff01', icon: 'success' });
  },

  /* ========== 清空表单 ========== */
  onClear() {
    this.setData({
      itemName: '', itemLocation: '', itemType: '',
      itemDescription: '', fileList: [], contactWay: ''
    });
  },

  /* ========== 评论 ========== */
  onShowComment(e) {
    var item = e.currentTarget.dataset.item;
    var comments = [];
    if (item.comments) {
      for (var i = 0; i < item.comments.length; i++) { comments.push(item.comments[i]); }
    }
    this.setData({
      showComment: true,
      currentItem: item,
      currentComments: comments,
      commentText: '',
      commentImages: [],
      showEmoji: false
    });
  },

  onCloseComment() {
    this.setData({
      showComment: false, currentItem: null, currentComments: [],
      commentText: '', commentImages: [], showEmoji: false
    });
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  /* === 评论区图片上传 === */
  onCommentAfterRead(e) {
    var file = e.detail.file || e.detail;
    var url = file.url || file.path || file.tempFilePath;
    var newImgs = [];
    for (var i = 0; i < this.data.commentImages.length; i++) { newImgs.push(this.data.commentImages[i]); }
    newImgs.push(url);
    this.setData({ commentImages: newImgs });
  },

  onCommentImgDelete(e) {
    var idx = e.currentTarget.dataset.index;
    var list = [];
    for (var i = 0; i < this.data.commentImages.length; i++) {
      if (i !== idx) { list.push(this.data.commentImages[i]); }
    }
    this.setData({ commentImages: list });
  },

  /* === 表情选择器 === */
  toggleEmoji() {
    this.setData({ showEmoji: !this.data.showEmoji });
  },

  onEmojiTap(e) {
    var emoji = e.currentTarget.dataset.emoji;
    this.setData({ commentText: this.data.commentText + emoji, showEmoji: false });
  },

  /* === 提交评论（支持文字+图片） === */
  onSubmitComment() {
    var text = this.data.commentText.trim();
    var imgs = this.data.commentImages;
    if (!text && imgs.length === 0) {
      wx.showToast({ title: '\u8bf7\u8f93\u5165\u8bc4\u8bba\u6216\u4e0a\u4f20\u56fe\u7247', icon: 'none' });
      return;
    }

    var now = new Date();
    var y = now.getFullYear();
    var m = ('0' + (now.getMonth() + 1)).slice(-2);
    var day = ('0' + now.getDate()).slice(-2);
    var h = ('0' + now.getHours()).slice(-2);
    var min = ('0' + now.getMinutes()).slice(-2);

    var newComment = {
      user: '\u6211',
      text: text,
      images: [],
      time: y + '-' + m + '-' + day + ' ' + h + ':' + min
    };
    for (var i = 0; i < imgs.length; i++) { newComment.images.push(imgs[i]); }

    var newComments = [];
    for (var a = 0; a < this.data.currentComments.length; a++) {
      newComments.push(this.data.currentComments[a]);
    }
    newComments.push(newComment);

    var ci = {
      id: this.data.currentItem.id,
      type: this.data.currentItem.type,
      name: this.data.currentItem.name,
      location: this.data.currentItem.location,
      itemType: this.data.currentItem.itemType,
      images: this.data.currentItem.images,
      description: this.data.currentItem.description,
      time: this.data.currentItem.time,
      publisher: this.data.currentItem.publisher,
      contactWay: this.data.currentItem.contactWay,
      commentCount: newComments.length,
      comments: newComments
    };

    if (ci.type === 'lost') {
      var newLost = [];
      for (var j = 0; j < this.data.lostItems.length; j++) {
        if (this.data.lostItems[j].id === ci.id) { newLost.push(ci); }
        else { newLost.push(this.data.lostItems[j]); }
      }
      this.setData({ lostItems: newLost, currentItem: ci, currentComments: newComments, commentText: '', commentImages: [], showEmoji: false });
    } else {
      var newFound = [];
      for (var k = 0; k < this.data.foundItems.length; k++) {
        if (this.data.foundItems[k].id === ci.id) { newFound.push(ci); }
        else { newFound.push(this.data.foundItems[k]); }
      }
      this.setData({ foundItems: newFound, currentItem: ci, currentComments: newComments, commentText: '', commentImages: [], showEmoji: false });
    }

    this.updateFilteredList();
    // 持久化评论（含 mock 物品的评论）
    this._syncItemToList(ci);
    wx.showToast({ title: '\u8bc4\u8bba\u6210\u529f', icon: 'success' });
  },

  /* === 评论图片预览 === */
  onCommentPreviewImage(e) {
    var url = e.currentTarget.dataset.url;
    var urls = e.currentTarget.dataset.urls || [url];
    wx.previewImage({ current: url, urls: urls });
  },

  /* ========== 私信 → 跳转聊天页 ========== */
  onChat(e) {
    var item = e.currentTarget.dataset.item;
    var chatUser = item.publisher;
    var chatItem = item.name;
    // 不要私信自己
    if (chatUser === '\u6211') {
      wx.showToast({ title: '\u4e0d\u80fd\u7ed9\u81ea\u5df1\u53d1\u79c1\u4fe1\u54e6~', icon: 'none' });
      return;
    }
    // message 是 tabBar 页面，不能用 navigateTo，改用全局数据 + switchTab
    var app = getApp();
    app.globalData._pendingChat = { chatUser: chatUser, chatItem: chatItem };
    wx.switchTab({ url: '/pages/message/message' });
  },

  /* ========== 输入绑定 ========== */
  onInputChange(e) {
    var field = e.currentTarget.dataset.field;
    var obj = {};
    obj[field] = e.detail.value;
    this.setData(obj);
  },

  /* ========== 评论左滑删除 ========== */
  onTouchStartCmt(e) {
    this.setData({
      cmtTouchStartX: e.touches[0].clientX,
      cmtStartSwipeX: this.data.cmtSwipeX || 0,
    });
  },

  onTouchMoveCmt(e) {
    var idx = e.currentTarget.dataset.index;
    var dx = e.touches[0].clientX - this.data.cmtTouchStartX;
    var newX = this.data.cmtStartSwipeX + dx;
    // rpx 单位：删除按钮宽 140rpx，以 rpx 值限制范围
    var x = Math.max(-140, Math.min(0, newX));
    this.setData({ cmtSwipeIndex: idx, cmtSwipeX: Math.round(x) });
  },

  onTouchEndCmt() {
    if (this.data.cmtSwipeX < -70) {
      this.setData({ cmtSwipeX: -140 });
    } else {
      this.setData({ cmtSwipeIndex: -1, cmtSwipeX: 0 });
    }
  },

  onDeleteComment(e) {
    var idx = e.currentTarget.dataset.idx;
    var cmt = this.data.currentComments[idx];
    // 只能删自己的评论
    if (cmt.user !== '我') {
      wx.showToast({ title: '只能删除自己的评论', icon: 'none' });
      this.setData({ cmtSwipeIndex: -1, cmtSwipeX: 0 });
      return;
    }
    var that = this;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      confirmColor: '#e74c3c',
      success: function(res) {
        if (res.confirm) {
          var newComments = [];
          for (var i = 0; i < that.data.currentComments.length; i++) {
            if (i !== idx) { newComments.push(that.data.currentComments[i]); }
          }
          var ci = that.data.currentItem;
          ci.comments = newComments;
          ci.commentCount = newComments.length;

          that.setData({
            currentItem: ci,
            currentComments: newComments,
            cmtSwipeIndex: -1,
            cmtSwipeX: 0,
          });

          // 同步回列表
          that._syncItemToList(ci);

          wx.showToast({ title: '已删除', icon: 'success' });
        } else {
          that.setData({ cmtSwipeIndex: -1, cmtSwipeX: 0 });
        }
      },
    });
  },

  /** 同步 item 到对应列表并持久化 */
  _syncItemToList(item) {
    var isLost = item.type === 'lost';
    var list = isLost ? this.data.lostItems : this.data.foundItems;
    var newList = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === item.id) { newList.push(item); }
      else { newList.push(list[i]); }
    }

    if (isLost) {
      this.setData({ lostItems: newList });
    } else {
      this.setData({ foundItems: newList });
    }

    // 持久化用户发布的内容（id > 1000）
    var toSave = [];
    for (var j = 0; j < newList.length; j++) {
      if (newList[j].id > 1000) { toSave.push(newList[j]); }
    }
    wx.setStorageSync(isLost ? 'lost_items' : 'found_items', toSave);

    // 持久化所有物品的评论更新（含 mock 数据）
    var updates = wx.getStorageSync('lost_found_item_updates') || {};
    updates[item.id] = {
      commentCount: item.commentCount,
      comments: item.comments || [],
    };
    wx.setStorageSync('lost_found_item_updates', updates);

    this.updateFilteredList();
  },
});
