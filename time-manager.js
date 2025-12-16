// 时间管理系统 - 办公室生存游戏的时间控制和调度中心
class TimeManager {
    constructor(game) {
        this.game = game;
        this.initialized = false;
        
        // 时间状态
        this.gameTime = 0;              // 游戏内时间（秒）
        this.realTime = 0;              // 实际运行时间（秒）
        this.lastUpdateTime = Date.now(); // 上次更新的真实时间
        
        // 时间控制
        this.isPaused = false;          // 是否暂停
        this.timeScale = 1.0;           // 时间缩放比例（1.0 = 正常速度）
        this.maxTimeScale = 5.0;        // 最大时间加速倍数
        this.minTimeScale = 0.1;        // 最小时间减速倍数
        
        // 定时任务调度器
        this.scheduledTasks = new Map(); // 调度的任务
        this.taskIdCounter = 0;          // 任务ID计数器
        this.recurringTasks = new Map(); // 循环任务
        
        // 时间事件监听器
        this.timeEventListeners = new Map(); // 时间事件监听器
        
        // 性能监控
        this.frameCount = 0;
        this.fps = 60;
        this.lastFpsUpdate = Date.now();
        
        console.log('⏰ TimeManager 初始化完成');
    }

    // 初始化时间管理系统
    initialize() {
        if (this.initialized) {
            console.warn('TimeManager 已经初始化');
            return;
        }

        // 同步现有游戏时间
        if (this.game.gameTime) {
            this.gameTime = this.game.gameTime;
        }

        // 设置基础的循环任务
        this.setupBasicRecurringTasks();

        this.initialized = true;
        console.log('✅ TimeManager 系统初始化完成');
    }

    // 设置基础循环任务
    setupBasicRecurringTasks() {
        // 每秒更新任务
        this.addRecurringTask('fps_counter', 1.0, () => {
            this.updateFPS();
        });

        // 每5秒的系统检查
        this.addRecurringTask('system_check', 5.0, () => {
            this.performSystemCheck();
        });

        // 每30秒的自动保存提醒
        this.addRecurringTask('autosave_reminder', 30.0, () => {
            this.triggerAutosaveReminder();
        });
    }

    // 主更新方法
    update() {
        if (!this.initialized || this.isPaused) {
            return;
        }

        const currentTime = Date.now();
        const realDeltaTime = (currentTime - this.lastUpdateTime) / 1000; // 转换为秒
        this.lastUpdateTime = currentTime;

        // 更新实际运行时间
        this.realTime += realDeltaTime;

        // 计算游戏时间增量（考虑时间缩放）
        const gameDeltaTime = realDeltaTime * this.timeScale;
        this.gameTime += gameDeltaTime;

        // 同步到主游戏对象
        this.game.gameTime = this.gameTime;

        // 更新帧计数
        this.frameCount++;

        // 处理调度任务
        this.processScheduledTasks();
        this.processRecurringTasks(gameDeltaTime);

        // 触发时间事件
        this.triggerTimeEvents(gameDeltaTime);

        return gameDeltaTime;
    }

    // 暂停游戏时间
    pause() {
        if (this.isPaused) return false;
        
        this.isPaused = true;
        console.log('⏸️ 游戏时间已暂停');
        
        // 触发暂停事件
        this.triggerEvent('time_paused', { gameTime: this.gameTime });
        return true;
    }

    // 恢复游戏时间
    resume() {
        if (!this.isPaused) return false;
        
        this.isPaused = false;
        this.lastUpdateTime = Date.now(); // 重置时间基准
        console.log('▶️ 游戏时间已恢复');
        
        // 触发恢复事件
        this.triggerEvent('time_resumed', { gameTime: this.gameTime });
        return true;
    }

    // 切换暂停状态
    togglePause() {
        return this.isPaused ? this.resume() : this.pause();
    }

    // 设置时间缩放
    setTimeScale(scale) {
        const oldScale = this.timeScale;
        this.timeScale = Math.max(this.minTimeScale, Math.min(this.maxTimeScale, scale));
        
        if (this.timeScale !== oldScale) {
            console.log(`⚡ 时间缩放调整: ${oldScale.toFixed(1)}x → ${this.timeScale.toFixed(1)}x`);
            
            // 触发时间缩放变化事件
            this.triggerEvent('time_scale_changed', {
                oldScale: oldScale,
                newScale: this.timeScale
            });
        }
        
        return this.timeScale;
    }

    // 时间加速
    accelerateTime(factor = 2.0) {
        return this.setTimeScale(this.timeScale * factor);
    }

    // 时间减速
    decelerateTime(factor = 0.5) {
        return this.setTimeScale(this.timeScale * factor);
    }

    // 重置时间缩放
    resetTimeScale() {
        return this.setTimeScale(1.0);
    }

    // 添加单次调度任务
    scheduleTask(callback, delay, description = '未命名任务') {
        const taskId = ++this.taskIdCounter;
        const executeTime = this.gameTime + delay;
        
        const task = {
            id: taskId,
            callback: callback,
            executeTime: executeTime,
            description: description,
            type: 'once'
        };
        
        this.scheduledTasks.set(taskId, task);
        console.log(`📅 调度任务 #${taskId}: ${description} (${delay}秒后执行)`);
        
        return taskId;
    }

    // 添加循环任务
    addRecurringTask(name, interval, callback, description = null) {
        const task = {
            name: name,
            interval: interval,
            callback: callback,
            description: description || name,
            lastExecuteTime: this.gameTime,
            totalExecutions: 0
        };
        
        this.recurringTasks.set(name, task);
        console.log(`🔄 添加循环任务: ${name} (每${interval}秒执行)`);
        
        return name;
    }

    // 移除调度任务
    cancelTask(taskId) {
        if (this.scheduledTasks.has(taskId)) {
            const task = this.scheduledTasks.get(taskId);
            this.scheduledTasks.delete(taskId);
            console.log(`❌ 取消任务 #${taskId}: ${task.description}`);
            return true;
        }
        return false;
    }

    // 移除循环任务
    removeRecurringTask(name) {
        if (this.recurringTasks.has(name)) {
            const task = this.recurringTasks.get(name);
            this.recurringTasks.delete(name);
            console.log(`❌ 移除循环任务: ${name} (共执行${task.totalExecutions}次)`);
            return true;
        }
        return false;
    }

    // 处理调度任务
    processScheduledTasks() {
        const tasksToExecute = [];
        
        // 找出需要执行的任务
        for (const [taskId, task] of this.scheduledTasks) {
            if (this.gameTime >= task.executeTime) {
                tasksToExecute.push(task);
            }
        }
        
        // 执行任务
        tasksToExecute.forEach(task => {
            try {
                task.callback();
                console.log(`✅ 执行任务 #${task.id}: ${task.description}`);
            } catch (error) {
                console.error(`❌ 任务执行失败 #${task.id}:`, error);
            }
            
            // 移除已执行的单次任务
            this.scheduledTasks.delete(task.id);
        });
    }

    // 处理循环任务
    processRecurringTasks(deltaTime) {
        for (const [name, task] of this.recurringTasks) {
            const timeSinceLastExecution = this.gameTime - task.lastExecuteTime;
            
            if (timeSinceLastExecution >= task.interval) {
                try {
                    task.callback(deltaTime);
                    task.lastExecuteTime = this.gameTime;
                    task.totalExecutions++;
                } catch (error) {
                    console.error(`❌ 循环任务执行失败 ${name}:`, error);
                }
            }
        }
    }

    // 添加时间事件监听器
    addEventListener(eventType, callback, description = null) {
        if (!this.timeEventListeners.has(eventType)) {
            this.timeEventListeners.set(eventType, []);
        }
        
        const listener = {
            callback: callback,
            description: description || `${eventType} 监听器`
        };
        
        this.timeEventListeners.get(eventType).push(listener);
        console.log(`👂 添加时间事件监听器: ${eventType}`);
        
        return listener;
    }

    // 移除时间事件监听器
    removeEventListener(eventType, listener) {
        if (this.timeEventListeners.has(eventType)) {
            const listeners = this.timeEventListeners.get(eventType);
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
                console.log(`❌ 移除时间事件监听器: ${eventType}`);
                return true;
            }
        }
        return false;
    }

    // 触发时间事件
    triggerEvent(eventType, data = {}) {
        if (this.timeEventListeners.has(eventType)) {
            const listeners = this.timeEventListeners.get(eventType);
            listeners.forEach(listener => {
                try {
                    listener.callback(data);
                } catch (error) {
                    console.error(`❌ 时间事件处理失败 ${eventType}:`, error);
                }
            });
        }
    }

    // 触发基于时间的事件
    triggerTimeEvents(deltaTime) {
        // 每分钟事件
        if (Math.floor(this.gameTime / 60) > Math.floor((this.gameTime - deltaTime) / 60)) {
            this.triggerEvent('minute_passed', { 
                gameTime: this.gameTime, 
                minutes: Math.floor(this.gameTime / 60) 
            });
        }
        
        // 每小时事件（游戏内）
        if (Math.floor(this.gameTime / 3600) > Math.floor((this.gameTime - deltaTime) / 3600)) {
            this.triggerEvent('hour_passed', { 
                gameTime: this.gameTime, 
                hours: Math.floor(this.gameTime / 3600) 
            });
        }
    }

    // 更新FPS计数
    updateFPS() {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastFpsUpdate;
        
        if (timeDiff >= 1000) { // 每秒更新一次FPS
            this.fps = Math.round((this.frameCount * 1000) / timeDiff);
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }

    // 执行系统检查
    performSystemCheck() {
        // 检查任务队列大小
        if (this.scheduledTasks.size > 100) {
            console.warn(`⚠️ 调度任务队列过大: ${this.scheduledTasks.size} 个任务`);
        }
        
        // 检查循环任务执行情况
        for (const [name, task] of this.recurringTasks) {
            const timeSinceLastExecution = this.gameTime - task.lastExecuteTime;
            if (timeSinceLastExecution > task.interval * 2) {
                console.warn(`⚠️ 循环任务 ${name} 执行延迟: ${timeSinceLastExecution.toFixed(1)}秒`);
            }
        }
    }

    // 触发自动保存提醒
    triggerAutosaveReminder() {
        this.triggerEvent('autosave_reminder', { gameTime: this.gameTime });
    }

    // 获取时间状态信息
    getTimeStatus() {
        return {
            gameTime: this.gameTime,
            realTime: this.realTime,
            isPaused: this.isPaused,
            timeScale: this.timeScale,
            fps: this.fps,
            scheduledTasksCount: this.scheduledTasks.size,
            recurringTasksCount: this.recurringTasks.size,
            formattedGameTime: this.formatTime(this.gameTime),
            formattedRealTime: this.formatTime(this.realTime)
        };
    }

    // 格式化时间显示
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // 获取游戏运行时长描述
    getPlayTimeDescription() {
        const totalMinutes = Math.floor(this.gameTime / 60);
        
        if (totalMinutes < 1) {
            return '刚开始';
        } else if (totalMinutes < 60) {
            return `${totalMinutes} 分钟`;
        } else {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return minutes > 0 ? `${hours} 小时 ${minutes} 分钟` : `${hours} 小时`;
        }
    }

    // 序列化数据
    serialize() {
        return {
            gameTime: this.gameTime,
            realTime: this.realTime,
            timeScale: this.timeScale,
            isPaused: this.isPaused,
            // 不序列化调度任务和监听器，它们应该在初始化时重新创建
            recurringTaskStats: Array.from(this.recurringTasks.entries()).map(([name, task]) => ({
                name: name,
                totalExecutions: task.totalExecutions,
                lastExecuteTime: task.lastExecuteTime
            }))
        };
    }

    // 反序列化数据
    deserialize(data) {
        if (data.gameTime !== undefined) {
            this.gameTime = data.gameTime;
            this.game.gameTime = this.gameTime; // 同步到主游戏对象
        }
        if (data.realTime !== undefined) {
            this.realTime = data.realTime;
        }
        if (data.timeScale !== undefined) {
            this.timeScale = data.timeScale;
        }
        if (data.isPaused !== undefined) {
            this.isPaused = data.isPaused;
        }
        
        // 恢复循环任务统计
        if (data.recurringTaskStats) {
            data.recurringTaskStats.forEach(taskStat => {
                const task = this.recurringTasks.get(taskStat.name);
                if (task) {
                    task.totalExecutions = taskStat.totalExecutions;
                    task.lastExecuteTime = taskStat.lastExecuteTime;
                }
            });
        }
        
        console.log('📂 TimeManager 数据已加载');
    }

    // 清理资源
    destroy() {
        // 清理所有任务
        this.scheduledTasks.clear();
        this.recurringTasks.clear();
        this.timeEventListeners.clear();
        
        console.log('🧹 TimeManager 已清理');
    }

    // 调试信息
    getDebugInfo() {
        const scheduledTasksList = Array.from(this.scheduledTasks.values()).map(task => ({
            id: task.id,
            description: task.description,
            executeTime: task.executeTime,
            remainingTime: Math.max(0, task.executeTime - this.gameTime)
        }));
        
        const recurringTasksList = Array.from(this.recurringTasks.values()).map(task => ({
            name: task.name,
            description: task.description,
            interval: task.interval,
            totalExecutions: task.totalExecutions,
            timeSinceLastExecution: this.gameTime - task.lastExecuteTime
        }));
        
        return {
            timeStatus: this.getTimeStatus(),
            scheduledTasks: scheduledTasksList,
            recurringTasks: recurringTasksList,
            eventListeners: Array.from(this.timeEventListeners.keys())
        };
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeManager;
}