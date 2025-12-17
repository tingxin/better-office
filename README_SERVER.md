# 办公室生存游戏 - Web服务器

这是一个简单的Python Flask服务器，用于托管办公室生存游戏网站。

## 🚀 快速启动

### 方法1：自动启动（推荐）

```bash
python3 start_server.py
```

这个脚本会自动：
- 检查Python版本
- 检查必要文件
- 安装依赖包（如果需要）
- 启动服务器

### 方法2：手动启动

1. 安装依赖：
```bash
pip3 install -r requirements.txt
```

2. 启动服务器：
```bash
python3 app.py
```

## 🌐 访问地址

启动成功后，可以通过以下地址访问游戏：

- **本地访问**: http://localhost:5000
- **局域网访问**: http://你的IP地址:5000

## 📊 API接口

服务器提供以下API接口：

- `GET /api/status` - 服务器状态检查
- `GET /api/files` - 获取游戏文件列表（调试用）

## 📁 项目结构

```
办公室生存游戏/
├── app.py                 # Flask服务器主文件
├── start_server.py        # 启动脚本
├── requirements.txt       # Python依赖
├── README_SERVER.md       # 服务器说明文档
├── index.html            # 游戏主页面
├── game.js               # 游戏主逻辑
├── plugins/              # 插件目录
│   ├── air-conditioning-plugin.js
│   └── printer-maintenance-plugin.js
└── assets/               # 资源文件
    └── qr.jpg
```

## ⚙️ 配置选项

### 修改端口

在 `app.py` 中修改：
```python
app.run(
    host='0.0.0.0',
    port=8080,  # 改为你想要的端口
    debug=True
)
```

### 生产环境部署

对于生产环境，建议使用专业的WSGI服务器：

1. 安装gunicorn：
```bash
pip install gunicorn
```

2. 启动生产服务器：
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🛠️ 故障排除

### 常见问题

1. **端口被占用**
   ```
   Error: [Errno 48] Address already in use
   ```
   解决：更改端口号或停止占用端口的程序

2. **文件未找到**
   ```
   错误：无法加载游戏页面
   ```
   解决：确保在项目根目录运行服务器

3. **Python版本过低**
   ```
   需要Python 3.7或更高版本
   ```
   解决：升级Python版本

### 调试模式

服务器默认运行在调试模式，会：
- 自动重载代码更改
- 显示详细错误信息
- 提供调试工具

生产环境请设置 `debug=False`

## 🔒 安全注意事项

1. **仅用于开发和测试**：这是一个简单的开发服务器
2. **生产环境**：请使用专业的Web服务器（如Nginx + Gunicorn）
3. **防火墙**：确保只有信任的用户可以访问服务器

## 📝 日志

服务器会在控制台输出访问日志和错误信息。

## 🆘 获取帮助

如果遇到问题：
1. 检查控制台错误信息
2. 确认所有文件都在正确位置
3. 验证Python和Flask版本
4. 查看浏览器开发者工具的网络面板

---

🎮 **享受游戏！** 如果一切正常，你应该能在浏览器中看到办公室生存游戏界面。