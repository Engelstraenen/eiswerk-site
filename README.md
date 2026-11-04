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

## Lokal starten
```bash
pnpm install
pnpm dev            # http://localhost:4340
```

## Statischen Build für GitHub Pages erzeugen
```bash
STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/eiswerk-site pnpm build   # Ausgabe: out/
```
