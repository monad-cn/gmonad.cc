#!/bin/bash
set -e

cd /root/app/gmonad.cc

echo "🔄 拉取最新代码..."
git reset --hard
git pull origin main

echo "📦 构建前端..."
npm install
npm run build

echo "🚀 重启前端服务..."
pm2 restart frontend || pm2 start npm --name frontend -- start

echo "🔨 构建后端..."
cd gmonad
go build -o app

echo "♻️ 重启后端服务..."
systemctl restart gmonad

