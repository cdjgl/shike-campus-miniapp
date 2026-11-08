Page({
  data: {
    // 跑腿服务类型
    categories: [
      { key: 'buy', name: '代买', desc: '帮买饭/饮料/日用品', icon: 'shop-o', color: '#367BFF', basePrice: 3 },
      { key: 'pickup', name: '代取', desc: '帮取快递/文件/物品', icon: 'logistics', color: '#5cb85c', basePrice: 5 },
      { key: 'queue', name: '代排队', desc: '食堂/打印店排队', icon: 'friends-o', color: '#f0ad4e', basePrice: 2 },
      { key: 'delivery', name: '送物上门', desc: '物品送达指定位置', icon: 'guide-o', color: '#e67e22', basePrice: 4 },
      { key: 'other', name: '其他', desc: '其他跑腿需求', icon: 'info-o', color: '#8e44ad', basePrice: 5 },
    ],
    selectedCategory: '',

    // 任务详情
    taskTitle: '',
    taskDetail: '',

    // 起止地点
    startAddr: '',
    endAddr: '',
    // 常用地点
    commonPlaces: [
      '南校区1栋', '南校区2栋', '南校区3栋',
      '北校区食堂', '北校区图书馆', '北校区8栋',
      '东校区超市', '东校区操场',
      '南校区菜鸟驿站', '北校区菜鸟驿站',
      '教学楼A座', '教学楼B座', '行政楼',
    ],

    // 预约时间
    timeText: '请选择',
    timeValue: '',
    timeRange: [[], []],

    // 打赏
    tips: [
      { label: '不打赏', value: 0 },
      { label: '¥1', value: 1 },
      { label: '¥2', value: 2 },
      { label: '¥5', value: 5 },
      { label: '¥10', value: 10 },
    ],
    tipAmount: 0,

    // 备注
    remark: '',

    // 价格计算
    basePrice: 0,
    totalPrice: 0,

    // 支付弹窗
    showPayModal: false,
    latestOrderNo: '',
  },

  onLoad() {
    this.initTimeRange();
  },

  initTimeRange() {
    const hours = [];
    const mins = [];
    for (let h = 7; h <= 23; h++) hours.push(String(h).padStart(2, '0') + '点');
    for (let m = 0; m < 60; m += 30) mins.push(String(m).padStart(2, '0') + '分');
    this.setData({ timeRange: [hours, mins] });
  },

  /* ========== 选择服务类型 ========== */
  selectCategory(e) {
    const key = e.currentTarget.dataset.key;
    if (this.data.selectedCategory === key) return;
    const cat = this.data.categories.find(c => c.key === key);
    this.setData({
      selectedCategory: key,
      basePrice: cat ? cat.basePrice : 0,
    });
    this.calcPrice();
  },

  /* ========== 输入变更 ========== */
  onTitleInput(e) { this.setData({ taskTitle: e.detail.value }); },
  onDetailInput(e) { this.setData({ taskDetail: e.detail.value }); },

  onStartPlaceChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ startAddr: this.data.commonPlaces[idx] });
  },

  onEndPlaceChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ endAddr: this.data.commonPlaces[idx] });
  },

  onStartTimeChange(e) {
    const val = e.detail.value;
    const h = this.data.timeRange[0][val[0]].replace('点', '');
    const m = this.data.timeRange[1][val[1]].replace('分', '');
    const text = h + ':' + m;
    this.setData({ timeText: text, timeValue: text });
  },

  onRemarkInput(e) { this.setData({ remark: e.detail.value }); },

  selectTip(e) {
    this.setData({ tipAmount: parseInt(e.currentTarget.dataset.value) });
    this.calcPrice();
  },

  /* ========== 价格计算 ========== */
  calcPrice() {
    const total = (this.data.basePrice || 0) + (this.data.tipAmount || 0);
    this.setData({
      totalPrice: total.toFixed(2),
    });
  },

  /* ========== 提交订单 ========== */
  submitOrder() {
    const app = getApp();

    if (!this.data.selectedCategory) {
      wx.showToast({ title: '请选择跑腿类型', icon: 'none' });
      return;
    }
    if (!this.data.taskTitle.trim()) {
      wx.showToast({ title: '请填写任务标题', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认发布跑腿单',
      content: `合计金额：¥${this.data.totalPrice}\n支付方式：校园卡（模拟）`,
      confirmText: '确认发布',
      success: (res) => {
        if (!res.confirm) return;

        const now = new Date();
        const no = 'PL' + now.getFullYear() +
          String(now.getMonth() + 1).padStart(2, '0') +
          String(now.getDate()).padStart(2, '0') +
          String(now.getHours()).padStart(2, '0') +
          String(now.getMinutes()).padStart(2, '0') +
          String(now.getSeconds()).padStart(2, '0');

        const cat = this.data.categories.find(c => c.key === this.data.selectedCategory);

        const newOrder = {
          id: no,
          orderNo: no,
          categoryKey: this.data.selectedCategory,
          categoryName: cat ? cat.name : '其他',
          categoryColor: cat ? cat.color : '#999',
          categoryIcon: cat ? cat.icon : 'info-o',
          taskTitle: this.data.taskTitle.trim(),
          taskDetail: this.data.taskDetail.trim(),
          startAddr: this.data.startAddr,
          endAddr: this.data.endAddr,
          expectTime: this.data.timeText !== '请选择' ? this.data.timeText : '',
          tipAmount: this.data.tipAmount,
          basePrice: this.data.basePrice,
          price: this.data.totalPrice,
          remark: this.data.remark || '',
          createTime: Date.now(),
          createTimeStr:
            now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0'),
          status: 0,  // 0=待接单 1=进行中 2=已完成 3=已取消
          acceptor: '',
        };

        if (!app.globalData.errandOrders) app.globalData.errandOrders = [];
        app.globalData.errandOrders.unshift(newOrder);

        // 同步写入本地存储
        var localList = wx.getStorageSync('errand_orders') || [];
        localList.unshift(newOrder);
        wx.setStorageSync('errand_orders', localList);

        this.setData({
          showPayModal: true,
          latestOrderNo: no,
        });
      },
    });
  },

  backToList() {
    wx.navigateBack();
  },

  continueOrder() {
    this.setData({
      selectedCategory: '',
      taskTitle: '',
      taskDetail: '',
      startAddr: '',
      endAddr: '',
      timeText: '请选择',
      remark: '',
      tipAmount: 0,
      basePrice: 0,
      totalPrice: '0.00',
      showPayModal: false,
      latestOrderNo: '',
    });
  },
});
