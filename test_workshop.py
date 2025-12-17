#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
插件评分页面快速测试脚本
测试 /kiro/workshop 路径是否正常工作
"""

import sys
import time

def test_workshop_page(base_url="http://localhost:5218"):
    """测试插件评分页面"""
    print("🧪 测试插件评分页面")
    print("=" * 50)
    
    # 选择HTTP客户端
    try:
        import requests
        make_request = lambda url: requests.get(url, timeout=10)
        print("📦 使用requests库")
    except ImportError:
        import urllib.request
        import urllib.error
        
        def make_request(url):
            try:
                with urllib.request.urlopen(url, timeout=10) as response:
                    return type('Response', (), {
                        'status_code': response.getcode(),
                        'text': response.read().decode('utf-8')
                    })()
            except urllib.error.HTTPError as e:
                return type('Response', (), {
                    'status_code': e.code,
                    'text': str(e)
                })()
            except Exception as e:
                return type('Response', (), {
                    'status_code': None,
                    'text': str(e)
                })()
        
        print("📦 使用内置urllib")
    
    print()
    
    # 测试用例
    test_cases = [
        ("🔧 新路径", "/kiro/workshop", "插件评分页面"),
        ("🔄 旧路径重定向", "/plugins", "重定向到新路径"),
        ("📦 插件API", "/api/plugins", "插件数据API"),
        ("📊 服务器状态", "/api/status", "服务器状态API")
    ]
    
    results = []
    
    for test_name, endpoint, description in test_cases:
        url = base_url + endpoint
        print(f"测试 {test_name}")
        print(f"  🔗 URL: {url}")
        print(f"  📝 期望: {description}")
        
        try:
            response = make_request(url)
            status_code = response.status_code
            content = response.text
            
            if status_code == 200:
                print(f"  ✅ 成功 (状态码: {status_code})")
                
                # 检查内容
                if endpoint == "/kiro/workshop":
                    if "插件评分" in content or "办公室生存游戏" in content:
                        print("  🎮 确认包含插件评分页面内容")
                    else:
                        print("  ⚠️  页面内容可能不正确")
                elif endpoint == "/plugins":
                    if status_code in [301, 302]:
                        print("  🔄 确认重定向正常")
                    else:
                        print("  ✅ 向后兼容访问正常")
                elif endpoint.startswith("/api/"):
                    try:
                        import json
                        data = json.loads(content)
                        if data.get('success'):
                            print("  📊 API响应正常")
                        else:
                            print("  ⚠️  API响应异常")
                    except:
                        print("  ⚠️  API响应格式异常")
                
                results.append((test_name, True, status_code))
                
            elif status_code in [301, 302] and endpoint == "/plugins":
                print(f"  ✅ 重定向成功 (状态码: {status_code})")
                results.append((test_name, True, status_code))
                
            else:
                print(f"  ❌ 失败 (状态码: {status_code})")
                results.append((test_name, False, status_code))
                
        except Exception as e:
            print(f"  ❌ 请求失败: {e}")
            results.append((test_name, False, "异常"))
        
        print("-" * 50)
        time.sleep(0.5)
    
    # 结果总结
    print("\n📊 测试结果:")
    print("=" * 50)
    
    success_count = sum(1 for _, success, _ in results if success)
    total_count = len(results)
    
    for test_name, success, status in results:
        status_icon = "✅" if success else "❌"
        print(f"  {status_icon} {test_name}: {status}")
    
    print(f"\n🎯 成功率: {success_count}/{total_count} ({success_count/total_count*100:.1f}%)")
    
    if success_count == total_count:
        print("\n🎉 所有测试通过！插件评分页面工作正常。")
        print("🌐 访问地址: http://localhost:5218/kiro/workshop")
    else:
        print("\n⚠️  部分测试失败，请检查服务器状态。")
    
    return success_count, total_count

def main():
    """主函数"""
    server_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5218"
    
    print("🔧 插件评分页面测试工具")
    print(f"🌐 测试服务器: {server_url}")
    print(f"⏰ 测试时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        success_count, total_count = test_workshop_page(server_url)
        
        if success_count == total_count:
            sys.exit(0)
        else:
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n测试被中断")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()