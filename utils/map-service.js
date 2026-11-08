/**
 * 校园地点与路线规划 —— 纯本地模拟实现
 *
 * 本项目不调用任何第三方地图 HTTP 接口，不需要 API Key，
 * 不依赖任何地图服务商的 SDK、POI 数据或地图瓦片。
 * 地点名称、坐标、路线、时长与费用全部为虚构演示数据，
 * 不对应任何真实地点，也不构成真实导航建议。
 *
 * 地图底图与选点能力由小程序运行平台的原生组件 / 接口提供
 * （<map>、wx.chooseLocation、wx.getLocation），属于平台自带能力，
 * 无需申请 Key，也不在本项目分发范围内。
 */

/* 虚构校园中心坐标，仅用于本地演示的相对定位 */
var CENTER = { lat: 30.5700, lng: 104.0660 };

/* 虚构校园地点表：全部为通用设施名称，不指向任何真实地点 */
var CAMPUS_PLACES = [
  { id: 'p01', title: '中心教学楼', address: '校园中心区', category: '教学', latitude: 30.5700, longitude: 104.0660 },
  { id: 'p02', title: '图书馆',     address: '中心区北侧', category: '学习', latitude: 30.5718, longitude: 104.0662 },
  { id: 'p03', title: '第一食堂',   address: '东区生活街', category: '生活', latitude: 30.5693, longitude: 104.0680 },
  { id: 'p04', title: '第二食堂',   address: '西区生活街', category: '生活', latitude: 30.5696, longitude: 104.0638 },
  { id: 'p05', title: '体育馆',     address: '南区运动场', category: '运动', latitude: 30.5678, longitude: 104.0665 },
  { id: 'p06', title: '田径场',     address: '南区',       category: '运动', latitude: 30.5672, longitude: 104.0672 },
  { id: 'p07', title: '学生公寓北区', address: '北区宿舍', category: '住宿', latitude: 30.5730, longitude: 104.0652 },
  { id: 'p08', title: '学生公寓南区', address: '南区宿舍', category: '住宿', latitude: 30.5675, longitude: 104.0645 },
  { id: 'p09', title: '校医院',     address: '西区',       category: '服务', latitude: 30.5710, longitude: 104.0635 },
  { id: 'p10', title: '行政楼',     address: '中心区南侧', category: '办公', latitude: 30.5688, longitude: 104.0652 },
  { id: 'p11', title: '实验楼',     address: '东区',       category: '教学', latitude: 30.5706, longitude: 104.0690 },
  { id: 'p12', title: '南校门',     address: '校园南侧入口', category: '出入口', latitude: 30.5665, longitude: 104.0660 },
  { id: 'p13', title: '北校门',     address: '校园北侧入口', category: '出入口', latitude: 30.5740, longitude: 104.0660 },
  { id: 'p14', title: '校园快递中心', address: '东区生活街', category: '服务', latitude: 30.5698, longitude: 104.0688 },
  { id: 'p15', title: '校园超市',   address: '中心区',     category: '生活', latitude: 30.5703, longitude: 104.0648 },
  { id: 'p16', title: '湖畔广场',   address: '中心区西侧', category: '景观', latitude: 30.5712, longitude: 104.0642 }
];

/* 兼容保留：本项目不含任何密钥，也没有外部服务地址 */
var KEY = '';
var BASE = '';

var TRANSIT_POLICY = {
  LEAST_TIME: 'LEAST_TIME',
  LEAST_TRANSFER: 'LEAST_TRANSFER',
  LEAST_WALKING: 'LEAST_WALKING',
  SUBWAY_FIRST: 'SUBWAY_FIRST'
};

/* ========== 通用工具 ========== */

function toRad(d) { return d * Math.PI / 180; }

/** 两点间球面距离（米） */
function distanceBetween(a, b) {
  var R = 6371000;
  var dLat = toRad(b.lat - a.lat);
  var dLng = toRad(b.lng - a.lng);
  var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
}

/** 通用坐标转换：兼容点对象数组与 [lat,lng,...] 扁平数组 */
function toPoints(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return [];
  if (typeof arr[0] === 'object') {
    return arr.filter(function (p) {
      return p && typeof p.latitude === 'number' && typeof p.longitude === 'number';
    });
  }
  var pts = [];
  for (var i = 0; i + 1 < arr.length; i += 2) {
    pts.push({ latitude: Number(arr[i]), longitude: Number(arr[i + 1]) });
  }
  return pts;
}
var arrayToPoints = toPoints;
var coorsToPoints = toPoints;

function placeOf(p) {
  return {
    id: p.id, title: p.title, address: p.address,
    latitude: p.latitude, longitude: p.longitude, category: p.category
  };
}

function matchPlaces(keyword) {
  var q = String(keyword || '').trim().toLowerCase();
  if (!q) return CAMPUS_PLACES.slice(0, 8).map(placeOf);
  return CAMPUS_PLACES.filter(function (p) {
    return (p.title + ' ' + p.address + ' ' + p.category).toLowerCase().indexOf(q) >= 0;
  }).map(placeOf);
}

/* ========== 地点搜索（本地） ========== */

function searchSuggestion(keyword) {
  return Promise.resolve(matchPlaces(keyword));
}

function searchPlace(keyword) {
  return Promise.resolve(matchPlaces(keyword));
}

function reverseGeocoder(lat, lng) {
  var nearest = null, min = Infinity;
  CAMPUS_PLACES.forEach(function (p) {
    var d = distanceBetween({ lat: lat, lng: lng }, { lat: p.latitude, lng: p.longitude });
    if (d < min) { min = d; nearest = p; }
  });
  var name = nearest ? nearest.title : '校园内（演示位置）';
  return Promise.resolve({ address: name, name: name, city: '', district: '' });
}

/* ========== 路线规划（本地生成） ========== */

/** 生成一条带轻微弯折的演示折线 */
function makePolyline(from, to) {
  var pts = [];
  var n = 6;
  for (var i = 0; i <= n; i++) {
    var t = i / n;
    var bend = (i === 0 || i === n) ? 0 : Math.sin(t * Math.PI * 2) * 0.00018;
    pts.push({
      latitude: from.lat + (to.lat - from.lat) * t + bend,
      longitude: from.lng + (to.lng - from.lng) * t - bend
    });
  }
  return pts;
}

function makeSteps(mode, distance, duration, polyline) {
  var verb = mode === 'walking' ? '步行' :
             mode === 'bicycle' ? '骑行' :
             mode === 'transit' ? '乘车' : '沿校园道路行驶';
  var a = Math.round(distance * 0.35);
  var b = Math.round(distance * 0.40);
  return [
    { instruction: '从起点出发，' + verb + '前往校园主路', distance: a, duration: Math.round(duration * 0.35), mode: mode },
    { instruction: '沿主路继续' + verb + '，经过中心区', distance: b, duration: Math.round(duration * 0.40), mode: mode },
    { instruction: '抵达目的地附近，行程结束', distance: distance - a - b, duration: duration - Math.round(duration * 0.35) - Math.round(duration * 0.40), mode: mode }
  ];
}

/** 按出行方式生成一条模拟路线 */
function buildRoute(from, to, mode) {
  var speed = { driving: 7.0, taxi: 7.0, transit: 5.0, bicycle: 4.2, walking: 1.3 }[mode] || 5.0;
  var straight = distanceBetween(from, to);
  var distance = Math.max(80, Math.round(straight * 1.25));
  var duration = Math.max(60, Math.round(distance / speed));
  var polyline = makePolyline(from, to);
  return {
    routes: [{
      distance: distance,
      duration: duration,
      steps: makeSteps(mode, distance, duration, polyline),
      polyline: polyline,
      tolls: 0,
      mode: mode
    }],
    allPolylineSets: [{ points: polyline, color: '#367BFF', width: 5 }]
  };
}

function routeOf(from, to, mode) {
  return Promise.resolve(buildRoute(from, to, mode));
}

function drivingDirection(from, to) { return routeOf(from, to, 'driving'); }
function walkingDirection(from, to) { return routeOf(from, to, 'walking'); }
function bicyclingDirection(from, to) { return routeOf(from, to, 'bicycle'); }
function transitDirection(from, to) { return routeOf(from, to, 'transit'); }

function getDirections(mode, from, to) {
  var m = mode === 'walking' ? 'walking' :
          mode === 'bicycle' ? 'bicycle' :
          mode === 'transit' || mode === 'taxi' ? 'transit' : 'driving';
  return routeOf(from, to, m);
}

/** 多方案对比：全部由本地生成 */
function getMultipleTransitPlans(from, to) {
  var base = buildRoute(from, to, 'transit').routes[0];
  var variants = [
    { id: 1, tag: '推荐',   tagColor: '#367BFF', title: '最快到达', factor: 1.00, extra: 0 },
    { id: 2, tag: '少步行', tagColor: '#E64340', title: '少步行',   factor: 1.12, extra: 60 },
    { id: 3, tag: '少换乘', tagColor: '#27ae60', title: '少换乘',   factor: 1.20, extra: 120 },
    { id: 4, tag: '打车',   tagColor: '#f39c12', title: '打车约' + Math.max(1, Math.round(base.duration / 1.6 / 60)) + '分钟', factor: 0.62, extra: 0 }
  ];
  var plans = variants.map(function (v) {
    var dur = Math.round(base.duration * v.factor) + v.extra;
    var dist = Math.round(base.distance * v.factor);
    return {
      id: v.id, tag: v.tag, tagColor: v.tagColor, title: v.title,
      subtitle: formatDuration(dur) + ' · ' + formatDistance(dist),
      distance: dist, duration: dur,
      polyline: base.polyline, steps: base.steps, realSteps: true,
      allPolylineSets: [{ points: base.polyline, color: '#367BFF', width: 5 }],
      isTaxi: v.id === 4
    };
  });
  return Promise.resolve(plans);
}

/* ========== 格式化（纯计算） ========== */

function formatDistance(meters) {
  if (!meters || meters <= 0) return '--';
  if (meters < 1000) return Math.round(meters) + 'm';
  return (meters / 1000).toFixed(1) + 'km';
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '--';
  var minutes = seconds / 60;
  if (minutes < 60) return Math.round(minutes) + '分钟';
  var h = Math.floor(minutes / 60);
  var m = Math.round(minutes % 60);
  return m > 0 ? h + '小时' + m + '分钟' : h + '小时';
}

function formatDurationShort(seconds) {
  if (!seconds || seconds <= 0) return '--';
  var minutes = seconds / 60;
  if (minutes < 60) return Math.round(minutes) + '分';
  var h = Math.floor(minutes / 60);
  var m = Math.round(minutes % 60);
  return m > 0 ? h + '时' + m + '分' : h + '时';
}

/** 演示用打车费估算，非真实计价 */
function estimateTaxiFare(meters) {
  if (!meters || meters <= 0) return '--';
  var km = meters / 1000;
  var fare = 8;
  if (km > 3) fare += Math.ceil((km - 3) * 1.8);
  if (km > 15) fare += Math.round((km - 15) * 0.5);
  return '¥' + fare;
}

module.exports = {
  KEY: KEY,
  BASE: BASE,
  CENTER: CENTER,
  CAMPUS_PLACES: CAMPUS_PLACES,
  searchSuggestion: searchSuggestion,
  searchPlace: searchPlace,
  reverseGeocoder: reverseGeocoder,
  getDirections: getDirections,
  getMultipleTransitPlans: getMultipleTransitPlans,
  drivingDirection: drivingDirection,
  walkingDirection: walkingDirection,
  bicyclingDirection: bicyclingDirection,
  transitDirection: transitDirection,
  TRANSIT_POLICY: TRANSIT_POLICY,
  arrayToPoints: arrayToPoints,
  coorsToPoints: coorsToPoints,
  formatDistance: formatDistance,
  formatDuration: formatDuration,
  formatDurationShort: formatDurationShort,
  estimateTaxiFare: estimateTaxiFare
};
