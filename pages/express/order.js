Page({
  data: {
    // 包裹规格
    specs: [
      { key: 'small', name: '小件', weight: '0-1 kg', volume: '≤0.01m³', priceLabel: '¥3.50', price: 3.5 },
      { key: 'medium', name: '中件', weight: '1-3 kg', volume: '≤0.05m³', priceLabel: '¥5.00', price: 5.0 },
      { key: 'large', name: '大件', weight: '3-5 kg', volume: '≤0.1m³', priceLabel: '¥8.00', price: 8.0 },
      { key: 'xlarge', name: '特大件', weight: '5-10 kg', volume: '≤0.2m³', priceLabel: '¥15.00', price: 15.0 },
      { key: 'xxlarge', name: '超大件', weight: '10-20kg', volume: '≤0.5m³', priceLabel: '¥25.00', price: 25.0 },
    ],
    selectedSpec: 'small',

    // 多包裹
    packages: [
      { pickupIdx: -1, pickupCode: '', trackingNo: '', images: [] },
    ],

    // 快递点
    pickupPoints: [
      '南校区菜鸟驿站',
      '南校区顺丰快递',
      '南校区校园快递点',
      '南校区韵达快递',
      '南校区中通快递',
      '北校区菜鸟驿站',
      '东校区菜鸟驿站',
    ],

    // 配送信息
    deliveryAddr: '',
    deliveryTimeText: '请选择',
    deliveryTimeValue: '',
    deliveryTimeRange: [[], []],
    remark: '',

    // 打赏
    tips: [
      { label: '不打赏', value: 0 },
      { label: '¥1', value: 1 },
      { label: '¥2', value: 2 },
      { label: '¥5', value: 5 },
      { label: '¥10', value: 10 },
    ],
    tipAmount: 0,

    // 优惠券
    coupons: [],
    selectedCoupon: -1,
    showCouponModal: false,

    // 价格计算
    basePrice: 3.5,
    multiDiscount: 0,
    couponDiscount: 0,
    totalPrice: 3.5,

    // 支付弹窗
    showPayModal: false,
    latestOrderNo: '',
  },

  onLoad() {
    this.initCoupons();
    this.initDeliveryTimes();
    this.calcPrice();
  },

  /** 生成默认优惠券 */
  initCoupons() {
    this.setData({
      coupons: [
        { id: 1, label: '新用户3元券', value: 3, threshold: 5, expire: '2026-06-30到期', disabled: false },
        { id: 2, label: '满10减2', value: 2, threshold: 10, expire: '2026-06-15到期', disabled: false },
        { id: 3, label: '满20减5', value: 5, threshold: 20, expire: '2026-05-30到期', disabled: true },
      ],
    });
  },

  /** 初始化送达时间选项 */
  initDeliveryTimes() {
    const now = new Date();
    const hours = [];
    const minutes = [];
    for (let h = 8; h <= 22; h++) {
      hours.push(String(h).padStart(2, '0') + '点');
    }
    for (let m = 0; m < 60; m += 30) {
      minutes.push(String(m).padStart(2, '0') + '分');
    }
    this.setData({ deliveryTimeRange: [hours, minutes] });
  },

  /** 选择规格 */
  selectSpec(e) {
    this.setData({ selectedSpec: e.currentTarget.dataset.key });
    this.calcPrice();
  },

  /** 快递点选择 */
  onPickupChange(e) {
    const idx = e.currentTarget.dataset.idx;
    const val = parseInt(e.detail.value);
    const packages = this.data.packages;
    packages[idx].pickupIdx = val;
    this.setData({ packages });
  },

  /** 输入变更 */
  onPkgInput(e) {
    const idx = e.currentTarget.dataset.idx;
    const field = e.currentTarget.dataset.field;
    const packages = this.data.packages;
    packages[idx][field] = e.detail.value;
    this.setData({ packages });
  },

  /** 添加快递 */
  addPackage() {
    this.setData({
      packages: [...this.data.packages, { pickupIdx: -1, pickupCode: '', trackingNo: '', images: [] }],
    });
    this.calcPrice();
  },

  /** 删除快递 */
  removePackage(e) {
    const idx = e.currentTarget.dataset.idx;
    const packages = this.data.packages.filter((_, i) => i !== idx);
    this.setData({ packages });
    this.calcPrice();
  },

  /** 上传截图 */
  uploadImage(e) {
    const idx = e.currentTarget.dataset.idx;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const packages = this.data.packages;
        packages[idx].images.push(res.tempFiles[0].tempFilePath);
        this.setData({ packages });
      },
    });
  },

  /** 删除截图 */
  removeImage(e) {
    const pkg = e.currentTarget.dataset.pkg;
    const img = e.currentTarget.dataset.img;
    const packages = this.data.packages;
    packages[pkg].images.splice(img, 1);
    this.setData({ packages });
  },

  /** 地址输入 */
  onAddrInput(e) {
    this.setData({ deliveryAddr: e.detail.value });
  },

  /** 送达时间 */
  onTimeColumnChange(e) {
    // 列变化处理
  },
  onDeliveryTimeChange(e) {
    const val = e.detail.value;
    const hours = this.data.deliveryTimeRange[0][val[0]].replace('点', '');
    const mins = this.data.deliveryTimeRange[1][val[1]].replace('分', '');
    const text = `${hours}:${mins}`;
    this.setData({ deliveryTimeText: text, deliveryTimeValue: text });
  },

  /** 备注 */
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  /** 打赏选择 */
  selectTip(e) {
    this.setData({ tipAmount: parseInt(e.currentTarget.dataset.value) });
    this.calcPrice();
  },

  /** 优惠券弹窗 */
  selectCoupon() {
    this.setData({ showCouponModal: true });
  },
  closeCouponModal() {
    this.setData({ showCouponModal: false });
  },
  onCouponTap(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    if (this.data.coupons[index].disabled) return;
    this.setData({ selectedCoupon: index });
    this.calcPrice();
  },

  /** 实时计算价格 */
  calcPrice() {
    const spec = this.data.specs.find(s => s.key === this.data.selectedSpec);
    const basePrice = spec ? spec.price : 3.5;
    const packages = this.data.packages;
    const tipAmount = this.data.tipAmount;
    let couponDiscount = 0;

    // 多件折扣：第2件起减1元
    const multiDiscount = packages.length > 1 ? (packages.length - 1) * 1 : 0;

    // 优惠券
    if (this.data.selectedCoupon > -1 && this.data.coupons.length > 0) {
      const coupon = this.data.coupons[this.data.selectedCoupon];
      if (!coupon.disabled) {
        const rawTotal = basePrice + tipAmount - multiDiscount;
        if (rawTotal >= coupon.threshold) {
          couponDiscount = coupon.value;
        }
      }
    }

    const total = Math.max(0, basePrice + tipAmount - multiDiscount - couponDiscount);

    this.setData({
      basePrice: basePrice.toFixed(2),
      multiDiscount: multiDiscount.toFixed(2),
      couponDiscount: couponDiscount.toFixed(2),
      totalPrice: total.toFixed(2),
    });
  },

  /** 提交订单 */
  submitOrder() {
    const app = getApp();
    const packages = this.data.packages;

    // 校验
    for (let i = 0; i < packages.length; i++) {
      if (packages[i].pickupIdx === -1) {
        wx.showToast({ title: `第${i + 1}件快递请选择快递点`, icon: 'none' });
        return;
      }
      if (!packages[i].pickupCode.trim()) {
        wx.showToast({ title: `第${i + 1}件快递请输入取件码`, icon: 'none' });
        return;
      }
    }
    if (!this.data.deliveryAddr.trim()) {
      wx.showToast({ title: '请填写送达地址', icon: 'none' });
      return;
    }

    // 模拟支付流程（演示，不接入真实支付服务）
    wx.showModal({
      title: '确认支付',
      content: `合计金额：¥${this.data.totalPrice}\n支付方式：校园卡（模拟）`,
      confirmText: '确认支付',
      success: (res) => {
        if (res.confirm) {
          // 生成订单号
          const now = new Date();
          const no = 'KD' + now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');

          const spec = this.data.specs.find(s => s.key === this.data.selectedSpec);
          const pickupPoint = this.data.pickupPoints[packages[0].pickupIdx] || '';

          // 构建订单对象（包含完整信息）
          const pkgList = packages.map((p, i) => ({
            number: i + 1,
            pickupPoint: this.data.pickupPoints[p.pickupIdx] || '',
            pickupCode: p.pickupCode.trim(),
            trackingNo: p.trackingNo ? p.trackingNo.trim() : '',
          }));

          const newOrder = {
            id: no,
            orderNo: no,
            spec: spec ? spec.name + '(' + spec.weight + ')' : '小件(0-1kg)',
            specKey: this.data.selectedSpec,
            packages: pkgList,
            pickupPoint: pickupPoint,
            deliveryAddr: this.data.deliveryAddr,
            deliveryTime: this.data.deliveryTimeText !== '请选择' ? this.data.deliveryTimeText : '',
            remark: this.data.remark || '',
            tipAmount: this.data.tipAmount,
            basePrice: this.data.basePrice,
            price: this.data.totalPrice,
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

          // 保存到全局数据（兼容旧逻辑）
          if (!app.globalData.expressOrders) app.globalData.expressOrders = [];
          app.globalData.expressOrders.unshift(newOrder);

          // 同步写入本地存储（"我的订单"页面读取）
          var localList = wx.getStorageSync('express_orders') || [];
          localList.unshift(newOrder);
          wx.setStorageSync('express_orders', localList);

          this.setData({
            showPayModal: true,
            latestOrderNo: no,
          });
        }
      },
    });
  },

  /** 返回列表 */
  backToList() {
    wx.navigateBack();
  },

  /** 继续下单 */
  continueOrder() {
    this.setData({
      showPayModal: false,
      selectedSpec: 'small',
      packages: [{ pickupIdx: -1, pickupCode: '', trackingNo: '', images: [] }],
      deliveryAddr: '',
      deliveryTimeText: '请选择',
      remark: '',
      tipAmount: 0,
      selectedCoupon: -1,
      latestOrderNo: '',
    });
    this.calcPrice();
  },
});
