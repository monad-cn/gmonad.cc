#!/bin/bash
set -e

# ================= 配置 =================
BASE_DIR=/root/app/gmonad.cc
TMP_DIR=/tmp/deploy_$(date +%s)

mkdir -p $TMP_DIR

# echo "🔄 拉取最新代码..."
git -C $BASE_DIR reset --hard
git -C $BASE_DIR pull origin main

# ================= 前端 =================
echo "📦 构建前端到临时目录..."
cp -r $BASE_DIR $TMP_DIR/frontend
cd $TMP_DIR/frontend
npm install
npm run build

echo "🚀 同步前端到生产目录..."
rsync -a --delete $TMP_DIR/frontend/ $BASE_DIR/

echo "♻️ 热重载前端服务..."
pm2 describe frontend >/dev/null 2>&1 \
  && pm2 reload frontend \
  || pm2 start npm --name frontend -- start --prefix $BASE_DIR

# ================= 后端 =================
echo "🔨 构建后端到临时目录..."
mkdir -p $TMP_DIR/backend
cd $BASE_DIR/gmonad
go build -o $TMP_DIR/backend/app

echo "♻️ 替换后端二进制..."
mv $TMP_DIR/backend/app $BASE_DIR/gmonad/app

echo "♻️ 重启后端服务..."
systemctl restart gmonad

# ================= 清 =================
rm -rf $TMP_DIR

echo "✅ 部署完成！"

