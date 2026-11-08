Page({
  data: {
    categories: ['全部', '学术科技', '文艺体育', '志愿公益', '兴趣爱好', '创业实践'],
    activeCategory: 0,
    clubs: [],
    filteredClubs: [],
    joinedIds: [],
    searchValue: '',
  },

  onLoad() {
    this.loadClubs();
    this.loadJoinedClubs();
    // 确保两个数据都加载完后重新过滤
    setTimeout(() => this.filterClubs(), 100);
  },

  onShow() {
    // 从详情页返回时，重新读取缓存中的已加入状态
    if (this.data.clubs.length > 0) {
      const joined = wx.getStorageSync('joinedClubs') || [];
      if (JSON.stringify(joined) !== JSON.stringify(this.data.joinedIds)) {
        this.setData({ joinedIds: joined });
        this.filterClubs();
      }
    }
  },

  loadClubs() {
    const clubs = [
      // ===== 学术科技 =====
      { id: 1, name: '计算机协会', category: '学术科技', intro: '探索前沿技术，培养编程能力，参加各类竞赛。', memberCount: 186, president: '张明远', tags: ['编程', 'AI', '竞赛'], established: '2018', contact: '招新群：示例号码' },
      { id: 2, name: '英语角', category: '学术科技', intro: '提升英语口语，结交国际友人，备考英语等级考试。', memberCount: 260, president: '吴雨桐', tags: ['英语', '口语', '考试'], established: '2014', contact: '社交账号：示例' },
      { id: 3, name: '辩论队', category: '学术科技', intro: '唇枪舌剑，思维碰撞。培养逻辑思维和表达能力。', memberCount: 72, president: '刘思琪', tags: ['辩论', '演讲', '逻辑'], established: '2016', contact: '群聊：示例号码' },
      { id: 4, name: '数学建模协会', category: '学术科技', intro: '备战各类建模竞赛，分享建模经验，组队参赛。', memberCount: 98, president: '林浩然', tags: ['数学', '建模', '竞赛'], established: '2020', contact: '联系方式：示例账号' },
      { id: 5, name: '机器人实验室', category: '学术科技', intro: '设计搭建机器人，参加机器人竞赛等赛事。', memberCount: 56, president: '郑子轩', tags: ['机器人', '硬件', 'AI'], established: '2019', contact: '实验室B栋302，每周三晚开放' },
      // ===== 文艺体育 =====
      { id: 6, name: '音乐社', category: '文艺体育', intro: '用音符谱写青春，设有吉他、钢琴、声乐等小组。', memberCount: 210, president: '李若曦', tags: ['乐器', '声乐', '乐队'], established: '2015', contact: '群聊：示例号码' },
      { id: 7, name: '篮球协会', category: '文艺体育', intro: '热爱篮球，挥洒汗水！定期组织校内联赛和训练。', memberCount: 320, president: '王俊杰', tags: ['篮球', '运动', '联赛'], established: '2010', contact: '体育馆篮球场 每周一/三/五 18:00' },
      { id: 8, name: '舞蹈社', category: '文艺体育', intro: '街舞、民族舞、现代舞，总有一款适合你。', memberCount: 145, president: '陈诗涵', tags: ['街舞', '民族舞', '表演'], established: '2016', contact: '大学生活动中心舞蹈房 周六14:00' },
      { id: 9, name: '足球社', category: '文艺体育', intro: '绿茵场上的激情！每周训练+校内联赛+校外交流赛。', memberCount: 188, president: '黄志强', tags: ['足球', '运动', '联赛'], established: '2012', contact: '北校区足球场 周二/四 17:00' },
      { id: 10, name: '话剧团', category: '文艺体育', intro: '演绎百味人生，每年举办年度大戏和专场演出。', memberCount: 86, president: '周小棠', tags: ['表演', '编剧', '舞台'], established: '2013', contact: '艺术楼小剧场 周日19:00排练' },
      { id: 11, name: '乒乓球俱乐部', category: '文艺体育', intro: '国球爱好者之家，从新手到大神都能找到对手。', memberCount: 165, president: '赵一鸣', tags: ['乒乓球', '竞技', '休闲'], established: '2017', contact: '体育馆乒乓球室 全天开放' },
      // ===== 志愿公益 =====
      { id: 12, name: '志愿者协会', category: '志愿公益', intro: '奉献爱心，服务校园。组织支教、环保等公益活动。', memberCount: 450, president: '孙悦然', tags: ['公益', '支教', '环保'], established: '2008', contact: '社交账号：示例 | 办公室：学生中心A108' },
      { id: 13, name: '环保协会', category: '志愿公益', intro: '保护校园环境，倡导绿色生活，参与环保项目。', memberCount: 130, president: '钱多多', tags: ['环保', '绿色', '回收'], established: '2020', contact: '每月最后一个周六 校园环保行动' },
      { id: 14, name: '爱心助学社', category: '志愿公益', intro: '资助贫困学子，开展课业辅导和募捐活动。', memberCount: 92, president: '韩雨萱', tags: ['助学', '募捐', '辅导'], established: '2019', contact: '群聊：示例号码' },
      // ===== 兴趣爱好 =====
      { id: 15, name: '摄影社', category: '兴趣爱好', intro: '用镜头记录美好瞬间，学习摄影技巧，举办摄影展。', memberCount: 95, president: '沈光影', tags: ['摄影', '后期', '展览'], established: '2019', contact: '社交账号：示例 | 周六外拍采风' },
      { id: 16, name: '动漫社', category: '兴趣爱好', intro: '二次元爱好者的聚集地，cosplay、绘画、配音等。', memberCount: 168, president: '冯小漫', tags: ['动漫', 'cosplay', '绘画'], established: '2017', contact: '视频账号：示例 | 群聊：示例号码' },
      { id: 17, name: '书法协会', category: '兴趣爱好', intro: '传承国粹，修身养性。软硬笔兼修，定期展出作品。', memberCount: 76, president: '褚墨白', tags: ['书法', '国画', '传统文化'], established: '2015', contact: '图书馆三楼书画教室 周五16:00' },
      { id: 18, name: '桌游棋牌社', category: '兴趣爱好', intro: '狼人杀、剧本杀、象棋、围棋，周末一起嗨！', memberCount: 210, president: '蒋乐天', tags: ['桌游', '剧本杀', '棋牌'], established: '2018', contact: '学生活动中心405 每周五晚19:00' },
      { id: 19, name: '美食烹饪社', category: '兴趣爱好', intro: '吃货的天堂！学习烘焙、料理，分享美食心得。', memberCount: 135, president: '戴甜甜', tags: ['烘焙', '料理', '美食'], established: '2021', contact: '食堂二楼DIY厨房 周六15:00' },
      // ===== 创业实践 =====
      { id: 20, name: '创新创业协会', category: '创业实践', intro: '孵化创业项目，对接导师资源，参加创新创业比赛等活动。', memberCount: 178, president: '曹启航', tags: ['创业', '路演', '商业'], established: '2019', contact: '创业孵化基地101室 | 联系方式：示例账号' },
      { id: 21, name: '投资理财协会', category: '创业实践', intro: '学习股票基金知识，模拟交易比赛，培养财商。', memberCount: 120, president: '魏金生', tags: ['投资', '理财', '金融'], established: '2020', contact: '经管学院报告厅 双周讲座' },
      { id: 22, name: '营销策划社', category: '创业实践', intro: '品牌推广、活动策划、文案创意，实战中成长。', memberCount: 88, president: '陶思远', tags: ['营销', '策划', '文案'], established: '2021', contact: '群聊：示例账号' },
    ];
    this.setData({ clubs });
    this.filterClubs();
  },

  loadJoinedClubs() {
    const joined = wx.getStorageSync('joinedClubs') || [];
    this.setData({ joinedIds: joined });
  },

  filterClubs() {
    const { clubs, activeCategory, categories, joinedIds } = this.data;
    let filtered = clubs;
    if (activeCategory > 0 && activeCategory < categories.length) {
      const cat = categories[activeCategory];
      filtered = clubs.filter(c => c.category === cat);
    }
    // 预计算每个社团的 joined 状态，避免模板中用 indexOf
    const result = filtered.map(c => ({
      ...c,
      joined: joinedIds.includes(c.id),
    }));
    this.setData({ filteredClubs: result });
  },

  switchCategory(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeCategory: index }, () => {
      this.filterClubs();
    });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/club/detail?id=${id}` });
  },

  joinClub(e) {
    const id = e.currentTarget.dataset.id;
    let { joinedIds, clubs } = this.data;

    if (joinedIds.includes(id)) {
      // 取消加入 → 人数 -1
      const newJoined = joinedIds.filter(i => i !== id);
      const updatedClubs = clubs.map(c =>
        c.id === id ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c
      );
      this.setData({ joinedIds: newJoined, clubs: updatedClubs }, () => this.filterClubs());
      wx.setStorageSync('joinedClubs', newJoined);
      wx.showToast({ title: '已退出社团', icon: 'none' });
    } else {
      // 加入社团 → 人数 +1
      const newJoined = [...joinedIds, id];
      const updatedClubs = clubs.map(c =>
        c.id === id ? { ...c, memberCount: c.memberCount + 1 } : c
      );
      this.setData({ joinedIds: newJoined, clubs: updatedClubs }, () => this.filterClubs());
      wx.setStorageSync('joinedClubs', newJoined);
      wx.showToast({ title: '加入成功', icon: 'success' });
    }
  },

  onSearch(e) {
    const value = e.detail.value || e.detail;
    this.setData({ searchValue: value });
    if (value && value.trim()) {
      const keyword = value.trim().toLowerCase();
      const { clubs, joinedIds } = this.data;
      const filtered = clubs.filter(c =>
        c.name.toLowerCase().includes(keyword) ||
        c.intro.toLowerCase().includes(keyword) ||
        c.tags.some(t => t.toLowerCase().includes(keyword))
      ).map(c => ({ ...c, joined: joinedIds.includes(c.id) }));
      this.setData({ filteredClubs: filtered, activeCategory: -1 });
    } else {
      this.setData({ activeCategory: 0 }, () => this.filterClubs());
    }
  },
});
