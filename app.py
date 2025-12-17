#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
办公室生存游戏 - Flask Web服务器
简单的静态文件服务器，用于托管游戏网站
"""

from flask import Flask, send_from_directory, send_file, jsonify, request
import os
import mimetypes
import json
import pymysql
from datetime import datetime

# 创建Flask应用
app = Flask(__name__)

# 配置静态文件目录
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))

# 加载配置文件
def load_config():
    """加载配置文件"""
    config_path = os.path.join(STATIC_DIR, 'config.json')
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        print(f"✅ 配置文件加载成功: {config_path}")
        return config
    except FileNotFoundError:
        print(f"❌ 配置文件未找到: {config_path}")
        print("💡 请确保config.json文件存在")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ 配置文件格式错误: {e}")
        return None
    except Exception as e:
        print(f"❌ 加载配置文件失败: {e}")
        return None

# 全局配置
CONFIG = load_config()
if not CONFIG:
    print("❌ 无法加载配置，程序退出")
    exit(1)

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

# 数据库连接函数
def get_db_connection():
    """获取数据库连接"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        return connection
    except Exception as e:
        print(f"数据库连接失败: {e}")
        return None

def get_client_ip():
    """获取客户端IP地址"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr

@app.route('/kiro/workshop')
def plugins_page():
    """插件评分页面"""
    try:
        return send_file(os.path.join(STATIC_DIR, 'plugins.html'))
    except Exception as e:
        return f"错误：无法加载插件页面 - {str(e)}", 500

# 保持向后兼容
@app.route('/plugins')
def plugins_page_redirect():
    """插件页面重定向到新路径"""
    from flask import redirect
    return redirect('/kiro/workshop', code=301)

@app.route('/api/plugins')
def api_plugins():
    """获取所有插件信息和统计数据"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': '数据库连接失败'}), 500
    
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            # 查询插件详细信息（包含统计数据）
            cursor.execute("""
                SELECT 
                    p.id, p.plugin_name, p.plugin_id, p.description, p.author, 
                    p.version, p.icon, p.color, p.category, p.target_complaints,
                    p.created_at, p.is_active,
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
                ORDER BY s.average_rating DESC, s.total_ratings DESC, p.created_at ASC
            """)
            
            plugins = cursor.fetchall()
            
            # 处理JSON字段
            for plugin in plugins:
                if plugin['target_complaints']:
                    try:
                        plugin['target_complaints'] = json.loads(plugin['target_complaints'])
                    except:
                        plugin['target_complaints'] = []
                else:
                    plugin['target_complaints'] = []
                
                # 格式化时间
                if plugin['created_at']:
                    plugin['created_at'] = plugin['created_at'].isoformat()
                if plugin['last_rating_at']:
                    plugin['last_rating_at'] = plugin['last_rating_at'].isoformat()
            
            return jsonify({
                'success': True,
                'plugins': plugins,
                'total': len(plugins)
            })
            
    except Exception as e:
        print(f"查询插件失败: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        connection.close()

@app.route('/api/rate-plugin', methods=['POST'])
def api_rate_plugin():
    """提交插件评分"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': '数据库连接失败'}), 500
    
    try:
        data = request.get_json()
        plugin_id = data.get('plugin_id')
        rating = data.get('rating')
        comment = data.get('comment', '').strip()
        
        # 验证数据
        if not plugin_id or not rating:
            return jsonify({'success': False, 'message': '缺少必要参数'}), 400
        
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'success': False, 'message': '评分必须是1-5之间的整数'}), 400
        
        # 获取用户信息
        user_ip = get_client_ip()
        user_agent = request.headers.get('User-Agent', '')
        
        with connection.cursor() as cursor:
            # 检查插件是否存在
            cursor.execute("SELECT id FROM plugins WHERE id = %s AND is_active = TRUE", (plugin_id,))
            if not cursor.fetchone():
                return jsonify({'success': False, 'message': '插件不存在'}), 404
            
            # 检查用户是否已经评分过
            cursor.execute(
                "SELECT id FROM plugin_ratings WHERE plugin_id = %s AND user_ip = %s", 
                (plugin_id, user_ip)
            )
            existing_rating = cursor.fetchone()
            
            if existing_rating:
                # 更新现有评分
                cursor.execute("""
                    UPDATE plugin_ratings 
                    SET rating = %s, comment = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE plugin_id = %s AND user_ip = %s
                """, (rating, comment, plugin_id, user_ip))
                message = '评分已更新'
            else:
                # 插入新评分
                cursor.execute("""
                    INSERT INTO plugin_ratings (plugin_id, user_ip, user_agent, rating, comment)
                    VALUES (%s, %s, %s, %s, %s)
                """, (plugin_id, user_ip, user_agent, rating, comment))
                message = '评分已提交'
            
            # 手动更新统计数据（如果触发器不工作）
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
            
            return jsonify({
                'success': True,
                'message': message,
                'rating': rating
            })
            
    except Exception as e:
        print(f"提交评分失败: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        connection.close()

@app.route('/api/plugin-stats/<int:plugin_id>')
def api_plugin_stats(plugin_id):
    """获取特定插件的详细统计信息"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': '数据库连接失败'}), 500
    
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            # 获取插件统计信息
            cursor.execute("""
                SELECT * FROM plugin_statistics WHERE plugin_id = %s
            """, (plugin_id,))
            
            stats = cursor.fetchone()
            if not stats:
                return jsonify({'success': False, 'message': '插件统计不存在'}), 404
            
            # 获取最近的评分
            cursor.execute("""
                SELECT rating, comment, created_at 
                FROM plugin_ratings 
                WHERE plugin_id = %s 
                ORDER BY created_at DESC 
                LIMIT 10
            """, (plugin_id,))
            
            recent_ratings = cursor.fetchall()
            
            # 格式化时间
            if stats['last_rating_at']:
                stats['last_rating_at'] = stats['last_rating_at'].isoformat()
            if stats['updated_at']:
                stats['updated_at'] = stats['updated_at'].isoformat()
            
            for rating in recent_ratings:
                if rating['created_at']:
                    rating['created_at'] = rating['created_at'].isoformat()
            
            return jsonify({
                'success': True,
                'stats': stats,
                'recent_ratings': recent_ratings
            })
            
    except Exception as e:
        print(f"查询插件统计失败: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        connection.close()

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
    print(f"🌐 本地访问地址: http://localhost:{CONFIG['server']['port']}")
    print(f"🌐 局域网访问: http://0.0.0.0:{CONFIG['server']['port']}")
    print("📊 主要页面:")
    print("   - /              - 游戏主页")
    print("   - /kiro/workshop - 插件评分页面")
    print("📊 API接口:")
    print("   - /api/status    - 服务器状态")
    print("   - /api/plugins   - 插件列表")
    print("   - /api/files     - 文件列表")
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
        server_config = CONFIG['server']
        app.run(
            host=server_config['host'],
            port=server_config['port'],
            debug=server_config['debug'],
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except Exception as e:
        print(f"❌ 服务器启动失败: {e}")