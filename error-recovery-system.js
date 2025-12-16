// 错误处理和恢复系统 - 办公室生存游戏错误管理和数据恢复
class ErrorRecoverySystem {
    constructor(game) {
        this.game = game;
        this.initialized = false;
        
        // 错误日志系统
        this.errorLogger = {
            logs: [],
            maxLogs: 1000,
            logLevel: 'info',
            enableConsoleOutput: true,
            enableLocalStorage: true
        };
        
        // 数据备份系统
        this.backupSystem = {
            backups: new Map(),
            maxBackups: 10,
            backupInterval: 60000, // 1分钟
            lastBackupTime: 0,
            autoBackupEnabled: true
        };
        
        // 错误恢复策略
        this.recoveryStrategies = new Map();
        
        // 系统健康监控
        this.healthMonitor = {
            isHealthy: true,
            lastHealthCheck: Date.now(),
            healthCheckInterval: 30000, // 30秒
            criticalErrors: 0,
            maxCriticalErrors: 5
        };
        
        // 错误统计
        this.errorStats = {
            totalErrors: 0,
            errorsByType: new Map(),
            errorsByComponent: new Map(),
            recentErrors: []
        };
        
        console.log('🛡️ ErrorRecoverySystem 初始化');
    }

    // 初始化错误处理和恢复系统
    initialize() {
        if (this.initialized) return;
        
        this.setupErrorHandlers();
        this.setupBackupSystem();
        this.setupRecoveryStrategies();
        this.setupHealthMonitoring();
        
        this.initialized = true;
        console.log('✅ 错误处理和恢复系统已启用');
    }

    // 设置错误处理器
    setupErrorHandlers() {
        // 全局错误处理
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, event.filename, event.lineno);
        });
        
        // Promise 拒绝处理
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection(event.reason);
        });
        
        console.log('🚨 错误处理器已设置');
    }

    // 处理全局错误
    handleGlobalError(error, filename, lineno) {
        const errorInfo = {
            type: 'global',
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            filename,
            lineno,
            timestamp: Date.now(),
            severity: 'error'
        };
        
        this.logError(errorInfo);
        this.attemptRecovery('global-error', errorInfo);
    }

    // 处理Promise拒绝
    handlePromiseRejection(reason) {
        const errorInfo = {
            type: 'promise-rejection',
            message: reason?.message || reason?.toString() || 'Promise rejected',
            stack: reason?.stack,
            timestamp: Date.now(),
            severity: 'error'
        };
        
        this.logError(errorInfo);
    }

    // 记录错误
    logError(errorInfo) {
        this.errorLogger.logs.push(errorInfo);
        
        if (this.errorLogger.logs.length > this.errorLogger.maxLogs) {
            this.errorLogger.logs.shift();
        }
        
        this.updateErrorStats(errorInfo);
        
        if (this.errorLogger.enableConsoleOutput) {
            console.error(`[${new Date(errorInfo.timestamp).toLocaleTimeString()}] ${errorInfo.severity.toUpperCase()}: ${errorInfo.message}`);
        }
        
        this.checkSystemHealth(errorInfo);
    }

    // 更新错误统计
    updateErrorStats(errorInfo) {
        this.errorStats.totalErrors++;
        
        const type = errorInfo.type;
        this.errorStats.errorsByType.set(type, (this.errorStats.errorsByType.get(type) || 0) + 1);
        
        this.errorStats.recentErrors.push(errorInfo);
        if (this.errorStats.recentErrors.length > 50) {
            this.errorStats.recentErrors.shift();
        }
    }

    // 设置备份系统
    setupBackupSystem() {
        if (this.backupSystem.autoBackupEnabled) {
            setInterval(() => {
                if (this.shouldCreateBackup()) {
                    this.createBackup('auto');
                }
            }, this.backupSystem.backupInterval);
        }
        
        this.createBackup('initial');
        console.log('💾 数据备份系统已设置');
    }

    // 检查是否应该创建备份
    shouldCreateBackup() {
        const now = Date.now();
        return (now - this.backupSystem.lastBackupTime) >= this.backupSystem.backupInterval;
    }

    // 创建备份
    createBackup(type = 'manual') {
        try {
            const backupData = this.gatherBackupData();
            const backupId = `${type}-${Date.now()}`;
            
            this.backupSystem.backups.set(backupId, {
                id: backupId,
                type,
                timestamp: Date.now(),
                data: backupData
            });
            
            this.limitBackups();
            this.backupSystem.lastBackupTime = Date.now();
            
            console.log(`💾 创建备份: ${backupId}`);
            return backupId;
        } catch (error) {
            console.error('创建备份失败:', error);
            return null;
        }
    }

    // 收集备份数据
    gatherBackupData() {
        const backupData = {
            version: '1.0.0',
            timestamp: Date.now(),
            gameState: {
                gameTime: this.game.gameTime,
                employees: this.serializeEmployees(),
                complaintStats: Array.from(this.game.complaintStats.entries())
            }
        };
        
        // 添加增强功能数据
        if (this.game.gameManager) {
            try {
                backupData.enhancedFeatures = {
                    resources: this.game.gameManager.getResourceSystem()?.serialize(),
                    achievements: this.game.gameManager.getAchievementSystem()?.serialize()
                };
            } catch (error) {
                console.warn('收集增强功能数据时出错:', error);
            }
        }
        
        return backupData;
    }

    // 序列化员工数据
    serializeEmployees() {
        return this.game.employees.map(employee => ({
            x: employee.x,
            y: employee.y,
            name: employee.name,
            imageIndex: employee.imageIndex,
            state: employee.state,
            personality: employee.personality,
            mood: employee.mood,
            energy: employee.energy,
            stress: employee.stress
        }));
    }

    // 限制备份数量
    limitBackups() {
        const backupEntries = Array.from(this.backupSystem.backups.entries());
        
        if (backupEntries.length > this.backupSystem.maxBackups) {
            backupEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            
            const toDelete = backupEntries.length - this.backupSystem.maxBackups;
            for (let i = 0; i < toDelete; i++) {
                this.backupSystem.backups.delete(backupEntries[i][0]);
            }
        }
    }

    // 恢复备份
    restoreBackup(backupId) {
        const backup = this.backupSystem.backups.get(backupId);
        if (!backup) {
            throw new Error(`备份不存在: ${backupId}`);
        }
        
        try {
            const backupData = backup.data;
            
            // 恢复游戏状态
            this.restoreGameState(backupData.gameState);
            
            // 恢复增强功能状态
            if (backupData.enhancedFeatures && this.game.gameManager) {
                this.restoreEnhancedFeatures(backupData.enhancedFeatures);
            }
            
            console.log(`✅ 备份恢复成功: ${backupId}`);
            return true;
        } catch (error) {
            console.error('备份恢复失败:', error);
            return false;
        }
    }

    // 恢复游戏状态
    restoreGameState(gameState) {
        if (gameState.gameTime !== undefined) {
            this.game.gameTime = gameState.gameTime;
        }
        
        if (gameState.employees) {
            this.restoreEmployees(gameState.employees);
        }
        
        if (gameState.complaintStats) {
            // 过滤掉无效的条目
            const validEntries = gameState.complaintStats.filter(
                entry => entry && entry[0] != null && entry[1] != null
            );
            this.game.complaintStats = new Map(validEntries);
        }
    }

    // 恢复员工数据
    restoreEmployees(employeesData) {
        this.game.employees.length = 0;
        
        employeesData.forEach(empData => {
            const employee = {
                x: empData.x || 0,
                y: empData.y || 0,
                width: 32,
                height: 32,
                name: empData.name || '未知员工',
                imageIndex: empData.imageIndex || 0,
                state: empData.state || 'wandering',
                personality: empData.personality,
                mood: empData.mood || 50,
                energy: empData.energy || 70,
                stress: empData.stress || 20,
                targetX: empData.x || 0,
                targetY: empData.y || 0,
                speed: 1 + Math.random() * 0.5,
                showName: false,
                nameTimer: 0,
                path: [],
                complaint: null,
                complaintTimer: 0,
                nextComplaintTime: 60 + Math.random() * 180,
                workTimer: 0,
                currentDesk: null
            };
            
            this.game.employees.push(employee);
        });
    }

    // 恢复增强功能
    restoreEnhancedFeatures(enhancedData) {
        try {
            if (enhancedData.resources && this.game.gameManager.getResourceSystem()) {
                this.game.gameManager.getResourceSystem().deserialize(enhancedData.resources);
            }
            
            if (enhancedData.achievements && this.game.gameManager.getAchievementSystem()) {
                this.game.gameManager.getAchievementSystem().deserialize(enhancedData.achievements);
            }
        } catch (error) {
            console.warn('恢复增强功能时出错:', error);
        }
    }

    // 设置恢复策略
    setupRecoveryStrategies() {
        this.recoveryStrategies.set('global-error', {
            attempts: 0,
            maxAttempts: 3,
            strategy: (errorInfo) => this.recoverFromGlobalError(errorInfo)
        });
        
        console.log('🔧 恢复策略已设置');
    }

    // 尝试恢复
    attemptRecovery(errorType, errorInfo) {
        const strategy = this.recoveryStrategies.get(errorType);
        if (!strategy) {
            return false;
        }
        
        if (strategy.attempts >= strategy.maxAttempts) {
            this.escalateError(errorType, errorInfo);
            return false;
        }
        
        try {
            strategy.attempts++;
            const result = strategy.strategy(errorInfo);
            
            if (result) {
                console.log(`✅ 恢复成功: ${errorType}`);
                strategy.attempts = 0;
            }
            
            return result;
        } catch (recoveryError) {
            console.error(`恢复策略执行失败: ${errorType}`, recoveryError);
            return false;
        }
    }

    // 从全局错误恢复
    recoverFromGlobalError(errorInfo) {
        try {
            if (this.game.gameManager && !this.game.gameManager.initialized) {
                this.game.gameManager.initialize();
            }
            
            if (!this.game.gameStarted) {
                this.game.gameStarted = true;
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }

    // 升级错误处理
    escalateError(errorType, errorInfo) {
        console.error(`🚨 严重错误需要用户干预: ${errorType}`, errorInfo);
        
        if (window.uxEnhancer) {
            window.uxEnhancer.showNotification(
                '游戏遇到严重错误，正在尝试恢复...', 
                'error', 
                5000
            );
        }
        
        this.createBackup('emergency');
        this.healthMonitor.isHealthy = false;
        this.healthMonitor.criticalErrors++;
        
        if (this.healthMonitor.criticalErrors >= this.healthMonitor.maxCriticalErrors) {
            this.recommendRestart();
        }
    }

    // 建议重启
    recommendRestart() {
        console.error('🚨 系统错误过多，建议重启游戏');
        
        if (window.uxEnhancer) {
            window.uxEnhancer.showNotification(
                '系统遇到多个严重错误，建议刷新页面重启游戏', 
                'error', 
                10000
            );
        }
    }

    // 设置健康监控
    setupHealthMonitoring() {
        setInterval(() => {
            this.performHealthCheck();
        }, this.healthMonitor.healthCheckInterval);
        
        console.log('💊 系统健康监控已设置');
    }

    // 执行健康检查
    performHealthCheck() {
        const healthReport = {
            timestamp: Date.now(),
            isHealthy: true,
            issues: []
        };
        
        // 检查错误频率
        const recentErrorCount = this.errorStats.recentErrors.filter(
            error => Date.now() - error.timestamp < 60000
        ).length;
        
        if (recentErrorCount > 10) {
            healthReport.issues.push(`错误频率过高: ${recentErrorCount}/分钟`);
            healthReport.isHealthy = false;
        }
        
        // 检查关键系统状态
        if (!this.game.gameStarted) {
            healthReport.issues.push('游戏未正常启动');
            healthReport.isHealthy = false;
        }
        
        this.healthMonitor.isHealthy = healthReport.isHealthy;
        this.healthMonitor.lastHealthCheck = Date.now();
        
        if (!healthReport.isHealthy) {
            console.warn('💊 系统健康检查发现问题:', healthReport.issues);
        }
        
        return healthReport;
    }

    // 检查系统健康状况
    checkSystemHealth(errorInfo) {
        if (errorInfo.severity === 'critical') {
            this.healthMonitor.criticalErrors++;
        }
        
        if (this.healthMonitor.criticalErrors >= this.healthMonitor.maxCriticalErrors) {
            this.healthMonitor.isHealthy = false;
        }
    }

    // 获取错误报告
    getErrorReport() {
        return {
            summary: {
                totalErrors: this.errorStats.totalErrors,
                criticalErrors: this.healthMonitor.criticalErrors,
                isHealthy: this.healthMonitor.isHealthy
            },
            errorsByType: Object.fromEntries(this.errorStats.errorsByType),
            recentErrors: this.errorStats.recentErrors.slice(-10),
            backupInfo: {
                totalBackups: this.backupSystem.backups.size,
                lastBackupTime: this.backupSystem.lastBackupTime
            }
        };
    }

    // 获取备份列表
    getBackupList() {
        return Array.from(this.backupSystem.backups.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(backup => ({
                id: backup.id,
                type: backup.type,
                timestamp: backup.timestamp
            }));
    }

    // 清理系统
    cleanup() {
        this.createBackup('shutdown');
        console.log('🧹 错误恢复系统已清理');
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorRecoverySystem;
}