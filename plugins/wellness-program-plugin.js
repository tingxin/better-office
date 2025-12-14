// 员工健康计划插件 - 解决健康和满意度问题
class WellnessProgramPlugin extends OfficePlugin {
    constructor() {
        super(
            '员工健康计划',
            '实施综合健康计划，包括健身设施、健康零食和定期休息提醒',
            ['健康问题', '座椅问题', '异味问题']
        );
        this.programs = [];
    }

    onActivate() {
        // 实施健康计划
        this.api.implementSolution('wellness-program', {
            type: 'employee-benefit',
            cost: 30000,
            monthlyFee: 3000,
            satisfaction: 0.85
        });

        // 添加健身区域
        this.api.addActivityArea({
            name: '健身角',
            x: 400,
            y: 600,
            width: 100,
            height: 80,
            icon: '💪',
            color: '#FFF3E0',
            borderColor: '#FF9800'
        });

        // 添加冥想区
        this.api.addActivityArea({
            name: '冥想区',
            x: 520,
            y: 600,
            width: 80,
            height: 60,
            icon: '🧘',
            color: '#E8F5E8',
            borderColor: '#4CAF50'
        });

        // 立即减少相关抱怨
        this.api.reduceComplaints('健康问题', 0.6);
        this.api.reduceComplaints('座椅问题', 0.3);

        // 定期健康活动
        this.wellnessInterval = setInterval(() => {
            this.runWellnessActivity();
        }, 25000); // 每25秒一次健康活动

        console.log('💪 员工健康计划已启动');
    }

    onDeactivate() {
        this.api.removeSolution('wellness-program');

        if (this.wellnessInterval) {
            clearInterval(this.wellnessInterval);
        }

        console.log('💪 员工健康计划已结束');
    }

    runWellnessActivity() {
        const activities = [
            '伸展运动提醒',
            '健康零食分发',
            '空气净化',
            '人体工学检查',
            '压力缓解活动'
        ];

        const activity = activities[Math.floor(Math.random() * activities.length)];

        switch (activity) {
            case '伸展运动提醒':
                this.api.reduceComplaints('健康问题', 0.1);
                this.api.boostEmployeeMorale();
                break;

            case '健康零食分发':
                this.api.boostEmployeeMorale();
                break;

            case '空气净化':
                this.api.reduceComplaints('异味问题', 0.2);
                break;

            case '人体工学检查':
                this.api.reduceComplaints('座椅问题', 0.15);
                break;

            case '压力缓解活动':
                this.api.boostEmployeeMorale();
                this.api.reduceComplaints('健康问题', 0.05);
                break;
        }

        console.log(`🌟 健康活动: ${activity}`);

        // 更新UI显示
        this.updateActivityUI(activity);
    }

    // 特殊健康检查
    conductHealthCheck() {
        this.api.reduceComplaints('健康问题', 0.5);
        this.api.reduceComplaints('座椅问题', 0.3);
        console.log('🏥 员工健康检查完成');
    }

    // 更新活动UI显示
    updateActivityUI(activity) {
        if (typeof window !== 'undefined') {
            setTimeout(() => {
                const activitySpan = document.getElementById('wellness-activity');
                if (activitySpan) {
                    activitySpan.textContent = activity;
                    setTimeout(() => {
                        activitySpan.textContent = '待机中';
                    }, 3000);
                }
            }, 100);
        }
    }
}

// 延迟注册插件
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.game) {
                const wellnessPlugin = new WellnessProgramPlugin();
                window.game.registerPlugin(wellnessPlugin);
                console.log('💪 健康计划插件已注册');
            }
        }, 1500);
    });
}