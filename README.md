# 城市文化宣传平台 （示例项目）

**说明**

这是一个用于教学和演示的前后端本地运行示例：
- 前端：静态页面位于 `pages/`，脚本在 `js/`，样式在 `css/`。
- 后端：基于 **Node.js + Express** 的简单 API（`server.js`）。
- 数据库：使用 **SQLite**（数据库文件 `data/app.db`，建表脚本 `data/schema.sql`）。

---

## 🔧 先决条件
- Node.js（建议 v14+）与 npm。Windows 用户请确保安装后重启终端使 `node`/`npm` 在 PATH 中可用。
- 可选：SQLite CLI 或 DB Browser（用于查看/修改 `data/app.db`）。
- Git（方便团队协作）。

---

## 🛠 本地快速运行（Windows PowerShell）
1. 克隆仓库并进入项目目录：

```powershell
git clone <your-repo-url>
cd "城市文化宣传平台"
```

2. 安装依赖：

- 如果仓库中已有 `package.json`：

```powershell
npm install
```

- 如果没有：

```powershell
npm init -y
npm install express sqlite3 bcryptjs
```

3. 启动服务：

```powershell
node server.js
```

默认监听端口：**3000**。打开浏览器访问：

- http://localhost:3000/pages/index.html
- 或 http://localhost:3000/ （如果服务器配置了根路由）

---

## 🗂 数据库说明与初始化
- 建表脚本：`data/schema.sql`。
- 启动服务器时，若 `data/app.db` 不存在，服务会根据 `schema.sql` 创建数据库文件并初始化表结构。

常见问题与操作：
- 如果注册接口（`POST /api/register`）返回 `{"code":1,"msg":"DB error"}`：
  - 检查服务器控制台日志（服务器里已添加错误输出），找到具体 SQL 错误。
  - 常见原因：代码与旧 DB 的 schema 不一致（例如新增了 `phone` 字段）。解决方法：
    - 备份并删除 `data/app.db`，重新启动服务让其自动创建新 DB，或
    - 使用 SQLite CLI / DB Browser 执行：

```sql
ALTER TABLE users ADD COLUMN phone TEXT;
```

（在修改表结构前请先备份 `data/app.db`）

---

## ✅ 快速接口测试（示例）
- 获取活动列表：

```bash
curl http://localhost:3000/api/events
```

- 获取/发布评论：

```bash
curl http://localhost:3000/api/comments
curl -X POST -H "Content-Type: application/json" -d '{"topic":"1","author":"张三","text":"测试评论"}' http://localhost:3000/api/comments
```

- 注册 / 登录 示例：

```bash
curl -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"secret","phone":"13800000000"}' http://localhost:3000/api/register
curl -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"secret"}' http://localhost:3000/api/login
```

---

## 📋 给团队成员的说明（最小步骤）
1. 克隆仓库
2. 安装 Node（或使用我们的备用 Python 静态服务器，仅用于静态页面展示）
3. 安装依赖并运行 `node server.js`
4. 打开浏览器查看页面并测试注册/评论功能

建议把 `data/app.db` 列入 `.gitignore`，并在仓库中保留 `data/schema.sql` 与一个示例 seed 脚本（`scripts/seed.sql` 或 `scripts/seed.js`），便于快速复现演示数据。

---

## 🧭 排错小贴士
- `npm` 未找到：在 https://nodejs.org/ 下载并安装 Node.js，安装后重启终端。
- 端口被占用：在启动前设置环境变量 `PORT`（Windows PowerShell 示例）：

```powershell
$env:PORT=3001
node server.js
```

- 仍然出现 DB 错误：查看服务器控制台日志，或手动使用 SQLite 工具检查表结构。

---

## 🔐 安全与生产建议
- 仅用于教学的简单实现：真实产品请使用环境变量（`.env`）配置密钥与敏感信息，使用成熟的数据库（MySQL/Postgres）或受管理服务。
- 密码已使用 `bcryptjs` 哈希存储：切勿在仓库中存储明文密码或生产密钥。

---

## 🤝 贡献 & 许可
- 欢迎提交 issue 或 PR，建议使用 feature 分支并通过代码审查。
- 许可：MIT（请在 `LICENSE` 中添加或修改为学校/团队需要的许可）。

---

## 联系 / 演示建议
- 演示给老师/同学时建议：
  1. 先说明整体架构（前端静态 + 后端 API + 本地 SQLite）。
  2. 启动服务并打开首页，演示注册 → 登录 → 发布评论 → 查看评论流程。
  3. 如果需要多人并行演示，可事先准备好 `data/app.db` 的演示数据备份（或分享一个 pre-built 的 sqlite 文件）。

---

如果你需要，我可以：
- 添加 `scripts/seed.js`（或 SQL）来导入示例数据；
- 帮你生成 `package.json` 的 `start`/`dev` 脚本；
- 撰写一页 PPT 演示稿给老师（简洁步骤）。

👉 需要我现在为你添加哪一项？