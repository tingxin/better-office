// 设施管理器 - 办公室设施购买、放置、升级和维护系统
class FacilityManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.game = gameManager.game;
        
        // 设施数据
        this.facilities = new Map();
        this.decorations = new Map();
        this.facilityEffects = new Map();
        
        // 维护系统
        this.maintenanceSchedule = new Map();
        this.maintenanceTimer = 0;
        this.maintenanceInterval = 3600; // 60秒检查一次维护需求
        
        // 初始化设施目录
        this.initializeFacilityCatalog();
        this.initializeDecorationCatalog();
    }

    // 初始化设施目录
    initializeFacilityCatalog() {
        const facilityCatalog = [
            // 基础办公设施
            {
                id: 'ergonomic_chair',
                name: '人体工学椅',
                description: '提供更好的坐姿支撑，减少员工疲劳',
                category: 'furniture',
                cost: { money: 2000 },
                effects: {
                    satisfaction: 5,
                    productivity: 3,
                    health: 8
                },
                maintenanceCost: 100,
                maintenanceInterval: 7200, // 2分钟
                upgradeOptions: ['premium_ergonomic_chair'],
                maxQuantity: 20,
                unlockLevel: 1
            },
            {
                id: 'premium_ergonomic_chair',
                name: '高级人体工学椅',
                description: '顶级人体工学椅，显著提升员工舒适度',
                category: 'furniture',
                cost: { money: 5000 },
                effects: {
                    satisfaction: 12,
                    productivity: 8,
                    health: 15
                },
                maintenanceCost: 200,
                maintenanceInterval: 10800, // 3分钟
                upgradeOptions: [],
                maxQuantity: 20,
                unlockLevel: 3
            },
            {
                id: 'coffee_machine',
                name: '咖啡机',
                description: '提供新鲜咖啡，提升员工精神状态',
                category: 'amenity',
                cost: { money: 8000 },
                effects: {
                    satisfaction: 10,
                    productivity: 12,
                    energy: 15
                },
                maintenanceCost: 300,
                maintenanceInterval: 5400, // 1.5分钟
                upgradeOptions: ['premium_coffee_machine'],
                maxQuantity: 3,
                unlockLevel: 2
            },
            {
                id: 'premium_coffee_machine',
                name: '高端咖啡机',
                description: '专业级咖啡机，提供多种咖啡选择',
                category: 'amenity',
                cost: { money: 20000 },
                effects: {
                    satisfaction: 20,
                    productivity: 18,
                    energy: 25
                },
                maintenanceCost: 500,
                maintenanceInterval: 7200, // 2分钟
                upgradeOptions: [],
                maxQuantity: 3,
                unlockLevel: 4
            },
            {
                id: 'air_purifier',
                name: '空气净化器',
                description: '改善办公室空气质量，提升员工健康',
                category: 'environment',
                cost: { money: 3000 },
                effects: {
                    satisfaction: 8,
                    health: 20,
                    productivity: 5
                },
                maintenanceCost: 150,
                maintenanceInterval: 9000, // 2.5分钟
                upgradeOptions: ['industrial_air_purifier'],
                maxQuantity: 5,
                unlockLevel: 2
            },
            {
                id: 'industrial_air_purifier',
                name: '工业级空气净化器',
                description: '大功率空气净化系统，覆盖整个办公区',
                category: 'environment',
                cost: { money: 12000 },
                effects: {
                    satisfaction: 15,
                    health: 35,
                    productivity: 10
                },
                maintenanceCost: 400,
                maintenanceInterval: 12600, // 3.5分钟
                upgradeOptions: [],
                maxQuantity: 2,
                unlockLevel: 5
            },
            {
                id: 'relaxation_area',
                name: '休息区',
                description: '员工放松休息的区域，缓解工作压力',
                category: 'recreation',
                cost: { money: 15000 },
                effects: {
                    satisfaction: 25,
                    stress: -20,
                    productivity: 8
                },
                maintenanceCost: 200,
                maintenanceInterval: 14400, // 4分钟
                upgradeOptions: ['premium_relaxation_area'],
                maxQuantity: 2,
                unlockLevel: 3
            },
            {
                id: 'premium_relaxation_area',
                name: '豪华休息区',
                description: '配备按摩椅和娱乐设施的高级休息区',
                category: 'recreation',
                cost: { money: 40000 },
                effects: {
                    satisfaction: 40,
                    stress: -35,
                    productivity: 15
                },
                maintenanceCost: 600,
                maintenanceInterval: 18000, // 5分钟
                upgradeOptions: [],
                maxQuantity: 2,
                unlockLevel: 6
            },
            {
                id: 'fitness_equipment',
                name: '健身器材',
                description: '简单的健身设备，促进员工身体健康',
                category: 'health',
                cost: { money: 25000 },
                effects: {
                    satisfaction: 15,
                    health: 30,
                    energy: 20,
                    stress: -15
                },
                maintenanceCost: 800,
                maintenanceInterval: 10800, // 3分钟
                upgradeOptions: ['gym_facility'],
                maxQuantity: 1,
                unlockLevel: 4
            },
            {
                id: 'gym_facility',
                name: '健身房',
                description: '完整的健身房设施，全面提升员工健康',
                category: 'health',
                cost: { money: 80000 },
                effects: {
                    satisfaction: 35,
                    health: 50,
                    energy: 35,
                    stress: -30
                },
                maintenanceCost: 1500,
                maintenanceInterval: 14400, // 4分钟
                upgradeOptions: [],
                maxQuantity: 1,
                unlockLevel: 7
            }
        ];

        facilityCatalog.forEach(facility => {
            this.facilityEffects.set(facility.id, facility);
        });
    }

    // 初始化装饰目录
    initializeDecorationCatalog() {
        const decorationCatalog = [
            {
                id: 'office_plants',
                name: '办公室绿植',
                description: '美化环境，改善空气质量',
                category: 'decoration',
                cost: { money: 500 },
                effects: {
                    satisfaction: 3,
                    health: 5,
                    beauty: 10
                },
                maintenanceCost: 50,
                maintenanceInterval: 7200, // 2分钟
                maxQuantity: 10,
                unlockLevel: 1
            },
            {
                id: 'artwork',
                name: '艺术品',
                description: '提升办公室文化氛围',
                category: 'decoration',
                cost: { money: 3000 },
                effects: {
                    satisfaction: 8,
                    creativity: 10,
                    beauty: 20
                },
                maintenanceCost: 0, // 艺术品不需要维护
                maintenanceInterval: 0,
                maxQuantity: 5,
                unlockLevel: 2
            },
            {
                id: 'ambient_lighting',
                name: '氛围灯光',
                description: '柔和的灯光营造舒适的工作环境',
                category: 'decoration',
                cost: { money: 2000 },
                effects: {
                    satisfaction: 6,
                    productivity: 4,
                    beauty: 15
                },
                maintenanceCost: 100,
                maintenanceInterval: 18000, // 5分钟
                maxQuantity: 8,
                unlockLevel: 2
            },
            {
                id: 'motivational_posters',
                name: '励志海报',
                description: '激励员工的正能量海报',
                category: 'decoration',
                cost: { money: 200 },
                effects: {
                    satisfaction: 2,
                    motivation: 8,
                    productivity: 3
                },
                maintenanceCost: 0,
                maintenanceInterval: 0,
                maxQuantity: 15,
                unlockLevel: 1
            }
        ];

        decorationCatalog.forEach(decoration => {
            this.facilityEffects.set(decoration.id, decoration);
        });
    }

    // 购买设施
    purchaseFacility(facilityId, quantity = 1) {
        const facilityTemplate = this.facilityEffects.get(facilityId);
        if (!facilityTemplate) {
            console.warn(`设施不存在: ${facilityId}`);
            return false;
        }

        // 检查解锁等级
        const progressionSystem = this.gameManager.getProgressionSystem();
        if (progressionSystem.level < facilityTemplate.unlockLevel) {
            console.warn(`设施未解锁: ${facilityTemplate.name} (需要等级 ${facilityTemplate.unlockLevel})`);
            return false;
        }

        // 检查数量限制
        const currentQuantity = this.getFacilityQuantity(facilityId);
        if (currentQuantity + quantity > facilityTemplate.maxQuantity) {
            console.warn(`设施数量超限: ${facilityTemplate.name} (最大 ${facilityTemplate.maxQuantity})`);
            return false;
        }

        // 检查资源
        const totalCost = {};
        for (const [resource, cost] of Object.entries(facilityTemplate.cost)) {
            totalCost[resource] = cost * quantity;
        }

        const resourceSystem = this.gameManager.getResourceSystem();
        if (!resourceSystem.canAfford('money', totalCost.money || 0)) {
            console.warn(`资源不足，无法购买设施: ${facilityTemplate.name}`);
            return false;
        }

        // 扣除成本
        for (const [resource, cost] of Object.entries(totalCost)) {
            resourceSystem.spendResource(resource, cost);
        }

        // 添加设施
        for (let i = 0; i < quantity; i++) {
            const facilityInstance = {
                id: `${facilityId}_${Date.now()}_${i}`,
                templateId: facilityId,
                purchasedAt: Date.now(),
                condition: 100, // 设施状态 (0-100)
                lastMaintenance: Date.now(),
                nextMaintenance: Date.now() + facilityTemplate.maintenanceInterval * 1000,
                level: 1,
                active: true
            };

            this.facilities.set(facilityInstance.id, facilityInstance);

            // 安排维护
            if (facilityTemplate.maintenanceInterval > 0) {
                this.scheduleMaintenanceCheck(facilityInstance.id);
            }
        }

        console.log(`✅ 购买设施: ${facilityTemplate.name} x${quantity}`);
        
        // 立即应用效果
        this.updateFacilityEffects();
        
        return true;
    }

    // 升级设施
    upgradeFacility(facilityInstanceId, upgradeOptionIndex = 0) {
        const facility = this.facilities.get(facilityInstanceId);
        if (!facility) {
            console.warn(`设施实例不存在: ${facilityInstanceId}`);
            return false;
        }

        const currentTemplate = this.facilityEffects.get(facility.templateId);
        if (!currentTemplate || !currentTemplate.upgradeOptions || currentTemplate.upgradeOptions.length === 0) {
            console.warn(`设施无法升级: ${currentTemplate?.name || facility.templateId}`);
            return false;
        }

        // 获取指定的升级选项
        if (upgradeOptionIndex >= currentTemplate.upgradeOptions.length) {
            console.warn(`升级选项索引无效: ${upgradeOptionIndex}`);
            return false;
        }

        const upgradeId = currentTemplate.upgradeOptions[upgradeOptionIndex];
        const upgradeTemplate = this.facilityEffects.get(upgradeId);
        if (!upgradeTemplate) {
            console.warn(`升级模板不存在: ${upgradeId}`);
            return false;
        }

        // 检查解锁等级
        const progressionSystem = this.gameManager.getProgressionSystem();
        if (progressionSystem.level < upgradeTemplate.unlockLevel) {
            console.warn(`升级未解锁: ${upgradeTemplate.name} (需要等级 ${upgradeTemplate.unlockLevel})`);
            return false;
        }

        // 计算升级成本（可能包含折扣）
        const upgradeCost = this.calculateUpgradeCost(facility, currentTemplate, upgradeTemplate);

        // 检查资源
        const resourceSystem = this.gameManager.getResourceSystem();
        if (!resourceSystem.canAfford('money', upgradeCost.money || 0)) {
            console.warn(`资源不足，无法升级设施: ${upgradeTemplate.name} (需要 ${upgradeCost.money} 元)`);
            return false;
        }

        // 扣除升级成本
        for (const [resource, cost] of Object.entries(upgradeCost)) {
            resourceSystem.spendResource(resource, cost);
        }

        // 记录升级历史
        if (!facility.upgradeHistory) {
            facility.upgradeHistory = [];
        }
        facility.upgradeHistory.push({
            date: Date.now(),
            fromTemplate: facility.templateId,
            toTemplate: upgradeId,
            cost: upgradeCost,
            level: facility.level
        });

        // 更新设施
        const oldLevel = facility.level;
        facility.templateId = upgradeId;
        facility.level++;
        facility.condition = 100; // 升级后状态恢复满值
        facility.lastMaintenance = Date.now();
        facility.nextMaintenance = Date.now() + upgradeTemplate.maintenanceInterval * 1000;

        console.log(`⬆️ 设施升级: ${currentTemplate.name} → ${upgradeTemplate.name} (等级 ${oldLevel} → ${facility.level})`);
        
        // 触发升级完成效果
        this.triggerUpgradeCompletedEffects(facility, currentTemplate, upgradeTemplate);
        
        // 更新效果
        this.updateFacilityEffects();
        
        return true;
    }

    // 计算升级成本
    calculateUpgradeCost(facility, currentTemplate, upgradeTemplate) {
        const baseCost = { ...upgradeTemplate.cost };
        
        // 根据设施当前状态给予折扣
        if (facility.condition >= 80) {
            // 状态良好的设施升级成本稍低
            baseCost.money = Math.floor(baseCost.money * 0.9);
        }
        
        // 根据维护历史给予折扣
        if (facility.maintenanceHistory && facility.maintenanceHistory.length >= 3) {
            // 维护良好的设施升级成本更低
            baseCost.money = Math.floor(baseCost.money * 0.85);
        }
        
        return baseCost;
    }

    // 触发升级完成效果
    triggerUpgradeCompletedEffects(facility, oldTemplate, newTemplate) {
        const resourceSystem = this.gameManager.getResourceSystem();
        
        // 升级完成的正面效果
        resourceSystem.addResource('satisfaction', 8);
        resourceSystem.addResource('reputation', 5);
        resourceSystem.addResource('productivity', 3);
        
        // 通知员工升级完成
        if (this.game.employees) {
            this.game.employees.forEach(employee => {
                if (employee.mood !== undefined) {
                    employee.mood = Math.min(100, employee.mood + 5);
                }
                // 减少抱怨时间
                employee.nextComplaintTime = Math.max(
                    employee.nextComplaintTime,
                    employee.nextComplaintTime + 120 // 2分钟内不会抱怨
                );
            });
        }
        
        console.log(`✨ 升级完成效果: 员工满意度和声望提升`);
    }

    // 获取设施升级选项
    getFacilityUpgradeOptions(facilityInstanceId) {
        const facility = this.facilities.get(facilityInstanceId);
        if (!facility) return [];

        const currentTemplate = this.facilityEffects.get(facility.templateId);
        if (!currentTemplate || !currentTemplate.upgradeOptions) return [];

        const progressionSystem = this.gameManager.getProgressionSystem();
        const resourceSystem = this.gameManager.getResourceSystem();
        
        return currentTemplate.upgradeOptions.map((upgradeId, index) => {
            const upgradeTemplate = this.facilityEffects.get(upgradeId);
            if (!upgradeTemplate) return null;

            const upgradeCost = this.calculateUpgradeCost(facility, currentTemplate, upgradeTemplate);
            
            return {
                index,
                id: upgradeId,
                name: upgradeTemplate.name,
                description: upgradeTemplate.description,
                cost: upgradeCost,
                effects: upgradeTemplate.effects,
                unlocked: progressionSystem.level >= upgradeTemplate.unlockLevel,
                affordable: resourceSystem.canAfford('money', upgradeCost.money || 0),
                unlockLevel: upgradeTemplate.unlockLevel
            };
        }).filter(Boolean);
    }

    // 批量升级设施
    batchUpgradeFacilities(facilityIds, upgradeOptionIndex = 0) {
        const results = [];
        let successCount = 0;
        let totalCost = 0;

        for (const facilityId of facilityIds) {
            const facility = this.facilities.get(facilityId);
            if (!facility) continue;

            const currentTemplate = this.facilityEffects.get(facility.templateId);
            if (!currentTemplate || !currentTemplate.upgradeOptions) continue;

            const upgradeId = currentTemplate.upgradeOptions[upgradeOptionIndex];
            const upgradeTemplate = this.facilityEffects.get(upgradeId);
            if (!upgradeTemplate) continue;

            const upgradeCost = this.calculateUpgradeCost(facility, currentTemplate, upgradeTemplate);
            totalCost += upgradeCost.money || 0;
        }

        // 检查总成本
        const resourceSystem = this.gameManager.getResourceSystem();
        if (!resourceSystem.canAfford('money', totalCost)) {
            console.warn(`批量升级资源不足: 需要 ${totalCost} 元`);
            return { success: false, message: '资源不足', totalCost };
        }

        // 执行批量升级
        for (const facilityId of facilityIds) {
            if (this.upgradeFacility(facilityId, upgradeOptionIndex)) {
                successCount++;
            }
        }

        console.log(`📦 批量升级完成: ${successCount}/${facilityIds.length} 个设施`);
        
        return {
            success: true,
            upgraded: successCount,
            total: facilityIds.length,
            totalCost
        };
    }

    // 维护设施
    maintainFacility(facilityInstanceId, maintenanceType = 'regular') {
        const facility = this.facilities.get(facilityInstanceId);
        if (!facility) {
            console.warn(`设施实例不存在: ${facilityInstanceId}`);
            return false;
        }

        const template = this.facilityEffects.get(facility.templateId);
        if (!template) {
            console.warn(`设施模板不存在: ${facility.templateId}`);
            return false;
        }

        // 计算维护成本
        const maintenanceCost = this.calculateMaintenanceCost(facility, template);
        
        // 检查维护成本
        const resourceSystem = this.gameManager.getResourceSystem();
        if (!resourceSystem.canAfford('money', maintenanceCost)) {
            console.warn(`资源不足，无法维护设施: ${template.name} (需要 ${maintenanceCost} 元)`);
            return false;
        }

        // 扣除维护成本
        resourceSystem.spendResource('money', maintenanceCost);

        // 根据维护类型恢复设施状态
        let conditionRestore = 100;
        let maintenanceBonus = 0;
        
        switch (maintenanceType) {
            case 'preventive':
                // 预防性维护 - 成本稍高但效果更好
                conditionRestore = 100;
                maintenanceBonus = template.maintenanceInterval * 0.2; // 延长20%维护间隔
                break;
            case 'emergency':
                // 紧急维护 - 成本高但立即修复
                conditionRestore = 90; // 紧急维护可能不如预防性维护彻底
                break;
            case 'regular':
            default:
                conditionRestore = 100;
                break;
        }

        facility.condition = conditionRestore;
        facility.lastMaintenance = Date.now();
        facility.nextMaintenance = Date.now() + (template.maintenanceInterval + maintenanceBonus) * 1000;

        // 记录维护历史
        if (!facility.maintenanceHistory) {
            facility.maintenanceHistory = [];
        }
        facility.maintenanceHistory.push({
            date: Date.now(),
            type: maintenanceType,
            cost: maintenanceCost,
            conditionBefore: facility.condition,
            conditionAfter: conditionRestore
        });

        console.log(`🔧 设施维护完成: ${template.name} (${maintenanceType}) - 成本: ${maintenanceCost} 元`);
        
        // 更新效果
        this.updateFacilityEffects();
        
        // 触发维护完成事件
        this.triggerMaintenanceCompletedEvent(facility, template, maintenanceType);
        
        return true;
    }

    // 触发维护完成事件
    triggerMaintenanceCompletedEvent(facility, template, maintenanceType) {
        const resourceSystem = this.gameManager.getResourceSystem();
        
        // 维护完成后的正面效果
        if (maintenanceType === 'preventive') {
            resourceSystem.addResource('satisfaction', 3);
            resourceSystem.addResource('reputation', 1);
        }
        
        // 通知员工维护完成
        if (this.game.employees) {
            this.game.employees.forEach(employee => {
                if (employee.mood !== undefined) {
                    employee.mood = Math.min(100, employee.mood + 2);
                }
            });
        }
    }

    // 自动维护系统
    scheduleAutomaticMaintenance(facilityInstanceId, enabled = true) {
        const facility = this.facilities.get(facilityInstanceId);
        if (!facility) return false;

        facility.autoMaintenance = enabled;
        
        if (enabled) {
            console.log(`🤖 已启用自动维护: ${facility.templateId}`);
        } else {
            console.log(`⏸️ 已禁用自动维护: ${facility.templateId}`);
        }
        
        return true;
    }

    // 执行自动维护
    performAutomaticMaintenance() {
        const resourceSystem = this.gameManager.getResourceSystem();
        let maintenancePerformed = 0;

        for (const [facilityId, facility] of this.facilities) {
            if (!facility.active || !facility.autoMaintenance) continue;
            
            const template = this.facilityEffects.get(facility.templateId);
            if (!template) continue;

            // 检查是否需要自动维护
            if (facility.condition < 60) {
                const maintenanceCost = this.calculateMaintenanceCost(facility, template);
                
                if (resourceSystem.canAfford('money', maintenanceCost)) {
                    if (this.maintainFacility(facilityId, 'preventive')) {
                        maintenancePerformed++;
                    }
                }
            }
        }

        if (maintenancePerformed > 0) {
            console.log(`🤖 自动维护完成: ${maintenancePerformed} 个设施`);
        }

        return maintenancePerformed;
    }

    // 获取设施数量
    getFacilityQuantity(facilityId) {
        let count = 0;
        for (const facility of this.facilities.values()) {
            if (facility.templateId === facilityId && facility.active) {
                count++;
            }
        }
        return count;
    }

    // 更新设施效果
    updateFacilityEffects() {
        const totalEffects = {
            satisfaction: 0,
            productivity: 0,
            health: 0,
            energy: 0,
            stress: 0,
            creativity: 0,
            motivation: 0,
            beauty: 0
        };

        // 计算所有设施的总效果
        for (const facility of this.facilities.values()) {
            if (!facility.active) continue;

            const template = this.facilityEffects.get(facility.templateId);
            if (!template || !template.effects) continue;

            // 根据设施状态调整效果
            const conditionMultiplier = facility.condition / 100;

            for (const [effectType, value] of Object.entries(template.effects)) {
                if (totalEffects.hasOwnProperty(effectType)) {
                    totalEffects[effectType] += value * conditionMultiplier;
                }
            }
        }

        // 应用效果到资源系统
        this.applyFacilityEffects(totalEffects);
        
        console.log('🏢 设施效果已更新:', totalEffects);
    }

    // 应用设施效果
    applyFacilityEffects(effects) {
        const resourceSystem = this.gameManager.getResourceSystem();
        
        // 将设施效果转换为资源变化
        if (effects.satisfaction > 0) {
            resourceSystem.addResource('satisfaction', effects.satisfaction * 0.1); // 缓慢增加
        }
        
        if (effects.productivity > 0) {
            resourceSystem.addResource('productivity', effects.productivity * 0.1);
        }

        // 影响员工行为
        this.applyEmployeeEffects(effects);
        
        // 应用设施特定效果
        this.applyFacilitySpecificEffects(effects);
    }

    // 应用员工效果
    applyEmployeeEffects(effects) {
        if (!this.game.employees) return;

        for (const employee of this.game.employees) {
            // 满意度效果 - 影响员工心情
            if (effects.satisfaction > 0) {
                if (employee.mood !== undefined) {
                    employee.mood = Math.min(100, employee.mood + (effects.satisfaction * 0.5));
                }
                // 减少抱怨频率
                employee.nextComplaintTime = Math.max(
                    employee.nextComplaintTime, 
                    employee.nextComplaintTime + (effects.satisfaction * 5)
                );
            }

            // 健康效果 - 减少抱怨并提升能量
            if (effects.health > 0) {
                employee.nextComplaintTime = Math.max(
                    employee.nextComplaintTime, 
                    employee.nextComplaintTime + (effects.health * 10)
                );
                
                if (employee.energy !== undefined) {
                    employee.energy = Math.min(100, employee.energy + (effects.health * 0.3));
                }
            }

            // 压力缓解效果
            if (effects.stress < 0) {
                if (employee.stress !== undefined) {
                    employee.stress = Math.max(0, employee.stress + effects.stress * 0.5);
                }
                employee.nextComplaintTime = Math.max(
                    employee.nextComplaintTime,
                    employee.nextComplaintTime + (Math.abs(effects.stress) * 15)
                );
            }

            // 能量提升效果
            if (effects.energy > 0) {
                if (employee.energy !== undefined) {
                    employee.energy = Math.min(100, employee.energy + (effects.energy * 0.4));
                }
                // 提升员工工作效率（通过减少休息时间）
                if (employee.isResting) {
                    employee.restTime = Math.max(0, employee.restTime - effects.energy);
                }
            }

            // 生产力效果 - 影响工作效率
            if (effects.productivity > 0) {
                // 缩短工作任务完成时间
                if (employee.workTimer > 0) {
                    employee.workTimer = Math.max(1, employee.workTimer - (effects.productivity * 2));
                }
            }

            // 创造力效果 - 影响创造性工作
            if (effects.creativity > 0) {
                if (employee.skills && employee.skills.creativity !== undefined) {
                    // 临时提升创造力技能
                    employee.skills.creativity = Math.min(100, employee.skills.creativity + (effects.creativity * 0.2));
                }
            }

            // 动机效果 - 影响工作积极性
            if (effects.motivation > 0) {
                // 增加工作时间，减少休息需求
                if (employee.state === 'working') {
                    employee.workTimer += effects.motivation * 5;
                }
                if (employee.restTimer > 0) {
                    employee.restTimer = Math.max(0, employee.restTimer - effects.motivation * 3);
                }
            }
        }
    }

    // 安排维护检查
    scheduleMaintenanceCheck(facilityInstanceId) {
        const facility = this.facilities.get(facilityInstanceId);
        if (!facility) return;

        const template = this.facilityEffects.get(facility.templateId);
        if (!template || template.maintenanceInterval <= 0) return;

        this.maintenanceSchedule.set(facilityInstanceId, {
            nextCheck: Date.now() + template.maintenanceInterval * 1000,
            interval: template.maintenanceInterval * 1000
        });
    }

    // 应用设施特定效果
    applyFacilitySpecificEffects(effects) {
        // 美观度效果 - 影响整体办公室环境
        if (effects.beauty > 0) {
            const resourceSystem = this.gameManager.getResourceSystem();
            // 美观度间接提升声望和满意度
            resourceSystem.addResource('reputation', effects.beauty * 0.05);
            resourceSystem.addResource('satisfaction', effects.beauty * 0.08);
        }

        // 根据设施类型应用特殊效果
        this.applyEnvironmentalEffects(effects);
    }

    // 应用环境效果
    applyEnvironmentalEffects(effects) {
        // 空气质量改善效果
        if (effects.health > 15) { // 空气净化器等设施
            this.reduceEnvironmentalComplaints('air_quality', 0.3);
        }

        // 温度控制效果
        if (effects.satisfaction > 10) { // 空调、加热器等
            this.reduceEnvironmentalComplaints('temperature', 0.4);
        }

        // 噪音控制效果
        if (effects.productivity > 8) { // 隔音设施等
            this.reduceEnvironmentalComplaints('noise', 0.2);
        }
    }

    // 减少环境相关抱怨
    reduceEnvironmentalComplaints(category, reductionRate) {
        if (this.game.complaintStats && this.game.complaintStats.has(category)) {
            const currentCount = this.game.complaintStats.get(category);
            const newCount = Math.max(0, Math.floor(currentCount * (1 - reductionRate)));
            this.game.complaintStats.set(category, newCount);
            console.log(`🌿 ${category} 相关抱怨减少了 ${Math.round(reductionRate * 100)}%`);
        }
    }

    // 检查维护需求
    checkMaintenanceNeeds() {
        const currentTime = Date.now();
        const needsMaintenance = [];

        for (const [facilityId, facility] of this.facilities) {
            if (!facility.active) continue;

            const template = this.facilityEffects.get(facility.templateId);
            if (!template || template.maintenanceInterval <= 0) continue;

            // 检查是否需要维护
            if (currentTime >= facility.nextMaintenance) {
                // 根据设施类型和使用强度计算状态下降
                const usageIntensity = this.calculateUsageIntensity(facility, template);
                const conditionLoss = Math.max(10, 20 * usageIntensity);
                
                facility.condition = Math.max(0, facility.condition - conditionLoss);
                
                // 更新下次维护时间
                facility.nextMaintenance = currentTime + template.maintenanceInterval * 1000;
                
                // 设施状态影响效果
                this.updateFacilityEffectiveness(facility, template);
                
                if (facility.condition < 50) {
                    needsMaintenance.push({
                        facilityId,
                        facility,
                        template,
                        urgency: facility.condition < 20 ? 'high' : 'medium',
                        estimatedCost: this.calculateMaintenanceCost(facility, template)
                    });
                }
            }
        }

        // 通知需要维护的设施
        if (needsMaintenance.length > 0) {
            this.notifyMaintenanceNeeded(needsMaintenance);
        }

        return needsMaintenance;
    }

    // 计算使用强度
    calculateUsageIntensity(facility, template) {
        let intensity = 1.0;

        // 根据员工数量调整使用强度
        const employeeCount = this.game.employees ? this.game.employees.length : 0;
        if (template.category === 'amenity' || template.category === 'recreation') {
            intensity += Math.min(1.0, employeeCount / 10); // 员工越多，使用越频繁
        }

        // 根据设施状态调整
        if (facility.condition < 30) {
            intensity += 0.5; // 状态差的设施更容易进一步损坏
        }

        return Math.min(2.0, intensity);
    }

    // 更新设施有效性
    updateFacilityEffectiveness(facility, template) {
        // 状态低于50%时，效果开始显著下降
        if (facility.condition < 50) {
            const effectivenessMultiplier = facility.condition / 100;
            console.log(`⚠️ ${template.name} 效果下降至 ${Math.round(effectivenessMultiplier * 100)}%`);
            
            // 可以在这里触发负面效果
            if (facility.condition < 20) {
                this.triggerFacilityFailureEffects(facility, template);
            }
        }
    }

    // 触发设施故障效果
    triggerFacilityFailureEffects(facility, template) {
        const resourceSystem = this.gameManager.getResourceSystem();
        
        // 根据设施类型应用不同的故障效果
        switch (template.category) {
            case 'environment':
                resourceSystem.addResource('satisfaction', -5);
                this.game.complaintStats.set('equipment_failure', 
                    (this.game.complaintStats.get('equipment_failure') || 0) + 1);
                break;
            case 'amenity':
                resourceSystem.addResource('satisfaction', -8);
                resourceSystem.addResource('productivity', -3);
                break;
            case 'recreation':
                resourceSystem.addResource('satisfaction', -10);
                break;
            case 'health':
                resourceSystem.addResource('satisfaction', -6);
                // 增加健康相关抱怨
                this.game.complaintStats.set('health_concerns', 
                    (this.game.complaintStats.get('health_concerns') || 0) + 1);
                break;
        }
        
        console.log(`💥 ${template.name} 故障，影响员工满意度和生产力`);
    }

    // 计算维护成本
    calculateMaintenanceCost(facility, template) {
        let baseCost = template.maintenanceCost;
        
        // 根据设施状态调整成本
        if (facility.condition < 20) {
            baseCost *= 1.5; // 紧急维修成本更高
        } else if (facility.condition < 40) {
            baseCost *= 1.2; // 状态差的设施维修成本稍高
        }
        
        // 根据设施等级调整成本
        if (facility.level > 1) {
            baseCost *= (1 + (facility.level - 1) * 0.3);
        }
        
        return Math.floor(baseCost);
    }

    // 通知维护需求
    notifyMaintenanceNeeded(maintenanceList) {
        for (const item of maintenanceList) {
            const message = `🔧 ${item.template.name} 需要维护 (状态: ${item.facility.condition}%)`;
            console.log(message);
            
            // 显示UI通知
            if (typeof window !== 'undefined' && window.showNotification) {
                window.showNotification(message, 'maintenance');
            }
        }
    }

    // 获取可购买的设施列表
    getAvailableFacilities() {
        const progressionSystem = this.gameManager.getProgressionSystem();
        const currentLevel = progressionSystem.level;
        
        const available = [];
        
        for (const [id, template] of this.facilityEffects) {
            if (template.unlockLevel <= currentLevel) {
                const currentQuantity = this.getFacilityQuantity(id);
                if (currentQuantity < template.maxQuantity) {
                    available.push({
                        ...template,
                        currentQuantity,
                        canPurchase: this.gameManager.getResourceSystem().canAfford('money', template.cost.money || 0)
                    });
                }
            }
        }
        
        return available.sort((a, b) => a.cost.money - b.cost.money);
    }

    // 获取设施状态摘要
    getFacilitySummary() {
        const summary = {
            totalFacilities: this.facilities.size,
            activeFacilities: 0,
            needsMaintenance: 0,
            totalMaintenanceCost: 0,
            categoryStats: {}
        };

        for (const facility of this.facilities.values()) {
            if (facility.active) {
                summary.activeFacilities++;
                
                const template = this.facilityEffects.get(facility.templateId);
                if (template) {
                    // 统计分类
                    if (!summary.categoryStats[template.category]) {
                        summary.categoryStats[template.category] = 0;
                    }
                    summary.categoryStats[template.category]++;
                    
                    // 统计维护成本
                    if (facility.condition < 80) {
                        summary.needsMaintenance++;
                        summary.totalMaintenanceCost += template.maintenanceCost;
                    }
                }
            }
        }

        return summary;
    }

    // 系统更新
    update(deltaTime) {
        this.maintenanceTimer++;
        
        if (this.maintenanceTimer >= this.maintenanceInterval) {
            // 检查维护需求
            this.checkMaintenanceNeeds();
            
            // 执行自动维护
            this.performAutomaticMaintenance();
            
            // 更新设施效果
            this.updateFacilityEffects();
            
            // 重置计时器
            this.maintenanceTimer = 0;
        }
        
        // 每30秒更新一次设施效果（更频繁的更新）
        if (this.maintenanceTimer % 1800 === 0) {
            this.updateFacilityEffects();
        }
    }

    // 序列化数据
    serialize() {
        return {
            facilities: Array.from(this.facilities.entries()),
            decorations: Array.from(this.decorations.entries()),
            maintenanceSchedule: Array.from(this.maintenanceSchedule.entries())
        };
    }

    // 反序列化数据
    deserialize(data) {
        if (data.facilities) {
            this.facilities = new Map(data.facilities);
        }
        if (data.decorations) {
            this.decorations = new Map(data.decorations);
        }
        if (data.maintenanceSchedule) {
            this.maintenanceSchedule = new Map(data.maintenanceSchedule);
        }
        
        // 恢复后立即更新效果
        this.updateFacilityEffects();
    }
}

// 导出类供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FacilityManager };
}