-- 办公室生存游戏插件评分系统数据库表结构
-- 数据库: business
-- 执行前请确保已连接到正确的数据库

-- 1. 插件信息表
CREATE TABLE IF NOT EXISTS plugins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plugin_name VARCHAR(100) NOT NULL UNIQUE COMMENT '插件名称',
    plugin_id VARCHAR(50) NOT NULL UNIQUE COMMENT '插件ID标识',
    description TEXT COMMENT '插件描述',
    author VARCHAR(100) DEFAULT '未知作者' COMMENT '插件作者',
    version VARCHAR(20) DEFAULT '1.0.0' COMMENT '插件版本',
    icon VARCHAR(10) DEFAULT '🔌' COMMENT '插件图标',
    color VARCHAR(20) DEFAULT '#4CAF50' COMMENT '插件主题色',
    category VARCHAR(50) DEFAULT 'general' COMMENT '插件分类',
    target_complaints JSON COMMENT '目标抱怨类型(JSON数组)',
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
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5) COMMENT '评分(1-5星)',
    comment TEXT COMMENT '评价留言(可选)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评分时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_plugin (plugin_id, user_ip) COMMENT '同一用户对同一插件只能评分一次',
    INDEX idx_plugin_rating (plugin_id, rating),
    INDEX idx_user_ip (user_ip),
    INDEX idx_created_at (created_at)
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

-- 4. 创建触发器：自动更新统计数据
DELIMITER //

-- 插入评分后更新统计
CREATE TRIGGER update_plugin_stats_after_insert
AFTER INSERT ON plugin_ratings
FOR EACH ROW
BEGIN
    INSERT INTO plugin_statistics (plugin_id, total_ratings, average_rating, 
                                   rating_1_count, rating_2_count, rating_3_count, 
                                   rating_4_count, rating_5_count, last_rating_at)
    VALUES (NEW.plugin_id, 1, NEW.rating,
            CASE WHEN NEW.rating = 1 THEN 1 ELSE 0 END,
            CASE WHEN NEW.rating = 2 THEN 1 ELSE 0 END,
            CASE WHEN NEW.rating = 3 THEN 1 ELSE 0 END,
            CASE WHEN NEW.rating = 4 THEN 1 ELSE 0 END,
            CASE WHEN NEW.rating = 5 THEN 1 ELSE 0 END,
            NEW.created_at)
    ON DUPLICATE KEY UPDATE
        total_ratings = total_ratings + 1,
        average_rating = (average_rating * (total_ratings - 1) + NEW.rating) / total_ratings,
        rating_1_count = rating_1_count + CASE WHEN NEW.rating = 1 THEN 1 ELSE 0 END,
        rating_2_count = rating_2_count + CASE WHEN NEW.rating = 2 THEN 1 ELSE 0 END,
        rating_3_count = rating_3_count + CASE WHEN NEW.rating = 3 THEN 1 ELSE 0 END,
        rating_4_count = rating_4_count + CASE WHEN NEW.rating = 4 THEN 1 ELSE 0 END,
        rating_5_count = rating_5_count + CASE WHEN NEW.rating = 5 THEN 1 ELSE 0 END,
        last_rating_at = NEW.created_at;
END//

-- 更新评分后重新计算统计
CREATE TRIGGER update_plugin_stats_after_update
AFTER UPDATE ON plugin_ratings
FOR EACH ROW
BEGIN
    -- 重新计算统计数据
    UPDATE plugin_statistics 
    SET 
        total_ratings = (SELECT COUNT(*) FROM plugin_ratings WHERE plugin_id = NEW.plugin_id),
        average_rating = (SELECT AVG(rating) FROM plugin_ratings WHERE plugin_id = NEW.plugin_id),
        rating_1_count = (SELECT COUNT(*) FROM plugin_ratings WHERE plugin_id = NEW.plugin_id AND rating = 1),
        rating_2_count = (SELECT COUNT(*) FROM plugin_ratings WHERE plugin_id = NEW.plugin_id AND rating = 2),
        rating_3_count = (SELECT COUNT(*) FROM plugin_ratings WHERE plugin_id = NEW.plugin_id AND rating = 3),
        rating_4_count = (SELECT COUNT(*) FROM plugin_ratings WHERE plugin_id = NEW.plugin_id AND rating = 4),
        rating_5_count = (SELECT COUNT(*) FROM plugin_ratings WHERE plugin_id = NEW.plugin_id AND rating = 5),
        last_rating_at = NEW.updated_at
    WHERE plugin_id = NEW.plugin_id;
END//

-- 删除评分后更新统计
CREATE TRIGGER update_plugin_stats_after_delete
AFTER DELETE ON plugin_ratings
FOR EACH ROW
BEGIN
    UPDATE plugin_statistics 
    SET 
        total_ratings = (SELECT COUNT(*) FROM plugin_ratings WHERE plugin_id = OLD.plugin_id),
        average_rating = COALESCE((SELECT AVG(rating) FROM plugin_ratings WHERE plugin_id = OLD.plugin_id), 0),
        rating_1_count = (SELECT COUNT(*) FROM plugin_ratings WHERE plugin_id = OLD.plugin_id AND rating = 1),
        rating_2_count = (SELECT COUNT(*) FROM plugin_ratings WHERE plugin_id = OLD.plugin_id AND rating = 2),
        rating_3_count = (SELECT COUNT(*) FROM plugin_ratings WHERE plugin_id = OLD.plugin_id AND rating = 3),
        rating_4_count = (SELECT COUNT(*) FROM plugin_ratings WHERE plugin_id = OLD.plugin_id AND rating = 4),
        rating_5_count = (SELECT COUNT(*) FROM plugin_ratings WHERE plugin_id = OLD.plugin_id AND rating = 5),
        last_rating_at = (SELECT MAX(created_at) FROM plugin_ratings WHERE plugin_id = OLD.plugin_id)
    WHERE plugin_id = OLD.plugin_id;
END//

DELIMITER ;

-- 5. 插入初始插件数据
INSERT INTO plugins (plugin_name, plugin_id, description, author, version, icon, color, category, target_complaints) VALUES
('智能空调系统', 'air-conditioning', '安装智能空调系统，自动调节办公室温度，减少员工关于温度的抱怨', 'Kiro开发团队', '2.0.0', '❄️', '#2196F3', 'facility', '["空调问题", "异味问题"]'),
('打印机维护系统', 'printer-maintenance', '定期维护打印机，减少卡纸和故障，显示实时工作状态', '办公设备专家', '3.0.0', '🖨️', '#4CAF50', 'equipment', '["打印机问题", "排队问题"]'),
('智能照明系统', 'smart-lighting', '安装智能LED照明系统，自动调节光线亮度，减少眼疲劳', '照明专家', '1.0.0', '💡', '#FFC107', 'facility', '["光线问题", "健康问题"]'),
('专业清洁服务', 'cleaning-service', '定期清洁办公室，保持环境整洁，显示清洁效果', '清洁专家', '2.0.0', '🧹', '#FF9800', 'service', '["清洁问题", "异味问题"]'),
('网络基础设施升级', 'network-upgrade', '升级网络设备，提供稳定高速的网络连接', '网络工程师', '1.5.0', '🌐', '#9C27B0', 'infrastructure', '["网络问题", "电脑问题"]');

-- 6. 创建视图：插件详细信息(包含统计)
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

-- 7. 创建索引优化查询性能
CREATE INDEX idx_plugin_details_rating ON plugin_statistics(average_rating DESC, total_ratings DESC);
CREATE INDEX idx_plugin_ratings_time ON plugin_ratings(created_at DESC);

-- 8. 插入测试数据的存储过程
DELIMITER //
CREATE PROCEDURE insert_test_ratings()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE plugin_id_val INT;
    DECLARE plugin_cursor CURSOR FOR SELECT id FROM plugins WHERE is_active = TRUE;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN plugin_cursor;
    
    read_loop: LOOP
        FETCH plugin_cursor INTO plugin_id_val;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- 为每个插件插入一些测试评分
        INSERT INTO plugin_ratings (plugin_id, user_ip, rating, comment) VALUES
        (plugin_id_val, '192.168.1.100', 5, '非常好用的插件！'),
        (plugin_id_val, '192.168.1.101', 4, '效果不错，推荐使用'),
        (plugin_id_val, '192.168.1.102', 5, '解决了我们办公室的大问题'),
        (plugin_id_val, '10.0.0.100', 3, '还可以，有改进空间');
        
    END LOOP;
    
    CLOSE plugin_cursor;
END//
DELIMITER ;

-- 执行说明
-- 1. 首先执行上述所有CREATE语句创建表结构
-- 2. 可选：执行 CALL insert_test_ratings(); 插入测试数据
-- 3. 查询示例：SELECT * FROM plugin_details; 查看所有插件及其评分统计