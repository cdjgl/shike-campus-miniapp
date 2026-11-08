Page({
  data: {
    phone: '',
    code: '',
    password: '',
    confirmPassword: '',
    canGetCode: true,
    codeText: '获取验证码',
    phoneFocus: false,
    codeFocus: false,
    passwordFocus: false,
    confirmFocus: false,
    canSubmit: false,
  },

  onPhoneFocus() {
    this.setData({ phoneFocus: true });
  },

  onPhoneBlur() {
    this.setData({ phoneFocus: false });
  },

  onCodeFocus() {
    this.setData({ codeFocus: true });
  },

  onCodeBlur() {
    this.setData({ codeFocus: false });
  },

  onPasswordFocus() {
    this.setData({ passwordFocus: true });
  },

  onPasswordBlur() {
    this.setData({ passwordFocus: false });
  },

  onConfirmFocus() {
    this.setData({ confirmFocus: true });
  },

  onConfirmBlur() {
    this.setData({ confirmFocus: false });
  },

  onPhoneChange(e) {
    this.setData({ phone: e.detail.value });
    this.checkCanSubmit();
  },

  onCodeChange(e) {
    this.setData({ code: e.detail.value });
    this.checkCanSubmit();
  },

  onPasswordChange(e) {
    this.setData({ password: e.detail.value });
    this.checkCanSubmit();
  },

  onConfirmChange(e) {
    this.setData({ confirmPassword: e.detail.value });
    this.checkCanSubmit();
  },

  checkCanSubmit() {
    const { phone, code, password, confirmPassword } = this.data;
    const isValidPhone = phone.length === 11;
    const hasCode = code.length >= 4;
    const hasPassword = password.length >= 6;
    const passwordsMatch = password === confirmPassword;
    this.setData({
      canSubmit: isValidPhone && hasCode && hasPassword && passwordsMatch,
    });
  },

  getCode() {
    const { phone } = this.data;
    if (phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
      });
      return;
    }

    this.setData({
      canGetCode: false,
      codeText: '60秒后重发',
    });

    let count = 60;
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        this.setData({
          codeText: `${count}秒后重发`,
        });
      } else {
        clearInterval(timer);
        this.setData({
          canGetCode: true,
          codeText: '获取验证码',
        });
      }
    }, 1000);

    wx.showToast({
      title: '验证码已发送',
      icon: 'success',
    });
  },

  handleSubmit() {
    const { phone, code, password, confirmPassword } = this.data;

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none',
      });
      return;
    }

    wx.showLoading({
      title: '重置中...',
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '密码重置成功',
        icon: 'success',
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1500);
  },

  goBack() {
    wx.navigateBack();
  },
});
