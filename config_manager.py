#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
配置管理工具
用于管理和验证应用配置
"""

import json
import os
import sys
from datetime import datetime

class ConfigManager:
    def __init__(self, config_path='config.json'):
        self.config_path = config_path
        self.config = None
        
    def load_config(self):
        """加载配置文件"""
        try:
            if not os.path.exists(self.config_path):
                print(f"❌ 配置文件不存在: {self.config_path}")
                return False
                
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
            
            print(f"✅ 配置文件加载成功: {self.config_path}")
            return True
            
        except json.JSONDecodeError as e:
            print(f"❌ 配置文件JSON格式错误: {e}")
            return False
        except Exception as e:
            print(f"❌ 加载配置文件失败: {e}")
            return False
    
    def validate_config(self):
        """验证配置文件完整性"""
        if not self.config:
            return False
        
        required_keys = {
            'database': ['host', 'port', 'username', 'password', 'database', 'charset'],
            'server': ['host', 'port', 'debug'],
            'app': ['name', 'version', 'description']
        }
        
        missing_keys = []
        
        for section, keys in required_keys.items():
            if section not in self.config:
                missing_keys.append(f"缺少配置节: {section}")
                continue
                
            for key in keys:
                if key not in self.config[section]:
                    missing_keys.append(f"缺少配置项: {section}.{key}")
        
        if missing_keys:
            print("❌ 配置验证失败:")
            for missing in missing_keys:
                print(f"   - {missing}")
            return False
        
        print("✅ 配置验证通过")
        return True
    
    def get_db_config(self):
        """获取数据库配置"""
        if not self.config:
            return None
        
        db_config = self.config['database']
        return {
            'host': db_config['host'],
            'port': db_config['port'],
            'user': db_config['username'],
            'password': db_config['password'],
            'database': db_config['database'],
            'charset': db_config['charset'],
            'autocommit': db_config.get('autocommit', True)
        }
    
    def get_server_config(self):
        """获取服务器配置"""
        if not self.config:
            return None
        return self.config['server']
    
    def get_app_config(self):
        """获取应用配置"""
        if not self.config:
            return None
        return self.config['app']
    
    def create_default_config(self):
        """创建默认配置文件"""
        default_config = {
            "database": {
                "host": "tx-db.cbore8wpy3mc.us-east-2.rds.amazonaws.com",
                "port": 3306,
                "username": "demo",
                "password": "Demo1234",
                "database": "game",
                "charset": "utf8mb4",
                "autocommit": True
            },
            "server": {
                "host": "0.0.0.0",
                "port": 5000,
                "debug": True
            },
            "app": {
                "name": "办公室生存游戏",
                "version": "1.0.0",
                "description": "插件评分系统"
            }
        }
        
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(default_config, f, indent=2, ensure_ascii=False)
            
            print(f"✅ 默认配置文件已创建: {self.config_path}")
            return True
            
        except Exception as e:
            print(f"❌ 创建配置文件失败: {e}")
            return False
    
    def update_config(self, section, key, value):
        """更新配置项"""
        if not self.config:
            return False
        
        if section not in self.config:
            self.config[section] = {}
        
        self.config[section][key] = value
        
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
            
            print(f"✅ 配置已更新: {section}.{key} = {value}")
            return True
            
        except Exception as e:
            print(f"❌ 更新配置失败: {e}")
            return False
    
    def show_config(self):
        """显示当前配置"""
        if not self.config:
            print("❌ 没有加载配置")
            return
        
        print("📋 当前配置:")
        print("=" * 50)
        print(json.dumps(self.config, indent=2, ensure_ascii=False))

def main():
    """主函数"""
    print("⚙️  配置管理工具")
    print("=" * 30)
    
    config_manager = ConfigManager()
    
    # 检查配置文件是否存在
    if not os.path.exists('config.json'):
        print("📝 配置文件不存在，创建默认配置...")
        if config_manager.create_default_config():
            print("💡 请根据需要修改config.json中的配置")
        return
    
    # 加载和验证配置
    if config_manager.load_config():
        if config_manager.validate_config():
            config_manager.show_config()
            
            # 显示数据库连接信息
            db_config = config_manager.get_db_config()
            print(f"\n🗄️  数据库: {db_config['database']}@{db_config['host']}:{db_config['port']}")
            
            # 显示服务器信息
            server_config = config_manager.get_server_config()
            print(f"🌐 服务器: http://{server_config['host']}:{server_config['port']}")
            
        else:
            print("💡 请修复配置文件中的问题")
    else:
        print("💡 请检查配置文件格式")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n操作被中断")
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")