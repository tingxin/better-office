// 性能优化器 - 办公室生存游戏性能优化系统
class PerformanceOptimizer {
    constructor(game) {
        this.game = game;
        this.initialized = false;
        
        // 性能监控
        this.performanceMetrics = {
            fps: 60,
            frameTime: 16.67, // 毫秒
            renderTime: 0,
            updateTime: 0,
            memoryUsage: 0,
            employeeCount: 0,
            lastMeasurement: Date.now()
        };
        
        // 渲染优化
        this.renderOptimizations = {
            cullingEnabled: true,
            batchRenderingEnabled: true,
            dirtyRectangles: new Set(),
            lastRenderTime: 0,
            renderThrottle: 16, // 60 FPS 限制
            offscreenCanvas: null,
            imageCache: new Map()
        };
        
        // 更新优化
        this.updateOptimizations = {
            employeeUpdateBatching: true,
            spatialPartitioning: new Map(),
            updateFrequencyControl: new Map(),
            lastUpdateTime: 0,
            updateThrottle: 16
        };
        
        // 内存优化
        this.memoryOptimizations = {
            objectPooling: new Map(),
            garbageCollectionThreshold: 1000,
            lastGCTime: Date.now(),
            gcInterval: 30000 // 30秒
        };
        
        // 智能更新机制
        this.smartUpdates = {
            visibilityAPI: 'hidden' in document,
            isVisible: !document.hidden,
            reducedUpdateRate: false,
            backgroundUpdateInterval: 200 // 5 FPS when hidden
        };
        
        console.log('⚡ PerformanceOptimizer 初始化');
    }

    // 初始化性能优化系统
    initialize() {
        if (this.initialized) return;
        
        this.setupRenderOptimizations();
        this.setupUpdateOptimizations();
        this.setupMemoryOptimizations();
        this.setupSmartUpdates();
        this.setupPerformanceMonitoring();
        
        this.initialized = true;
        console.log('✅ 性能优化系统已启用');
    }

    // 设置渲染优化
    setupRenderOptimizations() {
        // 创建离屏画布用于预渲染
        this.renderOptimizations.offscreenCanvas = document.createElement('canvas');
        this.renderOptimizations.offscreenCanvas.width = this.game.width;
        this.renderOptimizations.offscreenCanvas.height = this.game.height;
        this.renderOptimizations.offscreenCtx = this.renderOptimizations.offscreenCanvas.getContext('2d');
        
        // 预缓存静态图像
        this.preloadStaticImages();
        
        // 设置视口裁剪
        this.setupViewportCulling();
        
        console.log('🎨 渲染优化已设置');
    }

    // 预加载静态图像
    preloadStaticImages() {
        const staticElements = [
            'desk', 'computer', 'background', 'activityArea', 'decoration'
        ];
        
        staticElements.forEach(elementType => {
            this.renderOptimizations.imageCache.set(elementType, new Map());
        });
        
        // 预渲染办公桌
        this.prerenderDesks();
        
        // 预渲染活动区域
        this.prerenderActivityAreas();
        
        console.log('📦 静态图像预加载完成');
    }

    // 预渲染办公桌
    prerenderDesks() {
        const deskCache = this.renderOptimizations.imageCache.get('desk');
        
        // 创建不同状态的办公桌图像
        ['occupied', 'empty', 'withDrawer', 'withoutDrawer'].forEach(state => {
            const canvas = document.createElement('canvas');
            canvas.width = 70;
            canvas.height = 42;
            const ctx = canvas.getContext('2d');
            
            this.renderDeskToCanvas(ctx, state);
            deskCache.set(state, canvas);
        });
    }

    // 预渲染活动区域
    prerenderActivityAreas() {
        const areaCache = this.renderOptimizations.imageCache.get('activityArea');
        
        this.game.activityAreas.forEach(area => {
            const canvas = document.createElement('canvas');
            canvas.width = area.width + 20; // 包含标签空间
            canvas.height = area.height + 20;
            const ctx = canvas.getContext('2d');
            
            this.renderActivityAreaToCanvas(ctx, area);
            areaCache.set(area.name, canvas);
        });
    }

    // 渲染办公桌到画布
    renderDeskToCanvas(ctx, state) {
        const width = 70;
        const height = 42;
        
        // 桌子阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(3, 3, width, height);

        // 桌面渐变
        const deskGradient = ctx.createLinearGradient(0, 0, 0, height);
        if (state.includes('occupied')) {
            deskGradient.addColorStop(0, '#E8E8E8');
            deskGradient.addColorStop(1, '#D0D0D0');
        } else {
            deskGradient.addColorStop(0, '#F5F5F5');
            deskGradient.addColorStop(1, '#E0E0E0');
        }

        ctx.fillStyle = deskGradient;
        ctx.fillRect(0, 0, width, height);

        // 桌子边缘
        ctx.strokeStyle = '#B0B0B0';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, width, height);

        // 桌面纹理线条
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
            const lineY = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(5, lineY);
            ctx.lineTo(width - 5, lineY);
            ctx.stroke();
        }

        // 桌腿
        ctx.fillStyle = '#808080';
        ctx.fillRect(5, height - 8, 6, 8);
        ctx.fillRect(width - 11, height - 8, 6, 8);
        ctx.fillRect(5, 5, 6, height - 13);
        ctx.fillRect(width - 11, 5, 6, height - 13);

        // 抽屉（如果有）
        if (state.includes('withDrawer')) {
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(10, height - 20, width - 20, 12);
            ctx.strokeStyle = '#A0A0A0';
            ctx.lineWidth = 1;
            ctx.strokeRect(10, height - 20, width - 20, 12);

            // 抽屉把手
            ctx.fillStyle = '#606060';
            ctx.fillRect(width - 25, height - 16, 8, 4);
        }

        // 桌面高光
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 1, width - 2, 2);
    }

    // 渲染活动区域到画布
    renderActivityAreaToCanvas(ctx, area) {
        // 区域背景
        ctx.fillStyle = area.color;
        ctx.fillRect(0, 0, area.width, area.height);

        // 区域边框
        ctx.strokeStyle = area.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, area.width, area.height);

        // 图标
        ctx.font = '24px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText(area.icon, area.width / 2, area.height / 2 + 8);

        // 标签
        ctx.fillStyle = '#495057';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(area.name, area.width / 2, area.height + 15);
    }

    // 设置视口裁剪
    setupViewportCulling() {
        this.renderOptimizations.viewport = {
            x: 0,
            y: 0,
            width: this.game.width,
            height: this.game.height,
            margin: 50 // 额外渲染边距
        };
    }

    // 设置更新优化
    setupUpdateOptimizations() {
        // 初始化空间分区
        this.initializeSpatialPartitioning();
        
        // 设置更新频率控制
        this.setupUpdateFrequencyControl();
        
        // 设置批量更新
        this.setupBatchUpdates();
        
        console.log('🔄 更新优化已设置');
    }

    // 初始化空间分区
    initializeSpatialPartitioning() {
        const gridSize = 100; // 100x100 像素的网格
        const cols = Math.ceil(this.game.width / gridSize);
        const rows = Math.ceil(this.game.height / gridSize);
        
        this.updateOptimizations.spatialGrid = {
            gridSize,
            cols,
            rows,
            cells: new Array(cols * rows).fill(null).map(() => [])
        };
        
        console.log(`📍 空间分区初始化: ${cols}x${rows} 网格`);
    }

    // 设置更新频率控制
    setupUpdateFrequencyControl() {
        // 不同类型对象的更新频率
        this.updateOptimizations.updateFrequencies = {
            employee: 1,      // 每帧更新
            desk: 10,         // 每10帧更新一次
            computer: 30,     // 每30帧更新一次
            decoration: 60,   // 每60帧更新一次
            activityArea: 20  // 每20帧更新一次
        };
        
        this.updateOptimizations.frameCounter = 0;
    }

    // 设置批量更新
    setupBatchUpdates() {
        this.updateOptimizations.updateBatches = {
            employees: [],
            staticObjects: [],
            effects: []
        };
    }

    // 设置内存优化
    setupMemoryOptimizations() {
        // 初始化对象池
        this.initializeObjectPools();
        
        // 设置垃圾回收监控
        this.setupGarbageCollection();
        
        console.log('🧠 内存优化已设置');
    }

    // 初始化对象池
    initializeObjectPools() {
        const poolTypes = ['complaintBubble', 'nameTag', 'statusIndicator', 'particle'];
        
        poolTypes.forEach(type => {
            this.memoryOptimizations.objectPooling.set(type, {
                available: [],
                inUse: [],
                maxSize: 50
            });
        });
    }

    // 设置垃圾回收
    setupGarbageCollection() {
        // 监控内存使用
        if (performance.memory) {
            this.memoryOptimizations.memoryMonitoring = true;
        }
        
        // 定期清理
        setInterval(() => {
            this.performGarbageCollection();
        }, this.memoryOptimizations.gcInterval);
    }

    // 设置智能更新
    setupSmartUpdates() {
        if (this.smartUpdates.visibilityAPI) {
            document.addEventListener('visibilitychange', () => {
                this.handleVisibilityChange();
            });
        }
        
        // 检测窗口焦点
        window.addEventListener('focus', () => {
            this.handleWindowFocus(true);
        });
        
        window.addEventListener('blur', () => {
            this.handleWindowFocus(false);
        });
        
        console.log('🧠 智能更新机制已设置');
    }

    // 处理可见性变化
    handleVisibilityChange() {
        this.smartUpdates.isVisible = !document.hidden;
        
        if (this.smartUpdates.isVisible) {
            console.log('👁️ 页面可见，恢复正常更新频率');
            this.smartUpdates.reducedUpdateRate = false;
        } else {
            console.log('🙈 页面隐藏，降低更新频率');
            this.smartUpdates.reducedUpdateRate = true;
        }
    }

    // 处理窗口焦点变化
    handleWindowFocus(hasFocus) {
        if (hasFocus) {
            console.log('🎯 窗口获得焦点，恢复正常渲染');
        } else {
            console.log('😴 窗口失去焦点，降低渲染频率');
        }
    }

    // 设置性能监控
    setupPerformanceMonitoring() {
        // 每秒更新性能指标
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 1000);
        
        console.log('📊 性能监控已启用');
    }

    // 优化渲染函数
    optimizedRender() {
        if (!this.initialized) return false;
        
        const startTime = performance.now();
        
        // 检查是否需要渲染
        if (!this.shouldRender()) {
            return false;
        }
        
        // 清空脏矩形
        this.renderOptimizations.dirtyRectangles.clear();
        
        // 使用离屏渲染
        const ctx = this.renderOptimizations.offscreenCtx;
        ctx.clearRect(0, 0, this.game.width, this.game.height);
        
        // 渲染背景（缓存）
        this.renderCachedBackground(ctx);
        
        // 渲染静态元素（批量）
        this.renderStaticElementsBatch(ctx);
        
        // 渲染动态元素（裁剪）
        this.renderDynamicElementsCulled(ctx);
        
        // 复制到主画布
        this.game.ctx.drawImage(this.renderOptimizations.offscreenCanvas, 0, 0);
        
        // 记录渲染时间
        this.performanceMetrics.renderTime = performance.now() - startTime;
        this.renderOptimizations.lastRenderTime = Date.now();
        
        return true;
    }

    // 检查是否需要渲染
    shouldRender() {
        const now = Date.now();
        const timeSinceLastRender = now - this.renderOptimizations.lastRenderTime;
        
        // 如果页面不可见，降低渲染频率
        if (this.smartUpdates.reducedUpdateRate) {
            return timeSinceLastRender >= this.smartUpdates.backgroundUpdateInterval;
        }
        
        // 正常渲染频率限制
        return timeSinceLastRender >= this.renderOptimizations.renderThrottle;
    }

    // 渲染缓存背景
    renderCachedBackground(ctx) {
        // 渐变背景
        const gradient = ctx.createLinearGradient(0, 0, this.game.width, this.game.height);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.game.width, this.game.height);

        // 地板瓷砖效果（优化版本）
        this.renderOptimizedFloorTiles(ctx);
    }

    // 优化的地板瓷砖渲染
    renderOptimizedFloorTiles(ctx) {
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // 垂直线
        for (let x = 220; x < this.game.width; x += 40) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.game.height);
        }
        
        // 水平线
        for (let y = 0; y < this.game.height; y += 40) {
            ctx.moveTo(220, y);
            ctx.lineTo(this.game.width, y);
        }
        
        ctx.stroke();
    }

    // 批量渲染静态元素
    renderStaticElementsBatch(ctx) {
        // 渲染装饰元素
        this.game.decorations.forEach(decoration => {
            ctx.font = '20px Arial';
            ctx.fillStyle = '#333';
            ctx.fillText(decoration.emoji, decoration.x, decoration.y);
        });

        // 批量渲染活动区域
        this.renderActivityAreasBatch(ctx);
        
        // 批量渲染办公桌
        this.renderDesksBatch(ctx);
        
        // 批量渲染电脑
        this.renderComputersBatch(ctx);
    }

    // 批量渲染活动区域
    renderActivityAreasBatch(ctx) {
        const areaCache = this.renderOptimizations.imageCache.get('activityArea');
        
        this.game.activityAreas.forEach(area => {
            const cachedImage = areaCache.get(area.name);
            if (cachedImage) {
                ctx.drawImage(cachedImage, area.x - 10, area.y - 10);
            } else {
                // 回退到原始渲染
                this.renderActivityAreaFallback(ctx, area);
            }
        });
    }

    // 批量渲染办公桌
    renderDesksBatch(ctx) {
        const deskCache = this.renderOptimizations.imageCache.get('desk');
        
        this.game.desks.forEach(desk => {
            // 确定桌子状态
            let state = desk.occupied ? 'occupied' : 'empty';
            if (desk.hasDrawer) {
                state += 'WithDrawer';
            } else {
                state += 'WithoutDrawer';
            }
            
            const cachedImage = deskCache.get(state);
            if (cachedImage) {
                ctx.drawImage(cachedImage, desk.x, desk.y);
            } else {
                // 回退到原始渲染
                this.renderDeskFallback(ctx, desk);
            }
        });
    }

    // 批量渲染电脑
    renderComputersBatch(ctx) {
        // 只在需要时更新电脑状态
        if (this.updateOptimizations.frameCounter % this.updateOptimizations.updateFrequencies.computer === 0) {
            this.game.computers.forEach(computer => {
                this.renderComputer(ctx, computer);
            });
        }
    }

    // 裁剪渲染动态元素
    renderDynamicElementsCulled(ctx) {
        const viewport = this.renderOptimizations.viewport;
        
        // 只渲染视口内的员工
        const visibleEmployees = this.getVisibleEmployees(viewport);
        this.renderEmployeesBatch(ctx, visibleEmployees);
    }

    // 获取可见员工
    getVisibleEmployees(viewport) {
        return this.game.employees.filter(employee => {
            return this.isInViewport(employee, viewport);
        });
    }

    // 检查对象是否在视口内
    isInViewport(obj, viewport) {
        return obj.x + obj.width >= viewport.x - viewport.margin &&
               obj.x <= viewport.x + viewport.width + viewport.margin &&
               obj.y + obj.height >= viewport.y - viewport.margin &&
               obj.y <= viewport.y + viewport.height + viewport.margin;
    }

    // 批量渲染员工
    renderEmployeesBatch(ctx, employees) {
        employees.forEach(employee => {
            // 渲染员工角色
            if (this.game.characterImages[employee.imageIndex]) {
                ctx.drawImage(
                    this.game.characterImages[employee.imageIndex],
                    employee.x,
                    employee.y,
                    employee.width,
                    employee.height
                );
            }

            // 渲染状态指示器
            this.renderEmployeeStatus(ctx, employee);
            
            // 渲染抱怨气泡（如果有）
            if (employee.complaint) {
                this.renderComplaintBubbleOptimized(ctx, employee);
            }
            
            // 渲染名字标签（如果需要）
            if (employee.showName || employee.state === 'working' || employee.state === 'activity') {
                this.renderNameTagOptimized(ctx, employee);
            }
        });
    }

    // 优化更新函数
    optimizedUpdate(deltaTime) {
        if (!this.initialized) return false;
        
        const startTime = performance.now();
        
        // 检查是否需要更新
        if (!this.shouldUpdate()) {
            return false;
        }
        
        // 更新帧计数器
        this.updateOptimizations.frameCounter++;
        
        // 更新空间分区
        this.updateSpatialPartitioning();
        
        // 批量更新员工
        this.updateEmployeesBatch(deltaTime);
        
        // 定期更新静态对象
        this.updateStaticObjectsPeriodic();
        
        // 记录更新时间
        this.performanceMetrics.updateTime = performance.now() - startTime;
        this.updateOptimizations.lastUpdateTime = Date.now();
        
        return true;
    }

    // 检查是否需要更新
    shouldUpdate() {
        const now = Date.now();
        const timeSinceLastUpdate = now - this.updateOptimizations.lastUpdateTime;
        
        // 如果页面不可见，降低更新频率
        if (this.smartUpdates.reducedUpdateRate) {
            return timeSinceLastUpdate >= this.smartUpdates.backgroundUpdateInterval;
        }
        
        // 正常更新频率限制
        return timeSinceLastUpdate >= this.updateOptimizations.updateThrottle;
    }

    // 更新空间分区
    updateSpatialPartitioning() {
        const grid = this.updateOptimizations.spatialGrid;
        
        // 清空所有网格
        grid.cells.forEach(cell => cell.length = 0);
        
        // 将员工分配到网格
        this.game.employees.forEach(employee => {
            const gridX = Math.floor(employee.x / grid.gridSize);
            const gridY = Math.floor(employee.y / grid.gridSize);
            const cellIndex = gridY * grid.cols + gridX;
            
            if (cellIndex >= 0 && cellIndex < grid.cells.length) {
                grid.cells[cellIndex].push(employee);
            }
        });
    }

    // 批量更新员工
    updateEmployeesBatch(deltaTime) {
        const batchSize = Math.min(10, this.game.employees.length); // 每次最多更新10个员工
        const startIndex = (this.updateOptimizations.frameCounter * batchSize) % this.game.employees.length;
        
        for (let i = 0; i < batchSize; i++) {
            const index = (startIndex + i) % this.game.employees.length;
            const employee = this.game.employees[index];
            
            if (employee) {
                this.game.updateEmployee(employee);
            }
        }
    }

    // 定期更新静态对象
    updateStaticObjectsPeriodic() {
        const frameCount = this.updateOptimizations.frameCounter;
        
        // 每30帧更新一次电脑状态
        if (frameCount % 30 === 0) {
            this.updateComputerStates();
        }
        
        // 每60帧检查一次设施状态
        if (frameCount % 60 === 0) {
            this.updateFacilityStates();
        }
    }

    // 更新电脑状态
    updateComputerStates() {
        this.game.computers.forEach(computer => {
            // 随机切换电脑开关状态
            if (Math.random() < 0.01) { // 1% 概率
                computer.isOn = !computer.isOn;
            }
        });
    }

    // 更新设施状态
    updateFacilityStates() {
        // 这里可以添加设施状态更新逻辑
        // 例如：维护需求、效果衰减等
    }

    // 执行垃圾回收
    performGarbageCollection() {
        const now = Date.now();
        
        // 清理过期的对象
        this.cleanupExpiredObjects();
        
        // 回收对象池中的对象
        this.recyclePooledObjects();
        
        // 清理事件监听器
        this.cleanupEventListeners();
        
        this.memoryOptimizations.lastGCTime = now;
        
        console.log('🗑️ 垃圾回收完成');
    }

    // 清理过期对象
    cleanupExpiredObjects() {
        // 清理过期的抱怨气泡
        this.game.employees.forEach(employee => {
            if (employee.complaint && employee.complaintTimer <= 0) {
                employee.complaint = null;
            }
        });
    }

    // 回收对象池中的对象
    recyclePooledObjects() {
        this.memoryOptimizations.objectPooling.forEach((pool, type) => {
            // 将使用中的对象移回可用池
            while (pool.inUse.length > 0) {
                const obj = pool.inUse.pop();
                if (pool.available.length < pool.maxSize) {
                    pool.available.push(obj);
                }
            }
        });
    }

    // 清理事件监听器
    cleanupEventListeners() {
        // 这里可以添加清理逻辑
        // 例如：移除不再需要的事件监听器
    }

    // 更新性能指标
    updatePerformanceMetrics() {
        const now = Date.now();
        const timeDiff = now - this.performanceMetrics.lastMeasurement;
        
        // 更新FPS（基于实际渲染次数）
        this.performanceMetrics.fps = Math.round(1000 / this.performanceMetrics.frameTime);
        
        // 更新员工数量
        this.performanceMetrics.employeeCount = this.game.employees.length;
        
        // 更新内存使用（如果可用）
        if (performance.memory) {
            this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        
        this.performanceMetrics.lastMeasurement = now;
        
        // 如果性能下降，自动调整优化级别
        this.autoAdjustOptimizations();
    }

    // 自动调整优化级别
    autoAdjustOptimizations() {
        const metrics = this.performanceMetrics;
        
        // 如果FPS低于30，启用更激进的优化
        if (metrics.fps < 30) {
            console.log('⚠️ 性能下降，启用激进优化');
            this.enableAggressiveOptimizations();
        }
        // 如果FPS高于55，可以放宽一些优化
        else if (metrics.fps > 55) {
            this.relaxOptimizations();
        }
        
        // 如果内存使用过高，触发垃圾回收
        if (metrics.memoryUsage > 100) { // 100MB
            console.log('🧠 内存使用过高，执行垃圾回收');
            this.performGarbageCollection();
        }
    }

    // 启用激进优化
    enableAggressiveOptimizations() {
        // 降低更新频率
        this.updateOptimizations.updateThrottle = 33; // 30 FPS
        this.renderOptimizations.renderThrottle = 33;
        
        // 减少批量大小
        this.updateOptimizations.employeeBatchSize = 5;
        
        // 启用更激进的裁剪
        this.renderOptimizations.viewport.margin = 20;
        
        console.log('🚀 激进优化已启用');
    }

    // 放宽优化
    relaxOptimizations() {
        // 恢复正常更新频率
        this.updateOptimizations.updateThrottle = 16; // 60 FPS
        this.renderOptimizations.renderThrottle = 16;
        
        // 增加批量大小
        this.updateOptimizations.employeeBatchSize = 10;
        
        // 恢复正常裁剪边距
        this.renderOptimizations.viewport.margin = 50;
    }

    // 获取性能报告
    getPerformanceReport() {
        return {
            metrics: { ...this.performanceMetrics },
            optimizations: {
                renderingEnabled: this.renderOptimizations.batchRenderingEnabled,
                cullingEnabled: this.renderOptimizations.cullingEnabled,
                batchUpdatesEnabled: this.updateOptimizations.employeeUpdateBatching,
                smartUpdatesEnabled: this.smartUpdates.isVisible,
                memoryOptimizationEnabled: this.memoryOptimizations.objectPooling.size > 0
            },
            recommendations: this.getOptimizationRecommendations()
        };
    }

    // 获取优化建议
    getOptimizationRecommendations() {
        const recommendations = [];
        const metrics = this.performanceMetrics;
        
        if (metrics.fps < 45) {
            recommendations.push('考虑减少员工数量或启用更激进的优化');
        }
        
        if (metrics.renderTime > 10) {
            recommendations.push('渲染时间过长，考虑启用更多缓存');
        }
        
        if (metrics.updateTime > 5) {
            recommendations.push('更新时间过长，考虑减少更新频率');
        }
        
        if (metrics.memoryUsage > 50) {
            recommendations.push('内存使用较高，考虑更频繁的垃圾回收');
        }
        
        return recommendations;
    }

    // 回退渲染方法
    renderActivityAreaFallback(ctx, area) {
        // 原始渲染逻辑作为回退
        ctx.fillStyle = area.color;
        ctx.fillRect(area.x, area.y, area.width, area.height);
        ctx.strokeStyle = area.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(area.x, area.y, area.width, area.height);
        ctx.font = '24px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText(area.icon, area.x + area.width / 2, area.y + area.height / 2 + 8);
    }

    renderDeskFallback(ctx, desk) {
        // 原始桌子渲染逻辑
        const deskGradient = ctx.createLinearGradient(desk.x, desk.y, desk.x, desk.y + desk.height);
        deskGradient.addColorStop(0, desk.occupied ? '#E8E8E8' : '#F5F5F5');
        deskGradient.addColorStop(1, desk.occupied ? '#D0D0D0' : '#E0E0E0');
        ctx.fillStyle = deskGradient;
        ctx.fillRect(desk.x, desk.y, desk.width, desk.height);
    }

    renderComputer(ctx, computer) {
        // 显示器底座
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(computer.x + computer.width / 2 - 3, computer.y + computer.height, 6, 4);

        // 显示器外框
        ctx.fillStyle = computer.isOn ? '#1A1A1A' : '#3A3A3A';
        ctx.fillRect(computer.x, computer.y, computer.width, computer.height);

        // 屏幕区域
        const screenX = computer.x + 2;
        const screenY = computer.y + 2;
        const screenWidth = computer.width - 4;
        const screenHeight = computer.height - 4;

        if (computer.isOn) {
            const screenGradient = ctx.createLinearGradient(screenX, screenY, screenX, screenY + screenHeight);
            screenGradient.addColorStop(0, '#4A90E2');
            screenGradient.addColorStop(1, '#2E5BBA');
            ctx.fillStyle = screenGradient;
            ctx.fillRect(screenX, screenY, screenWidth, screenHeight);
        } else {
            ctx.fillStyle = '#0A0A0A';
            ctx.fillRect(screenX, screenY, screenWidth, screenHeight);
        }
    }

    renderEmployeeStatus(ctx, employee) {
        if (employee.state === 'working') {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(employee.x + employee.width - 5, employee.y + 5, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (employee.state === 'activity') {
            ctx.fillStyle = '#FF6B6B';
            ctx.beginPath();
            ctx.arc(employee.x + employee.width - 5, employee.y + 5, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderComplaintBubbleOptimized(ctx, employee) {
        // 简化的抱怨气泡渲染
        const bubbleWidth = 180;
        const bubbleHeight = 50;
        const bubbleX = Math.max(5, Math.min(employee.x + employee.width / 2 - bubbleWidth / 2, this.game.width - bubbleWidth - 5));
        const bubbleY = Math.max(5, employee.y - bubbleHeight - 10);

        // 气泡背景
        ctx.fillStyle = '#FFFACD';
        ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
        ctx.strokeStyle = '#DDD';
        ctx.lineWidth = 1;
        ctx.strokeRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);

        // 简化的文本渲染
        ctx.fillStyle = '#333';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'left';
        const shortText = employee.complaint.substring(0, 30) + '...';
        ctx.fillText(shortText, bubbleX + 5, bubbleY + 20);
    }

    renderNameTagOptimized(ctx, employee) {
        // 简化的名字标签渲染
        const text = employee.currentActivity ? `${employee.name} (${employee.currentActivity})` : employee.name;
        const nameY = employee.complaint ? employee.y - 70 : employee.y - 20;
        
        ctx.font = '11px Inter, sans-serif';
        const textWidth = ctx.measureText(text).width;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(employee.x - 2, nameY, textWidth + 4, 16);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.fillText(text, employee.x, nameY + 12);
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}