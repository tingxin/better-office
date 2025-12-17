// 插件API类 - 为插件开发者提供的接口
class PluginAPI {
    constructor(game) {
        this.game = game;
        this.effectSystem = new VisualEffectSystem(game);
    }

    // 获取抱怨统计数据
    getComplaintStats() {
        return new Map(this.game.complaintStats);
    }

    // 获取员工列表
    getEmployees() {
        return [...this.game.employees];
    }

    // 获取办公室设施
    getFacilities() {
        return {
            desks: [...this.game.desks],
            activityAreas: [...this.game.activityAreas],
            computers: [...this.game.computers]
        };
    }

    // 获取视觉效果系统
    getEffectSystem() {
        return this.effectSystem;
    }

    // 实施解决方案
    implementSolution(solutionId, config) {
        if (this.game.solutions.has(solutionId)) {
            console.warn(`解决方案 ${solutionId} 已经实施`);
            return false;
        }

        this.game.solutions.set(solutionId, {
            id: solutionId,
            config: config,
            implementedAt: Date.now(),
            active: true
        });

        console.log(`✅ 解决方案 "${solutionId}" 已实施`);
        return true;
    }

    // 移除解决方案
    removeSolution(solutionId) {
        if (this.game.solutions.delete(solutionId)) {
            console.log(`❌ 解决方案 "${solutionId}" 已移除`);
            return true;
        }
        return false;
    }

    // 减少特定类型的抱怨
    reduceComplaints(category, reductionRate = 0.5) {
        if (this.game.complaintStats.has(category)) {
            const currentCount = this.game.complaintStats.get(category);
            const newCount = Math.max(0, Math.floor(currentCount * (1 - reductionRate)));
            this.game.complaintStats.set(category, newCount);
            console.log(`📉 ${category} 抱怨减少了 ${Math.round(reductionRate * 100)}%`);
        }
    }

    // 减少员工抱怨触发频率
    reduceComplaintFrequency(employees = null, reductionFactor = 1.5) {
        const targetEmployees = employees || this.game.employees;
        targetEmployees.forEach(employee => {
            if (employee.nextComplaintTime > 0) {
                employee.nextComplaintTime *= reductionFactor;
            }
        });
        console.log(`🔇 员工抱怨频率已降低 ${Math.round((reductionFactor - 1) * 100)}%`);
    }

    // 添加新的活动区域
    addActivityArea(area) {
        this.game.activityAreas.push(area);
        console.log(`🏢 新增活动区域: ${area.name}`);
    }

    // 提升员工满意度
    boostEmployeeMorale(employees = null) {
        const targetEmployees = employees || this.game.employees;
        targetEmployees.forEach(employee => {
            // 减少抱怨频率
            employee.nextComplaintTime = Math.max(employee.nextComplaintTime, 1800);
        });
        console.log(`😊 员工满意度提升`);
    }
}

// 插件基类 - 所有插件都应该继承这个类
class OfficePlugin {
    constructor(name, description, targetComplaints = [], author = '未知作者', version = '1.0.0', config = {}) {
        this.name = name;
        this.description = description;
        this.targetComplaints = targetComplaints;
        this.author = author;
        this.version = version;
        this.isActive = false;
        this.api = null;

        // 插件配置
        this.config = {
            effectInterval: 5000, // 默认5秒触发一次效果
            complaintReduction: 0.1, // 默认每次减少10%抱怨
            icon: '🔌', // 插件图标
            color: '#4CAF50', // 插件主题色
            ...config
        };

        // 视觉效果系统
        this.effectSystem = null;
        this.effectTimer = null;

        // 抱怨映射 - 将抱怨类型映射到具体的抱怨ID
        this.complaintMapping = new Map();
    }

    // 插件初始化
    init(api) {
        this.api = api;
        this.effectSystem = api.getEffectSystem();
        this.initComplaintMapping();
        console.log(`🔌 插件 "${this.name}" 已加载`);
    }

    // 初始化抱怨映射
    initComplaintMapping() {
        // 子类可以重写此方法来定义具体的抱怨映射
        this.targetComplaints.forEach(complaint => {
            this.complaintMapping.set(complaint, [complaint]);
        });
    }

    // 激活插件
    activate() {
        if (this.isActive) return false;

        this.isActive = true;
        this.onActivate();
        this.startEffectTimer();
        console.log(`▶️ 插件 "${this.name}" 已激活`);
        return true;
    }

    // 停用插件
    deactivate() {
        if (!this.isActive) return false;

        this.isActive = false;
        this.stopEffectTimer();
        this.onDeactivate();
        console.log(`⏸️ 插件 "${this.name}" 已停用`);
        return true;
    }

    // 开始效果定时器
    startEffectTimer() {
        if (this.effectTimer) {
            clearInterval(this.effectTimer);
        }

        this.effectTimer = setInterval(() => {
            if (this.isActive) {
                this.triggerVisualEffect();
                this.processComplaintReduction();
            }
        }, this.config.effectInterval);
    }

    // 停止效果定时器
    stopEffectTimer() {
        if (this.effectTimer) {
            clearInterval(this.effectTimer);
            this.effectTimer = null;
        }
    }

    // 触发视觉效果 - 子类需要实现
    triggerVisualEffect() {
        // 子类实现具体的视觉效果
    }

    // 处理抱怨减少
    processComplaintReduction() {
        this.complaintMapping.forEach((complaintIds, category) => {
            complaintIds.forEach(complaintId => {
                this.api.reduceComplaints(complaintId, this.config.complaintReduction);
            });
        });
    }

    // 子类需要实现的方法
    onActivate() {
        throw new Error('插件必须实现 onActivate 方法');
    }

    onDeactivate() {
        throw new Error('插件必须实现 onDeactivate 方法');
    }

    // 获取插件状态
    getStatus() {
        return {
            name: this.name,
            description: this.description,
            author: this.author,
            version: this.version,
            isActive: this.isActive,
            targetComplaints: this.targetComplaints,
            config: this.config,
            icon: this.config.icon,
            color: this.config.color
        };
    }

    // 更新配置
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (this.isActive) {
            this.stopEffectTimer();
            this.startEffectTimer();
        }
    }
}

// 视觉效果系统 - 管理插件的视觉效果
class VisualEffectSystem {
    constructor(game) {
        this.game = game;
        this.effectCanvas = null;
        this.effectCtx = null;
        this.activeEffects = new Map();
        this.particles = [];
        this.animationId = null;

        this.initEffectCanvas();
    }

    // 初始化效果画布
    initEffectCanvas() {
        // 创建效果层画布
        this.effectCanvas = document.createElement('canvas');
        this.effectCanvas.width = this.game.width;
        this.effectCanvas.height = this.game.height;
        this.effectCanvas.style.position = 'absolute';
        this.effectCanvas.style.top = '0';
        this.effectCanvas.style.left = '0';
        this.effectCanvas.style.pointerEvents = 'none';
        this.effectCanvas.style.zIndex = '10';
        this.effectCtx = this.effectCanvas.getContext('2d');

        // 将效果画布添加到游戏容器
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.position = 'relative';
            gameContainer.appendChild(this.effectCanvas);
        }

        // 开始动画循环
        this.startAnimation();
    }

    // 开始动画循环
    startAnimation() {
        const animate = () => {
            this.updateEffects();
            this.renderEffects();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    // 停止动画循环
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // 添加空调凉风效果
    addCoolingEffect(areas = null) {
        const targetAreas = areas || this.game.activityAreas.filter(area =>
            area.name.includes('空调') || area.name.includes('温控')
        );

        targetAreas.forEach(area => {
            for (let i = 0; i < 8; i++) {
                this.particles.push({
                    type: 'cooling',
                    x: area.x + Math.random() * area.width,
                    y: area.y + area.height,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -1 - Math.random() * 2,
                    life: 1.0,
                    maxLife: 2.0 + Math.random() * 2,
                    size: 2 + Math.random() * 3
                });
            }
        });

        console.log('❄️ 空调凉风效果已添加');
    }

    // 添加打印机工作效果
    addPrinterWorkingEffect(printers = null) {
        const targetPrinters = printers || this.game.activityAreas.filter(area =>
            area.name.includes('打印机')
        );

        targetPrinters.forEach(printer => {
            // 添加绿色进度条效果
            this.activeEffects.set(`printer_${printer.name}`, {
                type: 'printer_progress',
                x: printer.x,
                y: printer.y - 10,
                width: printer.width,
                height: 4,
                progress: 0,
                duration: 3000, // 3秒完成一个打印任务
                startTime: Date.now()
            });

            // 添加纸张飞出效果
            for (let i = 0; i < 3; i++) {
                this.particles.push({
                    type: 'paper',
                    x: printer.x + printer.width * 0.8,
                    y: printer.y + printer.height * 0.5,
                    vx: 1 + Math.random(),
                    vy: -0.5 + Math.random() * 0.5,
                    life: 1.0,
                    maxLife: 1.5 + Math.random(),
                    size: 3 + Math.random() * 2,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.2
                });
            }
        });

        console.log('🖨️ 打印机工作效果已添加');
    }

    // 添加通用粒子效果
    addParticleEffect(x, y, type, count = 10) {
        for (let i = 0; i < count; i++) {
            let particle;

            switch (type) {
                case 'sparkle':
                    particle = {
                        type: 'sparkle',
                        x: x + (Math.random() - 0.5) * 20,
                        y: y + (Math.random() - 0.5) * 20,
                        vx: (Math.random() - 0.5) * 3,
                        vy: (Math.random() - 0.5) * 3,
                        life: 1.0,
                        maxLife: 1.0 + Math.random(),
                        size: 1 + Math.random() * 2,
                        color: `hsl(${Math.random() * 60 + 40}, 70%, 60%)`
                    };
                    break;

                case 'maintenance':
                    particle = {
                        type: 'maintenance',
                        x: x + (Math.random() - 0.5) * 30,
                        y: y + (Math.random() - 0.5) * 30,
                        vx: (Math.random() - 0.5) * 1,
                        vy: -1 - Math.random(),
                        life: 1.0,
                        maxLife: 2.0 + Math.random(),
                        size: 2 + Math.random() * 2,
                        color: '#4CAF50'
                    };
                    break;

                default:
                    particle = {
                        type: 'generic',
                        x: x,
                        y: y,
                        vx: (Math.random() - 0.5) * 2,
                        vy: -Math.random() * 2,
                        life: 1.0,
                        maxLife: 1.5,
                        size: 2,
                        color: '#2196F3'
                    };
            }

            this.particles.push(particle);
        }
    }

    // 更新效果
    updateEffects() {
        const currentTime = Date.now();

        // 更新粒子
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 1 / 60; // 假设60FPS

            if (particle.rotation !== undefined) {
                particle.rotation += particle.rotationSpeed;
            }

            // 重力效果
            if (particle.type === 'paper') {
                particle.vy += 0.02;
            }

            return particle.life > 0;
        });

        // 更新活动效果
        this.activeEffects.forEach((effect, key) => {
            if (effect.type === 'printer_progress') {
                const elapsed = currentTime - effect.startTime;
                effect.progress = Math.min(1, elapsed / effect.duration);

                if (effect.progress >= 1) {
                    // 重新开始进度
                    effect.startTime = currentTime;
                    effect.progress = 0;
                }
            }
        });
    }

    // 渲染效果
    renderEffects() {
        // 清空画布
        this.effectCtx.clearRect(0, 0, this.effectCanvas.width, this.effectCanvas.height);

        // 渲染活动效果
        this.activeEffects.forEach(effect => {
            if (effect.type === 'printer_progress') {
                this.renderProgressBar(effect);
            }
        });

        // 渲染粒子
        this.particles.forEach(particle => {
            this.renderParticle(particle);
        });
    }

    // 渲染进度条
    renderProgressBar(effect) {
        const ctx = this.effectCtx;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(effect.x, effect.y, effect.width, effect.height);

        // 进度
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(effect.x, effect.y, effect.width * effect.progress, effect.height);

        // 边框
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 1;
        ctx.strokeRect(effect.x, effect.y, effect.width, effect.height);
    }

    // 渲染粒子
    renderParticle(particle) {
        const ctx = this.effectCtx;
        const alpha = particle.life / particle.maxLife;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (particle.rotation !== undefined) {
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.translate(-particle.x, -particle.y);
        }

        switch (particle.type) {
            case 'cooling':
                ctx.fillStyle = `rgba(173, 216, 230, ${alpha})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'paper':
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fillRect(
                    particle.x - particle.size / 2,
                    particle.y - particle.size / 2,
                    particle.size,
                    particle.size * 1.4
                );
                ctx.strokeStyle = `rgba(200, 200, 200, ${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.strokeRect(
                    particle.x - particle.size / 2,
                    particle.y - particle.size / 2,
                    particle.size,
                    particle.size * 1.4
                );
                break;

            case 'sparkle':
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'maintenance':
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                break;

            default:
                ctx.fillStyle = particle.color || '#2196F3';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
        }

        ctx.restore();
    }

    // 清除特定效果
    clearEffect(effectId) {
        this.activeEffects.delete(effectId);
    }

    // 清除所有效果
    clearAllEffects() {
        this.activeEffects.clear();
        this.particles = [];
    }

    // 销毁效果系统
    destroy() {
        this.stopAnimation();
        this.clearAllEffects();

        if (this.effectCanvas && this.effectCanvas.parentNode) {
            this.effectCanvas.parentNode.removeChild(this.effectCanvas);
        }
    }
}

// 简化的路径寻找类
class PathFinder {
    constructor(game) {
        this.game = game;
    }

    findPath(startX, startY, endX, endY, employee) {
        const path = [];
        const steps = 20;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = startX + (endX - startX) * t;
            const y = startY + (endY - startY) * t;

            if (this.isPositionSafe(x, y, employee)) {
                path.push({ x, y });
            } else {
                const offsetX = (Math.random() - 0.5) * 40;
                const offsetY = (Math.random() - 0.5) * 40;
                const newX = Math.max(0, Math.min(this.game.width - 32, x + offsetX));
                const newY = Math.max(0, Math.min(this.game.height - 32, y + offsetY));

                if (this.isPositionSafe(newX, newY, employee)) {
                    path.push({ x: newX, y: newY });
                }
            }
        }

        return path.length > 0 ? path : [{ x: endX, y: endY }];
    }

    isPositionSafe(x, y, employee) {
        if (x < 0 || y < 0 || x + 32 > this.game.width || y + 32 > this.game.height) {
            return false;
        }

        for (const desk of this.game.desks) {
            if (this.checkCollision(x, y, 32, 32, desk.x, desk.y, desk.width, desk.height)) {
                return false;
            }
        }

        for (const other of this.game.employees) {
            if (other !== employee &&
                this.checkCollision(x, y, 32, 32, other.x, other.y, other.width, other.height)) {
                return false;
            }
        }

        return true;
    }

    checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }
}

// 游戏主类
class OfficeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.employees = [];
        this.desks = [];
        this.computers = [];
        this.gameTime = 0;
        this.isPaused = false;

        this.pathFinder = new PathFinder(this);

        // 增强功能管理器
        this.gameManager = null;

        // 个性系统
        this.personalitySystem = new PersonalitySystem();

        // 性能优化器
        this.performanceOptimizer = null;

        // 用户体验增强器
        this.uxEnhancer = null;

        // 错误恢复系统
        this.errorRecoverySystem = null;

        // 角色图片
        this.characterImages = [];
        this.gameStarted = false;

        // 随机名字库
        this.names = [
            '张伟', '李娜', '王强', '刘敏', '陈杰', '杨丽', '赵磊', '孙静',
            '周涛', '吴萍', '郑浩', '王芳', '李明', '张丽', '刘伟', '陈静',
            '杨强', '赵敏', '孙伟', '周丽', '吴杰', '郑萍', '王涛', '李静',
            '张强', '刘丽', '陈伟', '杨敏', '赵杰', '孙萍', '周强', '吴丽',
            '马超', '林芳', '何军', '高敏', '朱华', '徐丽', '宋涛', '罗静',
            '梁伟', '韩娜', '冯强', '曹敏', '彭杰', '董丽', '薛磊', '范静'
        ];
        this.usedNames = new Set(); // 跟踪已使用的名字

        // 抱怨统计系统
        this.complaintStats = new Map();
        this.complaintCategories = [
            '厕所问题', '空调问题', '会议室问题', '清洁问题', '电脑问题',
            '打印机问题', '网络问题', '饮水机问题', '噪音问题', '异味问题',
            '空间问题', '电话问题', '同事问题', '排队问题', '停车问题',
            '健康问题', '光线问题', '座椅问题', '食堂问题'
        ];

        // 插件系统
        this.plugins = new Map();
        this.pluginAPI = new PluginAPI(this);
        this.solutions = new Map(); // 存储已实施的解决方案

        // 员工抱怨内容库
        this.complaints = [
            '我想上厕所，但是不知道厕所有没有人，真的不想白跑一趟',
            '今天办公室好热啊，空调能不能开大一点',
            '想预定会议室开会，但不知道什么时候有空',
            '办公室好脏啊，什么时候能打扫一下',
            '我的电脑又卡了，这样怎么工作啊',
            '打印机又坏了，我的文件还等着打印呢',
            '网络怎么又断了，重要邮件都收不到',
            '饮水机没水了，我好渴啊',
            '旁边同事说话太大声了，我都没法专心工作',
            '谁在吃榴莲啊，味道太重了',
            '会议室太小了，这么多人挤在一起',
            '电话铃声一直响，烦死了',
            '找个同事讨论问题，怎么都不在座位上',
            '复印机前排了好长的队，什么时候轮到我',
            '茶水间人太多了，想喝杯咖啡都要等',
            '停车位又没了，明天得早点来',
            '坐了一上午，腰都酸了，得起来活动活动',
            '这个灯光太刺眼了，眼睛都花了',
            '这椅子坐着真不舒服，腰疼',
            '食堂排队太长了，都不知道什么时候能吃上饭'
        ];

        // 重新设计的办公室活动区域 (900x560px，避免与办公桌重叠)
        this.activityAreas = [
            // 上方区域 (办公桌上方)
            { name: '会议室', x: 300, y: 10, width: 120, height: 55, icon: '📋', color: '#F3E5F5', borderColor: '#9C27B0' },
            { name: '饮水机', x: 440, y: 10, width: 45, height: 55, icon: '🚰', color: '#E3F2FD', borderColor: '#2196F3' },
            { name: '打印机', x: 505, y: 10, width: 70, height: 55, icon: '🖨️', color: '#E8F5E8', borderColor: '#4CAF50' },

            // 右侧区域 (办公桌右侧)
            { name: '茶水间', x: 790, y: 100, width: 60, height: 70, icon: '🫖', color: '#E8F8F5', borderColor: '#52C41A' },
            { name: '储物间', x: 790, y: 190, width: 60, height: 60, icon: '📦', color: '#FFF7E6', borderColor: '#FA8C16' },

            // 下方区域 (办公桌下方，增加与办公桌的间距)
            { name: '休息区', x: 300, y: 420, width: 160, height: 65, icon: '☕', color: '#FFF3E0', borderColor: '#FF9800' },
            { name: '洗手间', x: 480, y: 420, width: 90, height: 65, icon: '🚻', color: '#FCE4EC', borderColor: '#E91E63' }
        ];

        // 重新布置的装饰元素 (900x560px，避免重叠)
        this.decorations = [
            // 上方装饰
            { type: 'clock', x: 270, y: 5, emoji: '🕐' },
            { type: 'plant', x: 600, y: 5, emoji: '🌿' },

            // 左侧装饰 (公告栏旁边)
            { type: 'plant', x: 230, y: 70, emoji: '🌱' },
            { type: 'whiteboard', x: 230, y: 150, emoji: '📋' },
            { type: 'plant', x: 230, y: 230, emoji: '🪴' },

            // 右侧装饰
            { type: 'bookshelf', x: 800, y: 280, emoji: '📚' },
            { type: 'plant', x: 820, y: 350, emoji: '🌵' },

            // 下方装饰
            { type: 'plant', x: 270, y: 500, emoji: '🌺' },
            { type: 'plant', x: 600, y: 500, emoji: '🌸' }
        ];

        this.loadImages();
    }

    loadImages() {
        this.createCharacterImages();
        this.gameStarted = true;
        this.init();
        this.gameLoop();
    }

    createCharacterImages() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F39C12'
        ];

        colors.forEach((color, index) => {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');

            this.drawModernCharacter(ctx, color, index);
            this.characterImages.push(canvas);
        });
    }

    drawModernCharacter(ctx, color, index) {
        ctx.clearRect(0, 0, 32, 32);

        // 阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.ellipse(16, 30, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 头部 - 圆形
        ctx.fillStyle = '#FDBCB4';
        ctx.beginPath();
        ctx.arc(16, 12, 8, 0, Math.PI * 2);
        ctx.fill();

        // 头发样式
        const hairStyles = ['#8B4513', '#2C1810', '#FFD700', '#FF6347', '#4B0082'];
        ctx.fillStyle = hairStyles[index % hairStyles.length];
        ctx.beginPath();
        ctx.arc(16, 10, 9, Math.PI, Math.PI * 2);
        ctx.fill();

        // 眼睛
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(13, 11, 1.5, 0, Math.PI * 2);
        ctx.arc(19, 11, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // 微笑
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(16, 13, 3, 0, Math.PI);
        ctx.stroke();

        // 身体 - 渐变效果
        const gradient = ctx.createLinearGradient(0, 16, 0, 28);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.darkenColor(color, 20));

        ctx.fillStyle = gradient;
        ctx.fillRect(10, 16, 12, 12);

        // 手臂
        ctx.fillStyle = color;
        ctx.fillRect(6, 18, 4, 8);
        ctx.fillRect(22, 18, 4, 8);

        // 手
        ctx.fillStyle = '#FDBCB4';
        ctx.beginPath();
        ctx.arc(8, 28, 2, 0, Math.PI * 2);
        ctx.arc(24, 28, 2, 0, Math.PI * 2);
        ctx.fill();

        // 腿
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(12, 28, 3, 6);
        ctx.fillRect(17, 28, 3, 6);

        // 鞋子
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(11, 33, 5, 2);
        ctx.fillRect(16, 33, 5, 2);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    init() {
        if (!this.gameStarted) return;

        this.createOfficeLayout();

        for (let i = 0; i < 12; i++) {
            this.addRandomEmployee();
        }

        // 初始化增强功能管理器
        this.initializeEnhancements();
    }

    // 初始化增强功能
    initializeEnhancements() {
        console.log('🔧 开始初始化增强功能...');
        console.log('GameManager 类型:', typeof GameManager);

        // 初始化性能优化器
        if (typeof PerformanceOptimizer !== 'undefined') {
            try {
                this.performanceOptimizer = new PerformanceOptimizer(this);
                this.performanceOptimizer.initialize();
                console.log('⚡ 性能优化器已启用');
            } catch (error) {
                console.error('❌ 性能优化器初始化失败:', error);
            }
        }

        // 初始化用户体验增强器
        if (typeof UXEnhancer !== 'undefined') {
            try {
                this.uxEnhancer = new UXEnhancer(this);
                this.uxEnhancer.initialize();
                window.uxEnhancer = this.uxEnhancer; // 全局访问
                console.log('✨ 用户体验增强器已启用');
            } catch (error) {
                console.error('❌ 用户体验增强器初始化失败:', error);
            }
        }

        // 初始化错误恢复系统
        if (typeof ErrorRecoverySystem !== 'undefined') {
            try {
                this.errorRecoverySystem = new ErrorRecoverySystem(this);
                this.errorRecoverySystem.initialize();
                console.log('🛡️ 错误恢复系统已启用');
            } catch (error) {
                console.error('❌ 错误恢复系统初始化失败:', error);
            }
        }

        // 确保GameManager类已加载
        if (typeof GameManager !== 'undefined') {
            try {
                this.gameManager = new GameManager(this);
                this.gameManager.initialize();
                console.log('🎮 游戏增强功能已启用');

                // 测试系统访问
                const resourceSystem = this.gameManager.getResourceSystem();
                if (resourceSystem) {
                    console.log('💰 资源系统已就绪，初始资金:', resourceSystem.getResource('money'));
                }

                const achievementSystem = this.gameManager.getAchievementSystem();
                if (achievementSystem) {
                    console.log('🏆 成就系统已就绪，成就数量:', achievementSystem.achievements.size);
                }

            } catch (error) {
                console.error('❌ 增强功能初始化失败:', error);
            }
        } else {
            console.warn('⚠️ GameManager未加载，增强功能不可用');
        }
    }

    createOfficeLayout() {
        const deskWidth = 70;
        const deskHeight = 42;
        const spacing = 30;
        const startX = 270; // 为公告栏留空间
        const startY = 85; // 为上方活动区域留空间

        // 优化布局：4行4列的办公桌，适配900x560画布
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const x = startX + col * (deskWidth + spacing);
                const y = startY + row * (deskHeight + spacing);

                // 确保不超出右侧边界，为右侧活动区域留空间
                if (x + deskWidth > 770) continue;
                // 确保不超出下方边界，为下方活动区域留空间
                if (y + deskHeight > 380) continue;

                const desk = {
                    x: x,
                    y: y,
                    width: deskWidth,
                    height: deskHeight,
                    occupied: false,
                    hasDrawer: Math.random() > 0.5,
                    workPosition: {
                        x: x + deskWidth / 2 - 16,
                        y: y + deskHeight / 2 - 16
                    }
                };
                this.desks.push(desk);

                const computer = {
                    x: x + 12,
                    y: y + 12,
                    width: 22,
                    height: 18,
                    isOn: Math.random() > 0.2
                };
                this.computers.push(computer);
            }
        }
    }

    addRandomEmployee() {
        if (!this.gameStarted) return;

        const imageIndex = Math.floor(Math.random() * this.characterImages.length);

        // 获取未使用的名字
        let name;
        const availableNames = this.names.filter(n => !this.usedNames.has(n));
        if (availableNames.length > 0) {
            name = availableNames[Math.floor(Math.random() * availableNames.length)];
            this.usedNames.add(name);
        } else {
            // 如果所有名字都用完了，重置并重新开始
            this.usedNames.clear();
            name = this.names[Math.floor(Math.random() * this.names.length)];
            this.usedNames.add(name);
        }

        let position;
        let assignedDesk = null;

        if (Math.random() < 0.8) {
            const availableDesks = this.desks.filter(desk => !desk.occupied);
            if (availableDesks.length > 0) {
                assignedDesk = availableDesks[Math.floor(Math.random() * availableDesks.length)];
                assignedDesk.occupied = true;
                position = {
                    x: assignedDesk.workPosition.x,
                    y: assignedDesk.workPosition.y
                };
            } else {
                position = this.findEmptyPosition();
            }
        } else {
            position = this.findEmptyPosition();
        }

        if (!position) return;

        // 生成个性特征和技能
        const personality = this.personalitySystem.generatePersonality();
        const skills = this.personalitySystem.generateSkills();
        const initialState = this.personalitySystem.generateInitialState();

        const employee = {
            x: position.x,
            y: position.y,
            width: 32,
            height: 32,
            targetX: position.x,
            targetY: position.y,
            speed: 1 + Math.random() * 0.5,
            imageIndex: imageIndex,
            name: name,
            state: assignedDesk ? 'working' : 'wandering',
            workTimer: assignedDesk ? 600 + Math.random() * 1200 : 0, // 10-30秒工作时间
            currentDesk: assignedDesk,
            showName: false,
            nameTimer: 0,
            path: [],
            pathIndex: 0,
            activityTimer: 0,
            currentActivity: null,
            restTimer: 0,
            // 抱怨系统
            complaint: null,
            complaintTimer: 0,
            nextComplaintTime: 60 + Math.random() * 180, // 1-4秒后第一次抱怨

            // 个性特征 (五大人格)
            personality: personality,

            // 技能属性
            skills: skills,

            // 状态属性
            mood: initialState.mood,
            energy: initialState.energy,
            stress: initialState.stress,
            relationships: initialState.relationships,

            // 行为修正参数（基于个性计算）
            behaviorModifiers: this.personalitySystem.modifyBehaviorParameters({ personality: personality })
        };

        this.employees.push(employee);
        this.updateEmployeeCount();
    }

    findEmptyPosition() {
        for (let attempts = 0; attempts < 100; attempts++) {
            // 在办公桌区域附近生成，避开活动区域
            const x = 260 + Math.random() * 450; // 在260-710之间
            const y = 90 + Math.random() * 250; // 在办公桌区域附近

            if (this.pathFinder.isPositionSafe(x, y, null)) {
                return { x, y };
            }
        }

        // 如果办公桌区域找不到位置，尝试其他安全区域
        for (let attempts = 0; attempts < 50; attempts++) {
            const x = 220 + Math.random() * (this.width - 220 - 32);
            const y = Math.random() * (this.height - 32);

            if (this.pathFinder.isPositionSafe(x, y, null)) {
                return { x, y };
            }
        }
        return null;
    }

    removeRandomEmployee() {
        if (this.employees.length > 0) {
            const removedEmployee = this.employees.pop();
            if (removedEmployee.currentDesk) {
                removedEmployee.currentDesk.occupied = false;
            }
            // 释放名字供重复使用
            this.usedNames.delete(removedEmployee.name);
            this.updateEmployeeCount();
        }
    }

    update() {
        if (this.isPaused || !this.gameStarted) return;

        const deltaTime = 1 / 60;
        this.gameTime += deltaTime;

        // 使用性能优化的更新方法
        if (this.performanceOptimizer && this.performanceOptimizer.initialized) {
            if (!this.performanceOptimizer.optimizedUpdate(deltaTime)) {
                // 如果优化更新失败，回退到原始方法
                this.fallbackUpdate(deltaTime);
            }
        } else {
            this.fallbackUpdate(deltaTime);
        }

        // 更新增强功能系统
        if (this.gameManager) {
            this.gameManager.update(deltaTime);
        }

        this.updateGameTime();
    }

    // 回退更新方法
    fallbackUpdate(deltaTime) {
        this.employees.forEach(employee => {
            this.updateEmployee(employee);
        });
    }

    updateEmployee(employee) {
        if (employee.nameTimer > 0) {
            employee.nameTimer--;
            employee.showName = true;
        } else {
            employee.showName = false;
        }

        // 更新员工状态（心情、精力、压力）
        if (employee.personality) {
            this.personalitySystem.updateEmployeeState(employee, 1 / 60); // 60 FPS
        }

        // 处理抱怨系统
        this.updateComplaint(employee);

        switch (employee.state) {
            case 'working':
                this.handleWorking(employee);
                break;
            case 'moving':
                this.handleMoving(employee);
                break;
            case 'wandering':
                this.handleWandering(employee);
                break;
            case 'activity':
                this.handleActivity(employee);
                break;
            case 'resting':
                this.handleResting(employee);
                break;
        }
    }

    updateComplaint(employee) {
        // 更新抱怨显示计时器
        if (employee.complaintTimer > 0) {
            employee.complaintTimer--;
            if (employee.complaintTimer <= 0) {
                employee.complaint = null;
            }
        }

        // 检查是否该发出新抱怨
        if (employee.nextComplaintTime > 0) {
            employee.nextComplaintTime--;
            if (employee.nextComplaintTime <= 0 && !employee.complaint) {
                // 检查当前抱怨的员工数量
                const currentComplainingCount = this.employees.filter(emp => emp.complaint).length;

                // 根据个性和状态决定是否抱怨
                let shouldComplain = currentComplainingCount < 2;

                if (shouldComplain && employee.personality) {
                    // 个性化的抱怨倾向
                    const complaintThreshold = this.calculateComplaintThreshold(employee);
                    shouldComplain = Math.random() < complaintThreshold;
                }

                if (shouldComplain) {
                    // 根据个性选择抱怨类型
                    const complaintIndex = this.selectPersonalizedComplaint(employee);
                    employee.complaint = this.complaints[complaintIndex];

                    // 根据个性调整抱怨显示时间
                    const displayDuration = this.calculateComplaintDuration(employee);
                    employee.complaintTimer = displayDuration;

                    // 统计抱怨
                    this.recordComplaint(complaintIndex);
                    console.log(`${employee.name} (${this.personalitySystem.getPersonalityTags(employee).join(', ')}) 抱怨: ${employee.complaint}`);
                }

                // 设置下次抱怨时间，考虑个性化频率和当前状态
                this.setNextComplaintTime(employee);
            }
        }
    }

    // 计算员工的抱怨阈值（增强版本）
    calculateComplaintThreshold(employee) {
        let threshold = 0.5; // 基础阈值

        if (!employee.personality) return threshold;

        // 使用个性化行为模式
        const baseAction = { complaintFrequency: 1.0 };
        const adjustedAction = this.personalitySystem.adjustBehaviorPattern(employee, baseAction);

        // 神经质影响抱怨倾向
        threshold += (employee.personality.neuroticism / 100) * 0.4;

        // 宜人性影响（宜人性高的人较少抱怨）
        threshold -= (employee.personality.agreeableness / 100) * 0.3;

        // 外向性影响（外向的人更愿意表达不满）
        threshold += (employee.personality.extroversion / 100) * 0.2;

        // 尽责性影响（尽责的人对工作环境要求更高）
        threshold += (employee.personality.conscientiousness / 100) * 0.15;

        // 心情和压力影响
        threshold += (employee.stress / 100) * 0.3;
        threshold -= (employee.mood / 100) * 0.2;

        // 精力影响
        if (employee.energy < 30) {
            threshold += 0.2;
        }

        // 应用个性化的抱怨频率修正
        if (adjustedAction.emotionalVolatility) {
            threshold *= 1.3; // 情绪不稳定的人更容易抱怨
        }
        if (adjustedAction.emotionalStability) {
            threshold *= 0.7; // 情绪稳定的人较少抱怨
        }

        return Math.max(0.1, Math.min(0.9, threshold));
    }

    // 根据个性选择抱怨类型
    selectPersonalizedComplaint(employee) {
        const personality = employee.personality;
        let weightedComplaints = [];

        // 为每个抱怨分配权重
        this.complaints.forEach((complaint, index) => {
            let weight = 1.0;

            // 根据个性调整权重
            if (complaint.includes('热') || complaint.includes('空调')) {
                // 神经质的人更容易抱怨温度
                weight *= (1 + personality.neuroticism / 200);
            }

            if (complaint.includes('噪音') || complaint.includes('大声')) {
                // 内向的人更容易抱怨噪音
                weight *= (1 + (100 - personality.extroversion) / 200);
            }

            if (complaint.includes('排队') || complaint.includes('等')) {
                // 尽责性高的人更容易抱怨效率问题
                weight *= (1 + personality.conscientiousness / 200);
            }

            if (complaint.includes('脏') || complaint.includes('清洁')) {
                // 尽责性高的人更容易抱怨清洁问题
                weight *= (1 + personality.conscientiousness / 150);
            }

            weightedComplaints.push({ index, weight });
        });

        // 按权重随机选择
        const totalWeight = weightedComplaints.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (const item of weightedComplaints) {
            random -= item.weight;
            if (random <= 0) {
                return item.index;
            }
        }

        return Math.floor(Math.random() * this.complaints.length);
    }

    // 计算抱怨显示持续时间
    calculateComplaintDuration(employee) {
        let baseDuration = 300; // 5秒基础时间

        if (employee.personality) {
            // 外向的人抱怨时间更长（更愿意表达）
            baseDuration *= (0.8 + employee.personality.extroversion / 250);

            // 神经质的人抱怨时间更长
            baseDuration *= (0.9 + employee.personality.neuroticism / 200);
        }

        return Math.floor(baseDuration);
    }

    // 设置下次抱怨时间
    setNextComplaintTime(employee) {
        const complaintFrequency = employee.behaviorModifiers?.complaintFrequency || 1.0;
        const baseTime = 900 + Math.random() * 1800; // 15-45秒基础时间

        // 根据当前状态调整
        let stateModifier = 1.0;
        if (employee.stress > 70) stateModifier *= 0.7; // 高压力时更频繁抱怨
        if (employee.mood < 30) stateModifier *= 0.8;   // 心情差时更频繁抱怨
        if (employee.energy < 20) stateModifier *= 0.9; // 低精力时更容易抱怨

        employee.nextComplaintTime = (baseTime * stateModifier) / complaintFrequency;
    }

    handleWorking(employee) {
        // 应用个性化的工作时间修正和心情影响
        const workTimeModifier = employee.behaviorModifiers?.workTime || 1.0;
        const workEfficiency = this.personalitySystem.calculateWorkEfficiency(employee, 'general');
        const decreaseRate = workTimeModifier * workEfficiency;

        employee.workTimer -= decreaseRate;

        // 根据个性调整显示名字的概率
        const nameDisplayChance = employee.personality?.extroversion > 50 ? 0.002 : 0.0005;
        if (Math.random() < nameDisplayChance) {
            employee.nameTimer = 120;
        }

        // 检查是否与其他员工进行工作协作
        if (Math.random() < 0.05) { // 5%概率检查协作
            this.checkWorkCollaboration(employee);
        }

        if (employee.workTimer <= 0) {
            // 使用个性化行为模式调整决策
            const baseAction = {
                socialInteractionChance: 0.5,
                workDuration: 1.0,
                breakFrequency: 1.0
            };

            const adjustedAction = this.personalitySystem.adjustBehaviorPattern(employee, baseAction);
            const rand = Math.random();

            // 根据精力水平调整行为选择
            const energyFactor = employee.energy / 100;
            const adjustedSocialChance = adjustedAction.socialInteractionChance * energyFactor;

            if (rand < adjustedSocialChance && adjustedAction.groupActivityPreference !== false) {
                // 个性化的活动选择
                this.startActivity(employee);
            } else if (rand < adjustedSocialChance + 0.2 && energyFactor > 0.3) {
                // 根据精力决定是否走动
                this.startWandering(employee);
            } else {
                // 继续工作，但工作时间受个性和状态影响
                const baseWorkTime = 300 + Math.random() * 900;
                const personalityModifier = adjustedAction.workDuration;
                const stateModifier = (employee.mood / 100) * 0.5 + (employee.energy / 100) * 0.3 + 0.7;
                employee.workTimer = baseWorkTime * personalityModifier * stateModifier;
            }
        }
    }

    handleMoving(employee) {
        if (employee.path.length === 0) {
            if (employee.currentActivity) {
                employee.state = 'activity';
                employee.activityTimer = 120 + Math.random() * 240; // 2-6秒活动时间
            } else if (employee.currentDesk) {
                employee.state = 'working';
                employee.workTimer = 600 + Math.random() * 1200; // 10-30秒工作时间
            } else {
                employee.state = 'resting';
                employee.restTimer = 60 + Math.random() * 120; // 1-3秒休息
            }
            return;
        }

        const target = employee.path[0];
        const dx = target.x - employee.x;
        const dy = target.y - employee.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 3) {
            employee.path.shift();
        } else {
            const moveX = (dx / distance) * employee.speed;
            const moveY = (dy / distance) * employee.speed;

            const newX = employee.x + moveX;
            const newY = employee.y + moveY;

            if (this.pathFinder.isPositionSafe(newX, newY, employee)) {
                employee.x = newX;
                employee.y = newY;
            }
        }
    }

    handleWandering(employee) {
        if (employee.restTimer > 0) {
            employee.restTimer--;
            return;
        }

        // 使用个性化行为模式
        const baseAction = {
            socialInteractionChance: 0.3,
            workDuration: 1.0,
            breakFrequency: 1.0,
            noveltySeekingBehavior: false
        };

        const adjustedAction = this.personalitySystem.adjustBehaviorPattern(employee, baseAction);
        const rand = Math.random();

        // 根据个性调整行为概率
        let workReturnChance = 0.03;
        let activityChance = 0.03;
        let moveChance = 0.04;
        let socialChance = 0.02;

        if (employee.personality) {
            // 尽责性影响回到工作的概率
            workReturnChance *= (0.5 + employee.personality.conscientiousness / 100);

            // 外向性影响活动和社交概率
            activityChance *= adjustedAction.socialInteractionChance;
            socialChance *= adjustedAction.socialInteractionChance;

            // 开放性影响探索移动的概率
            if (adjustedAction.noveltySeekingBehavior) {
                moveChance *= 1.5;
            }

            // 神经质影响决策速度
            if (employee.personality.neuroticism > 70) {
                workReturnChance *= 1.3; // 更急于回到安全的工作状态
                activityChance *= 0.7;   // 较少参与活动
                socialChance *= 0.5;     // 避免社交
            }
        }

        // 精力和心情影响行为选择
        const energyFactor = employee.energy / 100;
        const moodFactor = employee.mood / 100;

        workReturnChance *= (0.5 + energyFactor * 0.5);
        activityChance *= energyFactor;
        moveChance *= (0.7 + moodFactor * 0.3);
        socialChance *= moodFactor;

        if (rand < workReturnChance) {
            this.returnToWork(employee);
        } else if (rand < workReturnChance + activityChance) {
            this.startActivity(employee);
        } else if (rand < workReturnChance + activityChance + socialChance) {
            this.attemptSocialInteraction(employee);
        } else if (rand < workReturnChance + activityChance + socialChance + moveChance) {
            this.moveToRandomLocation(employee);
        } else {
            employee.restTimer = 30 + Math.random() * 60;
        }
    }

    handleActivity(employee) {
        employee.activityTimer--;

        if (employee.activityTimer <= 0) {
            employee.currentActivity = null;
            if (Math.random() < 0.6) { // 60%概率回到工作
                this.returnToWork(employee);
            } else {
                employee.state = 'wandering';
                employee.restTimer = 60 + Math.random() * 120; // 1-3秒休息
            }
        }
    }

    handleResting(employee) {
        employee.restTimer--;

        if (employee.restTimer <= 0) {
            const rand = Math.random();
            if (rand < 0.6) {
                this.returnToWork(employee);
            } else if (rand < 0.8) {
                this.startActivity(employee);
            } else {
                this.moveToRandomLocation(employee);
            }
        }
    }

    startActivity(employee) {
        const availableAreas = this.activityAreas.filter(area =>
            !this.employees.some(emp =>
                emp !== employee &&
                emp.currentActivity === area.name &&
                emp.state === 'activity'
            )
        );

        if (availableAreas.length > 0) {
            // 使用个性化行为模式选择活动
            const baseAction = { groupActivityPreference: true };
            const adjustedAction = this.personalitySystem.adjustBehaviorPattern(employee, baseAction);

            let selectedArea;

            if (employee.personality) {
                const personality = employee.personality;
                const preferences = [];

                // 外向的人更喜欢社交区域
                if (personality.extroversion > 60 && adjustedAction.groupActivityPreference) {
                    const socialAreas = availableAreas.filter(area =>
                        ['茶水间', '休息区', '会议室'].includes(area.name));
                    preferences.push(...socialAreas.map(area => ({ area, weight: 2.5 })));
                }

                // 尽责的人可能更喜欢功能性区域
                if (personality.conscientiousness > 60 || adjustedAction.organizationLevel === 'high') {
                    const functionalAreas = availableAreas.filter(area =>
                        ['打印机', '储物间'].includes(area.name));
                    preferences.push(...functionalAreas.map(area => ({ area, weight: 2.0 })));
                }

                // 神经质高的人可能避免人多的地方
                if (personality.neuroticism > 70 || adjustedAction.stressReaction === 'high') {
                    const quietAreas = availableAreas.filter(area =>
                        ['洗手间', '储物间'].includes(area.name));
                    preferences.push(...quietAreas.map(area => ({ area, weight: 2.2 })));
                }

                // 开放性高的人可能尝试不同的活动
                if (personality.openness > 60 && adjustedAction.noveltySeekingBehavior) {
                    // 给所有区域一个基础权重，鼓励探索
                    availableAreas.forEach(area => {
                        if (!preferences.some(pref => pref.area === area)) {
                            preferences.push({ area, weight: 1.3 });
                        }
                    });
                }

                // 宜人性高的人倾向于选择能帮助他人的区域
                if (personality.agreeableness > 70 && adjustedAction.helpingBehavior > 1.0) {
                    const helpfulAreas = availableAreas.filter(area =>
                        ['茶水间', '会议室'].includes(area.name));
                    preferences.push(...helpfulAreas.map(area => ({ area, weight: 1.8 })));
                }

                // 如果有偏好，按权重选择
                if (preferences.length > 0) {
                    const totalWeight = preferences.reduce((sum, pref) => sum + pref.weight, 0);
                    let random = Math.random() * totalWeight;

                    for (const pref of preferences) {
                        random -= pref.weight;
                        if (random <= 0) {
                            selectedArea = pref.area;
                            break;
                        }
                    }
                }
            }

            // 如果没有特殊偏好或偏好区域不可用，随机选择
            if (!selectedArea) {
                selectedArea = availableAreas[Math.floor(Math.random() * availableAreas.length)];
            }

            employee.currentActivity = selectedArea.name;

            // 根据个性调整活动时间和显示
            const nameDisplayDuration = employee.personality?.extroversion > 50 ? 240 : 180;
            employee.nameTimer = nameDisplayDuration;

            // 根据个性调整活动持续时间
            const baseActivityTime = 120 + Math.random() * 240;
            let activityTimeModifier = 1.0;

            if (adjustedAction.groupActivityPreference) {
                activityTimeModifier *= 1.2; // 喜欢社交的人活动时间更长
            }
            if (adjustedAction.stressReaction === 'high') {
                activityTimeModifier *= 0.8; // 容易紧张的人活动时间较短
            }

            employee.activityTimer = baseActivityTime * activityTimeModifier;

            this.moveEmployeeTo(employee, selectedArea.x + selectedArea.width / 2 - 16, selectedArea.y + selectedArea.height / 2 - 16);
        } else {
            employee.state = 'wandering';
            // 根据个性调整等待时间
            const patienceModifier = employee.personality?.agreeableness > 50 ? 1.5 : 1.0;
            employee.restTimer = 60 * patienceModifier;
        }
    }

    startWandering(employee) {
        if (employee.currentDesk) {
            employee.currentDesk.occupied = false;
            employee.currentDesk = null;
        }
        employee.state = 'wandering';
        employee.restTimer = 30 + Math.random() * 60; // 0.5-1.5秒休息
    }

    returnToWork(employee) {
        const availableDesks = this.desks.filter(desk => !desk.occupied);
        if (availableDesks.length > 0) {
            const desk = availableDesks[Math.floor(Math.random() * availableDesks.length)];
            desk.occupied = true;
            employee.currentDesk = desk;
            employee.currentActivity = null;
            this.moveEmployeeTo(employee, desk.workPosition.x, desk.workPosition.y);
        } else {
            employee.state = 'wandering';
            employee.restTimer = 120; // 2秒等待重试
        }
    }

    moveToRandomLocation(employee) {
        const targetX = Math.random() * (this.width - 32);
        const targetY = Math.random() * (this.height - 32);
        this.moveEmployeeTo(employee, targetX, targetY);
    }

    moveEmployeeTo(employee, targetX, targetY) {
        const path = this.pathFinder.findPath(employee.x, employee.y, targetX, targetY, employee);
        if (path.length > 0) {
            employee.path = path;
            employee.state = 'moving';
            employee.targetX = targetX;
            employee.targetY = targetY;
        }
    }

    // 检查工作协作机会
    checkWorkCollaboration(employee) {
        if (!employee.personality || !employee.currentDesk) return;

        // 寻找附近的工作员工
        const nearbyEmployees = this.employees.filter(other =>
            other !== employee &&
            other.state === 'working' &&
            other.currentDesk &&
            this.getDistance(employee, other) < 100 // 100像素范围内
        );

        if (nearbyEmployees.length === 0) return;

        // 选择最兼容的员工进行协作
        let bestPartner = null;
        let bestCompatibility = 0;

        nearbyEmployees.forEach(other => {
            const compatibility = this.personalitySystem.calculateWorkCompatibility(employee, other, 'general');
            if (compatibility > bestCompatibility) {
                bestCompatibility = compatibility;
                bestPartner = other;
            }
        });

        // 如果兼容性足够高，进行协作
        if (bestPartner && bestCompatibility > 0.6) {
            this.performCollaboration(employee, bestPartner);
        }
    }

    // 执行员工协作
    performCollaboration(employee1, employee2) {
        const interactionResult = this.personalitySystem.simulateSocialInteraction(
            employee1, employee2, 'collaboration'
        );

        if (interactionResult.success) {
            // 协作成功，提升工作效率
            const efficiency1 = this.personalitySystem.calculateWorkEfficiency(employee1, 'general');
            const efficiency2 = this.personalitySystem.calculateWorkEfficiency(employee2, 'general');

            // 缩短工作时间（表示效率提升）
            employee1.workTimer *= 0.9;
            employee2.workTimer *= 0.9;

            // 显示协作效果
            employee1.nameTimer = 180;
            employee2.nameTimer = 180;

            console.log(`${employee1.name} 和 ${employee2.name} 进行了成功的工作协作`);
        }
    }

    // 尝试社交互动
    attemptSocialInteraction(employee) {
        if (!employee.personality) return;

        // 寻找附近的其他员工
        const nearbyEmployees = this.employees.filter(other =>
            other !== employee &&
            this.getDistance(employee, other) < 80 // 80像素范围内
        );

        if (nearbyEmployees.length === 0) {
            // 没有人可以互动，转为休息
            employee.state = 'resting';
            employee.restTimer = 60 + Math.random() * 120;
            return;
        }

        // 根据个性选择互动对象
        let targetEmployee = null;

        if (employee.personality.extroversion > 60) {
            // 外向的人倾向于与更多人互动
            targetEmployee = nearbyEmployees[Math.floor(Math.random() * nearbyEmployees.length)];
        } else {
            // 内向的人倾向于与关系好的人互动
            const knownEmployees = nearbyEmployees.filter(other =>
                employee.relationships && employee.relationships.has(other.name)
            );

            if (knownEmployees.length > 0) {
                // 选择关系最好的员工
                targetEmployee = knownEmployees.reduce((best, current) => {
                    const currentRelation = employee.relationships.get(current.name) || 50;
                    const bestRelation = employee.relationships.get(best.name) || 50;
                    return currentRelation > bestRelation ? current : best;
                });
            } else {
                targetEmployee = nearbyEmployees[0]; // 随机选择一个
            }
        }

        if (targetEmployee) {
            this.performSocialInteraction(employee, targetEmployee);
        }
    }

    // 执行社交互动
    performSocialInteraction(employee1, employee2) {
        const interactionResult = this.personalitySystem.simulateSocialInteraction(
            employee1, employee2, 'casual'
        );

        // 显示互动效果
        employee1.nameTimer = 150;
        employee2.nameTimer = 150;

        // 根据互动结果调整状态
        if (interactionResult.success) {
            console.log(`${employee1.name} 和 ${employee2.name} 进行了愉快的社交互动`);
        } else {
            console.log(`${employee1.name} 和 ${employee2.name} 的互动不太顺利`);
        }

        // 互动后转为休息状态
        employee1.state = 'resting';
        employee1.restTimer = 30 + Math.random() * 60;
    }

    // 计算两个员工之间的距离
    getDistance(employee1, employee2) {
        const dx = employee1.x - employee2.x;
        const dy = employee1.y - employee2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    render() {
        if (!this.gameStarted) return;

        // 使用性能优化的渲染方法
        if (this.performanceOptimizer && this.performanceOptimizer.initialized) {
            if (!this.performanceOptimizer.optimizedRender()) {
                // 如果优化渲染失败，回退到原始方法
                this.fallbackRender();
            }
        } else {
            this.fallbackRender();
        }
    }

    // 回退渲染方法
    fallbackRender() {
        // 渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 地板瓷砖效果 (为公告栏留出空间)
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 1;
        for (let x = 220; x < this.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(220, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // 绘制装饰元素
        this.decorations.forEach(decoration => {
            this.ctx.font = '20px Arial';
            this.ctx.fillText(decoration.emoji, decoration.x, decoration.y);
        });

        // 绘制活动区域
        this.activityAreas.forEach(area => {
            // 区域背景
            this.ctx.fillStyle = area.color;
            this.ctx.fillRect(area.x, area.y, area.width, area.height);

            // 区域边框
            this.ctx.strokeStyle = area.borderColor;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(area.x, area.y, area.width, area.height);

            // 图标
            this.ctx.font = '24px Arial';
            this.ctx.fillText(area.icon, area.x + area.width / 2 - 12, area.y + area.height / 2 + 8);

            // 标签
            this.ctx.fillStyle = '#495057';
            this.ctx.font = '12px Inter, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(area.name, area.x + area.width / 2, area.y + area.height + 15);
        });

        // 绘制办公桌
        this.desks.forEach(desk => {
            // 桌子阴影
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            this.ctx.fillRect(desk.x + 3, desk.y + 3, desk.width, desk.height);

            // 桌面 - 现代办公桌颜色
            const deskGradient = this.ctx.createLinearGradient(desk.x, desk.y, desk.x, desk.y + desk.height);
            if (desk.occupied) {
                deskGradient.addColorStop(0, '#E8E8E8'); // 浅灰色桌面
                deskGradient.addColorStop(1, '#D0D0D0');
            } else {
                deskGradient.addColorStop(0, '#F5F5F5'); // 更浅的灰色
                deskGradient.addColorStop(1, '#E0E0E0');
            }

            this.ctx.fillStyle = deskGradient;
            this.ctx.fillRect(desk.x, desk.y, desk.width, desk.height);

            // 桌子边缘 - 金属边框效果
            this.ctx.strokeStyle = '#B0B0B0';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(desk.x, desk.y, desk.width, desk.height);

            // 桌面纹理线条
            this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
            this.ctx.lineWidth = 1;
            for (let i = 1; i < 4; i++) {
                const lineY = desk.y + (desk.height / 4) * i;
                this.ctx.beginPath();
                this.ctx.moveTo(desk.x + 5, lineY);
                this.ctx.lineTo(desk.x + desk.width - 5, lineY);
                this.ctx.stroke();
            }

            // 桌腿
            this.ctx.fillStyle = '#808080';
            // 左前腿
            this.ctx.fillRect(desk.x + 5, desk.y + desk.height - 8, 6, 8);
            // 右前腿
            this.ctx.fillRect(desk.x + desk.width - 11, desk.y + desk.height - 8, 6, 8);
            // 左后腿
            this.ctx.fillRect(desk.x + 5, desk.y + 5, 6, desk.height - 13);
            // 右后腿
            this.ctx.fillRect(desk.x + desk.width - 11, desk.y + 5, 6, desk.height - 13);

            // 抽屉
            if (desk.hasDrawer) { // 使用预设的抽屉属性
                this.ctx.fillStyle = '#C0C0C0';
                this.ctx.fillRect(desk.x + 10, desk.y + desk.height - 20, desk.width - 20, 12);
                this.ctx.strokeStyle = '#A0A0A0';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(desk.x + 10, desk.y + desk.height - 20, desk.width - 20, 12);

                // 抽屉把手
                this.ctx.fillStyle = '#606060';
                this.ctx.fillRect(desk.x + desk.width - 25, desk.y + desk.height - 16, 8, 4);
            }

            // 桌面高光
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(desk.x + 1, desk.y + 1, desk.width - 2, 2);
        });

        // 绘制电脑显示器
        this.computers.forEach(computer => {
            // 显示器底座
            this.ctx.fillStyle = '#4A4A4A';
            this.ctx.fillRect(computer.x + computer.width / 2 - 3, computer.y + computer.height, 6, 4);

            // 显示器外框 - 现代超薄边框
            this.ctx.fillStyle = computer.isOn ? '#1A1A1A' : '#3A3A3A';
            this.ctx.fillRect(computer.x, computer.y, computer.width, computer.height);

            // 屏幕区域
            const screenX = computer.x + 2;
            const screenY = computer.y + 2;
            const screenWidth = computer.width - 4;
            const screenHeight = computer.height - 4;

            if (computer.isOn) {
                // 开机状态 - 蓝色桌面背景
                const screenGradient = this.ctx.createLinearGradient(
                    screenX, screenY, screenX, screenY + screenHeight
                );
                screenGradient.addColorStop(0, '#4A90E2');
                screenGradient.addColorStop(1, '#2E5BBA');

                this.ctx.fillStyle = screenGradient;
                this.ctx.fillRect(screenX, screenY, screenWidth, screenHeight);

                // 模拟桌面图标
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(screenX + 2, screenY + 2, 3, 3);
                this.ctx.fillRect(screenX + 6, screenY + 2, 3, 3);
                this.ctx.fillRect(screenX + 2, screenY + 6, 3, 3);

                // 任务栏
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(screenX, screenY + screenHeight - 3, screenWidth, 3);

                // 屏幕反光效果
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.fillRect(screenX, screenY, screenWidth, 2);
            } else {
                // 关机状态 - 黑屏
                this.ctx.fillStyle = '#0A0A0A';
                this.ctx.fillRect(screenX, screenY, screenWidth, screenHeight);

                // 微弱反射
                this.ctx.fillStyle = 'rgba(50, 50, 50, 0.3)';
                this.ctx.fillRect(screenX, screenY, screenWidth, 1);
            }

            // 显示器边框高光
            this.ctx.strokeStyle = computer.isOn ? '#333333' : '#555555';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(computer.x, computer.y, computer.width, computer.height);

            // 电源指示灯
            this.ctx.fillStyle = computer.isOn ? '#00FF00' : '#FF0000';
            this.ctx.beginPath();
            this.ctx.arc(computer.x + computer.width - 3, computer.y + computer.height - 3, 1, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // 绘制员工
        this.employees.forEach(employee => {
            if (this.characterImages[employee.imageIndex]) {
                this.ctx.drawImage(
                    this.characterImages[employee.imageIndex],
                    employee.x,
                    employee.y,
                    employee.width,
                    employee.height
                );
            }

            // 状态指示器
            if (employee.state === 'working') {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(employee.x + employee.width - 5, employee.y + 5, 4, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#FFA000';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            } else if (employee.state === 'activity') {
                this.ctx.fillStyle = '#FF6B6B';
                this.ctx.beginPath();
                this.ctx.arc(employee.x + employee.width - 5, employee.y + 5, 4, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#E53E3E';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }

            // 显示抱怨气泡
            if (employee.complaint) {
                this.drawComplaintBubble(employee);
            }

            // 显示名字和活动
            if (employee.showName || employee.state === 'working' || employee.state === 'activity') {
                const text = employee.currentActivity ? `${employee.name} (${employee.currentActivity})` : employee.name;

                // 测量文本宽度
                this.ctx.font = 'bold 11px Inter, sans-serif';
                const textWidth = this.ctx.measureText(text).width;

                // 名字背景 - 如果有抱怨气泡，名字显示在更上方
                const nameY = employee.complaint ? employee.y - 80 : employee.y - 25;
                const nameX = employee.x + employee.width / 2 - textWidth / 2 - 6;
                const boxWidth = textWidth + 12;
                const boxHeight = 20;

                // 绘制背景矩形（深色背景）
                this.ctx.fillStyle = '#333333';
                this.ctx.fillRect(nameX, nameY, boxWidth, boxHeight);

                // 绘制边框
                this.ctx.strokeStyle = '#666666';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(nameX, nameY, boxWidth, boxHeight);

                // 名字文本 - 使用深色背景上的亮色文字
                this.ctx.fillStyle = '#00FF00';  // 绿色文字，非常醒目
                this.ctx.textAlign = 'center';
                this.ctx.fillText(text, employee.x + employee.width / 2, nameY + 14);
            }
        });

        // 绘制公告栏
        this.drawComplaintBoard();
    }

    drawComplaintBubble(employee) {
        const bubbleWidth = 200;
        const bubbleHeight = 60;
        const bubbleX = employee.x + employee.width / 2 - bubbleWidth / 2;
        const bubbleY = employee.y - bubbleHeight - 10;

        // 确保气泡不超出画布边界
        const adjustedX = Math.max(5, Math.min(bubbleX, this.width - bubbleWidth - 5));
        const adjustedY = Math.max(5, bubbleY);

        // 绘制气泡阴影
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(adjustedX + 2, adjustedY + 2, bubbleWidth, bubbleHeight);

        // 绘制气泡背景
        this.ctx.fillStyle = '#FFFACD';
        this.ctx.fillRect(adjustedX, adjustedY, bubbleWidth, bubbleHeight);

        // 绘制气泡边框
        this.ctx.strokeStyle = '#DDD';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(adjustedX, adjustedY, bubbleWidth, bubbleHeight);

        // 绘制气泡尾巴（指向员工）
        const tailX = employee.x + employee.width / 2;
        const tailY = adjustedY + bubbleHeight;

        this.ctx.fillStyle = '#FFFACD';
        this.ctx.beginPath();
        this.ctx.moveTo(tailX - 8, tailY);
        this.ctx.lineTo(tailX + 8, tailY);
        this.ctx.lineTo(tailX, tailY + 8);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.strokeStyle = '#DDD';
        this.ctx.beginPath();
        this.ctx.moveTo(tailX - 8, tailY);
        this.ctx.lineTo(tailX, tailY + 8);
        this.ctx.lineTo(tailX + 8, tailY);
        this.ctx.stroke();

        // 绘制抱怨文本
        this.ctx.fillStyle = '#333';
        this.ctx.font = '11px Inter, sans-serif';
        this.ctx.textAlign = 'left';

        // 文本换行处理
        const words = employee.complaint.split('');
        let line = '';
        let y = adjustedY + 18;
        const maxWidth = bubbleWidth - 20;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = this.ctx.measureText(testLine);

            if (metrics.width > maxWidth && line !== '') {
                this.ctx.fillText(line, adjustedX + 10, y);
                line = words[i];
                y += 16;
                if (y > adjustedY + bubbleHeight - 10) break; // 防止文本超出气泡
            } else {
                line = testLine;
            }
        }
        this.ctx.fillText(line, adjustedX + 10, y);
    }

    handleClick(x, y) {
        this.employees.forEach(employee => {
            if (x >= employee.x && x <= employee.x + employee.width &&
                y >= employee.y && y <= employee.y + employee.height) {
                employee.nameTimer = 180;

                // 70%概率触发抱怨，但需要检查当前抱怨数量
                if (Math.random() < 0.7 && !employee.complaint) {
                    const currentComplainingCount = this.employees.filter(emp => emp.complaint).length;

                    if (currentComplainingCount < 2) {
                        const complaintIndex = Math.floor(Math.random() * this.complaints.length);
                        employee.complaint = this.complaints[complaintIndex];
                        employee.complaintTimer = 300; // 显示5秒

                        // 统计抱怨
                        this.recordComplaint(complaintIndex);
                        console.log(`${employee.name} 点击抱怨: ${employee.complaint}`); // 调试信息
                    } else {
                        console.log(`${employee.name} 想抱怨，但已经有太多人在抱怨了`); // 调试信息
                    }
                }
            }
        });
    }

    recordComplaint(complaintIndex) {
        const category = this.complaintCategories[complaintIndex];
        // 确保category有效
        if (!category) {
            console.warn('无效的抱怨索引:', complaintIndex);
            return;
        }
        if (this.complaintStats.has(category)) {
            this.complaintStats.set(category, this.complaintStats.get(category) + 1);
        } else {
            this.complaintStats.set(category, 1);
        }
    }

    drawComplaintBoard() {
        const boardWidth = 200;
        const boardHeight = this.height - 20;
        const boardX = 10;
        const boardY = 10;

        // 绘制公告栏背景
        const gradient = this.ctx.createLinearGradient(boardX, boardY, boardX + boardWidth, boardY);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#f8f9fa');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(boardX, boardY, boardWidth, boardHeight);

        // 绘制边框
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(boardX, boardY, boardWidth, boardHeight);

        // 绘制标题背景
        const titleGradient = this.ctx.createLinearGradient(boardX, boardY, boardX + boardWidth, boardY + 40);
        titleGradient.addColorStop(0, '#667eea');
        titleGradient.addColorStop(1, '#764ba2');

        this.ctx.fillStyle = titleGradient;
        this.ctx.fillRect(boardX, boardY, boardWidth, 40);

        // 绘制标题
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('📊 员工抱怨统计', boardX + boardWidth / 2, boardY + 25);

        // 获取排序后的抱怨统计，先过滤掉无效条目
        const sortedComplaints = Array.from(this.complaintStats.entries())
            .filter(entry => entry && entry[0] != null && entry[1] != null)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15); // 只显示前15项

        if (sortedComplaints.length === 0) {
            this.ctx.fillStyle = '#6c757d';
            this.ctx.font = '14px Inter, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('暂无抱怨记录', boardX + boardWidth / 2, boardY + 80);
            this.ctx.fillText('点击员工听听他们的想法', boardX + boardWidth / 2, boardY + 100);
            return;
        }

        // 绘制抱怨列表
        let currentY = boardY + 60;
        const lineHeight = 30;

        // 使用已过滤的数据
        const validComplaints = sortedComplaints;

        if (validComplaints.length === 0) {
            this.ctx.fillStyle = '#6c757d';
            this.ctx.font = '14px Inter, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('暂无有效抱怨记录', boardX + boardWidth / 2, boardY + 80);
            return;
        }

        const maxCount = validComplaints[0][1] || 1; // 防止除以0

        validComplaints.forEach((complaint, index) => {
            const [category, count] = complaint;

            // 绘制排名背景
            if (index < 3) {
                const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                this.ctx.fillStyle = rankColors[index] + '20';
                this.ctx.fillRect(boardX + 5, currentY - 15, boardWidth - 10, 25);
            }

            // 绘制排名
            this.ctx.fillStyle = index < 3 ? '#dc3545' : '#495057';
            this.ctx.font = 'bold 12px Inter, sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`${index + 1}.`, boardX + 15, currentY);

            // 绘制问题类别
            this.ctx.fillStyle = '#495057';
            this.ctx.font = '12px Inter, sans-serif';
            const categoryStr = String(category || '未知');
            const categoryText = categoryStr.length > 8 ? categoryStr.substring(0, 8) + '...' : categoryStr;
            this.ctx.fillText(categoryText, boardX + 35, currentY);

            // 绘制次数
            this.ctx.fillStyle = '#dc3545';
            this.ctx.font = 'bold 12px Inter, sans-serif';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${count}次`, boardX + boardWidth - 15, currentY);

            // 绘制进度条
            const barWidth = 60;
            const barHeight = 4;
            const barLength = (count / maxCount) * barWidth;

            this.ctx.fillStyle = '#e9ecef';
            this.ctx.fillRect(boardX + boardWidth - 80, currentY + 5, barWidth, barHeight);

            const barGradient = this.ctx.createLinearGradient(
                boardX + boardWidth - 80, currentY + 5,
                boardX + boardWidth - 80 + barLength, currentY + 5
            );
            barGradient.addColorStop(0, '#28a745');
            barGradient.addColorStop(1, '#dc3545');

            this.ctx.fillStyle = barGradient;
            this.ctx.fillRect(boardX + boardWidth - 80, currentY + 5, barLength, barHeight);

            currentY += lineHeight;
        });

        // 绘制总计信息
        const totalComplaints = Array.from(this.complaintStats.values()).reduce((sum, count) => sum + count, 0);
        this.ctx.fillStyle = '#6c757d';
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`总抱怨次数: ${totalComplaints}`, boardX + boardWidth / 2, boardY + boardHeight - 20);
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    updateEmployeeCount() {
        document.getElementById('employeeCount').textContent = this.employees.length;
    }

    updateGameTime() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        document.getElementById('gameTime').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }

    reset() {
        this.employees = [];
        this.desks.forEach(desk => desk.occupied = false);
        this.gameTime = 0;
        this.usedNames.clear(); // 清空已使用的名字

        for (let i = 0; i < 12; i++) {
            this.addRandomEmployee();
        }
        this.updateEmployeeCount();
    }

    // 插件管理方法
    registerPlugin(plugin) {
        if (!(plugin instanceof OfficePlugin)) {
            throw new Error('插件必须继承 OfficePlugin 类');
        }

        if (this.plugins.has(plugin.name)) {
            console.warn(`插件 "${plugin.name}" 已存在`);
            return false;
        }

        plugin.init(this.pluginAPI);
        this.plugins.set(plugin.name, plugin);
        console.log(`📦 插件 "${plugin.name}" 已注册`);
        return true;
    }

    activatePlugin(pluginName) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) {
            console.error(`插件 "${pluginName}" 不存在`);
            return false;
        }

        return plugin.activate();
    }

    deactivatePlugin(pluginName) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) {
            console.error(`插件 "${pluginName}" 不存在`);
            return false;
        }

        return plugin.deactivate();
    }

    getPluginList() {
        return Array.from(this.plugins.values()).map(plugin => plugin.getStatus());
    }

    // 获取解决方案列表
    getSolutions() {
        return Array.from(this.solutions.values());
    }
}

// 全局游戏实例
let game;

window.addEventListener('load', () => {
    game = new OfficeGame();
    window.game = game; // 暴露到全局作用域

    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        // 计算缩放比例，处理响应式布局
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        if (game) {
            game.handleClick(x, y);
        }
    });
});

// 全局控制函数
function addEmployee() {
    if (window.game) {
        window.game.addRandomEmployee();
    }
}

function removeEmployee() {
    if (window.game) {
        window.game.removeRandomEmployee();
    }
}

function togglePause() {
    if (window.game) {
        window.game.isPaused = !window.game.isPaused;
        const button = document.querySelector('button[onclick="togglePause()"]');
        if (button) {
            button.textContent = window.game.isPaused ? '▶️ 继续' : '⏸️ 暂停/继续';
        }
    }
}

function resetGame() {
    if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
        localStorage.removeItem('office-game-enhanced-data');
        location.reload();
    }
}


// ===== 全局面板控制函数 =====

// 切换成就面板
function toggleAchievementPanel() {
    const panel = document.getElementById('achievementPanel');
    if (!panel) return;

    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'flex';
        if (typeof updateAchievementPanel === 'function') {
            updateAchievementPanel();
        }
    } else {
        panel.style.display = 'none';
    }
}

// 切换进展面板
function toggleProgressionPanel() {
    const panel = document.getElementById('progressionPanel');
    if (!panel) return;

    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'flex';
        if (typeof updateProgressionPanel === 'function') {
            updateProgressionPanel();
        }
    } else {
        panel.style.display = 'none';
    }
}

// 切换统计面板
function toggleStatisticsPanel() {
    const panel = document.getElementById('statisticsPanel');
    if (!panel) return;

    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'flex';
        if (typeof updateStatisticsPanel === 'function') {
            updateStatisticsPanel();
        }
    } else {
        panel.style.display = 'none';
    }
}

// 切换社交面板
function toggleSocialPanel() {
    let panel = document.getElementById('socialPanel');
    if (panel) {
        document.body.removeChild(panel);
        return;
    }
    // 如果面板不存在，调用 index.html 中的创建函数
    if (typeof window.createSocialPanel === 'function') {
        window.createSocialPanel();
    } else {
        console.log('社交面板功能未加载');
    }
}

// 调试插件
function debugPlugins() {
    if (!window.game) {
        console.log('❌ 游戏未初始化');
        return;
    }
    console.log('🔧 插件调试信息:');
    console.log('可用插件:', window.game.getPluginList());
    console.log('已实施解决方案:', window.game.getSolutions());
    if (window.game.gameManager) {
        console.log('增强功能状态:', window.game.gameManager.getGameSummary());
    }
}

// 测试增强功能
function testEnhancedFeatures() {
    if (!window.game || !window.game.gameManager) {
        console.log('❌ 增强功能未初始化');
        return;
    }
    console.log('🎮 测试增强功能...');
    const resourceSystem = window.game.gameManager.getResourceSystem();
    if (resourceSystem) {
        console.log('💰 当前资源:', resourceSystem.getResourceSummary());
        resourceSystem.addResource('money', 10000);
        resourceSystem.addResource('satisfaction', 10);
        console.log('✅ 资源系统测试完成');
    }
    console.log('🎉 增强功能测试完成！');
}
