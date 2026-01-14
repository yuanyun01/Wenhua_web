// 引入项目已安装的sqlite3依赖
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 连接你的app.db数据库（路径和项目一致，无需修改）
const db = new sqlite3.Database(path.join(__dirname, 'data', 'app.db'), (err) => {
  if (err) {
    console.error('连接数据库失败：', err.message);
    return;
  }
  console.log('✅ 成功连接到app.db，正在查询评论表...\n');
});

// 查询comments表的所有数据（显示所有评论）
db.all('SELECT * FROM comments', (err, rows) => {
  if (err) {
    console.error('查询评论失败：', err.message);
    db.close();
    return;
  }

  // 打印查询结果（格式化显示）
  console.log('📝 comments表的所有评论：');
  rows.forEach((row, index) => {
    console.log(`\n第${index+1}条评论：`);
    console.log(`- 评论ID：${row.id}`);
    console.log(`- 话题ID：${row.topic_id}`);
    console.log(`- 用户ID：${row.user_id}`);
    console.log(`- 用户名：${row.user_name}`);
    console.log(`- 评论内容：${row.content}`);
    console.log(`- 发布时间：${row.created_at}`);
  });

  // 关闭数据库连接
  db.close((err) => {
    if (err) console.error('关闭数据库失败：', err.message);
    else console.log('\n✅ 查询完成，数据库已关闭');
  });
});