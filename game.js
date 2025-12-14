// 插件API类 - 为插件开发者提供的接口
class PluginAPI {
    constructor(game) {
        this.game = game;
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
    constructor(name, description, targetComplaints = [], author = '未知作者', version = '1.0.0') {
        this.name = name;
        this.description = description;
        this.targetComplaints = targetComplaints;
        this.author = author;
        this.version = version;
        this.isActive = false;
        this.api = null;
    }

    // 插件初始化
    init(api) {
        this.api = api;
        console.log(`🔌 插件 "${this.name}" 已加载`);
    }

    // 激活插件
    activate() {
        if (this.isActive) return false;

        this.isActive = true;
        this.onActivate();
        console.log(`▶️ 插件 "${this.name}" 已激活`);
        return true;
    }

    // 停用插件
    deactivate() {
        if (!this.isActive) return false;

        this.isActive = false;
        this.onDeactivate();
        console.log(`⏸️ 插件 "${this.name}" 已停用`);
        return true;
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
            targetComplaints: this.targetComplaints
        };
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

        // 美化的办公室活动区域 (适应1000px宽度)
        this.activityAreas = [
            { name: '饮水机', x: 280, y: 50, width: 40, height: 40, icon: '🚰', color: '#E3F2FD', borderColor: '#2196F3' },
            { name: '打印机', x: 900, y: 100, width: 50, height: 40, icon: '🖨️', color: '#E8F5E8', borderColor: '#4CAF50' },
            { name: '休息区', x: 800, y: 600, width: 120, height: 80, icon: '☕', color: '#FFF3E0', borderColor: '#FF9800' },
            { name: '洗手间', x: 280, y: 600, width: 70, height: 50, icon: '🚻', color: '#FCE4EC', borderColor: '#E91E63' },
            { name: '会议室', x: 650, y: 50, width: 120, height: 80, icon: '📋', color: '#F3E5F5', borderColor: '#9C27B0' },
            { name: '茶水间', x: 900, y: 300, width: 80, height: 60, icon: '🫖', color: '#E8F8F5', borderColor: '#52C41A' },
            { name: '储物间', x: 280, y: 300, width: 60, height: 50, icon: '📦', color: '#FFF7E6', borderColor: '#FA8C16' }
        ];

        // 装饰元素 (适应1000px宽度)
        this.decorations = [
            { type: 'plant', x: 400, y: 30, emoji: '🌱' },
            { type: 'plant', x: 550, y: 30, emoji: '🪴' },
            { type: 'plant', x: 800, y: 30, emoji: '🌿' },
            { type: 'plant', x: 950, y: 500, emoji: '🌵' },
            { type: 'clock', x: 500, y: 20, emoji: '🕐' },
            { type: 'bookshelf', x: 900, y: 200, emoji: '📚' },
            { type: 'whiteboard', x: 280, y: 200, emoji: '📋' }
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
    }

    createOfficeLayout() {
        const deskWidth = 80;
        const deskHeight = 60;
        const spacing = 40;
        const startX = 320; // 向右移动为公告栏留空间
        const startY = 120;

        // 调整布局：4行5列的办公桌 (适应1000px宽度)
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 5; col++) {
                const x = startX + col * (deskWidth + spacing);
                const y = startY + row * (deskHeight + spacing);

                const desk = {
                    x: x,
                    y: y,
                    width: deskWidth,
                    height: deskHeight,
                    occupied: false,
                    hasDrawer: Math.random() > 0.5, // 在创建时决定是否有抽屉
                    workPosition: {
                        x: x + deskWidth / 2 - 16,
                        y: y + deskHeight / 2 - 16
                    }
                };
                this.desks.push(desk);

                const computer = {
                    x: x + 15,
                    y: y + 15,
                    width: 25,
                    height: 20,
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
            nextComplaintTime: 60 + Math.random() * 180 // 1-4秒后第一次抱怨
        };

        this.employees.push(employee);
        this.updateEmployeeCount();
    }

    findEmptyPosition() {
        for (let attempts = 0; attempts < 100; attempts++) {
            // 确保不在公告栏区域生成 (x > 270)
            const x = 270 + Math.random() * (this.width - 270 - 32);
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

        this.gameTime += 1 / 60;

        this.employees.forEach(employee => {
            this.updateEmployee(employee);
        });

        this.updateGameTime();
    }

    updateEmployee(employee) {
        if (employee.nameTimer > 0) {
            employee.nameTimer--;
            employee.showName = true;
        } else {
            employee.showName = false;
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

                if (currentComplainingCount < 2) {
                    // 随机选择一个抱怨
                    const complaintIndex = Math.floor(Math.random() * this.complaints.length);
                    employee.complaint = this.complaints[complaintIndex];
                    employee.complaintTimer = 300; // 显示5秒

                    // 统计抱怨
                    this.recordComplaint(complaintIndex);
                    console.log(`${employee.name} 自动抱怨: ${employee.complaint}`); // 调试信息
                }
                // 设置下次抱怨时间 (15-45秒后)
                employee.nextComplaintTime = 900 + Math.random() * 1800;
            }
        }
    }

    handleWorking(employee) {
        employee.workTimer--;

        if (Math.random() < 0.001) {
            employee.nameTimer = 120;
        }

        if (employee.workTimer <= 0) {
            const rand = Math.random();
            if (rand < 0.5) { // 50%概率去活动
                this.startActivity(employee);
            } else if (rand < 0.8) { // 30%概率随意走动
                this.startWandering(employee);
            } else { // 20%概率继续工作
                employee.workTimer = 300 + Math.random() * 900; // 5-20秒工作时间
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

        const rand = Math.random();
        if (rand < 0.03) { // 3%概率回到工作
            this.returnToWork(employee);
        } else if (rand < 0.06) { // 3%概率去活动区域
            this.startActivity(employee);
        } else if (rand < 0.1) { // 4%概率随机移动
            this.moveToRandomLocation(employee);
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
            const area = availableAreas[Math.floor(Math.random() * availableAreas.length)];
            employee.currentActivity = area.name;
            employee.nameTimer = 180;
            this.moveEmployeeTo(employee, area.x + area.width / 2 - 16, area.y + area.height / 2 - 16);
        } else {
            employee.state = 'wandering';
            employee.restTimer = 60; // 1秒等待
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

    render() {
        if (!this.gameStarted) return;

        // 渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 地板瓷砖效果 (为公告栏留出空间)
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 1;
        for (let x = 270; x < this.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(270, y);
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
                this.ctx.font = '12px Inter, sans-serif';
                const textWidth = this.ctx.measureText(text).width;

                // 名字背景 - 如果有抱怨气泡，名字显示在更上方
                const nameY = employee.complaint ? employee.y - 80 : employee.y - 25;
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                this.ctx.fillRect(employee.x - 5, nameY, textWidth + 10, 18);

                // 名字文本
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(text, employee.x, nameY + 15);
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
        if (this.complaintStats.has(category)) {
            this.complaintStats.set(category, this.complaintStats.get(category) + 1);
        } else {
            this.complaintStats.set(category, 1);
        }
    }

    drawComplaintBoard() {
        const boardWidth = 250;
        const boardHeight = this.height - 40;
        const boardX = 10;
        const boardY = 20;

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

        // 获取排序后的抱怨统计
        const sortedComplaints = Array.from(this.complaintStats.entries())
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

        sortedComplaints.forEach((complaint, index) => {
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
            const categoryText = category.length > 8 ? category.substring(0, 8) + '...' : category;
            this.ctx.fillText(categoryText, boardX + 35, currentY);

            // 绘制次数
            this.ctx.fillStyle = '#dc3545';
            this.ctx.font = 'bold 12px Inter, sans-serif';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${count}次`, boardX + boardWidth - 15, currentY);

            // 绘制进度条
            const barWidth = 60;
            const barHeight = 4;
            const maxCount = sortedComplaints[0][1];
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
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (game) {
            game.handleClick(x, y);
        }
    });
});

function addEmployee() {
    if (game) {
        game.addRandomEmployee();
    }
}

function removeEmployee() {
    if (game) {
        game.removeRandomEmployee();
    }
}

function togglePause() {
    if (game) {
        game.togglePause();
    }
}

function resetGame() {
    if (game) {
        game.reset();
    }
}