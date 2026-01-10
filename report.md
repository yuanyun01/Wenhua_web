# 后端实现与评论模块设计说明

## 一、后端概述
- 技术栈：Node.js + Express（项目入口 `server.js`）。
- 功能：静态页面托管（`pages/`）、提供 REST 接口（示例 `/api/events`）。
- 当前接口示例：`GET /api/events` 返回格式 `{ code: 0, data: [...] }`，前端通过 `fetch('/api/events')` 获取并渲染。

## 二、如何把本文件复制到 Word
- 直接打开：在 VS Code 或记事本中打开 `report.md`，全选复制，粘贴到 Word。样式为纯文本。
- 保留 Markdown 格式到 Word：可使用 Pandoc 将 `report.md` 转为 `report.docx`：
```
pandoc report.md -o report.docx
```
（需要先安装 Pandoc：https://pandoc.org/）

## 三、为什么需要数据库？用数据库可以做什么
- 持久化：把评论、用户、文章等数据保存到磁盘，重启服务器后数据依然存在（区别于内存临时存储）。
- 查询/筛选：按时间、用户、关键字检索评论；支持分页与排序。
- 关联关系：把评论与用户或文章关联，便于权限与管理。
- 事务与一致性：在复杂写操作时保证数据一致（例如删除或修改同时更新统计）。

## 四、数据库选型建议（团队协作/实验环境）
- SQLite：轻量、零配置、适合本地开发与小规模教学项目。文件形式，易于提交示例数据（.db 文件）。
- MySQL / MariaDB：生产或多并发场景；需要单独服务部署。若后续要部署到服务器可考虑。
- PostgreSQL：功能强，标准兼容性好；教学项目一般选 SQLite 简便。

推荐：实验阶段使用 SQLite（或先用内存存储做 Mock），团队通过 `package.json` / `requirements.txt` 保证依赖一致。

## 五、评论模块设计（后端接口契约）
- 评论表（示例 SQL，SQLite）
```
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_deleted INTEGER DEFAULT 0
);
```

- 推荐接口：
  - `GET /api/comments?post_id=123&page=1&limit=20` 返回指定文章的评论（分页）。
  - `POST /api/comments` 提交评论，Body: `{ post_id, user_name, content }`。
  - `DELETE /api/comments/:id`（或 `POST /api/comments/:id/delete`）逻辑删除（需权限认证）。

## 六：Express（Node）示例实现（核心片段）
1) 安装依赖：
```
npm install sqlite3 express body-parser
```

2) 初始化数据库并创建表（示例，可放到 `db.js` 或 `server.js`）：
```js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/app.db');
db.run(`CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_deleted INTEGER DEFAULT 0
)`);
```

3) 评论接口（示例，放在 `server.js`）：
```js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// 读取评论
app.get('/api/comments', (req, res) => {
  const postId = req.query.post_id || 0;
  const sql = `SELECT id, post_id, user_name, content, created_at FROM comments WHERE post_id = ? AND is_deleted = 0 ORDER BY created_at DESC`;
  db.all(sql, [postId], (err, rows) => {
    if (err) return res.status(500).json({ code: 1, msg: 'DB error' });
    res.json({ code: 0, data: rows });
  });
});

// 提交评论
app.post('/api/comments', (req, res) => {
  const { post_id, user_name, content } = req.body;
  if (!post_id || !user_name || !content) return res.status(400).json({ code: 1, msg: '参数缺失' });
  const stmt = db.prepare('INSERT INTO comments (post_id, user_name, content) VALUES (?, ?, ?)');
  stmt.run([post_id, user_name, content], function(err) {
    if (err) return res.status(500).json({ code: 1, msg: 'DB error' });
    res.json({ code: 0, data: { id: this.lastID } });
  });
});
```

注意：实际项目中请对 `content` 做输入校验与输出转义（防 XSS），并在必要时使用认证（只能由登录用户提交/删帖）。

## 七：前端示例（评论提交 + 拉取）
1) 简单 HTML 表单（可放在文章页或独立 `pages/comments.html`）
```html
<form id="commentForm">
  <input type="hidden" id="postId" value="123">
  <input id="userName" placeholder="你的名字">
  <textarea id="content" placeholder="写评论..."></textarea>
  <button type="submit">提交</button>
</form>
<div id="comments"></div>
```

2) JavaScript（示例，放在 `js/comments.js`）
```js
document.getElementById('commentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    post_id: +document.getElementById('postId').value,
    user_name: document.getElementById('userName').value.trim(),
    content: document.getElementById('content').value.trim()
  };
  const res = await fetch('/api/comments', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.code === 0) loadComments(payload.post_id);
});

async function loadComments(postId){
  const res = await fetch(`/api/comments?post_id=${postId}`);
  const j = await res.json();
  if (j.code === 0) {
    document.getElementById('comments').innerHTML = j.data.map(c => `<p><b>${c.user_name}</b>: ${c.content}</p>`).join('');
  }
}

loadComments(123);
```

## 八：安全与质量建议
- 输入校验与长度限制；对 `content` 做 HTML 转义或使用安全渲染组件，防止 XSS。 
- 身份校验：删除/管理评论需要身份验证与权限控制。 
- 防刷：添加节流或验证码限制频繁提交。 
- 日志与异常处理：记录 DB 错误与用户操作，便于追溯。

## 九：开发与团队协作小贴士
- 把依赖放在 `package.json` 提交，团队成员统一 `npm install`。
- 建议提交 `data/schema.sql`（建表语句），或提交一个空的示例 DB 文件 `data/app.db`（如果允许）。
- 在 `README.md` 写清启动步骤与端口（3000），并在 `.gitignore` 忽略 `node_modules/`、`venv/`、`data/*.db`（若不希望提交数据库文件）。

---

若你需要，我可以下一步：
- 把上面 `Express` 的评论实现直接添加到 `server.js`（我可以修改并提交），或
- 在 `pages/` 添加 `comments.html` 与 `js/comments.js` 示例文件，并演示完整前后端联调流程。

请选择：`添加后端示例` / `添加前端示例` / `都添加` / `先不添加，我先看文档`。
