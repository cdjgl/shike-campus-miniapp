const app = getApp();

Page({
  data: {
    showCampusModal: true,
    selectedCampusId: '',
    campuses: [
      { id: 'south', name: '南校区', address: '大学城南二路88号' },
      { id: 'north', name: '北校区', address: '大学城北一路66号' },
      { id: 'east', name: '东校区', address: '大学城东环三路120号' },
    ],
    currentCampus: { name: '请选择校区', address: '' },

    // 功能入口
    services: [
      { key: 'pickup', name: '快递代取', icon: 'logistics', bg: '#367BFF' },
      { key: 'errand', name: '校园跑腿', icon: 'guide-o', bg: '#5cb85c' },
      { key: 'wash', name: '清洗服务', icon: 'brush-o', bg: '#f0ad4e' },
      { key: 'print', name: '校园打印', icon: 'description', bg: '#8e44ad' },
      { key: 'apply', name: '申请接单', icon: 'friends-o', bg: '#e67e22' },
    ],

    // 分类选项卡
    tabs: [
      { key: 'all', label: '全部订单', badge: 0 },
      { key: 'my', label: '我的订单', badge: 0 },
      { key: 'received', label: '我的接单', badge: 0 },
      { key: 'waiting', label: '等待接单', badge: 0 },
    ],
    activeTab: 'all',

    orders: [],
    filteredOrders: [],
    emptyText: '暂无订单',

    // 左滑删除状态
    touchStartX: 0,
    touchCurrentX: 0,
    swipingId: null,

    // 接单确认弹窗
    showAcceptModal: false,
    acceptTarget: null,

    // 订单详情弹窗
    showDetailModal: false,
    detailOrder: null,

    // 取消惩罚提示
    penaltyInfo: null,  // { reason, until } 或 null
  },

  /** ========== 惩罚阈值 ========== */
  PENALTY_THRESHOLD: 3,       // 当天取消 ≥3 次触发惩罚
  PENALTY_MINUTES: 30,        // 惩罚：30分钟内不可接单

  onLoad() {
    this.loadOrders();
    this.checkPenalty();
  },

  onShow() {
    if (this.data.currentCampus && this.data.currentCampus.id) {
      this.loadOrders();
      this.checkPenalty();
    }
  },

  /** ================================================
   *  数据加载
   *  ================================================ */
  loadOrders() {
    // 自己提交的订单
    const mySubmitted = app.globalData.expressOrders || [];
    // 自己接过的订单id
    const acceptedIds = app.globalData.acceptedExpressOrders || [];

    // 模拟他人的订单
    const mockOrders = this.getMockOrders();

    // 标记自己的订单
    const myOrders = mySubmitted.map(o => ({
      ...o,
      owner: 'me',
      acceptor: o.acceptor || '',
      statusClass: this.getStatusClass(o.status),
      statusLabel: this.getStatusLabel(o.status),
    }));

    // 标记他人的订单（含模拟数据）
    const otherOrders = mockOrders.map(o => {
      // 如果该订单在我接单列表中，标记acceptor为me
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
        id: 'm1',
        orderNo: 'KD20260528002',
        spec: '大件(5-10kg)',
        packages: [{ number: 1, pickupPoint: '北校区校园快递点', pickupCode: 'A-8821', trackingNo: 'EX0000000000001' }],
        pickupPoint: '北校区校园快递点',
        deliveryAddr: '北校区8栋105',
        price: '8.00',
        createTime: '2026-05-28 12:00',
        status: 'waiting',
        remark: '放门口就行',
      },
      {
        id: 'm2',
        orderNo: 'KD20260527003',
        spec: '小件(0-1kg)',
        packages: [{ number: 1, pickupPoint: '东校区顺丰快递', pickupCode: 'D-3456', trackingNo: '' }],
        pickupPoint: '东校区顺丰快递',
        deliveryAddr: '东校区5栋201',
        price: '3.50',
        createTime: '2026-05-27 09:15',
        status: 'waiting',
        remark: '',
      },
      {
        id: 'm3',
        orderNo: 'KD20260526005',
        spec: '超大件(20kg以上)',
        packages: [{ number: 1, pickupPoint: '南校区韵达快递', pickupCode: 'N-7890', trackingNo: '' }],
        pickupPoint: '南校区韵达快递',
        deliveryAddr: '南校区3栋101',
        price: '25.00',
        createTime: '2026-05-26 14:00',
        status: 'cancel',
        remark: '尽量下午送',
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

  /* ========== 校区选择 ========== */
  selectCampus(e) {
    this.setData({ selectedCampusId: e.currentTarget.dataset.id });
  },

  confirmCampus() {
    const { selectedCampusId, campuses } = this.data;
    if (!selectedCampusId) {
      wx.showToast({ title: '请选择一个校区', icon: 'none' });
      return;
    }
    const campus = campuses.find(c => c.id === selectedCampusId);
    this.setData({ showCampusModal: false, currentCampus: campus });
    this.loadOrders();
    this.checkPenalty();
  },

  closeCampusModal() {
    if (this.data.currentCampus.id) {
      this.setData({ showCampusModal: false });
    }
  },

  changeCampus() {
    this.setData({ showCampusModal: true });
  },

  /* ========== 功能入口 ========== */
  onServiceTap(e) {
    const key = e.currentTarget.dataset.key;
    if (key === 'pickup') {
      wx.navigateTo({ url: '/pages/express/order' });
    } else if (key === 'apply') {
      this.resetSwipe();
      this.setData({ activeTab: 'waiting' });
      this.filterOrders();
    } else if (key === 'errand') {
      wx.navigateTo({ url: '/pages/errand/index' });
    } else if (key === 'wash') {
      wx.navigateTo({ url: '/pages/wash/index' });
    } else if (key === 'print') {
      wx.navigateTo({ url: '/pages/print/index' });
    } else if (key === 'deliver') {
      wx.navigateTo({ url: '/pages/deliver/index' });
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  /* ========== 选项卡切换 ========== */
  switchTab(e) {
    const key = e.currentTarget.dataset.key;
    this.resetSwipe();
    this.setData({ activeTab: key });
    this.filterOrders();
  },

  /** ================================================
   *  筛选 & 脱敏
   *  ================================================ */
  filterOrders() {
    const { activeTab, orders } = this.data;
    const acceptedIds = app.globalData.acceptedExpressOrders || [];
    let filtered = [];
    let emptyText = '暂无订单';

    if (activeTab === 'all') {
      filtered = orders.filter(o => o.status !== 'cancel');
      emptyText = '暂无订单';
    } else if (activeTab === 'my') {
      // 我的订单：包含未取消和已取消的（已取消的仍可删除）
      filtered = orders.filter(o => o.owner === 'me');
      emptyText = '您还没有下过订单，去下单吧~';
    } else if (activeTab === 'received') {
      filtered = orders.filter(o =>
        o.owner === 'other' &&
        (acceptedIds.includes(o.id) || o.acceptor === 'me') &&
        o.status !== 'cancel'
      );
      emptyText = '暂无接单记录，去接一单吧~';
    } else if (activeTab === 'waiting') {
      filtered = orders.filter(o => o.status === 'waiting' && o.owner !== 'me');
      emptyText = '当前没有等待接单的订单';
    }

    // 按时间倒序
    filtered.sort((a, b) => b.createTime.localeCompare(a.createTime));

    // 隐私脱敏
    filtered = filtered.map(o => this.applyPrivacyMask(o));

    this.setData({ filteredOrders: filtered, emptyText });
    this.updateBadges(orders);
  },

  canViewDetail(order) {
    if (order.owner === 'me') return true;
    const acceptedIds = app.globalData.acceptedExpressOrders || [];
    if (acceptedIds.includes(order.id) || order.acceptor === 'me') return true;
    return false;
  },

  applyPrivacyMask(order) {
    const canView = this.canViewDetail(order);
    return {
      ...order,
      _canView: canView,
      _displayPickupPoint: canView ? order.pickupPoint : this.maskText(order.pickupPoint),
      _displayDeliveryAddr: canView ? order.deliveryAddr : '********（接单后可见）',
      _displayPickupCode: canView && order.packages
        ? order.packages.map(p => p.pickupCode).join('、')
        : '****',
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
    const acceptedIds = app.globalData.acceptedExpressOrders || [];
    const tabs = this.data.tabs.slice();
    tabs[0].badge = orders.filter(o => o.status !== 'cancel').length;
    tabs[1].badge = orders.filter(o => o.owner === 'me').length;
    tabs[2].badge = orders.filter(o =>
      o.owner === 'other' && (acceptedIds.includes(o.id) || o.acceptor === 'me') && o.status !== 'cancel'
    ).length;
    tabs[3].badge = orders.filter(o => o.status === 'waiting' && o.owner !== 'me').length;
    this.setData({ tabs });
  },

  /* ========== 左滑删除 ========== */
  onTouchStart(e) {
    const id = e.currentTarget.dataset.id;
    if (this.data.swipingId && this.data.swipingId !== id) {
      this.resetSwipe();
    }
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

  /* ========== 删除订单（仅自己的可删） ========== */
  onDeleteOrder(e) {
    const id = e.currentTarget.dataset.id;
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除订单 ${order.orderNo} 吗？删除后不可恢复。`,
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          if (order.owner === 'me') {
            app.globalData.expressOrders = (app.globalData.expressOrders || []).filter(o => o.id !== id);
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

  /* ========== 点击订单：接单 or 查看详情 ========== */
  onOrderTap(e) {
    const id = e.currentTarget.dataset.id;
    const order = this.data.filteredOrders.find(o => o.id === id);
    if (!order) return;

    // 正在左滑中，先收起
    if (order._swiping) {
      this.resetSwipe();
      return;
    }

    // 等待接单的他人订单 → 弹出接单确认（但要先检查惩罚）
    if (order.status === 'waiting' && order.owner !== 'me' && !this.canViewDetail(order)) {
      if (this.isPenalized()) {
        const info = this.getPenaltyInfo();
        wx.showModal({
          title: '暂时无法接单',
          content: info.reason,
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#367BFF',
        });
        return;
      }
      this.setData({ showAcceptModal: true, acceptTarget: order });
      return;
    }

    // 自己发的或自己接的 → 弹出详情
    if (this.canViewDetail(order)) {
      this.setData({ showDetailModal: true, detailOrder: order });
      return;
    }

    // 其他情况（被锁定的订单）→ 提示
    wx.showToast({ title: '仅接单后可查看详情', icon: 'none' });
  },

  /* ========== 确认接单 ========== */
  confirmAccept() {
    const order = this.data.acceptTarget;
    if (!order) return;

    if (this.isPenalized()) {
      wx.showToast({ title: '当前被限制接单，请稍后再试', icon: 'none' });
      return;
    }

    const acceptedIds = app.globalData.acceptedExpressOrders || [];
    if (!acceptedIds.includes(order.id)) {
      acceptedIds.push(order.id);
      app.globalData.acceptedExpressOrders = acceptedIds;
    }

    const orders = this.data.orders.map(o => {
      if (o.id === order.id) {
        return { ...o, status: 'accepted', acceptor: 'me', statusClass: 'status-accepted', statusLabel: '已接单' };
      }
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

  /* ========== 订单详情弹窗 ========== */
  closeDetailModal() {
    this.setData({ showDetailModal: false, detailOrder: null });
  },

  /** ================================================
   *  取消自己发的订单
   *  ================================================ */
  onCancelMyOrder() {
    const order = this.data.detailOrder;
    if (!order || order.owner !== 'me') return;

    // 只有 waiting 或 accepted 状态可取消
    if (order.status !== 'waiting' && order.status !== 'accepted') {
      wx.showToast({ title: '当前状态不可取消', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认取消订单',
      content: order.status === 'accepted'
        ? `订单 ${order.orderNo} 已被接单，取消后接单人将收到通知。确认取消？`
        : `确定要取消订单 ${order.orderNo} 吗？`,
      confirmColor: '#e74c3c',
      confirmText: '确认取消',
      success: (res) => {
        if (!res.confirm) return;

        // 更新全局存储中自己的订单状态
        const myOrders = app.globalData.expressOrders || [];
        const idx = myOrders.findIndex(o => o.id === order.id);
        if (idx !== -1) {
          myOrders[idx].status = 'cancel';
          app.globalData.expressOrders = myOrders;
        }

        // 更新页面中的订单状态
        const orders = this.data.orders.map(o => {
          if (o.id === order.id) {
            return { ...o, status: 'cancel', statusClass: 'status-cancel', statusLabel: '已取消' };
          }
          return o;
        });

        this.setData({ orders, showDetailModal: false, detailOrder: null }, () => {
          wx.showToast({ title: '订单已取消', icon: 'success' });
          this.filterOrders();
        });
      },
    });
  },

  /** ================================================
   *  取消已接的订单（退回等待池 + 惩罚记录）
   *  ================================================ */
  onCancelAcceptedOrder() {
    const order = this.data.detailOrder;
    if (!order || order.owner === 'me') return;

    // 只有 accepted 状态可取消接单
    if (order.status !== 'accepted') {
      wx.showToast({ title: '当前状态不可取消接单', icon: 'none' });
      return;
    }

    // 计算当前惩罚状态
    const record = this.getCancelRecord();
    const willTrigger = record.count + 1 >= this.PENALTY_THRESHOLD;
    const penaltyMsg = willTrigger
      ? `\n\n⚠️ 注意：这是今天第${record.count + 1}次取消接单，取消后将被限制${this.PENALTY_MINUTES}分钟内不可接单。`
      : `（今日已取消${record.count}次，达到${this.PENALTY_THRESHOLD}次将限制接单）`;

    wx.showModal({
      title: '确认取消接单',
      content: `确定要取消接单 ${order.orderNo} 吗？${penaltyMsg}`,
      confirmColor: '#e67e22',
      confirmText: '仍要取消',
      success: (res) => {
        if (!res.confirm) return;

        // 1. 从已接单列表中移除
        const acceptedIds = app.globalData.acceptedExpressOrders || [];
        app.globalData.acceptedExpressOrders = acceptedIds.filter(id => id !== order.id);

        // 2. 记录取消次数 + 判断是否触发惩罚
        this.recordCancel();

        // 3. 更新订单状态：退回 waiting，清除接单人
        const orders = this.data.orders.map(o => {
          if (o.id === order.id) {
            return { ...o, status: 'waiting', acceptor: '', statusClass: 'status-waiting', statusLabel: '等待接单' };
          }
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

  /** 左滑快速取消接单（从卡片上直接操作） */
  onCancelAcceptedOrderSwipe(e) {
    const id = e.currentTarget.dataset.id;
    const order = this.data.filteredOrders.find(o => o.id === id);
    if (!order || order.owner === 'me' || order.status !== 'accepted') return;

    this.resetSwipe();

    const record = this.getCancelRecord();
    const willTrigger = record.count + 1 >= this.PENALTY_THRESHOLD;
    const penaltyMsg = willTrigger
      ? `\n\n⚠️ 注意：这是今天第${record.count + 1}次取消接单，取消后将被限制${this.PENALTY_MINUTES}分钟内不可接单。`
      : `（今日已取消${record.count}次，达到${this.PENALTY_THRESHOLD}次将限制接单）`;

    wx.showModal({
      title: '确认取消接单',
      content: `确定要取消接单 ${order.orderNo} 吗？${penaltyMsg}`,
      confirmColor: '#e67e22',
      confirmText: '仍要取消',
      success: (res) => {
        if (!res.confirm) return;

        const acceptedIds = app.globalData.acceptedExpressOrders || [];
        app.globalData.acceptedExpressOrders = acceptedIds.filter(i => i !== order.id);
        this.recordCancel();

        const orders = this.data.orders.map(o => {
          if (o.id === order.id) {
            return { ...o, status: 'waiting', acceptor: '', statusClass: 'status-waiting', statusLabel: '等待接单' };
          }
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

  /** ================================================
   *  取消惩罚机制
   *  ================================================ */

  /** 获取今天的日期字符串 */
  getTodayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },

  /** 获取取消记录（自动跨天重置） */
  getCancelRecord() {
    const record = app.globalData.cancelRecord || { date: '', count: 0, penaltyUntil: '' };
    const today = this.getTodayStr();
    if (record.date !== today) {
      // 新的一天，重置
      record.date = today;
      record.count = 0;
      record.penaltyUntil = '';
      app.globalData.cancelRecord = record;
    }
    return record;
  },

  /** 记录一次取消 */
  recordCancel() {
    const record = this.getCancelRecord();
    record.count += 1;

    // 达到阈值：设置惩罚截止时间
    if (record.count >= this.PENALTY_THRESHOLD) {
      const penaltyUntil = new Date(Date.now() + this.PENALTY_MINUTES * 60 * 1000);
      record.penaltyUntil = penaltyUntil.toISOString();
    }

    app.globalData.cancelRecord = record;
  },

  /** 判断当前是否处于惩罚期 */
  isPenalized() {
    const record = this.getCancelRecord();
    if (!record.penaltyUntil) return false;
    const now = new Date();
    const until = new Date(record.penaltyUntil);
    if (now >= until) {
      // 惩罚已过期，清除
      record.penaltyUntil = '';
      app.globalData.cancelRecord = record;
      return false;
    }
    return true;
  },

  /** 获取惩罚信息 */
  getPenaltyInfo() {
    const record = this.getCancelRecord();
    if (!this.isPenalized()) return null;
    const until = new Date(record.penaltyUntil);
    const remainMin = Math.ceil((until.getTime() - Date.now()) / 60000);
    return {
      reason: `您今天已取消接单 ${record.count} 次（≥${this.PENALTY_THRESHOLD}次触发限制），${this.PENALTY_MINUTES}分钟内无法再接单。还剩约 ${remainMin} 分钟。`,
      until: record.penaltyUntil,
      remainMin,
    };
  },

  /** 检查并更新惩罚提示 */
  checkPenalty() {
    const info = this.getPenaltyInfo();
    this.setData({ penaltyInfo: info });
  },

  /* ========== 复制单号 ========== */
  onCopyOrder(e) {
    const id = e.currentTarget.dataset.id;
    const order = this.data.orders.find(o => o.id === id);
    if (order) {
      wx.setClipboardData({
        data: order.orderNo,
        success: () => wx.showToast({ title: '已复制单号', icon: 'success' }),
      });
    }
  },

  goToOrder() {
    wx.navigateTo({ url: '/pages/express/order' });
  },
});
