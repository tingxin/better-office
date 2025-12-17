#!/bin/bash
# 办公室生存游戏服务器一键启动脚本

echo "🎮 办公室生存游戏服务器启动脚本"
echo "=================================="

# 检查Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    echo "✅ 找到 python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    echo "✅ 找到 python"
else
    echo "❌ 错误: 未找到Python解释器"
    echo "请安装Python 3.7或更高版本"
    exit 1
fi

# 检查Python版本
echo "🔍 检查Python版本..."
$PYTHON_CMD -c "import sys; print(f'Python版本: {sys.version}'); exit(0 if sys.version_info >= (3,7) else 1)"
if [ $? -ne 0 ]; then
    echo "❌ Python版本过低，需要3.7或更高版本"
    exit 1
fi

# 检查必要文件
echo "🔍 检查游戏文件..."
required_files=("app.py" "index.html" "game.js")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    else
        echo "✅ 找到文件: $file"
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ 缺少必要文件: ${missing_files[*]}"
    echo "请确保在游戏项目目录中运行此脚本"
    exit 1
fi

# 检查Flask
echo "🔍 检查Flask安装..."
$PYTHON_CMD -c "import flask; print(f'Flask版本: {flask.__version__}')" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📦 Flask未安装，正在安装..."
    $PYTHON_CMD -m pip install Flask
    if [ $? -ne 0 ]; then
        echo "❌ Flask安装失败"
        echo "请手动安装: pip install Flask"
        exit 1
    fi
    echo "✅ Flask安装成功"
else
    echo "✅ Flask已安装"
fi

echo ""
echo "🚀 启动游戏服务器..."
echo "=================================="
echo "💡 提示: 按 Ctrl+C 停止服务器"
echo "🌐 访问地址: http://localhost:5218"
echo "=================================="
echo ""

# 启动服务器
$PYTHON_CMD app.py