// 打印机维护插件 - 解决打印机问题
class PrinterMaintenancePlugin extends OfficePlugin {
    constructor() {
        super(
            '打印机维护系统',
            '定期维护打印机，减少卡纸和故障，显示实时工作状态',
            ['打印机问题', '排队问题'],
            '办公设备专家',
            '3.0.0',
            {
                effectInterval: 4000, // 4秒触发一次工作效果
                complaintReduction: 0.12, // 每次减少12%抱怨
                icon: '🖨️',
                color: '#4CAF50'
            }
        );
        this.printerAreas = [];
        this.maintenanceLevel = 1; // 1=基础, 2=高级, 3=专业
    }

    // 初始化抱怨映射
    initComplaintMapping() {
        // 打印机插件主要针对打印和排队问题
        this.complaintMapping.set('打印机问题', [
            '打印机又坏了，我的文件还等着打印呢',
            '打印机卡纸了，谁来修一下',
            '打印机没墨了，怎么办'
        ]);

        this.complaintMapping.set('排队问题', [
            '复印机前排了好长的队，什么时候轮到我',
            '打印机只有一台，大家都在等'
        ]);
    }

    onActivate() {
        // 实施打印机维护解决方案
        this.api.implementSolution('printer-maintenance', {
            type: 'maintenance-service',
            cost: 15000,
            monthlyFee: 1500,
            reliability: 0.95
        });

        // 立即减少打印机相关抱怨
        this.api.reduceComplaints('打印机问题', 0.8);
        this.api.reduceComplaints('排队问题', 0.4);

        // 减少员工抱怨频率
        this.api.reduceComplaintFrequency(null, 1.4);

        // 找到现有的打印机区域并添加备用打印机
        this.setupPrinterAreas();

        console.log('🖨️ 打印机维护系统已启动');
    }

    onDeactivate() {
        this.api.removeSolution('printer-maintenance');
        console.log('🖨️ 打印机维护系统已关闭');
    }

    // 设置打印机区域
    setupPrinterAreas() {
        // 找到现有的打印机区域
        const existingPrinters = this.api.getFacilities().activityAreas.filter(area =>
            area.name.includes('打印机')
        );

        this.printerAreas = [...existingPrinters];

        // 添加备用打印机
        const backupPrinter = {
            name: '备用打印机',
            x: 720, // 放在右侧
            y: 120,
            width: 50,
            height: 40,
            icon: '🖨️',
            color: '#E8F5E8',
            borderColor: '#4CAF50'
        };

        this.api.addActivityArea(backupPrinter);
        this.printerAreas.push(backupPrinter);
    }

    // 触发视觉效果
    triggerVisualEffect() {
        if (this.effectSystem) {
            // 为所有打印机添加工作效果
            this.effectSystem.addPrinterWorkingEffect(this.printerAreas);

            // 添加维护粒子效果
            this.printerAreas.forEach(printer => {
                this.effectSystem.addParticleEffect(
                    printer.x + printer.width / 2,
                    printer.y + printer.height / 2,
                    'maintenance',
                    3
                );
            });
        }
    }

    // 升级维护等级
    upgradeMaintenance(level) {
        this.maintenanceLevel = Math.max(1, Math.min(3, level));
        const effectiveness = [0, 0.12, 0.18, 0.25][this.maintenanceLevel];

        // 更新配置
        this.updateConfig({
            complaintReduction: effectiveness,
            effectInterval: Math.max(2000, 5000 - this.maintenanceLevel * 1000)
        });

        console.log(`🔧 维护等级提升至 ${this.maintenanceLevel}`);
    }

    // 紧急维修
    emergencyRepair() {
        this.api.reduceComplaints('打印机问题', 0.9);

        // 触发特殊维修效果
        if (this.effectSystem) {
            this.printerAreas.forEach(printer => {
                this.effectSystem.addParticleEffect(
                    printer.x + printer.width / 2,
                    printer.y + printer.height / 2,
                    'sparkle',
                    8
                );
            });
        }

        console.log('🚨 紧急维修完成，打印机恢复正常');
    }

    // 获取维护状态
    getMaintenanceStatus() {
        const levels = ['', '基础维护', '高级维护', '专业维护'];
        return {
            level: this.maintenanceLevel,
            description: levels[this.maintenanceLevel],
            printerCount: this.printerAreas.length,
            effectiveness: this.config.complaintReduction
        };
    }
}

// 延迟注册插件
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.game) {
                const printerPlugin = new PrinterMaintenancePlugin();
                window.game.registerPlugin(printerPlugin);
                console.log('🖨️ 打印机插件已注册');
            }
        }, 1500);
    });
}