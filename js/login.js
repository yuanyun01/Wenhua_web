// 登录表单验证与提交
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止默认提交
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // 基础表单验证
        if (!username) {
            alert('请输入用户名/手机号');
            return;
        }
        
        if (!password) {
            alert('请输入密码');
            return;
        }
        
        // 调用后端登录接口
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ account: username, password })
            });
            const j = await res.json();
            if (res.ok && j.code === 0) {
                localStorage.setItem('isLogin', 'true');
                localStorage.setItem('username', j.data.username);
                alert('登录成功！');
                window.location.href = 'index.html';
            } else {
                alert('登录失败：' + (j.msg || '用户名或密码错误'));
            }
        } catch (err) {
            console.error(err);
            alert('登录失败，请稍后重试');
        }
    });
});