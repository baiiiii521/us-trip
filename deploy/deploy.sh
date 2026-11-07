#!/usr/bin/env bash
# trip.byb521.com 发版脚本
#
# 拓扑：
#   境外线路 → 硅谷 43.153.33.188   /var/www/us-trip        （主入口，云同步 API 在这台）
#   默认线路 → 49.233.168.199       /srv/trip/public        （国内节点，/api/ 反代到硅谷）
#
# 用法：bash deploy/deploy.sh [-s]     # -s 只发硅谷（快速预览）
#
# 为什么绕路：Mac 直连国内 rsync 会卡死（跨境），所以国内那台由硅谷中转。
set -euo pipefail

cd "$(dirname "$0")/.."
SV=ubuntu@43.153.33.188
CN=ubuntu@49.233.168.199
ONLY_SV=0
[[ "${1:-}" == "-s" ]] && ONLY_SV=1

echo "== 1/6 测试"
npm test 2>&1 | tail -5

echo "== 2/6 构建"
npm run build:single 2>&1 | tail -3
cp deploy/robots.txt dist/robots.txt
[[ -f dist/index.html ]] || { echo "构建产物缺失"; exit 1; }

echo "== 3/6 发到硅谷"
rsync -az --delete dist/ "$SV":/tmp/us-trip-dist/
scp -q deploy/sync-server.mjs deploy/us-trip-sync.service deploy/nginx-us-trip.conf "$SV":/tmp/
ssh "$SV" '
set -e
sudo mkdir -p /var/www/us-trip /opt/us-trip-sync
sudo rsync -a --delete --chown=www-data:www-data /tmp/us-trip-dist/ /var/www/us-trip/
if ! sudo cmp -s /tmp/sync-server.mjs /opt/us-trip-sync/sync-server.mjs; then
  sudo install -m 644 /tmp/sync-server.mjs /opt/us-trip-sync/sync-server.mjs
  echo "   sync-server.mjs 有变化 → 重启服务"
  sudo systemctl restart us-trip-sync
fi
sudo install -m 644 /tmp/us-trip-sync.service /etc/systemd/system/us-trip-sync.service
sudo systemctl daemon-reload
sudo systemctl enable --now us-trip-sync >/dev/null 2>&1 || true
sudo install -m 644 /tmp/nginx-us-trip.conf /etc/nginx/sites-available/us-trip.conf
sudo nginx -t >/dev/null && sudo systemctl reload nginx
echo SV_OK
'

if [[ $ONLY_SV -eq 1 ]]; then
  echo "== 跳过国内节点（-s）"
else
  echo "== 4/6 经硅谷中转发到国内节点"
  scp -q deploy/nginx-us-trip-cn.conf "$SV":/tmp/
  ssh "$SV" "rsync -az --delete /tmp/us-trip-dist/ $CN:/tmp/us-trip-dist/ && scp -q /tmp/nginx-us-trip-cn.conf $CN:/tmp/"
  echo "== 5/6 国内节点落盘 + reload"
  ssh "$CN" '
  set -e
  sudo rsync -a --delete /tmp/us-trip-dist/ /srv/trip/public/
  sudo install -m 644 /tmp/nginx-us-trip-cn.conf /etc/nginx/sites-available/trip-byb521
  sudo nginx -t >/dev/null && sudo systemctl reload nginx
  echo CN_OK
  '
fi

echo "== 6/6 线上核对"
LOCAL_HASH=$(shasum -a 256 dist/index.html | cut -c1-16)
ID=$(python3 -c "print('f'*64)")
for host in 43.153.33.188 49.233.168.199; do
  [[ $ONLY_SV -eq 1 && "$host" == "49.233.168.199" ]] && continue
  printf "%-15s " "$host"
  curl -s --max-time 25 --resolve trip.byb521.com:443:$host -o /dev/null -w "page=%{http_code} %{size_download}B" https://trip.byb521.com/
  live=$(curl -s --max-time 25 --resolve trip.byb521.com:443:$host https://trip.byb521.com/ | shasum -a 256 | cut -c1-16)
  if [[ "$LOCAL_HASH" == "$live" ]]; then echo "  一致 $LOCAL_HASH"; else echo "  !! 不一致 本地=$LOCAL_HASH 线上=$live"; exit 1; fi
  printf "%-15s " ""
  curl -s --max-time 30 --resolve trip.byb521.com:443:$host -o /dev/null -w "api/sync GET=%{http_code}\n" "https://trip.byb521.com/api/sync?id=$ID"
done

echo "完成：https://trip.byb521.com"
