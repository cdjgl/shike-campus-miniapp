Page({
  data: {
    // 申请状态
    applied: false,
    approved: false,
    applicationInfo: null,

    // 表单
    realName: '',
    phone: '',
    studentId: '',
    campus: '',
    campusIndex: -1,

    campuses: [
      '南校区', '北校区', '东校区', '西校区',
    ],

    services: [],  // 选中的服务类型

    serviceOptions: [
      { key: 'express', name: '快递代取', icon: 'logistics', desc: '帮助同学取快递' },
      { key: 'errand', name: '校园跑腿', icon: 'guide-o', desc: '跑腿代办服务' },
      { key: 'wash', name: '清洗服务', icon: 'shop-o', desc: '衣物清洗配送' },
      { key: 'print', name: '校园打印', icon: 'description', desc: '打印文件送回' },
    ],

    availableTimes: [],
    timeOptions: ['周一至周五上午', '周一至周五下午', '周一至周五晚上', '周末全天'],

    selfIntro: '',
    agreeRules: false,

    showSuccessModal: false,
  },

  onLoad() {
    this.checkApplicationStatus();
  },

  onShow() {
    this.checkApplicationStatus();
  },

  checkApplicationStatus() {
    const app = getApp();
    const info = app.globalData.deliveryApplication;
    if (info) {
      this.setData({
        applied: true,
        approved: info.status === 'approved',
        applicationInfo: info,
      });
    }
  },

  /* ========== 表单输入 ========== */
  onNameInput(e) { this.setData({ realName: e.detail.value }); },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },
  onStudentIdInput(e) { this.setData({ studentId: e.detail.value }); },

  onCampusChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ campusIndex: idx, campus: this.data.campuses[idx] });
  },

  /* ========== 服务类型多选 ========== */
  toggleService(e) {
    const key = e.currentTarget.dataset.key;
    let services = [...this.data.services];
    const idx = services.indexOf(key);
    if (idx === -1) {
      services.push(key);
    } else {
      services.splice(idx, 1);
    }
    this.setData({ services });
  },

  isServiceSelected(key) {
    return this.data.services.includes(key);
  },

  /* ========== 可接单时间段 ========== */
  toggleTime(e) {
    const time = e.currentTarget.dataset.time;
    let times = [...this.data.availableTimes];
    const idx = times.indexOf(time);
    if (idx === -1) {
      times.push(time);
    } else {
      times.splice(idx, 1);
    }
    this.setData({ availableTimes: times });
  },

  isTimeSelected(time) {
    return this.data.availableTimes.includes(time);
  },

  onIntroInput(e) { this.setData({ selfIntro: e.detail.value }); },

  toggleAgree() {
    this.setData({ agreeRules: !this.data.agreeRules });
  },

  /* ========== 提交申请 ========== */
  submitApply() {
    // 校验
    if (!this.data.realName.trim()) {
      wx.showToast({ title: '请填写真实姓名', icon: 'none' });
      return;
    }
    if (!this.data.phone.trim()) {
      wx.showToast({ title: '请填写联系电话', icon: 'none' });
      return;
    }
    if (!/^1\d{10}$/.test(this.data.phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return;
    }
    if (!this.data.studentId.trim()) {
      wx.showToast({ title: '请填写学号', icon: 'none' });
      return;
    }
    if (!this.data.campus) {
      wx.showToast({ title: '请选择所在校区', icon: 'none' });
      return;
    }
    if (this.data.services.length === 0) {
      wx.showToast({ title: '请至少选择一项服务', icon: 'none' });
      return;
    }
    if (this.data.availableTimes.length === 0) {
      wx.showToast({ title: '请选择可接单时间', icon: 'none' });
      return;
    }
    if (!this.data.agreeRules) {
      wx.showToast({ title: '请阅读并同意接单规则', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认提交',
      content: '提交后我们将在1-3个工作日内审核，审核通过后即可接单。',
      confirmText: '确认提交',
      confirmColor: '#e67e22',
      success: (res) => {
        if (!res.confirm) return;

        const app = getApp();
        const now = new Date();

        // 获取选中的服务名称
        const selectedServiceNames = this.data.services.map(key => {
          const opt = this.data.serviceOptions.find(o => o.key === key);
          return opt ? opt.name : key;
        });

        const application = {
          id: 'APP' + Date.now(),
          realName: this.data.realName.trim(),
          phone: this.data.phone.trim(),
          studentId: this.data.studentId.trim(),
          campus: this.data.campus,
          services: this.data.services,
          serviceNames: selectedServiceNames,
          availableTimes: this.data.availableTimes,
          selfIntro: this.data.selfIntro.trim(),
          status: 'pending',  // pending / approved / rejected
          submitTime:
            now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0'),
          reviewTime: '',
          reviewNote: '',
        };

        app.globalData.deliveryApplication = application;

        this.setData({
          applied: true,
          approved: false,
          applicationInfo: application,
          showSuccessModal: true,
        });
      },
    });
  },

  closeSuccessModal() {
    this.setData({ showSuccessModal: false });
  },

  viewRules() {
    wx.showModal({
      title: '接单规则',
      content: '1. 必须为在校学生，提供真实信息\n2. 接单后需在约定时间内完成\n3. 当天取消≥3次将限制30分钟不可接单\n4. 禁止私下交易、加价等违规行为\n5. 违规者将被永久取消接单资格\n6. 收入将通过平台结算，收入为演示数据，不涉及真实提现',
      showCancel: false,
      confirmText: '我已了解',
      confirmColor: '#367BFF',
    });
  },
});
