# 部署（trip.byb521.com）

线上地址：https://trip.byb521.com

## 拓扑

```
               阿里云 DNS（byb521.com，NS 在 hichina）
                          │
        ┌─────────────────┴──────────────────┐
   境外线路 A → 43.153.33.188          默认线路 A → 49.233.168.199
   腾讯云硅谷（主入口）                 腾讯云北京（国内节点）
   /var/www/us-trip                   /srv/trip/public
   nginx + LE 证书（HTTP-01 自动续期）   nginx + LE 证书（DNS-01，2027-02-01 到期）
   /api/ → 127.0.0.1:8796              /api/ → https://43.153.33.188（反代）
   us-trip-sync.service               （无本地 API，数据只有硅谷一份）
```

- 云同步：`us-trip-sync.service`（`deploy/sync-server.mjs`，Node 22，只监听 127.0.0.1:8796）
  只存客户端 AES-GCM 加密后的 `{iv, ct}`，按房间 id（SHA-256）落文件到 `/var/lib/us-trip-sync/`，
  单房间 300KB 上限、120 天不动自动清理。服务端拿不到明文，也不需要 Vercel KV。
- 国内节点是国内访客的兜底；两处跑的是同一份构建，**不要在两边手工改文件**。
- 站点带 `noindex`（robots.txt + X-Robots-Tag），不进搜索引擎。

## 发版

```bash
bash deploy/deploy.sh        # 跑测试 → 构建 → 硅谷 + 国内节点 → 线上核对
bash deploy/deploy.sh -s     # 只发硅谷（快速预览）
```

脚本会做三件事：`npm test`（26 项）、`npm run build:single`、两台机器落盘 + reload，
最后用 sha256 对比本地和两台的 `index.html`，不一致直接报错退出。

Mac 直连 49.233 的 rsync 会卡死（跨境链路），所以国内那台由硅谷中转（脚本里已处理）。

## 首次搭建时做过什么（换了机器就照这个来）

```bash
# 硅谷
sudo mkdir -p /var/www/us-trip /opt/us-trip-sync
sudo rsync -a --delete --chown=www-data:www-data dist/ /var/www/us-trip/
sudo install -m 644 deploy/sync-server.mjs /opt/us-trip-sync/
sudo install -m 644 deploy/us-trip-sync.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now us-trip-sync
# 证书：80 端口要先能通，证书由 certbot 自动续期
sudo certbot certonly --webroot -w /var/www/us-trip-acme -d trip.byb521.com \
  --agree-tos --non-interactive -m barry@byb521.com
sudo install -m 644 deploy/nginx-us-trip.conf /etc/nginx/sites-available/us-trip.conf
sudo ln -sfn /etc/nginx/sites-available/us-trip.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 国内节点
sudo install -m 644 deploy/nginx-us-trip-cn.conf /etc/nginx/sites-available/trip-byb521
```

## DNS

`trip` 两条 A 记录（阿里云，用 `bymail-dns` / `alidns.py` 操作）：

| 线路 | 值 |
| --- | --- |
| `oversea` | 43.153.33.188 |
| `default` | 49.233.168.199 |

## 地图底图

「整体路线」的州界来自 `scripts/build-map.mjs` 生成的 `src/data/map-geo.js`（内联 SVG，离线可用）。
换城市或改投影时重跑 `node scripts/build-map.mjs`；`scripts/data/states-10m.json` 是 vendored 的源数据，不用联网。

## 已知取舍

- 字体走 Google Fonts CDN。境外正常；国内节点上 `fonts.googleapis.com` 被墙，会退到系统字体（版面不塌，字形不同）。
  要彻底一致就把 woff2 放进 `public/fonts/` 并改成 `@font-face`，属于改设计资源，没自动做。
- 国内节点 `/api/` 跨境到硅谷，同步请求约 1 秒级；只有国内访客才会用到。
- 硅谷证书 90 天自动续期（certbot systemd timer）；国内那台是 DNS-01 一次性签发，2027-02-01 到期，到期需重签。
