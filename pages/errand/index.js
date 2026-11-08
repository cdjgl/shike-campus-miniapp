const app = getApp();

Page({
  data: {
    // 功能入口
    services: [
      { key: 'order', name: '发布任务', icon: 'edit', bg: '#5cb85c' },
      { key: 'apply', name: '接单大厅', icon: 'friends-o', bg: '#367BFF' },
    ],

    tabs: [
      { key: 'all', label: '全部', badge: 0 },
      { key: 'my', label: '我的订单', badge: 0 },
      { key: 'received', label: '我的接单', badge: 0 },
      { key: 'waiting', label: '待接单', badge: 0 },
    ],
    activeTab: 'all',

    orders: [],
    filteredOrders: [],
    emptyText: '暂无订单',

    touchStartX: 0,
    touchCurrentX: 0,
    swipingId: null,

    showAcceptModal: false,
    acceptTarget: null,

    showDetailModal: false,
    detailOrder: null,

    penaltyInfo: null,
  },

  PENALTY_THRESHOLD: 3,
  PENALTY_MINUTES: 30,

  onLoad() {
    this.loadOrders();
    this.checkPenalty();
  },

  onShow() {
    this.loadOrders();
    this.checkPenalty();
  },

  /* ========== 数据加载 ========== */
  loadOrders() {
    const mySubmitted = app.globalData.errandOrders || [];
    const acceptedIds = app.globalData.acceptedErrandOrders || [];
    const mockOrders = this.getMockOrders();

    const myOrders = mySubmitted.map(o => ({
      ...o,
      owner: 'me',
      acceptor: o.acceptor || '',
      statusClass: this.getStatusClass(o.status),
      statusLabel: this.getStatusLabel(o.status),
    }));

    const otherOrders = mockOrders.map(o => {
      const accepted = acceptedIds.includes(o.id);
      return {
        ...o,
        owner: 'other',
        acceptor: accepted ? 'me' : (o.acceptor || ''),
        status: accepted ? (o.status === 'waiting' ? 'accepted' : o.status) : o.status,
        statusClass: this.getStatusClass(accepted && o.status === 'waiting' ? 'accepted' : o.status),
        statusLabel: this.getStatusLabel(accepted && o.status === 'waiting' ? 'accepted' : o.status),
      };
    });

    const allOrders = [...myOrders, ...otherOrders];
    this.setData({ orders: allOrders });
    this.updateBadges(allOrders);
    this.filterOrders();
  },

  getMockOrders() {
    return [
      {
        id: 'p1',
        orderNo: 'PL20260529001',
        categoryKey: 'buy',
        categoryName: '代买',
        categoryColor: '#367BFF',
        categoryIcon: 'shop-o',
        taskTitle: '帮忙带份黄焖鸡米饭，加个蛋',
        taskDetail: '南校区食堂二楼黄焖鸡窗口，要微辣，多加汤',
        startAddr: '南校区食堂',
        endAddr: '南校区5栋302',
        expectTime: '12:00',
        price: '5.00',
        tipAmount: 2,
        basePrice: 3,
        createTime: '2026-05-29 11:20',
        status: 'waiting',
        remark: '',
      },
      {
        id: 'p2',
        orderNo: 'PL20260528008',
        categoryKey: 'queue',
        categoryName: '代排队',
        categoryColor: '#f0ad4e',
        categoryIcon: 'friends-o',
        taskTitle: '帮排打印店，大概10页文件',
        taskDetail: '北校区文印店，A4黑白双面打印，文件我发给你',
        startAddr: '北校区文印店',
        endAddr: '北校区图书馆门口',
        expectTime: '14:00',
        price: '4.00',
        tipAmount: 1,
        basePrice: 2,
        createTime: '2026-05-28 13:40',
        status: 'waiting',
        remark: '人很多，提前去比较好',
      },
      {
        id: 'p3',
        orderNo: 'PL20260527003',
        categoryKey: 'delivery',
        categoryName: '送物上门',
        categoryColor: '#e67e22',
        categoryIcon: 'guide-o',
        taskTitle: '送一把雨伞到东校区',
        taskDetail: '黑色长柄伞，用塑料袋装好',
        startAddr: '南校区3栋101',
        endAddr: '东校区操场看台',
        expectTime: '16:00',
        price: '6.00',
        tipAmount: 2,
        basePrice: 4,
        createTime: '2026-05-27 15:10',
        status: 'cancel',
        remark: '',
      },
    ];
  },

  getStatusClass(status) {
    const map = { waiting: 'status-waiting', accepted: 'status-accepted', delivering: 'status-delivering', done: 'status-done', cancel: 'status-cancel' };
    return map[status] || 'status-waiting';
  },

  getStatusLabel(status) {
    const map = { waiting: '等待接单', accepted: '已接单', delivering: '配送中', done: '已完成', cancel: '已取消' };
    return map[status] || '未知';
  },

  /* ========== 功能入口 ========== */
  onServiceTap(e) {
    const key = e.currentTarget.dataset.key;
    if (key === 'order') {
      wx.navigateTo({ url: '/pages/errand/order' });
    } else if (key === 'apply') {
      this.resetSwipe();
      this.setData({ activeTab: 'waiting' });
      this.filterOrders();
    }
  },

  /* ========== Tab切换 ========== */
  switchTab(e) {
    const key = e.currentTarget.dataset.key;
    this.resetSwipe();
    this.setData({ activeTab: key });
    this.filterOrders();
  },

  /* ========== 筛选 & 脱敏 ========== */
  filterOrders() {
    const { activeTab, orders } = this.data;
    const acceptedIds = app.globalData.acceptedErrandOrders || [];
    let filtered = [];
    let emptyText = '暂无订单';

    if (activeTab === 'all') {
      filtered = orders.filter(o => o.status !== 'cancel');
      emptyText = '暂无订单';
    } else if (activeTab === 'my') {
      filtered = orders.filter(o => o.owner === 'me');
      emptyText = '您还没有发布过跑腿任务~';
    } else if (activeTab === 'received') {
      filtered = orders.filter(o =>
        o.owner === 'other' &&
        (acceptedIds.includes(o.id) || o.acceptor === 'me') &&
        o.status !== 'cancel'
      );
      emptyText = '暂无接单记录~';
    } else if (activeTab === 'waiting') {
      filtered = orders.filter(o => o.status === 'waiting' && o.owner !== 'me');
      emptyText = '当前没有可接的跑腿单';
    }

    filtered.sort((a, b) => b.createTime.localeCompare(a.createTime));
    filtered = filtered.map(o => this.applyPrivacyMask(o));
    this.setData({ filteredOrders: filtered, emptyText });
    this.updateBadges(orders);
  },

  canViewDetail(order) {
    if (order.owner === 'me') return true;
    const acceptedIds = app.globalData.acceptedErrandOrders || [];
    if (acceptedIds.includes(order.id) || order.acceptor === 'me') return true;
    return false;
  },

  applyPrivacyMask(order) {
    const canView = this.canViewDetail(order);
    return {
      ...order,
      _canView: canView,
      _displayStartAddr: canView ? order.startAddr : this.maskText(order.startAddr),
      _displayEndAddr: canView ? order.endAddr : '********（接单后可见）',
      _isLocked: !canView,
    };
  },

  maskText(text) {
    if (!text || text.length <= 2) return '***';
    if (text.length === 3) return text[0] + '**';
    if (text.length === 4) return text[0] + '**' + text[text.length - 1];
    return text.slice(0, 1) + '***' + text.slice(-2);
  },

  updateBadges(orders) {
    const acceptedIds = app.globalData.acceptedErrandOrders || [];
    const tabs = this.data.tabs.slice();
    tabs[0].badge = orders.filter(o => o.status !== 'cancel').length;
    tabs[1].badge = orders.filter(o => o.owner === 'me').length;
    tabs[2].badge = orders.filter(o =>
      o.owner === 'other' && (acceptedIds.includes(o.id) || o.acceptor === 'me') && o.status !== 'cancel'
    ).length;
    tabs[3].badge = orders.filter(o => o.status === 'waiting' && o.owner !== 'me').length;
    this.setData({ tabs });
  },

  /* ========== 左滑操作 ========== */
  onTouchStart(e) {
    const id = e.currentTarget.dataset.id;
    if (this.data.swipingId && this.data.swipingId !== id) this.resetSwipe();
    const touch = e.touches[0];
    this.setData({ touchStartX: touch.clientX, touchCurrentX: touch.clientX, swipingId: id });
  },

  onTouchMove(e) {
    const touch = e.touches[0];
    const deltaX = touch.clientX - this.data.touchStartX;
    let offset = deltaX > 0 ? 0 : Math.max(deltaX * 2, -160);
    this.setData({ touchCurrentX: touch.clientX });
    const updateList = (list) => list.map(o =>
      o.id === this.data.swipingId ? { ...o, _offsetX: offset, _swiping: offset < -30 } : o
    );
    this.setData({
      orders: updateList(this.data.orders),
      filteredOrders: updateList(this.data.filteredOrders),
    });
  },

  onTouchEnd() {
    const id = this.data.swipingId;
    if (!id) return;
    const updateList = (list) => list.map(o => {
      if (o.id === id) {
        const offset = o._offsetX || 0;
        const finalOffset = offset < -80 ? -160 : 0;
        return { ...o, _offsetX: finalOffset, _swiping: finalOffset < -30 };
      }
      return o;
    });
    this.setData({ orders: updateList(this.data.orders), filteredOrders: updateList(this.data.filteredOrders), swipingId: null });
  },

  resetSwipe() {
    const reset = (list) => list.map(o => ({ ...o, _offsetX: 0, _swiping: false }));
    this.setData({ orders: reset(this.data.orders), filteredOrders: reset(this.data.filteredOrders), swipingId: null });
  },

  /* ========== 删除 ========== */
  onDeleteOrder(e) {
    const id = e.currentTarget.dataset.id;
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return;

    wx.showModal({
      title: '确认删除',
      content: `确定删除跑腿订单 ${order.orderNo} 吗？`,
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          if (order.owner === 'me') {
            app.globalData.errandOrders = (app.globalData.errandOrders || []).filter(o => o.id !== id);
          }
          const orders = this.data.orders.filter(o => o.id !== id);
          this.setData({ orders }, () => this.filterOrders());
          wx.showToast({ title: '已删除', icon: 'success' });
        } else {
          this.resetSwipe();
        }
      },
    });
  },

  /* ========== 点击订单 ========== */
  onOrderTap(e) {
    const id = e.currentTarget.dataset.id;
    const order = this.data.filteredOrders.find(o => o.id === id);
    if (!order) return;

    if (order._swiping) {
      this.resetSwipe();
      return;
    }

    // 等待接单 → 接单确认（检查惩罚）
    if (order.status === 'waiting' && order.owner !== 'me' && !this.canViewDetail(order)) {
      if (this.isPenalized()) {
        wx.showModal({
          title: '暂时无法接单',
          content: this.getPenaltyInfo().reason,
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#367BFF',
        });
        return;
      }
      this.setData({ showAcceptModal: true, acceptTarget: order });
      return;
    }

    // 本人/已接 → 详情
    if (this.canViewDetail(order)) {
      this.setData({ showDetailModal: true, detailOrder: order });
      return;
    }

    wx.showToast({ title: '仅接单后可查看详情', icon: 'none' });
  },

  /* ========== 确认接单 ========== */
  confirmAccept() {
    const order = this.data.acceptTarget;
    if (!order) return;
    if (this.isPenalized()) {
      wx.showToast({ title: '当前被限制接单', icon: 'none' });
      return;
    }

    const acceptedIds = app.globalData.acceptedErrandOrders || [];
    if (!acceptedIds.includes(order.id)) acceptedIds.push(order.id);
    app.globalData.acceptedErrandOrders = acceptedIds;

    const orders = this.data.orders.map(o => {
      if (o.id === order.id) return { ...o, status: 'accepted', acceptor: 'me', statusClass: 'status-accepted', statusLabel: '已接单' };
      return o;
    });

    this.setData({ orders, showAcceptModal: false, acceptTarget: null }, () => {
      wx.showToast({ title: '接单成功', icon: 'success' });
      this.filterOrders();
    });
  },

  closeAcceptModal() {
    this.setData({ showAcceptModal: false, acceptTarget: null });
  },

  closeDetailModal() {
    this.setData({ showDetailModal: false, detailOrder: null });
  },

  /* ========== 取消自己发的订单 ========== */
  onCancelMyOrder() {
    const order = this.data.detailOrder;
    if (!order || order.owner !== 'me') return;
    if (order.status !== 'waiting' && order.status !== 'accepted') {
      wx.showToast({ title: '当前状态不可取消', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认取消',
      content: `确定取消跑腿 ${order.orderNo} 吗？`,
      confirmColor: '#e74c3c',
      success: (res) => {
        if (!res.confirm) return;
        const myOrders = app.globalData.errandOrders || [];
        const idx = myOrders.findIndex(o => o.id === order.id);
        if (idx !== -1) { myOrders[idx].status = 'cancel'; app.globalData.errandOrders = myOrders; }
        const orders = this.data.orders.map(o => {
          if (o.id === order.id) return { ...o, status: 'cancel', statusClass: 'status-cancel', statusLabel: '已取消' };
          return o;
        });
        this.setData({ orders, showDetailModal: false, detailOrder: null }, () => {
          wx.showToast({ title: '已取消', icon: 'success' });
          this.filterOrders();
        });
      },
    });
  },

  /* ========== 取消已接的订单 ========== */
  onCancelAcceptedOrder() {
    const order = this.data.detailOrder;
    if (!order || order.owner === 'me') return;
    if (order.status !== 'accepted') {
      wx.showToast({ title: '当前状态不可取消', icon: 'none' });
      return;
    }

    const record = this.getCancelRecord();
    const willTrigger = record.count + 1 >= this.PENALTY_THRESHOLD;
    const penaltyMsg = willTrigger
      ? `\n\n⚠️ 今天第${record.count+1}次取消，将被限制${this.PENALTY_MINUTES}分钟`
      : `（今日已取消${record.count}次）`;

    wx.showModal({
      title: '取消接单',
      content: `确定取消 ${order.orderNo}?${penaltyMsg}`,
      confirmColor: '#e67e22',
      confirmText: '仍要取消',
      success: (res) => {
        if (!res.confirm) return;
        app.globalData.acceptedErrandOrders = (app.globalData.acceptedErrandOrders || []).filter(i => i !== order.id);
        this.recordCancel();
        const orders = this.data.orders.map(o => {
          if (o.id === order.id) return { ...o, status: 'waiting', acceptor: '', statusClass: 'status-waiting', statusLabel: '等待接单' };
          return o;
        });
        this.setData({ orders, showDetailModal: false, detailOrder: null }, () => {
          wx.showToast({ title: '已取消接单', icon: 'success' });
          this.filterOrders();
          this.checkPenalty();
        });
      },
    });
  },

  /* ========== 左滑快速取消接单 ========== */
  onCancelAcceptedOrderSwipe(e) {
    const id = e.currentTarget.dataset.id;
    const order = this.data.filteredOrders.find(o => o.id === id);
    if (!order || order.owner === 'me' || order.status !== 'accepted') return;

    this.resetSwipe();
    const record = this.getCancelRecord();
    const willTrigger = record.count + 1 >= this.PENALTY_THRESHOLD;
    const penaltyMsg = willTrigger ? `\n\n⚠️ 今天第${record.count+1}次取消` : '';

    wx.showModal({
      title: '取消接单',
      content: `确定取消 ${order.orderNo}?${penaltyMsg}`,
      confirmColor: '#e67e22',
      success: (res) => {
        if (!res.confirm) return;
        app.globalData.acceptedErrandOrders = (app.globalData.acceptedErrandOrders || []).filter(i => i !== order.id);
        this.recordCancel();
        const orders = this.data.orders.map(o => {
          if (o.id === order.id) return { ...o, status: 'waiting', acceptor: '', statusClass: 'status-waiting', statusLabel: '等待接单' };
          return o;
        });
        this.setData({ orders }, () => {
          wx.showToast({ title: '已取消接单', icon: 'success' });
          this.filterOrders();
          this.checkPenalty();
        });
      },
    });
  },

  /* ========== 惩罚机制 ========== */
  getTodayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  },

  getCancelRecord() {
    const record = app.globalData.cancelRecord || { date: '', count: 0, penaltyUntil: '' };
    if (record.date !== this.getTodayStr()) {
      record.date = this.getTodayStr(); record.count = 0; record.penaltyUntil = '';
      app.globalData.cancelRecord = record;
    }
    return record;
  },

  recordCancel() {
    const record = this.getCancelRecord();
    record.count++;
    if (record.count >= this.PENALTY_THRESHOLD) {
      record.penaltyUntil = new Date(Date.now() + this.PENALTY_MINUTES * 60000).toISOString();
    }
    app.globalData.cancelRecord = record;
  },

  isPenalized() {
    const record = this.getCancelRecord();
    if (!record.penaltyUntil) return false;
    if (new Date() >= new Date(record.penaltyUntil)) {
      record.penaltyUntil = ''; app.globalData.cancelRecord = record; return false;
    }
    return true;
  },

  getPenaltyInfo() {
    const record = this.getCancelRecord();
    if (!this.isPenalized()) return null;
    const remainMin = Math.ceil((new Date(record.penaltyUntil) - Date.now()) / 60000);
    return {
      reason: `您今天已取消 ${record.count} 次（≥${this.PENALTY_THRESHOLD}次），${this.PENALTY_MINUTES}分钟内不可接单。还剩约 ${remainMin} 分钟。`,
      remainMin,
    };
  },

  checkPenalty() {
    this.setData({ penaltyInfo: this.getPenaltyInfo() });
  },

  onCopyOrder(e) {
    const id = e.currentTarget.dataset.id;
    const order = this.data.orders.find(o => o.id === id);
    if (order) {
      wx.setClipboardData({
        data: order.orderNo,
        success: () => wx.showToast({ title: '已复制', icon: 'success' }),
      });
    }
  },

  goToOrder() {
    wx.navigateTo({ url: '/pages/errand/order' });
  },
});
