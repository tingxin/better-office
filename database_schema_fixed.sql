-- 办公室生存游戏插件评分系统数据库表结构 (MySQL兼容版本)
-- 数据库: game
-- 执行前请确保已连接到正确的数据库

-- 1. 插件信息表
CREATE TABLE IF NOT EXISTS plugins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plugin_name VARCHAR(100) NOT NULL UNIQUE COMMENT '插件名称',
    plugin_id VARCHAR(50) NOT NULL UNIQUE COMMENT '插件ID标识',
    description TEXT COMMENT '插件描述',
    author VARCHAR(100) DEFAULT '未知作者' COMMENT '插件作者',
    version VARCHAR(20) DEFAULT '1.0.0' COMMENT '插件版本',
    icon VARCHAR(20) DEFAULT 'plugin' COMMENT '插件图标类型',
    color VARCHAR(20) DEFAULT '#4CAF50' COMMENT '插件主题色',
    category VARCHAR(50) DEFAULT 'general' COMMENT '插件分类',
    target_complaints TEXT COMMENT '目标抱怨类型(JSON格式)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    INDEX idx_plugin_name (plugin_name),
    INDEX idx_plugin_id (plugin_id),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='插件信息表';

-- 2. 插件评分表
CREATE TABLE IF NOT EXISTS plugin_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plugin_id INT NOT NULL COMMENT '插件ID(外键)',
    user_ip VARCHAR(45) NOT NULL COMMENT '用户IP地址',
    user_agent TEXT COMMENT '用户浏览器信息',
    rating INT NOT NULL COMMENT '评分(1-5星)',
    comment TEXT COMMENT '评价留言(可选)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评分时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_plugin (plugin_id, user_ip) COMMENT '同一用户对同一插件只能评分一次',
    INDEX idx_plugin_rating (plugin_id, rating),
    INDEX idx_user_ip (user_ip),
    INDEX idx_created_at (created_at),
    CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='插件评分表';

-- 3. 插件统计表(用于快速查询)
CREATE TABLE IF NOT EXISTS plugin_statistics (
    plugin_id INT PRIMARY KEY COMMENT '插件ID(外键)',
    total_ratings INT DEFAULT 0 COMMENT '总评分数',
    average_rating DECIMAL(3,2) DEFAULT 0.00 COMMENT '平均评分',
    rating_1_count INT DEFAULT 0 COMMENT '1星评分数',
    rating_2_count INT DEFAULT 0 COMMENT '2星评分数',
    rating_3_count INT DEFAULT 0 COMMENT '3星评分数',
    rating_4_count INT DEFAULT 0 COMMENT '4星评分数',
    rating_5_count INT DEFAULT 0 COMMENT '5星评分数',
    last_rating_at TIMESTAMP NULL COMMENT '最后评分时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '统计更新时间',
    FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE,
    INDEX idx_average_rating (average_rating),
    INDEX idx_total_ratings (total_ratings)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='插件统计表';

-- 4. 插入初始插件数据
INSERT INTO plugins (plugin_name, plugin_id, description, author, version, icon, color, category, target_complaints) VALUES
('智能空调系统', 'air-conditioning', '安装智能空调系统，自动调节办公室温度，减少员工关于温度的抱怨', 'Kiro开发团队', '2.0.0', 'snowflake', '#2196F3', 'facility', '["空调问题", "异味问题"]'),
('打印机维护系统', 'printer-maintenance', '定期维护打印机，减少卡纸和故障，显示实时工作状态', '办公设备专家', '3.0.0', 'printer', '#4CAF50', 'equipment', '["打印机问题", "排队问题"]'),
('智能照明系统', 'smart-lighting', '安装智能LED照明系统，自动调节光线亮度，减少眼疲劳', '照明专家', '1.0.0', 'lightbulb', '#FFC107', 'facility', '["光线问题", "健康问题"]'),
('专业清洁服务', 'cleaning-service', '定期清洁办公室，保持环境整洁，显示清洁效果', '清洁专家', '2.0.0', 'broom', '#FF9800', 'service', '["清洁问题", "异味问题"]'),
('网络基础设施升级', 'network-upgrade', '升级网络设备，提供稳定高速的网络连接', '网络工程师', '1.5.0', 'network', '#9C27B0', 'infrastructure', '["网络问题", "电脑问题"]');

-- 5. 创建视图：插件详细信息(包含统计)
CREATE VIEW plugin_details AS
SELECT 
    p.id,
    p.plugin_name,
    p.plugin_id,
    p.description,
    p.author,
    p.version,
    p.icon,
    p.color,
    p.category,
    p.target_complaints,
    p.created_at,
    p.is_active,
    COALESCE(s.total_ratings, 0) as total_ratings,
    COALESCE(s.average_rating, 0.00) as average_rating,
    COALESCE(s.rating_1_count, 0) as rating_1_count,
    COALESCE(s.rating_2_count, 0) as rating_2_count,
    COALESCE(s.rating_3_count, 0) as rating_3_count,
    COALESCE(s.rating_4_count, 0) as rating_4_count,
    COALESCE(s.rating_5_count, 0) as rating_5_count,
    s.last_rating_at
FROM plugins p
LEFT JOIN plugin_statistics s ON p.id = s.plugin_id
WHERE p.is_active = TRUE
ORDER BY s.average_rating DESC, s.total_ratings DESC, p.created_at ASC;

-- 6. 创建索引优化查询性能
CREATE INDEX idx_plugin_details_rating ON plugin_statistics(average_rating DESC, total_ratings DESC);
CREATE INDEX idx_plugin_ratings_time ON plugin_ratings(created_at DESC);

-- 查询示例
-- SELECT * FROM plugin_details; -- 查看所有插件及其评分统计