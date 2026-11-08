var auth = require('../../utils/auth.js');
var community = require('../../utils/community.js');

Page({
  data: {
    account: '',
    password: '',
    agreed: false,
    canLogin: false,
    accountFocus: false,
    passwordFocus: false,
    showPassword: false,
  },

  onAccountFocus() {
    this.setData({ accountFocus: true });
  },

  onAccountBlur() {
    this.setData({ accountFocus: false });
  },

  onPasswordFocus() {
    this.setData({ passwordFocus: true });
  },

  onPasswordBlur() {
    this.setData({ passwordFocus: false });
  },

  onAccountChange(e) {
    this.setData({
      account: e.detail.value,
    });
    this.checkCanLogin();
  },

  onPasswordChange(e) {
    this.setData({
      password: e.detail.value,
    });
    this.checkCanLogin();
  },

  onAgreementToggle() {
    const agreed = !this.data.agreed;
    this.setData({
      agreed,
      canLogin: this.data.account.trim() && this.data.password.trim() && agreed,
    });
  },

  checkCanLogin() {
    const {
      account,
      password,
      agreed,
    } = this.data;
    const canLogin = account.trim() && password.trim() && agreed;
    this.setData({
      canLogin,
    });
  },

  handleLogin() {
    const {
      account,
      password,
    } = this.data;

    if (!account || !password) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none',
      });
      return;
    }

    wx.showLoading({
      title: '登录中...',
    });

    setTimeout(() => {
      wx.hideLoading();

      // 真实校验：账号必须已注册且密码正确
      const rec = auth.verify(account, password);
      if (!rec) {
        // 区分“账号不存在”与“密码错误”，给出明确提示
        const exists = auth.isAccountExists(account);
        wx.showToast({
          title: exists ? '账号或密码错误' : '账号不存在，请先注册',
          icon: 'none',
        });
        return;
      }

      // 账号被管理员禁用
      if (community.isDisabled(rec.account)) {
        wx.showToast({ title: '该账号已被禁用', icon: 'none' });
        return;
      }

      wx.setStorageSync('userInfo', {
        account: rec.account,
        nickname: rec.nickname,
        studentId: rec.studentId,
        school: rec.school,
        role: rec.role,
      });

      wx.showToast({
        title: '登录成功',
        icon: 'success',
      });

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index',
        });
      }, 1200);
    }, 800);
  },

  goRegister() {
    wx.navigateTo({
      url: '/pages/register/register',
    });
  },

  openAgreement(type) {
    const title = type === 'user' ? '用户协议' : '隐私协议';
    wx.showToast({
      title: title + '开发中',
      icon: 'none',
    });
  },

  forgetPassword() {
    wx.navigateTo({
      url: '/pages/forget/forget',
    });
  },

  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword,
    });
  },
});
