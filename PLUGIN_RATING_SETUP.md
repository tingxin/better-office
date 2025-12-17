# 插件评分系统部署指南

## 🎯 系统概述

这是一个完整的插件评分系统，包含：
- **数据库**: MySQL存储插件信息和评分数据
- **后端**: Flask API提供数据接口
- **前端**: 响应式HTML页面，支持五星评分

## 📋 部署步骤

### 1. 数据库设置

#### 执行SQL脚本创建表结构
```sql
-- 在MySQL中执行以下文件
source database_schema_fixed.sql;

-- 或者直接复制粘贴SQL语句执行
```

#### 验证表创建
```sql
-- 检查表是否创建成功
SHOW TABLES;
SELECT * FROM plugins;
SELECT * FROM plugin_details;
```

### 2. Python环境准备

#### 安装依赖包
```bash
# 安装Python依赖
pip3 install -r requirements.txt

# 或者手动安装
pip3 install Flask==2.3.3 PyMySQL==1.1.0
```

#### 测试数据库连接
```bash
# 运行数据库测试脚本
python3 test_database.py
```

### 3. 启动服务器

#### 方式1: 直接启动
```bash
python3 app.py
```

#### 方式2: 使用启动脚本
```bash
python3 start_server.py
```

### 4. 访问插件评分页面

- **本地访问**: http://localhost:5000/plugins
- **远程访问**: http://YOUR_SERVER_IP:5000/plugins

## 🔧 API接口文档

### GET /api/plugins
获取所有插件信息和统计数据

**响应示例**:
```json
{
  "success": true,
  "plugins": [
    {
      "id": 1,
      "plugin_name": "智能空调系统",
      "description": "安装智能空调系统...",
      "author": "Kiro开发团队",
      "version": "2.0.0",
      "icon": "snowflake",
      "color": "#2196F3",
      "total_ratings": 10,
      "average_rating": 4.5
    }
  ],
  "total": 5
}
```

### POST /api/rate-plugin
提交插件评分

**请求参数**:
```json
{
  "plugin_id": 1,
  "rating": 5,
  "comment": "非常好用的插件！"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "评分已提交",
  "rating": 5
}
```

### GET /api/plugin-stats/{plugin_id}
获取特定插件的详细统计

**响应示例**:
```json
{
  "success": true,
  "stats": {
    "total_ratings": 15,
    "average_rating": 4.33,
    "rating_5_count": 8,
    "rating_4_count": 4,
    "rating_3_count": 2,
    "rating_2_count": 1,
    "rating_1_count": 0
  },
  "recent_ratings": [...]
}
```

## 🎨 前端功能特性

### 插件展示
- ✅ 响应式卡片布局
- ✅ 插件图标和主题色
- ✅ 作者、版本、分类信息
- ✅ 平均评分和评分数量显示

### 评分功能
- ✅ 五星评分系统
- ✅ 鼠标悬停预览效果
- ✅ 可选评价留言
- ✅ 防重复评分（基于IP）
- ✅ 实时反馈和状态更新

### 用户体验
- ✅ 加载动画
- ✅ 错误处理和提示
- ✅ 移动端适配
- ✅ 无障碍访问支持

## 🗄️ 数据库表结构

### plugins (插件信息表)
- `id`: 主键
- `plugin_name`: 插件名称
- `plugin_id`: 插件标识符
- `description`: 插件描述
- `author`: 作者
- `version`: 版本号
- `icon`: 图标类型
- `color`: 主题色
- `category`: 分类
- `target_complaints`: 目标抱怨类型(JSON)

### plugin_ratings (评分表)
- `id`: 主键
- `plugin_id`: 插件ID(外键)
- `user_ip`: 用户IP
- `rating`: 评分(1-5)
- `comment`: 评价留言
- `created_at`: 创建时间

### plugin_statistics (统计表)
- `plugin_id`: 插件ID(主键)
- `total_ratings`: 总评分数
- `average_rating`: 平均评分
- `rating_X_count`: 各星级评分数量
- `last_rating_at`: 最后评分时间

## 🧪 测试功能

### 数据库测试
```bash
python3 test_database.py
```

### API测试
```bash
# 测试插件列表API
curl http://localhost:5000/api/plugins

# 测试评分提交API
curl -X POST http://localhost:5000/api/rate-plugin \
  -H "Content-Type: application/json" \
  -d '{"plugin_id":1,"rating":5,"comment":"测试评分"}'
```

### 前端测试
1. 访问 http://localhost:5000/plugins
2. 查看插件列表是否正常显示
3. 点击星星进行评分测试
4. 提交评分并查看反馈

## 🔒 安全考虑

### 防重复评分
- 基于用户IP地址限制
- 数据库唯一约束保证
- 前端状态管理

### 数据验证
- 评分范围验证(1-5)
- SQL注入防护
- XSS攻击防护

### 性能优化
- 数据库索引优化
- 统计数据缓存
- 前端资源压缩

## 🚀 生产环境部署

### 使用Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### 使用Nginx反向代理
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 📊 监控和维护

### 日志监控
- Flask应用日志
- 数据库查询日志
- 用户访问日志

### 数据备份
```bash
# 备份数据库
mysqldump -h tx-db.cbore8wpy3mc.us-east-2.rds.amazonaws.com \
  -u demo -p business > backup.sql
```

### 性能监控
- 响应时间监控
- 数据库连接池状态
- 内存和CPU使用率

---

🎉 **部署完成后，用户就可以通过扫描二维码访问插件评分页面了！**