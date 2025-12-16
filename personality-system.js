// 个性系统 - 管理员工的个性特征和行为模式
class PersonalitySystem {
    constructor() {
        // 五大人格特征的描述
        this.personalityTraits = {
            extroversion: {
                name: '外向性',
                description: '社交活跃度和能量水平',
                lowDescription: '内向、安静、独立',
                highDescription: '外向、活跃、社交'
            },
            conscientiousness: {
                name: '尽责性',
                description: '组织性和责任感',
                lowDescription: '随性、灵活、创意',
                highDescription: '有序、负责、勤奋'
            },
            agreeableness: {
                name: '宜人性',
                description: '合作性和信任度',
                lowDescription: '竞争、直接、独立',
                highDescription: '合作、友善、信任'
            },
            neuroticism: {
                name: '神经质',
                description: '情绪稳定性',
                lowDescription: '冷静、稳定、自信',
                highDescription: '敏感、焦虑、情绪化'
            },
            openness: {
                name: '开放性',
                description: '对新体验的开放程度',
                lowDescription: '传统、实用、保守',
                highDescription: '创新、好奇、想象力'
            }
        };

        // 技能类型定义
        this.skillTypes = {
            productivity: {
                name: '生产力',
                description: '完成任务的效率',
                icon: '⚡'
            },
            creativity: {
                name: '创造力',
                description: '创新和解决问题的能力',
                icon: '💡'
            },
            leadership: {
                name: '领导力',
                description: '影响和指导他人的能力',
                icon: '👑'
            },
            teamwork: {
                name: '团队合作',
                description: '与他人协作的能力',
                icon: '🤝'
            },
            technical: {
                name: '技术能力',
                description: '专业技术技能',
                icon: '🔧'
            }
        };
    }

    // 生成随机个性特征
    generatePersonality() {
        const personality = {};
        
        // 为每个特征生成0-100的随机值
        Object.keys(this.personalityTraits).forEach(trait => {
            personality[trait] = Math.floor(Math.random() * 101);
        });

        return personality;
    }

    // 生成技能属性
    generateSkills() {
        const skills = {};
        
        // 为每个技能生成30-90的随机值（避免极端值）
        Object.keys(this.skillTypes).forEach(skill => {
            skills[skill] = 30 + Math.floor(Math.random() * 61);
        });

        return skills;
    }

    // 生成初始状态
    generateInitialState() {
        return {
            mood: 50 + Math.floor(Math.random() * 31), // 50-80
            energy: 70 + Math.floor(Math.random() * 31), // 70-100
            stress: Math.floor(Math.random() * 31), // 0-30
            relationships: new Map()
        };
    }

    // 获取个性特征的描述
    getPersonalityDescription(employee) {
        const descriptions = [];
        
        Object.entries(employee.personality).forEach(([trait, value]) => {
            const traitInfo = this.personalityTraits[trait];
            if (value >= 70) {
                descriptions.push(traitInfo.highDescription);
            } else if (value <= 30) {
                descriptions.push(traitInfo.lowDescription);
            }
        });

        return descriptions.slice(0, 3); // 返回最多3个主要特征
    }

    // 计算两个员工的兼容性
    calculateCompatibility(employee1, employee2) {
        if (!employee1.personality || !employee2.personality) {
            return 50; // 默认兼容性
        }

        let compatibility = 0;
        let totalWeight = 0;

        // 外向性匹配 - 相似的外向性水平更兼容，但也考虑互补
        const extroversionDiff = Math.abs(employee1.personality.extroversion - employee2.personality.extroversion);
        const extroversionAvg = (employee1.personality.extroversion + employee2.personality.extroversion) / 2;
        
        // 如果都是中等外向性，或者一个内向一个外向但不极端，兼容性较好
        let extroversionScore;
        if (extroversionDiff < 30) {
            extroversionScore = 85; // 相似性好
        } else if (extroversionDiff > 60 && extroversionAvg > 40 && extroversionAvg < 80) {
            extroversionScore = 75; // 互补性好
        } else {
            extroversionScore = 60; // 一般兼容性
        }
        compatibility += extroversionScore * 0.25;
        totalWeight += 0.25;

        // 宜人性 - 高宜人性的人与大多数人兼容，双方都高宜人性最佳
        const agreeablenessAvg = (employee1.personality.agreeableness + employee2.personality.agreeableness) / 2;
        const agreeablenessMin = Math.min(employee1.personality.agreeableness, employee2.personality.agreeableness);
        const agreeablenessScore = agreeablenessAvg * 0.7 + agreeablenessMin * 0.3;
        compatibility += agreeablenessScore * 0.3;
        totalWeight += 0.3;

        // 尽责性 - 相似的尽责性水平更好合作，但极端差异会有冲突
        const conscientiousnessDiff = Math.abs(employee1.personality.conscientiousness - employee2.personality.conscientiousness);
        let conscientiousnessScore;
        if (conscientiousnessDiff < 25) {
            conscientiousnessScore = 90; // 工作风格相似
        } else if (conscientiousnessDiff < 50) {
            conscientiousnessScore = 70; // 可以互补
        } else {
            conscientiousnessScore = 40; // 工作风格冲突
        }
        compatibility += conscientiousnessScore * 0.2;
        totalWeight += 0.2;

        // 神经质 - 低神经质更容易相处，双方都高神经质会相互影响
        const neuroticismAvg = (employee1.personality.neuroticism + employee2.personality.neuroticism) / 2;
        const neuroticismMax = Math.max(employee1.personality.neuroticism, employee2.personality.neuroticism);
        let neuroticismScore;
        if (neuroticismAvg < 30) {
            neuroticismScore = 95; // 都很稳定
        } else if (neuroticismAvg < 60) {
            neuroticismScore = 75; // 中等稳定性
        } else if (neuroticismMax > 80) {
            neuroticismScore = 30; // 至少一方很不稳定
        } else {
            neuroticismScore = 50; // 都比较敏感
        }
        compatibility += neuroticismScore * 0.15;
        totalWeight += 0.15;

        // 开放性 - 适度差异可以互补，但极端差异会有理念冲突
        const opennessDiff = Math.abs(employee1.personality.openness - employee2.personality.openness);
        const opennessAvg = (employee1.personality.openness + employee2.personality.openness) / 2;
        let opennessScore;
        if (opennessDiff < 20) {
            opennessScore = 80; // 理念相似
        } else if (opennessDiff < 50 && opennessAvg > 40) {
            opennessScore = 85; // 互补且都有一定开放性
        } else if (opennessDiff > 70) {
            opennessScore = 45; // 理念差异太大
        } else {
            opennessScore = 65; // 一般兼容性
        }
        compatibility += opennessScore * 0.1;
        totalWeight += 0.1;

        const finalCompatibility = Math.round(compatibility / totalWeight);
        
        // 存储兼容性到关系映射中
        if (employee1.relationships && employee2.relationships) {
            employee1.relationships.set(employee2.name || 'unknown', finalCompatibility);
            employee2.relationships.set(employee1.name || 'unknown', finalCompatibility);
        }

        return finalCompatibility;
    }

    // 根据个性调整行为参数
    modifyBehaviorParameters(employee) {
        if (!employee.personality) return {};

        const modifications = {};

        // 外向性影响社交频率和活动偏好
        const extroversion = employee.personality.extroversion;
        modifications.socialActivityChance = 0.3 + (extroversion / 100) * 0.5; // 0.3-0.8
        modifications.restTime = 1.4 - (extroversion / 100) * 0.6; // 0.8-1.4
        modifications.groupActivityPreference = extroversion / 100; // 0-1
        modifications.communicationFrequency = 0.5 + (extroversion / 100) * 0.8; // 0.5-1.3

        // 尽责性影响工作时间和效率
        const conscientiousness = employee.personality.conscientiousness;
        modifications.workTime = 0.7 + (conscientiousness / 100) * 0.6; // 0.7-1.3
        modifications.productivity = 0.8 + (conscientiousness / 100) * 0.4; // 0.8-1.2
        modifications.taskFocusTime = 0.6 + (conscientiousness / 100) * 0.8; // 0.6-1.4
        modifications.organizationLevel = conscientiousness / 100; // 0-1

        // 宜人性影响合作和冲突处理
        const agreeableness = employee.personality.agreeableness;
        modifications.cooperationLevel = 0.5 + (agreeableness / 100) * 0.5; // 0.5-1.0
        modifications.conflictAvoidance = agreeableness / 100; // 0-1
        modifications.helpingBehavior = 0.3 + (agreeableness / 100) * 0.7; // 0.3-1.0
        modifications.teamworkEfficiency = 0.7 + (agreeableness / 100) * 0.6; // 0.7-1.3

        // 神经质影响压力和情绪稳定性
        const neuroticism = employee.personality.neuroticism;
        modifications.stressAccumulation = 0.5 + (neuroticism / 100) * 1.0; // 0.5-1.5
        modifications.complaintFrequency = 0.6 + (neuroticism / 100) * 0.8; // 0.6-1.4
        modifications.emotionalStability = 1.5 - (neuroticism / 100) * 1.0; // 0.5-1.5
        modifications.recoveryRate = 1.3 - (neuroticism / 100) * 0.6; // 0.7-1.3

        // 开放性影响创新和适应性
        const openness = employee.personality.openness;
        modifications.newActivityChance = 0.5 + (openness / 100) * 0.8; // 0.5-1.3
        modifications.adaptability = 0.6 + (openness / 100) * 0.6; // 0.6-1.2
        modifications.creativityBonus = openness / 100; // 0-1
        modifications.learningSpeed = 0.8 + (openness / 100) * 0.4; // 0.8-1.2

        return modifications;
    }

    // 计算心情对工作效率的影响
    calculateMoodEffect(employee) {
        if (typeof employee.mood !== 'number') return 1.0;

        // 心情对效率的非线性影响
        let moodEffect = 1.0;
        
        if (employee.mood >= 80) {
            // 心情很好时，效率显著提升
            moodEffect = 1.3 + (employee.mood - 80) * 0.01; // 1.3-1.5
        } else if (employee.mood >= 60) {
            // 心情较好时，效率适度提升
            moodEffect = 1.1 + (employee.mood - 60) * 0.01; // 1.1-1.3
        } else if (employee.mood >= 40) {
            // 心情一般时，效率正常
            moodEffect = 0.9 + (employee.mood - 40) * 0.01; // 0.9-1.1
        } else if (employee.mood >= 20) {
            // 心情较差时，效率下降
            moodEffect = 0.6 + (employee.mood - 20) * 0.015; // 0.6-0.9
        } else {
            // 心情很差时，效率严重下降
            moodEffect = 0.3 + employee.mood * 0.015; // 0.3-0.6
        }

        // 考虑精力水平的影响
        if (typeof employee.energy === 'number') {
            const energyMultiplier = 0.7 + (employee.energy / 100) * 0.6; // 0.7-1.3
            moodEffect *= energyMultiplier;
        }

        // 考虑压力水平的影响
        if (typeof employee.stress === 'number') {
            const stressMultiplier = 1.2 - (employee.stress / 100) * 0.5; // 0.7-1.2
            moodEffect *= stressMultiplier;
        }

        // 限制在合理范围内
        return Math.max(0.3, Math.min(2.0, moodEffect));
    }

    // 计算精力对活动能力的影响
    calculateEnergyEffect(employee) {
        if (!employee.energy) return 1.0;

        // 精力低于30时显著影响活动能力
        if (employee.energy < 30) {
            return 0.5;
        } else if (employee.energy < 50) {
            return 0.8;
        } else if (employee.energy > 80) {
            return 1.2;
        }
        
        return 1.0;
    }

    // 更新员工状态（心情、精力、压力）
    updateEmployeeState(employee, deltaTime) {
        if (typeof employee.mood !== 'number' || typeof employee.energy !== 'number' || typeof employee.stress !== 'number') return;

        const behaviorMods = this.modifyBehaviorParameters(employee);

        // 根据活动更新状态
        switch (employee.state) {
            case 'working':
                // 工作时精力下降，压力可能增加
                const energyDrain = 0.08 * deltaTime * (behaviorMods.taskFocusTime || 1.0);
                employee.energy = Math.max(0, employee.energy - energyDrain);
                
                // 尽责性高的人工作时心情好，但也要考虑工作负荷
                if (employee.personality && employee.personality.conscientiousness > 70) {
                    const moodGain = 0.04 * deltaTime * (behaviorMods.productivity || 1.0);
                    employee.mood = Math.min(100, employee.mood + moodGain);
                } else if (employee.personality && employee.personality.conscientiousness < 30) {
                    // 不尽责的人工作时可能感到压力
                    const stressGain = 0.12 * deltaTime * (behaviorMods.stressAccumulation || 1.0);
                    employee.stress = Math.min(100, employee.stress + stressGain);
                }

                // 工作效率影响心情
                const workEfficiency = this.calculateMoodEffect(employee);
                if (workEfficiency > 1.2) {
                    employee.mood = Math.min(100, employee.mood + 0.02 * deltaTime);
                } else if (workEfficiency < 0.8) {
                    employee.stress = Math.min(100, employee.stress + 0.05 * deltaTime);
                }
                break;

            case 'activity':
                // 活动时心情提升，压力减少，但消耗精力
                const activityMoodBonus = 0.15 * deltaTime * (behaviorMods.socialActivityChance || 1.0);
                employee.mood = Math.min(100, employee.mood + activityMoodBonus);
                
                const stressReduction = 0.12 * deltaTime * (behaviorMods.recoveryRate || 1.0);
                employee.stress = Math.max(0, employee.stress - stressReduction);
                
                const activityEnergyDrain = 0.04 * deltaTime;
                employee.energy = Math.max(0, employee.energy - activityEnergyDrain);

                // 外向的人在活动中获得更多能量
                if (employee.personality && employee.personality.extroversion > 70) {
                    employee.energy = Math.min(100, employee.energy + 0.02 * deltaTime);
                }
                break;

            case 'resting':
                // 休息时精力恢复，压力减少
                const energyRecovery = 0.25 * deltaTime * (behaviorMods.recoveryRate || 1.0);
                employee.energy = Math.min(100, employee.energy + energyRecovery);
                
                const restStressReduction = 0.08 * deltaTime * (behaviorMods.emotionalStability || 1.0);
                employee.stress = Math.max(0, employee.stress - restStressReduction);

                // 内向的人在独处时心情更好
                if (employee.personality && employee.personality.extroversion < 30) {
                    employee.mood = Math.min(100, employee.mood + 0.03 * deltaTime);
                }
                break;

            case 'wandering':
                // 闲逛时缓慢恢复精力，但可能增加无聊感
                employee.energy = Math.min(100, employee.energy + 0.1 * deltaTime);
                
                // 开放性低的人闲逛时可能感到无聊
                if (employee.personality && employee.personality.openness < 40) {
                    employee.mood = Math.max(0, employee.mood - 0.02 * deltaTime);
                }
                break;
        }

        // 社交互动影响（如果在活动区域）
        if (employee.currentActivity && employee.state === 'activity') {
            this.processSocialInteraction(employee, deltaTime);
        }

        // 自然状态变化
        const moodTarget = this.calculateBaseMood(employee);
        const moodDiff = moodTarget - employee.mood;
        const moodChangeRate = 0.008 * deltaTime * (behaviorMods.emotionalStability || 1.0);
        employee.mood += moodDiff * moodChangeRate;

        // 精力在非工作时间自然恢复
        if (employee.state !== 'working') {
            const naturalEnergyRecovery = 0.03 * deltaTime;
            employee.energy = Math.min(100, employee.energy + naturalEnergyRecovery);
        }

        // 压力自然缓解
        const naturalStressReduction = 0.015 * deltaTime * (behaviorMods.emotionalStability || 1.0);
        employee.stress = Math.max(0, employee.stress - naturalStressReduction);

        // 极端状态的额外影响
        if (employee.stress > 80) {
            // 高压力影响心情和精力
            employee.mood = Math.max(0, employee.mood - 0.05 * deltaTime);
            employee.energy = Math.max(0, employee.energy - 0.02 * deltaTime);
        }

        if (employee.energy < 20) {
            // 低精力影响心情
            employee.mood = Math.max(0, employee.mood - 0.03 * deltaTime);
        }

        // 确保值在合理范围内
        employee.mood = Math.max(0, Math.min(100, employee.mood));
        employee.energy = Math.max(0, Math.min(100, employee.energy));
        employee.stress = Math.max(0, Math.min(100, employee.stress));
    }

    // 计算基于个性的基础心情
    calculateBaseMood(employee) {
        if (!employee.personality) return 50;

        let baseMood = 50;
        
        // 低神经质的人基础心情更好
        baseMood += (100 - employee.personality.neuroticism) * 0.2;
        
        // 高外向性的人在社交环境中心情更好
        baseMood += employee.personality.extroversion * 0.1;
        
        // 高宜人性的人一般心情较好
        baseMood += employee.personality.agreeableness * 0.1;

        return Math.max(20, Math.min(80, baseMood));
    }

    // 处理社交互动
    processSocialInteraction(employee, deltaTime) {
        if (!employee.currentActivity || !employee.relationships) return;

        // 模拟与其他员工的互动（这里简化处理）
        const interactionChance = 0.1 * deltaTime * (employee.behaviorModifiers?.communicationFrequency || 1.0);
        
        if (Math.random() < interactionChance) {
            // 随机选择一个可能的互动对象（简化版本）
            const moodBonus = employee.personality.extroversion > 50 ? 2 : 1;
            const stressReduction = employee.personality.agreeableness > 50 ? 1.5 : 1;
            
            employee.mood = Math.min(100, employee.mood + moodBonus);
            employee.stress = Math.max(0, employee.stress - stressReduction);
        }
    }

    // 计算员工间的工作协作效率
    calculateTeamworkEfficiency(employee1, employee2) {
        if (!employee1.personality || !employee2.personality) return 1.0;

        const compatibility = this.calculateCompatibility(employee1, employee2);
        const teamworkSkill1 = employee1.skills?.teamwork || 50;
        const teamworkSkill2 = employee2.skills?.teamwork || 50;
        
        // 兼容性和团队合作技能的综合影响
        const compatibilityFactor = compatibility / 100; // 0-1
        const skillFactor = (teamworkSkill1 + teamworkSkill2) / 200; // 0-1
        
        // 综合效率计算
        const efficiency = 0.5 + (compatibilityFactor * 0.3) + (skillFactor * 0.4);
        
        return Math.max(0.5, Math.min(1.5, efficiency));
    }

    // 根据个性调整员工的决策倾向
    getDecisionTendency(employee, situation) {
        if (!employee.personality) return 'neutral';

        const personality = employee.personality;
        
        switch (situation) {
            case 'conflict':
                if (personality.agreeableness > 70) return 'avoid';
                if (personality.agreeableness < 30) return 'confront';
                return 'mediate';
                
            case 'new_task':
                if (personality.openness > 70) return 'embrace';
                if (personality.openness < 30) return 'resist';
                return 'cautious';
                
            case 'team_activity':
                if (personality.extroversion > 70) return 'lead';
                if (personality.extroversion < 30) return 'follow';
                return 'participate';
                
            case 'deadline_pressure':
                if (personality.conscientiousness > 70) return 'organize';
                if (personality.neuroticism > 70) return 'stress';
                return 'adapt';
                
            default:
                return 'neutral';
        }
    }

    // 根据个性调整员工行为模式 - 增强版本
    adjustBehaviorPattern(employee, baseAction) {
        if (!employee.personality) return baseAction;

        const personality = employee.personality;
        const adjustedAction = { ...baseAction };

        // 外向性影响社交行为
        if (personality.extroversion > 70) {
            // 高外向性：更频繁的社交互动
            adjustedAction.socialInteractionChance = (adjustedAction.socialInteractionChance || 0.3) * 1.5;
            adjustedAction.groupActivityPreference = true;
            adjustedAction.communicationStyle = 'direct';
        } else if (personality.extroversion < 30) {
            // 低外向性：更少的社交互动，偏好独立工作
            adjustedAction.socialInteractionChance = (adjustedAction.socialInteractionChance || 0.3) * 0.5;
            adjustedAction.groupActivityPreference = false;
            adjustedAction.communicationStyle = 'reserved';
        }

        // 尽责性影响工作行为
        if (personality.conscientiousness > 70) {
            // 高尽责性：更长的工作时间，更高的任务完成率
            adjustedAction.workDuration = (adjustedAction.workDuration || 1.0) * 1.3;
            adjustedAction.taskCompletionRate = (adjustedAction.taskCompletionRate || 0.8) * 1.2;
            adjustedAction.organizationLevel = 'high';
        } else if (personality.conscientiousness < 30) {
            // 低尽责性：更短的工作时间，更多的休息
            adjustedAction.workDuration = (adjustedAction.workDuration || 1.0) * 0.7;
            adjustedAction.breakFrequency = (adjustedAction.breakFrequency || 1.0) * 1.4;
            adjustedAction.organizationLevel = 'low';
        }

        // 宜人性影响合作行为
        if (personality.agreeableness > 70) {
            // 高宜人性：更愿意帮助他人，避免冲突
            adjustedAction.helpingBehavior = (adjustedAction.helpingBehavior || 0.5) * 1.6;
            adjustedAction.conflictAvoidance = true;
            adjustedAction.teamworkEfficiency = (adjustedAction.teamworkEfficiency || 1.0) * 1.2;
        } else if (personality.agreeableness < 30) {
            // 低宜人性：更独立，可能产生冲突
            adjustedAction.helpingBehavior = (adjustedAction.helpingBehavior || 0.5) * 0.6;
            adjustedAction.conflictProneness = true;
            adjustedAction.independentWork = true;
        }

        // 神经质影响情绪稳定性
        if (personality.neuroticism > 70) {
            // 高神经质：更容易受压力影响，情绪波动大
            adjustedAction.stressReaction = 'high';
            adjustedAction.emotionalVolatility = true;
            adjustedAction.recoveryTime = (adjustedAction.recoveryTime || 1.0) * 1.5;
        } else if (personality.neuroticism < 30) {
            // 低神经质：情绪稳定，抗压能力强
            adjustedAction.stressReaction = 'low';
            adjustedAction.emotionalStability = true;
            adjustedAction.recoveryTime = (adjustedAction.recoveryTime || 1.0) * 0.7;
        }

        // 开放性影响创新和适应性
        if (personality.openness > 70) {
            // 高开放性：喜欢新事物，创造力强
            adjustedAction.noveltySeekingBehavior = true;
            adjustedAction.creativityBonus = (adjustedAction.creativityBonus || 1.0) * 1.3;
            adjustedAction.adaptabilityRate = (adjustedAction.adaptabilityRate || 1.0) * 1.4;
        } else if (personality.openness < 30) {
            // 低开放性：偏好传统，抗拒变化
            adjustedAction.routinePreference = true;
            adjustedAction.changeResistance = true;
            adjustedAction.adaptabilityRate = (adjustedAction.adaptabilityRate || 1.0) * 0.6;
        }

        return adjustedAction;
    }

    // 计算员工间的工作兼容性（增强版本）
    calculateWorkCompatibility(employee1, employee2, taskType = 'general') {
        if (!employee1.personality || !employee2.personality) return 0.5;

        const p1 = employee1.personality;
        const p2 = employee2.personality;
        let compatibility = 0;

        // 基础兼容性计算
        const baseCompatibility = this.calculateCompatibility(employee1, employee2) / 100;

        // 根据任务类型调整兼容性
        switch (taskType) {
            case 'creative':
                // 创意任务：开放性和外向性更重要
                const creativityMatch = 1 - Math.abs(p1.openness - p2.openness) / 100;
                const collaborationBonus = Math.min(p1.extroversion, p2.extroversion) / 100;
                compatibility = baseCompatibility * 0.6 + creativityMatch * 0.3 + collaborationBonus * 0.1;
                break;

            case 'analytical':
                // 分析任务：尽责性和低神经质更重要
                const focusMatch = Math.min(p1.conscientiousness, p2.conscientiousness) / 100;
                const stabilityBonus = (200 - p1.neuroticism - p2.neuroticism) / 200;
                compatibility = baseCompatibility * 0.5 + focusMatch * 0.3 + stabilityBonus * 0.2;
                break;

            case 'leadership':
                // 领导任务：需要一个领导者和一个追随者
                const leadershipGap = Math.abs(p1.extroversion - p2.extroversion) / 100;
                const trustLevel = Math.min(p1.agreeableness, p2.agreeableness) / 100;
                compatibility = baseCompatibility * 0.6 + leadershipGap * 0.2 + trustLevel * 0.2;
                break;

            case 'routine':
                // 常规任务：相似的尽责性水平最好
                const routineMatch = 1 - Math.abs(p1.conscientiousness - p2.conscientiousness) / 100;
                const stabilityMatch = 1 - Math.abs(p1.neuroticism - p2.neuroticism) / 100;
                compatibility = baseCompatibility * 0.5 + routineMatch * 0.3 + stabilityMatch * 0.2;
                break;

            default:
                compatibility = baseCompatibility;
        }

        return Math.max(0.1, Math.min(1.0, compatibility));
    }

    // 根据心情和个性计算工作效率（增强版本）
    calculateWorkEfficiency(employee, workType = 'general') {
        let efficiency = this.calculateMoodEffect(employee);

        if (!employee.personality) return efficiency;

        const personality = employee.personality;

        // 根据工作类型和个性调整效率
        switch (workType) {
            case 'creative':
                // 创意工作：开放性和心情影响更大
                const creativityBonus = personality.openness / 100;
                const moodBonus = employee.mood > 60 ? (employee.mood - 60) / 100 : 0;
                efficiency *= (1 + creativityBonus * 0.3 + moodBonus * 0.2);
                break;

            case 'analytical':
                // 分析工作：尽责性和低神经质有利
                const focusBonus = personality.conscientiousness / 100;
                const stabilityBonus = (100 - personality.neuroticism) / 100;
                efficiency *= (1 + focusBonus * 0.2 + stabilityBonus * 0.15);
                break;

            case 'social':
                // 社交工作：外向性和宜人性重要
                const socialBonus = personality.extroversion / 100;
                const likeabilityBonus = personality.agreeableness / 100;
                efficiency *= (1 + socialBonus * 0.25 + likeabilityBonus * 0.15);
                break;

            case 'routine':
                // 常规工作：尽责性最重要
                const routineBonus = personality.conscientiousness / 100;
                efficiency *= (1 + routineBonus * 0.3);
                break;
        }

        // 压力对效率的负面影响
        if (employee.stress > 50) {
            const stressImpact = (employee.stress - 50) / 100;
            const stressResistance = (100 - personality.neuroticism) / 100;
            efficiency *= (1 - stressImpact * 0.3 * (1 - stressResistance));
        }

        return Math.max(0.2, Math.min(2.0, efficiency));
    }

    // 模拟员工间的社交互动效果
    simulateSocialInteraction(employee1, employee2, interactionType = 'casual') {
        if (!employee1.personality || !employee2.personality) return { success: false };

        const compatibility = this.calculateCompatibility(employee1, employee2);
        const p1 = employee1.personality;
        const p2 = employee2.personality;

        let interactionResult = {
            success: compatibility > 50,
            moodChange1: 0,
            moodChange2: 0,
            stressChange1: 0,
            stressChange2: 0,
            relationshipChange: 0
        };

        // 根据互动类型调整结果
        switch (interactionType) {
            case 'collaboration':
                // 合作互动
                if (compatibility > 70) {
                    interactionResult.moodChange1 = 5;
                    interactionResult.moodChange2 = 5;
                    interactionResult.relationshipChange = 3;
                } else if (compatibility < 30) {
                    interactionResult.stressChange1 = 3;
                    interactionResult.stressChange2 = 3;
                    interactionResult.relationshipChange = -2;
                }
                break;

            case 'conflict':
                // 冲突处理
                const conflictResolution1 = p1.agreeableness > 60 ? 'cooperative' : 'competitive';
                const conflictResolution2 = p2.agreeableness > 60 ? 'cooperative' : 'competitive';
                
                if (conflictResolution1 === 'cooperative' && conflictResolution2 === 'cooperative') {
                    interactionResult.moodChange1 = 2;
                    interactionResult.moodChange2 = 2;
                    interactionResult.relationshipChange = 5;
                } else if (conflictResolution1 === 'competitive' && conflictResolution2 === 'competitive') {
                    interactionResult.stressChange1 = 8;
                    interactionResult.stressChange2 = 8;
                    interactionResult.relationshipChange = -5;
                }
                break;

            case 'casual':
                // 日常社交
                const socialBonus1 = p1.extroversion > 50 ? 2 : 1;
                const socialBonus2 = p2.extroversion > 50 ? 2 : 1;
                
                if (compatibility > 60) {
                    interactionResult.moodChange1 = socialBonus1;
                    interactionResult.moodChange2 = socialBonus2;
                    interactionResult.relationshipChange = 1;
                }
                break;
        }

        // 应用互动结果
        this.applyInteractionEffects(employee1, interactionResult.moodChange1, interactionResult.stressChange1);
        this.applyInteractionEffects(employee2, interactionResult.moodChange2, interactionResult.stressChange2);

        // 更新关系
        if (employee1.relationships && employee2.relationships) {
            const currentRelation1 = employee1.relationships.get(employee2.name) || 50;
            const currentRelation2 = employee2.relationships.get(employee1.name) || 50;
            
            employee1.relationships.set(employee2.name, 
                Math.max(0, Math.min(100, currentRelation1 + interactionResult.relationshipChange)));
            employee2.relationships.set(employee1.name, 
                Math.max(0, Math.min(100, currentRelation2 + interactionResult.relationshipChange)));
        }

        return interactionResult;
    }

    // 应用社交互动效果
    applyInteractionEffects(employee, moodChange, stressChange) {
        if (typeof employee.mood === 'number') {
            employee.mood = Math.max(0, Math.min(100, employee.mood + moodChange));
        }
        if (typeof employee.stress === 'number') {
            employee.stress = Math.max(0, Math.min(100, employee.stress + stressChange));
        }
    }

    // 获取员工的个性化标签
    getPersonalityTags(employee) {
        if (!employee.personality) return [];

        const tags = [];

        // 基于个性特征生成标签
        if (employee.personality.extroversion > 75) tags.push('社交达人');
        else if (employee.personality.extroversion < 25) tags.push('独行侠');

        if (employee.personality.conscientiousness > 75) tags.push('工作狂');
        else if (employee.personality.conscientiousness < 25) tags.push('自由派');

        if (employee.personality.agreeableness > 75) tags.push('和事佬');
        else if (employee.personality.agreeableness < 25) tags.push('直言者');

        if (employee.personality.neuroticism > 75) tags.push('敏感型');
        else if (employee.personality.neuroticism < 25) tags.push('淡定哥');

        if (employee.personality.openness > 75) tags.push('创新者');
        else if (employee.personality.openness < 25) tags.push('传统派');

        // 基于技能生成标签
        const topSkill = Object.entries(employee.skills || {})
            .sort(([,a], [,b]) => b - a)[0];
        
        if (topSkill && topSkill[1] > 80) {
            const skillName = this.skillTypes[topSkill[0]]?.name;
            if (skillName) tags.push(`${skillName}专家`);
        }

        return tags.slice(0, 3); // 最多返回3个标签
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersonalitySystem;
}