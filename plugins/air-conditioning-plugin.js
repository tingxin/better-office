// 空调优化插件 - 解决温度问题
class AirConditioningPlugin extends OfficePlugin {
    constructor() {
        super(
            '智能空调系统',
            '安装智能空调系统，自动调节办公室温度，减少员工关于温度的抱怨',
            ['空调问题']
        );
        this.temperatureLevel = 0; // 0=正常, 1=优化, 2=完美
    }

    onActivate() {
        // 实施空调优化解决方案
        this.api.implementSolution('smart-ac-system', {
            type: 'facility-upgrade',
            cost: 50000,
            maintenanceCost: 2000,
            efficiency: 0.8
        });

        // 立即减少空调相关抱怨
        this.api.reduceComplaints('空调问题', 0.7);

        // 添加温控面板
        this.api.addActivityArea({
            name: '温控面板',
            x: 280,
            y: 150,
            width: 30,
            height: 20,
            icon: '🌡️',
            color: '#E3F2FD',
            borderColor: '#2196F3'
        });

        // 通知UI更新
        this.notifyUIActivation();

        // 定期维护效果
        this.maintenanceInterval = setInterval(() => {
            if (this.isActive) {
                this.performMaintenance();
            }
        }, 30000); // 每30秒维护一次

        console.log('🌡️ 智能空调系统已启动，办公室温度得到优化');
    }

    onDeactivate() {
        this.api.removeSolution('smart-ac-system');

        if (this.maintenanceInterval) {
            clearInterval(this.maintenanceInterval);
        }

        console.log('❄️ 智能空调系统已关闭');
    }

    // UI通知方法
    notifyUIActivation() {
        if (typeof window !== 'undefined') {
            setTimeout(() => {
                const card = document.getElementById('ac-plugin-card');
                const status = document.getElementById('ac-status');
                const toggle = document.getElementById('ac-toggle');
                const settings = document.getElementById('ac-settings');

                if (card) {
                    card.classList.add('active');
                    status.textContent = '已激活';
                    status.classList.add('active');
                    toggle.textContent = '停用插件';
                    settings.style.display = 'block';
                }
            }, 100);
        }
    }

    performMaintenance() {
        // 持续减少温度相关抱怨
        const stats = this.api.getComplaintStats();
        if (stats.get('空调问题') > 0) {
            this.api.reduceComplaints('空调问题', 0.1);
        }

        // 提升员工满意度
        if (Math.random() < 0.3) {
            this.api.boostEmployeeMorale();
        }
    }

    // 插件特有方法
    adjustTemperature(level) {
        this.temperatureLevel = Math.max(0, Math.min(2, level));
        const effectiveness = [0.5, 0.7, 0.9][this.temperatureLevel];

        this.api.reduceComplaints('空调问题', effectiveness);
        console.log(`🌡️ 温度调节至级别 ${this.temperatureLevel}`);
    }
}

// 延迟注册插件
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.game) {
                const acPlugin = new AirConditioningPlugin();
                window.game.registerPlugin(acPlugin);
                console.log('🌡️ 空调插件已注册');
            }
        }, 1500); // 确保游戏完全加载后再注册
    });
}