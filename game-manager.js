// 游戏管理器 - 办公室生存游戏增强功能的中央协调器
class GameManager {
    constructor(game) {
        this.game = game;
        this.initialized = false;
        
        // 核心系统
        this.timeManager = null;
        this.resourceSystem = null;
        this.achievementSystem = null;
        this.eventSystem = null;
        this.progressionSystem = null;
        this.facilityManager = null;
        this.statisticsSystem = null;
        this.leaderboardSystem = null;
        
        // 数据持久化
        this.saveKey = 'office-game-enhanced-data';
        this.autoSaveInterval = null;
    }

    // 初始化所有增强系统
    initialize() {
        if (this.initialized) {
            console.warn('GameManager 已经初始化');
            return;
        }

        console.log('🎮 初始化游戏增强系统...');

        // 初始化各个子系统
        this.timeManager = new TimeManager(this.game);
        this.resourceSystem = new ResourceSystem(this);
        this.achievementSystem = new AchievementSystem(this);
        this.eventSystem = new EventSystem(this);
        this.progressionSystem = new ProgressionSystem(this);
        this.facilityManager = new FacilityManager(this);
        this.statisticsSystem = new StatisticsSystem(this);
        this.leaderboardSystem = new LeaderboardSystem(this);

        // 初始化时间管理器
        this.timeManager.initialize();

        // 加载保存的数据
        this.load();

        // 设置自动保存
        this.setupAutoSave();

        this.initialized = true;
        console.log('✅ 游戏增强系统初始化完成');
    }

    // 游戏主循环更新
    update(deltaTime) {
        if (!this.initialized) return;

        // 首先更新时间管理器，获取调整后的deltaTime
        const adjustedDeltaTime = this.timeManager.update() || deltaTime;

        // 更新各个系统
        this.resourceSystem.update(adjustedDeltaTime);
        this.achievementSystem.update(adjustedDeltaTime);
        this.eventSystem.update(adjustedDeltaTime);
        this.progressionSystem.update(adjustedDeltaTime);
        this.facilityManager.update(adjustedDeltaTime);
        this.statisticsSystem.update(adjustedDeltaTime);
        this.leaderboardSystem.update(adjustedDeltaTime);
    }

    // 获取系统访问接口
    getTimeManager() {
        return this.timeManager;
    }

    getResourceSystem() {
        return this.resourceSystem;
    }

    getAchievementSystem() {
        return this.achievementSystem;
    }

    getEventSystem() {
        return this.eventSystem;
    }

    getProgressionSystem() {
        return this.progressionSystem;
    }

    getFacilityManager() {
        return this.facilityManager;
    }

    getStatisticsSystem() {
        return this.statisticsSystem;
    }

    getLeaderboardSystem() {
        return this.leaderboardSystem;
    }

    // 数据持久化 - 保存
    save() {
        if (!this.initialized) return;

        const saveData = {
            version: '1.0.0',
            timestamp: Date.now(),
            timeManager: this.timeManager.serialize(),
            resources: this.resourceSystem.serialize(),
            achievements: this.achievementSystem.serialize(),
            events: this.eventSystem.serialize(),
            progression: this.progressionSystem.serialize(),
            facilities: this.facilityManager.serialize(),
            statistics: this.statisticsSystem.serialize(),
            leaderboard: this.leaderboardSystem.serialize(),
            gameStats: {
                totalPlayTime: this.game.gameTime,
                employeeCount: this.game.employees.length,
                complaintStats: Array.from(this.game.complaintStats.entries())
            }
        };

        try {
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            console.log('💾 游戏数据已保存');
        } catch (error) {
            console.error('❌ 保存游戏数据失败:', error);
        }
    }

    // 数据持久化 - 加载
    load() {
        try {
            const savedData = localStorage.getItem(this.saveKey);
            if (!savedData) {
                console.log('📂 未找到保存数据，使用默认设置');
                return;
            }

            const data = JSON.parse(savedData);
            console.log('📂 加载游戏数据...');

            // 加载各系统数据
            if (data.timeManager) {
                this.timeManager.deserialize(data.timeManager);
            }
            if (data.resources) {
                this.resourceSystem.deserialize(data.resources);
            }
            if (data.achievements) {
                this.achievementSystem.deserialize(data.achievements);
            }
            if (data.events) {
                this.eventSystem.deserialize(data.events);
            }
            if (data.progression) {
                this.progressionSystem.deserialize(data.progression);
            }
            if (data.facilities) {
                this.facilityManager.deserialize(data.facilities);
            }
            if (data.statistics) {
                this.statisticsSystem.deserialize(data.statistics);
            }
            if (data.leaderboard) {
                this.leaderboardSystem.deserialize(data.leaderboard);
            }

            // 恢复游戏统计
            if (data.gameStats && data.gameStats.complaintStats) {
                // 过滤掉无效的条目
                const validEntries = data.gameStats.complaintStats.filter(
                    entry => entry && entry[0] != null && entry[1] != null
                );
                this.game.complaintStats = new Map(validEntries);
            }

            console.log('✅ 游戏数据加载完成');
        } catch (error) {
            console.error('❌ 加载游戏数据失败:', error);
            console.log('🔄 清除损坏的保存数据...');
            try {
                localStorage.removeItem(this.saveKey);
                console.log('✅ 损坏数据已清除，将使用默认设置');
            } catch (e) {
                console.error('❌ 无法清除损坏数据:', e);
            }
        }
    }

    // 设置自动保存
    setupAutoSave() {
        // 每30秒自动保存一次
        this.autoSaveInterval = setInterval(() => {
            this.save();
        }, 30000);

        // 页面关闭时保存
        window.addEventListener('beforeunload', () => {
            this.save();
        });
    }

    // 清理资源
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // 清理时间管理器
        if (this.timeManager) {
            this.timeManager.destroy();
        }
        
        // 最后保存一次
        this.save();
        
        console.log('🧹 GameManager 已清理');
    }

    // 获取游戏状态摘要
    getGameSummary() {
        if (!this.initialized) return null;

        return {
            timeManager: this.timeManager.getTimeStatus(),
            resources: this.resourceSystem.getResourceSummary(),
            achievements: this.achievementSystem.getAchievementSummary(),
            events: this.eventSystem.getEventSummary(),
            progression: this.progressionSystem.getProgressSummary()
        };
    }
}

// 资源管理系统
class ResourceSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.game = gameManager.game;
        
        // 资源数据
        this.resources = {
            money: 50000,           // 资金
            reputation: 50,         // 声望 (0-100)
            satisfaction: 50,       // 员工满意度 (0-100)
            productivity: 50        // 生产力指数 (0-100)
        };

        // 收入和支出
        this.income = 1000;         // 每日收入
        this.expenses = 500;        // 每日支出
        
        // 更新计时器
        this.updateTimer = 0;
        this.updateInterval = 60;   // 每60帧更新一次 (约1秒)
        
        // 时间管理器集成标志
        this.timeManagerIntegrated = false;
        this.lastRecordedIncome = null;
    }

    // 添加资源
    addResource(type, amount) {
        if (!this.resources.hasOwnProperty(type)) {
            console.warn(`未知资源类型: ${type}`);
            return false;
        }

        const oldValue = this.resources[type];
        
        if (type === 'money') {
            this.resources[type] += amount;
        } else {
            // 其他资源有上下限 (0-100)
            this.resources[type] = Math.max(0, Math.min(100, this.resources[type] + amount));
        }

        console.log(`💰 ${type} 变化: ${oldValue} → ${this.resources[type]} (${amount > 0 ? '+' : ''}${amount})`);
        return true;
    }

    // 消耗资源
    spendResource(type, amount) {
        if (!this.resources.hasOwnProperty(type)) {
            console.warn(`未知资源类型: ${type}`);
            return false;
        }

        if (!this.canAfford(type, amount)) {
            console.warn(`资源不足: ${type} 需要 ${amount}, 当前 ${this.resources[type]}`);
            return false;
        }

        return this.addResource(type, -amount);
    }

    // 获取资源数量
    getResource(type) {
        return this.resources[type] || 0;
    }

    // 检查是否能承担成本
    canAfford(type, amount) {
        if (typeof amount === 'object') {
            // 多种资源成本
            for (const [resourceType, cost] of Object.entries(amount)) {
                if (this.getResource(resourceType) < cost) {
                    return false;
                }
            }
            return true;
        } else {
            // 单一资源成本
            return this.getResource(type) >= amount;
        }
    }

    // 计算收入
    calculateIncome() {
        // 基础收入
        let totalIncome = this.income;

        // 根据员工数量调整收入
        const employeeCount = this.game.employees.length;
        totalIncome += employeeCount * 50;

        // 根据生产力调整收入
        const productivityBonus = (this.resources.productivity / 100) * 500;
        totalIncome += productivityBonus;

        // 根据声望调整收入
        const reputationBonus = (this.resources.reputation / 100) * 300;
        totalIncome += reputationBonus;

        return Math.floor(totalIncome);
    }

    // 处理工资支出
    processPayroll() {
        const employeeCount = this.game.employees.length;
        const payrollCost = employeeCount * 100; // 每个员工100元工资
        
        return this.spendResource('money', payrollCost);
    }

    // 更新财务状况
    updateFinancials() {
        const income = this.calculateIncome();
        const totalExpenses = this.expenses;

        // 添加收入
        this.addResource('money', income);

        // 扣除支出
        this.spendResource('money', totalExpenses);

        // 处理工资
        this.processPayroll();

        // 根据抱怨情况调整满意度
        this.updateSatisfactionFromComplaints();

        console.log(`📊 财务更新 - 收入: ${income}, 支出: ${totalExpenses}`);
    }

    // 根据抱怨情况更新满意度
    updateSatisfactionFromComplaints() {
        const totalComplaints = Array.from(this.game.complaintStats.values())
            .reduce((sum, count) => sum + count, 0);

        if (totalComplaints > 0) {
            // 每个抱怨降低0.1满意度
            const satisfactionLoss = Math.min(totalComplaints * 0.1, 5); // 最多降低5点
            this.addResource('satisfaction', -satisfactionLoss);
        } else {
            // 没有抱怨时缓慢恢复满意度
            this.addResource('satisfaction', 0.5);
        }

        // 满意度影响生产力
        const satisfactionLevel = this.resources.satisfaction;
        let productivityChange = 0;

        if (satisfactionLevel > 70) {
            productivityChange = 0.3; // 高满意度提升生产力
        } else if (satisfactionLevel < 30) {
            productivityChange = -0.5; // 低满意度降低生产力
        }

        if (productivityChange !== 0) {
            this.addResource('productivity', productivityChange);
        }

        // 生产力和满意度影响声望
        const avgPerformance = (this.resources.productivity + this.resources.satisfaction) / 2;
        if (avgPerformance > 60) {
            this.addResource('reputation', 0.1);
        } else if (avgPerformance < 40) {
            this.addResource('reputation', -0.2);
        }
    }

    // 系统更新
    update(deltaTime) {
        // 时间管理器集成：使用TimeManager的调度系统
        const timeManager = this.gameManager.getTimeManager();
        
        // 如果TimeManager可用，使用它来管理定期更新
        if (timeManager && !this.timeManagerIntegrated) {
            this.integrateWithTimeManager(timeManager);
        }
        
        // 保留原有的计时器作为备用机制
        this.updateTimer++;
        
        if (this.updateTimer >= this.updateInterval) {
            this.updateFinancials();
            this.updateTimer = 0;
        }
    }

    // 与时间管理器集成
    integrateWithTimeManager(timeManager) {
        if (this.timeManagerIntegrated) return;
        
        // 添加定期财务更新任务
        timeManager.addRecurringTask(
            'resource_financial_update',
            1.0, // 每秒更新一次
            () => {
                this.updateFinancials();
            },
            '资源系统财务更新'
        );
        
        // 添加每日收入事件监听器
        timeManager.addEventListener('minute_passed', (data) => {
            // 每游戏内分钟检查一次收入变化
            this.checkIncomeChanges(data.minutes);
        }, '资源系统收入检查');
        
        // 添加每小时的深度分析
        timeManager.addEventListener('hour_passed', (data) => {
            this.performHourlyAnalysis(data.hours);
        }, '资源系统小时分析');
        
        this.timeManagerIntegrated = true;
        console.log('💰 ResourceSystem 已与 TimeManager 集成');
    }

    // 检查收入变化
    checkIncomeChanges(minutes) {
        // 每5分钟检查一次收入趋势
        if (minutes % 5 === 0) {
            const currentIncome = this.calculateIncome();
            const incomeChange = currentIncome - (this.lastRecordedIncome || currentIncome);
            
            if (Math.abs(incomeChange) > 100) {
                console.log(`📊 收入变化检测: ${incomeChange > 0 ? '+' : ''}${incomeChange}`);
                
                // 触发收入变化事件
                if (this.gameManager.getEventSystem()) {
                    this.gameManager.getEventSystem().triggerIncomeChangeEvent(incomeChange);
                }
            }
            
            this.lastRecordedIncome = currentIncome;
        }
    }

    // 执行每小时分析
    performHourlyAnalysis(hours) {
        console.log(`📈 执行第${hours}小时资源分析`);
        
        // 分析资源趋势
        const resourceTrends = this.analyzeResourceTrends();
        
        // 如果发现异常趋势，触发相应事件
        if (resourceTrends.hasAnomalies) {
            console.log('⚠️ 检测到资源异常趋势:', resourceTrends.anomalies);
        }
        
        // 更新统计系统
        if (this.gameManager.getStatisticsSystem()) {
            this.gameManager.getStatisticsSystem().recordHourlyResourceData({
                hour: hours,
                resources: { ...this.resources },
                income: this.calculateIncome(),
                expenses: this.expenses,
                trends: resourceTrends
            });
        }
    }

    // 分析资源趋势
    analyzeResourceTrends() {
        const trends = {
            hasAnomalies: false,
            anomalies: []
        };
        
        // 检查资源是否处于危险水平
        if (this.resources.money < 10000) {
            trends.hasAnomalies = true;
            trends.anomalies.push('资金不足');
        }
        
        if (this.resources.satisfaction < 30) {
            trends.hasAnomalies = true;
            trends.anomalies.push('员工满意度过低');
        }
        
        if (this.resources.productivity < 40) {
            trends.hasAnomalies = true;
            trends.anomalies.push('生产力下降');
        }
        
        return trends;
    }

    // 获取资源摘要
    getResourceSummary() {
        return {
            ...this.resources,
            income: this.calculateIncome(),
            expenses: this.expenses
        };
    }

    // 序列化数据
    serialize() {
        return {
            resources: { ...this.resources },
            income: this.income,
            expenses: this.expenses
        };
    }

    // 反序列化数据
    deserialize(data) {
        if (data.resources) {
            this.resources = { ...this.resources, ...data.resources };
        }
        if (data.income !== undefined) {
            this.income = data.income;
        }
        if (data.expenses !== undefined) {
            this.expenses = data.expenses;
        }
    }
}

// 成就系统
class AchievementSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.game = gameManager.game;
        
        this.achievements = new Map();
        this.unlockedAchievements = new Set();
        
        // 时间管理器集成标志
        this.timeManagerIntegrated = false;
        
        // 初始化基础成就
        this.initializeAchievements();
    }

    // 初始化成就
    initializeAchievements() {
        const achievements = [
            // 员工数量相关成就
            {
                id: 'first_employee',
                name: '第一位员工',
                description: '雇佣第一位员工',
                condition: () => this.game.employees.length >= 1,
                reward: { money: 1000, reputation: 5 },
                category: 'milestone',
                icon: '👤'
            },
            {
                id: 'small_team',
                name: '小团队',
                description: '拥有5名员工',
                condition: () => this.game.employees.length >= 5,
                reward: { money: 2500, reputation: 5 },
                category: 'milestone',
                icon: '👥'
            },
            {
                id: 'team_builder',
                name: '团队建设者',
                description: '拥有10名员工',
                condition: () => this.game.employees.length >= 10,
                reward: { money: 5000, reputation: 10 },
                category: 'milestone',
                icon: '👨‍👩‍👧‍👦'
            },
            {
                id: 'big_company',
                name: '大公司',
                description: '拥有20名员工',
                condition: () => this.game.employees.length >= 20,
                reward: { money: 15000, reputation: 20 },
                category: 'milestone',
                icon: '🏢'
            },

            // 时间管理相关成就
            {
                id: 'time_keeper',
                name: '时间管理者',
                description: '游戏运行超过5分钟',
                condition: () => this.game.gameTime >= 300,
                reward: { satisfaction: 10, productivity: 5 },
                category: 'time_management',
                icon: '⏰'
            },
            {
                id: 'dedicated_manager',
                name: '专注管理者',
                description: '游戏运行超过15分钟',
                condition: () => this.game.gameTime >= 900,
                reward: { money: 5000, satisfaction: 15 },
                category: 'time_management',
                icon: '⏳'
            },
            {
                id: 'marathon_manager',
                name: '马拉松管理者',
                description: '游戏运行超过30分钟',
                condition: () => this.game.gameTime >= 1800,
                reward: { money: 20000, reputation: 25, productivity: 20 },
                category: 'time_management',
                icon: '🏃‍♂️'
            },

            // 管理效率相关成就
            {
                id: 'complaint_free',
                name: '零抱怨办公室',
                description: '当前没有员工抱怨',
                condition: () => this.checkComplaintFreeTime(),
                reward: { satisfaction: 20, reputation: 15 },
                category: 'management',
                icon: '😊'
            },
            {
                id: 'high_satisfaction',
                name: '员工满意',
                description: '员工满意度达到90%',
                condition: () => this.gameManager.getResourceSystem().getResource('satisfaction') >= 90,
                reward: { money: 10000, productivity: 10 },
                category: 'management',
                icon: '😄'
            },
            {
                id: 'productivity_master',
                name: '生产力大师',
                description: '生产力指数达到95%',
                condition: () => this.gameManager.getResourceSystem().getResource('productivity') >= 95,
                reward: { money: 15000, reputation: 20 },
                category: 'management',
                icon: '📈'
            },

            // 财务相关成就
            {
                id: 'first_profit',
                name: '初次盈利',
                description: '拥有60,000元资金',
                condition: () => this.gameManager.getResourceSystem().getResource('money') >= 60000,
                reward: { reputation: 10 },
                category: 'financial',
                icon: '💰'
            },
            {
                id: 'wealthy_boss',
                name: '富有的老板',
                description: '拥有100,000元资金',
                condition: () => this.gameManager.getResourceSystem().getResource('money') >= 100000,
                reward: { reputation: 25 },
                category: 'financial',
                icon: '💎'
            },
            {
                id: 'millionaire',
                name: '百万富翁',
                description: '拥有1,000,000元资金',
                condition: () => this.gameManager.getResourceSystem().getResource('money') >= 1000000,
                reward: { reputation: 50, satisfaction: 30 },
                category: 'financial',
                icon: '🏆'
            },

            // 声望相关成就
            {
                id: 'respected_company',
                name: '受尊敬的公司',
                description: '声望达到75',
                condition: () => this.gameManager.getResourceSystem().getResource('reputation') >= 75,
                reward: { money: 8000, satisfaction: 15 },
                category: 'reputation',
                icon: '⭐'
            },
            {
                id: 'industry_leader',
                name: '行业领导者',
                description: '声望达到95',
                condition: () => this.gameManager.getResourceSystem().getResource('reputation') >= 95,
                reward: { money: 25000, productivity: 25 },
                category: 'reputation',
                icon: '👑'
            },

            // 插件使用相关成就
            {
                id: 'plugin_user',
                name: '插件使用者',
                description: '激活第一个插件',
                condition: () => this.checkActivePlugins() >= 1,
                reward: { satisfaction: 10, reputation: 5 },
                category: 'plugin',
                icon: '🔌'
            },
            {
                id: 'plugin_master',
                name: '插件大师',
                description: '同时激活3个插件',
                condition: () => this.checkActivePlugins() >= 3,
                reward: { money: 10000, satisfaction: 20, reputation: 15 },
                category: 'plugin',
                icon: '⚡'
            },

            // 特殊成就
            {
                id: 'problem_solver',
                name: '问题解决者',
                description: '累计解决100个员工抱怨',
                condition: () => this.getTotalComplaintsResolved() >= 100,
                reward: { money: 15000, satisfaction: 25, reputation: 20 },
                category: 'special',
                icon: '🛠️'
            },
            {
                id: 'efficiency_expert',
                name: '效率专家',
                description: '同时达到满意度80%、生产力80%、声望80%',
                condition: () => {
                    const resources = this.gameManager.getResourceSystem();
                    return resources.getResource('satisfaction') >= 80 &&
                           resources.getResource('productivity') >= 80 &&
                           resources.getResource('reputation') >= 80;
                },
                reward: { money: 30000, satisfaction: 10, productivity: 10, reputation: 10 },
                category: 'special',
                icon: '🎯'
            }
        ];

        achievements.forEach(achievement => {
            this.registerAchievement(achievement);
        });
    }

    // 注册成就
    registerAchievement(achievement) {
        const fullAchievement = {
            ...achievement,
            unlocked: false,
            progress: 0,
            maxProgress: 100,
            unlockedAt: null
        };

        this.achievements.set(achievement.id, fullAchievement);
    }

    // 检查成就条件
    checkAchievements() {
        for (const [id, achievement] of this.achievements) {
            if (!achievement.unlocked && achievement.condition()) {
                this.unlockAchievement(id);
            }
        }
    }

    // 解锁成就
    unlockAchievement(id) {
        const achievement = this.achievements.get(id);
        if (!achievement || achievement.unlocked) {
            return false;
        }

        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        this.unlockedAchievements.add(id);

        // 发放奖励
        this.grantReward(achievement.reward);

        console.log(`🏆 成就解锁: ${achievement.name} - ${achievement.description}`);
        
        // 触发UI通知
        this.notifyAchievementUnlocked(achievement);
        
        return true;
    }

    // 发放奖励
    grantReward(reward) {
        const resourceSystem = this.gameManager.getResourceSystem();
        
        console.log('🎁 发放成就奖励:', reward);
        
        for (const [type, amount] of Object.entries(reward)) {
            resourceSystem.addResource(type, amount);
            console.log(`  +${amount} ${type}`);
        }
    }

    // 获取成就奖励总计
    getTotalRewardsEarned() {
        const totalRewards = {
            money: 0,
            reputation: 0,
            satisfaction: 0,
            productivity: 0
        };

        for (const achievement of this.achievements.values()) {
            if (achievement.unlocked && achievement.reward) {
                for (const [type, amount] of Object.entries(achievement.reward)) {
                    if (totalRewards.hasOwnProperty(type)) {
                        totalRewards[type] += amount;
                    }
                }
            }
        }

        return totalRewards;
    }

    // 获取成就进度
    getProgress(id) {
        const achievement = this.achievements.get(id);
        return achievement ? achievement.progress : 0;
    }

    // 更新成就进度
    updateProgress(id, currentValue, maxValue) {
        const achievement = this.achievements.get(id);
        if (!achievement || achievement.unlocked) return;

        const progress = Math.min(100, Math.floor((currentValue / maxValue) * 100));
        achievement.progress = progress;
        achievement.maxProgress = 100;
    }

    // 获取所有成就（包括进度）
    getAllAchievements() {
        return Array.from(this.achievements.values()).map(achievement => ({
            ...achievement,
            progress: this.calculateAchievementProgress(achievement)
        }));
    }

    // 计算成就进度
    calculateAchievementProgress(achievement) {
        if (achievement.unlocked) return 100;

        // 根据成就类型计算进度
        switch (achievement.id) {
            case 'small_team':
                return Math.min(100, (this.game.employees.length / 5) * 100);
            case 'team_builder':
                return Math.min(100, (this.game.employees.length / 10) * 100);
            case 'big_company':
                return Math.min(100, (this.game.employees.length / 20) * 100);
            case 'time_keeper':
                return Math.min(100, (this.game.gameTime / 300) * 100);
            case 'dedicated_manager':
                return Math.min(100, (this.game.gameTime / 900) * 100);
            case 'marathon_manager':
                return Math.min(100, (this.game.gameTime / 1800) * 100);
            case 'first_profit':
                return Math.min(100, (this.gameManager.getResourceSystem().getResource('money') / 60000) * 100);
            case 'wealthy_boss':
                return Math.min(100, (this.gameManager.getResourceSystem().getResource('money') / 100000) * 100);
            case 'millionaire':
                return Math.min(100, (this.gameManager.getResourceSystem().getResource('money') / 1000000) * 100);
            case 'high_satisfaction':
                return Math.min(100, (this.gameManager.getResourceSystem().getResource('satisfaction') / 90) * 100);
            case 'productivity_master':
                return Math.min(100, (this.gameManager.getResourceSystem().getResource('productivity') / 95) * 100);
            case 'respected_company':
                return Math.min(100, (this.gameManager.getResourceSystem().getResource('reputation') / 75) * 100);
            case 'industry_leader':
                return Math.min(100, (this.gameManager.getResourceSystem().getResource('reputation') / 95) * 100);
            case 'plugin_master':
                return Math.min(100, (this.checkActivePlugins() / 3) * 100);
            case 'problem_solver':
                return Math.min(100, (this.getTotalComplaintsResolved() / 100) * 100);
            default:
                return achievement.condition() ? 100 : 0;
        }
    }

    // 获取已解锁成就
    getUnlockedAchievements() {
        return Array.from(this.unlockedAchievements)
            .map(id => this.achievements.get(id))
            .filter(Boolean);
    }

    // 检查无抱怨时间
    checkComplaintFreeTime() {
        const currentComplaints = this.game.employees.filter(emp => emp.complaint).length;
        return currentComplaints === 0; // 简化版本，实际应该跟踪时间
    }

    // 检查激活的插件数量
    checkActivePlugins() {
        if (!this.game.plugins) return 0;
        let activeCount = 0;
        for (const plugin of this.game.plugins.values()) {
            if (plugin.isActive) {
                activeCount++;
            }
        }
        return activeCount;
    }

    // 获取累计解决的抱怨数量
    getTotalComplaintsResolved() {
        if (!this.game.complaintStats) return 0;
        let total = 0;
        for (const count of this.game.complaintStats.values()) {
            total += count;
        }
        return total;
    }

    // 通知成就解锁
    notifyAchievementUnlocked(achievement) {
        // 显示成就解锁动画
        if (typeof window !== 'undefined' && window.showAchievementUnlockAnimation) {
            window.showAchievementUnlockAnimation(achievement);
        }
        
        // 同时显示简单通知
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(`🏆 成就解锁: ${achievement.name}`, 'achievement');
        }
    }

    // 系统更新
    update(deltaTime) {
        // 时间管理器集成：使用TimeManager的调度系统
        const timeManager = this.gameManager.getTimeManager();
        
        // 如果TimeManager可用，使用它来管理成就检查
        if (timeManager && !this.timeManagerIntegrated) {
            this.integrateWithTimeManager(timeManager);
        }
        
        // 保留原有的成就检查逻辑作为备用
        if (Math.floor(this.game.gameTime) % 60 === 0) {
            this.checkAchievements();
        }
    }

    // 与时间管理器集成
    integrateWithTimeManager(timeManager) {
        if (this.timeManagerIntegrated) return;
        
        // 添加定期成就检查任务
        timeManager.addRecurringTask(
            'achievement_check',
            5.0, // 每5秒检查一次成就
            () => {
                this.checkAchievements();
            },
            '成就系统检查'
        );
        
        // 添加时间相关成就的特殊检查
        timeManager.addRecurringTask(
            'time_achievement_check',
            60.0, // 每分钟检查一次时间相关成就
            () => {
                this.checkTimeBasedAchievements();
            },
            '时间相关成就检查'
        );
        
        // 监听时间事件来触发特定成就
        timeManager.addEventListener('minute_passed', (data) => {
            this.handleTimeBasedProgress(data.minutes);
        }, '成就系统时间进度');
        
        timeManager.addEventListener('hour_passed', (data) => {
            this.handleHourlyAchievements(data.hours);
        }, '成就系统小时成就');
        
        // 监听时间缩放变化来调整成就难度
        timeManager.addEventListener('time_scale_changed', (data) => {
            this.adjustAchievementDifficulty(data.newScale);
        }, '成就系统难度调整');
        
        this.timeManagerIntegrated = true;
        console.log('🏆 AchievementSystem 已与 TimeManager 集成');
    }

    // 检查时间相关成就
    checkTimeBasedAchievements() {
        const gameTime = this.game.gameTime;
        
        // 检查时间管理相关成就
        const timeAchievements = ['time_keeper', 'dedicated_manager', 'marathon_manager'];
        timeAchievements.forEach(achievementId => {
            const achievement = this.achievements.get(achievementId);
            if (achievement && !achievement.unlocked && achievement.condition()) {
                this.unlockAchievement(achievementId);
            }
        });
    }

    // 处理基于时间的进度更新
    handleTimeBasedProgress(minutes) {
        // 每10分钟更新一次时间相关成就的进度
        if (minutes % 10 === 0) {
            this.updateTimeAchievementProgress();
        }
        
        // 检查是否达到特殊时间里程碑
        this.checkTimeMilestones(minutes);
    }

    // 处理每小时成就检查
    handleHourlyAchievements(hours) {
        console.log(`🏆 检查第${hours}小时的成就`);
        
        // 检查长时间游戏成就
        if (hours >= 1 && !this.achievements.get('time_keeper')?.unlocked) {
            this.checkAchievements();
        }
        
        // 记录游戏时长统计
        this.recordPlayTimeStats(hours);
    }

    // 调整成就难度（基于时间缩放）
    adjustAchievementDifficulty(timeScale) {
        // 如果时间加速，某些成就可能需要调整难度
        if (timeScale > 2.0) {
            console.log('⚡ 时间加速模式：调整成就难度');
            // 可以在这里实现成就难度的动态调整
        } else if (timeScale < 0.5) {
            console.log('🐌 时间减速模式：放宽成就条件');
            // 可以在这里实现成就条件的放宽
        }
    }

    // 更新时间成就进度
    updateTimeAchievementProgress() {
        const gameTime = this.game.gameTime;
        
        // 更新各个时间成就的进度显示
        const timeAchievements = [
            { id: 'time_keeper', target: 300 },
            { id: 'dedicated_manager', target: 900 },
            { id: 'marathon_manager', target: 1800 }
        ];
        
        timeAchievements.forEach(({ id, target }) => {
            const achievement = this.achievements.get(id);
            if (achievement && !achievement.unlocked) {
                const progress = Math.min(100, (gameTime / target) * 100);
                achievement.progress = progress;
                
                if (progress >= 100) {
                    this.unlockAchievement(id);
                }
            }
        });
    }

    // 检查时间里程碑
    checkTimeMilestones(minutes) {
        const milestones = [5, 15, 30, 60, 120]; // 分钟里程碑
        
        milestones.forEach(milestone => {
            if (minutes === milestone) {
                console.log(`🎯 达到时间里程碑: ${milestone} 分钟`);
                
                // 触发里程碑事件
                if (this.gameManager.getEventSystem()) {
                    this.gameManager.getEventSystem().scheduleEvent('time_milestone', 0);
                }
            }
        });
    }

    // 记录游戏时长统计
    recordPlayTimeStats(hours) {
        if (this.gameManager.getStatisticsSystem()) {
            this.gameManager.getStatisticsSystem().recordPlayTimeData({
                hours: hours,
                totalAchievements: this.achievements.size,
                unlockedAchievements: this.unlockedAchievements.size,
                completionRate: (this.unlockedAchievements.size / this.achievements.size) * 100
            });
        }
    }

    // 获取成就摘要
    getAchievementSummary() {
        const unlockedAchievements = this.getUnlockedAchievements();
        const totalRewards = this.getTotalRewardsEarned();
        
        // 按类别统计成就
        const categoryStats = {};
        for (const achievement of this.achievements.values()) {
            const category = achievement.category;
            if (!categoryStats[category]) {
                categoryStats[category] = { total: 0, unlocked: 0 };
            }
            categoryStats[category].total++;
            if (achievement.unlocked) {
                categoryStats[category].unlocked++;
            }
        }

        return {
            total: this.achievements.size,
            unlocked: this.unlockedAchievements.size,
            completionRate: Math.round((this.unlockedAchievements.size / this.achievements.size) * 100),
            recent: unlockedAchievements.slice(-3), // 最近3个成就
            categoryStats,
            totalRewards,
            nextAchievements: this.getNextAchievements(3) // 接下来可能解锁的3个成就
        };
    }

    // 获取接下来可能解锁的成就
    getNextAchievements(count = 3) {
        const nextAchievements = [];
        
        for (const achievement of this.achievements.values()) {
            if (!achievement.unlocked) {
                const progress = this.calculateAchievementProgress(achievement);
                nextAchievements.push({
                    ...achievement,
                    progress
                });
            }
        }

        // 按进度排序，优先显示接近完成的成就
        return nextAchievements
            .sort((a, b) => b.progress - a.progress)
            .slice(0, count);
    }

    // 序列化数据
    serialize() {
        return {
            unlockedAchievements: Array.from(this.unlockedAchievements),
            achievements: Array.from(this.achievements.entries()).map(([id, achievement]) => ({
                id,
                unlocked: achievement.unlocked,
                progress: achievement.progress,
                unlockedAt: achievement.unlockedAt
            }))
        };
    }

    // 反序列化数据
    deserialize(data) {
        if (data.unlockedAchievements) {
            this.unlockedAchievements = new Set(data.unlockedAchievements);
        }
        
        if (data.achievements) {
            data.achievements.forEach(savedAchievement => {
                const achievement = this.achievements.get(savedAchievement.id);
                if (achievement) {
                    achievement.unlocked = savedAchievement.unlocked;
                    achievement.progress = savedAchievement.progress;
                    achievement.unlockedAt = savedAchievement.unlockedAt;
                }
            });
        }
    }
}

// 事件系统
class EventSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.game = gameManager.game;
        
        this.events = new Map();
        this.activeEvents = new Map();
        this.eventQueue = [];
        this.eventTimer = 0;
        this.eventInterval = 1800; // 30秒触发一次事件检查
        
        // 时间管理器集成标志
        this.timeManagerIntegrated = false;
        
        // 初始化基础事件
        this.initializeEvents();
    }

    // 初始化事件库
    initializeEvents() {
        const events = [
            // 设备故障类事件
            {
                id: 'equipment_failure',
                name: '设备故障',
                description: '办公室的打印机突然故障了！',
                type: 'random',
                probability: 0.3,
                choices: [
                    {
                        text: '立即维修',
                        cost: { money: 2000 },
                        consequences: { satisfaction: 5, reputation: 2 }
                    },
                    {
                        text: '暂时忽略',
                        cost: {},
                        consequences: { satisfaction: -10, productivity: -5 }
                    }
                ],
                duration: 0
            },
            {
                id: 'air_conditioning_breakdown',
                name: '空调故障',
                description: '办公室空调系统出现故障，员工们开始抱怨温度问题。',
                type: 'random',
                probability: 0.25,
                choices: [
                    {
                        text: '紧急维修',
                        cost: { money: 3000 },
                        consequences: { satisfaction: 10, productivity: 5 }
                    },
                    {
                        text: '购买临时风扇',
                        cost: { money: 800 },
                        consequences: { satisfaction: 3, productivity: -2 }
                    },
                    {
                        text: '忍受高温',
                        cost: {},
                        consequences: { satisfaction: -15, productivity: -8 }
                    }
                ],
                duration: 0
            },
            {
                id: 'network_outage',
                name: '网络中断',
                description: '办公室网络突然中断，影响了所有员工的工作。',
                type: 'emergency',
                probability: 0.2,
                choices: [
                    {
                        text: '联系网络服务商',
                        cost: { money: 1500 },
                        consequences: { productivity: 5, satisfaction: 5 }
                    },
                    {
                        text: '使用移动热点',
                        cost: { money: 500 },
                        consequences: { productivity: -5, satisfaction: 2 }
                    }
                ],
                duration: 0
            },

            // 员工相关事件
            {
                id: 'employee_conflict',
                name: '员工冲突',
                description: '两名员工因为工作分歧发生了争执。',
                type: 'random',
                probability: 0.2,
                choices: [
                    {
                        text: '组织调解会议',
                        cost: { money: 500 },
                        consequences: { satisfaction: 10, reputation: 3 }
                    },
                    {
                        text: '让他们自己解决',
                        cost: {},
                        consequences: { satisfaction: -5, productivity: -3 }
                    }
                ],
                duration: 0
            },
            {
                id: 'employee_resignation',
                name: '员工离职',
                description: '一名优秀员工提出离职申请，原因是工作压力过大。',
                type: 'emergency',
                probability: 0.15,
                choices: [
                    {
                        text: '挽留并加薪',
                        cost: { money: 5000 },
                        consequences: { satisfaction: 15, productivity: 10, reputation: 5 }
                    },
                    {
                        text: '改善工作环境',
                        cost: { money: 2000 },
                        consequences: { satisfaction: 8, productivity: 5 }
                    },
                    {
                        text: '接受离职',
                        cost: {},
                        consequences: { satisfaction: -10, productivity: -15, reputation: -5 }
                    }
                ],
                duration: 0
            },
            {
                id: 'new_hire_orientation',
                name: '新员工入职',
                description: '有新员工加入团队，需要安排入职培训。',
                type: 'scheduled',
                probability: 0.3,
                choices: [
                    {
                        text: '专业培训计划',
                        cost: { money: 1500 },
                        consequences: { productivity: 15, satisfaction: 10, reputation: 5 }
                    },
                    {
                        text: '简单介绍',
                        cost: { money: 200 },
                        consequences: { productivity: 5, satisfaction: 2 }
                    }
                ],
                duration: 0
            },

            // 检查和合规事件
            {
                id: 'surprise_inspection',
                name: '突击检查',
                description: '劳动部门进行突击检查！',
                type: 'emergency',
                probability: 0.1,
                choices: [
                    {
                        text: '积极配合检查',
                        cost: { money: 1000 },
                        consequences: { reputation: 15, satisfaction: 5 }
                    },
                    {
                        text: '敷衍应对',
                        cost: {},
                        consequences: { reputation: -10, satisfaction: -5 }
                    }
                ],
                duration: 0
            },
            {
                id: 'safety_audit',
                name: '安全审计',
                description: '公司需要进行年度安全审计，确保工作环境符合标准。',
                type: 'scheduled',
                probability: 0.2,
                choices: [
                    {
                        text: '全面整改',
                        cost: { money: 4000 },
                        consequences: { reputation: 20, satisfaction: 15 }
                    },
                    {
                        text: '基础整改',
                        cost: { money: 1500 },
                        consequences: { reputation: 8, satisfaction: 5 }
                    },
                    {
                        text: '最低标准',
                        cost: { money: 500 },
                        consequences: { reputation: 2, satisfaction: -2 }
                    }
                ],
                duration: 0
            },

            // 商业机会事件
            {
                id: 'new_client',
                name: '新客户机会',
                description: '一个大客户想要与你们合作！',
                type: 'opportunity',
                probability: 0.15,
                choices: [
                    {
                        text: '接受合作',
                        cost: { productivity: 10 },
                        consequences: { money: 15000, reputation: 10 }
                    },
                    {
                        text: '婉拒合作',
                        cost: {},
                        consequences: { reputation: -2 }
                    }
                ],
                duration: 0
            },
            {
                id: 'competitor_poaching',
                name: '竞争对手挖角',
                description: '竞争对手试图挖走你的核心员工。',
                type: 'emergency',
                probability: 0.12,
                choices: [
                    {
                        text: '提高待遇留人',
                        cost: { money: 8000 },
                        consequences: { satisfaction: 20, productivity: 10, reputation: 5 }
                    },
                    {
                        text: '改善工作环境',
                        cost: { money: 3000 },
                        consequences: { satisfaction: 10, productivity: 5 }
                    },
                    {
                        text: '不采取行动',
                        cost: {},
                        consequences: { satisfaction: -15, productivity: -20, reputation: -10 }
                    }
                ],
                duration: 0
            },

            // 团队建设和福利事件
            {
                id: 'team_building',
                name: '团建活动机会',
                description: '有机会组织一次团建活动提升士气！',
                type: 'opportunity',
                probability: 0.25,
                choices: [
                    {
                        text: '组织团建活动',
                        cost: { money: 3000 },
                        consequences: { satisfaction: 20, productivity: 10 }
                    },
                    {
                        text: '取消活动',
                        cost: {},
                        consequences: { satisfaction: -5 }
                    }
                ],
                duration: 0
            },
            {
                id: 'wellness_program',
                name: '员工健康计划',
                description: '员工建议实施健康计划，包括健身房会员和健康检查。',
                type: 'opportunity',
                probability: 0.18,
                choices: [
                    {
                        text: '全面健康计划',
                        cost: { money: 6000 },
                        consequences: { satisfaction: 25, productivity: 15, reputation: 10 }
                    },
                    {
                        text: '基础健康福利',
                        cost: { money: 2000 },
                        consequences: { satisfaction: 10, productivity: 5 }
                    },
                    {
                        text: '暂不实施',
                        cost: {},
                        consequences: { satisfaction: -8 }
                    }
                ],
                duration: 0
            },

            // 紧急情况事件
            {
                id: 'office_flood',
                name: '办公室漏水',
                description: '楼上管道破裂，办公室出现漏水情况！',
                type: 'emergency',
                probability: 0.08,
                choices: [
                    {
                        text: '紧急维修',
                        cost: { money: 5000 },
                        consequences: { satisfaction: 5, productivity: -5 }
                    },
                    {
                        text: '临时搬迁',
                        cost: { money: 2000 },
                        consequences: { satisfaction: -10, productivity: -15 }
                    }
                ],
                duration: 0
            },
            {
                id: 'power_outage',
                name: '停电事故',
                description: '突然停电，所有电子设备无法使用。',
                type: 'emergency',
                probability: 0.1,
                choices: [
                    {
                        text: '启用备用电源',
                        cost: { money: 1000 },
                        consequences: { productivity: 5, satisfaction: 10 }
                    },
                    {
                        text: '提前下班',
                        cost: {},
                        consequences: { productivity: -20, satisfaction: 5 }
                    }
                ],
                duration: 0
            },

            // 特殊机会事件
            {
                id: 'media_interview',
                name: '媒体采访',
                description: '当地媒体想要采访你的公司管理经验。',
                type: 'special',
                probability: 0.05,
                choices: [
                    {
                        text: '接受采访',
                        cost: { money: 500 },
                        consequences: { reputation: 25, satisfaction: 10 }
                    },
                    {
                        text: '婉拒采访',
                        cost: {},
                        consequences: { reputation: -2 }
                    }
                ],
                duration: 0
            },
            {
                id: 'industry_award',
                name: '行业奖项提名',
                description: '你的公司被提名为"最佳雇主"奖项！',
                type: 'special',
                probability: 0.03,
                choices: [
                    {
                        text: '积极参与评选',
                        cost: { money: 2000 },
                        consequences: { reputation: 30, satisfaction: 20, productivity: 10 }
                    },
                    {
                        text: '低调处理',
                        cost: {},
                        consequences: { reputation: 5, satisfaction: 5 }
                    }
                ],
                duration: 0
            }
        ];

        events.forEach(event => {
            this.registerEvent(event);
        });
    }

    // 注册事件
    registerEvent(event) {
        this.events.set(event.id, {
            ...event,
            lastTriggered: 0
        });
    }

    // 触发随机事件
    triggerRandomEvent() {
        const availableEvents = Array.from(this.events.values())
            .filter(event => event.type === 'random' && Math.random() < event.probability);

        if (availableEvents.length === 0) {
            return null;
        }

        const selectedEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        return this.activateEvent(selectedEvent.id);
    }

    // 激活事件
    activateEvent(eventId) {
        const event = this.events.get(eventId);
        if (!event) {
            console.warn(`事件不存在: ${eventId}`);
            return null;
        }

        const activeEvent = {
            ...event,
            activatedAt: Date.now(),
            resolved: false
        };

        this.activeEvents.set(eventId, activeEvent);
        event.lastTriggered = Date.now();

        console.log(`🎲 事件触发: ${event.name}`);
        
        // 通知UI显示事件
        this.notifyEventActivated(activeEvent);
        
        return activeEvent;
    }

    // 处理事件选择
    processEvent(eventId, choiceIndex) {
        const activeEvent = this.activeEvents.get(eventId);
        if (!activeEvent || activeEvent.resolved) {
            console.warn(`无效的事件处理: ${eventId}`);
            return false;
        }

        const choice = activeEvent.choices[choiceIndex];
        if (!choice) {
            console.warn(`无效的选择索引: ${choiceIndex}`);
            return false;
        }

        const resourceSystem = this.gameManager.getResourceSystem();

        // 检查成本
        if (!resourceSystem.canAfford('money', choice.cost.money || 0)) {
            console.warn('资源不足，无法执行此选择');
            return false;
        }

        // 扣除成本
        for (const [type, amount] of Object.entries(choice.cost)) {
            resourceSystem.spendResource(type, amount);
        }

        // 应用后果
        for (const [type, amount] of Object.entries(choice.consequences)) {
            resourceSystem.addResource(type, amount);
        }

        // 标记事件已解决
        activeEvent.resolved = true;
        activeEvent.resolvedAt = Date.now();
        activeEvent.chosenOption = choiceIndex;

        console.log(`✅ 事件已处理: ${activeEvent.name} - 选择: ${choice.text}`);

        // 从活跃事件中移除
        setTimeout(() => {
            this.activeEvents.delete(eventId);
        }, 3000); // 3秒后清理

        return true;
    }

    // 调度事件
    scheduleEvent(eventId, delay) {
        this.eventQueue.push({
            eventId,
            triggerTime: Date.now() + delay
        });
    }

    // 取消事件
    cancelEvent(eventId) {
        this.activeEvents.delete(eventId);
        this.eventQueue = this.eventQueue.filter(item => item.eventId !== eventId);
    }

    // 通知事件激活
    notifyEventActivated(event) {
        // 这里可以添加UI通知逻辑
        if (typeof window !== 'undefined' && window.showEventDialog) {
            window.showEventDialog(event);
        }
    }

    // 系统更新
    update(deltaTime) {
        // 时间管理器集成：使用TimeManager的调度系统
        const timeManager = this.gameManager.getTimeManager();
        
        // 如果TimeManager可用，使用它来管理事件调度
        if (timeManager && !this.timeManagerIntegrated) {
            this.integrateWithTimeManager(timeManager);
        }
        
        // 保留原有的事件处理逻辑作为备用
        this.eventTimer++;

        // 处理调度的事件
        const currentTime = Date.now();
        this.eventQueue = this.eventQueue.filter(item => {
            if (currentTime >= item.triggerTime) {
                this.activateEvent(item.eventId);
                return false; // 移除已触发的事件
            }
            return true;
        });

        // 定期触发随机事件
        if (this.eventTimer >= this.eventInterval) {
            if (this.activeEvents.size < 2) { // 最多同时2个活跃事件
                this.triggerRandomEvent();
            }
            this.eventTimer = 0;
        }
    }

    // 与时间管理器集成
    integrateWithTimeManager(timeManager) {
        if (this.timeManagerIntegrated) return;
        
        // 添加定期随机事件触发任务
        timeManager.addRecurringTask(
            'event_random_trigger',
            30.0, // 每30秒检查一次随机事件
            () => {
                if (this.activeEvents.size < 2) {
                    this.triggerRandomEvent();
                }
            },
            '随机事件触发检查'
        );
        
        // 添加紧急事件调度任务
        timeManager.addRecurringTask(
            'event_emergency_check',
            60.0, // 每分钟检查一次紧急事件
            () => {
                this.checkEmergencyEvents();
            },
            '紧急事件检查'
        );
        
        // 监听时间事件来触发特定的游戏事件
        timeManager.addEventListener('hour_passed', (data) => {
            this.handleHourlyEvents(data.hours);
        }, '事件系统小时事件');
        
        // 监听暂停/恢复事件来管理活跃事件
        timeManager.addEventListener('time_paused', () => {
            this.pauseActiveEvents();
        }, '事件系统暂停处理');
        
        timeManager.addEventListener('time_resumed', () => {
            this.resumeActiveEvents();
        }, '事件系统恢复处理');
        
        this.timeManagerIntegrated = true;
        console.log('🎲 EventSystem 已与 TimeManager 集成');
    }

    // 检查紧急事件
    checkEmergencyEvents() {
        const resourceSystem = this.gameManager.getResourceSystem();
        if (!resourceSystem) return;
        
        // 检查资源状况，触发相应的紧急事件
        const resources = resourceSystem.getResourceSummary();
        
        if (resources.money < 5000 && !this.hasActiveEvent('financial_crisis')) {
            this.scheduleEvent('financial_crisis', 0);
        }
        
        if (resources.satisfaction < 20 && !this.hasActiveEvent('employee_revolt')) {
            this.scheduleEvent('employee_revolt', 0);
        }
        
        if (resources.productivity < 30 && !this.hasActiveEvent('productivity_crisis')) {
            this.scheduleEvent('productivity_crisis', 0);
        }
    }

    // 处理每小时事件
    handleHourlyEvents(hours) {
        console.log(`🕐 处理第${hours}小时的定时事件`);
        
        // 根据小时数触发不同的事件
        if (hours % 8 === 0) { // 每8小时触发工作日事件
            this.triggerWorkdayEvent();
        }
        
        if (hours % 24 === 0) { // 每24小时触发每日事件
            this.triggerDailyEvent();
        }
    }

    // 触发工作日事件
    triggerWorkdayEvent() {
        const workdayEvents = ['team_meeting', 'client_visit', 'system_maintenance'];
        const randomEvent = workdayEvents[Math.floor(Math.random() * workdayEvents.length)];
        
        if (!this.hasActiveEvent(randomEvent)) {
            this.scheduleEvent(randomEvent, Math.random() * 300); // 0-5分钟内触发
        }
    }

    // 触发每日事件
    triggerDailyEvent() {
        const dailyEvents = ['daily_report', 'budget_review', 'performance_evaluation'];
        const randomEvent = dailyEvents[Math.floor(Math.random() * dailyEvents.length)];
        
        if (!this.hasActiveEvent(randomEvent)) {
            this.scheduleEvent(randomEvent, Math.random() * 600); // 0-10分钟内触发
        }
    }

    // 暂停活跃事件
    pauseActiveEvents() {
        for (const [eventId, event] of this.activeEvents) {
            if (event.pausable !== false) {
                event.paused = true;
                console.log(`⏸️ 暂停事件: ${event.name}`);
            }
        }
    }

    // 恢复活跃事件
    resumeActiveEvents() {
        for (const [eventId, event] of this.activeEvents) {
            if (event.paused) {
                event.paused = false;
                console.log(`▶️ 恢复事件: ${event.name}`);
            }
        }
    }

    // 检查是否有特定的活跃事件
    hasActiveEvent(eventId) {
        return this.activeEvents.has(eventId);
    }

    // 触发收入变化事件（由ResourceSystem调用）
    triggerIncomeChangeEvent(incomeChange) {
        if (incomeChange > 500) {
            this.scheduleEvent('income_boost', 0);
        } else if (incomeChange < -300) {
            this.scheduleEvent('income_decline', 0);
        }
    }

    // 获取事件摘要
    getEventSummary() {
        return {
            totalEvents: this.events.size,
            activeEvents: this.activeEvents.size,
            queuedEvents: this.eventQueue.length
        };
    }

    // 序列化数据
    serialize() {
        return {
            activeEvents: Array.from(this.activeEvents.entries()),
            eventQueue: this.eventQueue,
            eventTimer: this.eventTimer
        };
    }

    // 反序列化数据
    deserialize(data) {
        if (data.activeEvents) {
            this.activeEvents = new Map(data.activeEvents);
        }
        if (data.eventQueue) {
            this.eventQueue = data.eventQueue;
        }
        if (data.eventTimer !== undefined) {
            this.eventTimer = data.eventTimer;
        }
    }
}

// 进展系统 - 增强版本
class ProgressionSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.game = gameManager.game;
        
        // 公司等级和经验系统
        this.companyLevel = 1;
        this.experience = 0;
        this.experienceToNext = 1000;
        this.totalExperience = 0;
        
        // 里程碑系统
        this.milestones = new Map();
        this.completedMilestones = new Set();
        
        // 解锁功能系统
        this.unlockedFeatures = new Set(['basic_office']);
        this.availableFeatures = new Map();
        
        // 多楼层系统
        this.floors = new Map();
        this.currentFloor = 1;
        this.maxFloors = 1;
        this.floorCapacity = new Map();
        
        // 员工容量系统
        this.baseEmployeeCapacity = 20;
        this.currentEmployeeCapacity = 20;
        
        // 管理挑战系统
        this.activeChallenges = new Set();
        this.challengeHistory = new Map();
        
        // 初始化系统
        this.initializeMilestones();
        this.initializeFeatures();
        this.initializeFloors();
        this.initializeChallenges();
    }

    // 初始化里程碑系统
    initializeMilestones() {
        const milestones = [
            // 员工数量里程碑
            {
                id: 'employees_5',
                name: '小团队建立',
                description: '拥有5名员工',
                condition: () => this.game.employees.length >= 5,
                rewards: { money: 5000, experience: 200, features: ['team_management'] },
                category: 'employees'
            },
            {
                id: 'employees_15',
                name: '中型公司',
                description: '拥有15名员工',
                condition: () => this.game.employees.length >= 15,
                rewards: { money: 15000, experience: 500, features: ['hr_system'] },
                category: 'employees'
            },
            {
                id: 'employees_30',
                name: '大型企业',
                description: '拥有30名员工',
                condition: () => this.game.employees.length >= 30,
                rewards: { money: 50000, experience: 1000, features: ['second_floor'], floors: 1 },
                category: 'employees'
            },
            
            // 财务里程碑
            {
                id: 'money_100k',
                name: '财务稳定',
                description: '拥有100,000元资金',
                condition: () => this.gameManager.getResourceSystem().getResource('money') >= 100000,
                rewards: { experience: 300, features: ['investment_options'] },
                category: 'financial'
            },
            {
                id: 'money_500k',
                name: '富有公司',
                description: '拥有500,000元资金',
                condition: () => this.gameManager.getResourceSystem().getResource('money') >= 500000,
                rewards: { experience: 800, features: ['luxury_facilities'], floors: 1 },
                category: 'financial'
            },
            
            // 声望里程碑
            {
                id: 'reputation_80',
                name: '行业认可',
                description: '声望达到80',
                condition: () => this.gameManager.getResourceSystem().getResource('reputation') >= 80,
                rewards: { money: 20000, experience: 400, features: ['premium_plugins'] },
                category: 'reputation'
            },
            
            // 时间里程碑
            {
                id: 'time_30min',
                name: '持续经营',
                description: '游戏运行30分钟',
                condition: () => this.game.gameTime >= 1800,
                rewards: { money: 10000, experience: 300, features: ['automation_tools'] },
                category: 'time'
            },
            
            // 满意度里程碑
            {
                id: 'satisfaction_90',
                name: '员工满意',
                description: '员工满意度达到90%',
                condition: () => this.gameManager.getResourceSystem().getResource('satisfaction') >= 90,
                rewards: { money: 25000, experience: 600, features: ['wellness_programs'] },
                category: 'satisfaction'
            }
        ];

        milestones.forEach(milestone => {
            this.milestones.set(milestone.id, {
                ...milestone,
                completed: false,
                completedAt: null,
                progress: 0
            });
        });
    }

    // 初始化功能系统 - 增强版本
    initializeFeatures() {
        const features = [
            // 基础功能
            { id: 'basic_office', name: '基础办公室', description: '基本的办公环境', unlocked: true, category: 'basic' },
            
            // 管理功能
            { id: 'team_management', name: '团队管理', description: '高级员工管理工具', requiredLevel: 2, category: 'management' },
            { id: 'basic_analytics', name: '基础分析', description: '基本数据分析工具', requiredLevel: 2, category: 'analytics' },
            { id: 'hr_system', name: '人力资源系统', description: '完整的HR管理系统', requiredLevel: 4, category: 'management' },
            { id: 'performance_tracking', name: '绩效跟踪', description: '员工绩效监控系统', requiredLevel: 4, category: 'analytics' },
            { id: 'automation_tools', name: '自动化工具', description: '自动化管理工具', requiredLevel: 6, category: 'automation' },
            { id: 'department_system', name: '部门系统', description: '部门划分和管理', requiredLevel: 5, category: 'management' },
            
            // 员工相关功能
            { id: 'employee_training', name: '员工培训', description: '技能提升培训系统', requiredLevel: 3, category: 'employee' },
            { id: 'bonus_system', name: '奖金系统', description: '员工激励奖金制度', requiredLevel: 5, category: 'employee' },
            { id: 'wellness_programs', name: '员工福利', description: '员工健康和福利项目', requiredLevel: 7, category: 'employee' },
            { id: 'flexible_work', name: '弹性工作', description: '灵活的工作时间安排', requiredLevel: 7, category: 'employee' },
            
            // 设施功能
            { id: 'advanced_facilities', name: '高级设施', description: '更多设施选择', requiredLevel: 3, category: 'facility' },
            { id: 'luxury_facilities', name: '豪华设施', description: '顶级办公设施', requiredLevel: 8, category: 'facility' },
            { id: 'executive_suite', name: '高管套房', description: '高级管理层办公区', requiredLevel: 9, category: 'facility' },
            { id: 'research_lab', name: '研发实验室', description: '创新研发中心', requiredLevel: 10, category: 'facility' },
            { id: 'innovation_center', name: '创新中心', description: '创意孵化空间', requiredLevel: 10, category: 'facility' },
            
            // 楼层功能
            { id: 'second_floor', name: '第二层', description: '解锁第二层办公区域', requiredLevel: 5, category: 'expansion' },
            { id: 'third_floor', name: '第三层', description: '解锁第三层办公区域', requiredLevel: 10, category: 'expansion' },
            { id: 'rooftop_garden', name: '屋顶花园', description: '员工休闲区域', requiredLevel: 12, category: 'facility' },
            { id: 'employee_daycare', name: '员工托儿所', description: '员工子女照护服务', requiredLevel: 12, category: 'employee' },
            { id: 'company_restaurant', name: '公司餐厅', description: '内部餐饮服务', requiredLevel: 12, category: 'facility' },
            
            // 投资和商业功能
            { id: 'investment_options', name: '投资选项', description: '资金投资和增值', requiredLevel: 6, category: 'business' },
            { id: 'premium_plugins', name: '高级插件', description: '访问高级插件市场', requiredLevel: 8, category: 'technology' },
            { id: 'company_car', name: '公司用车', description: '企业车辆服务', requiredLevel: 9, category: 'business' },
            
            // 高级企业功能
            { id: 'corporate_headquarters', name: '企业总部', description: '建立企业总部大楼', requiredLevel: 15, category: 'expansion' },
            { id: 'international_office', name: '国际办事处', description: '海外分支机构', requiredLevel: 15, category: 'expansion' },
            { id: 'company_jet', name: '公司专机', description: '企业专用飞机', requiredLevel: 15, category: 'luxury' },
            { id: 'mega_corporation', name: '大型企业', description: '成为行业巨头', requiredLevel: 20, category: 'achievement' },
            { id: 'global_expansion', name: '全球扩张', description: '全球业务拓展', requiredLevel: 20, category: 'expansion' },
            { id: 'industry_dominance', name: '行业主导', description: '获得行业领导地位', requiredLevel: 20, category: 'achievement' }
        ];

        features.forEach(feature => {
            this.availableFeatures.set(feature.id, feature);
            if (feature.unlocked) {
                this.unlockedFeatures.add(feature.id);
            }
        });
    }

    // 初始化楼层系统
    initializeFloors() {
        // 第一层（默认）
        this.floors.set(1, {
            id: 1,
            name: '一楼办公区',
            description: '主要办公区域',
            unlocked: true,
            capacity: 20,
            currentEmployees: 0,
            facilities: ['basic_desks', 'meeting_room', 'break_area'],
            maintenanceCost: 0
        });

        this.floorCapacity.set(1, 20);
    }

    // 初始化管理挑战系统
    initializeChallenges() {
        // 挑战会根据公司规模和等级动态生成
        this.challengeTemplates = [
            {
                id: 'efficiency_challenge',
                name: '效率提升挑战',
                description: '在一周内将生产力提升到85%以上',
                condition: () => this.gameManager.getResourceSystem().getResource('productivity') >= 85,
                duration: 420, // 7分钟
                rewards: { money: 15000, experience: 400 },
                difficulty: 'medium'
            },
            {
                id: 'satisfaction_challenge',
                name: '员工满意度挑战',
                description: '保持员工满意度在90%以上持续5分钟',
                condition: () => this.gameManager.getResourceSystem().getResource('satisfaction') >= 90,
                duration: 300, // 5分钟
                rewards: { money: 20000, experience: 500 },
                difficulty: 'hard'
            },
            {
                id: 'growth_challenge',
                name: '快速扩张挑战',
                description: '在10分钟内雇佣10名新员工',
                condition: () => this.getEmployeeGrowth() >= 10,
                duration: 600, // 10分钟
                rewards: { money: 25000, experience: 600 },
                difficulty: 'hard'
            }
        ];
    }

    // 添加经验值
    addExperience(amount, source = '未知') {
        this.experience += amount;
        this.totalExperience += amount;
        console.log(`📈 获得经验: +${amount} (来源: ${source})`);

        // 检查是否升级
        while (this.experience >= this.experienceToNext) {
            this.levelUp();
        }

        // 检查里程碑
        this.checkMilestones();
    }

    // 升级
    levelUp() {
        this.experience -= this.experienceToNext;
        this.companyLevel++;
        
        // 计算下一级所需经验（指数增长）
        this.experienceToNext = Math.floor(1000 * Math.pow(1.4, this.companyLevel - 1));

        console.log(`🎉 公司等级提升! 当前等级: ${this.companyLevel}`);

        // 应用等级奖励
        this.applyLevelReward();
        
        // 增加员工容量
        this.increaseEmployeeCapacity();
        
        // 解锁新功能
        this.checkFeatureUnlocks();
        
        // 引入新挑战
        this.introduceNewChallenges();
        
        // 通知UI
        this.notifyLevelUp();
    }

    // 应用等级奖励 - 增强版本
    applyLevelReward() {
        const resourceSystem = this.gameManager.getResourceSystem();
        const levelRewards = this.getLevelRewards(this.companyLevel);
        
        // 应用所有奖励
        if (levelRewards.money) {
            resourceSystem.addResource('money', levelRewards.money);
        }
        if (levelRewards.reputation) {
            resourceSystem.addResource('reputation', levelRewards.reputation);
        }
        if (levelRewards.satisfaction) {
            resourceSystem.addResource('satisfaction', levelRewards.satisfaction);
        }
        if (levelRewards.productivity) {
            resourceSystem.addResource('productivity', levelRewards.productivity);
        }
        
        // 解锁特殊内容
        if (levelRewards.unlocks) {
            levelRewards.unlocks.forEach(unlock => {
                this.processLevelUnlock(unlock);
            });
        }
        
        // 显示奖励摘要
        this.displayLevelRewardSummary(levelRewards);
        
        // 调整挑战难度
        this.adjustChallengeDifficulty();
    }

    // 获取等级奖励配置
    getLevelRewards(level) {
        const baseRewards = {
            money: level * 5000,
            reputation: Math.floor(level * 2),
            satisfaction: 0,
            productivity: 0,
            unlocks: []
        };

        // 特殊等级奖励
        const specialRewards = {
            2: {
                money: 8000,
                reputation: 5,
                satisfaction: 10,
                unlocks: ['team_management_tools', 'basic_analytics']
            },
            3: {
                money: 12000,
                reputation: 8,
                productivity: 5,
                unlocks: ['advanced_facilities', 'employee_training']
            },
            4: {
                money: 18000,
                reputation: 12,
                satisfaction: 15,
                unlocks: ['hr_system', 'performance_tracking']
            },
            5: {
                money: 25000,
                reputation: 15,
                productivity: 10,
                unlocks: ['second_floor', 'department_system', 'bonus_system']
            },
            6: {
                money: 35000,
                reputation: 20,
                satisfaction: 10,
                productivity: 10,
                unlocks: ['automation_tools', 'investment_options']
            },
            7: {
                money: 45000,
                reputation: 25,
                satisfaction: 20,
                unlocks: ['wellness_programs', 'flexible_work']
            },
            8: {
                money: 60000,
                reputation: 30,
                productivity: 15,
                unlocks: ['premium_plugins', 'luxury_facilities']
            },
            9: {
                money: 80000,
                reputation: 35,
                satisfaction: 15,
                productivity: 15,
                unlocks: ['executive_suite', 'company_car']
            },
            10: {
                money: 100000,
                reputation: 40,
                satisfaction: 25,
                productivity: 20,
                unlocks: ['third_floor', 'research_lab', 'innovation_center']
            },
            12: {
                money: 150000,
                reputation: 50,
                satisfaction: 30,
                productivity: 25,
                unlocks: ['rooftop_garden', 'employee_daycare', 'company_restaurant']
            },
            15: {
                money: 250000,
                reputation: 60,
                satisfaction: 35,
                productivity: 30,
                unlocks: ['corporate_headquarters', 'international_office', 'company_jet']
            },
            20: {
                money: 500000,
                reputation: 80,
                satisfaction: 50,
                productivity: 40,
                unlocks: ['mega_corporation', 'global_expansion', 'industry_dominance']
            }
        };

        // 合并基础奖励和特殊奖励
        if (specialRewards[level]) {
            return {
                ...baseRewards,
                ...specialRewards[level],
                unlocks: [...baseRewards.unlocks, ...(specialRewards[level].unlocks || [])]
            };
        }

        return baseRewards;
    }

    // 处理等级解锁内容
    processLevelUnlock(unlock) {
        switch (unlock) {
            case 'team_management_tools':
                this.unlockFeature('team_management');
                console.log('🔓 解锁团队管理工具');
                break;
            case 'basic_analytics':
                this.unlockFeature('basic_analytics');
                console.log('📊 解锁基础数据分析');
                break;
            case 'advanced_facilities':
                this.unlockFeature('advanced_facilities');
                console.log('🏢 解锁高级设施');
                break;
            case 'employee_training':
                this.unlockFeature('employee_training');
                console.log('🎓 解锁员工培训系统');
                break;
            case 'hr_system':
                this.unlockFeature('hr_system');
                console.log('👥 解锁人力资源系统');
                break;
            case 'performance_tracking':
                this.unlockFeature('performance_tracking');
                console.log('📈 解锁绩效跟踪系统');
                break;
            case 'second_floor':
                this.unlockFloor(2);
                console.log('🏢 解锁第二层办公区');
                break;
            case 'department_system':
                this.unlockFeature('department_system');
                console.log('🏛️ 解锁部门管理系统');
                break;
            case 'bonus_system':
                this.unlockFeature('bonus_system');
                console.log('💰 解锁员工奖金系统');
                break;
            case 'automation_tools':
                this.unlockFeature('automation_tools');
                console.log('🤖 解锁自动化工具');
                break;
            case 'investment_options':
                this.unlockFeature('investment_options');
                console.log('📊 解锁投资选项');
                break;
            case 'wellness_programs':
                this.unlockFeature('wellness_programs');
                console.log('🧘 解锁员工健康计划');
                break;
            case 'flexible_work':
                this.unlockFeature('flexible_work');
                console.log('🏠 解锁弹性工作制');
                break;
            case 'premium_plugins':
                this.unlockFeature('premium_plugins');
                console.log('⭐ 解锁高级插件市场');
                break;
            case 'luxury_facilities':
                this.unlockFeature('luxury_facilities');
                console.log('💎 解锁豪华设施');
                break;
            case 'executive_suite':
                this.unlockFeature('executive_suite');
                console.log('👔 解锁高管套房');
                break;
            case 'company_car':
                this.unlockFeature('company_car');
                console.log('🚗 解锁公司用车');
                break;
            case 'third_floor':
                this.unlockFloor(3);
                console.log('🏢 解锁第三层办公区');
                break;
            case 'research_lab':
                this.unlockFeature('research_lab');
                console.log('🔬 解锁研发实验室');
                break;
            case 'innovation_center':
                this.unlockFeature('innovation_center');
                console.log('💡 解锁创新中心');
                break;
            case 'rooftop_garden':
                this.unlockFeature('rooftop_garden');
                console.log('🌿 解锁屋顶花园');
                break;
            case 'employee_daycare':
                this.unlockFeature('employee_daycare');
                console.log('👶 解锁员工托儿所');
                break;
            case 'company_restaurant':
                this.unlockFeature('company_restaurant');
                console.log('🍽️ 解锁公司餐厅');
                break;
            case 'corporate_headquarters':
                this.unlockFeature('corporate_headquarters');
                console.log('🏛️ 解锁企业总部');
                break;
            case 'international_office':
                this.unlockFeature('international_office');
                console.log('🌍 解锁国际办事处');
                break;
            case 'company_jet':
                this.unlockFeature('company_jet');
                console.log('✈️ 解锁公司专机');
                break;
            case 'mega_corporation':
                this.unlockFeature('mega_corporation');
                console.log('🏢 成为大型企业集团');
                break;
            case 'global_expansion':
                this.unlockFeature('global_expansion');
                console.log('🌎 解锁全球扩张');
                break;
            case 'industry_dominance':
                this.unlockFeature('industry_dominance');
                console.log('👑 获得行业主导地位');
                break;
            default:
                console.log(`🔓 解锁: ${unlock}`);
        }
    }

    // 显示等级奖励摘要
    displayLevelRewardSummary(rewards) {
        let summary = `🎉 等级 ${this.companyLevel} 奖励:\n`;
        
        if (rewards.money) {
            summary += `💰 +${rewards.money.toLocaleString()}元\n`;
        }
        if (rewards.reputation) {
            summary += `⭐ +${rewards.reputation}声望\n`;
        }
        if (rewards.satisfaction) {
            summary += `😊 +${rewards.satisfaction}员工满意度\n`;
        }
        if (rewards.productivity) {
            summary += `📈 +${rewards.productivity}生产力\n`;
        }
        if (rewards.unlocks && rewards.unlocks.length > 0) {
            summary += `🔓 解锁 ${rewards.unlocks.length} 项新功能`;
        }
        
        console.log(summary);
        
        // 通知UI
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(summary, 'level_reward');
        }
    }

    // 调整挑战难度
    adjustChallengeDifficulty() {
        // 根据等级调整挑战参数
        const difficultyMultiplier = this.getDifficultyMultiplier();
        
        // 更新挑战模板的难度
        this.challengeTemplates.forEach(template => {
            // 调整奖励
            if (template.baseRewards) {
                template.rewards = {
                    money: Math.floor(template.baseRewards.money * difficultyMultiplier),
                    experience: Math.floor(template.baseRewards.experience * difficultyMultiplier)
                };
            } else {
                // 保存原始奖励作为基础
                template.baseRewards = { ...template.rewards };
                template.rewards = {
                    money: Math.floor(template.rewards.money * difficultyMultiplier),
                    experience: Math.floor(template.rewards.experience * difficultyMultiplier)
                };
            }
            
            // 调整持续时间（高等级挑战时间更短，难度更高）
            if (template.baseDuration) {
                template.duration = Math.max(60, Math.floor(template.baseDuration * (1 / Math.sqrt(difficultyMultiplier))));
            } else {
                template.baseDuration = template.duration;
                template.duration = Math.max(60, Math.floor(template.duration * (1 / Math.sqrt(difficultyMultiplier))));
            }
        });
        
        // 添加新的高级挑战
        this.addAdvancedChallenges();
        
        console.log(`⚖️ 挑战难度已调整 (等级 ${this.companyLevel}, 倍数: ${difficultyMultiplier.toFixed(2)})`);
    }

    // 获取难度倍数
    getDifficultyMultiplier() {
        // 基于等级的指数增长难度
        return Math.pow(1.2, this.companyLevel - 1);
    }

    // 添加高级挑战
    addAdvancedChallenges() {
        const advancedChallenges = [];
        
        // 根据等级添加相应的高级挑战
        if (this.companyLevel >= 5) {
            advancedChallenges.push({
                id: 'multi_floor_management',
                name: '多楼层管理挑战',
                description: '同时管理多个楼层，保持所有楼层满意度在80%以上',
                condition: () => {
                    const floors = this.getAllFloors();
                    return floors.every(floor => {
                        if (!floor.unlocked) return true;
                        // 简化检查：假设每层满意度与总体满意度相关
                        return this.gameManager.getResourceSystem().getResource('satisfaction') >= 80;
                    });
                },
                duration: 300,
                rewards: { money: 30000, experience: 800 },
                difficulty: 'hard'
            });
        }
        
        if (this.companyLevel >= 8) {
            advancedChallenges.push({
                id: 'profit_maximization',
                name: '利润最大化挑战',
                description: '在10分钟内将收入提升50%',
                condition: () => {
                    const currentIncome = this.gameManager.getResourceSystem().calculateIncome();
                    const baseIncome = 1000 + this.game.employees.length * 50; // 基础收入计算
                    return currentIncome >= baseIncome * 1.5;
                },
                duration: 600,
                rewards: { money: 50000, experience: 1200 },
                difficulty: 'expert'
            });
        }
        
        if (this.companyLevel >= 10) {
            advancedChallenges.push({
                id: 'zero_complaints',
                name: '零抱怨挑战',
                description: '保持15分钟内没有任何员工抱怨',
                condition: () => {
                    const complainingEmployees = this.game.employees.filter(emp => emp.complaint);
                    return complainingEmployees.length === 0;
                },
                duration: 900,
                rewards: { money: 75000, experience: 1500 },
                difficulty: 'expert'
            });
        }
        
        if (this.companyLevel >= 15) {
            advancedChallenges.push({
                id: 'perfect_harmony',
                name: '完美和谐挑战',
                description: '同时达到满意度95%、生产力95%、声望95%',
                condition: () => {
                    const resources = this.gameManager.getResourceSystem();
                    return resources.getResource('satisfaction') >= 95 &&
                           resources.getResource('productivity') >= 95 &&
                           resources.getResource('reputation') >= 95;
                },
                duration: 600,
                rewards: { money: 100000, experience: 2000 },
                difficulty: 'legendary'
            });
        }
        
        // 将新挑战添加到模板中
        advancedChallenges.forEach(challenge => {
            const existingIndex = this.challengeTemplates.findIndex(t => t.id === challenge.id);
            if (existingIndex === -1) {
                this.challengeTemplates.push(challenge);
                console.log(`🎯 添加高级挑战: ${challenge.name}`);
            }
        });
    }

    // 增加员工容量
    increaseEmployeeCapacity() {
        const capacityIncrease = Math.floor(this.companyLevel * 3);
        this.currentEmployeeCapacity = this.baseEmployeeCapacity + capacityIncrease;
        
        console.log(`👥 员工容量增加至: ${this.currentEmployeeCapacity}`);
    }

    // 检查里程碑完成情况
    checkMilestones() {
        for (const [id, milestone] of this.milestones) {
            if (!milestone.completed && milestone.condition()) {
                this.completeMilestone(id);
            }
        }
    }

    // 完成里程碑
    completeMilestone(milestoneId) {
        const milestone = this.milestones.get(milestoneId);
        if (!milestone || milestone.completed) return;

        milestone.completed = true;
        milestone.completedAt = Date.now();
        this.completedMilestones.add(milestoneId);

        console.log(`🏁 里程碑完成: ${milestone.name} - ${milestone.description}`);

        // 发放奖励
        this.grantMilestoneRewards(milestone.rewards);

        // 通知UI
        this.notifyMilestoneCompleted(milestone);
    }

    // 发放里程碑奖励
    grantMilestoneRewards(rewards) {
        const resourceSystem = this.gameManager.getResourceSystem();

        if (rewards.money) {
            resourceSystem.addResource('money', rewards.money);
            console.log(`💰 获得金钱奖励: ${rewards.money}`);
        }

        if (rewards.experience) {
            this.addExperience(rewards.experience, '里程碑奖励');
        }

        if (rewards.features) {
            rewards.features.forEach(feature => {
                this.unlockFeature(feature);
            });
        }

        if (rewards.floors) {
            this.unlockFloors(rewards.floors);
        }
    }

    // 检查功能解锁
    checkFeatureUnlocks() {
        for (const [id, feature] of this.availableFeatures) {
            if (!this.unlockedFeatures.has(id) && 
                feature.requiredLevel && 
                this.companyLevel >= feature.requiredLevel) {
                this.unlockFeature(id);
            }
        }
    }

    // 检查功能是否解锁
    isFeatureUnlocked(feature) {
        return this.unlockedFeatures.has(feature);
    }

    // 解锁功能
    unlockFeature(feature) {
        if (this.unlockedFeatures.has(feature)) return;
        
        this.unlockedFeatures.add(feature);
        const featureInfo = this.availableFeatures.get(feature);
        const featureName = featureInfo ? featureInfo.name : feature;
        
        console.log(`🔓 解锁功能: ${featureName}`);
        
        // 通知UI
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(`🔓 解锁新功能: ${featureName}`, 'feature_unlock');
        }
    }

    // 解锁楼层
    unlockFloors(count) {
        for (let i = 0; i < count; i++) {
            const newFloorId = this.maxFloors + 1;
            this.unlockFloor(newFloorId);
        }
    }

    // 解锁单个楼层
    unlockFloor(floorId) {
        if (this.floors.has(floorId)) return;

        const floorNames = ['', '一楼', '二楼', '三楼', '四楼', '五楼'];
        const floorName = floorNames[floorId] || `${floorId}楼`;

        this.floors.set(floorId, {
            id: floorId,
            name: `${floorName}办公区`,
            description: `第${floorId}层办公区域`,
            unlocked: true,
            capacity: 15 + (floorId - 1) * 5, // 每层容量递增
            currentEmployees: 0,
            facilities: this.getFloorFacilities(floorId),
            maintenanceCost: floorId * 1000 // 维护成本
        });

        this.maxFloors = Math.max(this.maxFloors, floorId);
        this.floorCapacity.set(floorId, this.floors.get(floorId).capacity);

        console.log(`🏢 解锁新楼层: ${floorName}`);
        
        // 通知UI
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(`🏢 解锁新楼层: ${floorName}`, 'floor_unlock');
        }
    }

    // 获取楼层设施配置
    getFloorFacilities(floorId) {
        const baseFacilities = ['basic_desks', 'computers'];
        
        switch (floorId) {
            case 1:
                return [...baseFacilities, 'meeting_room', 'break_area', 'reception'];
            case 2:
                return [...baseFacilities, 'conference_room', 'kitchen', 'storage'];
            case 3:
                return [...baseFacilities, 'executive_office', 'library', 'gym'];
            case 4:
                return [...baseFacilities, 'server_room', 'training_room', 'lounge'];
            case 5:
                return [...baseFacilities, 'rooftop_garden', 'meditation_room', 'cafe'];
            default:
                return [...baseFacilities, 'flexible_space'];
        }
    }

    // 员工楼层分配
    assignEmployeeToFloor(employee, floorId) {
        const floor = this.floors.get(floorId);
        if (!floor || !floor.unlocked) {
            console.warn(`楼层 ${floorId} 不可用`);
            return false;
        }

        if (floor.currentEmployees >= floor.capacity) {
            console.warn(`楼层 ${floorId} 已满员`);
            return false;
        }

        // 从当前楼层移除
        if (employee.currentFloor) {
            const currentFloor = this.floors.get(employee.currentFloor);
            if (currentFloor) {
                currentFloor.currentEmployees--;
            }
        }

        // 分配到新楼层
        employee.currentFloor = floorId;
        floor.currentEmployees++;

        console.log(`👤 ${employee.name} 分配到 ${floor.name}`);
        return true;
    }

    // 引入新挑战
    introduceNewChallenges() {
        // 根据等级引入适当难度的挑战
        const availableChallenges = this.challengeTemplates.filter(template => {
            const minLevel = this.getDifficultyMinLevel(template.difficulty);
            return this.companyLevel >= minLevel && !this.activeChallenges.has(template.id);
        });

        if (availableChallenges.length > 0 && Math.random() < 0.3) {
            const challenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
            this.startChallenge(challenge);
        }
    }

    // 获取难度对应的最低等级
    getDifficultyMinLevel(difficulty) {
        switch (difficulty) {
            case 'easy': return 1;
            case 'medium': return 3;
            case 'hard': return 5;
            case 'expert': return 8;
            case 'legendary': return 15;
            default: return 1;
        }
    }

    // 获取等级解锁预览
    getLevelUnlockPreview(targetLevel = null) {
        const level = targetLevel || this.companyLevel + 1;
        const rewards = this.getLevelRewards(level);
        
        // 获取该等级解锁的功能详情
        const unlockDetails = [];
        if (rewards.unlocks) {
            rewards.unlocks.forEach(unlock => {
                const feature = this.availableFeatures.get(unlock);
                if (feature) {
                    unlockDetails.push({
                        id: unlock,
                        name: feature.name,
                        description: feature.description,
                        category: feature.category
                    });
                } else {
                    // 处理特殊解锁内容
                    unlockDetails.push(this.getSpecialUnlockDetails(unlock));
                }
            });
        }
        
        return {
            level: level,
            rewards: rewards,
            unlockDetails: unlockDetails,
            experienceNeeded: this.calculateExperienceToLevel(level),
            estimatedTime: this.estimateTimeToLevel(level)
        };
    }

    // 获取特殊解锁内容详情
    getSpecialUnlockDetails(unlock) {
        const specialUnlocks = {
            'team_management_tools': { name: '团队管理工具', description: '高效管理团队的专业工具', category: 'management' },
            'basic_analytics': { name: '基础数据分析', description: '查看关键业务指标', category: 'analytics' },
            'employee_training': { name: '员工培训系统', description: '提升员工技能和能力', category: 'employee' },
            'performance_tracking': { name: '绩效跟踪系统', description: '监控和评估员工表现', category: 'analytics' },
            'second_floor': { name: '第二层办公区', description: '扩展办公空间，容纳更多员工', category: 'expansion' },
            'department_system': { name: '部门管理系统', description: '组织结构化管理', category: 'management' },
            'bonus_system': { name: '员工奖金系统', description: '激励员工的奖励机制', category: 'employee' },
            'flexible_work': { name: '弹性工作制', description: '灵活的工作时间安排', category: 'employee' },
            'executive_suite': { name: '高管套房', description: '专属的高级管理办公区', category: 'facility' },
            'company_car': { name: '公司用车', description: '企业专用交通工具', category: 'business' },
            'third_floor': { name: '第三层办公区', description: '进一步扩展办公空间', category: 'expansion' },
            'research_lab': { name: '研发实验室', description: '创新技术研发中心', category: 'facility' },
            'innovation_center': { name: '创新中心', description: '创意孵化和项目开发', category: 'facility' },
            'employee_daycare': { name: '员工托儿所', description: '为员工提供子女照护服务', category: 'employee' },
            'company_restaurant': { name: '公司餐厅', description: '内部餐饮服务设施', category: 'facility' },
            'corporate_headquarters': { name: '企业总部', description: '建立标志性总部大楼', category: 'expansion' },
            'international_office': { name: '国际办事处', description: '拓展海外业务', category: 'expansion' },
            'company_jet': { name: '公司专机', description: '企业专用航空服务', category: 'luxury' },
            'mega_corporation': { name: '大型企业集团', description: '成为行业领导者', category: 'achievement' },
            'global_expansion': { name: '全球业务扩张', description: '在全球范围内开展业务', category: 'expansion' },
            'industry_dominance': { name: '行业主导地位', description: '获得市场领导地位', category: 'achievement' }
        };
        
        return specialUnlocks[unlock] || { name: unlock, description: '特殊功能解锁', category: 'special' };
    }

    // 计算到达指定等级所需经验
    calculateExperienceToLevel(targetLevel) {
        if (targetLevel <= this.companyLevel) return 0;
        
        let totalNeeded = 0;
        let currentExp = this.experience;
        let currentExpToNext = this.experienceToNext;
        
        for (let level = this.companyLevel; level < targetLevel; level++) {
            totalNeeded += currentExpToNext - (level === this.companyLevel ? currentExp : 0);
            currentExpToNext = Math.floor(1000 * Math.pow(1.4, level));
            currentExp = 0; // 后续等级从0开始计算
        }
        
        return totalNeeded;
    }

    // 估算到达指定等级的时间
    estimateTimeToLevel(targetLevel) {
        const experienceNeeded = this.calculateExperienceToLevel(targetLevel);
        const currentExpPerMinute = this.calculateAverageExpPerMinute();
        
        if (currentExpPerMinute <= 0) return '未知';
        
        const minutesNeeded = Math.ceil(experienceNeeded / currentExpPerMinute);
        
        if (minutesNeeded < 60) {
            return `约 ${minutesNeeded} 分钟`;
        } else if (minutesNeeded < 1440) {
            const hours = Math.floor(minutesNeeded / 60);
            const minutes = minutesNeeded % 60;
            return `约 ${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`;
        } else {
            const days = Math.floor(minutesNeeded / 1440);
            const hours = Math.floor((minutesNeeded % 1440) / 60);
            return `约 ${days}天${hours > 0 ? hours + '小时' : ''}`;
        }
    }

    // 计算平均每分钟经验获取
    calculateAverageExpPerMinute() {
        if (this.game.gameTime < 60) return 0; // 游戏时间不足1分钟
        
        const totalMinutes = this.game.gameTime / 60;
        return this.totalExperience / totalMinutes;
    }

    // 获取下几个等级的解锁预览
    getUpcomingUnlocks(levels = 3) {
        const upcoming = [];
        for (let i = 1; i <= levels; i++) {
            const targetLevel = this.companyLevel + i;
            if (targetLevel <= 25) { // 假设最高等级为25
                upcoming.push(this.getLevelUnlockPreview(targetLevel));
            }
        }
        return upcoming;
    }

    // 开始挑战
    startChallenge(challengeTemplate) {
        const challenge = {
            ...challengeTemplate,
            startTime: Date.now(),
            endTime: Date.now() + (challengeTemplate.duration * 1000),
            progress: 0,
            completed: false
        };

        this.activeChallenges.add(challenge.id);
        this.challengeHistory.set(challenge.id, challenge);

        console.log(`🎯 新挑战开始: ${challenge.name}`);
        
        // 通知UI
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(`🎯 新挑战: ${challenge.name}`, 'challenge_start');
        }
    }

    // 检查挑战进度
    checkChallengeProgress() {
        const currentTime = Date.now();
        
        for (const challengeId of this.activeChallenges) {
            const challenge = this.challengeHistory.get(challengeId);
            if (!challenge || challenge.completed) continue;

            // 检查是否超时
            if (currentTime > challenge.endTime) {
                this.failChallenge(challengeId);
                continue;
            }

            // 检查完成条件
            if (challenge.condition()) {
                this.completeChallenge(challengeId);
            }
        }
    }

    // 完成挑战
    completeChallenge(challengeId) {
        const challenge = this.challengeHistory.get(challengeId);
        if (!challenge) return;

        challenge.completed = true;
        challenge.completedAt = Date.now();
        this.activeChallenges.delete(challengeId);

        console.log(`🏆 挑战完成: ${challenge.name}`);

        // 发放奖励
        this.grantChallengeRewards(challenge.rewards);

        // 通知UI
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(`🏆 挑战完成: ${challenge.name}`, 'challenge_complete');
        }
    }

    // 挑战失败
    failChallenge(challengeId) {
        const challenge = this.challengeHistory.get(challengeId);
        if (!challenge) return;

        challenge.failed = true;
        challenge.failedAt = Date.now();
        this.activeChallenges.delete(challengeId);

        console.log(`❌ 挑战失败: ${challenge.name}`);
    }

    // 发放挑战奖励
    grantChallengeRewards(rewards) {
        const resourceSystem = this.gameManager.getResourceSystem();

        if (rewards.money) {
            resourceSystem.addResource('money', rewards.money);
        }

        if (rewards.experience) {
            this.addExperience(rewards.experience, '挑战奖励');
        }
    }

    // 获取员工增长数量（用于挑战）
    getEmployeeGrowth() {
        // 这里应该跟踪员工增长，简化实现
        return Math.max(0, this.game.employees.length - 10);
    }

    // 获取当前等级进度
    getLevelProgress() {
        return {
            level: this.companyLevel,
            experience: this.experience,
            experienceToNext: this.experienceToNext,
            totalExperience: this.totalExperience,
            progress: (this.experience / this.experienceToNext) * 100
        };
    }

    // 获取楼层信息
    getFloorInfo(floorId) {
        return this.floors.get(floorId);
    }

    // 获取所有楼层
    getAllFloors() {
        return Array.from(this.floors.values()).sort((a, b) => a.id - b.id);
    }

    // 获取当前楼层
    getCurrentFloor() {
        return this.currentFloor;
    }

    // 切换楼层
    switchToFloor(floorId) {
        const floor = this.floors.get(floorId);
        if (!floor || !floor.unlocked) {
            console.warn(`无法切换到楼层 ${floorId}`);
            return false;
        }

        this.currentFloor = floorId;
        console.log(`🏢 切换到 ${floor.name}`);
        return true;
    }

    // 通知升级
    notifyLevelUp() {
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(`🎉 公司等级提升至 ${this.companyLevel}!`, 'levelup');
        }
    }

    // 通知里程碑完成
    notifyMilestoneCompleted(milestone) {
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(`🏁 里程碑完成: ${milestone.name}`, 'milestone');
        }
    }

    // 系统更新
    update(deltaTime) {
        // 根据游戏活动自动获得经验
        const employeeCount = this.game.employees.length;
        const resourceSystem = this.gameManager.getResourceSystem();
        
        // 每分钟根据员工数量和满意度获得经验
        if (Math.floor(this.game.gameTime) % 60 === 0) {
            const baseExp = employeeCount * 2;
            const satisfactionBonus = Math.floor(resourceSystem.getResource('satisfaction') / 10);
            const productivityBonus = Math.floor(resourceSystem.getResource('productivity') / 20);
            const totalExp = baseExp + satisfactionBonus + productivityBonus;
            
            if (totalExp > 0) {
                this.addExperience(totalExp, '日常运营');
            }
        }

        // 检查挑战进度
        this.checkChallengeProgress();

        // 更新楼层员工分布
        this.updateFloorDistribution();

        // 处理楼层维护成本
        if (Math.floor(this.game.gameTime) % 300 === 0) { // 每5分钟
            this.processFloorMaintenance();
        }
    }

    // 更新楼层员工分布
    updateFloorDistribution() {
        // 重置楼层员工计数
        for (const floor of this.floors.values()) {
            floor.currentEmployees = 0;
        }

        // 重新计算每层员工数量
        this.game.employees.forEach(employee => {
            const floorId = employee.currentFloor || 1;
            const floor = this.floors.get(floorId);
            if (floor) {
                floor.currentEmployees++;
            }
        });
    }

    // 处理楼层维护成本
    processFloorMaintenance() {
        const resourceSystem = this.gameManager.getResourceSystem();
        let totalMaintenanceCost = 0;

        for (const floor of this.floors.values()) {
            if (floor.unlocked && floor.id > 1) { // 第一层免费
                totalMaintenanceCost += floor.maintenanceCost;
            }
        }

        if (totalMaintenanceCost > 0) {
            const success = resourceSystem.spendResource('money', totalMaintenanceCost);
            if (success) {
                console.log(`🔧 楼层维护费用: ${totalMaintenanceCost}元`);
            } else {
                console.warn(`⚠️ 维护费用不足，可能影响楼层效率`);
                // 可以在这里添加维护不足的负面效果
            }
        }
    }

    // 获取进展摘要
    getProgressSummary() {
        const completedMilestonesArray = Array.from(this.completedMilestones)
            .map(id => this.milestones.get(id))
            .filter(Boolean);

        const nextMilestones = Array.from(this.milestones.values())
            .filter(m => !m.completed)
            .slice(0, 3);

        return {
            // 等级信息
            level: this.companyLevel,
            experience: this.experience,
            experienceToNext: this.experienceToNext,
            totalExperience: this.totalExperience,
            levelProgress: (this.experience / this.experienceToNext) * 100,

            // 里程碑信息
            completedMilestones: completedMilestonesArray.length,
            totalMilestones: this.milestones.size,
            nextMilestones: nextMilestones,

            // 功能信息
            unlockedFeatures: Array.from(this.unlockedFeatures),
            availableFeatures: Array.from(this.availableFeatures.keys()),

            // 楼层信息
            currentFloor: this.currentFloor,
            maxFloors: this.maxFloors,
            floors: this.getAllFloors(),

            // 容量信息
            employeeCapacity: this.currentEmployeeCapacity,
            currentEmployees: this.game.employees.length,

            // 挑战信息
            activeChallenges: Array.from(this.activeChallenges),
            completedChallenges: Array.from(this.challengeHistory.values())
                .filter(c => c.completed).length
        };
    }

    // 获取里程碑进度
    getMilestoneProgress() {
        const milestones = Array.from(this.milestones.values());
        
        return milestones.map(milestone => ({
            ...milestone,
            progress: this.calculateMilestoneProgress(milestone)
        }));
    }

    // 计算里程碑进度
    calculateMilestoneProgress(milestone) {
        if (milestone.completed) return 100;

        // 根据里程碑类型计算进度
        switch (milestone.category) {
            case 'employees':
                const targetEmployees = this.extractNumberFromCondition(milestone.description);
                return Math.min(100, (this.game.employees.length / targetEmployees) * 100);
            
            case 'financial':
                const targetMoney = this.extractNumberFromCondition(milestone.description);
                const currentMoney = this.gameManager.getResourceSystem().getResource('money');
                return Math.min(100, (currentMoney / targetMoney) * 100);
            
            case 'reputation':
                const targetReputation = this.extractNumberFromCondition(milestone.description);
                const currentReputation = this.gameManager.getResourceSystem().getResource('reputation');
                return Math.min(100, (currentReputation / targetReputation) * 100);
            
            case 'satisfaction':
                const targetSatisfaction = this.extractNumberFromCondition(milestone.description);
                const currentSatisfaction = this.gameManager.getResourceSystem().getResource('satisfaction');
                return Math.min(100, (currentSatisfaction / targetSatisfaction) * 100);
            
            case 'time':
                const targetTime = this.extractNumberFromCondition(milestone.description) * 60; // 转换为秒
                return Math.min(100, (this.game.gameTime / targetTime) * 100);
            
            default:
                return milestone.condition() ? 100 : 0;
        }
    }

    // 从描述中提取数字（辅助方法）
    extractNumberFromCondition(description) {
        const match = description.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    // 序列化数据
    serialize() {
        return {
            companyLevel: this.companyLevel,
            experience: this.experience,
            experienceToNext: this.experienceToNext,
            totalExperience: this.totalExperience,
            unlockedFeatures: Array.from(this.unlockedFeatures),
            completedMilestones: Array.from(this.completedMilestones),
            floors: Array.from(this.floors.entries()),
            currentFloor: this.currentFloor,
            maxFloors: this.maxFloors,
            currentEmployeeCapacity: this.currentEmployeeCapacity,
            activeChallenges: Array.from(this.activeChallenges),
            challengeHistory: Array.from(this.challengeHistory.entries())
        };
    }

    // 反序列化数据
    deserialize(data) {
        if (data.companyLevel !== undefined) {
            this.companyLevel = data.companyLevel;
        }
        if (data.experience !== undefined) {
            this.experience = data.experience;
        }
        if (data.experienceToNext !== undefined) {
            this.experienceToNext = data.experienceToNext;
        }
        if (data.totalExperience !== undefined) {
            this.totalExperience = data.totalExperience;
        }
        if (data.unlockedFeatures) {
            this.unlockedFeatures = new Set(data.unlockedFeatures);
        }
        if (data.completedMilestones) {
            this.completedMilestones = new Set(data.completedMilestones);
            // 更新里程碑状态
            data.completedMilestones.forEach(id => {
                const milestone = this.milestones.get(id);
                if (milestone) {
                    milestone.completed = true;
                }
            });
        }
        if (data.floors) {
            this.floors = new Map(data.floors);
        }
        if (data.currentFloor !== undefined) {
            this.currentFloor = data.currentFloor;
        }
        if (data.maxFloors !== undefined) {
            this.maxFloors = data.maxFloors;
        }
        if (data.currentEmployeeCapacity !== undefined) {
            this.currentEmployeeCapacity = data.currentEmployeeCapacity;
        }
        if (data.activeChallenges) {
            this.activeChallenges = new Set(data.activeChallenges);
        }
        if (data.challengeHistory) {
            this.challengeHistory = new Map(data.challengeHistory);
        }
    }
}

// 统计和分析系统
class StatisticsSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.game = gameManager.game;
        
        // 数据收集配置
        this.dataCollectionInterval = 60; // 每60帧收集一次数据 (约1秒)
        this.dataCollectionTimer = 0;
        
        // 历史数据存储
        this.historicalData = {
            resources: [], // 资源历史
            employees: [], // 员工数量历史
            events: [], // 事件历史
            achievements: [], // 成就历史
            performance: [], // 性能指标历史
            complaints: [] // 抱怨统计历史
        };
        
        // 实时统计数据
        this.currentStats = {
            totalPlayTime: 0,
            totalEmployeesHired: 0,
            totalMoneyEarned: 0,
            totalMoneySpent: 0,
            totalEventsTriggered: 0,
            totalAchievementsUnlocked: 0,
            totalComplaintsResolved: 0,
            averageSatisfaction: 0,
            averageProductivity: 0,
            peakEmployeeCount: 0,
            peakMoney: 0,
            peakSatisfaction: 0,
            peakProductivity: 0,
            peakReputation: 0
        };
        
        // 趋势分析数据
        this.trends = {
            satisfaction: { direction: 'stable', strength: 0, prediction: 0 },
            productivity: { direction: 'stable', strength: 0, prediction: 0 },
            reputation: { direction: 'stable', strength: 0, prediction: 0 },
            money: { direction: 'stable', strength: 0, prediction: 0 },
            employees: { direction: 'stable', strength: 0, prediction: 0 }
        };
        
        // 异常检测阈值
        this.anomalyThresholds = {
            satisfactionDrop: 20, // 满意度下降超过20%
            productivityDrop: 15, // 生产力下降超过15%
            reputationDrop: 10, // 声望下降超过10%
            moneyLoss: 50000, // 资金损失超过50000
            complaintSpike: 5 // 抱怨数量激增超过5个
        };
        
        // 建议系统
        this.suggestions = [];
        this.lastSuggestionTime = 0;
        this.suggestionCooldown = 300; // 5分钟冷却时间
        
        // 预警系统
        this.alerts = [];
        this.alertHistory = [];
        
        // 数据保留策略 (保留最近的数据点数量)
        this.maxDataPoints = 1000;
        
        console.log('📊 统计分析系统已初始化');
    }

    // 收集实时数据
    collectData() {
        const timestamp = Date.now();
        const resourceSystem = this.gameManager.getResourceSystem();
        const achievementSystem = this.gameManager.getAchievementSystem();
        const eventSystem = this.gameManager.getEventSystem();
        
        // 收集资源数据
        const resourceData = {
            timestamp: timestamp,
            money: resourceSystem.getResource('money'),
            reputation: resourceSystem.getResource('reputation'),
            satisfaction: resourceSystem.getResource('satisfaction'),
            productivity: resourceSystem.getResource('productivity'),
            income: resourceSystem.calculateIncome(),
            expenses: resourceSystem.expenses
        };
        
        this.historicalData.resources.push(resourceData);
        
        // 收集员工数据
        const employeeData = {
            timestamp: timestamp,
            count: this.game.employees.length,
            complainingCount: this.game.employees.filter(emp => emp.complaint).length,
            averageMood: this.calculateAverageMood(),
            averageEnergy: this.calculateAverageEnergy(),
            averageStress: this.calculateAverageStress()
        };
        
        this.historicalData.employees.push(employeeData);
        
        // 收集抱怨统计
        const complaintData = {
            timestamp: timestamp,
            totalComplaints: Array.from(this.game.complaintStats.values()).reduce((sum, count) => sum + count, 0),
            complaintsByCategory: Object.fromEntries(this.game.complaintStats)
        };
        
        this.historicalData.complaints.push(complaintData);
        
        // 收集性能指标
        const performanceData = {
            timestamp: timestamp,
            efficiency: this.calculateEfficiency(),
            growthRate: this.calculateGrowthRate(),
            retentionRate: this.calculateRetentionRate(),
            profitability: this.calculateProfitability()
        };
        
        this.historicalData.performance.push(performanceData);
        
        // 更新实时统计
        this.updateCurrentStats(resourceData, employeeData);
        
        // 限制历史数据大小
        this.trimHistoricalData();
        
        // 更新趋势分析
        this.updateTrendAnalysis();
        
        // 检测异常
        this.detectAnomalies();
        
        // 生成建议
        this.generateSuggestions();
    }

    // 计算员工平均心情
    calculateAverageMood() {
        if (this.game.employees.length === 0) return 0;
        const totalMood = this.game.employees.reduce((sum, emp) => sum + (emp.mood || 50), 0);
        return totalMood / this.game.employees.length;
    }

    // 计算员工平均精力
    calculateAverageEnergy() {
        if (this.game.employees.length === 0) return 0;
        const totalEnergy = this.game.employees.reduce((sum, emp) => sum + (emp.energy || 50), 0);
        return totalEnergy / this.game.employees.length;
    }

    // 计算员工平均压力
    calculateAverageStress() {
        if (this.game.employees.length === 0) return 0;
        const totalStress = this.game.employees.reduce((sum, emp) => sum + (emp.stress || 50), 0);
        return totalStress / this.game.employees.length;
    }

    // 计算效率指标
    calculateEfficiency() {
        const resourceSystem = this.gameManager.getResourceSystem();
        const satisfaction = resourceSystem.getResource('satisfaction');
        const productivity = resourceSystem.getResource('productivity');
        const employeeCount = this.game.employees.length;
        
        if (employeeCount === 0) return 0;
        
        // 效率 = (满意度 + 生产力) / 2 * 员工利用率
        const employeeUtilization = Math.min(1, employeeCount / 20); // 假设20人为满员
        return ((satisfaction + productivity) / 2) * employeeUtilization;
    }

    // 计算增长率
    calculateGrowthRate() {
        const recentData = this.historicalData.employees.slice(-10); // 最近10个数据点
        if (recentData.length < 2) return 0;
        
        const oldCount = recentData[0].count;
        const newCount = recentData[recentData.length - 1].count;
        
        if (oldCount === 0) return newCount > 0 ? 100 : 0;
        return ((newCount - oldCount) / oldCount) * 100;
    }

    // 计算留存率
    calculateRetentionRate() {
        // 简化计算：基于员工满意度和抱怨数量
        const resourceSystem = this.gameManager.getResourceSystem();
        const satisfaction = resourceSystem.getResource('satisfaction');
        const complainingEmployees = this.game.employees.filter(emp => emp.complaint).length;
        const totalEmployees = this.game.employees.length;
        
        if (totalEmployees === 0) return 100;
        
        const complaintRate = (complainingEmployees / totalEmployees) * 100;
        return Math.max(0, satisfaction - complaintRate);
    }

    // 计算盈利能力
    calculateProfitability() {
        const resourceSystem = this.gameManager.getResourceSystem();
        const income = resourceSystem.calculateIncome();
        const expenses = resourceSystem.expenses;
        
        if (expenses === 0) return income > 0 ? 100 : 0;
        return ((income - expenses) / expenses) * 100;
    }

    // 更新实时统计
    updateCurrentStats(resourceData, employeeData) {
        this.currentStats.totalPlayTime = this.game.gameTime;
        
        // 更新峰值记录
        this.currentStats.peakEmployeeCount = Math.max(this.currentStats.peakEmployeeCount, employeeData.count);
        this.currentStats.peakMoney = Math.max(this.currentStats.peakMoney, resourceData.money);
        this.currentStats.peakSatisfaction = Math.max(this.currentStats.peakSatisfaction, resourceData.satisfaction);
        this.currentStats.peakProductivity = Math.max(this.currentStats.peakProductivity, resourceData.productivity);
        this.currentStats.peakReputation = Math.max(this.currentStats.peakReputation, resourceData.reputation);
        
        // 计算平均值
        const resourceHistory = this.historicalData.resources;
        if (resourceHistory.length > 0) {
            this.currentStats.averageSatisfaction = resourceHistory.reduce((sum, data) => sum + data.satisfaction, 0) / resourceHistory.length;
            this.currentStats.averageProductivity = resourceHistory.reduce((sum, data) => sum + data.productivity, 0) / resourceHistory.length;
        }
        
        // 更新累计统计
        const achievementSystem = this.gameManager.getAchievementSystem();
        const eventSystem = this.gameManager.getEventSystem();
        
        this.currentStats.totalAchievementsUnlocked = achievementSystem.unlockedAchievements.size;
        this.currentStats.totalEventsTriggered = eventSystem.events.size;
        this.currentStats.totalComplaintsResolved = Array.from(this.game.complaintStats.values()).reduce((sum, count) => sum + count, 0);
    }

    // 限制历史数据大小
    trimHistoricalData() {
        Object.keys(this.historicalData).forEach(key => {
            const data = this.historicalData[key];
            if (data.length > this.maxDataPoints) {
                this.historicalData[key] = data.slice(-this.maxDataPoints);
            }
        });
    }

    // 更新趋势分析
    updateTrendAnalysis() {
        const metrics = ['satisfaction', 'productivity', 'reputation', 'money'];
        
        metrics.forEach(metric => {
            const trend = this.calculateTrend(metric);
            this.trends[metric] = trend;
        });
        
        // 员工数量趋势
        this.trends.employees = this.calculateEmployeeTrend();
    }

    // 计算单个指标的趋势
    calculateTrend(metric) {
        const data = this.historicalData.resources.slice(-20); // 最近20个数据点
        if (data.length < 5) {
            return { direction: 'stable', strength: 0, prediction: 0 };
        }
        
        const values = data.map(d => d[metric]);
        const trend = this.linearRegression(values);
        
        let direction = 'stable';
        let strength = Math.abs(trend.slope);
        
        if (trend.slope > 0.5) {
            direction = 'increasing';
        } else if (trend.slope < -0.5) {
            direction = 'decreasing';
        }
        
        // 预测下一个值
        const prediction = trend.intercept + trend.slope * values.length;
        
        return {
            direction: direction,
            strength: Math.min(100, strength * 10), // 标准化强度
            prediction: Math.max(0, prediction)
        };
    }

    // 计算员工数量趋势
    calculateEmployeeTrend() {
        const data = this.historicalData.employees.slice(-20);
        if (data.length < 5) {
            return { direction: 'stable', strength: 0, prediction: 0 };
        }
        
        const values = data.map(d => d.count);
        const trend = this.linearRegression(values);
        
        let direction = 'stable';
        if (trend.slope > 0.1) {
            direction = 'increasing';
        } else if (trend.slope < -0.1) {
            direction = 'decreasing';
        }
        
        return {
            direction: direction,
            strength: Math.min(100, Math.abs(trend.slope) * 20),
            prediction: Math.max(0, Math.round(trend.intercept + trend.slope * values.length))
        };
    }

    // 线性回归计算
    linearRegression(values) {
        const n = values.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = values;
        
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return { slope, intercept };
    }

    // 异常检测
    detectAnomalies() {
        const currentTime = Date.now();
        const recentData = this.historicalData.resources.slice(-5); // 最近5个数据点
        
        if (recentData.length < 2) return;
        
        const latest = recentData[recentData.length - 1];
        const previous = recentData[recentData.length - 2];
        
        // 检测满意度急剧下降
        if (previous.satisfaction - latest.satisfaction > this.anomalyThresholds.satisfactionDrop) {
            this.addAlert({
                type: 'satisfaction_drop',
                severity: 'high',
                message: `员工满意度急剧下降 ${(previous.satisfaction - latest.satisfaction).toFixed(1)}%`,
                timestamp: currentTime,
                data: { previous: previous.satisfaction, current: latest.satisfaction }
            });
        }
        
        // 检测生产力下降
        if (previous.productivity - latest.productivity > this.anomalyThresholds.productivityDrop) {
            this.addAlert({
                type: 'productivity_drop',
                severity: 'medium',
                message: `生产力显著下降 ${(previous.productivity - latest.productivity).toFixed(1)}%`,
                timestamp: currentTime,
                data: { previous: previous.productivity, current: latest.productivity }
            });
        }
        
        // 检测声望下降
        if (previous.reputation - latest.reputation > this.anomalyThresholds.reputationDrop) {
            this.addAlert({
                type: 'reputation_drop',
                severity: 'medium',
                message: `公司声望下降 ${(previous.reputation - latest.reputation).toFixed(1)}%`,
                timestamp: currentTime,
                data: { previous: previous.reputation, current: latest.reputation }
            });
        }
        
        // 检测资金大幅损失
        if (previous.money - latest.money > this.anomalyThresholds.moneyLoss) {
            this.addAlert({
                type: 'money_loss',
                severity: 'high',
                message: `资金大幅减少 ${(previous.money - latest.money).toLocaleString()}元`,
                timestamp: currentTime,
                data: { previous: previous.money, current: latest.money }
            });
        }
        
        // 检测抱怨激增
        const recentComplaints = this.historicalData.complaints.slice(-3);
        if (recentComplaints.length >= 2) {
            const latestComplaints = recentComplaints[recentComplaints.length - 1].totalComplaints;
            const previousComplaints = recentComplaints[recentComplaints.length - 2].totalComplaints;
            
            if (latestComplaints - previousComplaints > this.anomalyThresholds.complaintSpike) {
                this.addAlert({
                    type: 'complaint_spike',
                    severity: 'medium',
                    message: `员工抱怨数量激增 +${latestComplaints - previousComplaints}`,
                    timestamp: currentTime,
                    data: { previous: previousComplaints, current: latestComplaints }
                });
            }
        }
    }

    // 添加预警
    addAlert(alert) {
        this.alerts.push(alert);
        this.alertHistory.push(alert);
        
        console.warn(`⚠️ 系统预警: ${alert.message}`);
        
        // 通知UI
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(`⚠️ ${alert.message}`, 'alert');
        }
        
        // 限制活跃预警数量
        if (this.alerts.length > 10) {
            this.alerts = this.alerts.slice(-10);
        }
        
        // 限制历史预警数量
        if (this.alertHistory.length > 100) {
            this.alertHistory = this.alertHistory.slice(-100);
        }
    }

    // 生成智能建议
    generateSuggestions() {
        const currentTime = Date.now();
        
        // 检查冷却时间
        if (currentTime - this.lastSuggestionTime < this.suggestionCooldown * 1000) {
            return;
        }
        
        const resourceSystem = this.gameManager.getResourceSystem();
        const achievementSystem = this.gameManager.getAchievementSystem();
        const progressionSystem = this.gameManager.getProgressionSystem();
        const newSuggestions = [];
        
        // 获取当前状态
        const satisfaction = resourceSystem.getResource('satisfaction');
        const productivity = resourceSystem.getResource('productivity');
        const reputation = resourceSystem.getResource('reputation');
        const money = resourceSystem.getResource('money');
        const employeeCount = this.game.employees.length;
        const complainingEmployees = this.game.employees.filter(emp => emp.complaint).length;
        const complaintRate = employeeCount > 0 ? (complainingEmployees / employeeCount) * 100 : 0;
        
        // 高级建议生成逻辑
        
        // 1. 紧急情况建议（最高优先级）
        if (satisfaction < 30 && complaintRate > 50) {
            newSuggestions.push({
                type: 'emergency',
                priority: 'critical',
                title: '紧急：员工危机',
                description: '员工满意度极低且抱怨激增，公司面临严重危机',
                actions: ['立即激活所有可用的员工福利插件', '紧急召开员工大会', '暂停所有非必要支出'],
                impact: '防止大规模员工离职，挽救公司声誉',
                urgency: 'immediate',
                estimatedCost: 15000,
                expectedBenefit: '满意度+30, 声望+10'
            });
        }
        
        if (money < 5000 && resourceSystem.calculateIncome() < resourceSystem.expenses) {
            newSuggestions.push({
                type: 'emergency',
                priority: 'critical',
                title: '紧急：财务危机',
                description: '资金严重不足且收支失衡，公司面临破产风险',
                actions: ['立即减少员工数量', '停用所有付费插件', '寻找紧急融资'],
                impact: '避免破产，维持基本运营',
                urgency: 'immediate',
                estimatedCost: 0,
                expectedBenefit: '延长生存时间'
            });
        }
        
        // 2. 基于数据分析的智能建议
        const recentData = this.historicalData.resources.slice(-10);
        if (recentData.length >= 5) {
            const avgSatisfaction = recentData.reduce((sum, d) => sum + d.satisfaction, 0) / recentData.length;
            const avgProductivity = recentData.reduce((sum, d) => sum + d.productivity, 0) / recentData.length;
            
            // 满意度波动分析
            const satisfactionVariance = this.calculateVariance(recentData.map(d => d.satisfaction));
            if (satisfactionVariance > 100) {
                newSuggestions.push({
                    type: 'stability',
                    priority: 'high',
                    title: '员工满意度波动过大',
                    description: '员工满意度变化不稳定，建议采取措施稳定员工情绪',
                    actions: ['建立定期员工沟通机制', '实施稳定的福利政策', '改善工作环境一致性'],
                    impact: '减少满意度波动，提升员工稳定性',
                    estimatedCost: 8000,
                    expectedBenefit: '满意度稳定性+50%'
                });
            }
        }
        
        // 3. 基于成就系统的建议
        const achievementSummary = achievementSystem.getAchievementSummary();
        const nextAchievements = achievementSummary.nextAchievements;
        
        if (nextAchievements && nextAchievements.length > 0) {
            const closestAchievement = nextAchievements[0];
            if (closestAchievement.progress > 70) {
                newSuggestions.push({
                    type: 'achievement',
                    priority: 'medium',
                    title: `即将解锁成就：${closestAchievement.name}`,
                    description: `距离解锁"${closestAchievement.name}"仅差一步，建议优先完成`,
                    actions: this.getAchievementCompletionActions(closestAchievement),
                    impact: `解锁成就奖励：${this.formatAchievementReward(closestAchievement.reward)}`,
                    progress: closestAchievement.progress,
                    estimatedCost: 2000
                });
            }
        }
        
        // 4. 基于进展系统的建议
        const progressSummary = progressionSystem.getProgressSummary();
        const levelProgress = progressSummary.levelProgress;
        
        if (levelProgress > 80) {
            const nextLevelPreview = progressionSystem.getLevelUnlockPreview();
            newSuggestions.push({
                type: 'progression',
                priority: 'medium',
                title: '即将升级',
                description: `距离等级${progressSummary.level + 1}仅需${nextLevelPreview.experienceNeeded}经验`,
                actions: ['完成更多成就获得经验', '优化运营效率', '扩大员工规模'],
                impact: `解锁新功能：${nextLevelPreview.unlockDetails.map(u => u.name).join(', ')}`,
                estimatedTime: nextLevelPreview.estimatedTime,
                expectedBenefit: `等级+1, 解锁${nextLevelPreview.unlockDetails.length}项新功能`
            });
        }
        
        // 5. 基于员工个性化数据的建议
        if (this.game.personalitySystem) {
            const personalityInsights = this.analyzeEmployeePersonalities();
            if (personalityInsights.suggestions.length > 0) {
                newSuggestions.push(...personalityInsights.suggestions);
            }
        }
        
        // 6. 基于趋势预测的建议
        Object.entries(this.trends).forEach(([metric, trend]) => {
            if (trend.direction === 'decreasing' && trend.strength > 40) {
                const trendSuggestion = this.generateTrendBasedSuggestion(metric, trend);
                if (trendSuggestion) {
                    newSuggestions.push(trendSuggestion);
                }
            }
        });
        
        // 7. 基于竞争分析的建议（模拟）
        const competitiveAnalysis = this.performCompetitiveAnalysis();
        if (competitiveAnalysis.suggestions.length > 0) {
            newSuggestions.push(...competitiveAnalysis.suggestions);
        }
        
        // 8. 季节性和时间相关建议
        const timeBasedSuggestions = this.generateTimeBasedSuggestions();
        if (timeBasedSuggestions.length > 0) {
            newSuggestions.push(...timeBasedSuggestions);
        }
        
        // 按优先级排序建议
        newSuggestions.sort((a, b) => {
            const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        });
        
        // 限制建议数量，保留最重要的
        const maxSuggestions = 8;
        const finalSuggestions = newSuggestions.slice(0, maxSuggestions);
        
        // 更新建议列表
        if (finalSuggestions.length > 0) {
            this.suggestions = finalSuggestions;
            this.lastSuggestionTime = currentTime;
            
            console.log(`💡 生成 ${finalSuggestions.length} 条智能建议`);
            
            // 分类通知
            const criticalCount = finalSuggestions.filter(s => s.priority === 'critical').length;
            const highCount = finalSuggestions.filter(s => s.priority === 'high').length;
            
            let notificationMessage = `💡 系统生成了 ${finalSuggestions.length} 条改进建议`;
            if (criticalCount > 0) {
                notificationMessage = `🚨 发现 ${criticalCount} 个紧急问题需要立即处理！`;
            } else if (highCount > 0) {
                notificationMessage = `⚠️ 发现 ${highCount} 个重要问题需要关注`;
            }
            
            // 通知UI
            if (typeof window !== 'undefined' && window.showNotification) {
                window.showNotification(notificationMessage, criticalCount > 0 ? 'critical' : 'suggestion');
            }
        }
    }

    // 计算方差
    calculateVariance(values) {
        if (values.length === 0) return 0;
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    }

    // 获取成就完成建议
    getAchievementCompletionActions(achievement) {
        const actions = [];
        
        // 根据成就类型提供具体建议
        if (achievement.id.includes('employee')) {
            actions.push('招聘更多员工', '提升员工满意度以减少离职');
        } else if (achievement.id.includes('money') || achievement.id.includes('profit')) {
            actions.push('优化收入结构', '控制不必要支出', '提升员工生产力');
        } else if (achievement.id.includes('satisfaction')) {
            actions.push('激活员工福利插件', '改善办公环境', '处理员工抱怨');
        } else if (achievement.id.includes('time')) {
            actions.push('保持游戏运行', '优化自动化流程');
        } else {
            actions.push('查看成就详情', '按照成就要求执行');
        }
        
        return actions;
    }

    // 格式化成就奖励
    formatAchievementReward(reward) {
        if (!reward) return '未知奖励';
        
        const parts = [];
        if (reward.money) parts.push(`${reward.money}元`);
        if (reward.reputation) parts.push(`${reward.reputation}声望`);
        if (reward.satisfaction) parts.push(`${reward.satisfaction}满意度`);
        if (reward.productivity) parts.push(`${reward.productivity}生产力`);
        
        return parts.join(', ') || '特殊奖励';
    }

    // 分析员工个性化数据
    analyzeEmployeePersonalities() {
        const suggestions = [];
        
        if (!this.game.employees || this.game.employees.length === 0) {
            return { suggestions };
        }
        
        // 分析员工个性分布
        const personalityStats = {
            highStress: 0,
            lowMood: 0,
            lowEnergy: 0,
            introvertCount: 0,
            extrovertCount: 0
        };
        
        this.game.employees.forEach(emp => {
            if (emp.stress > 70) personalityStats.highStress++;
            if (emp.mood < 30) personalityStats.lowMood++;
            if (emp.energy < 30) personalityStats.lowEnergy++;
            if (emp.personality) {
                if (emp.personality.extroversion < 40) personalityStats.introvertCount++;
                if (emp.personality.extroversion > 60) personalityStats.extrovertCount++;
            }
        });
        
        const totalEmployees = this.game.employees.length;
        
        // 基于个性分析生成建议
        if (personalityStats.highStress / totalEmployees > 0.3) {
            suggestions.push({
                type: 'personality',
                priority: 'high',
                title: '员工压力过高',
                description: `${Math.round(personalityStats.highStress / totalEmployees * 100)}%的员工处于高压力状态`,
                actions: ['实施压力管理计划', '增加休息时间', '改善工作环境'],
                impact: '降低员工压力，提升工作效率',
                estimatedCost: 5000,
                expectedBenefit: '压力-20, 满意度+15'
            });
        }
        
        if (personalityStats.introvertCount > personalityStats.extrovertCount * 2) {
            suggestions.push({
                type: 'personality',
                priority: 'medium',
                title: '团队偏向内向',
                description: '团队中内向员工较多，建议调整管理方式',
                actions: ['提供安静的工作环境', '减少强制性团队活动', '采用书面沟通'],
                impact: '更好地适应内向员工需求',
                estimatedCost: 3000,
                expectedBenefit: '内向员工满意度+20'
            });
        }
        
        return { suggestions };
    }

    // 基于趋势生成建议
    generateTrendBasedSuggestion(metric, trend) {
        const metricNames = {
            satisfaction: '员工满意度',
            productivity: '生产力',
            reputation: '公司声望',
            money: '资金状况',
            employees: '员工规模'
        };
        
        const metricName = metricNames[metric];
        if (!metricName) return null;
        
        const suggestion = {
            type: 'trend',
            priority: trend.strength > 60 ? 'high' : 'medium',
            title: `${metricName}持续下降`,
            description: `${metricName}呈现持续下降趋势，强度${Math.round(trend.strength)}%`,
            impact: `阻止${metricName}进一步恶化`
        };
        
        // 根据不同指标提供具体建议
        switch (metric) {
            case 'satisfaction':
                suggestion.actions = ['调查员工不满原因', '激活员工福利插件', '改善办公环境'];
                suggestion.estimatedCost = 8000;
                suggestion.expectedBenefit = '满意度+25';
                break;
            case 'productivity':
                suggestion.actions = ['升级办公设备', '提供员工培训', '优化工作流程'];
                suggestion.estimatedCost = 10000;
                suggestion.expectedBenefit = '生产力+20';
                break;
            case 'reputation':
                suggestion.actions = ['改善客户服务', '提升产品质量', '加强品牌建设'];
                suggestion.estimatedCost = 12000;
                suggestion.expectedBenefit = '声望+15';
                break;
            case 'money':
                suggestion.actions = ['控制支出', '提升收入效率', '寻找新收入来源'];
                suggestion.estimatedCost = 5000;
                suggestion.expectedBenefit = '改善现金流';
                break;
            default:
                suggestion.actions = ['分析下降原因', '制定改进计划'];
                suggestion.estimatedCost = 3000;
        }
        
        return suggestion;
    }

    // 竞争分析（模拟）
    performCompetitiveAnalysis() {
        const suggestions = [];
        const resourceSystem = this.gameManager.getResourceSystem();
        
        // 模拟行业基准
        const industryBenchmarks = {
            satisfaction: 75,
            productivity: 70,
            reputation: 65,
            employeeRetention: 85
        };
        
        const currentMetrics = {
            satisfaction: resourceSystem.getResource('satisfaction'),
            productivity: resourceSystem.getResource('productivity'),
            reputation: resourceSystem.getResource('reputation'),
            employeeRetention: this.calculateRetentionRate()
        };
        
        // 与行业基准比较
        Object.entries(industryBenchmarks).forEach(([metric, benchmark]) => {
            const current = currentMetrics[metric];
            const gap = benchmark - current;
            
            if (gap > 20) {
                suggestions.push({
                    type: 'competitive',
                    priority: 'medium',
                    title: `${metric}低于行业平均`,
                    description: `当前${metric}为${Math.round(current)}%，低于行业平均${benchmark}%`,
                    actions: [`提升${metric}至行业平均水平`, '学习行业最佳实践'],
                    impact: `缩小与竞争对手的差距`,
                    estimatedCost: gap * 200,
                    expectedBenefit: `${metric}+${Math.round(gap)}`
                });
            }
        });
        
        return { suggestions };
    }

    // 时间相关建议
    generateTimeBasedSuggestions() {
        const suggestions = [];
        const gameTime = this.game.gameTime;
        const playTimeMinutes = Math.floor(gameTime / 60);
        
        // 基于游戏时间的建议
        if (playTimeMinutes > 30 && this.game.employees.length < 10) {
            suggestions.push({
                type: 'time_based',
                priority: 'medium',
                title: '扩张时机已到',
                description: '游戏已运行30分钟，是时候扩大团队规模了',
                actions: ['招聘更多员工', '扩展办公空间', '提升管理能力'],
                impact: '加速公司发展，提升竞争力',
                estimatedCost: 15000,
                expectedBenefit: '员工+5-10, 收入+50%'
            });
        }
        
        // 模拟一天中的不同时段建议
        const hour = new Date().getHours();
        if (hour >= 9 && hour <= 17) {
            // 工作时间建议
            if (Math.random() < 0.1) { // 10%概率
                suggestions.push({
                    type: 'time_based',
                    priority: 'low',
                    title: '工作时间优化',
                    description: '当前是工作时间，建议关注员工工作状态',
                    actions: ['检查员工满意度', '处理紧急抱怨', '优化工作流程'],
                    impact: '提升工作时间效率',
                    estimatedCost: 2000,
                    expectedBenefit: '生产力+10'
                });
            }
        }
        
        return suggestions;
    }

    // 执行建议
    executeSuggestion(suggestionIndex) {
        if (!this.suggestions || suggestionIndex >= this.suggestions.length) {
            console.warn('无效的建议索引');
            return false;
        }

        const suggestion = this.suggestions[suggestionIndex];
        const resourceSystem = this.gameManager.getResourceSystem();

        // 检查是否有足够资源执行建议
        if (suggestion.estimatedCost && !resourceSystem.canAfford('money', suggestion.estimatedCost)) {
            console.warn(`资源不足，无法执行建议"${suggestion.title}"`);
            return false;
        }

        // 扣除成本
        if (suggestion.estimatedCost) {
            resourceSystem.spendResource('money', suggestion.estimatedCost);
        }

        // 根据建议类型执行相应操作
        this.applySuggestionEffects(suggestion);

        // 记录建议执行历史
        this.recordSuggestionExecution(suggestion);

        // 从当前建议列表中移除已执行的建议
        this.suggestions.splice(suggestionIndex, 1);

        console.log(`✅ 已执行建议: ${suggestion.title}`);
        
        // 通知UI
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(`✅ 已执行建议: ${suggestion.title}`, 'suggestion_executed');
        }

        return true;
    }

    // 应用建议效果
    applySuggestionEffects(suggestion) {
        const resourceSystem = this.gameManager.getResourceSystem();

        // 根据建议类型应用不同效果
        switch (suggestion.type) {
            case 'satisfaction':
                resourceSystem.addResource('satisfaction', 15);
                break;
            case 'productivity':
                resourceSystem.addResource('productivity', 12);
                break;
            case 'financial':
                // 财务建议通常是节约成本，增加收入效率
                resourceSystem.income *= 1.1;
                break;
            case 'emergency':
                // 紧急建议有更大的效果
                if (suggestion.title.includes('员工危机')) {
                    resourceSystem.addResource('satisfaction', 25);
                    resourceSystem.addResource('reputation', 10);
                }
                break;
            case 'trend':
                // 趋势建议根据具体指标应用效果
                if (suggestion.title.includes('满意度')) {
                    resourceSystem.addResource('satisfaction', 20);
                } else if (suggestion.title.includes('生产力')) {
                    resourceSystem.addResource('productivity', 18);
                } else if (suggestion.title.includes('声望')) {
                    resourceSystem.addResource('reputation', 15);
                }
                break;
            case 'personality':
                // 个性化建议主要影响员工状态
                this.game.employees.forEach(emp => {
                    if (emp.stress > 50) emp.stress = Math.max(30, emp.stress - 20);
                    if (emp.mood < 50) emp.mood = Math.min(80, emp.mood + 15);
                });
                break;
            case 'competitive':
                // 竞争建议提升多项指标
                resourceSystem.addResource('satisfaction', 10);
                resourceSystem.addResource('productivity', 10);
                resourceSystem.addResource('reputation', 8);
                break;
            default:
                // 默认效果
                resourceSystem.addResource('satisfaction', 8);
                resourceSystem.addResource('productivity', 5);
        }
    }

    // 记录建议执行历史
    recordSuggestionExecution(suggestion) {
        if (!this.suggestionHistory) {
            this.suggestionHistory = [];
        }

        this.suggestionHistory.push({
            ...suggestion,
            executedAt: Date.now(),
            gameTime: this.game.gameTime
        });

        // 限制历史记录数量
        if (this.suggestionHistory.length > 50) {
            this.suggestionHistory = this.suggestionHistory.slice(-50);
        }
    }

    // 获取建议执行统计
    getSuggestionExecutionStats() {
        if (!this.suggestionHistory) return null;

        const stats = {
            totalExecuted: this.suggestionHistory.length,
            byType: {},
            byPriority: {},
            totalCostSpent: 0,
            averageExecutionTime: 0
        };

        this.suggestionHistory.forEach(suggestion => {
            // 按类型统计
            stats.byType[suggestion.type] = (stats.byType[suggestion.type] || 0) + 1;
            
            // 按优先级统计
            stats.byPriority[suggestion.priority] = (stats.byPriority[suggestion.priority] || 0) + 1;
            
            // 总成本
            if (suggestion.estimatedCost) {
                stats.totalCostSpent += suggestion.estimatedCost;
            }
        });

        return stats;
    }

    // 自动建议系统
    enableAutoSuggestions(enabled = true) {
        this.autoSuggestionsEnabled = enabled;
        
        if (enabled) {
            console.log('🤖 自动建议系统已启用');
            // 通知UI
            if (typeof window !== 'undefined' && window.showNotification) {
                window.showNotification('🤖 自动建议系统已启用', 'system');
            }
        } else {
            console.log('🤖 自动建议系统已禁用');
        }
    }

    // 自动执行高优先级建议
    processAutoSuggestions() {
        if (!this.autoSuggestionsEnabled || !this.suggestions) return;

        const resourceSystem = this.gameManager.getResourceSystem();
        const currentMoney = resourceSystem.getResource('money');

        // 只自动执行关键优先级的建议，且成本不超过当前资金的10%
        const autoExecutableThreshold = currentMoney * 0.1;

        this.suggestions.forEach((suggestion, index) => {
            if (suggestion.priority === 'critical' && 
                (!suggestion.estimatedCost || suggestion.estimatedCost <= autoExecutableThreshold)) {
                
                console.log(`🤖 自动执行关键建议: ${suggestion.title}`);
                this.executeSuggestion(index);
            }
        });
    }

    // 建议效果预测
    predictSuggestionImpact(suggestion) {
        const prediction = {
            resourceChanges: {},
            riskLevel: 'low',
            successProbability: 85,
            timeToEffect: '立即',
            sideEffects: []
        };

        // 根据建议类型预测影响
        switch (suggestion.type) {
            case 'satisfaction':
                prediction.resourceChanges.satisfaction = '+10-20';
                prediction.resourceChanges.productivity = '+5-10';
                prediction.successProbability = 90;
                break;
            case 'financial':
                prediction.resourceChanges.money = suggestion.estimatedCost ? `-${suggestion.estimatedCost}` : '0';
                prediction.resourceChanges.income = '+10-15%';
                prediction.riskLevel = 'medium';
                prediction.timeToEffect = '1-2分钟后见效';
                break;
            case 'emergency':
                prediction.resourceChanges.satisfaction = '+20-30';
                prediction.resourceChanges.reputation = '+5-15';
                prediction.successProbability = 95;
                prediction.riskLevel = 'high';
                prediction.sideEffects = ['短期内资金压力增大'];
                break;
            case 'trend':
                prediction.resourceChanges[suggestion.title.includes('满意度') ? 'satisfaction' : 'productivity'] = '+15-25';
                prediction.timeToEffect = '持续效果';
                prediction.successProbability = 80;
                break;
        }

        return prediction;
    }

    // 建议推荐引擎
    getRecommendedSuggestions(maxCount = 3) {
        if (!this.suggestions || this.suggestions.length === 0) {
            return [];
        }

        // 评分系统：优先级 + 成本效益 + 紧急程度
        const scoredSuggestions = this.suggestions.map(suggestion => {
            let score = 0;

            // 优先级评分
            const priorityScores = { 'critical': 100, 'high': 75, 'medium': 50, 'low': 25 };
            score += priorityScores[suggestion.priority] || 0;

            // 成本效益评分
            if (suggestion.estimatedCost && suggestion.expectedBenefit) {
                const costBenefitRatio = suggestion.estimatedCost / 1000; // 简化计算
                score += Math.max(0, 50 - costBenefitRatio);
            }

            // 紧急程度评分
            if (suggestion.urgency === 'immediate') {
                score += 50;
            }

            // 类型权重
            const typeWeights = {
                'emergency': 30,
                'satisfaction': 20,
                'financial': 15,
                'productivity': 15,
                'trend': 10
            };
            score += typeWeights[suggestion.type] || 5;

            return { ...suggestion, score };
        });

        // 按评分排序并返回前N个
        return scoredSuggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, maxCount);
    }

    // 获取统计摘要
    getStatisticsSummary() {
        const resourceSystem = this.gameManager.getResourceSystem();
        const recentData = this.historicalData.resources.slice(-10);
        
        return {
            // 当前状态
            current: {
                money: resourceSystem.getResource('money'),
                reputation: resourceSystem.getResource('reputation'),
                satisfaction: resourceSystem.getResource('satisfaction'),
                productivity: resourceSystem.getResource('productivity'),
                employees: this.game.employees.length,
                complaints: this.game.employees.filter(emp => emp.complaint).length
            },
            
            // 历史峰值
            peaks: {
                money: this.currentStats.peakMoney,
                reputation: this.currentStats.peakReputation,
                satisfaction: this.currentStats.peakSatisfaction,
                productivity: this.currentStats.peakProductivity,
                employees: this.currentStats.peakEmployeeCount
            },
            
            // 平均值
            averages: {
                satisfaction: this.currentStats.averageSatisfaction,
                productivity: this.currentStats.averageProductivity
            },
            
            // 趋势
            trends: this.trends,
            
            // 性能指标
            performance: {
                efficiency: this.calculateEfficiency(),
                growthRate: this.calculateGrowthRate(),
                retentionRate: this.calculateRetentionRate(),
                profitability: this.calculateProfitability()
            },
            
            // 累计统计
            totals: this.currentStats,
            
            // 预警和建议
            alerts: this.alerts,
            suggestions: this.suggestions,
            
            // 数据收集状态
            dataPoints: {
                resources: this.historicalData.resources.length,
                employees: this.historicalData.employees.length,
                complaints: this.historicalData.complaints.length,
                performance: this.historicalData.performance.length
            }
        };
    }

    // 获取历史数据
    getHistoricalData(type, timeRange = null) {
        if (!this.historicalData[type]) {
            return [];
        }
        
        let data = this.historicalData[type];
        
        // 应用时间范围过滤
        if (timeRange) {
            const cutoffTime = Date.now() - timeRange;
            data = data.filter(item => item.timestamp >= cutoffTime);
        }
        
        return data;
    }

    // 获取趋势预测
    getTrendPrediction(metric, periods = 5) {
        const trend = this.trends[metric];
        if (!trend) return [];
        
        const predictions = [];
        const currentValue = this.getCurrentValue(metric);
        
        for (let i = 1; i <= periods; i++) {
            let predictedValue;
            
            if (trend.direction === 'increasing') {
                predictedValue = currentValue + (trend.strength * i * 0.1);
            } else if (trend.direction === 'decreasing') {
                predictedValue = currentValue - (trend.strength * i * 0.1);
            } else {
                predictedValue = currentValue + (Math.random() - 0.5) * 2; // 随机波动
            }
            
            predictions.push({
                period: i,
                value: Math.max(0, predictedValue),
                confidence: Math.max(0, 100 - (i * 15)) // 置信度随时间递减
            });
        }
        
        return predictions;
    }

    // 获取当前指标值
    getCurrentValue(metric) {
        const resourceSystem = this.gameManager.getResourceSystem();
        
        switch (metric) {
            case 'satisfaction':
                return resourceSystem.getResource('satisfaction');
            case 'productivity':
                return resourceSystem.getResource('productivity');
            case 'reputation':
                return resourceSystem.getResource('reputation');
            case 'money':
                return resourceSystem.getResource('money');
            case 'employees':
                return this.game.employees.length;
            default:
                return 0;
        }
    }

    // 导出数据
    exportData(format = 'json') {
        const exportData = {
            timestamp: Date.now(),
            gameTime: this.game.gameTime,
            statistics: this.getStatisticsSummary(),
            historicalData: this.historicalData,
            trends: this.trends,
            alerts: this.alertHistory
        };
        
        if (format === 'json') {
            return JSON.stringify(exportData, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(exportData);
        }
        
        return exportData;
    }

    // 转换为CSV格式
    convertToCSV(data) {
        const resourceData = data.historicalData.resources;
        if (resourceData.length === 0) return '';
        
        const headers = ['timestamp', 'money', 'reputation', 'satisfaction', 'productivity', 'income', 'expenses'];
        const csvRows = [headers.join(',')];
        
        resourceData.forEach(row => {
            const values = headers.map(header => row[header] || 0);
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }

    // 清除历史数据
    clearHistoricalData(olderThan = null) {
        if (olderThan) {
            const cutoffTime = Date.now() - olderThan;
            Object.keys(this.historicalData).forEach(key => {
                this.historicalData[key] = this.historicalData[key].filter(item => item.timestamp >= cutoffTime);
            });
        } else {
            // 清除所有历史数据
            Object.keys(this.historicalData).forEach(key => {
                this.historicalData[key] = [];
            });
        }
        
        console.log('🗑️ 历史数据已清理');
    }

    // 系统更新
    update(deltaTime) {
        this.dataCollectionTimer++;
        
        // 定期收集数据
        if (this.dataCollectionTimer >= this.dataCollectionInterval) {
            this.collectData();
            this.dataCollectionTimer = 0;
        }
        
        // 处理自动建议（每5分钟检查一次）
        if (Math.floor(this.game.gameTime) % 300 === 0) {
            this.processAutoSuggestions();
        }
        
        // 清理过期预警
        const currentTime = Date.now();
        this.alerts = this.alerts.filter(alert => currentTime - alert.timestamp < 300000); // 5分钟后清理
    }

    // 序列化数据
    serialize() {
        return {
            historicalData: this.historicalData,
            currentStats: this.currentStats,
            trends: this.trends,
            suggestions: this.suggestions,
            alertHistory: this.alertHistory.slice(-50), // 只保存最近50条预警历史
            lastSuggestionTime: this.lastSuggestionTime,
            suggestionHistory: this.suggestionHistory ? this.suggestionHistory.slice(-50) : [],
            autoSuggestionsEnabled: this.autoSuggestionsEnabled || false
        };
    }

    // 反序列化数据
    deserialize(data) {
        if (data.historicalData) {
            this.historicalData = data.historicalData;
        }
        if (data.currentStats) {
            this.currentStats = { ...this.currentStats, ...data.currentStats };
        }
        if (data.trends) {
            this.trends = data.trends;
        }
        if (data.suggestions) {
            this.suggestions = data.suggestions;
        }
        if (data.alertHistory) {
            this.alertHistory = data.alertHistory;
        }
        if (data.lastSuggestionTime) {
            this.lastSuggestionTime = data.lastSuggestionTime;
        }
        if (data.suggestionHistory) {
            this.suggestionHistory = data.suggestionHistory;
        }
        if (data.autoSuggestionsEnabled !== undefined) {
            this.autoSuggestionsEnabled = data.autoSuggestionsEnabled;
        }
    }
}

// 排行榜和竞争系统
class LeaderboardSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.game = gameManager.game;
        
        // 本地排行榜数据
        this.leaderboards = new Map();
        this.playerScores = new Map();
        this.challenges = new Map();
        this.activeChallenges = new Set();
        
        // 挑战系统
        this.dailyChallenges = [];
        this.weeklyChallenges = [];
        this.specialEvents = [];
        this.limitedTimeEvents = [];
        this.seasonalEvents = [];
        
        // 分享功能
        this.shareHistory = [];
        this.screenshots = [];
        
        // 计时器
        this.updateTimer = 0;
        this.challengeTimer = 0;
        this.dailyResetTimer = 0;
        this.weeklyResetTimer = 0;
        
        // 初始化系统
        this.initializeLeaderboards();
        this.initializeChallenges();
    }

    // 初始化排行榜
    initializeLeaderboards() {
        const leaderboardTypes = [
            {
                id: 'total_score',
                name: '总分排行榜',
                description: '基于综合表现的总分排名',
                icon: '🏆',
                calculateScore: () => this.calculateTotalScore()
            },
            {
                id: 'money_earned',
                name: '财富排行榜',
                description: '累计赚取资金排名',
                icon: '💰',
                calculateScore: () => this.gameManager.getResourceSystem().getResource('money')
            },
            {
                id: 'employee_count',
                name: '规模排行榜',
                description: '员工数量排名',
                icon: '👥',
                calculateScore: () => this.game.employees.length
            },
            {
                id: 'achievements_unlocked',
                name: '成就排行榜',
                description: '解锁成就数量排名',
                icon: '🎯',
                calculateScore: () => this.gameManager.getAchievementSystem().unlockedAchievements.size
            },
            {
                id: 'satisfaction_rating',
                name: '满意度排行榜',
                description: '员工满意度排名',
                icon: '😊',
                calculateScore: () => this.gameManager.getResourceSystem().getResource('satisfaction')
            },
            {
                id: 'efficiency_score',
                name: '效率排行榜',
                description: '管理效率排名',
                icon: '⚡',
                calculateScore: () => this.calculateEfficiencyScore()
            }
        ];

        leaderboardTypes.forEach(type => {
            this.leaderboards.set(type.id, {
                ...type,
                entries: [],
                lastUpdated: Date.now()
            });
        });

        console.log('🏆 排行榜系统初始化完成');
    }

    // 初始化挑战系统
    initializeChallenges() {
        // 每日挑战模板
        const dailyChallengeTemplates = [
            {
                id: 'daily_hire_employees',
                name: '招聘达人',
                description: '今日雇佣3名新员工',
                type: 'daily',
                target: 3,
                reward: { money: 5000, reputation: 10 },
                icon: '👤',
                checkProgress: () => this.getDailyHiredCount()
            },
            {
                id: 'daily_zero_complaints',
                name: '零抱怨办公室',
                description: '保持一小时无员工抱怨',
                type: 'daily',
                target: 3600, // 1小时
                reward: { satisfaction: 15, reputation: 5 },
                icon: '😊',
                checkProgress: () => this.getComplaintFreeTime()
            },
            {
                id: 'daily_high_productivity',
                name: '高效工作日',
                description: '生产力指数达到85%',
                type: 'daily',
                target: 85,
                reward: { money: 3000, productivity: 5 },
                icon: '📈',
                checkProgress: () => this.gameManager.getResourceSystem().getResource('productivity')
            },
            {
                id: 'daily_resource_management',
                name: '资源管理大师',
                description: '同时保持资金>50000，满意度>70，声望>60',
                type: 'daily',
                target: 1,
                reward: { money: 8000, reputation: 15 },
                icon: '💎',
                checkProgress: () => this.checkResourceManagementGoal()
            }
        ];

        // 每周挑战模板
        const weeklyChallengeTemplates = [
            {
                id: 'weekly_achievement_hunter',
                name: '成就猎人',
                description: '本周解锁5个新成就',
                type: 'weekly',
                target: 5,
                reward: { money: 20000, reputation: 25, satisfaction: 20 },
                icon: '🎯',
                checkProgress: () => this.getWeeklyAchievementCount()
            },
            {
                id: 'weekly_expansion',
                name: '企业扩张',
                description: '员工数量达到25人',
                type: 'weekly',
                target: 25,
                reward: { money: 30000, reputation: 30 },
                icon: '🏢',
                checkProgress: () => this.game.employees.length
            },
            {
                id: 'weekly_profit_master',
                name: '利润大师',
                description: '累计赚取100,000元',
                type: 'weekly',
                target: 100000,
                reward: { money: 50000, reputation: 40 },
                icon: '💰',
                checkProgress: () => this.getWeeklyProfitEarned()
            }
        ];

        // 存储挑战模板
        this.dailyChallengeTemplates = dailyChallengeTemplates;
        this.weeklyChallengeTemplates = weeklyChallengeTemplates;

        // 生成初始挑战
        this.generateDailyChallenges();
        this.generateWeeklyChallenges();
        this.initializeSpecialEvents();

        console.log('🎯 挑战系统初始化完成');
    }

    // 记录成绩到排行榜
    recordScore(leaderboardId, playerName = '玩家', score = null) {
        const leaderboard = this.leaderboards.get(leaderboardId);
        if (!leaderboard) {
            console.warn(`未找到排行榜: ${leaderboardId}`);
            return false;
        }

        // 如果没有提供分数，自动计算
        if (score === null) {
            score = leaderboard.calculateScore();
        }

        const entry = {
            playerName,
            score,
            timestamp: Date.now(),
            gameTime: this.game.gameTime,
            additionalData: this.getAdditionalScoreData()
        };

        // 添加到排行榜
        leaderboard.entries.push(entry);

        // 按分数排序（降序）
        leaderboard.entries.sort((a, b) => b.score - a.score);

        // 只保留前100名
        if (leaderboard.entries.length > 100) {
            leaderboard.entries = leaderboard.entries.slice(0, 100);
        }

        leaderboard.lastUpdated = Date.now();

        console.log(`🏆 成绩已记录到 ${leaderboard.name}: ${playerName} - ${score}`);
        return true;
    }

    // 获取排行榜
    getLeaderboard(leaderboardId, limit = 10) {
        const leaderboard = this.leaderboards.get(leaderboardId);
        if (!leaderboard) return null;

        return {
            ...leaderboard,
            entries: leaderboard.entries.slice(0, limit)
        };
    }

    // 获取所有排行榜摘要
    getAllLeaderboards() {
        const leaderboards = [];
        
        for (const [id, leaderboard] of this.leaderboards) {
            leaderboards.push({
                id,
                name: leaderboard.name,
                description: leaderboard.description,
                icon: leaderboard.icon,
                topScore: leaderboard.entries.length > 0 ? leaderboard.entries[0].score : 0,
                entryCount: leaderboard.entries.length,
                lastUpdated: leaderboard.lastUpdated
            });
        }

        return leaderboards;
    }

    // 计算总分
    calculateTotalScore() {
        const resources = this.gameManager.getResourceSystem();
        const achievements = this.gameManager.getAchievementSystem();
        
        let totalScore = 0;
        
        // 资源分数
        totalScore += resources.getResource('money') * 0.01; // 资金权重
        totalScore += resources.getResource('reputation') * 10; // 声望权重
        totalScore += resources.getResource('satisfaction') * 8; // 满意度权重
        totalScore += resources.getResource('productivity') * 6; // 生产力权重
        
        // 员工数量分数
        totalScore += this.game.employees.length * 50;
        
        // 成就分数
        totalScore += achievements.unlockedAchievements.size * 100;
        
        // 游戏时间奖励（鼓励长时间游戏）
        totalScore += Math.min(this.game.gameTime * 0.1, 1000);
        
        return Math.floor(totalScore);
    }

    // 计算效率分数
    calculateEfficiencyScore() {
        const resources = this.gameManager.getResourceSystem();
        const employeeCount = this.game.employees.length;
        
        if (employeeCount === 0) return 0;
        
        // 基于人均效率计算
        const avgSatisfaction = resources.getResource('satisfaction');
        const avgProductivity = resources.getResource('productivity');
        const moneyPerEmployee = resources.getResource('money') / employeeCount;
        
        const efficiencyScore = (avgSatisfaction + avgProductivity) / 2 + Math.min(moneyPerEmployee * 0.01, 50);
        
        return Math.floor(efficiencyScore);
    }

    // 获取附加分数数据
    getAdditionalScoreData() {
        return {
            employeeCount: this.game.employees.length,
            achievementCount: this.gameManager.getAchievementSystem().unlockedAchievements.size,
            gameTime: this.game.gameTime,
            resources: this.gameManager.getResourceSystem().getResourceSummary()
        };
    }

    // 生成每日挑战
    generateDailyChallenges() {
        this.dailyChallenges = [];
        
        // 随机选择3个每日挑战
        const shuffled = [...this.dailyChallengeTemplates].sort(() => Math.random() - 0.5);
        const selectedChallenges = shuffled.slice(0, 3);
        
        selectedChallenges.forEach((template, index) => {
            const challenge = {
                ...template,
                id: `${template.id}_${Date.now()}_${index}`,
                startTime: Date.now(),
                endTime: Date.now() + 24 * 60 * 60 * 1000, // 24小时后过期
                progress: 0,
                completed: false,
                claimed: false
            };
            
            this.dailyChallenges.push(challenge);
            this.challenges.set(challenge.id, challenge);
        });
        
        console.log('📅 每日挑战已生成:', this.dailyChallenges.length);
    }

    // 生成每周挑战
    generateWeeklyChallenges() {
        this.weeklyChallenges = [];
        
        // 随机选择2个每周挑战
        const shuffled = [...this.weeklyChallengeTemplates].sort(() => Math.random() - 0.5);
        const selectedChallenges = shuffled.slice(0, 2);
        
        selectedChallenges.forEach((template, index) => {
            const challenge = {
                ...template,
                id: `${template.id}_${Date.now()}_${index}`,
                startTime: Date.now(),
                endTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天后过期
                progress: 0,
                completed: false,
                claimed: false
            };
            
            this.weeklyChallenges.push(challenge);
            this.challenges.set(challenge.id, challenge);
        });
        
        console.log('📅 每周挑战已生成:', this.weeklyChallenges.length);
    }

    // 初始化特殊事件
    initializeSpecialEvents() {
        // 限时活动模板
        const limitedTimeEventTemplates = [
            {
                id: 'speed_hiring',
                name: '闪电招聘',
                description: '30分钟内雇佣10名员工',
                duration: 30 * 60 * 1000, // 30分钟
                target: 10,
                reward: { money: 25000, reputation: 30, satisfaction: 15 },
                icon: '⚡',
                rarity: 'rare',
                checkProgress: () => this.game.employees.length
            },
            {
                id: 'profit_rush',
                name: '利润冲刺',
                description: '1小时内赚取50,000元',
                duration: 60 * 60 * 1000, // 1小时
                target: 50000,
                reward: { money: 50000, reputation: 40 },
                icon: '💨',
                rarity: 'epic',
                checkProgress: () => this.getEventProfitEarned()
            },
            {
                id: 'satisfaction_surge',
                name: '满意度飙升',
                description: '45分钟内将满意度提升到95%',
                duration: 45 * 60 * 1000, // 45分钟
                target: 95,
                reward: { satisfaction: 20, productivity: 15, reputation: 25 },
                icon: '🚀',
                rarity: 'rare',
                checkProgress: () => this.gameManager.getResourceSystem().getResource('satisfaction')
            },
            {
                id: 'zero_stress_zone',
                name: '零压力区域',
                description: '保持所有员工压力低于20%持续20分钟',
                duration: 20 * 60 * 1000, // 20分钟
                target: 1200, // 20分钟的秒数
                reward: { satisfaction: 25, productivity: 20 },
                icon: '🧘',
                rarity: 'legendary',
                checkProgress: () => this.checkLowStressTime()
            }
        ];

        // 季节性事件模板
        const seasonalEventTemplates = [
            {
                id: 'new_year_resolution',
                name: '新年决心',
                description: '新年期间完成5个成就解锁',
                season: 'winter',
                duration: 7 * 24 * 60 * 60 * 1000, // 7天
                target: 5,
                reward: { money: 100000, reputation: 50, satisfaction: 30 },
                icon: '🎊',
                rarity: 'legendary'
            },
            {
                id: 'spring_cleaning',
                name: '春季大扫除',
                description: '春季期间保持办公室满意度90%以上',
                season: 'spring',
                duration: 5 * 24 * 60 * 60 * 1000, // 5天
                target: 90,
                reward: { satisfaction: 40, productivity: 25, reputation: 30 },
                icon: '🌸',
                rarity: 'epic'
            },
            {
                id: 'summer_productivity',
                name: '夏日生产力',
                description: '夏季期间达到员工数量30人',
                season: 'summer',
                duration: 10 * 24 * 60 * 60 * 1000, // 10天
                target: 30,
                reward: { money: 75000, productivity: 30, reputation: 35 },
                icon: '☀️',
                rarity: 'epic'
            },
            {
                id: 'autumn_harvest',
                name: '秋收时节',
                description: '秋季期间累计赚取500,000元',
                season: 'autumn',
                duration: 14 * 24 * 60 * 60 * 1000, // 14天
                target: 500000,
                reward: { money: 200000, reputation: 60 },
                icon: '🍂',
                rarity: 'legendary'
            }
        ];

        this.limitedTimeEventTemplates = limitedTimeEventTemplates;
        this.seasonalEventTemplates = seasonalEventTemplates;

        // 随机触发一个限时活动（10%概率）
        if (Math.random() < 0.1) {
            this.triggerLimitedTimeEvent();
        }

        console.log('🎪 特殊事件系统初始化完成');
    }

    // 触发限时活动
    triggerLimitedTimeEvent() {
        // 随机选择一个限时活动模板
        const template = this.limitedTimeEventTemplates[
            Math.floor(Math.random() * this.limitedTimeEventTemplates.length)
        ];

        const event = {
            ...template,
            id: `${template.id}_${Date.now()}`,
            startTime: Date.now(),
            endTime: Date.now() + template.duration,
            progress: 0,
            completed: false,
            claimed: false,
            type: 'limited_time'
        };

        this.limitedTimeEvents.push(event);
        this.challenges.set(event.id, event);

        console.log(`🎪 限时活动已触发: ${event.name}`);
        
        // 显示特殊通知
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(`🎪 限时活动开始: ${event.name}`, 'special_event');
        }

        return event;
    }

    // 触发季节性事件
    triggerSeasonalEvent(season) {
        const seasonalTemplates = this.seasonalEventTemplates.filter(t => t.season === season);
        if (seasonalTemplates.length === 0) return null;

        const template = seasonalTemplates[Math.floor(Math.random() * seasonalTemplates.length)];

        const event = {
            ...template,
            id: `${template.id}_${Date.now()}`,
            startTime: Date.now(),
            endTime: Date.now() + template.duration,
            progress: 0,
            completed: false,
            claimed: false,
            type: 'seasonal'
        };

        this.seasonalEvents.push(event);
        this.challenges.set(event.id, event);

        console.log(`🌟 季节性事件已触发: ${event.name}`);
        
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(`🌟 季节性事件: ${event.name}`, 'seasonal_event');
        }

        return event;
    }

    // 创建自定义挑战
    createCustomChallenge(challengeData) {
        const challenge = {
            id: `custom_${Date.now()}`,
            name: challengeData.name || '自定义挑战',
            description: challengeData.description || '完成自定义目标',
            type: 'custom',
            target: challengeData.target || 1,
            reward: challengeData.reward || { money: 1000 },
            icon: challengeData.icon || '🎯',
            startTime: Date.now(),
            endTime: Date.now() + (challengeData.duration || 24 * 60 * 60 * 1000),
            progress: 0,
            completed: false,
            claimed: false,
            checkProgress: challengeData.checkProgress || (() => 0)
        };

        this.challenges.set(challenge.id, challenge);
        console.log(`🎯 自定义挑战已创建: ${challenge.name}`);
        
        return challenge;
    }

    // 获取挑战难度等级
    getChallengeDifficulty(challenge) {
        if (challenge.rarity === 'legendary') return 'extreme';
        if (challenge.rarity === 'epic') return 'hard';
        if (challenge.rarity === 'rare') return 'medium';
        return 'easy';
    }

    // 获取挑战奖励倍数
    getRewardMultiplier(challenge) {
        const difficulty = this.getChallengeDifficulty(challenge);
        const multipliers = {
            'easy': 1.0,
            'medium': 1.5,
            'hard': 2.0,
            'extreme': 3.0
        };
        return multipliers[difficulty] || 1.0;
    }

    // 应用奖励倍数
    applyRewardMultiplier(reward, multiplier) {
        const multipliedReward = {};
        for (const [type, amount] of Object.entries(reward)) {
            multipliedReward[type] = Math.floor(amount * multiplier);
        }
        return multipliedReward;
    }

    // 获取所有活跃特殊事件
    getActiveSpecialEvents() {
        const currentTime = Date.now();
        const activeEvents = [];

        // 限时活动
        this.limitedTimeEvents.forEach(event => {
            if (currentTime <= event.endTime) {
                activeEvents.push({
                    ...event,
                    timeRemaining: event.endTime - currentTime,
                    progressPercentage: Math.min(100, (event.progress / event.target) * 100),
                    difficulty: this.getChallengeDifficulty(event)
                });
            }
        });

        // 季节性事件
        this.seasonalEvents.forEach(event => {
            if (currentTime <= event.endTime) {
                activeEvents.push({
                    ...event,
                    timeRemaining: event.endTime - currentTime,
                    progressPercentage: Math.min(100, (event.progress / event.target) * 100),
                    difficulty: this.getChallengeDifficulty(event)
                });
            }
        });

        return activeEvents;
    }

    // 检查并触发随机事件
    checkRandomEventTrigger() {
        const currentTime = Date.now();
        
        // 每小时有5%概率触发限时活动
        if (Math.random() < 0.05 && this.limitedTimeEvents.length < 2) {
            this.triggerLimitedTimeEvent();
        }

        // 检查季节性事件触发
        const currentSeason = this.getCurrentSeason();
        const hasActiveSeasonalEvent = this.seasonalEvents.some(event => 
            currentTime <= event.endTime && event.season === currentSeason
        );

        if (!hasActiveSeasonalEvent && Math.random() < 0.02) { // 2%概率
            this.triggerSeasonalEvent(currentSeason);
        }
    }

    // 获取当前季节
    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'autumn';
        return 'winter';
    }

    // 特殊事件进度检查辅助方法
    getEventProfitEarned() {
        // 简化实现：返回当前资金的一部分作为事件期间赚取的利润
        return Math.min(this.gameManager.getResourceSystem().getResource('money'), 100000);
    }

    checkLowStressTime() {
        // 检查所有员工的压力水平
        const highStressEmployees = this.game.employees.filter(emp => 
            emp.stress && emp.stress > 20
        ).length;
        
        return highStressEmployees === 0 ? 1200 : 0; // 简化实现
    }

    // 获取挑战统计
    getChallengeStatistics() {
        const stats = {
            totalChallenges: this.challenges.size,
            completedChallenges: 0,
            activeChallenges: 0,
            claimedRewards: 0,
            totalRewardsEarned: { money: 0, reputation: 0, satisfaction: 0, productivity: 0 },
            challengesByType: {
                daily: 0,
                weekly: 0,
                limited_time: 0,
                seasonal: 0,
                custom: 0
            },
            challengesByDifficulty: {
                easy: 0,
                medium: 0,
                hard: 0,
                extreme: 0
            }
        };

        const currentTime = Date.now();

        for (const challenge of this.challenges.values()) {
            // 统计挑战类型
            if (stats.challengesByType.hasOwnProperty(challenge.type)) {
                stats.challengesByType[challenge.type]++;
            }

            // 统计难度
            const difficulty = this.getChallengeDifficulty(challenge);
            if (stats.challengesByDifficulty.hasOwnProperty(difficulty)) {
                stats.challengesByDifficulty[difficulty]++;
            }

            // 统计状态
            if (challenge.completed) {
                stats.completedChallenges++;
            }
            
            if (currentTime <= challenge.endTime && !challenge.completed) {
                stats.activeChallenges++;
            }

            if (challenge.claimed) {
                stats.claimedRewards++;
                
                // 累计奖励
                for (const [type, amount] of Object.entries(challenge.reward)) {
                    if (stats.totalRewardsEarned.hasOwnProperty(type)) {
                        stats.totalRewardsEarned[type] += amount;
                    }
                }
            }
        }

        return stats;
    }

    // 更新挑战进度
    updateChallengeProgress() {
        const currentTime = Date.now();
        
        // 更新所有活跃挑战的进度
        for (const challenge of this.challenges.values()) {
            if (challenge.completed || currentTime > challenge.endTime) continue;
            
            // 安全检查：确保checkProgress是一个函数
            if (typeof challenge.checkProgress !== 'function') {
                challenge.checkProgress = () => challenge.progress || 0;
            }
            
            const newProgress = challenge.checkProgress();
            const oldProgress = challenge.progress;
            challenge.progress = newProgress;
            
            // 检查是否完成
            if (newProgress >= challenge.target && !challenge.completed) {
                challenge.completed = true;
                console.log(`🎯 挑战完成: ${challenge.name}`);
                
                // 触发完成通知
                if (typeof window !== 'undefined' && window.showNotification) {
                    window.showNotification(`🎯 挑战完成: ${challenge.name}`, 'challenge');
                }
            }
            
            // 如果进度有变化，记录日志
            if (newProgress !== oldProgress) {
                console.log(`📊 挑战进度更新: ${challenge.name} ${oldProgress} → ${newProgress}/${challenge.target}`);
            }
        }
    }

    // 领取挑战奖励
    claimChallengeReward(challengeId) {
        const challenge = this.challenges.get(challengeId);
        if (!challenge) {
            console.warn(`未找到挑战: ${challengeId}`);
            return false;
        }
        
        if (!challenge.completed) {
            console.warn(`挑战未完成: ${challenge.name}`);
            return false;
        }
        
        if (challenge.claimed) {
            console.warn(`奖励已领取: ${challenge.name}`);
            return false;
        }
        
        // 发放奖励
        const resourceSystem = this.gameManager.getResourceSystem();
        for (const [type, amount] of Object.entries(challenge.reward)) {
            resourceSystem.addResource(type, amount);
        }
        
        challenge.claimed = true;
        console.log(`🎁 挑战奖励已领取: ${challenge.name}`, challenge.reward);
        
        return true;
    }

    // 获取活跃挑战
    getActiveChallenges() {
        const currentTime = Date.now();
        const activeChallenges = [];
        
        for (const challenge of this.challenges.values()) {
            if (currentTime <= challenge.endTime) {
                activeChallenges.push({
                    ...challenge,
                    timeRemaining: challenge.endTime - currentTime,
                    progressPercentage: Math.min(100, (challenge.progress / challenge.target) * 100)
                });
            }
        }
        
        return activeChallenges;
    }

    // 办公室截图功能
    captureOfficeScreenshot() {
        try {
            const canvas = this.game.canvas;
            const dataURL = canvas.toDataURL('image/png');
            
            const screenshot = {
                id: `screenshot_${Date.now()}`,
                dataURL,
                timestamp: Date.now(),
                gameTime: this.game.gameTime,
                metadata: {
                    employeeCount: this.game.employees.length,
                    resources: this.gameManager.getResourceSystem().getResourceSummary(),
                    achievements: this.gameManager.getAchievementSystem().unlockedAchievements.size
                }
            };
            
            this.screenshots.push(screenshot);
            
            // 只保留最近20张截图
            if (this.screenshots.length > 20) {
                this.screenshots = this.screenshots.slice(-20);
            }
            
            console.log('📸 办公室截图已保存');
            return screenshot;
        } catch (error) {
            console.error('❌ 截图失败:', error);
            return null;
        }
    }

    // 分享成就
    shareAchievement(achievementId) {
        const achievement = this.gameManager.getAchievementSystem().achievements.get(achievementId);
        if (!achievement || !achievement.unlocked) {
            console.warn(`无法分享成就: ${achievementId}`);
            return null;
        }
        
        const shareData = {
            type: 'achievement',
            achievement: {
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon
            },
            playerStats: {
                totalScore: this.calculateTotalScore(),
                employeeCount: this.game.employees.length,
                gameTime: this.game.gameTime
            },
            timestamp: Date.now()
        };
        
        this.shareHistory.push(shareData);
        
        // 只保留最近50条分享记录
        if (this.shareHistory.length > 50) {
            this.shareHistory = this.shareHistory.slice(-50);
        }
        
        console.log('📤 成就分享数据已生成:', achievement.name);
        return shareData;
    }

    // 分享办公室状态
    shareOfficeStatus() {
        const screenshot = this.captureOfficeScreenshot();
        if (!screenshot) return null;
        
        const shareData = {
            type: 'office_status',
            screenshot: screenshot.dataURL,
            stats: {
                totalScore: this.calculateTotalScore(),
                employeeCount: this.game.employees.length,
                resources: this.gameManager.getResourceSystem().getResourceSummary(),
                achievements: this.gameManager.getAchievementSystem().unlockedAchievements.size,
                gameTime: this.game.gameTime
            },
            timestamp: Date.now()
        };
        
        this.shareHistory.push(shareData);
        
        console.log('📤 办公室状态分享数据已生成');
        return shareData;
    }

    // 挑战进度检查辅助方法
    getDailyHiredCount() {
        // 这里应该跟踪每日雇佣的员工数量
        // 简化实现：返回当前员工数量的一部分作为今日雇佣数
        return Math.min(this.game.employees.length, 5);
    }

    getComplaintFreeTime() {
        // 检查当前是否有抱怨
        const hasComplaints = this.game.employees.some(emp => emp.complaint);
        return hasComplaints ? 0 : 3600; // 简化实现
    }

    checkResourceManagementGoal() {
        const resources = this.gameManager.getResourceSystem();
        const money = resources.getResource('money');
        const satisfaction = resources.getResource('satisfaction');
        const reputation = resources.getResource('reputation');
        
        return (money > 50000 && satisfaction > 70 && reputation > 60) ? 1 : 0;
    }

    getWeeklyAchievementCount() {
        // 简化实现：返回已解锁成就数量
        return this.gameManager.getAchievementSystem().unlockedAchievements.size;
    }

    getWeeklyProfitEarned() {
        // 简化实现：返回当前资金作为累计利润
        return this.gameManager.getResourceSystem().getResource('money');
    }

    // 重置每日挑战
    resetDailyChallenges() {
        // 清理过期的每日挑战
        this.dailyChallenges.forEach(challenge => {
            this.challenges.delete(challenge.id);
        });
        
        // 生成新的每日挑战
        this.generateDailyChallenges();
        
        console.log('🔄 每日挑战已重置');
    }

    // 重置每周挑战
    resetWeeklyChallenges() {
        // 清理过期的每周挑战
        this.weeklyChallenges.forEach(challenge => {
            this.challenges.delete(challenge.id);
        });
        
        // 生成新的每周挑战
        this.generateWeeklyChallenges();
        
        console.log('🔄 每周挑战已重置');
    }

    // 系统更新
    update(deltaTime) {
        this.updateTimer++;
        this.challengeTimer++;
        this.dailyResetTimer++;
        this.weeklyResetTimer++;
        
        // 每5秒更新一次挑战进度
        if (this.challengeTimer >= 300) { // 5秒 * 60fps
            this.updateChallengeProgress();
            this.challengeTimer = 0;
        }
        
        // 每30秒更新一次排行榜
        if (this.updateTimer >= 1800) { // 30秒 * 60fps
            this.updateAllLeaderboards();
            this.updateTimer = 0;
        }
        
        // 检查每日重置（简化：每小时检查一次）
        if (this.dailyResetTimer >= 216000) { // 1小时 * 60fps * 60分钟
            this.checkDailyReset();
            this.dailyResetTimer = 0;
        }
        
        // 检查每周重置（简化：每6小时检查一次）
        if (this.weeklyResetTimer >= 1296000) { // 6小时 * 60fps * 60分钟
            this.checkWeeklyReset();
            this.weeklyResetTimer = 0;
        }
        
        // 检查随机事件触发（每10分钟检查一次）
        if (Math.floor(this.game.gameTime) % 600 === 0) {
            this.checkRandomEventTrigger();
        }
    }

    // 更新所有排行榜
    updateAllLeaderboards() {
        for (const [id, leaderboard] of this.leaderboards) {
            const currentScore = leaderboard.calculateScore();
            this.recordScore(id, '当前玩家', currentScore);
        }
    }

    // 检查每日重置
    checkDailyReset() {
        const now = new Date();
        const lastReset = new Date(this.lastDailyReset || 0);
        
        // 如果是新的一天，重置每日挑战
        if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth()) {
            this.resetDailyChallenges();
            this.lastDailyReset = now.getTime();
        }
    }

    // 检查每周重置
    checkWeeklyReset() {
        const now = new Date();
        const lastReset = new Date(this.lastWeeklyReset || 0);
        
        // 计算周数差异
        const nowWeek = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
        const lastWeek = Math.floor(lastReset.getTime() / (7 * 24 * 60 * 60 * 1000));
        
        if (nowWeek !== lastWeek) {
            this.resetWeeklyChallenges();
            this.lastWeeklyReset = now.getTime();
        }
    }

    // 获取系统摘要
    getLeaderboardSummary() {
        return {
            leaderboards: this.getAllLeaderboards(),
            activeChallenges: this.getActiveChallenges(),
            playerStats: {
                totalScore: this.calculateTotalScore(),
                efficiencyScore: this.calculateEfficiencyScore(),
                rank: this.getPlayerRank('total_score')
            },
            shareHistory: this.shareHistory.slice(-10), // 最近10条分享记录
            screenshots: this.screenshots.length
        };
    }

    // 获取玩家排名
    getPlayerRank(leaderboardId) {
        const leaderboard = this.leaderboards.get(leaderboardId);
        if (!leaderboard) return -1;
        
        const currentScore = leaderboard.calculateScore();
        let rank = 1;
        
        for (const entry of leaderboard.entries) {
            if (entry.score > currentScore) {
                rank++;
            } else {
                break;
            }
        }
        
        return rank;
    }

    // 序列化数据
    serialize() {
        return {
            leaderboards: Array.from(this.leaderboards.entries()).map(([id, leaderboard]) => ({
                id,
                entries: leaderboard.entries,
                lastUpdated: leaderboard.lastUpdated
            })),
            challenges: Array.from(this.challenges.entries()),
            dailyChallenges: this.dailyChallenges,
            weeklyChallenges: this.weeklyChallenges,
            limitedTimeEvents: this.limitedTimeEvents,
            seasonalEvents: this.seasonalEvents,
            shareHistory: this.shareHistory,
            screenshots: this.screenshots.slice(-5), // 只保存最近5张截图
            lastDailyReset: this.lastDailyReset,
            lastWeeklyReset: this.lastWeeklyReset
        };
    }

    // 反序列化数据
    deserialize(data) {
        if (data.leaderboards) {
            data.leaderboards.forEach(savedLeaderboard => {
                const leaderboard = this.leaderboards.get(savedLeaderboard.id);
                if (leaderboard) {
                    leaderboard.entries = savedLeaderboard.entries || [];
                    leaderboard.lastUpdated = savedLeaderboard.lastUpdated || Date.now();
                }
            });
        }
        
        if (data.challenges) {
            // 恢复挑战数据，但需要重新绑定checkProgress函数
            data.challenges.forEach(([id, challengeData]) => {
                // 为恢复的挑战添加默认的checkProgress函数
                challengeData.checkProgress = challengeData.checkProgress || (() => challengeData.progress || 0);
                this.challenges.set(id, challengeData);
            });
        }
        
        if (data.dailyChallenges) {
            this.dailyChallenges = data.dailyChallenges;
        }
        
        if (data.weeklyChallenges) {
            this.weeklyChallenges = data.weeklyChallenges;
        }
        
        if (data.limitedTimeEvents) {
            this.limitedTimeEvents = data.limitedTimeEvents;
        }
        
        if (data.seasonalEvents) {
            this.seasonalEvents = data.seasonalEvents;
        }
        
        if (data.shareHistory) {
            this.shareHistory = data.shareHistory;
        }
        
        if (data.screenshots) {
            this.screenshots = data.screenshots;
        }
        
        if (data.lastDailyReset) {
            this.lastDailyReset = data.lastDailyReset;
        }
        
        if (data.lastWeeklyReset) {
            this.lastWeeklyReset = data.lastWeeklyReset;
        }
    }
}

// 导出类供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameManager,
        ResourceSystem,
        AchievementSystem,
        EventSystem,
        ProgressionSystem,
        StatisticsSystem,
        LeaderboardSystem
    };
}