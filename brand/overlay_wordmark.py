#!/usr/bin/env python3
"""Legt die feste EISWERK-Wortmarke per Tracking auf Bowl/Glas.

Ablauf: Position/Größe im LETZTEN Frame festlegen (--x --y --w in Pixeln des
Videos), dann rückwärts über LK-Optical-Flow + RANSAC verfolgen. Sichtbar
wird die Marke erst, wenn der Tracker stabil ist (Fade-in).

  python3 overlay_wordmark.py in.mp4 out.mp4 --x 427 --y 340 --w 190
"""
import argparse
import subprocess
import cv2
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("dst")
ap.add_argument("--x", type=float, required=True, help="Mitte der Marke im letzten Frame")
ap.add_argument("--y", type=float, required=True)
ap.add_argument("--w", type=float, required=True, help="Breite der Marke im letzten Frame")
ap.add_argument("--roi", type=float, default=1.0, help="Tracking-Bereich = Faktor * Markenbreite")
ap.add_argument("--opacity", type=float, default=0.92)
ap.add_argument("--start", type=float, default=0.0, help="frühester Start (Sekunden)")
ap.add_argument("--fade", type=float, default=0.4)
ap.add_argument("--wordmark", default="eiswerk-wordmark.png")
ap.add_argument("--debug", default="")
ap.add_argument("--static-from", type=int, default=-1, help="feste Position ab diesem Frame, kein Tracking")
a = ap.parse_args()

cap = cv2.VideoCapture(a.src)
fps = cap.get(cv2.CAP_PROP_FPS)
frames = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    frames.append(f)
n = len(frames)
H, W = frames[0].shape[:2]
gray = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]

wm = cv2.imread(a.wordmark, cv2.IMREAD_UNCHANGED)  # BGRA
wm_h, wm_w = wm.shape[:2]

# Transformation Marke -> Bild je Frame: 3x3, startet im letzten Frame
s0 = a.w / wm_w
T = [None] * n
T[n - 1] = np.array([[s0, 0, a.x - a.w / 2], [0, s0, a.y - (wm_h * s0) / 2], [0, 0, 1]], dtype=np.float64)
ok_flag = [False] * n
ok_flag[n - 1] = True
lk = dict(winSize=(21, 21), maxLevel=3, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))

for i in range(n - 2, -1, -1):
    prev, cur = gray[i + 1], gray[i]  # prev = später, cur = früher
    Tn = T[i + 1]
    cx, cy = Tn[0, 2] + wm_w * Tn[0, 0] / 2, Tn[1, 2] + wm_h * Tn[1, 1] / 2
    half_w = max(20, a.roi * wm_w * Tn[0, 0] / 2)
    half_h = max(20, a.roi * wm_w * Tn[0, 0] / 3)
    x0, x1 = int(max(0, cx - half_w)), int(min(W, cx + half_w))
    y0, y1 = int(max(0, cy - half_h)), int(min(H, cy + half_h))
    mask = np.zeros_like(prev)
    mask[y0:y1, x0:x1] = 255
    pts = cv2.goodFeaturesToTrack(prev, 120, 0.01, 4, mask=mask)
    if pts is None or len(pts) < 8:
        T[i] = Tn
        continue
    nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev, cur, pts, None, **lk)
    st = st.ravel() == 1
    if st.sum() < 8:
        T[i] = Tn
        continue
    M, inl = cv2.estimateAffinePartial2D(pts[st], nxt[st], method=cv2.RANSAC, ransacReprojThreshold=2.0)
    if M is None or inl.sum() < 8:
        T[i] = Tn
        continue
    M3 = np.vstack([M, [0, 0, 1]])
    T[i] = M3 @ Tn
    ok_flag[i] = True

if a.static_from >= 0:
    for i in range(n):
        T[i] = T[n - 1]
        ok_flag[i] = i >= a.static_from
# Alpha je Frame: sichtbar, sobald Marke komplett im Bild und ab --start, mit Fade-in
alpha = np.zeros(n)
first = None
run_start = n - 1
while run_start > 0 and ok_flag[run_start - 1]:
    run_start -= 1
for i in range(n):
    t = T[i]
    corners = np.array([[0, 0, 1], [wm_w, 0, 1], [0, wm_h, 1], [wm_w, wm_h, 1]]).T
    p = t @ corners
    inside = (p[0] >= 0).all() and (p[0] <= W).all() and (p[1] >= 0).all() and (p[1] <= H * 0.97).all()
    if inside and i >= run_start and i / fps >= a.start and first is None:
        first = i
    if first is not None:
        alpha[i] = min(1.0, (i - first) / max(1, a.fade * fps))
alpha *= a.opacity

tmp = a.dst + ".tmp.mp4"
vw = cv2.VideoWriter(tmp, cv2.VideoWriter_fourcc(*"mp4v"), fps, (W, H))
rgb = wm[:, :, :3].astype(np.float32)
wa = wm[:, :, 3].astype(np.float32) / 255.0
for i in range(n):
    f = frames[i]
    if alpha[i] > 0:
        M = T[i][:2]
        col = cv2.warpAffine(rgb, M, (W, H), flags=cv2.INTER_AREA, borderValue=0)
        al = cv2.warpAffine(wa, M, (W, H), flags=cv2.INTER_AREA, borderValue=0)[:, :, None] * alpha[i]
        f = (f.astype(np.float32) * (1 - al) + col * al).astype(np.uint8)
    vw.write(f)
vw.release()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-i", a.src, "-map", "0:v", "-map", "1:a?",
                "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17", "-c:a", "copy", a.dst], check=True)
import os
os.remove(tmp)
print("frames", n, "tracked", sum(ok_flag), "first visible", first)
