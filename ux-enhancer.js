// 用户体验增强器 - 办公室生存游戏用户体验改进系统
class UXEnhancer {
    constructor(game) {
        this.game = game;
        this.initialized = false;
        
        // 加载动画系统
        this.loadingSystem = {
            isLoading: false,
            loadingProgress: 0,
            loadingMessage: '',
            loadingElement: null,
            progressBar: null
        };
        
        // 过渡动画系统
        this.transitionSystem = {
            activeTransitions: new Map(),
            transitionQueue: [],
            easingFunctions: new Map()
        };
        
        // 响应速度优化
        this.responsiveness = {
            inputBuffer: [],
            lastInputTime: 0,
            inputThrottle: 50, // 50ms
            feedbackElements: new Map()
        };
        
        // 通知系统
        this.notificationSystem = {
            notifications: [],
            maxNotifications: 5,
            defaultDuration: 3000,
            container: null
        };
        
        // 工具提示系统
        this.tooltipSystem = {
            activeTooltip: null,
            tooltipElement: null,
            showDelay: 500,
            hideDelay: 100
        };
        
        // 音效系统
        this.audioSystem = {
            enabled: true,
            volume: 0.5,
            sounds: new Map(),
            audioContext: null
        };
        
        console.log('✨ UXEnhancer 初始化');
    }

    // 初始化用户体验增强系统
    initialize() {
        if (this.initialized) return;
        
        this.setupLoadingSystem();
        this.setupTransitionSystem();
        this.setupResponsivenessOptimization();
        this.setupNotificationSystem();
        this.setupTooltipSystem();
        this.setupAudioSystem();
        this.setupKeyboardShortcuts();
        this.setupAccessibility();
        
        this.initialized = true;
        console.log('✅ 用户体验增强系统已启用');
    }

    // 设置加载动画系统
    setupLoadingSystem() {
        // 创建加载界面元素
        this.createLoadingElements();
        
        // 设置加载进度跟踪
        this.setupLoadingProgress();
        
        console.log('⏳ 加载动画系统已设置');
    }

    // 创建加载界面元素
    createLoadingElements() {
        // 创建加载遮罩
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        `;
        
        // 创建加载动画
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'loading-spinner';
        loadingSpinner.style.cssText = `
            width: 60px;
            height: 60px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        `;
        
        // 创建加载文本
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.style.cssText = `
            color: white;
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 20px;
            text-align: center;
        `;
        loadingText.textContent = '正在加载游戏...';
        
        // 创建进度条
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 300px;
            height: 6px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
            overflow: hidden;
        `;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
            border-radius: 3px;
            transition: width 0.3s ease;
        `;
        
        progressContainer.appendChild(progressBar);
        loadingOverlay.appendChild(loadingSpinner);
        loadingOverlay.appendChild(loadingText);
        loadingOverlay.appendChild(progressContainer);
        
        // 添加CSS动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .loading-text {
                animation: pulse 2s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(loadingOverlay);
        
        this.loadingSystem.loadingElement = loadingOverlay;
        this.loadingSystem.progressBar = progressBar;
        this.loadingSystem.loadingText = loadingText;
    }

    // 设置加载进度跟踪
    setupLoadingProgress() {
        // 监听游戏加载事件
        this.trackGameLoadingProgress();
    }

    // 跟踪游戏加载进度
    trackGameLoadingProgress() {
        const loadingSteps = [
            { name: '初始化游戏引擎...', progress: 10 },
            { name: '加载角色图像...', progress: 25 },
            { name: '创建办公室布局...', progress: 40 },
            { name: '初始化员工系统...', progress: 60 },
            { name: '启动增强功能...', progress: 80 },
            { name: '完成初始化...', progress: 100 }
        ];
        
        let currentStep = 0;
        
        const updateProgress = () => {
            if (currentStep < loadingSteps.length) {
                const step = loadingSteps[currentStep];
                this.updateLoadingProgress(step.progress, step.name);
                currentStep++;
                
                if (currentStep < loadingSteps.length) {
                    setTimeout(updateProgress, 200 + Math.random() * 300);
                } else {
                    setTimeout(() => {
                        this.hideLoading();
                    }, 500);
                }
            }
        };
        
        // 如果游戏还没开始，显示加载界面
        if (!this.game.gameStarted) {
            this.showLoading();
            setTimeout(updateProgress, 500);
        }
    }

    // 显示加载界面
    showLoading(message = '正在加载...') {
        if (!this.loadingSystem.loadingElement) return;
        
        this.loadingSystem.isLoading = true;
        this.loadingSystem.loadingMessage = message;
        this.loadingSystem.loadingText.textContent = message;
        
        const overlay = this.loadingSystem.loadingElement;
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1';
        
        console.log('⏳ 显示加载界面:', message);
    }

    // 隐藏加载界面
    hideLoading() {
        if (!this.loadingSystem.loadingElement) return;
        
        const overlay = this.loadingSystem.loadingElement;
        overlay.style.opacity = '0';
        
        setTimeout(() => {
            overlay.style.visibility = 'hidden';
            this.loadingSystem.isLoading = false;
        }, 300);
        
        console.log('✅ 隐藏加载界面');
    }

    // 更新加载进度
    updateLoadingProgress(progress, message) {
        if (!this.loadingSystem.progressBar) return;
        
        this.loadingSystem.loadingProgress = progress;
        this.loadingSystem.progressBar.style.width = `${progress}%`;
        
        if (message) {
            this.loadingSystem.loadingMessage = message;
            this.loadingSystem.loadingText.textContent = message;
        }
        
        console.log(`📊 加载进度: ${progress}% - ${message}`);
    }

    // 设置过渡动画系统
    setupTransitionSystem() {
        // 初始化缓动函数
        this.initializeEasingFunctions();
        
        // 设置过渡动画管理器
        this.setupTransitionManager();
        
        console.log('🎬 过渡动画系统已设置');
    }

    // 初始化缓动函数
    initializeEasingFunctions() {
        const easings = this.transitionSystem.easingFunctions;
        
        easings.set('linear', t => t);
        easings.set('easeInQuad', t => t * t);
        easings.set('easeOutQuad', t => t * (2 - t));
        easings.set('easeInOutQuad', t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
        easings.set('easeInCubic', t => t * t * t);
        easings.set('easeOutCubic', t => (--t) * t * t + 1);
        easings.set('easeInOutCubic', t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);
        easings.set('bounce', t => {
            if (t < 1/2.75) return 7.5625 * t * t;
            if (t < 2/2.75) return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
            if (t < 2.5/2.75) return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
            return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
        });
    }

    // 设置过渡动画管理器
    setupTransitionManager() {
        // 启动动画循环
        this.startAnimationLoop();
    }

    // 启动动画循环
    startAnimationLoop() {
        const animate = () => {
            this.updateTransitions();
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    // 更新过渡动画
    updateTransitions() {
        const now = Date.now();
        const activeTransitions = this.transitionSystem.activeTransitions;
        
        for (const [id, transition] of activeTransitions) {
            const elapsed = now - transition.startTime;
            const progress = Math.min(elapsed / transition.duration, 1);
            
            // 应用缓动函数
            const easingFunc = this.transitionSystem.easingFunctions.get(transition.easing) || (t => t);
            const easedProgress = easingFunc(progress);
            
            // 更新属性值
            for (const [property, values] of Object.entries(transition.properties)) {
                const currentValue = values.from + (values.to - values.from) * easedProgress;
                
                if (transition.target && typeof transition.target === 'object') {
                    transition.target[property] = currentValue;
                }
            }
            
            // 调用更新回调
            if (transition.onUpdate) {
                transition.onUpdate(easedProgress, transition);
            }
            
            // 检查动画是否完成
            if (progress >= 1) {
                if (transition.onComplete) {
                    transition.onComplete(transition);
                }
                activeTransitions.delete(id);
            }
        }
    }

    // 创建过渡动画
    createTransition(target, properties, duration, options = {}) {
        const id = Date.now() + Math.random();
        const transition = {
            id,
            target,
            properties,
            duration,
            startTime: Date.now(),
            easing: options.easing || 'easeOutQuad',
            onUpdate: options.onUpdate,
            onComplete: options.onComplete
        };
        
        this.transitionSystem.activeTransitions.set(id, transition);
        return id;
    }

    // 设置响应速度优化
    setupResponsivenessOptimization() {
        // 设置输入缓冲
        this.setupInputBuffering();
        
        // 设置即时反馈
        this.setupInstantFeedback();
        
        console.log('⚡ 响应速度优化已设置');
    }

    // 设置输入缓冲
    setupInputBuffering() {
        // 监听鼠标事件
        this.game.canvas.addEventListener('click', (e) => {
            this.bufferInput('click', e);
        });
        
        this.game.canvas.addEventListener('mousemove', (e) => {
            this.bufferInput('mousemove', e);
        });
        
        // 监听键盘事件
        document.addEventListener('keydown', (e) => {
            this.bufferInput('keydown', e);
        });
    }

    // 缓冲输入事件
    bufferInput(type, event) {
        const now = Date.now();
        
        // 节流处理
        if (now - this.responsiveness.lastInputTime < this.responsiveness.inputThrottle) {
            return;
        }
        
        this.responsiveness.inputBuffer.push({
            type,
            event,
            timestamp: now
        });
        
        this.responsiveness.lastInputTime = now;
        
        // 立即处理输入
        this.processInputBuffer();
    }

    // 处理输入缓冲
    processInputBuffer() {
        while (this.responsiveness.inputBuffer.length > 0) {
            const input = this.responsiveness.inputBuffer.shift();
            this.handleBufferedInput(input);
        }
    }

    // 处理缓冲的输入
    handleBufferedInput(input) {
        switch (input.type) {
            case 'click':
                this.handleOptimizedClick(input.event);
                break;
            case 'mousemove':
                this.handleOptimizedMouseMove(input.event);
                break;
            case 'keydown':
                this.handleOptimizedKeyDown(input.event);
                break;
        }
    }

    // 优化的点击处理
    handleOptimizedClick(event) {
        const rect = this.game.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 添加点击反馈
        this.showClickFeedback(x, y);
        
        // 调用原始点击处理
        this.game.handleClick(x, y);
    }

    // 优化的鼠标移动处理
    handleOptimizedMouseMove(event) {
        const rect = this.game.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 检查悬停元素
        this.checkHoverElements(x, y);
    }

    // 优化的键盘处理
    handleOptimizedKeyDown(event) {
        // 处理快捷键
        this.handleKeyboardShortcuts(event);
    }

    // 设置即时反馈
    setupInstantFeedback() {
        // 创建反馈元素容器
        this.createFeedbackContainer();
    }

    // 创建反馈容器
    createFeedbackContainer() {
        const container = document.createElement('div');
        container.id = 'feedback-container';
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
        `;
        
        this.game.canvas.parentElement.appendChild(container);
        this.responsiveness.feedbackContainer = container;
    }

    // 显示点击反馈
    showClickFeedback(x, y) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: absolute;
            left: ${x - 10}px;
            top: ${y - 10}px;
            width: 20px;
            height: 20px;
            border: 2px solid #4facfe;
            border-radius: 50%;
            background: rgba(79, 172, 254, 0.2);
            animation: clickRipple 0.6s ease-out forwards;
            pointer-events: none;
        `;
        
        // 添加点击动画CSS
        if (!document.getElementById('click-feedback-styles')) {
            const style = document.createElement('style');
            style.id = 'click-feedback-styles';
            style.textContent = `
                @keyframes clickRipple {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(3);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.responsiveness.feedbackContainer.appendChild(feedback);
        
        // 清理反馈元素
        setTimeout(() => {
            if (feedback.parentElement) {
                feedback.parentElement.removeChild(feedback);
            }
        }, 600);
    }

    // 设置通知系统
    setupNotificationSystem() {
        this.createNotificationContainer();
        console.log('📢 通知系统已设置');
    }

    // 创建通知容器
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 350px;
        `;
        
        document.body.appendChild(container);
        this.notificationSystem.container = container;
    }

    // 显示通知
    showNotification(message, type = 'info', duration = null) {
        if (!this.notificationSystem.container) return;
        
        const notification = this.createNotificationElement(message, type);
        this.notificationSystem.container.appendChild(notification);
        this.notificationSystem.notifications.push(notification);
        
        // 限制通知数量
        this.limitNotifications();
        
        // 自动隐藏
        const hideDelay = duration || this.notificationSystem.defaultDuration;
        setTimeout(() => {
            this.hideNotification(notification);
        }, hideDelay);
        
        console.log(`📢 显示通知: ${message} (${type})`);
    }

    // 创建通知元素
    createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            info: { bg: '#4facfe', border: '#0099ff' },
            success: { bg: '#00d4aa', border: '#00b894' },
            warning: { bg: '#fdcb6e', border: '#e17055' },
            error: { bg: '#fd79a8', border: '#e84393' },
            achievement: { bg: '#ffd700', border: '#ffb300' }
        };
        
        const color = colors[type] || colors.info;
        
        notification.style.cssText = `
            background: ${color.bg};
            border-left: 4px solid ${color.border};
            color: white;
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-size: 14px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease, opacity 0.3s ease;
            cursor: pointer;
        `;
        
        notification.textContent = message;
        
        // 添加关闭按钮
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            float: right;
            margin-left: 10px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            opacity: 0.7;
        `;
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            this.hideNotification(notification);
        };
        
        notification.appendChild(closeBtn);
        
        // 点击隐藏
        notification.onclick = () => {
            this.hideNotification(notification);
        };
        
        // 动画显示
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        return notification;
    }

    // 隐藏通知
    hideNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
            
            const index = this.notificationSystem.notifications.indexOf(notification);
            if (index > -1) {
                this.notificationSystem.notifications.splice(index, 1);
            }
        }, 300);
    }

    // 限制通知数量
    limitNotifications() {
        while (this.notificationSystem.notifications.length > this.notificationSystem.maxNotifications) {
            const oldestNotification = this.notificationSystem.notifications.shift();
            this.hideNotification(oldestNotification);
        }
    }

    // 设置工具提示系统
    setupTooltipSystem() {
        this.createTooltipElement();
        this.setupTooltipEvents();
        console.log('💡 工具提示系统已设置');
    }

    // 创建工具提示元素
    createTooltipElement() {
        const tooltip = document.createElement('div');
        tooltip.id = 'game-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            z-index: 10001;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
            pointer-events: none;
            max-width: 200px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(tooltip);
        this.tooltipSystem.tooltipElement = tooltip;
    }

    // 设置工具提示事件
    setupTooltipEvents() {
        this.game.canvas.addEventListener('mousemove', (e) => {
            this.updateTooltipPosition(e);
        });
        
        this.game.canvas.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
    }

    // 显示工具提示
    showTooltip(text, x, y) {
        if (!this.tooltipSystem.tooltipElement) return;
        
        const tooltip = this.tooltipSystem.tooltipElement;
        tooltip.textContent = text;
        tooltip.style.left = `${x + 10}px`;
        tooltip.style.top = `${y - 30}px`;
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        
        this.tooltipSystem.activeTooltip = text;
    }

    // 隐藏工具提示
    hideTooltip() {
        if (!this.tooltipSystem.tooltipElement) return;
        
        const tooltip = this.tooltipSystem.tooltipElement;
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
        
        this.tooltipSystem.activeTooltip = null;
    }

    // 更新工具提示位置
    updateTooltipPosition(event) {
        const rect = this.game.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // 检查是否悬停在员工上
        const hoveredEmployee = this.getHoveredEmployee(x, y);
        if (hoveredEmployee) {
            const tooltipText = this.generateEmployeeTooltip(hoveredEmployee);
            this.showTooltip(tooltipText, event.clientX, event.clientY);
        } else {
            this.hideTooltip();
        }
    }

    // 获取悬停的员工
    getHoveredEmployee(x, y) {
        return this.game.employees.find(employee => {
            return x >= employee.x && x <= employee.x + employee.width &&
                   y >= employee.y && y <= employee.y + employee.height;
        });
    }

    // 生成员工工具提示
    generateEmployeeTooltip(employee) {
        let tooltip = `${employee.name}\n状态: ${this.getEmployeeStateText(employee.state)}`;
        
        if (employee.personality) {
            const traits = this.game.personalitySystem.getPersonalityDescription(employee);
            if (traits.length > 0) {
                tooltip += `\n特征: ${traits.slice(0, 2).join(', ')}`;
            }
        }
        
        if (employee.mood !== undefined) {
            tooltip += `\n心情: ${Math.round(employee.mood)}%`;
        }
        
        if (employee.energy !== undefined) {
            tooltip += `\n精力: ${Math.round(employee.energy)}%`;
        }
        
        return tooltip;
    }

    // 获取员工状态文本
    getEmployeeStateText(state) {
        const stateTexts = {
            'working': '工作中',
            'activity': '活动中',
            'moving': '移动中',
            'wandering': '闲逛中',
            'resting': '休息中'
        };
        return stateTexts[state] || state;
    }

    // 设置音效系统
    setupAudioSystem() {
        this.initializeAudioContext();
        this.loadSounds();
        console.log('🔊 音效系统已设置');
    }

    // 初始化音频上下文
    initializeAudioContext() {
        try {
            this.audioSystem.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('音频上下文初始化失败:', error);
            this.audioSystem.enabled = false;
        }
    }

    // 加载音效
    loadSounds() {
        const soundEffects = {
            click: this.generateClickSound(),
            notification: this.generateNotificationSound(),
            achievement: this.generateAchievementSound(),
            error: this.generateErrorSound()
        };
        
        for (const [name, sound] of Object.entries(soundEffects)) {
            this.audioSystem.sounds.set(name, sound);
        }
    }

    // 生成点击音效
    generateClickSound() {
        return {
            frequency: 800,
            duration: 0.1,
            type: 'sine'
        };
    }

    // 生成通知音效
    generateNotificationSound() {
        return {
            frequency: 600,
            duration: 0.2,
            type: 'sine'
        };
    }

    // 生成成就音效
    generateAchievementSound() {
        return {
            frequencies: [523, 659, 784, 1047], // C-E-G-C
            duration: 0.5,
            type: 'sine'
        };
    }

    // 生成错误音效
    generateErrorSound() {
        return {
            frequency: 200,
            duration: 0.3,
            type: 'sawtooth'
        };
    }

    // 播放音效
    playSound(soundName) {
        if (!this.audioSystem.enabled || !this.audioSystem.audioContext) return;
        
        const sound = this.audioSystem.sounds.get(soundName);
        if (!sound) return;
        
        try {
            if (sound.frequencies) {
                // 播放和弦
                this.playChord(sound.frequencies, sound.duration, sound.type);
            } else {
                // 播放单音
                this.playTone(sound.frequency, sound.duration, sound.type);
            }
        } catch (error) {
            console.warn('音效播放失败:', error);
        }
    }

    // 播放单音
    playTone(frequency, duration, type = 'sine') {
        const ctx = this.audioSystem.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.audioSystem.volume * 0.1, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }

    // 播放和弦
    playChord(frequencies, duration, type = 'sine') {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, duration * 0.8, type);
            }, index * 100);
        });
    }

    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        this.keyboardShortcuts = new Map([
            ['Space', () => this.togglePause()],
            ['KeyR', () => this.resetGame()],
            ['KeyS', () => this.saveGame()],
            ['KeyL', () => this.loadGame()],
            ['KeyH', () => this.showHelp()],
            ['Escape', () => this.showMenu()]
        ]);
        
        console.log('⌨️ 键盘快捷键已设置');
    }

    // 处理键盘快捷键
    handleKeyboardShortcuts(event) {
        const shortcut = this.keyboardShortcuts.get(event.code);
        if (shortcut) {
            event.preventDefault();
            shortcut();
            this.playSound('click');
        }
    }

    // 设置无障碍功能
    setupAccessibility() {
        // 设置ARIA标签
        this.game.canvas.setAttribute('role', 'application');
        this.game.canvas.setAttribute('aria-label', '办公室生存游戏');
        
        // 设置键盘导航
        this.game.canvas.setAttribute('tabindex', '0');
        
        // 添加屏幕阅读器支持
        this.setupScreenReaderSupport();
        
        console.log('♿ 无障碍功能已设置');
    }

    // 设置屏幕阅读器支持
    setupScreenReaderSupport() {
        const srContainer = document.createElement('div');
        srContainer.id = 'screen-reader-content';
        srContainer.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        srContainer.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(srContainer);
        this.screenReaderContainer = srContainer;
    }

    // 更新屏幕阅读器内容
    updateScreenReaderContent(text) {
        if (this.screenReaderContainer) {
            this.screenReaderContainer.textContent = text;
        }
    }

    // 检查悬停元素
    checkHoverElements(x, y) {
        // 检查是否悬停在活动区域
        const hoveredArea = this.game.activityAreas.find(area => {
            return x >= area.x && x <= area.x + area.width &&
                   y >= area.y && y <= area.y + area.height;
        });
        
        if (hoveredArea) {
            this.game.canvas.style.cursor = 'pointer';
            this.showTooltip(`${hoveredArea.name} - 点击查看详情`, x, y);
        } else {
            this.game.canvas.style.cursor = 'default';
        }
    }

    // 游戏控制方法
    togglePause() {
        this.game.isPaused = !this.game.isPaused;
        this.showNotification(this.game.isPaused ? '游戏已暂停' : '游戏已恢复', 'info');
    }

    resetGame() {
        if (confirm('确定要重置游戏吗？所有进度将丢失。')) {
            location.reload();
        }
    }

    saveGame() {
        if (this.game.gameManager) {
            this.game.gameManager.save();
            this.showNotification('游戏已保存', 'success');
        }
    }

    loadGame() {
        if (this.game.gameManager) {
            this.game.gameManager.load();
            this.showNotification('游戏已加载', 'success');
        }
    }

    showHelp() {
        const helpText = `
游戏帮助：
- 空格键：暂停/恢复游戏
- R键：重置游戏
- S键：保存游戏
- L键：加载游戏
- H键：显示帮助
- ESC键：显示菜单
- 点击员工：查看详情或触发抱怨
- 鼠标悬停：显示工具提示
        `;
        this.showNotification(helpText, 'info', 8000);
    }

    showMenu() {
        this.showNotification('菜单功能开发中...', 'info');
    }

    // 公共方法
    showAchievementUnlockAnimation(achievement) {
        // 创建成就解锁动画
        const achievementElement = document.createElement('div');
        achievementElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(135deg, #ffd700, #ffb300);
            color: #333;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
            z-index: 10002;
            text-align: center;
            font-weight: bold;
            animation: achievementPop 2s ease-out forwards;
        `;
        
        achievementElement.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">${achievement.icon || '🏆'}</div>
            <div style="font-size: 18px; margin-bottom: 5px;">成就解锁！</div>
            <div style="font-size: 16px;">${achievement.name}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${achievement.description}</div>
        `;
        
        // 添加动画CSS
        if (!document.getElementById('achievement-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'achievement-animation-styles';
            style.textContent = `
                @keyframes achievementPop {
                    0% {
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 0;
                    }
                    20% {
                        transform: translate(-50%, -50%) scale(1.2);
                        opacity: 1;
                    }
                    30% {
                        transform: translate(-50%, -50%) scale(1);
                    }
                    90% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(0.8);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(achievementElement);
        
        // 播放成就音效
        this.playSound('achievement');
        
        // 清理元素
        setTimeout(() => {
            if (achievementElement.parentElement) {
                achievementElement.parentElement.removeChild(achievementElement);
            }
        }, 2000);
    }

    // 获取用户体验报告
    getUXReport() {
        return {
            loadingSystem: {
                enabled: this.loadingSystem.loadingElement !== null,
                isLoading: this.loadingSystem.isLoading,
                progress: this.loadingSystem.loadingProgress
            },
            transitionSystem: {
                activeTransitions: this.transitionSystem.activeTransitions.size,
                easingFunctions: this.transitionSystem.easingFunctions.size
            },
            responsiveness: {
                inputBufferSize: this.responsiveness.inputBuffer.length,
                lastInputTime: this.responsiveness.lastInputTime,
                feedbackEnabled: this.responsiveness.feedbackContainer !== null
            },
            notifications: {
                active: this.notificationSystem.notifications.length,
                maxNotifications: this.notificationSystem.maxNotifications
            },
            audio: {
                enabled: this.audioSystem.enabled,
                sounds: this.audioSystem.sounds.size
            },
            accessibility: {
                screenReaderSupport: this.screenReaderContainer !== null,
                keyboardShortcuts: this.keyboardShortcuts.size
            }
        };
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UXEnhancer;
}

// 全局函数供其他模块调用
window.showNotification = function(message, type, duration) {
    if (window.uxEnhancer) {
        window.uxEnhancer.showNotification(message, type, duration);
    }
};

window.showAchievementUnlockAnimation = function(achievement) {
    if (window.uxEnhancer) {
        window.uxEnhancer.showAchievementUnlockAnimation(achievement);
    }
};