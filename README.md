# EISWERK – interaktive Scroll-Demo

Demo-Eisdiele (fiktiv, keine echte Eisdiele, Preise sind Platzhalter). Scroll steuert Video, Kamera und Story.

**Live:** https://engelstraenen.github.io/eiswerk-site/
**Videos einzeln:** https://engelstraenen.github.io/eiswerk-videos/

## Einbetten
```html
<iframe src="https://engelstraenen.github.io/eiswerk-site/" style="width:100%;height:100vh;border:0" allow="fullscreen" loading="lazy" title="EISWERK"></iframe>
```

## Stack
Next.js (App Router), React, TypeScript, GSAP + ScrollTrigger, Lenis, three.js / React Three Fiber.

## Mobil (< 1024 px)
Eigene Hochformat-Komposition, Desktop ab 1024 px unverändert:
- Videos bildfüllend; Handy hochkant lädt die 9:16-Fassungen `public/assets/video/*-portrait.mp4` (erzeugt mit `tools/make_portrait.py`), Tablet/Handy quer beschneidet das 16:9-Original mit Fokuspfad.
- Kürzere Scroll-Strecken (`mvh` in `lib/segments.ts`), Animationen mobil über `gsap.matchMedia()` (kurze, senkrechte Abläufe).
- Breakpoints und Fokuspfade: `lib/responsive.ts`; CSS-Block „MOBIL & TABLET“ am Ende von `app/globals.css`.
- Briefing für native 9:16-Videos (optional): `docs/video-briefing-mobil.md`.

## Lokal starten
```bash
pnpm install
pnpm dev            # http://localhost:4340
```

## Statischen Build für GitHub Pages erzeugen
```bash
STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/eiswerk-site pnpm build   # Ausgabe: out/
```
