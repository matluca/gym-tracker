#!/usr/bin/env python3
"""Generate the PWA icons in static/icons/ — placeholder art, no dependencies.

Run with `npm run icons` after changing BG/FG to rebrand.
"""

import os
import struct
import zlib

BG = (0x0F, 0x11, 0x15)
FG = (0x4C, 0x8D, 0xFF)

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "icons")


def write_png(path, size, pixels):
    raw = b"".join(
        b"\x00" + bytes(channel for px in row for channel in px) for row in pixels
    )

    def chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    with open(path, "wb") as handle:
        handle.write(png)


def rounded_rect(pixels, size, x0, y0, x1, y1, color, radius):
    """Fill a rounded rectangle given fractional (0..1) bounds."""
    px0, py0 = int(x0 * size), int(y0 * size)
    px1, py1 = int(x1 * size), int(y1 * size)
    r = int(radius * size)

    for y in range(max(py0, 0), min(py1, size)):
        for x in range(max(px0, 0), min(px1, size)):
            # Push the sample point to the nearest corner centre and reject
            # anything outside the corner radius.
            cx = min(max(x, px0 + r), px1 - r - 1)
            cy = min(max(y, py0 + r), py1 - r - 1)
            if r and (x - cx) ** 2 + (y - cy) ** 2 > r * r:
                continue
            pixels[y][x] = color


def dumbbell(size, scale):
    """A dumbbell centred in the canvas, scaled about the centre."""
    pixels = [[BG] * size for _ in range(size)]

    def s(value):
        return 0.5 + (value - 0.5) * scale

    # bar
    rounded_rect(pixels, size, s(0.30), s(0.455), s(0.70), s(0.545), FG, 0.015 * scale)
    # inner plates
    rounded_rect(pixels, size, s(0.235), s(0.35), s(0.325), s(0.65), FG, 0.03 * scale)
    rounded_rect(pixels, size, s(0.675), s(0.35), s(0.765), s(0.65), FG, 0.03 * scale)
    # outer caps
    rounded_rect(pixels, size, s(0.155), s(0.405), s(0.225), s(0.595), FG, 0.025 * scale)
    rounded_rect(pixels, size, s(0.775), s(0.405), s(0.845), s(0.595), FG, 0.025 * scale)

    return pixels


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    targets = [
        ("icon-192.png", 192, 1.0),
        ("icon-512.png", 512, 1.0),
        # Maskable icons get cropped to a circle of 80% diameter by some
        # launchers, so the artwork is shrunk to stay inside that safe zone.
        ("icon-maskable-512.png", 512, 0.7),
    ]

    for name, size, scale in targets:
        path = os.path.join(OUT_DIR, name)
        write_png(path, size, dumbbell(size, scale))
        print(f"wrote {os.path.relpath(path)} ({size}x{size})")


if __name__ == "__main__":
    main()
