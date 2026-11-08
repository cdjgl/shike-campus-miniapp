Page({
  data: {
    club: null,
    joined: false,
    showModal: false,
  },

  onLoad(options) {
    const id = parseInt(options.id);
    this.loadClubDetail(id);
  },

  loadClubDetail(id) {
    // 社团详情数据（与列表页一一对应）
    const clubMap = {
      1: { id:1, name:'计算机协会', category:'学术科技', memberCount:186, president:'张明远', tags:['编程','AI','竞赛'], established:'2018',
        description:'计算机协会成立于2018年，是校园内最具影响力的学术科技类社团之一。我们致力于为同学们提供学习交流的平台，定期举办编程竞赛、技术讲座和项目实战活动。\n\n协会设有多个学习小组：\n• Web前端开发组\n• 后端与数据库组\n• AI与机器学习组\n• 网络安全组\n\n无论你是零基础小白还是技术大佬，都能在这里找到志同道合的伙伴！',
        activities:['每周三晚技术分享会','每月编程竞赛','学期项目展示','企业参观交流'],
        contact:'招新群：示例号码 | 联系方式：示例账号', honor:'2025年度十佳社团' },

      2: { id:2, name:'英语角', category:'学术科技', memberCount:260, president:'吴雨桐', tags:['英语','口语','考试'], established:'2014',
        description:'英语角为同学们创造沉浸式英语环境，提供口语练习、考试辅导和国际交流机会。\n\n活动形式：\n• Free Talk自由交流（每周二/四晚）\n• 主题演讲与讨论\n• 英语等级考试备考冲刺班\n• 留学生交流会（每月一次）\n\n外教定期参与指导，氛围轻松有趣。',
        activities:['每周二/四英语角','英语演讲比赛','英语等级考试冲刺班','国际文化节'],
        contact:'社交账号：示例 | 群聊：示例账号', honor:'最佳学习型社团' },

      3: { id:3, name:'辩论队', category:'学术科技', memberCount:72, president:'刘思琪', tags:['辩论','演讲','逻辑'], established:'2016',
        description:'辩论队致力于培养队员的逻辑思维、语言表达和临场应变能力。定期组织队内训练赛，参加校际辩论联赛。\n\n训练体系：\n• 基础理论：逻辑学与论证技巧\n• 实战训练：模拟辩论+复盘分析\n• 专题研究：热点赛题深度研讨\n• 赛事备战：校际联赛专项集训\n\n曾获多项校际辩论赛事荣誉。',
        activities:['每周队内模拟辩论','校际友谊赛','辩论技巧讲座','年度校际辩论联赛'],
        contact:'群聊：示例号码 | 招新时间：每年9月', honor:'2025校际辩论联赛季军' },

      4: { id:4, name:'数学建模协会', category:'学术科技', memberCount:98, president:'林浩然', tags:['数学','建模','竞赛'], established:'2020',
        description:'数学建模协会专注于培养同学们的数学思维和解决实际问题的能力。为国赛、美赛等大型竞赛输送优秀队伍。\n\n培训内容：\n• MATLAB/Python建模基础\n• 常用算法精讲（优化、预测、评价）\n• 论文写作规范与技巧\n• 往届真题解析与实战演练\n\n无论你是否有数学基础，只要愿意学，我们都欢迎！',
        activities:['周末建模集训营','国赛/美赛赛前特训','论文写作工作坊','校内建模选拔赛'],
        contact:'联系方式：示例账号 | 教室：理科楼B305', honor:'校内建模比赛一等奖（示例）' },

      5: { id:5, name:'机器人实验室', category:'学术科技', memberCount:56, president:'郑子轩', tags:['机器人','硬件','AI'], established:'2019',
        description:'机器人实验室是科技爱好者的圣地！从机械设计到嵌入式开发，从视觉识别到路径规划，全流程参与机器人的研发。\n\n研究方向：\n• 机器人竞赛参赛队\n• 机器人操作系统开发\n• 无人机自主导航\n• 智能小车竞速\n\n实验室配备3D打印机、激光切割、示波器等专业设备。',
        activities:['机器人竞赛备赛训练','开源项目开发周','硬件DIY工作坊','年度成果展示'],
        contact:'实验室地点：工程楼B栋302 | 开放时间：每周三晚18:00-21:00', honor:'校内机器人竞赛十六强（示例）' },

      6: { id:6, name:'音乐社', category:'文艺体育', memberCount:210, president:'李若曦', tags:['乐器','声乐','乐队'], established:'2015',
        description:'音乐社是校园文艺活动的核心力量，汇聚了各类音乐爱好者。设有吉他、钢琴、声乐、架子鼓等多个兴趣小组。\n\n特色板块：\n• 校园音乐节（每学期一次，千人规模）\n• 草地音乐会（每月一次，轻松氛围）\n• 乐队排练与演出\n• 音乐教学课程（零基础友好）\n\n乐器可借用，零基础也能加入！',
        activities:['每周五乐队排练','草地音乐会','校园音乐节','乐器入门教学'],
        contact:'群聊：示例号码 | 练习房：艺术楼201', honor:'校园文化艺术节一等奖' },

      7: { id:7, name:'篮球协会', category:'文艺体育', memberCount:320, president:'王俊杰', tags:['篮球','运动','联赛'], established:'2010',
        description:'篮球协会是校园内规模最大的体育社团，成立超过15年。拥有完善的梯队体系，从新手训练营到校队选拔全覆盖。\n\n训练体系：\n• 新手营：运球/投篮基本功\n• 进阶组：战术配合与对抗\n• 校队：代表学校参加高校联赛\n• 裁判组：培养篮球裁判人才\n\n每年举办校内"拾刻杯"篮球联赛。',
        activities:['每周一/三/五训练','拾刻杯校内联赛','校外高校交流赛','裁判员认证培训'],
        contact:'训练场地：体育馆主馆 | 时间：周一/三/五 18:00-20:00', honor:'2024市大学生篮球联赛八强' },

      8: { id:8, name:'舞蹈社', category:'文艺体育', memberCount:145, president:'陈诗涵', tags:['街舞','民族舞','表演'], established:'2016',
        description:'舞蹈社汇聚了各路舞蹈爱好者，设有街舞（Breaking/Popping/Jazz/K-Pop）、民族舞、现代舞三个方向。\n\n舞蹈方向：\n• Breaking/Popping/Jazz街舞组\n• 民族舞/古典舞组\n• 现代舞/当代舞组\n• K-Pop韩舞翻跳组\n\n每学期末举办专场公演，零基础欢迎报名！',
        activities:['每周四次分组训练','迎新晚会/毕业晚会表演','校园舞蹈大赛','舞蹈workshop邀请专业老师'],
        contact:'练习场地：大学生活动中心舞蹈房 | 排练时间：周六14:00-17:00', honor:'校园舞蹈大赛团体冠军×2' },

      9: { id:9, name:'足球社', category:'文艺体育', memberCount:188, president:'黄志强', tags:['足球','运动','联赛'], established:'2012',
        description:'足球社是绿茵场上最热血的社团，从5人制趣味赛到11人制正式比赛，满足不同水平需求。\n\n活动内容：\n• 周常训练：传球、射门、战术演练\n• 校内联赛："校长杯"年度足球赛\n• 校外交流：与其他高校友谊赛\n• 观赛活动：一起看欧冠/世界杯\n\n装备可借，新人有专属教学环节。',
        activities:['周二/周四常规训练','校长杯年度足球联赛','高校足球友谊赛','重大赛事观赛夜'],
        contact:'北校区天然草足球场 | 训练时间：周二/四 17:00-19:00', honor:'市长杯高校足球赛亚军' },

      10:{id:10,name:'话剧团', category:'文艺体育', memberCount:86, president:'周小棠', tags:['表演','编剧','舞台'], established:'2013',
        description:'话剧团是校园文化的金字招牌，以"演绎百味人生"为宗旨。每年推出年度大戏和多场专场演出。\n\n团队构成：\n• 表演组：台词功底、肢体表达、角色塑造\n• 编剧组：剧本创作、改编经典\n• 舞美组：灯光、音响、道具、服装\n• 导演组：统筹排练、舞台调度\n\n无需经验，热爱即可加入！',
        activities:['周日固定排练','年度大戏公演','新生短剧展演','戏剧工作坊'],
        contact:'排练场地：艺术楼小剧场 | 时间：周日19:00-21:30', honor:'省级大学生话剧展演金奖' },

      11:{id:11,name:'乒乓球俱乐部', category:'文艺体育', memberCount:165, president:'赵一鸣', tags:['乒乓球','竞技','休闲'], established:'2017',
        description:'乒乓球俱乐部是国球爱好者的温馨之家。从休闲娱乐到竞技比赛，满足所有水平的球友。\n\n活动形式：\n• 自由对打：随时来球台切磋\n• 技术教学：正反手、发球、步法\n• 内部月赛：排名积分系统\n• 对外交流：校际乒乓联谊赛\n\n球拍和球免费提供，带上好心情就行！',
        activities:['每日开放自由打球','月度内部排名赛','校际乒乓联谊','技术提升培训班'],
        contact:'体育馆乒乓球室 | 开放时间：全天 16:00-21:00', honor:'市级大学生乒乓球赛季军' },

      12:{id:12,name:'志愿者协会', category:'志愿公益', memberCount:450, president:'孙悦然', tags:['公益','支教','环保'], established:'2008',
        description:'志愿者协会是校园历史最悠久、规模最大的公益组织，以"奉献、友爱、互助、进步"为志愿精神。\n\n品牌项目：\n• 山区支教（寒暑假，连续12年）\n• 校园环保行动（垃圾分类推广）\n• 敬老院慰问（每月一次）\n• 社区便民服务（周末常态化）\n\n累计志愿服务时长达10万+小时。',
        activities:['周末社区服务','寒暑假山区支教','每月敬老院慰问','校园垃圾分类推广日'],
        contact:'办公地点：学生中心A108 | 社交账号：示例 | 电话：示例号码', honor:'校内优秀志愿服务组织（示例）' },

      13:{id:13,name:'环保协会', category:'志愿公益', memberCount:130, president:'钱多多', tags:['环保','绿色','回收'], established:'2020',
        description:'环保协会以"绿色校园，从我做起"为理念，通过实际行动推动校园可持续发展。\n\n主要项目：\n• 校园垃圾分类督导与宣传\n• 旧书/衣物回收与循环利用\n• 环保知识科普进课堂\n• 校园植树绿化行动\n\n（示例说明：以上活动与认证信息均为演示数据，不对应任何真实机构。）',
        activities:['每月最后一个周六：环保主题日','旧物交换市集','环保知识竞赛','校园植树节'],
        contact:'社交账号：示例 | 活动群：示例号码', honor:'校园绿色行动示范社团（示例）' },

      14:{id:14,name:'爱心助学社', category:'志愿公益', memberCount:92, president:'韩雨萱', tags:['助学','募捐','辅导'], established:'2019',
        description:'爱心助学社致力于帮助家庭困难的同学完成学业，开展课业辅导和爱心募捐活动。\n\n工作方向：\n• 一对一课业帮扶（学霸帮学渣）\n• 爱心募捐（文具、书籍、冬衣）\n• 心理陪伴（倾听与疏导）\n• 助学金申请协助\n\n已累计资助120余名同学顺利完成学业。',
        activities:['每周课业辅导时段','期末考前冲刺帮扶会','冬季暖心募捐','新生入学引导'],
        contact:'群聊：示例号码 | 邮箱：demo1@example.com', honor:'校级优秀公益社团' },

      15:{id:15,name:'摄影社', category:'兴趣爱好', memberCount:95, president:'沈光影', tags:['摄影','后期','展览'], established:'2019',
        description:'摄影社聚集了一群热爱光影艺术的伙伴，无论单反玩家还是手机摄影达人都能在此成长。\n\n学习内容：\n• 构图美学与光线运用\n• 人像/风光/纪实/街拍专题\n• Lightroom & Photoshop后期调色\n• 手机摄影速成技巧\n• 短视频拍摄与剪辑入门\n\n设备不限，手机也能拍大片！',
        activities:['每周六外拍采风','摄影技巧分享会','学期摄影展（作品展出）','作品点评互评会'],
        contact:'社交账号：示例 | 视频账号：示例 | 外拍集合：校门口', honor:'最美校园摄影大赛最佳组织奖' },

      16:{id:16,name:'动漫社', category:'兴趣爱好', memberCount:168, president:'冯小漫', tags:['动漫','cosplay','绘画'], established:'2017',
        description:'动漫社是二次元文化的校园阵地！无论追番党、coser还是画师，这里都是你的家。\n\n兴趣板块：\n• Cosplay演出与拍摄（服装道具共享）\n• 动漫绘画交流（板绘/手绘）\n• 配音翻唱录制\n• 漫展组团出行（CP展/Comicup）\n• 新番讨论会（每周更新）\n\nACG文化爱好者的大本营！',
        activities:['Cosplay排练与拍摄','漫展集体出行','动漫放映会','绘画/配音工作坊'],
        contact:'视频账号：示例 | 群聊：示例号码', honor:'校内动漫展优秀社团（示例）' },

      17:{id:17,name:'书法协会', category:'兴趣爱好', memberCount:76, president:'褚墨白', tags:['书法','国画','传统文化'], established:'2015',
        description:'书法协会以传承中华传统文化为己任，修身养性，陶冶情操。\n\n教学内容：\n• 楷书入门（颜体/欧体/柳体）\n• 行书进阶（兰亭序/圣教序）\n• 隶书与篆书体验\n• 国画基础（花鸟/山水）\n• 书法创作与展览\n\n笔墨纸砚由协会提供，零门槛入会。',
        activities:['每周五书法练习与指导','春节送春联活动','学期书画作品展','传统文化体验日'],
        contact:'练习教室：图书馆三楼书画教室 | 时间：周五16:00-18:00', honor:'市大学生书法展二等奖' },

      18:{id:18,name:'桌游棋牌社', category:'兴趣爱好', memberCount:210, president:'蒋乐天', tags:['桌游','剧本杀','棋牌'], established:'2018',
        description:'桌游棋牌社是社交达人的聚集地，以游戏会友，在欢声笑语中结识新朋友。\n\n游戏类型：\n• 策略桌游（卡坦岛、璀璨宝石）\n• 剧本杀（情感/推理/机制）\n• 棋牌竞技（象棋/围棋/三国杀）\n• 派对游戏（狼人杀、UNO）\n\n拥有200+款正版桌游，免费畅玩！',
        activities:['每周五桌游之夜（19:00起）','剧本杀专场','狼人杀争霸赛','桌游新品试玩会'],
        contact:'活动室：学生活动中心405 | 时间：每周五/六晚 19:00-23:00', honor:'最受欢迎社团TOP3' },

      19:{id:19,name:'美食烹饪社', category:'兴趣爱好', memberCount:135, president:'戴甜甜', tags:['烘焙','料理','美食'], established:'2021',
        description:'美食烹饪社是吃货们的天堂！从烘焙甜点到家常料理，亲手制作美味。\n\n烹饪课程：\n• 烘焙入门：饼干/蛋糕/面包\n• 中式料理：炒菜/面点/汤品\n• 西式简餐：意面/沙拉/三明治\n• 甜品制作：奶茶/冰淇淋/布丁\n• 美食探店分享\n\n食材由社团提供，做完还能带走分享！',
        activities:['每周六烘焙/料理课','美食探店团','节日限定美食制作','厨艺大比拼'],
        contact:'食堂二楼DIY厨房 | 时间：每周六 15:00-17:30', honor:'校园美食节最佳摊位奖' },

      20:{id:20,name:'创新创业协会', category:'创业实践', memberCount:178, president:'曹启航', tags:['创业','路演','商业'], established:'2019',
        description:'创新创业协会是创业梦想家的孵化器，对接导师资源，参加"互联网+"等顶级赛事。\n\n服务体系：\n• 创业导师一对一指导（校友企业家）\n• 项目路演与打磨\n• 商业计划书撰写培训\n• "互联网+"/"挑战杯"赛前集训\n• 创业孵化基地入驻支持\n\n已有5个孵化项目获得天使投资。',
        activities:['创业项目路演会','商业计划书训练营','互联网+大赛集训','校友创业者分享会'],
        contact:'创业孵化基地101室 | 联系方式：示例账号', honor:'校内创新创业比赛金奖（示例）' },

      21:{id:21,name:'投资理财协会', category:'创业实践', memberCount:120, president:'魏金生', tags:['投资','理财','金融'], established:'2020',
        description:'投资理财协会帮助同学建立正确的金钱观，学习投资理财知识，从校园开始积累财富智慧。\n\n学习模块：\n• 股票基金基础知识\n• 模拟炒股实盘比赛\n• 个人财务规划\n• 区块链与数字货币科普\n• 金融行业职业发展\n\n使用虚拟资金交易，零风险学习理财。',
        activities:['双周投资理财讲座','模拟炒股季度赛','金融大咖分享会','理财规划工作坊'],
        contact:'经管学院报告厅 | 双周周三晚19:00', honor:'模拟炒股大赛全省前十' },

      22:{id:22,name:'营销策划社', category:'创业实践', memberCount:88, president:'陶思远', tags:['营销','策划','文案'], established:'2021',
        description:'营销策划社聚焦品牌传播、活动策划和创意文案，在实战中锻炼营销能力。\n\n能力培养：\n• 品牌定位与传播策略\n• 活动策划与执行\n• 文案写作与创意\n• 社交媒体运营\n• 数据分析与效果评估\n\n承接真实商业项目，简历加分利器！',
        activities:['品牌策划实战项目','文案创作工坊','社交媒体运营实操','营销案例分析会'],
        contact:'群聊：示例账号 | 合作邮箱：demo2@example.com', honor:'校内广告创意比赛优秀奖（示例）' },
    };

    const club = clubMap[id];
    if (!club) {
      wx.showToast({ title: '社团不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    
    const joinedIds = wx.getStorageSync('joinedClubs') || [];
    const joined = joinedIds.includes(id);

    this.setData({ club, joined });
  },

  toggleJoin() {
    const { club, joined } = this.data;
    if (!club) return;
    let joinedIds = wx.getStorageSync('joinedClubs') || [];

    if (joined) {
      joinedIds = joinedIds.filter(i => i !== club.id);
      wx.setStorageSync('joinedClubs', joinedIds);
      this.setData({ joined: false });
      wx.showToast({ title: '已退出社团', icon: 'none' });
    } else {
      joinedIds.push(club.id);
      wx.setStorageSync('joinedClubs', joinedIds);
      this.setData({ joined: true, club: {...club, memberCount: club.memberCount + 1} });
      wx.showToast({ title: '加入成功！', icon: 'success' });
    }
  },

  showContact() {
    this.setData({ showModal: true });
  },

  hideContact() {
    this.setData({ showModal: false });
  },

  onShareAppMessage() {
    const { club } = this.data;
    return {
      title: club ? `${club.name} - 拾刻校园通` : '拾刻校园通',
      path: `/pages/club/detail?id=${club ? club.id : ''}`,
    };
  },
});
