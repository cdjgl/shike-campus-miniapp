Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    notice: { id: '', title: '', time: '', icon: '', typeColor: '#367BFF', content: '', link: '' },
  },

  /* 预设通知详情内容（无真实消息时的兜底） */
  _detailMap: {
    1: {
      title: '关于2024年秋季学期期末考试安排的通知',
      icon: '教务处',
      time: '10:30',
      content: '<p>各位同学：</p><p>&nbsp;&nbsp;&nbsp;&nbsp;2024年秋季学期期末考试将于<strong>2025年1月6日至1月15日</strong>进行。现将有关事项通知如下：</p><p><strong>一、考试时间安排</strong></p><p>1月6日-8日：公共必修课考试<br/>1月9日-11日：专业必修课考试<br/>1月12日-13日：选修课考试<br/>1月14日-15日：补考/缓考</p><p><strong>二、考场要求</strong></p><p>请携带学生证、身份证双证参考。提前15分钟到达考场。</p><p><strong>三、注意事项</strong></p><p>严禁携带手机等电子设备进入座位，违者按作弊处理。祝大家考试顺利！</p>'
    },
    2: {
      title: '国家助学金申请开始，请符合条件的同学及时申请',
      icon: '学生处',
      time: '昨天',
      content: '<p>亲爱的同学们：</p><p>&nbsp;&nbsp;&nbsp;&nbsp;<strong>2024年度国家助学金申请工作现已启动</strong>，具体事项如下：</p><p><strong>一、申请条件</strong></p><p>• 家庭经济困难、生活俭朴的全日制在校生<br/>• 品行端正，无违纪记录<br/>• 学习成绩合格</p><p><strong>二、助学金等级</strong></p><p>一等助学金：<strong>4300元/年</strong><br/>二等助学金：<strong>3300元/年</strong><br/>三等助学金：<strong>2300元/年</strong></p><p><strong>三、申请流程</strong></p><p>登录学工系统 → 在线填写申请表 → 提交证明材料 → 班级评议 → 学院审核</p><p><strong>四、截止时间</strong></p><p>请于<strong>12月20日前</strong>完成在线申请，逾期不予受理。</p><p>如有疑问请联系辅导员或前往学生资助管理中心咨询。</p>'
    },
    3: {
      title: '新书到馆通知：《Python编程从入门到实践》已上架',
      icon: '图书馆',
      time: '2天前',
      content: '<p>各位读者：</p><p>&nbsp;&nbsp;&nbsp;&nbsp;图书馆新购图书《<strong>程序设计入门（示例）</strong>》已于今日正式上架流通！</p><p><strong>图书信息</strong></p><p>书名：程序设计入门（示例）<br/>作者：示例编者<br/>出版社：示例出版社<br/>书号：000-0-000-00000-0<br/>索书号：示例分类/0001</p><p><strong>馆藏位置</strong></p><p>三楼计算机科学书架 · 编程语言区</p><p><strong>当前状态</strong></p><p>馆藏复本：<strong>5册</strong>（可借3册 / 在馆2册）</p><p>欢迎广大读者借阅学习。</p>'
    },
    4: {
      title: '本周六下午2点至6点将进行宿舍水电检修',
      icon: '校园服务中心（示例）',
      time: '3天前',
      content: '<p>全体住宿同学：</p><p>&nbsp;&nbsp;&nbsp;&nbsp;为保障宿舍水电设施安全运行，校园服务中心（示例）定于<strong>本周六（12月14日）14:00-18:00</strong>进行全楼水电系统检修。</p><p><strong>检修范围</strong></p><p>所有学生宿舍楼（1号楼 - 8号楼）的供水供电系统</p><p><strong>影响说明</strong></p><p>检修期间可能出现以下情况：<br/>• 临时停水约30分钟（分楼层轮流进行）<br/>• 电压不稳，建议关闭电脑等贵重电器<br/>• 热水供应暂停</p><p><strong>温馨提示</strong></p><p>• 请提前储备生活用水<br/>• 充好手机和充电宝电量<br/>• 检修完成后会立即恢复正常供水供电<br/>• 如遇紧急问题请联系宿管阿姨或拨打服务热线：<strong>000-0000-0000</strong></p><p>感谢大家的理解与配合！</p>'
    },
  },

  onLoad(options) {
    var sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 });

    // 优先使用消息页传入的真实通知
    var app = getApp();
    var passed = (app && app.globalData) ? app.globalData.pendingNotice : null;
    if (passed) {
      app.globalData.pendingNotice = null;
      this.setData({
        notice: {
          id: passed.id || '',
          title: passed.title || '通知详情',
          time: passed.time || '',
          icon: passed.typeName || '系统通知',
          typeColor: passed.typeColor || '#367BFF',
          content: passed.content || '',
          link: passed.link || '',
        },
      });
      return;
    }

    var id = parseInt(options.id) || 0;
    var detail = this._detailMap[id] || this._defaultDetail(id);
    this.setData({ notice: detail });
  },

  goBack() {
    wx.navigateBack();
  },

  goLink() {
    var link = this.data.notice && this.data.notice.link;
    if (link) wx.navigateTo({ url: link });
  },

  _defaultDetail(id) {
    return {
      title: '通知详情',
      icon: '系统通知',
      time: '',
      typeColor: '#367BFF',
      content: '<p>暂无该通知的详细内容，请联系相关部门获取更多信息。</p>',
      link: '',
    };
  },
});
