# 办公室生存游戏 - 插件开发指南 v3.0

## 概述

欢迎来到办公室生存游戏插件开发！这个插件系统允许开发者创建解决方案来改善虚拟办公室环境，减少员工抱怨，提升工作满意度，并提供丰富的视觉效果。

## 🆕 最新功能特性

### 🎨 视觉效果系统 (VisualEffectSystem)
- **独立画布层**：在办公室工作区上方叠加的独立Canvas层
- **粒子效果系统**：支持多种粒子类型（凉风、纸张、闪光、维护等）
- **实时动画渲染**：60FPS流畅动画效果
- **进度条效果**：显示设备工作状态的动态进度条
- **可配置参数**：效果间隔、持续时间、粒子数量等

### 📊 智能抱怨管理系统
- **具体抱怨内容映射**：将抱怨类型映射到具体的抱怨文本
- **抱怨频率控制**：动态调整员工抱怨触发频率
- **个性化抱怨减少**：基于员工个性的差异化处理
- **实时统计监控**：追踪各类抱怨的数量变化

### ⚙️ 高级插件配置系统
- **效果触发间隔**：自定义视觉效果显示频率
- **抱怨减少率**：精确控制每次抱怨减少的百分比
- **插件主题**：自定义图标和颜色主题
- **动态配置更新**：运行时修改插件参数

## 快速开始

### 1. 插件基础结构

所有插件都必须继承 `OfficePlugin` 基类：

```javascript
class MyPlugin extends OfficePlugin {
    constructor() {
        super(
            '插件名称',
            '插件描述',
            ['目标抱怨类型1', '目标抱怨类型2'],
            '作者名称',
            '版本号',
            {
                effectInterval: 5000,      // 效果触发间隔(毫秒)
                complaintReduction: 0.1,   // 抱怨减少率
                icon: '🔌',               // 插件图标
                color: '#4CAF50'          // 主题色
            }
        );
    }
    
    // 初始化具体抱怨映射
    initComplaintMapping() {
        this.complaintMapping.set('抱怨类型', [
            '具体抱怨内容1',
            '具体抱怨内容2'
        ]);
    }
    
    onActivate() {
        // 插件激活时的逻辑
    }
    
    onDeactivate() {
        // 插件停用时的清理逻辑
    }
    
    // 实现视觉效果
    triggerVisualEffect() {
        // 添加视觉效果逻辑
    }
}
```

### 2. 可用的抱怨类型

- 厕所问题
- 空调问题  
- 会议室问题
- 清洁问题
- 电脑问题
- 打印机问题
- 网络问题
- 饮水机问题
- 噪音问题
- 异味问题
- 空间问题
- 电话问题
- 同事问题
- 排队问题
- 停车问题
- 健康问题
- 光线问题
- 座椅问题
- 食堂问题

## 插件API参考

### 数据获取方法

```javascript
// 获取抱怨统计
const stats = this.api.getComplaintStats();

// 获取员工列表
const employees = this.api.getEmployees();

// 获取办公设施
const facilities = this.api.getFacilities();

// 获取视觉效果系统
const effectSystem = this.api.getEffectSystem();
```

### 解决方案管理

```javascript
// 实施解决方案
this.api.implementSolution('solution-id', {
    type: 'facility-upgrade', // 或 'maintenance-service', 'employee-benefit'
    cost: 10000,
    monthlyFee: 500, // 可选
    efficiency: 0.8
});

// 移除解决方案
this.api.removeSolution('solution-id');
```

### 📊 抱怨管理系统

#### 基础抱怨控制

```javascript
// 减少特定类型抱怨数量
this.api.reduceComplaints('空调问题', 0.5); // 减少50%的空调问题抱怨

// 减少员工抱怨频率（增加抱怨间隔时间）
this.api.reduceComplaintFrequency(null, 1.5); // 所有员工抱怨频率降低50%
this.api.reduceComplaintFrequency(specificEmployees, 2.0); // 特定员工抱怨频率降低100%

// 提升员工满意度
this.api.boostEmployeeMorale(); // 提升所有员工满意度
this.api.boostEmployeeMorale(specificEmployees); // 提升特定员工满意度
```

#### 抱怨映射系统

```javascript
// 在initComplaintMapping方法中定义具体抱怨内容
initComplaintMapping() {
    // 将抱怨类型映射到具体的抱怨文本
    this.complaintMapping.set('空调问题', [
        '今天办公室好热啊，空调能不能开大一点',
        '办公室太冷了，能调高一点温度吗',
        '空调风太大了，吹得我头疼'
    ]);
    
    this.complaintMapping.set('打印机问题', [
        '打印机又坏了，我的文件还等着打印呢',
        '打印机卡纸了，谁来修一下',
        '打印机没墨了，怎么办'
    ]);
    
    // 插件也可以间接影响其他类型的抱怨
    this.complaintMapping.set('排队问题', [
        '复印机前排了好长的队，什么时候轮到我'
    ]);
}
```

#### 抱怨统计监控

```javascript
// 获取当前抱怨统计
const stats = this.api.getComplaintStats();
console.log('当前抱怨统计:', stats);

// 监控特定类型抱怨的变化
const beforeCount = stats.get('空调问题') || 0;
this.api.reduceComplaints('空调问题', 0.3);
const afterCount = this.api.getComplaintStats().get('空调问题') || 0;
console.log(`空调问题抱怨从 ${beforeCount} 减少到 ${afterCount}`);
```

### 设施管理

```javascript
// 添加新的活动区域
this.api.addActivityArea({
    name: '新设施',
    x: 100,
    y: 100,
    width: 50,
    height: 40,
    icon: '🏢',
    color: '#E3F2FD',
    borderColor: '#2196F3'
});
```

### 🎨 视觉效果系统API

#### 基础效果方法

```javascript
// 获取效果系统实例
const effectSystem = this.api.getEffectSystem();

// 添加空调凉风效果 - 显示蓝色凉风粒子
effectSystem.addCoolingEffect(areas);
// areas: 可选，指定区域数组，默认使用空调相关区域

// 添加打印机工作效果 - 显示绿色进度条和纸张动画
effectSystem.addPrinterWorkingEffect(printers);
// printers: 可选，指定打印机区域数组

// 添加通用粒子效果
effectSystem.addParticleEffect(x, y, type, count);
// x, y: 粒子生成位置
// type: 粒子类型 ('sparkle', 'maintenance', 'cooling', 'paper')
// count: 粒子数量 (默认10)
```

#### 粒子效果类型详解

```javascript
// 闪光效果 - 适用于升级、维修完成等场景
effectSystem.addParticleEffect(x, y, 'sparkle', 8);

// 维护效果 - 绿色粒子，适用于设备维护场景
effectSystem.addParticleEffect(x, y, 'maintenance', 5);

// 凉风效果 - 蓝色透明粒子，向上飘动
effectSystem.addParticleEffect(x, y, 'cooling', 6);

// 纸张效果 - 白色矩形粒子，带旋转动画
effectSystem.addParticleEffect(x, y, 'paper', 3);
```

#### 高级效果控制

```javascript
// 清除特定效果（通过效果ID）
effectSystem.clearEffect('printer_打印机名称');

// 清除所有效果
effectSystem.clearAllEffects();

// 停止动画循环（销毁时使用）
effectSystem.stopAnimation();

// 销毁效果系统
effectSystem.destroy();
```

#### 自定义粒子效果

```javascript
// 在triggerVisualEffect方法中创建自定义效果
triggerVisualEffect() {
    if (this.effectSystem) {
        // 创建多个区域的组合效果
        const areas = [
            { x: 300, y: 100, width: 200, height: 150 },
            { x: 550, y: 200, width: 100, height: 100 }
        ];
        
        areas.forEach(area => {
            // 在区域内随机位置生成粒子
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
```

## 🚀 完整开发示例

### 示例1：智能照明系统插件（完整实现）

这是一个完整的插件示例，展示了如何实现视觉效果、抱怨减少和配置管理：

```javascript
// 智能照明系统插件 - 解决光线问题
class SmartLightingPlugin extends OfficePlugin {
    constructor() {
        super(
            '智能照明系统',
            '安装智能LED照明系统，自动调节光线亮度，减少眼疲劳',
            ['光线问题', '健康问题'],
            '照明专家',
            '1.0.0',
            {
                effectInterval: 4000,      // 4秒触发一次照明效果
                complaintReduction: 0.18,  // 每次减少18%抱怨
                icon: '💡',
                color: '#FFC107'
            }
        );
        this.lightingZones = [];
        this.brightnessLevel = 2; // 1=暗, 2=正常, 3=明亮
    }
    
    // 初始化具体抱怨映射
    initComplaintMapping() {
        this.complaintMapping.set('光线问题', [
            '这个灯光太刺眼了，眼睛都花了',
            '办公室太暗了，看不清电脑屏幕',
            '灯光闪烁，影响工作效率'
        ]);
        
        this.complaintMapping.set('健康问题', [
            '坐了一上午，腰都酸了，得起来活动活动',
            '眼睛好累，需要休息一下'
        ]);
    }
    
    onActivate() {
        console.log('💡 正在启动智能照明系统...');
        
        // 实施照明升级解决方案
        this.api.implementSolution('smart-lighting', {
            type: 'facility-upgrade',
            cost: 35000,
            monthlyFee: 800,
            efficiency: 0.9
        });
        
        // 立即改善光线问题
        this.api.reduceComplaints('光线问题', 0.8);
        this.api.reduceComplaints('健康问题', 0.3);
        
        // 减少员工抱怨频率
        this.api.reduceComplaintFrequency(null, 1.4);
        
        // 设置照明控制区域
        this.setupLightingZones();
        
        // 提升员工满意度
        this.api.boostEmployeeMorale();
        
        console.log('✅ 智能照明系统已启动，办公室光线得到优化');
    }
    
    onDeactivate() {
        this.api.removeSolution('smart-lighting');
        this.lightingZones = [];
        console.log('💡 智能照明系统已关闭');
    }
    
    // 设置照明区域
    setupLightingZones() {
        // 定义需要照明的区域
        this.lightingZones = [
            { name: '主办公区', x: 280, y: 90, width: 450, height: 280 },
            { name: '会议区', x: 300, y: 10, width: 120, height: 55 },
            { name: '休息区', x: 300, y: 420, width: 160, height: 65 }
        ];
        
        // 添加照明控制面板
        this.api.addActivityArea({
            name: '照明控制面板',
            x: 230, y: 300,
            width: 35, height: 25,
            icon: '💡',
            color: '#FFF3E0',
            borderColor: '#FFC107'
        });
    }
    
    // 触发视觉效果
    triggerVisualEffect() {
        if (this.effectSystem) {
            // 在照明区域添加光线效果
            this.lightingZones.forEach(zone => {
                // 添加温暖的光线粒子
                for (let i = 0; i < 6; i++) {
                    this.effectSystem.addParticleEffect(
                        zone.x + Math.random() * zone.width,
                        zone.y + Math.random() * zone.height,
                        'sparkle',
                        2
                    );
                }
            });
            
            // 在控制面板位置添加特殊效果
            this.effectSystem.addParticleEffect(247, 312, 'maintenance', 4);
        }
    }
    
    // 插件特有方法：调节亮度
    adjustBrightness(level) {
        this.brightnessLevel = Math.max(1, Math.min(3, level));
        const effectiveness = [0, 0.15, 0.18, 0.22][this.brightnessLevel];
        
        // 动态更新配置
        this.updateConfig({
            complaintReduction: effectiveness,
            effectInterval: Math.max(3000, 5000 - this.brightnessLevel * 500)
        });
        
        // 根据亮度级别减少抱怨
        this.api.reduceComplaints('光线问题', effectiveness);
        
        console.log(`💡 照明亮度调节至级别 ${this.brightnessLevel}`);
        
        // 触发即时视觉效果
        this.triggerVisualEffect();
    }
    
    // 获取照明状态
    getLightingStatus() {
        const levels = ['', '柔和', '标准', '明亮'];
        return {
            level: this.brightnessLevel,
            description: levels[this.brightnessLevel],
            zones: this.lightingZones.length,
            effectiveness: this.config.complaintReduction
        };
    }
}

// 自动注册插件
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.game) {
                const lightingPlugin = new SmartLightingPlugin();
                window.game.registerPlugin(lightingPlugin);
                console.log('💡 智能照明插件已注册');
                
                // 可选：添加全局控制函数
                window.adjustLighting = (level) => {
                    const plugin = window.game.plugins.get('智能照明系统');
                    if (plugin && plugin.isActive) {
                        plugin.adjustBrightness(level);
                    }
                };
            }
        }, 1500);
    });
}
```

### 示例2：带视觉效果的清洁服务插件

```javascript
class CleaningServicePlugin extends OfficePlugin {
    constructor() {
        super(
            '专业清洁服务',
            '定期清洁办公室，保持环境整洁，显示清洁效果',
            ['清洁问题', '异味问题'],
            '清洁专家',
            '2.0.0',
            {
                effectInterval: 6000,      // 6秒触发一次清洁效果
                complaintReduction: 0.15,  // 每次减少15%抱怨
                icon: '🧹',
                color: '#FF9800'
            }
        );
        this.cleaningAreas = [];
    }
    
    // 初始化抱怨映射
    initComplaintMapping() {
        this.complaintMapping.set('清洁问题', [
            '办公室好脏啊，什么时候能打扫一下',
            '垃圾桶都满了，没人清理'
        ]);
        this.complaintMapping.set('异味问题', [
            '谁在吃榴莲啊，味道太重了',
            '办公室有股怪味'
        ]);
    }
    
    onActivate() {
        // 实施清洁服务
        this.api.implementSolution('cleaning-service', {
            type: 'maintenance-service',
            cost: 5000,
            monthlyFee: 2000
        });
        
        // 立即改善清洁状况
        this.api.reduceComplaints('清洁问题', 0.8);
        this.api.reduceComplaints('异味问题', 0.6);
        
        // 减少抱怨频率
        this.api.reduceComplaintFrequency(null, 1.3);
        
        // 设置清洁区域
        this.setupCleaningAreas();
    }
    
    onDeactivate() {
        this.api.removeSolution('cleaning-service');
    }
    
    setupCleaningAreas() {
        // 定义需要清洁的区域
        this.cleaningAreas = [
            { x: 300, y: 100, width: 400, height: 300 }, // 主办公区
            { x: 500, y: 420, width: 200, height: 100 }  // 休息区
        ];
    }
    
    // 触发视觉效果
    triggerVisualEffect() {
        if (this.effectSystem) {
            // 在清洁区域添加清洁粒子效果
            this.cleaningAreas.forEach(area => {
                for (let i = 0; i < 8; i++) {
                    this.effectSystem.addParticleEffect(
                        area.x + Math.random() * area.width,
                        area.y + Math.random() * area.height,
                        'sparkle',
                        3
                    );
                }
            });
        }
    }
}
```

### 示例2：网络升级插件

```javascript
class NetworkUpgradePlugin extends OfficePlugin {
    constructor() {
        super(
            '网络基础设施升级',
            '升级网络设备，提供稳定高速的网络连接',
            ['网络问题', '电脑问题']
        );
    }
    
    onActivate() {
        this.api.implementSolution('network-upgrade', {
            type: 'facility-upgrade',
            cost: 25000,
            efficiency: 0.95
        });
        
        // 大幅减少网络问题
        this.api.reduceComplaints('网络问题', 0.9);
        this.api.reduceComplaints('电脑问题', 0.3);
        
        // 添加网络监控中心
        this.api.addActivityArea({
            name: '网络中心',
            x: 280,
            y: 250,
            width: 40,
            height: 30,
            icon: '🌐',
            color: '#E3F2FD',
            borderColor: '#2196F3'
        });
    }
    
    onDeactivate() {
        this.api.removeSolution('network-upgrade');
    }
}
```

## 插件注册

### 自动注册（推荐）

在插件文件末尾添加：

```javascript
if (typeof window !== 'undefined' && window.game) {
    const myPlugin = new MyPlugin();
    window.game.registerPlugin(myPlugin);
}
```

### 手动注册

```javascript
const myPlugin = new MyPlugin();
game.registerPlugin(myPlugin);
game.activatePlugin('插件名称');
```

## 插件管理命令

在浏览器控制台中使用：

```javascript
// 查看所有插件
game.getPluginList();

// 激活插件
game.activatePlugin('插件名称');

// 停用插件
game.deactivatePlugin('插件名称');

// 查看已实施的解决方案
game.getSolutions();

// 查看抱怨统计
game.pluginAPI.getComplaintStats();
```

## 🎯 确保插件有效降低抱怨的策略

### 1. 抱怨减少机制设计

```javascript
onActivate() {
    // 策略1：立即减少相关抱怨（初始效果）
    this.api.reduceComplaints('目标抱怨类型', 0.6); // 立即减少60%
    
    // 策略2：降低抱怨触发频率（持续效果）
    this.api.reduceComplaintFrequency(null, 1.5); // 抱怨间隔增加50%
    
    // 策略3：提升整体满意度（间接效果）
    this.api.boostEmployeeMorale();
    
    // 策略4：通过定时器持续改善
    this.startContinuousImprovement();
}

startContinuousImprovement() {
    // 每次视觉效果触发时也减少抱怨
    // 这通过基类的processComplaintReduction()自动处理
    console.log(`🔄 持续改善系统已启动，每${this.config.effectInterval}ms减少${this.config.complaintReduction * 100}%抱怨`);
}
```

### 2. 抱怨映射最佳实践

```javascript
initComplaintMapping() {
    // ✅ 正确：映射具体的抱怨内容
    this.complaintMapping.set('空调问题', [
        '今天办公室好热啊，空调能不能开大一点',
        '办公室太冷了，能调高一点温度吗'
    ]);
    
    // ✅ 正确：一个插件可以影响多种抱怨类型
    this.complaintMapping.set('异味问题', [
        '谁在吃榴莲啊，味道太重了' // 空调也能改善空气流通
    ]);
    
    // ❌ 错误：不要映射不相关的抱怨类型
    // this.complaintMapping.set('打印机问题', [...]);
}
```

### 3. 效果参数优化

```javascript
constructor() {
    super(
        '插件名称',
        '插件描述',
        ['目标抱怨类型'],
        '作者',
        '版本',
        {
            // 关键参数调优
            effectInterval: 5000,      // 建议3-8秒，太频繁会影响性能
            complaintReduction: 0.15,  // 建议10-25%，太高会让游戏失去挑战性
            icon: '🔧',
            color: '#4CAF50'
        }
    );
}
```

### 4. 监控和验证抱怨减少效果

```javascript
onActivate() {
    // 记录激活前的抱怨数量
    const beforeStats = new Map(this.api.getComplaintStats());
    
    // 执行抱怨减少操作
    this.api.reduceComplaints('空调问题', 0.5);
    
    // 验证效果
    setTimeout(() => {
        const afterStats = this.api.getComplaintStats();
        const before = beforeStats.get('空调问题') || 0;
        const after = afterStats.get('空调问题') || 0;
        const reduction = before - after;
        
        console.log(`📊 抱怨减少效果验证:`);
        console.log(`   空调问题: ${before} → ${after} (减少${reduction}个)`);
        console.log(`   减少率: ${((reduction / before) * 100).toFixed(1)}%`);
    }, 1000);
}
```

### 5. 动态效果调整

```javascript
// 根据当前抱怨情况动态调整效果强度
triggerVisualEffect() {
    const currentComplaints = this.api.getComplaintStats().get('空调问题') || 0;
    
    // 抱怨越多，效果越强
    const intensity = Math.min(10, Math.max(3, currentComplaints));
    
    if (this.effectSystem) {
        this.effectSystem.addCoolingEffect();
        
        // 根据抱怨数量调整粒子数量
        for (let i = 0; i < intensity; i++) {
            this.effectSystem.addParticleEffect(
                300 + Math.random() * 400,
                100 + Math.random() * 300,
                'cooling',
                2
            );
        }
    }
    
    // 动态调整抱怨减少率
    const dynamicReduction = Math.min(0.3, 0.1 + (currentComplaints * 0.01));
    this.api.reduceComplaints('空调问题', dynamicReduction);
}
```

## 💡 最佳实践

### 插件设计原则

1. **渐进式改善**：不要一次性解决所有问题，让改善效果逐步显现
2. **成本效益平衡**：为解决方案设置合理的成本和维护费用
3. **持续性效果**：使用定时器实现持续的改善效果，而不是一次性的
4. **视觉反馈**：确保用户能看到插件的工作效果
5. **数据驱动**：基于实际抱怨数据调整插件效果

### 性能优化

1. **效果频率控制**：避免过于频繁的视觉效果触发
2. **粒子数量限制**：单次不要生成过多粒子
3. **资源清理**：在 `onDeactivate` 中清理所有定时器和资源
4. **内存管理**：避免创建过多的临时对象

### 用户体验

1. **即时反馈**：激活插件后立即显示效果
2. **状态可见**：通过控制台日志让用户了解插件工作状态
3. **配置灵活**：提供插件特有的配置方法
4. **错误处理**：优雅处理各种异常情况

## 调试技巧

1. 使用 `console.log` 输出调试信息
2. 通过 `game.pluginAPI.getComplaintStats()` 监控抱怨变化
3. 使用浏览器开发者工具查看插件状态
4. 测试插件的激活和停用功能

## 贡献指南

1. 创建新的插件文件在 `plugins/` 目录下
2. 遵循命名规范：`plugin-name-plugin.js`
3. 包含完整的注释和文档
4. 测试插件的所有功能
5. 提供使用示例

## 📋 快速参考

### 常用API速查

```javascript
// 插件基础
class MyPlugin extends OfficePlugin { ... }
this.api.getEffectSystem()
this.api.getComplaintStats()

// 抱怨管理
this.api.reduceComplaints(type, rate)
this.api.reduceComplaintFrequency(employees, factor)
this.api.boostEmployeeMorale()

// 视觉效果
effectSystem.addCoolingEffect(areas)
effectSystem.addPrinterWorkingEffect(printers)
effectSystem.addParticleEffect(x, y, type, count)

// 设施管理
this.api.addActivityArea(area)
this.api.implementSolution(id, config)
```

### 抱怨类型列表

| 类型 | 示例抱怨内容 | 适用插件类型 |
|------|-------------|-------------|
| 空调问题 | "办公室好热啊" | 温控系统 |
| 打印机问题 | "打印机又坏了" | 设备维护 |
| 清洁问题 | "办公室好脏啊" | 清洁服务 |
| 光线问题 | "灯光太刺眼了" | 照明系统 |
| 网络问题 | "网络又断了" | 网络升级 |
| 噪音问题 | "太吵了" | 隔音改造 |

### 粒子效果类型

| 类型 | 外观 | 适用场景 |
|------|------|----------|
| sparkle | 彩色闪光 | 升级完成、维修 |
| maintenance | 绿色圆点 | 设备维护 |
| cooling | 蓝色透明 | 空调、通风 |
| paper | 白色矩形 | 打印机、文档 |

### 配置参数建议

| 参数 | 建议值 | 说明 |
|------|--------|------|
| effectInterval | 3000-8000ms | 视觉效果触发间隔 |
| complaintReduction | 0.1-0.25 | 每次抱怨减少率 |
| 粒子数量 | 3-10个 | 单次生成的粒子数 |

---

🎉 **开始创建你的第一个插件，让办公室变得更美好！**

需要帮助？查看现有插件示例：
- `plugins/air-conditioning-plugin.js` - 空调系统
- `plugins/printer-maintenance-plugin.js` - 打印机维护

💡 **提示**：在浏览器控制台中使用 `game.getPluginList()` 查看所有已注册的插件！