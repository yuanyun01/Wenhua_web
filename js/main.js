// 全局初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态，更新导航栏
    checkLoginStatus();
     initNavbar(); // 新增导航初始化
    // 个性化推荐模拟 (基于本地存储的浏览记录)
    initPersonalRecommend();
    // 从后端获取活动并渲染
    fetchEvents();
});

// 检查登录状态
function checkLoginStatus() {
    const isLogin = localStorage.getItem('isLogin') === 'true';
    const username = localStorage.getItem('username');
    
    // 如果已登录，替换导航栏的登录/注册按钮
    if (isLogin && username) {
        const navRight = document.querySelector('.navbar .d-flex');
        if (navRight) {
            navRight.innerHTML = `
                <span class="navbar-text me-3">欢迎，${username}</span>
                <button class="btn btn-outline-light" id="logoutBtn">退出登录</button>
            `;
            
            // 绑定退出登录事件
            document.getElementById('logoutBtn').addEventListener('click', function() {
                localStorage.removeItem('isLogin');
                localStorage.removeItem('username');
                alert('已退出登录');
                window.location.reload();
            });
        }
    }
}

// 模拟个性化推荐
function initPersonalRecommend() {
    // 模拟浏览记录
    const browseHistory = localStorage.getItem('browseHistory') || '[]';
    const history = JSON.parse(browseHistory);
    
    // 如果有浏览记录，模拟推荐逻辑
    if (history.length > 0) {
        console.log('个性化推荐 - 基于浏览记录:', history);
        // 实际项目中可根据浏览记录展示推荐内容
    }
}
// 从后端拉取活动数据并渲染到首页“热门文化活动”区域
function fetchEvents() {
    fetch('/api/events')
        .then(res => res.json())
        .then(result => {
            if (result && result.code === 0 && Array.isArray(result.data)) {
                const events = result.data;
                const row = document.querySelector('section.py-5 .container .row.g-4');
                if (!row) return;
                // 构建卡片 HTML
                row.innerHTML = events.map(ev => `
                    <div class="col-md-4">
                        <div class="card h-100 shadow-sm">
                            <img src="${ev.image}" class="card-img-top" alt="${ev.title}">
                            <div class="card-body">
                                <h5 class="card-title">${ev.title}</h5>
                                <p class="card-text">${ev.description}</p>
                                <p class="text-muted"><i class="bi bi-calendar me-1"></i>${ev.date}</p>
                                <p class="text-muted"><i class="bi bi-geo-alt me-1"></i>${ev.place}</p>
                            </div>
                            <div class="card-footer bg-transparent">
                                <a href="ticket.html" class="btn btn-primary">立即购票</a>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        })
        .catch(err => console.error('获取活动失败', err));
}
// 添加导航菜单切换等基础交互
function initNavbar() {
    const menuToggle = document.querySelector('.navbar-toggler');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            navbarCollapse.classList.toggle('show');
        });
    }
}

