#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
服务器修复脚本 - 修复常见的Flask服务器问题
"""

import os
import sys

def fix_app_py():
    """修复app.py中的导入问题"""
    app_file = 'app.py'
    
    if not os.path.exists(app_file):
        print(f"❌ 文件 {app_file} 不存在")
        return False
    
    print(f"🔧 检查 {app_file}...")
    
    with open(app_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否需要修复request导入
    if 'from flask import' in content and 'request' not in content.split('from flask import')[1].split('\n')[0]:
        print("🔧 修复Flask request导入...")
        content = content.replace(
            'from flask import Flask, send_from_directory, send_file, jsonify',
            'from flask import Flask, send_from_directory, send_file, jsonify, request'
        )
        
        with open(app_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ Flask request导入已修复")
        return True
    else:
        print("✅ Flask导入正常")
        return False

def check_required_files():
    """检查必需文件"""
    required_files = [
        'app.py',
        'index.html', 
        'game.js'
    ]
    
    missing_files = []
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ 找到文件: {file}")
        else:
            missing_files.append(file)
            print(f"❌ 缺少文件: {file}")
    
    return missing_files

def test_flask_import():
    """测试Flask导入"""
    try:
        import flask
        print(f"✅ Flask已安装: v{flask.__version__}")
        return True
    except ImportError:
        print("❌ Flask未安装")
        print("请运行: pip install Flask")
        return False

def main():
    """主函数"""
    print("🔧 办公室生存游戏服务器修复工具")
    print("=" * 50)
    
    # 1. 检查必需文件
    missing_files = check_required_files()
    if missing_files:
        print(f"\n❌ 缺少必需文件: {', '.join(missing_files)}")
        print("请确保在正确的项目目录中运行此脚本")
        return False
    
    # 2. 测试Flask
    if not test_flask_import():
        return False
    
    # 3. 修复app.py
    fixed = fix_app_py()
    
    print("\n" + "=" * 50)
    if fixed:
        print("🎉 修复完成！现在可以重新启动服务器了")
        print("运行: python3 app.py")
    else:
        print("✅ 没有发现需要修复的问题")
    
    return True

if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n修复被中断")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ 修复过程中发生错误: {e}")
        sys.exit(1)