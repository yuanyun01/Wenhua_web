// 登录表单验证与提交
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    // 防止重复提交的锁
    let isSubmitting = false;

    if (!loginForm) {
        console.error('未找到登录表单元素（loginForm）');
        return;
    }
    
    loginForm.addEventListener('submit', async function(e) { // 关键：添加 async 声明
        e.preventDefault(); // 阻止默认提交
        
        // 防止重复提交
        if (isSubmitting) return;
        isSubmitting = true;

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (!usernameInput || !passwordInput) {
            alert('页面元素缺失，请刷新重试');
            isSubmitting = false;
            return;
        }

        const account = usernameInput.value.trim(); // 注意：后端接收的参数名是 account
        const password = passwordInput.value.trim();
        
        // 基础表单验证
        if (!account) {
            alert('请输入用户名/手机号');
            isSubmitting = false;
            return;
        }
        
        if (!password) {
            alert('请输入密码');
            isSubmitting = false;
            return;
        }
        
        // 调用后端登录接口
        try {
            console.log('发起登录请求，参数：', { account, password }); // 调试日志
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ account, password }) // 与后端参数名保持一致
            });

            // 先检查响应状态是否正常
            if (!res.ok) {
                throw new Error(`HTTP错误，状态码：${res.status}`);
            }

            const j = await res.json();
            console.log('登录接口返回：', j); // 调试日志

            if (j.code === 0) {
                // 登录成功，存储用户状态
                localStorage.setItem('isLogin', 'true');
                localStorage.setItem('userId', j.data.id); // 补充存储用户ID
                localStorage.setItem('username', j.data.username);
                alert('登录成功！即将跳转到首页');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                // 后端返回业务错误（如用户名/密码错误）
                alert('登录失败：' + (j.msg || '用户名或密码错误'));
            }
        } catch (err) {
            // 网络错误、解析错误等异常情况
            console.error('登录请求异常：', err);
            alert('登录失败：' + err.message + '，请检查网络或稍后重试');
        } finally {
            // 无论成功/失败，解除提交锁
            isSubmitting = false;
        }
    });
});