Page({
  data: {
    // 基本信息
    gender: '男',
    grade: '大一',
    genderOptions: ['男', '女'],
    gradeOptions: ['大一', '大二', '大三', '大四'],
    showGenderPick: false,
    showGradePick: false,

    // 身体指标
    height: '',
    weight: '',
    bmi: '--',
    bmiScore: 0,
    bmiLevel: '',

    // 体测项目
    vitalCapacity: '',     // 肺活量(ml)
    sitAndReach: '',       // 坐位体前屈(cm)
    longJump: '',          // 立定跳远(cm)
    run50m: '',            // 50米(秒)
    runDuration: '',       // 800/1000米(秒)
    situps: '',            // 仰卧起坐/引体向上(个)

    // 各项目得分
    scoreVC: 0,
    scoreSR: 0,
    scoreLJ: 0,
    score50: 0,
    scoreRun: 0,
    scoreUp: 0,

    // 总成绩
    totalScore: 0,
    totalLevel: '',
    hasResult: false
  },

  // ===== 下拉选择 =====
  toggleGender() {
    this.setData({ showGenderPick: !this.data.showGenderPick, showGradePick: false });
  },
  selectGender(e) {
    this.setData({ gender: e.currentTarget.dataset.value, showGenderPick: false });
  },
  toggleGrade() {
    this.setData({ showGradePick: !this.data.showGradePick, showGenderPick: false });
  },
  selectGrade(e) {
    this.setData({ grade: e.currentTarget.dataset.value, showGradePick: false });
  },

  // ===== 输入处理 =====
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  // ===== 计算BIM =====
  calcBMI() {
    const h = parseFloat(this.data.height);
    const w = parseFloat(this.data.weight);
    if (!h || !w || h <= 0 || w <= 0) {
      this.setData({ bmi: '--', bmiScore: 0, bmiLevel: '' });
      return;
    }
    const hM = h / 100;
    const bmi = (w / (hM * hM)).toFixed(1);
    const bmiVal = parseFloat(bmi);
    let score = 0, level = '';
    
    if (bmiVal >= 17.9 && bmiVal <= 23.9) {
      score = 100; level = '正常';
    } else if (bmiVal >= 24.0 && bmiVal <= 27.9) {
      score = 80; level = '超重';
    } else if (bmiVal >= 28.0) {
      score = 60; level = '肥胖';
    } else {
      score = 80; level = '偏瘦';
    }
    // 女生BMI标准略有不同
    if (this.data.gender === '女') {
      if (bmiVal >= 17.2 && bmiVal <= 23.9) { score = 100; level = '正常'; }
      else if (bmiVal >= 24.0 && bmiVal <= 27.9) { score = 80; level = '超重'; }
      else if (bmiVal < 17.2) { score = 80; level = '偏瘦'; }
    }

    this.setData({ bmi: String(bmi), bmiScore: score, bmiLevel: level });
  },

  // ===== 触发计算 =====
  onCalc() {
    this.calcBMI();
    this.calcAllScores();
  },

  // ===== 各项目计分 =====
  calcAllScores() {
    const g = this.data.gender === '男' ? 'male' : 'female';
    const data = this.data;

    // 肺活量评分
    const vc = parseFloat(data.vitalCapacity);
    let sVC = this.scoreVitalCapacity(g, vc);
    
    // 坐位体前屈
    const sr = parseFloat(data.sitAndReach);
    let sSR = this.scoreSitReach(g, sr);
    
    // 立定跳远
    const lj = parseFloat(data.longJump);
    let sLJ = this.scoreLongJump(g, lj);
    
    // 50米跑
    const r50 = parseFloat(data.run50m);
    let s50 = this.scoreRun50m(g, r50);
    
    // 800/1000米
    const rd = parseFloat(data.runDuration);
    let sRun = this.scoreDuration(g, rd);
    
    // 仰卧起坐/引体向上
    const su = parseFloat(data.situps);
    let sUP = this.scoreSitups(g, su);

    // 权重：BMI(15%) + 肺活量(15%) + 50米(20%) + 坐位体前屈(10%) + 立定跳远(10%) + 耐力跑(20%) + 引体/仰卧(10%)
    const bmiW = this.data.bmiScore * 0.15;
    const vcW = sVC * 0.15;
    const r50W = s50 * 0.20;
    const srW = sSR * 0.10;
    const ljW = sLJ * 0.10;
    const runW = sRun * 0.20;
    const upW = sUP * 0.10;
    const total = Math.round(bmiW + vcW + srW + ljW + r50W + runW + upW);

    // 等级判定
    let level = '';
    if (total >= 90) level = '优秀';
    else if (total >= 80) level = '良好';
    else if (total >= 60) level = '及格';
    else level = '不及格';

    this.setData({
      scoreVC: sVC, scoreSR: sSR, scoreLJ: sLJ,
      score50: s50, scoreRun: sRun, scoreUp: sUP,
      totalScore: total, totalLevel: level, hasResult: true
    });
  },

  // 肺活量(ml)
  scoreVitalCapacity(gender, val) {
    if (isNaN(val)) return 0;
    if (gender === 'male') {
      if (val >= 4800) return 100; else if (val >= 4600) return 95; else if (val >= 4400) return 90; else if (val >= 4200) return 85;
      else if (val >= 4000) return 80; else if (val >= 3800) return 78; else if (val >= 3600) return 76; else if (val >= 3400) return 74;
      else if (val >= 3200) return 72; else if (val >= 3100) return 68; else if (val >= 3000) return 64; else if (val >= 2800) return 60;
      else if (val >= 2600) return 50; else if (val >= 2400) return 40; else if (val >= 2200) return 30; else if (val >= 2000) return 20;
      else return 10;
    } else {
      if (val >= 3300) return 100; else if (val >= 3150) return 95; else if (val >= 3000) return 90; else if (val >= 2850) return 85;
      else if (val >= 2700) return 80; else if (val >= 2600) return 78; else if (val >= 2500) return 76; else if (val >= 2400) return 74;
      else if (val >= 2300) return 72; else if (val >= 2200) return 68; else if (val >= 2100) return 64; else if (val >= 2000) return 60;
      else if (val >= 1900) return 50; else if (val >= 1800) return 40; else if (val >= 1700) return 30; else if (val >= 1600) return 20;
      else return 10;
    }
  },

  // 坐位体前屈(cm)
  scoreSitReach(gender, val) {
    if (isNaN(val)) return 0;
    if (gender === 'male') {
      if (val >= 21.3) return 100; else if (val >= 19.5) return 95; else if (val >= 17.7) return 90; else if (val >= 16.3) return 85;
      else if (val >= 14.2) return 80; else if (val >= 12.5) return 78; else if (val >= 10.0) return 76; else if (val >= 8.5) return 74;
      else if (val >= 6.0) return 72; else if (val >= 3.7) return 68; else if (val >= 1.0) return 64; else if (val >= -0.5) return 60;
      else if (val >= -2.0) return 50; else if (val >= -4.0) return 40; else if (val >= -6.0) return 30; else if (val >= -7.0) return 20;
      else return 10;
    } else {
      if (val >= 22.2) return 100; else if (val >= 20.6) return 95; else if (val >= 19.0) return 90; else if (val >= 17.5) return 85;
      else if (val >= 16.0) return 80; else if (val >= 14.5) return 78; else if (val >= 13.0) return 76; else if (val >= 11.5) return 74;
      else if (val >= 10.0) return 72; else if (val >= 8.0) return 68; else if (val >= 6.0) return 64; else if (val >= 5.0) return 60;
      else if (val >= 3.0) return 50; else if (val >= 1.0) return 40; else if (val >= 0.0) return 30; else if (val >= -1.0) return 20;
      else return 10;
    }
  },

  // 立定跳远(cm)
  scoreLongJump(gender, val) {
    if (isNaN(val)) return 0;
    if (gender === 'male') {
      if (val >= 263) return 100; else if (val >= 256) return 95; else if (val >= 248) return 90; else if (val >= 244) return 85;
      else if (val >= 235) return 80; else if (val >= 231) return 78; else if (val >= 226) return 76; else if (val >= 222) return 74;
      else if (val >= 218) return 72; else if (val >= 212) return 68; else if (val >= 208) return 64; else if (val >= 203) return 60;
      else if (val >= 196) return 50; else if (val >= 189) return 40; else if (val >= 181) return 30; else if (val >= 170) return 20;
      else return 10;
    } else {
      if (val >= 195) return 100; else if (val >= 188) return 95; else if (val >= 181) return 90; else if (val >= 178) return 85;
      else if (val >= 172) return 80; else if (val >= 168) return 78; else if (val >= 164) return 76; else if (val >= 160) return 74;
      else if (val >= 156) return 72; else if (val >= 152) return 68; else if (val >= 148) return 64; else if (val >= 144) return 60;
      else if (val >= 140) return 50; else if (val >= 135) return 40; else if (val >= 130) return 30; else if (val >= 120) return 20;
      else return 10;
    }
  },

  // 50米跑(秒)- 越小越好
  scoreRun50m(gender, val) {
    if (isNaN(val) || val <= 0) return 0;
    if (gender === 'male') {
      if (val <= 6.7) return 100; else if (val <= 6.8) return 95; else if (val <= 6.9) return 90; else if (val <= 7.0) return 85;
      else if (val <= 7.1) return 80; else if (val <= 7.3) return 78; else if (val <= 7.5) return 76; else if (val <= 7.7) return 74;
      else if (val <= 7.9) return 72; else if (val <= 8.2) return 68; else if (val <= 8.5) return 64; else if (val <= 8.8) return 60;
      else if (val <= 9.1) return 50; else if (val <= 9.5) return 40; else if (val <= 10.0) return 30; else if (val <= 10.5) return 20;
      else return 10;
    } else {
      if (val <= 7.5) return 100; else if (val <= 7.6) return 95; else if (val <= 7.7) return 90; else if (val <= 8.0) return 85;
      else if (val <= 8.3) return 80; else if (val <= 8.5) return 78; else if (val <= 8.7) return 76; else if (val <= 8.9) return 74;
      else if (val <= 9.1) return 72; else if (val <= 9.4) return 68; else if (val <= 9.8) return 64; else if (val <= 10.2) return 60;
      else if (val <= 10.5) return 50; else if (val <= 11.0) return 40; else if (val <= 11.5) return 30; else if (val <= 12.0) return 20;
      else return 10;
    }
  },

  // 800/1000米(秒)
  scoreDuration(gender, val) {
    if (isNaN(val) || val <= 0) return 0;
    if (gender === 'male') {
      if (val <= 197) return 100; else if (val <= 202) return 95; else if (val <= 207) return 90; else if (val <= 212) return 85;
      else if (val <= 217) return 80; else if (val <= 222) return 78; else if (val <= 227) return 76; else if (val <= 232) return 74;
      else if (val <= 237) return 72; else if (val <= 247) return 68; else if (val <= 257) return 64; else if (val <= 272) return 60;
      else if (val <= 292) return 50; else if (val <= 312) return 40; else if (val <= 332) return 30; else if (val <= 352) return 20;
      else return 10;
    } else {
      if (val <= 198) return 100; else if (val <= 203) return 95; else if (val <= 208) return 90; else if (val <= 213) return 85;
      else if (val <= 218) return 80; else if (val <= 223) return 78; else if (val <= 228) return 76; else if (val <= 233) return 74;
      else if (val <= 238) return 72; else if (val <= 248) return 68; else if (val <= 258) return 64; else if (val <= 274) return 60;
      else if (val <= 294) return 50; else if (val <= 314) return 40; else if (val <= 334) return 30; else if (val <= 354) return 20;
      else return 10;
    }
  },

  // 引体向上(男) / 仰卧起坐(女)
  scoreSitups(gender, val) {
    if (isNaN(val)) return 0;
    if (gender === 'male') {
      if (val >= 19) return 100; else if (val >= 18) return 95; else if (val >= 17) return 90; else if (val >= 16) return 85;
      else if (val >= 15) return 80; else if (val >= 14) return 78; else if (val >= 13) return 76; else if (val >= 12) return 74;
      else if (val >= 11) return 72; else if (val >= 10) return 68; else if (val >= 9) return 64; else if (val >= 8) return 60;
      else if (val >= 7) return 50; else if (val >= 6) return 40; else if (val >= 5) return 30; else if (val >= 4) return 20;
      else return 10;
    } else {
      if (val >= 56) return 100; else if (val >= 54) return 95; else if (val >= 52) return 90; else if (val >= 50) return 85;
      else if (val >= 48) return 80; else if (val >= 46) return 78; else if (val >= 44) return 76; else if (val >= 42) return 74;
      else if (val >= 40) return 72; else if (val >= 38) return 68; else if (val >= 36) return 64; else if (val >= 34) return 60;
      else if (val >= 32) return 50; else if (val >= 30) return 40; else if (val >= 26) return 30; else if (val >= 24) return 20;
      else return 10;
    }
  },

  // ===== 清空 =====
  onClear() {
    this.setData({
      height: '', weight: '', bmi: '--', bmiScore: 0, bmiLevel: '',
      vitalCapacity: '', sitAndReach: '', longJump: '', run50m: '', runDuration: '', situps: '',
      scoreVC: 0, scoreSR: 0, scoreLJ: 0, score50: 0, scoreRun: 0, scoreUp: 0,
      totalScore: 0, totalLevel: '', hasResult: false
    });
  },

  // ===== 保存 =====
  onSave() {
    if (!this.data.hasResult) {
      wx.showToast({ title: '请先输入数据并计算', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '保存体测数据',
      content: `总成绩：${this.data.totalScore}分（${this.data.totalLevel}）\n确定保存当前数据？`,
      success: (res) => {
        if (res.confirm) {
          // 保存到本地缓存
          const record = {
            date: new Date().toLocaleDateString(),
            gender: this.data.gender,
            grade: this.data.grade,
            height: this.data.height,
            weight: this.data.weight,
            bmi: this.data.bmi,
            totalScore: this.data.totalScore,
            totalLevel: this.data.totalLevel
          };
          const history = wx.getStorageSync('fitness_history') || [];
          history.unshift(record);
          wx.setStorageSync('fitness_history', history);
          wx.showToast({ title: '保存成功', icon: 'success' });
        }
      }
    });
  }
});
