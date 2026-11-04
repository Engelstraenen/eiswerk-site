"""Einfarbigen Studio-Hintergrund freistellen (Hintergrund pro Zeile aus den Rändern geschätzt, nur randverbundene Fläche wird transparent).
Aufruf: python3 key_blue.py in.jpg out.png [maxpx]"""
import sys
import numpy as np
import cv2
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
mx = int(sys.argv[3]) if len(sys.argv) > 3 else 1024
im = cv2.imread(src, cv2.IMREAD_COLOR)
h, w = im.shape[:2]
f = im.astype(np.float32)
strip = max(8, w // 60)
left = np.median(f[:, :strip], axis=1)
right = np.median(f[:, w - strip:], axis=1)
bgrow = (left + right) / 2  # (h,3)
bg = np.repeat(bgrow[:, None, :], w, axis=1)
d = np.linalg.norm(f - bg, axis=2)
dom = f[:, :, 0] - np.maximum(f[:, :, 1], f[:, :, 2])  # Blau-Dominanz (BGR)
cand = ((d < 40) | (dom > 28)).astype(np.uint8)  # Hintergrund-Kandidaten
# nur mit Rand verbundene Flächen
ff = cand.copy()
mask = np.zeros((h + 2, w + 2), np.uint8)
border = np.zeros_like(ff)
n, lab = cv2.connectedComponents(cand)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
edge.discard(0)
bgmask = np.isin(lab, list(edge)).astype(np.float32)
# weiche Kante: Distanz als Übergang
soft = np.clip((d - 26) / 40.0, 0, 1)
soft = np.where(dom > 28, np.minimum(soft, np.clip(1 - (dom - 28) / 40.0, 0, 1)), soft)
alpha = np.where(bgmask > 0, soft, 1.0).astype(np.float32)
alpha = cv2.GaussianBlur(alpha, (0, 0), 1.1)
alpha = np.clip((alpha - 0.06) / 0.88, 0, 1)
# Despill an Rändern: Blau-Anteil dort reduzieren, wo teiltransparent
b, g, r = f[:, :, 0], f[:, :, 1], f[:, :, 2]
edgew = np.clip(1 - alpha, 0, 1) * (alpha > 0.01)
bgb = bg[:, :, 0]
b2 = b - (b - np.maximum(r, g)).clip(0) * 0.85 * (alpha < 0.98)
rgb = np.dstack([r, g, np.minimum(b2, b)])
out = np.dstack([rgb, alpha * 255]).clip(0, 255).astype(np.uint8)
pil = Image.fromarray(out, "RGBA")
bbox = pil.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
if bbox:
    p = 10
    pil = pil.crop((max(0, bbox[0] - p), max(0, bbox[1] - p), min(w, bbox[2] + p), min(h, bbox[3] + p)))
pil.thumbnail((mx, mx), Image.LANCZOS)
pil.save(dst)
print(dst, pil.size)
