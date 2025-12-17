// 空调优化插件 - 解决温度问题
class AirConditioningPlugin extends OfficePlugin {
    constructor() {
        super(
            '智能空调系统',
            '安装智能空调系统，自动调节办公室温度，减少员工关于温度的抱怨',
            ['空调问题'],
            'Kiro开发团队',
            '2.0.0',
            {
                effectInterval: 5000, // 5秒触发一次凉风效果
                complaintReduction: 0.15, // 每次减少15%抱怨
                icon: '❄️',
                color: '#2196F3'
            }
        );
        this.temperatureLevel = 1; // 1=正常, 2=优化, 3=完美
        this.controlPanel = null;
    }

    // 初始化抱怨映射
    initComplaintMapping() {
        // 空调插件主要针对温度相关抱怨
        this.complaintMapping.set('空调问题', [
            '今天办公室好热啊，空调能不能开大一点',
            '办公室太冷了，能调高一点温度吗',
            '空调风太大了，吹得我头疼'
        ]);

        // 也能间接改善一些其他问题
        this.complaintMapping.set('异味问题', [
            '谁在吃榴莲啊，味道太重了'
        ]);
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

        // 减少员工抱怨频率
        this.api.reduceComplaintFrequency(null, 1.3);

        // 添加温控面板
        this.controlPanel = {
            name: '智能温控面板',
            x: 650, // 放在右侧区域
            y: 80,
            width: 40,
            height: 30,
            icon: '🌡️',
            color: '#E3F2FD',
            borderColor: '#2196F3'
        };
        this.api.addActivityArea(this.controlPanel);

        console.log('❄️ 智能空调系统已启动，办公室温度得到优化');
    }

    onDeactivate() {
        this.api.removeSolution('smart-ac-system');
        console.log('🌡️ 智能空调系统已关闭');
    }

    // 触发视觉效果
    triggerVisualEffect() {
        if (this.effectSystem) {
            // 添加凉风效果
            this.effectSystem.addCoolingEffect([this.controlPanel]);

            // 在办公区域添加一些凉爽粒子
            const officeAreas = [
                { x: 300, y: 100, width: 400, height: 300 } // 主办公区域
            ];

            officeAreas.forEach(area => {
                for (let i = 0; i < 5; i++) {
                    this.effectSystem.addParticleEffect(
                        area.x + Math.random() * area.width,
                        area.y + Math.random() * area.height,
                        'sparkle',
                        2
                    );
                }
            });
        }
    }

    // 插件特有方法
    adjustTemperature(level) {
        this.temperatureLevel = Math.max(1, Math.min(3, level));
        const effectiveness = [0, 0.1, 0.2, 0.3][this.temperatureLevel];

        // 更新配置
        this.updateConfig({
            complaintReduction: 0.1 + effectiveness
        });

        this.api.reduceComplaints('空调问题', effectiveness);
        console.log(`🌡️ 温度调节至级别 ${this.temperatureLevel}`);
    }

    // 获取温度状态
    getTemperatureStatus() {
        const levels = ['', '正常', '舒适', '完美'];
        return {
            level: this.temperatureLevel,
            description: levels[this.temperatureLevel],
            effectiveness: this.config.complaintReduction
        };
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