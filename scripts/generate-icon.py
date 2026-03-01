#!/usr/bin/env python3
"""
アプリアイコン生成スクリプト
点滴滴下数計算アプリ用の1024x1024pxアイコンを生成する。
デザイン: 医療系ブルーグラデーション背景 + 白い点滴ドロップ + タイマーモチーフ
"""

import struct
import zlib
import math
import os

SIZE = 1024


def create_png(width, height, pixels):
    """RGB ピクセルデータから PNG ファイルのバイト列を生成する"""
    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(chunk) & 0xFFFFFFFF)
        return struct.pack('>I', len(data)) + chunk + crc

    # PNGシグネチャ
    signature = b'\x89PNG\r\n\x1a\n'

    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = make_chunk(b'IHDR', ihdr_data)

    # IDAT
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'  # フィルタバイト（None）
        for x in range(width):
            idx = (y * width + x) * 3
            raw_data += bytes(pixels[idx:idx + 3])

    compressed = zlib.compress(raw_data, 9)
    idat = make_chunk(b'IDAT', compressed)

    # IEND
    iend = make_chunk(b'IEND', b'')

    return signature + ihdr + idat + iend


def lerp(a, b, t):
    """線形補間"""
    return a + (b - a) * t


def clamp(v, lo=0, hi=255):
    return max(lo, min(hi, int(v)))


def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))


def generate_icon():
    """アイコンを生成する"""
    pixels = [0] * (SIZE * SIZE * 3)

    # 背景グラデーション色
    color_top = hex_to_rgb("4A90D9")      # 医療系ブルー
    color_bottom = hex_to_rgb("7BB3F0")    # ライトスカイブルー

    cx, cy = SIZE / 2, SIZE / 2

    # === 背景: グラデーション ===
    for y in range(SIZE):
        t = y / (SIZE - 1)
        bg_r = lerp(color_top[0], color_bottom[0], t)
        bg_g = lerp(color_top[1], color_bottom[1], t)
        bg_b = lerp(color_top[2], color_bottom[2], t)
        for x in range(SIZE):
            idx = (y * SIZE + x) * 3
            pixels[idx] = clamp(bg_r)
            pixels[idx + 1] = clamp(bg_g)
            pixels[idx + 2] = clamp(bg_b)

    # === ドロップ形状の描画関数 ===
    def is_in_drop(px, py, drop_cx, drop_cy, drop_radius):
        """
        水滴型の判定:
        下半分は円、上半分は尖った形（涙型）
        drop_cy は円の中心のY座標
        """
        dx = px - drop_cx
        dy = py - drop_cy
        r = drop_radius

        # 下半分: 円形
        if dy >= 0:
            dist = math.sqrt(dx * dx + dy * dy)
            return dist <= r

        # 上半分: 涙型（放物線的に尖らせる）
        tip_y = -r * 1.8  # 先端のY（中心からの相対位置）
        if dy < tip_y:
            return False

        # 先端から円への遷移: 幅は y に応じて変化
        progress = (dy - tip_y) / (0 - tip_y)  # 0=先端, 1=円の上端
        # 幅は progress の平方根で増加（尖った形）
        max_width = r * math.sqrt(progress) if progress > 0 else 0
        return abs(dx) <= max_width

    def draw_drop_antialiased(pixels, drop_cx, drop_cy, drop_radius, color, shadow_offset=0, shadow_alpha=0):
        """アンチエイリアス付きドロップ描画"""
        tip_y = drop_cy - drop_radius * 1.8
        bottom_y = drop_cy + drop_radius

        # 影の描画
        if shadow_offset > 0 and shadow_alpha > 0:
            for y in range(max(0, int(tip_y - 10 + shadow_offset)), min(SIZE, int(bottom_y + 10 + shadow_offset))):
                for x in range(max(0, int(drop_cx - drop_radius - 10)), min(SIZE, int(drop_cx + drop_radius + 10))):
                    # サブピクセルサンプリング
                    inside_count = 0
                    samples = 4
                    for sy in range(samples):
                        for sx in range(samples):
                            spx = x + (sx + 0.5) / samples
                            spy = y + (sy + 0.5) / samples - shadow_offset
                            if is_in_drop(spx, spy, drop_cx, drop_cy, drop_radius + 4):
                                inside_count += 1
                    coverage = inside_count / (samples * samples) * shadow_alpha
                    if coverage > 0:
                        idx = (y * SIZE + x) * 3
                        pixels[idx] = clamp(pixels[idx] * (1 - coverage) + 0 * coverage)
                        pixels[idx + 1] = clamp(pixels[idx + 1] * (1 - coverage) + 0 * coverage)
                        pixels[idx + 2] = clamp(pixels[idx + 2] * (1 - coverage) + 0 * coverage)

        # ドロップ本体
        for y in range(max(0, int(tip_y - 5)), min(SIZE, int(bottom_y + 5))):
            for x in range(max(0, int(drop_cx - drop_radius - 5)), min(SIZE, int(drop_cx + drop_radius + 5))):
                # サブピクセルサンプリング（4x4）
                inside_count = 0
                samples = 4
                for sy in range(samples):
                    for sx in range(samples):
                        spx = x + (sx + 0.5) / samples
                        spy = y + (sy + 0.5) / samples
                        if is_in_drop(spx, spy, drop_cx, drop_cy, drop_radius):
                            inside_count += 1
                coverage = inside_count / (samples * samples)
                if coverage > 0:
                    idx = (y * SIZE + x) * 3
                    pixels[idx] = clamp(pixels[idx] * (1 - coverage) + color[0] * coverage)
                    pixels[idx + 1] = clamp(pixels[idx + 1] * (1 - coverage) + color[1] * coverage)
                    pixels[idx + 2] = clamp(pixels[idx + 2] * (1 - coverage) + color[2] * coverage)

    # === IVライン（細い白い線） ===
    line_x = cx
    line_top = 120
    line_bottom = cy - 180 * 1.8  # ドロップの先端付近
    line_width = 6

    for y in range(int(line_top), int(line_bottom)):
        for x in range(int(line_x - line_width), int(line_x + line_width)):
            if 0 <= x < SIZE and 0 <= y < SIZE:
                dist = abs(x - line_x)
                alpha = max(0, 1 - dist / line_width)
                alpha *= 0.7  # 半透明
                idx = (y * SIZE + x) * 3
                pixels[idx] = clamp(pixels[idx] * (1 - alpha) + 255 * alpha)
                pixels[idx + 1] = clamp(pixels[idx + 1] * (1 - alpha) + 255 * alpha)
                pixels[idx + 2] = clamp(pixels[idx + 2] * (1 - alpha) + 255 * alpha)

    # === メインドロップ ===
    drop_cx = cx
    drop_cy = cy + 80  # やや下寄り
    drop_radius = 200

    draw_drop_antialiased(pixels, drop_cx, drop_cy, drop_radius, (255, 255, 255), shadow_offset=8, shadow_alpha=0.15)

    # === ドロップ内のタイマー/時計モチーフ ===
    clock_cx = drop_cx
    clock_cy = drop_cy + 20  # ドロップの中心やや下
    clock_radius = 70

    # 時計の円（薄いブルー線）
    clock_color = hex_to_rgb("4A90D9")
    for y in range(int(clock_cy - clock_radius - 5), int(clock_cy + clock_radius + 5)):
        for x in range(int(clock_cx - clock_radius - 5), int(clock_cx + clock_radius + 5)):
            if 0 <= x < SIZE and 0 <= y < SIZE:
                dist = math.sqrt((x - clock_cx) ** 2 + (y - clock_cy) ** 2)
                # 円の線幅
                ring_alpha = max(0, 1 - abs(dist - clock_radius) / 3.5)
                if ring_alpha > 0:
                    alpha = ring_alpha * 0.6
                    idx = (y * SIZE + x) * 3
                    pixels[idx] = clamp(pixels[idx] * (1 - alpha) + clock_color[0] * alpha)
                    pixels[idx + 1] = clamp(pixels[idx + 1] * (1 - alpha) + clock_color[1] * alpha)
                    pixels[idx + 2] = clamp(pixels[idx + 2] * (1 - alpha) + clock_color[2] * alpha)

    # 時計の針（分針と時針）
    def draw_line(pixels, x1, y1, x2, y2, color, width=3, alpha_val=0.6):
        """ブレゼンハム風の線描画"""
        length = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        if length == 0:
            return
        steps = int(length * 2)
        for i in range(steps + 1):
            t = i / steps
            px = x1 + (x2 - x1) * t
            py = y1 + (y2 - y1) * t
            for dy in range(-int(width), int(width) + 1):
                for dx in range(-int(width), int(width) + 1):
                    ix = int(px + dx)
                    iy = int(py + dy)
                    if 0 <= ix < SIZE and 0 <= iy < SIZE:
                        dist = math.sqrt(dx * dx + dy * dy)
                        if dist <= width:
                            a = alpha_val * max(0, 1 - dist / width)
                            idx = (iy * SIZE + ix) * 3
                            pixels[idx] = clamp(pixels[idx] * (1 - a) + color[0] * a)
                            pixels[idx + 1] = clamp(pixels[idx + 1] * (1 - a) + color[1] * a)
                            pixels[idx + 2] = clamp(pixels[idx + 2] * (1 - a) + color[2] * a)

    # 時針: 10時の方向
    hour_angle = math.radians(-60)  # 10時方向
    hour_length = clock_radius * 0.5
    draw_line(pixels,
              clock_cx, clock_cy,
              clock_cx + math.cos(hour_angle) * hour_length,
              clock_cy + math.sin(hour_angle) * hour_length,
              clock_color, width=4, alpha_val=0.5)

    # 分針: 12時の方向
    minute_angle = math.radians(-90)  # 12時方向
    minute_length = clock_radius * 0.7
    draw_line(pixels,
              clock_cx, clock_cy,
              clock_cx + math.cos(minute_angle) * minute_length,
              clock_cy + math.sin(minute_angle) * minute_length,
              clock_color, width=3, alpha_val=0.5)

    # 時計の中心点
    center_dot_radius = 5
    for y in range(int(clock_cy - center_dot_radius), int(clock_cy + center_dot_radius + 1)):
        for x in range(int(clock_cx - center_dot_radius), int(clock_cx + center_dot_radius + 1)):
            if 0 <= x < SIZE and 0 <= y < SIZE:
                dist = math.sqrt((x - clock_cx) ** 2 + (y - clock_cy) ** 2)
                if dist <= center_dot_radius:
                    alpha = 0.5 * max(0, 1 - dist / center_dot_radius)
                    idx = (y * SIZE + x) * 3
                    pixels[idx] = clamp(pixels[idx] * (1 - alpha) + clock_color[0] * alpha)
                    pixels[idx + 1] = clamp(pixels[idx + 1] * (1 - alpha) + clock_color[1] * alpha)
                    pixels[idx + 2] = clamp(pixels[idx + 2] * (1 - alpha) + clock_color[2] * alpha)

    # === ハイライト（ドロップの左上） ===
    highlight_cx = drop_cx - 60
    highlight_cy = drop_cy - 40
    highlight_radius = 40
    for y in range(max(0, int(highlight_cy - highlight_radius - 5)), min(SIZE, int(highlight_cy + highlight_radius + 5))):
        for x in range(max(0, int(highlight_cx - highlight_radius - 5)), min(SIZE, int(highlight_cx + highlight_radius + 5))):
            dist = math.sqrt((x - highlight_cx) ** 2 + (y - highlight_cy) ** 2)
            if dist <= highlight_radius:
                # ドロップ内部かチェック
                if is_in_drop(x, y, drop_cx, drop_cy, drop_radius):
                    alpha = 0.25 * (1 - dist / highlight_radius) ** 2
                    idx = (y * SIZE + x) * 3
                    pixels[idx] = clamp(pixels[idx] * (1 - alpha) + 255 * alpha)
                    pixels[idx + 1] = clamp(pixels[idx + 1] * (1 - alpha) + 255 * alpha)
                    pixels[idx + 2] = clamp(pixels[idx + 2] * (1 - alpha) + 255 * alpha)

    return pixels


def main():
    print("アプリアイコンを生成中...")
    pixels = generate_icon()

    # アイコン保存
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    assets_dir = os.path.join(project_dir, "assets")

    png_data = create_png(SIZE, SIZE, pixels)

    # icon.png
    icon_path = os.path.join(assets_dir, "icon.png")
    with open(icon_path, 'wb') as f:
        f.write(png_data)
    print(f"  icon.png を保存しました: {icon_path}")

    # adaptive-icon.png（同じ画像）
    adaptive_path = os.path.join(assets_dir, "adaptive-icon.png")
    with open(adaptive_path, 'wb') as f:
        f.write(png_data)
    print(f"  adaptive-icon.png を保存しました: {adaptive_path}")

    # splash-icon.png（同じ画像）
    splash_path = os.path.join(assets_dir, "splash-icon.png")
    with open(splash_path, 'wb') as f:
        f.write(png_data)
    print(f"  splash-icon.png を保存しました: {splash_path}")

    print("完了！")


if __name__ == "__main__":
    main()
