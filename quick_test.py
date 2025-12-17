#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
快速端口测试脚本
检查服务器是否在正确的端口运行
"""

import socket
import sys

def test_port(host, port):
    """测试端口是否开放"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception as e:
        print(f"测试端口时出错: {e}")
        return False

def main():
    """主函数"""
    print("🔍 快速端口测试")
    print("=" * 30)
    
    # 测试常见端口
    ports_to_test = [5000, 5218]
    host = 'localhost'
    
    for port in ports_to_test:
        print(f"测试端口 {port}...", end=" ")
        if test_port(host, port):
            print(f"✅ 端口 {port} 开放")
            
            # 尝试HTTP请求
            try:
                import urllib.request
                url = f"http://{host}:{port}/api/status"
                print(f"  尝试访问: {url}")
                
                with urllib.request.urlopen(url, timeout=5) as response:
                    if response.getcode() == 200:
                        print(f"  ✅ HTTP响应正常")
                        print(f"  🌐 服务器运行在: http://{host}:{port}")
                        print(f"  🔧 插件页面: http://{host}:{port}/kiro/workshop")
                    else:
                        print(f"  ⚠️  HTTP响应异常: {response.getcode()}")
                        
            except Exception as e:
                print(f"  ❌ HTTP请求失败: {e}")
        else:
            print(f"❌ 端口 {port} 未开放")
    
    print("\n💡 如果5218端口未开放，请重启服务器:")
    print("   python3 start_plugin_server.py")

if __name__ == "__main__":
    main()