#!/usr/bin/env python3
"""生成小程序图标（可复现，不依赖 AI 出图）。

构图：米白底 + 一颗篮球（主题橙 #C04A0A），左下一条虚线航迹指向它。
四周留 20% 安全边距——微信客户端会把图标裁成圆角/圆形，贴边的元素会被切掉。
尺寸：按 4 倍画，再缩到 1024 / 144，边缘才干净。

用法：python3 scripts/make-mp-icon.py [输出目录]
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

BG = (243, 245, 247, 255)     # #F3F5F7 和网站纸张色一致
ACCENT = (192, 74, 10, 255)   # #C04A0A 唯一的强调色
SS = 4                        # 超采样倍数
SIZE = 1024


def qbez(p0, p1, p2, n=240):
    """二次贝塞尔采样点"""
    pts = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        pts.append((
            u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
            u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
        ))
    return pts


def dashed(draw, pts, width, dash, gap):
    """沿曲线画虚线"""
    acc, on = 0.0, True
    prev = pts[0]
    for cur in pts[1:]:
        seg = ((cur[0] - prev[0]) ** 2 + (cur[1] - prev[1]) ** 2) ** 0.5
        acc += seg
        limit = dash if on else gap
        if acc >= limit:
            if on:
                draw.line([prev, cur], fill=ACCENT, width=width)
            acc, on = 0.0, not on
        elif on:
            draw.line([prev, cur], fill=ACCENT, width=width)
        prev = cur


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "deploy/mp").expanduser()
    out.mkdir(parents=True, exist_ok=True)
    S = SIZE * SS
    img = Image.new("RGBA", (S, S), BG)
    d = ImageDraw.Draw(img)

    cx, cy, r = 0.520 * S, 0.455 * S, 0.208 * S

    # 球体
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=ACCENT)

    # 缝线画在单独一层，再按球体裁掉，保证不出圈
    seams = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sd = ImageDraw.Draw(seams)
    w = int(0.021 * S)
    sd.line([cx, cy - r, cx, cy + r], fill=BG, width=w)                      # 竖线
    for sgn in (-1, 1):                                                       # 左右两条弧
        box = [cx + sgn * 0.98 * r - 1.08 * r, cy - 1.08 * r, cx + sgn * 0.98 * r + 1.08 * r, cy + 1.08 * r]
        sd.arc(box, start=0 if sgn < 0 else 180, end=180 if sgn < 0 else 360, fill=BG, width=w)
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    img.paste(seams, (0, 0), Image.composite(seams.split()[3], mask, mask))

    # 左下航迹：虚线 + 起点圆点，指向球
    path = qbez((0.185 * S, 0.885 * S), (0.395 * S, 0.895 * S), (0.455 * S, 0.700 * S))
    dashed(d, path, int(0.020 * S), 0.030 * S, 0.028 * S)
    dot_r = 0.017 * S
    d.ellipse([path[0][0] - dot_r, path[0][1] - dot_r, path[0][0] + dot_r, path[0][1] + dot_r], fill=ACCENT)

    big = img.convert("RGB")
    for px in (1024, 144):
        p = out / f"icon-{px}.png"
        big.resize((px, px), Image.Resampling.LANCZOS).save(p, "PNG", optimize=True)
        print(f"{p}  {p.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
