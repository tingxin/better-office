# 办公室生存游戏 - 插件开发指南 v2.0

## 概述

欢迎来到办公室生存游戏插件开发！这个插件系统允许开发者创建解决方案来改善虚拟办公室环境，减少员工抱怨，提升工作满意度，并提供丰富的视觉效果。

## 新功能特性

### 🎨 视觉效果系统
- 独立的效果画布层
- 粒子效果系统
- 实时动画渲染
- 可配置的效果参数

### 📊 增强的抱怨管理
- 具体抱怨内容映射
- 抱怨频率控制
- 个性化抱怨减少

### ⚙️ 可配置插件系统
- 效果触发间隔配置
- 抱怨减少率配置
- 插件主题色和图标

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

### 抱怨管理

```javascript
// 减少特定类型抱怨
this.api.reduceComplaints('空调问题', 0.5); // 减少50%

// 减少员工抱怨频率
this.api.reduceComplaintFrequency(null, 1.5); // 增加50%抱怨间隔

// 提升员工满意度
this.api.boostEmployeeMorale();
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

### 🎨 视觉效果API

```javascript
// 获取效果系统
const effectSystem = this.api.getEffectSystem();

// 添加空调凉风效果
effectSystem.addCoolingEffect(areas);

// 添加打印机工作效果
effectSystem.addPrinterWorkingEffect(printers);

// 添加通用粒子效果
effectSystem.addParticleEffect(x, y, type, count);
// type: 'sparkle', 'maintenance', 'cooling', 'paper'

// 清除特定效果
effectSystem.clearEffect(effectId);

// 清除所有效果
effectSystem.clearAllEffects();
```

## 开发示例

### 示例1：带视觉效果的清洁服务插件

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

## 最佳实践

1. **渐进式改善**：不要一次性解决所有问题，让改善效果逐步显现
2. **成本考虑**：为解决方案设置合理的成本和维护费用
3. **定期维护**：使用定时器实现持续的改善效果
4. **用户反馈**：在控制台输出有意义的日志信息
5. **资源清理**：在 `onDeactivate` 中清理所有定时器和资源

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

开始创建你的第一个插件，让办公室变得更美好！🚀