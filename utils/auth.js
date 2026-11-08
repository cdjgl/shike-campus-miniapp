/**
 * 本地账号鉴权工具
 * 仅用于无后端的本地小程序演示，密码以带盐哈希存储，避免明文落盘。
 * 支持角色：admin（管理员）/ teacher（教师）/ student（学生）
 */

var SALT = 'shike_campus_2026';

var ROLES = {
  admin: '管理员',
  teacher: '教师',
  student: '学生',
};

/** 简单带盐哈希（用于本地存储，非加密级别安全） */
function hashPassword(pwd) {
  var str = SALT + (pwd || '');
  var h = 5381;
  for (var i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  }
  return 'h' + h.toString(16);
}

/** 读取全部已注册账号：{ account: {account, password, nickname, studentId, school, role, createdAt} } */
function getUsers() {
  return wx.getStorageSync('registered_users') || {};
}

/** 保存账号表 */
function saveUsers(users) {
  wx.setStorageSync('registered_users', users);
}

/** 账号是否已存在 */
function isAccountExists(account) {
  var users = getUsers();
  return !!users[account];
}

/** 注册新账号，成功返回 true，失败返回错误文案 */
function register(account, password, profile) {
  account = (account || '').trim();
  if (!account) return '请输入账号';
  if (!/^[A-Za-z0-9_]{3,20}$/.test(account)) return '账号须为3-20位字母、数字或下划线';
  if (!password || password.length < 6) return '密码至少6位';
  if (isAccountExists(account)) return '该账号已注册，请直接登录';

  // 角色：注册时只允许 学生/教师，管理员仅通过初始账号发放
  var role = (profile && profile.role) ? profile.role : 'student';
  if (role !== 'teacher' && role !== 'student') role = 'student';

  var users = getUsers();
  users[account] = {
    account: account,
    password: hashPassword(password),
    nickname: (profile && profile.nickname) ? profile.nickname : '拾刻同学',
    studentId: (profile && profile.studentId) ? profile.studentId : '',
    school: (profile && profile.school) ? profile.school : '',
    role: role,
    createdAt: Date.now(),
  };
  saveUsers(users);
  return true;
}

/** 校验登录，成功返回账号记录对象（含 role），失败返回 null */
function verify(account, password) {
  account = (account || '').trim();
  var users = getUsers();
  var rec = users[account];
  if (!rec) return null;
  if (rec.password !== hashPassword(password)) return null;
  return rec;
}

/** 更新已登录账号的密码 */
function updatePassword(account, newPassword) {
  var users = getUsers();
  if (!users[account]) return false;
  users[account].password = hashPassword(newPassword);
  saveUsers(users);
  return true;
}

/** 首次启动写入三类初始账号（仅当账号表为空时） */
function seedInitialUsers() {
  var users = getUsers();
  if (Object.keys(users).length > 0) return; // 已初始化，避免覆盖用户数据

  var init = [
    { account: 'admin',   password: 'admin123',   nickname: '系统管理员', role: 'admin' },
    { account: 'teacher', password: 'teacher123', nickname: '教师账号',   role: 'teacher' },
    { account: 'student', password: 'student123', nickname: '学生账号',   role: 'student' },
  ];
  for (var i = 0; i < init.length; i++) {
    var u = init[i];
    users[u.account] = {
      account: u.account,
      password: hashPassword(u.password),
      nickname: u.nickname,
      studentId: '',
      school: '',
      role: u.role,
      createdAt: Date.now(),
      seeded: true,
    };
  }
  saveUsers(users);
}

module.exports = {
  hashPassword: hashPassword,
  getUsers: getUsers,
  isAccountExists: isAccountExists,
  register: register,
  verify: verify,
  updatePassword: updatePassword,
  seedInitialUsers: seedInitialUsers,
  ROLES: ROLES,
};
