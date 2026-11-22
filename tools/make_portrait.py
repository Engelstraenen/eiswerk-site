#!/usr/bin/env python3
"""Hochformat-Fassungen (9:16) der Scroll-Videos fürs Handy.

Schneidet aus jedem 1920x1080-Video einen 608x1080-Ausschnitt, der dem Motiv folgt
(Fokuspfad je Video, Werte = Bildmitte des Ausschnitts in Anteilen der Breite, über die Zeit
weich interpoliert). Kodierung wie die Originale: H.264, 24 fps, jedes Bild ein Keyframe
(All-Intra), damit das Scrubben per currentTime auch rückwärts ruckelfrei bleibt.
Dazu je ein Hochformat-Poster (Bild 0) für den Einstieg, bevor das Video geladen ist.

Aufruf:  python3 tools/make_portrait.py            (alle, Ausschnitt aus dem 16:9-Original)
         python3 tools/make_portrait.py eis acai   (einzelne)
         python3 tools/make_portrait.py eis --master /pfad/eis_9x16_master.mp4
                  (native 9:16-Fassung laut docs/video-briefing-mobil.md: wird auf 720x1280,
                   24 fps, All-Intra kodiert und ersetzt eis-portrait.mp4 + eis-portrait.jpg)
"""
import subprocess, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public/assets/video")
POS = os.path.join(ROOT, "public/assets/poster")
W, H, CW = 1920, 1080, 608

# (Sekunde, Bildmitte 0..1) – per Sichtprüfung der Einzelbilder festgelegt
FOCUS = {
    "eis": [(0, 0.49), (4, 0.48), (6, 0.47), (7.5, 0.5), (10.2, 0.5)],
    "shake": [(0, 0.5), (4, 0.49), (5.5, 0.5), (10.2, 0.5)],
    "acai": [(0, 0.47), (2.2, 0.49), (3.5, 0.5), (10.2, 0.5)],
    "coffee": [(0, 0.5), (4.5, 0.5), (5.3, 0.46), (6.3, 0.5), (7.2, 0.5), (8.2, 0.515), (10.2, 0.52)],
    "manufaktur": [(0, 0.44), (0.7, 0.5), (1.2, 0.58), (2.6, 0.56), (3.6, 0.5), (5.6, 0.52), (6.6, 0.6), (7.6, 0.56), (8.6, 0.48), (10.2, 0.47)],
}


def expr(keys):
    """ffmpeg-Ausdruck für x(t): stückweise smoothstep zwischen den Schlüsselwerten."""
    def px(c):
        return max(0, min(W - CW, c * W - CW / 2))
    e = f"{px(keys[-1][1]):.2f}"
    for (t0, c0), (t1, c1) in reversed(list(zip(keys, keys[1:]))):
        a, b = px(c0), px(c1)
        u = f"clip((t-{t0})/{t1 - t0},0,1)"
        seg = f"({a:.2f}+({b - a:.2f})*{u}*{u}*(3-2*{u}))"
        e = f"if(lt(t,{t1}),{seg},{e})"
    return e


def run(name, master=None):
    src = master or os.path.join(SRC, f"{name}.mp4")
    out = os.path.join(SRC, f"{name}-portrait.mp4")
    if master:
        # native 9:16-Fassung: nur auf Web-Format bringen (Hochformat erzwingen, 24 fps)
        vf = "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=24"
    else:
        x = expr(FOCUS[name]).replace(",", r"\,")
        vf = f"crop={CW}:{H}:{x}:0"
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", src, "-an", "-vf", vf,
        "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-pix_fmt", "yuv420p",
        "-profile:v", "high", "-x264-params", "keyint=1:min-keyint=1:scenecut=0",
        "-r", "24", "-movflags", "+faststart", out,
    ], check=True)
    poster = os.path.join(POS, f"{name}-portrait.jpg")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out, "-frames:v", "1", "-q:v", "3", poster], check=True)
    print(name, os.path.getsize(out) // 1024, "KB", os.path.getsize(poster) // 1024, "KB")


if __name__ == "__main__":
    args = sys.argv[1:]
    master = None
    if "--master" in args:
        i = args.index("--master")
        master = args[i + 1]
        del args[i:i + 2]
        if len(args) != 1:
            sys.exit("--master braucht genau einen Namen, z. B.: eis --master datei.mp4")
    for n in (args or FOCUS.keys()):
        run(n, master)
