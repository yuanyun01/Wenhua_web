// events.js - 文化活动相关交互逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有活动相关交互
    initPublishEventModal();
    initEventSearch();
    initEventFilter();
    initLoadMoreEvents();
    initPublishEventForm();
});

/**
 * 初始化发布活动模态框
 */
function initPublishEventModal() {
    const publishBtn = document.getElementById('publishEventBtn');
    const modal = new bootstrap.Modal(document.getElementById('publishEventModal'));
    
    // 点击发布活动按钮
    publishBtn.addEventListener('click', function() {
        // 检查登录状态
        const isLogin = localStorage.getItem('isLogin') === 'true';
        if (!isLogin) {
            alert('请先登录后再发布活动！');
            window.location.href = 'login.html';
            return;
        }
        
        // 清空表单
        document.getElementById('publishEventForm').reset();
        // 设置默认日期为今天
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('eventDate').value = today;
        
        // 显示模态框
        modal.show();
    });
}

/**
 * 初始化活动搜索功能
 */
function initEventSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', function() {
        performSearch();
    });
    
    // 回车键触发搜索
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 执行搜索逻辑
    function performSearch() {
        const keyword = searchInput.value.trim();
        
        if (!keyword) {
            alert('请输入搜索关键词！');
            return;
        }
        
        // 模拟搜索筛选
        const eventCards = document.querySelectorAll('.event-card');
        let matchCount = 0;
        
        eventCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const keywordLower = keyword.toLowerCase();
            
            if (cardText.includes(keywordLower)) {
                card.style.display = '';
                matchCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // 显示搜索结果提示
        alert(`搜索“${keyword}”共找到 ${matchCount} 个相关活动`);
        
        // 如果没有匹配结果，显示提示
        if (matchCount === 0) {
            const noResultHtml = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search fs-1 text-muted mb-3"></i>
                    <h4>未找到相关活动</h4>
                    <p class="text-muted">尝试更换关键词或筛选条件</p>
                    <button class="btn btn-outline-primary mt-2" onclick="resetSearch()">清空搜索</button>
                </div>
            `;
            
            // 检查是否已有无结果提示
            let noResultDiv = document.getElementById('noResultDiv');
            if (!noResultDiv) {
                noResultDiv = document.createElement('div');
                noResultDiv.id = 'noResultDiv';
                document.getElementById('eventsList').appendChild(noResultDiv);
            }
            noResultDiv.innerHTML = noResultHtml;
        } else {
            // 移除无结果提示
            const noResultDiv = document.getElementById('noResultDiv');
            if (noResultDiv) {
                noResultDiv.remove();
            }
        }
    }
    
    // 重置搜索
    window.resetSearch = function() {
        searchInput.value = '';
        const eventCards = document.querySelectorAll('.event-card');
        eventCards.forEach(card => {
            card.style.display = '';
        });
        
        // 重置筛选条件
        document.getElementById('categorySelect').value = 'all';
        document.getElementById('timeSelect').value = 'all';
        
        // 移除无结果提示
        const noResultDiv = document.getElementById('noResultDiv');
        if (noResultDiv) {
            noResultDiv.remove();
        }
    };
}

/**
 * 初始化活动筛选功能
 */
function initEventFilter() {
    const categorySelect = document.getElementById('categorySelect');
    const timeSelect = document.getElementById('timeSelect');
    
    // 活动类型筛选
    categorySelect.addEventListener('change', function() {
        const category = this.value;
        filterEvents(category, timeSelect.value);
    });
    
    // 时间筛选
    timeSelect.addEventListener('change', function() {
        const timeRange = this.value;
        filterEvents(categorySelect.value, timeRange);
    });
    
    // 筛选活动逻辑
    function filterEvents(category, timeRange) {
        const eventCards = document.querySelectorAll('.event-card');
        let filterCount = 0;
        
        eventCards.forEach(card => {
            let showCard = true;
            
           if (timeRange !== 'all' && showCard) {
        const cardTime = new Date(card.getAttribute('data-time'));
        const now = new Date();
        let timeCondition = false;
        
        // 根据不同时间范围设置条件
        if (timeRange === 'week') {
            const oneWeekLater = new Date();
            oneWeekLater.setDate(now.getDate() + 7);
            timeCondition = cardTime >= now && cardTime <= oneWeekLater;
        } else if (timeRange === 'month') {
            const oneMonthLater = new Date();
            oneMonthLater.setMonth(now.getMonth() + 1);
            timeCondition = cardTime >= now && cardTime <= oneMonthLater;
        } else if (timeRange === 'quarter') {
            const threeMonthsLater = new Date();
            threeMonthsLater.setMonth(now.getMonth() + 3);
            timeCondition = cardTime >= now && cardTime <= threeMonthsLater;
        }
        
        showCard = timeCondition;
    }
     else {
                card.style.display = 'none';
            }
        });
        
        // 显示筛选结果提示
        const categoryText = category === 'all' ? '全部类型' : 
                            category === 'exhibition' ? '展览' : 
                            category === 'performance' ? '演出' : 
                            category === 'experience' ? '体验课' : '讲座';
        
        const timeText = timeRange === 'all' ? '全部时间' : 
                        timeRange === 'week' ? '本周' : 
                        timeRange === 'month' ? '本月' : '本季度';
        
        alert(`筛选条件：${categoryText} + ${timeText}\n共找到 ${filterCount} 个活动`);
        
        // 处理无结果情况
        if (filterCount === 0) {
            const noResultHtml = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-filter fs-1 text-muted mb-3"></i>
                    <h4>暂无符合条件的活动</h4>
                    <p class="text-muted">尝试调整筛选条件</p>
                    <button class="btn btn-outline-primary mt-2" onclick="resetFilter()">重置筛选</button>
                </div>
            `;
            
            let noResultDiv = document.getElementById('noResultDiv');
            if (!noResultDiv) {
                noResultDiv = document.createElement('div');
                noResultDiv.id = 'noResultDiv';
                document.getElementById('eventsList').appendChild(noResultDiv);
            }
            noResultDiv.innerHTML = noResultHtml;
        } else {
            const noResultDiv = document.getElementById('noResultDiv');
            if (noResultDiv) {
                noResultDiv.remove();
            }
        }
    }
    
    // 重置筛选条件
    window.resetFilter = function() {
        categorySelect.value = 'all';
        timeSelect.value = 'all';
        
        const eventCards = document.querySelectorAll('.event-card');
        eventCards.forEach(card => {
            card.style.display = '';
        });
        
        const noResultDiv = document.getElementById('noResultDiv');
        if (noResultDiv) {
            noResultDiv.remove();
        }
    };
}

/**
 * 初始化加载更多活动功能
 */
function initLoadMoreEvents() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    let isLoading = false;
    
    loadMoreBtn.addEventListener('click', function() {
        if (isLoading) return;
        
        // 显示加载状态
        isLoading = true;
        loadMoreBtn.innerHTML = '<i class="bi bi-hourglass-spin me-2"></i>加载中...';
        loadMoreBtn.disabled = true;
        
        // 模拟异步加载数据
        setTimeout(() => {
            // 生成更多活动卡片
            const eventsList = document.getElementById('eventsList');
            const moreEvents = [
                {
                    title: '传统茶艺体验课',
                    category: 'experience',
                    time: '2026-03-05 14:00',
                    location: '茶文化体验馆',
                    price: '¥128/人',
                    views: '1258',
                    image: 'https://picsum.photos/400/250?random=24'
                },
                {
                    title: '城市文化摄影展',
                    category: 'exhibition',
                    time: '2026-03-01 至 2026-03-20',
                    location: '市美术馆',
                    price: '免费',
                    views: '1890',
                    image: 'https://picsum.photos/400/250?random=25'
                },
                {
                    title: '古诗词朗诵大赛',
                    category: 'performance',
                    time: '2026-03-10 19:00',
                    location: '市文化宫',
                    price: '¥50/人',
                    views: '987',
                    image: 'https://picsum.photos/400/250?random=26'
                }
            ];
            
            // 添加新活动到页面
            moreEvents.forEach(event => {
                const isFree = event.price === '免费';
                const cardHtml = `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow-sm event-card" data-category="${event.category}">
                            <div class="card-img-top position-relative">
                                <img src="${event.image}" class="w-100" alt="${event.title}">
                                <span class="badge bg-primary position-absolute top-0 start-0 m-2">新上线</span>
                                <span class="badge bg-info position-absolute top-0 end-0 m-2">${
                                    event.category === 'exhibition' ? '展览' : 
                                    event.category === 'performance' ? '演出' : 
                                    event.category === 'experience' ? '体验课' : '讲座'
                                }</span>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title">${event.title}</h5>
                                <p class="card-text text-muted"><i class="bi bi-calendar me-1"></i>${event.time}</p>
                                <p class="card-text text-muted"><i class="bi bi-geo-alt me-1"></i>${event.location}</p>
                                <p class="card-text">${event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title}</p>
                                <div class="d-flex justify-content-between align-items-center mt-3">
                                    <span class="text-primary fw-bold">${event.price}</span>
                                    <span><i class="bi bi-eye me-1"></i>${event.views}人已浏览</span>
                                </div>
                            </div>
                            <div class="card-footer bg-transparent d-flex gap-2">
                                <button class="btn btn-sm btn-primary flex-fill" onclick="goToTicket('${event.title}', '${isFree ? 'free' : 'paid'}')">
                                    <i class="bi bi-ticket-detailed me-1"></i>${isFree ? '预约报名' : '立即购票'}
                                </button>
                                <button class="btn btn-sm btn-outline-primary flex-fill" onclick="viewEventDetail('${event.title}')">
                                    <i class="bi bi-info-circle me-1"></i>详情
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                eventsList.insertAdjacentHTML('beforeend', cardHtml);
            });
            
            // 恢复按钮状态
            isLoading = false;
            loadMoreBtn.innerHTML = '<i class="bi bi-arrow-down-circle me-2"></i>加载更多活动';
            loadMoreBtn.disabled = false;
            
            // 提示加载完成
            alert(`成功加载 ${moreEvents.length} 个新活动`);
            
        }, 1500); // 模拟1.5秒加载时间
    });
}

/**
 * 初始化发布活动表单提交
 */
function initPublishEventForm() {
    const submitBtn = document.getElementById('submitEventBtn');
    const form = document.getElementById('publishEventForm');
    const modal = bootstrap.Modal.getInstance(document.getElementById('publishEventModal'));
    
    submitBtn.addEventListener('click', function() {
        // 获取表单数据
        const eventName = document.getElementById('eventName').value.trim();
        const eventCategory = document.getElementById('eventCategory').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventTime = document.getElementById('eventTime').value;
        const eventLocation = document.getElementById('eventLocation').value.trim();
        const eventPrice = document.getElementById('eventPrice').value.trim() || '0';
        const eventQuota = document.getElementById('eventQuota').value.trim() || '不限';
        const eventDesc = document.getElementById('eventDesc').value.trim();
        
        // 表单验证
        if (!eventName) {
            alert('请输入活动名称！');
            return;
        }
        
        if (!eventCategory) {
            alert('请选择活动类型！');
            return;
        }
        
        if (!eventDate) {
            alert('请选择活动日期！');
            return;
        }
        
        if (!eventTime) {
            alert('请选择活动时间！');
            return;
        }
        
        if (!eventLocation) {
            alert('请输入活动地点！');
            return;
        }
        
        if (!eventDesc) {
            alert('请输入活动详情！');
            return;
        }
        
        // 模拟表单提交
        const eventData = {
            name: eventName,
            category: eventCategory,
            date: eventDate,
            time: eventTime,
            location: eventLocation,
            price: eventPrice,
            quota: eventQuota,
            description: eventDesc,
            publisher: localStorage.getItem('username') || '未知用户',
            publishTime: new Date().toLocaleString()
        };
        
        // 保存到本地存储
        let publishedEvents = JSON.parse(localStorage.getItem('publishedEvents') || '[]');
        publishedEvents.push(eventData);
        localStorage.setItem('publishedEvents', JSON.stringify(publishedEvents));
        
        // 提示发布成功
        alert(`活动【${eventName}】发布成功！\n\n活动将在审核通过后展示在平台上`);
        
        // 关闭模态框
        modal.hide();
        
        // 重置表单
        form.reset();
        
        // 模拟刷新页面
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    });
}

/**
 * 跳转到购票/预约页面
 * @param {string} eventName - 活动名称
 * @param {string} type - 类型 free/paid
 */
window.goToTicket = function(eventName, type) {
    // 检查登录状态
    const isLogin = localStorage.getItem('isLogin') === 'true';
    if (!isLogin) {
        alert('请先登录后再进行购票/预约操作！');
        window.location.href = 'login.html';
        return;
    }
    
    // 编码活动名称，避免URL问题
    const encodedName = encodeURIComponent(eventName);
    // 跳转到购票页面并传递参数
    window.location.href = `ticket.html?name=${encodedName}&type=${type}`;
};

/**
 * 查看活动详情
 * @param {string} eventName - 活动名称
 */
window.viewEventDetail = function(eventName) {
    // 记录浏览历史
    let browseHistory = JSON.parse(localStorage.getItem('browseHistory') || '[]');
    browseHistory.push({
        type: 'event',
        name: eventName,
        time: new Date().toLocaleString()
    });
    // 只保留最近10条记录
    if (browseHistory.length > 10) {
        browseHistory = browseHistory.slice(-10);
    }
    localStorage.setItem('browseHistory', JSON.stringify(browseHistory));
    
    // 模拟活动详情弹窗
    const detailModal = document.createElement('div');
    detailModal.className = 'modal fade';
    detailModal.tabIndex = -1;
    detailModal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">${eventName} - 活动详情</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-4 mb-md-0">
                            <img src="https://picsum.photos/600/400?random=${Math.floor(Math.random() * 100)}" class="img-fluid rounded shadow-sm w-100" alt="${eventName}">
                        </div>
                        <div class="col-md-6">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item"><strong>活动类型：</strong> ${
                                    eventName.includes('展') ? '展览' : 
                                    eventName.includes('演出') ? '演出' : 
                                    eventName.includes('课') ? '体验课' : 
                                    eventName.includes('论坛') || eventName.includes('讲座') ? '讲座' : '其他'
                                }</li>
                                <li class="list-group-item"><strong>举办时间：</strong> ${
                                    eventName.includes('2026-02-10') ? '2026-02-10 至 2026-03-10' :
                                    eventName.includes('2026-02-15') ? '2026-02-15 19:30' :
                                    eventName.includes('2026-02-20') ? '2026-02-20 14:00' :
                                    '2026-02-25 09:00'
                                }</li>
                                <li class="list-group-item"><strong>举办地点：</strong> ${
                                    eventName.includes('博物馆') ? '市博物馆 1号展厅' :
                                    eventName.includes('大剧院') ? '市大剧院' :
                                    eventName.includes('文化馆') ? '市文化馆 手工教室' :
                                    '国际会议中心'
                                }</li>
                                <li class="list-group-item"><strong>活动费用：</strong> ${
                                    eventName.includes('免费') || eventName.includes('非遗精品展') ? '免费' :
                                    eventName.includes('剪纸') ? '¥98/人' :
                                    eventName.includes('牡丹亭') ? '¥80-580' :
                                    '¥198/人'
                                }</li>
                                <li class="list-group-item"><strong>报名限额：</strong> ${
                                    eventName.includes('免费') ? '500人' : '200人'
                                }</li>
                                <li class="list-group-item"><strong>报名截止：</strong> 活动开始前1天</li>
                            </ul>
                        </div>
                    </div>
                    <div class="mt-4">
                        <h6>活动介绍</h6>
                        <p class="text-muted">
                            ${eventName}是本城市重点打造的文化品牌活动，旨在传承和弘扬中华优秀传统文化。
                            活动邀请了业内知名专家/非遗传承人亲临现场，通过${
                                eventName.includes('展') ? '实物展示、图文介绍、互动讲解' :
                                eventName.includes('演出') ? '专业的舞台表演、沉浸式体验' :
                                eventName.includes('课') ? '手把手教学、实操体验' :
                                '主题演讲、圆桌讨论、案例分享'
                            }等形式，让参与者深入了解${
                                eventName.includes('剪纸') ? '剪纸艺术的历史渊源和制作技巧' :
                                eventName.includes('牡丹亭') ? '昆曲艺术的独特魅力' :
                                eventName.includes('非遗') ? '各类非遗项目的文化价值' :
                                '城市文化发展的前沿理念'
                            }。
                        </p>
                    </div>
                    <div class="mt-4">
                        <h6>参与须知</h6>
                        <ul class="text-muted small">
                            <li>请提前15分钟到场签到，迟到者可能无法入场</li>
                            <li>活动期间请保持安静，遵守现场秩序</li>
                            <li>禁止携带食品、饮料进入活动现场</li>
                            <li>体验类活动请听从指导老师安排，注意安全</li>
                            <li>如需取消报名，请提前24小时操作</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                    <button type="button" class="btn btn-primary" onclick="goToTicket('${eventName}', '${
                        eventName.includes('免费') ? 'free' : 'paid'
                    }')">
                        <i class="bi bi-ticket-detailed me-1"></i>${
                            eventName.includes('免费') ? '预约报名' : '立即购票'
                        }
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 添加到页面并显示
    document.body.appendChild(detailModal);
    const modal = new bootstrap.Modal(detailModal);
    modal.show();
    
    // 关闭时移除模态框
    detailModal.addEventListener('hidden.bs.modal', function() {
        detailModal.remove();
    });
};