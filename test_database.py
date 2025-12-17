#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库连接测试脚本
测试MySQL数据库连接和插件数据查询
"""

import pymysql
import json
import os
from datetime import datetime

def load_config():
    """加载配置文件"""
    config_path = 'config.json'
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        return config
    except Exception as e:
        print(f"❌ 加载配置文件失败: {e}")
        return None

# 加载配置
CONFIG = load_config()
if not CONFIG:
    print("❌ 无法加载配置，使用默认配置")
    DB_CONFIG = {
        'host': 'tx-db.cbore8wpy3mc.us-east-2.rds.amazonaws.com',
        'port': 3306,
        'user': 'demo',
        'password': 'Demo1234',
        'database': 'game',
        'charset': 'utf8mb4',
        'autocommit': True
    }
else:
    # 数据库配置
    DB_CONFIG = {
        'host': CONFIG['database']['host'],
        'port': CONFIG['database']['port'],
        'user': CONFIG['database']['username'],
        'password': CONFIG['database']['password'],
        'database': CONFIG['database']['database'],
        'charset': CONFIG['database']['charset'],
        'autocommit': CONFIG['database']['autocommit']
    }

def test_connection():
    """测试数据库连接"""
    print("🔌 测试数据库连接...")
    try:
        connection = pymysql.connect(**DB_CONFIG)
        print("✅ 数据库连接成功")
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"📊 MySQL版本: {version[0]}")
            
            cursor.execute("SELECT DATABASE()")
            database = cursor.fetchone()
            print(f"🗄️  当前数据库: {database[0]}")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        return False

def test_tables():
    """测试表结构"""
    print("\n📋 测试表结构...")
    try:
        connection = pymysql.connect(**DB_CONFIG)
        
        with connection.cursor() as cursor:
            # 检查表是否存在
            tables = ['plugins', 'plugin_ratings', 'plugin_statistics']
            
            for table in tables:
                cursor.execute(f"SHOW TABLES LIKE '{table}'")
                result = cursor.fetchone()
                if result:
                    print(f"✅ 表 {table} 存在")
                    
                    # 获取表结构
                    cursor.execute(f"DESCRIBE {table}")
                    columns = cursor.fetchall()
                    print(f"   列数: {len(columns)}")
                else:
                    print(f"❌ 表 {table} 不存在")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ 表结构检查失败: {e}")
        return False

def test_data():
    """测试数据查询"""
    print("\n📊 测试数据查询...")
    try:
        connection = pymysql.connect(**DB_CONFIG)
        
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            # 查询插件数据
            cursor.execute("SELECT COUNT(*) as count FROM plugins")
            plugin_count = cursor.fetchone()
            print(f"📦 插件总数: {plugin_count['count']}")
            
            # 查询评分数据
            cursor.execute("SELECT COUNT(*) as count FROM plugin_ratings")
            rating_count = cursor.fetchone()
            print(f"⭐ 评分总数: {rating_count['count']}")
            
            # 查询插件详细信息
            cursor.execute("""
                SELECT 
                    p.plugin_name, p.author, p.version,
                    COALESCE(s.total_ratings, 0) as total_ratings,
                    COALESCE(s.average_rating, 0.00) as average_rating
                FROM plugins p
                LEFT JOIN plugin_statistics s ON p.id = s.plugin_id
                WHERE p.is_active = TRUE
                ORDER BY s.average_rating DESC
                LIMIT 5
            """)
            
            plugins = cursor.fetchall()
            print(f"\n🏆 插件排行榜 (前5名):")
            for i, plugin in enumerate(plugins, 1):
                print(f"  {i}. {plugin['plugin_name']} - {plugin['average_rating']:.1f}⭐ ({plugin['total_ratings']}评分)")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ 数据查询失败: {e}")
        return False

def insert_test_rating():
    """插入测试评分"""
    print("\n🧪 插入测试评分...")
    try:
        connection = pymysql.connect(**DB_CONFIG)
        
        with connection.cursor() as cursor:
            # 获取第一个插件ID
            cursor.execute("SELECT id FROM plugins WHERE is_active = TRUE LIMIT 1")
            plugin = cursor.fetchone()
            
            if not plugin:
                print("❌ 没有找到可用的插件")
                return False
            
            plugin_id = plugin[0]
            test_ip = f"192.168.1.{datetime.now().microsecond % 255}"
            
            # 插入测试评分
            cursor.execute("""
                INSERT INTO plugin_ratings (plugin_id, user_ip, rating, comment)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                rating = VALUES(rating),
                comment = VALUES(comment),
                updated_at = CURRENT_TIMESTAMP
            """, (plugin_id, test_ip, 5, "测试评分 - 自动生成"))
            
            print(f"✅ 测试评分插入成功 (插件ID: {plugin_id}, IP: {test_ip})")
            
            # 手动更新统计
            cursor.execute("""
                INSERT INTO plugin_statistics (
                    plugin_id, total_ratings, average_rating, 
                    rating_1_count, rating_2_count, rating_3_count, 
                    rating_4_count, rating_5_count, last_rating_at
                )
                SELECT 
                    %s,
                    COUNT(*) as total_ratings,
                    AVG(rating) as average_rating,
                    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1_count,
                    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2_count,
                    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3_count,
                    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4_count,
                    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5_count,
                    MAX(created_at) as last_rating_at
                FROM plugin_ratings 
                WHERE plugin_id = %s
                ON DUPLICATE KEY UPDATE
                    total_ratings = VALUES(total_ratings),
                    average_rating = VALUES(average_rating),
                    rating_1_count = VALUES(rating_1_count),
                    rating_2_count = VALUES(rating_2_count),
                    rating_3_count = VALUES(rating_3_count),
                    rating_4_count = VALUES(rating_4_count),
                    rating_5_count = VALUES(rating_5_count),
                    last_rating_at = VALUES(last_rating_at)
            """, (plugin_id, plugin_id))
            
            print("✅ 统计数据更新成功")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ 插入测试评分失败: {e}")
        return False

def main():
    """主测试函数"""
    print("🧪 办公室生存游戏 - 数据库测试")
    print("=" * 50)
    
    # 1. 测试连接
    if not test_connection():
        return
    
    # 2. 测试表结构
    if not test_tables():
        return
    
    # 3. 测试数据查询
    if not test_data():
        return
    
    # 4. 插入测试评分
    insert_test_rating()
    
    print("\n" + "=" * 50)
    print("🎉 数据库测试完成！")
    print("💡 现在可以启动Flask服务器测试插件评分功能")
    print("   python3 app.py")
    print("   然后访问: http://localhost:5000/plugins")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n测试被中断")
    except Exception as e:
        print(f"\n❌ 测试过程中发生错误: {e}")