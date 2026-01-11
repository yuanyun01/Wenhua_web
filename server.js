// 1. 引入已安装的Express框架
const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// 2. 创建Express应用实例
const app = express();
// 3. 中间件
app.use(express.json());

// 4. 定义服务器监听端口（默认3000，方便验证）
const port = 3000;

// 5. 静态文件托管（pages 目录）
app.use(express.static(path.join(__dirname, 'pages')));
// 新增：托管js文件夹，访问 /js/xxx.js 对应根目录的js/xxx.js
app.use('/js', express.static(path.join(__dirname, 'js')));
// 新增：托管css文件夹，访问 /css/xxx.css 对应根目录的css/xxx.css
app.use('/css', express.static(path.join(__dirname, 'css')));

// 6. 确保 data 目录存在并初始化 SQLite 数据库（用于评论存储）
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
const db = new sqlite3.Database(path.join(__dirname, 'data', 'app.db'));
db.serialize(() => {
  // users 表：存储用户信息（密码请存储哈希）
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT,
    email TEXT,
    phone TEXT,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // categories 表：话题/活动分类
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);

  // topics 表：论坛话题/帖子
  db.run(`CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    user_id INTEGER,
    category_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    is_deleted INTEGER DEFAULT 0
  )`);

  // comments 表：评论（支持绑定到 topic）
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    user_id INTEGER,
    user_name TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted INTEGER DEFAULT 0
  )`);

  // events 表：文化活动信息
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    place TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // tickets/ orders 表：购票记录
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER,
    quantity INTEGER DEFAULT 1,
    price REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // likes 表：对 topic/comment/event 的点赞记录
  db.run(`CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_type TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// 4. 定义根路径接口（访问http://localhost:3000）
app.get('/', (req, res) => {
  res.send('城市文化宣传平台 - Express运行成功！访问 /api/events 查看文化活动数据～');
});

// 5. 定义核心接口 /api/events（贴合你的项目需求）
app.get('/api/events', (req, res) => {
  // 模拟城市文化活动数据，后续可替换为数据库查询结果
  const cultureEvents = [
    { id: 1, title: '传统茶艺体验课', time: '2024-06-15', address: '城市文化中心1楼', desc: '零基础学习传统茶艺冲泡技巧' },
    { id: 2, title: '城市文化故事分享会', time: '2024-06-22', address: '城市图书馆3楼', desc: '邀请市民分享身边的城市文化记忆' },
    { id: 3, title: '民俗手工制作工坊', time: '2024-06-29', address: '青少年活动中心', desc: '亲手制作传统民俗手工艺品，感受文化魅力' }
  ];
  
  // 控制台打印返回数据，方便查看接口调用情况
  console.log('返回/api/events接口数据：', cultureEvents);
  
  // 向浏览器返回JSON格式数据（接口核心返回结果，包装为 {code:0,data:...} 以兼容前端）
  res.json({ code: 0, data: cultureEvents });
});

// 评论相关接口
app.get('/api/comments', (req, res) => {
  const topicId = parseInt(req.query.topic_id || '0', 10);
  if (!topicId) return res.json({ code: 0, data: [] });
  const sql = `SELECT id, topic_id, user_name, content, created_at FROM comments WHERE topic_id = ? AND is_deleted = 0 ORDER BY created_at DESC`;
  db.all(sql, [topicId], (err, rows) => {
    if (err) {
      console.error('GET /api/comments DB error:', err);
      return res.status(500).json({ code: 1, msg: 'DB error' });
    }
    res.json({ code: 0, data: rows });
  });
});

app.post('/api/comments', (req, res) => {
  const { topic_id, user_name, content } = req.body;
  if (!topic_id || !content) return res.status(400).json({ code: 1, msg: '参数缺失' });
  const name = user_name && user_name.trim() ? user_name.trim() : '匿名';
  const stmt = db.prepare('INSERT INTO comments (topic_id, user_name, content) VALUES (?, ?, ?)');
  stmt.run([topic_id, name, content], function(err) {
    if (err) {
      console.error('POST /api/comments DB error:', err);
      return res.status(500).json({ code: 1, msg: 'DB error' });
    }
    res.json({ code: 0, data: { id: this.lastID } });
  });
});

// 用户注册
app.post('/api/register', (req, res) => {
  const { username, phone, password, email } = req.body || {};
  if (!username || !phone || !password) return res.status(400).json({ code: 1, msg: '参数缺失' });

  // 检查用户名或手机号是否已存在
  db.get('SELECT id FROM users WHERE username = ? OR phone = ?', [username, phone], (err, row) => {
    if (err) {
      console.error('POST /api/register SELECT DB error:', err);
      return res.status(500).json({ code: 1, msg: 'DB error' });
    }
    if (row) return res.status(400).json({ code: 1, msg: '用户名或手机号已存在' });

    // 哈希密码并插入用户
    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password, display_name, email, phone) VALUES (?, ?, ?, ?, ?)');
    stmt.run([username, hash, username, email || '', phone], function(err) {
      if (err) {
        console.error('POST /api/register INSERT DB error:', err);
        return res.status(500).json({ code: 1, msg: 'DB error' });
      }
      res.json({ code: 0, data: { id: this.lastID, username } });
    });
  });
});

// 用户登录（用户名或手机号登录）
app.post('/api/login', (req, res) => {
  const { account, password } = req.body || {};
  if (!account || !password) return res.status(400).json({ code: 1, msg: '参数缺失' });

  db.get('SELECT id, username, password FROM users WHERE username = ? OR phone = ?', [account, account], (err, user) => {
    if (err) {
      console.error('POST /api/login DB error:', err);
      return res.status(500).json({ code: 1, msg: 'DB error' });
    }
    if (!user) return res.status(401).json({ code: 1, msg: '用户不存在或密码错误' });

    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(401).json({ code: 1, msg: '用户不存在或密码错误' });

    // 登录成功，返回基本信息（前端可将其存入 localStorage）
    res.json({ code: 0, data: { id: user.id, username: user.username } });
  });
});

// 6. 启动Express服务器，监听3000端口
app.listen(port, () => {
  console.log(`服务器启动成功！访问地址：http://localhost:${port}`);
  console.log(`文化活动接口地址：http://localhost:${port}/api/events`);
});