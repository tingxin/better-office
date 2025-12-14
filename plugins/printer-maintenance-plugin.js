// 打印机维护插件 - 解决打印机问题
class PrinterMaintenancePlugin extends OfficePlugin {
    constructor() {
        super(
            '打印机维护系统',
            '定期维护打印机，减少卡纸和故障，提供备用打印机',
            ['打印机问题', '排队问题'],
            '办公设备专家',
            '2.1.0'
        );
        this.maintenanceSchedule = [];
        this.backupPrinters = 0;
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

        // 添加备用打印机
        this.addBackupPrinter();

        // 设置定期维护
        this.maintenanceInterval = setInterval(() => {
            this.performMaintenance();
        }, 20000); // 每20秒维护一次

        console.log('🖨️ 打印机维护系统已启动');
    }

    onDeactivate() {
        this.api.removeSolution('printer-maintenance');

        if (this.maintenanceInterval) {
            clearInterval(this.maintenanceInterval);
        }

        console.log('🖨️ 打印机维护系统已关闭');
    }

    // 更新UI显示
    updateUI() {
        if (typeof window !== 'undefined') {
            setTimeout(() => {
                const countSpan = document.getElementById('backup-count');
                if (countSpan) {
                    countSpan.textContent = this.backupPrinters;
                }
            }, 100);
        }
    }

    addBackupPrinter() {
        this.api.addActivityArea({
            name: '备用打印机',
            x: 1000,
            y: 200,
            width: 50,
            height: 40,
            icon: '🖨️',
            color: '#E8F5E8',
            borderColor: '#4CAF50'
        });

        this.backupPrinters++;
        console.log('🖨️ 已添加备用打印机');

        // 更新UI显示
        this.updateUI();
    }

    performMaintenance() {
        // 预防性维护
        const stats = this.api.getComplaintStats();

        if (stats.get('打印机问题') > 0) {
            this.api.reduceComplaints('打印机问题', 0.15);
        }

        if (stats.get('排队问题') > 0) {
            this.api.reduceComplaints('排队问题', 0.1);
        }

        // 随机维护事件
        if (Math.random() < 0.1) {
            console.log('🔧 正在进行打印机预防性维护...');
            this.api.boostEmployeeMorale();
        }
    }

    // 紧急维修
    emergencyRepair() {
        this.api.reduceComplaints('打印机问题', 0.9);
        console.log('🚨 紧急维修完成，打印机恢复正常');
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