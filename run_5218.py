#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
强制在5218端口启动服务器
解决Flask debug模式端口问题
"""

import os
import sys

def main():
    """主函数"""
    print("🚀 强制启动5218端口服务器")
    print("=" * 40)
    
    # 设置环境变量强制Flask使用5218端口
    os.environ['FLASK_APP'] = 'app.py'
    os.environ['FLASK_ENV'] = 'development'
    os.environ['FLASK_RUN_HOST'] = '0.0.0.0'
    os.environ['FLASK_RUN_PORT'] = '5218'
    os.environ['FLASK_DEBUG'] = '1'
    
    print("✅ 环境变量已设置:")
    print(f"   FLASK_APP = {os.environ.get('FLASK_APP')}")
    print(f"   FLASK_RUN_HOST = {os.environ.get('FLASK_RUN_HOST')}")
    print(f"   FLASK_RUN_PORT = {os.environ.get('FLASK_RUN_PORT')}")
    print(f"   FLASK_DEBUG = {os.environ.get('FLASK_DEBUG')}")
    
    print("\n🌐 服务器将启动在:")
    print(f"   http://localhost:5218")
    print(f"   http://0.0.0.0:5218")
    print(f"   插件页面: http://localhost:5218/kiro/workshop")
    
    print("\n💡 提示: 按 Ctrl+C 停止服务器")
    print("=" * 40)
    
    try:
        # 使用flask命令启动
        import subprocess
        subprocess.run([
            sys.executable, '-m', 'flask', 'run',
            '--host=0.0.0.0',
            '--port=5218',
            '--debug'
        ])
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        print("\n🔧 尝试备用方法...")
        
        # 备用方法：直接导入并运行
        try:
            from app import app
            app.run(host='0.0.0.0', port=5218, debug=True)
        except Exception as e2:
            print(f"❌ 备用方法也失败: {e2}")

if __name__ == '__main__':
    main()