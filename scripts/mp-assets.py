#!/usr/bin/env python3
"""生成小程序用的地图针和底部导航图标（可复现，不依赖外网素材）。

地图针：城市 / 景点 / 起点三种颜色
导航图标：五个栏目各一行线图标，未选中灰、选中主题橙，各出一张

用法：python3 scripts/mp-assets.py
"""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path('miniprogram/assets')
OUT.mkdir(parents=True, exist_ok=True)
SS = 4  # 超采样


def save(img, name, size):
    img.resize(size, Image.Resampling.LANCZOS).save(OUT / name, 'PNG', optimize=True)
    print(f"{OUT / name}  {(OUT / name).stat().st_size / 1024:.1f} KB")


def pin(color):
    """水滴形地图针：圆头 + 尖脚 + 白点"""
    w, h = 60 * SS, 78 * SS
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = w * 0.44
    cx, cy = w / 2, r + 4 * SS
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    # 尖脚：三角形，底边接在圆的下半部分
    d.polygon([(cx - r * 0.62, cy + r * 0.72), (cx + r * 0.62, cy + r * 0.72), (cx, h - 4 * SS)], fill=color)
    d.ellipse([cx - r * 0.3, cy - r * 0.3, cx + r * 0.3, cy + r * 0.3], fill=(255, 255, 255, 255))
    return img


def icon(kind, color):
    """24×24 的线图标，放大 4 倍画再缩小"""
    s = 24 * SS
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    lw = int(1.9 * SS)
    pad = 3 * SS

    def line(pts, width=lw, fill=color):
        d.line([(x * SS, y * SS) for x, y in pts], fill=fill, width=width, joint='curve')

    if kind == 'today':  # 时钟
        d.ellipse([pad, pad, s - pad, s - pad], outline=color, width=lw)
        line([(12, 7.5), (12, 12.4), (15.4, 14.2)])
    elif kind == 'days':  # 三条清单，带圆点
        for i, y in enumerate((7, 12, 17)):
            d.ellipse([4 * SS, (y - 0.9) * SS, 5.8 * SS, (y + 0.9) * SS], fill=color)
            line([(8, y), (19.5, y)])
    elif kind == 'guide':  # 一页地图
        d.rounded_rectangle([pad, 5 * SS, s - pad, 19 * SS], radius=2.4 * SS, outline=color, width=lw)
        line([(9.6, 5), (9.6, 19)])
        line([(14.4, 5), (14.4, 19)])
    elif kind == 'money':  # 钱包
        d.rounded_rectangle([pad, 6.5 * SS, s - pad, 19 * SS], radius=3 * SS, outline=color, width=lw)
        line([(pad, 10.5), (s - pad, 10.5)])
        d.ellipse([15.4 * SS, 13 * SS, 18.4 * SS, 16 * SS], fill=color)
    elif kind == 'more':  # 提包
        d.rounded_rectangle([4.6 * SS, 8 * SS, 19.4 * SS, 20 * SS], radius=2.6 * SS, outline=color, width=lw)
        d.arc([8.2 * SS, 3 * SS, 15.8 * SS, 11.4 * SS], start=200, end=340, fill=color, width=lw)
    return img


GREY = (138, 148, 160, 255)
ORANGE = (192, 74, 10, 255)
BLUE = (31, 78, 140, 255)

save(pin(ORANGE), 'pin-city.png', (34, 44))
save(pin(BLUE), 'pin-poi.png', (34, 44))
save(pin((46, 125, 50, 255)), 'pin-start.png', (34, 44))

for kind in ('today', 'days', 'guide', 'money', 'more'):
    save(icon(kind, GREY), f'ic-{kind}.png', (48, 48))
    save(icon(kind, ORANGE), f'ic-{kind}-on.png', (48, 48))
