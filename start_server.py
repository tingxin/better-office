#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
办公室生存游戏服务器启动脚本
自动检查环境并启动服务器
"""

import sys
import os
import subprocess
import importlib.util

def check_python_version():
    """检查Python版本"""
    if sys.version_info < (3, 7):
        print("❌ 错误: 需要Python 3.7或更高版本")
        print(f"当前版本: Python {sys.version}")
        return False
    print(f"✅ Python版本检查通过: {sys.version.split()[0]}")
    return True

def check_flask_installation():
    """检查Flask是否已安装"""
    try:
        import flask
        print(f"✅ Flask已安装: v{flask.__version__}")
        return True
    except ImportError:
        print("❌ Flask未安装")
        return False

def install_requirements():
    """安装依赖包"""
    print("📦 正在安装依赖包...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ 依赖包安装完成")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 依赖包安装失败: {e}")
        return False

def check_game_files():
    """检查游戏文件是否存在"""
    required_files = [
        'index.html',
        'game.js',
        'app.py'
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
        else:
            print(f"✅ 找到文件: {file}")
    
    if missing_files:
        print(f"❌ 缺少必要文件: {', '.join(missing_files)}")
        return False
    
    return True

def start_server():
    """启动服务器"""
    print("\n🚀 启动游戏服务器...")
    try:
        # 导入并运行Flask应用
        from app import app, print_startup_info
        
        print_startup_info()
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except Exception as e:
        print(f"❌ 服务器启动失败: {e}")

def main():
    """主函数"""
    print("🎮 办公室生存游戏服务器启动检查")
    print("=" * 50)
    
    # 1. 检查Python版本
    if not check_python_version():
        return
    
    # 2. 检查游戏文件
    if not check_game_files():
        print("\n💡 请确保在游戏项目根目录中运行此脚本")
        return
    
    # 3. 检查Flask安装
    if not check_flask_installation():
        print("📦 尝试自动安装Flask...")
        if not install_requirements():
            print("\n💡 请手动安装Flask:")
            print("   pip install Flask")
            return
    
    print("\n✅ 所有检查通过!")
    print("=" * 50)
    
    # 4. 启动服务器
    start_server()

if __name__ == '__main__':
    main()