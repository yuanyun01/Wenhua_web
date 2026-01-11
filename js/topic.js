// 初始化本地存储数据结构
function initForumData() {
    if (!localStorage.getItem('forumTopics')) {
        // 初始话题数据（示例）
        const initialTopics = [
            {
                id: 1,
                title: "非遗剪纸体验课真的太赞了！",
                content: "上周参加了市文化馆的剪纸体验课，非遗传承人王老师教得非常耐心，虽然是第一次尝试，但也做出了满意的作品。强烈推荐大家去体验一下，感受传统工艺的魅力！",
                author: "文化爱好者_01",
                avatar: "https://picsum.photos/50/50?random=30",
                time: "2026-02-08 10:25",
                category: "experience",
                likes: 89,
                comments: [
                    {
                        id: 101,
                        author: "游客2026",
                        avatar: "https://picsum.photos/50/50?random=31",
                        time: "2026-02-08 11:10",
                        content: "我也去了，确实很棒！王老师的手艺太厉害了",
                        likes: 12
                    },
                    {
                        id: 102,
                        author: "传统文化迷",
                        avatar: "https://picsum.photos/50/50?random=32",
                        time: "2026-02-08 14:20",
                        content: "请问下次体验课是什么时候？想带孩子一起去",
                        likes: 8
                    }
                ]
            },
            {
                id: 2,
                title: "如何更好地传承和发展城市传统文化？",
                content: "随着城市化进程的加快，许多传统民俗文化面临失传的风险。大家认为应该如何平衡现代化发展和传统文化保护？欢迎各抒己见，为城市文化发展建言献策。",
                author: "城市文化研究",
                avatar: "https://picsum.photos/50/50?random=33",
                time: "2026-02-07 15:40",
                category: "discussion",
                likes: 156,
                comments: [
                    {
                        id: 201,
                        author: "老城区居民",
                        avatar: "https://picsum.photos/50/50?random=34",
                        time: "2026-02-07 16:15",
                        content: "我认为应该在老城区建立更多的文化展示区，保留原有建筑风格，同时引入新业态，让年轻人也愿意来",
                        likes: 28
                    }
                ]
            }
        ];
        localStorage.setItem('forumTopics', JSON.stringify(initialTopics));
    }
}

// 获取所有话题
function getTopics() {
    return JSON.parse(localStorage.getItem('forumTopics') || '[]');
}

// 保存话题到本地存储
function saveTopics(topics) {
    localStorage.setItem('forumTopics', JSON.stringify(topics));
}