#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
办公室生存游戏 - Flask Web服务器
简单的静态文件服务器，用于托管游戏网站
"""

from flask import Flask, send_from_directory, send_file, jsonify
import os
import mimetypes
from datetime import datetime

# 创建Flask应用
app = Flask(__name__)

# 配置静态文件目录
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))

# 设置MIME类型
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('text/html', '.html')

@app.route('/')
def index():
    """主页路由 - 返回游戏主页面"""
    try:
        return send_file(os.path.join(STATIC_DIR, 'index.html'))
    except Exception as e:
        return f"错误：无法加载游戏页面 - {str(e)}", 500

@app.route('/<path:filename>')
def static_files(filename):
    """静态文件路由 - 处理所有静态资源"""
    try:
        # 安全检查：防止目录遍历攻击
        if '..' in filename or filename.startswith('/'):
            return "访问被拒绝", 403
        
        file_path = os.path.join(STATIC_DIR, filename)
        
        # 检查文件是否存在
        if not os.path.exists(file_path):
            return f"文件未找到: {filename}", 404
        
        # 检查是否为文件（不是目录）
        if not os.path.isfile(file_path):
            return "无效的文件路径", 400
        
        # 获取文件目录和文件名
        directory = os.path.dirname(file_path)
        basename = os.path.basename(file_path)
        
        return send_from_directory(directory, basename)
    
    except Exception as e:
        return f"服务器错误: {str(e)}", 500

@app.route('/api/status')
def api_status():
    """API状态检查"""
    return jsonify({
        'status': 'running',
        'message': '办公室生存游戏服务器运行正常',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/files')
def api_files():
    """获取游戏文件列表（调试用）"""
    try:
        files = []
        for root, dirs, filenames in os.walk(STATIC_DIR):
            # 跳过隐藏目录和Python缓存
            dirs[:] = [d for d in dirs if not d.startswith('.') and d != '__pycache__']
            
            for filename in filenames:
                if not filename.startswith('.') and not filename.endswith('.pyc'):
                    rel_path = os.path.relpath(os.path.join(root, filename), STATIC_DIR)
                    files.append({
                        'path': rel_path,
                        'size': os.path.getsize(os.path.join(root, filename)),
                        'modified': datetime.fromtimestamp(
                            os.path.getmtime(os.path.join(root, filename))
                        ).isoformat()
                    })
        
        return jsonify({
            'files': files,
            'total': len(files)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return jsonify({
        'error': '页面未找到',
        'message': '请检查URL是否正确',
        'status': 404
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    return jsonify({
        'error': '服务器内部错误',
        'message': '请稍后重试或联系管理员',
        'status': 500
    }), 500

# 添加CORS支持（如果需要跨域访问）
@app.after_request
def after_request(response):
    """添加响应头"""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    
    # 为静态文件添加缓存控制
    if request.endpoint == 'static_files':
        if any(request.path.endswith(ext) for ext in ['.js', '.css', '.png', '.jpg', '.gif']):
            response.headers['Cache-Control'] = 'public, max-age=3600'  # 1小时缓存
    
    return response

def print_startup_info():
    """打印启动信息"""
    print("=" * 60)
    print("🎮 办公室生存游戏服务器")
    print("=" * 60)
    print(f"📁 静态文件目录: {STATIC_DIR}")
    print(f"🌐 本地访问地址: http://localhost:5000")
    print(f"🌐 局域网访问: http://0.0.0.0:5000")
    print("📊 API接口:")
    print("   - /api/status  - 服务器状态")
    print("   - /api/files   - 文件列表")
    print("=" * 60)
    print("💡 提示: 按 Ctrl+C 停止服务器")
    print("=" * 60)

if __name__ == '__main__':
    # 检查必要文件是否存在
    required_files = ['index.html', 'game.js']
    missing_files = []
    
    for file in required_files:
        if not os.path.exists(os.path.join(STATIC_DIR, file)):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ 错误: 缺少必要文件: {', '.join(missing_files)}")
        print("请确保在游戏项目目录中运行此服务器")
        exit(1)
    
    # 打印启动信息
    print_startup_info()
    
    # 启动Flask开发服务器
    try:
        app.run(
            host='0.0.0.0',  # 允许外部访问
            port=5000,       # 端口号
            debug=True,      # 开发模式
            threaded=True    # 多线程支持
        )
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except Exception as e:
        print(f"❌ 服务器启动失败: {e}")