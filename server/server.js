const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 将项目根目录作为静态资源目录，便于同时提供前端文件
app.use(express.static(path.join(__dirname, '..')));

// 示例活动数据
const events = [
  {
    id: 1,
    title: '非遗手作体验课',
    description: '体验传统剪纸工艺，感受非遗文化魅力',
    date: '2026-02-15',
    place: '市文化馆',
    image: 'https://picsum.photos/400/250?random=4'
  },
  {
    id: 2,
    title: '城市文化主题展',
    description: '回顾城市发展历程，展示文化传承成果',
    date: '2026-02-10至03-10',
    place: '市博物馆',
    image: 'https://picsum.photos/400/250?random=5'
  },
  {
    id: 3,
    title: '民俗戏曲演出',
    description: '经典戏曲选段表演，感受传统艺术之美',
    date: '2026-02-20',
    place: '市大剧院',
    image: 'https://picsum.photos/400/250?random=6'
  }
];

// 简单 API：获取活动
app.get('/api/events', (req, res) => {
  res.json({ code: 0, data: events });
});

// 简单登录示例（仅演示）
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    // 演示：任意非空用户名/密码视为成功
    return res.json({ code: 0, message: '登录成功', data: { username } });
  }
  res.status(400).json({ code: 1, message: '用户名或密码不能为空' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
