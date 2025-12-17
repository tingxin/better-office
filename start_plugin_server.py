#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
插件评分系统专用启动脚本
固定使用5218端口，用于二维码扫描访问
"""

import sys
import os
import subprocess
import json

def check_python_version():
    """检查Python版本"""
    if sys.version_info < (3, 7):
        print("❌ 错误: 需要Python 3.7或更高版本")
        print(f"当前版本: Python {sys.version}")
        return False
    print(f"✅ Python版本检查通过: {sys.version.split()[0]}")
    return True

def check_config():
    """检查配置文件并确保端口为5218"""
    config_path = 'config.json'
    
    if not os.path.exists(config_path):
        print("❌ 配置文件不存在，创建默认配置...")
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
                "port": 5218,
                "debug": True
            },
            "app": {
                "name": "办公室生存游戏",
                "version": "1.0.0",
                "description": "插件评分系统"
            }
        }
        
        try:
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(default_config, f, indent=4, ensure_ascii=False)
            print("✅ 默认配置文件已创建")
        except Exception as e:
            print(f"❌ 创建配置文件失败: {e}")
            return False
    
    # 检查端口配置
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        current_port = config.get('server', {}).get('port', 5000)
        if current_port != 5218:
            print(f"⚠️  当前端口为 {current_port}，修改为5218...")
            config['server']['port'] = 5218
            
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=4, ensure_ascii=False)
            print("✅ 端口已修改为5218")
        else:
            print("✅ 端口配置正确: 5218")
        
        return True
        
    except Exception as e:
        print(f"❌ 检查配置文件失败: {e}")
        return False

def check_dependencies():
    """检查依赖包"""
    required_packages = ['flask', 'pymysql']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} 已安装")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} 未安装")
    
    if missing_packages:
        print(f"📦 正在安装缺失的包: {', '.join(missing_packages)}")
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", 
                "Flask==2.3.3", "PyMySQL==1.1.0"
            ])
            print("✅ 依赖包安装完成")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ 依赖包安装失败: {e}")
            return False
    
    return True

def test_database_connection():
    """测试数据库连接"""
    print("🔍 测试数据库连接...")
    try:
        result = subprocess.run([
            sys.executable, "test_database.py"
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ 数据库连接测试通过")
            return True
        else:
            print("⚠️  数据库连接测试失败，但继续启动服务器")
            print("💡 请检查数据库配置和网络连接")
            return True  # 允许继续启动，可能是网络问题
            
    except subprocess.TimeoutExpired:
        print("⚠️  数据库连接测试超时，继续启动服务器")
        return True
    except Exception as e:
        print(f"⚠️  数据库测试出错: {e}，继续启动服务器")
        return True

def start_plugin_server():
    """启动插件评分服务器"""
    print("\n🚀 启动插件评分服务器...")
    print("=" * 60)
    print("🎮 办公室生存游戏 - 插件评分系统")
    print("📱 二维码扫描专用端口: 5218")
    print("🌐 访问地址: http://localhost:5218/kiro/workshop")
    print("🌐 局域网访问: http://YOUR_IP:5218/kiro/workshop")
    print("💡 提示: 按 Ctrl+C 停止服务器")
    print("=" * 60)
    
    try:
        # 启动Flask应用
        from app import app, CONFIG
        
        # 确保使用5218端口
        app.run(
            host='0.0.0.0',
            port=5218,
            debug=True,
            threaded=True
        )
        
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except Exception as e:
        print(f"❌ 服务器启动失败: {e}")

def main():
    """主函数"""
    print("🎮 插件评分系统启动器")
    print("=" * 40)
    print("📱 专为二维码扫描访问设计")
    print("🔧 固定端口: 5218")
    print("=" * 40)
    
    # 1. 检查Python版本
    if not check_python_version():
        return
    
    # 2. 检查和配置端口
    if not check_config():
        return
    
    # 3. 检查依赖包
    if not check_dependencies():
        return
    
    # 4. 测试数据库连接
    test_database_connection()
    
    print("\n✅ 所有检查完成，启动服务器...")
    
    # 5. 启动服务器
    start_plugin_server()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n启动被中断")
    except Exception as e:
        print(f"\n❌ 启动过程中发生错误: {e}")