# 办公室生存游戏服务器 - 远程测试指南

## 🚀 远程机器测试步骤

### 1. 环境准备

#### 检查Python环境
```bash
# 检查Python版本（需要3.7+）
python3 --version

# 如果没有python3，尝试python
python --version

# 检查pip
pip3 --version
# 或者
pip --version
```

#### 安装Flask（如果未安装）
```bash
# 方法1：使用pip3
pip3 install Flask

# 方法2：使用pip
pip install Flask

# 方法3：如果有权限问题，使用用户安装
pip3 install --user Flask
```

### 2. 文件传输到远程机器

将以下文件传输到远程机器的同一个目录：

**必需文件：**
- `app.py` - Flask服务器主文件
- `index.html` - 游戏主页面
- `game.js` - 游戏逻辑文件
- `requirements.txt` - Python依赖文件

**可选文件：**
- `start_server.py` - 自动启动脚本
- `README_SERVER.md` - 服务器说明
- `plugins/` 目录及其中的插件文件
- `assets/` 目录及其中的资源文件

### 3. 启动服务器

#### 方法1：使用自动启动脚本（推荐）
```bash
python3 start_server.py
```

#### 方法2：直接启动Flask应用
```bash
python3 app.py
```

#### 方法3：手动安装依赖后启动
```bash
# 安装依赖
pip3 install -r requirements.txt

# 启动服务器
python3 app.py
```

### 4. 测试服务器

#### 本地测试
```bash
# 测试服务器状态API
curl http://localhost:5000/api/status

# 测试主页
curl -I http://localhost:5000/

# 使用wget测试（如果有）
wget -O - http://localhost:5000/api/status
```

#### 浏览器测试
打开浏览器访问：
- http://localhost:5000 - 游戏主页
- http://localhost:5000/api/status - 服务器状态
- http://localhost:5000/api/files - 文件列表

### 5. 网络访问测试

#### 获取服务器IP地址
```bash
# Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# 或者使用ip命令（Linux）
ip addr show | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

#### 从其他机器访问
```bash
# 替换YOUR_SERVER_IP为实际IP地址
curl http://YOUR_SERVER_IP:5000/api/status

# 例如：
curl http://192.168.1.100:5000/api/status
```

## 🧪 完整测试脚本

创建一个测试脚本 `test_server.py`：

```python
#!/usr/bin/env python3
import requests
import json
import sys
import time

def test_server(base_url="http://localhost:5000"):
    """测试服务器功能"""
    print(f"🧪 测试服务器: {base_url}")
    print("=" * 50)
    
    tests = [
        ("主页访问", "/"),
        ("服务器状态", "/api/status"),
        ("文件列表", "/api/files"),
        ("游戏脚本", "/game.js"),
        ("插件文件", "/plugins/air-conditioning-plugin.js")
    ]
    
    results = []
    
    for test_name, endpoint in tests:
        try:
            url = base_url + endpoint
            print(f"测试 {test_name}: {url}")
            
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                print(f"  ✅ 成功 (状态码: {response.status_code})")
                if endpoint.startswith("/api/"):
                    try:
                        data = response.json()
                        print(f"  📄 响应: {json.dumps(data, indent=2, ensure_ascii=False)}")
                    except:
                        print(f"  📄 响应长度: {len(response.text)} 字符")
                else:
                    print(f"  📄 内容长度: {len(response.text)} 字符")
                results.append((test_name, True, response.status_code))
            else:
                print(f"  ❌ 失败 (状态码: {response.status_code})")
                results.append((test_name, False, response.status_code))
                
        except requests.exceptions.ConnectionError:
            print(f"  ❌ 连接失败 - 服务器可能未启动")
            results.append((test_name, False, "连接失败"))
        except requests.exceptions.Timeout:
            print(f"  ❌ 请求超时")
            results.append((test_name, False, "超时"))
        except Exception as e:
            print(f"  ❌ 错误: {e}")
            results.append((test_name, False, str(e)))
        
        print()
        time.sleep(0.5)
    
    # 总结
    print("📊 测试结果总结:")
    print("=" * 50)
    success_count = sum(1 for _, success, _ in results if success)
    total_count = len(results)
    
    for test_name, success, status in results:
        status_icon = "✅" if success else "❌"
        print(f"  {status_icon} {test_name}: {status}")
    
    print(f"\n🎯 成功率: {success_count}/{total_count} ({success_count/total_count*100:.1f}%)")
    
    if success_count == total_count:
        print("🎉 所有测试通过！服务器运行正常。")
    else:
        print("⚠️  部分测试失败，请检查服务器配置。")

if __name__ == "__main__":
    # 允许指定服务器地址
    server_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    
    try:
        test_server(server_url)
    except KeyboardInterrupt:
        print("\n测试被中断")
```

## 🔧 故障排除

### 常见问题及解决方案

#### 1. 端口被占用
```bash
# 查看端口占用情况
netstat -tulpn | grep :5000
# 或者
lsof -i :5000

# 杀死占用端口的进程
kill -9 PID号
```

#### 2. 防火墙问题
```bash
# Ubuntu/Debian
sudo ufw allow 5000

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload

# 临时关闭防火墙测试（不推荐生产环境）
sudo ufw disable
```

#### 3. 权限问题
```bash
# 使用用户权限安装包
pip3 install --user Flask

# 或者使用虚拟环境
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows
pip install Flask
```

#### 4. Python版本问题
```bash
# 如果python3不可用，尝试指定版本
python3.8 app.py
python3.9 app.py

# 或者使用python
python app.py
```

## 📋 测试检查清单

- [ ] Python 3.7+ 已安装
- [ ] Flask 已安装
- [ ] 所有必需文件已传输
- [ ] 服务器成功启动（显示启动信息）
- [ ] 本地访问 http://localhost:5000 正常
- [ ] API接口 /api/status 返回正确响应
- [ ] 游戏页面能正常加载
- [ ] 插件文件能正常访问
- [ ] 从其他机器能访问服务器（如果需要）

## 🚀 快速测试命令

```bash
# 一键测试脚本
echo "测试服务器..." && \
curl -s http://localhost:5000/api/status | python3 -m json.tool && \
echo "服务器运行正常！"

# 或者使用wget
wget -qO- http://localhost:5000/api/status | python3 -m json.tool
```

## 📞 获取帮助

如果遇到问题：
1. 检查控制台错误信息
2. 确认所有文件在正确位置
3. 验证网络连接和防火墙设置
4. 查看服务器日志输出

---

🎮 **测试完成后，你就可以在浏览器中享受办公室生存游戏了！**