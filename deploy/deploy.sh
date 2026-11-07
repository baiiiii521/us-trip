#!/usr/bin/env bash
# 在你的服务器上运行（需要 Node 18+）：
#   git clone https://github.com/baiiiii521/us-trip.git && cd us-trip && bash deploy/deploy.sh
# 之后更新：cd us-trip && git pull && bash deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci --no-audit --no-fund
npm run build
if command -v pm2 >/dev/null; then
  pm2 describe us-trip >/dev/null 2>&1 && pm2 restart us-trip || PORT="${PORT:-8080}" pm2 start deploy/server.mjs --name us-trip
  pm2 save
else
  echo "没有 pm2：直接运行 PORT=8080 node deploy/server.mjs，或用 deploy/us-trip.service 做 systemd 服务"
fi
echo "完成。本机访问 http://localhost:${PORT:-8080}"
