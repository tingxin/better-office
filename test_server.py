#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
办公室生存游戏服务器测试脚本
用于验证Flask服务器是否正常工作
"""

import sys
import time
import json

def test_with_urllib():
    """使用urllib进行测试（不需要额外依赖）"""
    import urllib.request
    import urllib.error
    
    def make_request(url):
        try:
            with urllib.request.urlopen(url, timeout=10) as response:
                return response.getcode(), response.read().decode('utf-8')
        except urllib.error.HTTPError as e:
            return e.code, str(e)
        except urllib.error.URLError as e:
            return None, str(e)
        except Exception as e:
            return None, str(e)
    
    return make_request

def test_with_requests():
    """使用requests库进行测试（如果可用）"""
    try:
        import requests
        
        def make_request(url):
            try:
                response = requests.get(url, timeout=10)
                return response.status_code, response.text
            except requests.exceptions.ConnectionError:
                return None, "连接失败 - 服务器可能未启动"
            except requests.exceptions.Timeout:
                return None, "请求超时"
            except Exception as e:
                return None, str(e)
        
        return make_request
    except ImportError:
        return None

def test_server(base_url="http://localhost:5000"):
    """测试服务器功能"""
    print(f"🧪 测试服务器: {base_url}")
    print("=" * 60)
    
    # 选择HTTP客户端
    make_request = test_with_requests()
    if make_request is None:
        print("📦 使用内置urllib（推荐安装requests: pip install requests）")
        make_request = test_with_urllib()
    else:
        print("📦 使用requests库")
    
    print()
    
    # 测试用例
    tests = [
        ("🏠 主页访问", "/", "HTML页面"),
        ("📊 服务器状态API", "/api/status", "JSON响应"),
        ("📁 文件列表API", "/api/files", "JSON响应"),
        ("🎮 游戏主脚本", "/game.js", "JavaScript文件"),
        ("❄️ 空调插件", "/plugins/air-conditioning-plugin.js", "插件文件"),
        ("🖨️ 打印机插件", "/plugins/printer-maintenance-plugin.js", "插件文件"),
        ("🖼️ 资源文件", "/assets/qr.jpg", "图片文件")
    ]
    
    results = []
    
    for test_name, endpoint, description in tests:
        url = base_url + endpoint
        print(f"测试 {test_name}")
        print(f"  🔗 URL: {url}")
        print(f"  📝 期望: {description}")
        
        status_code, content = make_request(url)
        
        if status_code == 200:
            print(f"  ✅ 成功 (状态码: {status_code})")
            
            # 分析响应内容
            if endpoint.startswith("/api/"):
                try:
                    if isinstance(content, str):
                        data = json.loads(content)
                        print(f"  📄 JSON响应: {json.dumps(data, indent=4, ensure_ascii=False)[:200]}...")
                    else:
                        print(f"  📄 响应类型: {type(content)}")
                except json.JSONDecodeError:
                    print(f"  ⚠️  响应不是有效JSON: {content[:100]}...")
                except Exception as e:
                    print(f"  ⚠️  解析响应时出错: {e}")
            else:
                content_length = len(content) if content else 0
                print(f"  📄 内容长度: {content_length} 字符")
                
                # 检查HTML内容
                if endpoint == "/" and content:
                    if "办公室生存游戏" in content:
                        print("  🎮 确认包含游戏标题")
                    if "<canvas" in content:
                        print("  🖼️  确认包含游戏画布")
            
            results.append((test_name, True, status_code))
            
        elif status_code:
            print(f"  ❌ HTTP错误 (状态码: {status_code})")
            print(f"  📄 错误信息: {content[:200]}...")
            results.append((test_name, False, status_code))
        else:
            print(f"  ❌ 连接失败: {content}")
            results.append((test_name, False, "连接失败"))
        
        print("-" * 60)
        time.sleep(0.5)
    
    # 测试结果总结
    print("\n📊 测试结果总结:")
    print("=" * 60)
    
    success_count = sum(1 for _, success, _ in results if success)
    total_count = len(results)
    
    for test_name, success, status in results:
        status_icon = "✅" if success else "❌"
        print(f"  {status_icon} {test_name}: {status}")
    
    print(f"\n🎯 成功率: {success_count}/{total_count} ({success_count/total_count*100:.1f}%)")
    
    if success_count == total_count:
        print("\n🎉 所有测试通过！服务器运行正常。")
        print("💡 你现在可以在浏览器中访问游戏了！")
    elif success_count >= total_count * 0.7:
        print("\n⚠️  大部分测试通过，服务器基本正常。")
        print("💡 部分文件可能缺失，但核心功能应该可用。")
    else:
        print("\n❌ 多个测试失败，请检查服务器配置。")
        print("💡 确保服务器已启动且所有文件都在正确位置。")
    
    return success_count, total_count

def print_usage():
    """打印使用说明"""
    print("🧪 办公室生存游戏服务器测试工具")
    print("=" * 50)
    print("用法:")
    print("  python3 test_server.py                    # 测试本地服务器")
    print("  python3 test_server.py http://IP:PORT     # 测试远程服务器")
    print()
    print("示例:")
    print("  python3 test_server.py http://192.168.1.100:5000")
    print("  python3 test_server.py http://localhost:8080")
    print()

def main():
    """主函数"""
    if len(sys.argv) > 1 and sys.argv[1] in ['-h', '--help', 'help']:
        print_usage()
        return
    
    # 获取服务器地址
    server_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    
    try:
        print("🚀 开始测试...")
        print(f"⏰ 测试时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        success_count, total_count = test_server(server_url)
        
        print(f"\n⏰ 测试完成时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 返回适当的退出码
        if success_count == total_count:
            sys.exit(0)  # 全部成功
        elif success_count >= total_count * 0.7:
            sys.exit(1)  # 部分成功
        else:
            sys.exit(2)  # 大部分失败
            
    except KeyboardInterrupt:
        print("\n\n⏹️  测试被用户中断")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ 测试过程中发生错误: {e}")
        sys.exit(3)

if __name__ == "__main__":
    main()