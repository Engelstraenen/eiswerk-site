"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import gsap from "gsap";
import { ACTS, BRIDGE_IN, BRIDGE_START, PLAY_END } from "@/lib/acts";
import { MENU_PAGES } from "@/lib/menu";
import { MenuOverlay } from "./MenuOverlay";
import { SiteNav } from "./SiteNav";
import { SEGS, interReg, type Seg } from "@/lib/segments";
import { Interlude } from "./Interludes";
import { sceneState } from "@/lib/state";
import { asset } from "@/lib/asset";

const Particles = dynamic(() => import("./Particles"), { ssr: false });

const N = ACTS.length;
const TOTAL = N; // 4 Akte, Speisekarte ist ein Menüpunkt
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};
// Trapez: 0 -> 1 -> 0 über [a, b] mit Rampen
const win = (p: number, c: number, span: number) => {
  const h = span / 2;
  const ramp = span * 0.32;
  if (p < c - h || p > c + h) return 0;
  return Math.min(smooth((p - (c - h)) / ramp), smooth((c + h - p) / ramp));
};

export default function Experience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const beatRefs = useRef<(HTMLDivElement | null)[][]>(ACTS.map(() => []));
  const explainRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cueRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const lenisRef = useRef<Lenis | null>(null);
  const nav = useRef({ act: -1, arrived: false }).current; // Ziel eines Menü-Sprungs
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [pcount, setPcount] = useState(700);

  useEffect(() => {
    // Eugen hat „Bewegung reduzieren“ am Gerät an: Scroll-Film trotzdem zeigen. Statische Fassung nur per ?static.
    setReduced(new URLSearchParams(window.location.search).has("static"));
    try {
      const c = document.createElement("canvas");
      setWebgl(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
    const small = window.innerWidth < 760 || window.matchMedia("(pointer: coarse)").matches;
    setPcount(small ? 320 : 760);
    sceneState.quality = small ? 0.6 : 1;
  }, []);

  useEffect(() => {
    if (reduced) {
      setReady(true);
      return;
    }
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const vids = videoRefs.current as HTMLVideoElement[];
    let dpr = Math.min(window.devicePixelRatio || 1, sceneState.quality < 1 ? 1.25 : 1.75);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, sceneState.quality < 1 ? 1.25 : 1.75);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
    lenisRef.current = lenis;
    let raf = 0;
    let lastScroll = 0;
    let vel = 0;
    const root = document.documentElement;

    const supportsFilter = "filter" in ctx;

    const tiny = document.createElement("canvas");
    tiny.width = 12;
    tiny.height = 22;
    const mid = document.createElement("canvas");
    mid.width = 96;
    mid.height = 176;
    const mctx = mid.getContext("2d")!;
    const tctx = tiny.getContext("2d")!;
    const off = document.createElement("canvas");
    const octx = off.getContext("2d")!;

    const drawPortrait = (v: HTMLCanvasElement, scale: number, blur: number, shift: number) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const vw = v.width || 854;
      const vh = v.height || 480;
      // 1) weicher Hintergrund: Video stark verkleinert und wieder hochskaliert
      const cs = Math.max(tiny.width / vw, tiny.height / vh);
      tctx.drawImage(v, (tiny.width - vw * cs) / 2, (tiny.height - vh * cs) / 2, vw * cs, vh * cs);
      mctx.imageSmoothingEnabled = true;
      mctx.imageSmoothingQuality = "high";
      mctx.drawImage(tiny, 0, 0, mid.width, mid.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(mid, 0, 0, cw, ch);
      // 2) scharfes Video, Mitte 52 Prozent in voller Breite, oben-mittig
      const s = (cw / (vw * 0.52)) * scale;
      const w = vw * s;
      const h = vh * s;
      const x = (cw - w) / 2;
      const y = ch * 0.4 - h / 2 - shift * ch * 0.08;
      if (off.width !== cw || off.height !== ch) {
        off.width = cw;
        off.height = ch;
      }
      octx.globalCompositeOperation = "source-over";
      octx.clearRect(0, 0, cw, ch);
      octx.drawImage(v, x, y, w, h);
      const f = Math.max(0.01, (h * 0.16) / ch);
      const top = Math.max(0, y / ch);
      const bot = Math.min(1, (y + h) / ch);
      const mask = octx.createLinearGradient(0, 0, 0, ch);
      mask.addColorStop(0, "rgba(0,0,0,0)");
      mask.addColorStop(Math.min(1, top), "rgba(0,0,0,0)");
      mask.addColorStop(Math.min(1, top + f), "rgba(0,0,0,1)");
      mask.addColorStop(Math.max(0, bot - f), "rgba(0,0,0,1)");
      mask.addColorStop(Math.min(1, bot), "rgba(0,0,0,0)");
      mask.addColorStop(1, "rgba(0,0,0,0)");
      octx.globalCompositeOperation = "destination-in";
      octx.fillStyle = mask;
      octx.fillRect(0, 0, cw, ch);
      ctx.drawImage(off, 0, 0);
      void blur;
    };

    const drawVideo = (v: HTMLCanvasElement, scale: number, blur: number, shift: number) => {
      const cw = canvas.width;
      const ch = canvas.height;
      if (cw / ch < 0.8) return drawPortrait(v, scale, blur, shift);
      const vw = v.width || 854;
      const vh = v.height || 480;
      const s = Math.max(cw / vw, ch / vh) * scale * (1 + 0.17 * shift);
      const w = vw * s;
      const h = vh * s;
      if (supportsFilter && blur > 0.2) ctx.filter = `blur(${blur * dpr}px)`;
      const dx = window.innerWidth > 760 ? -0.075 * cw * shift : 0;
      ctx.drawImage(v, (cw - w) / 2 + dx, (ch - h) / 2, w, h);
      if (supportsFilter) ctx.filter = "none";
    };

    // Flackern vermeiden: gezeichnet wird nie das Video selbst (während des Suchens kann es alt/schwarz sein),
    // sondern der Puffer mit dem letzten fertig gesuchten Bild.
    const bufs = vids.map(() => {
      const b = document.createElement("canvas");
      (b as HTMLCanvasElement & { ok?: boolean }).ok = false;
      return b as HTMLCanvasElement & { ok?: boolean };
    });
    const grab = (i: number) => {
      const v = vids[i];
      const b = bufs[i];
      if (!v.videoWidth || v.readyState < 2) return;
      if (b.width !== v.videoWidth || b.height !== v.videoHeight) {
        b.width = v.videoWidth;
        b.height = v.videoHeight;
      }
      b.getContext("2d")!.drawImage(v, 0, 0);
      b.ok = true;
    };
    const grabbers = vids.map((v, i) => {
      const f = () => grab(i);
      v.addEventListener("seeked", f);
      v.addEventListener("loadeddata", f);
      return f;
    });
    const seek = (v: HTMLVideoElement, t: number) => {
      if (v.readyState < 1 || v.seeking) return;
      if (Math.abs(v.currentTime - t) > 0.012) v.currentTime = t;
    };

    const posters = ACTS.map((a) => {
      const im = new Image();
      im.decoding = "async";
      im.src = a.poster;
      return im;
    });
    const segBg = (sg: Seg): [number, number, number] => (sg.kind === "act" ? ACTS[sg.act].bg : sg.bg);
    const starts: number[] = [];
    const lens: number[] = [];
    const layout = () => {
      const H = window.innerHeight;
      let c = 0;
      SEGS.forEach((sg, i) => {
        starts[i] = c;
        lens[i] = (sg.vh / 100) * H;
        c += lens[i];
      });
    };
    layout();
    window.addEventListener("resize", layout);
    const prevActOf = (i: number) => {
      for (let k = i; k >= 0; k--) {
        const sg = SEGS[k];
        if (sg.kind === "act") return sg.act;
      }
      return 0;
    };
    // Videos erst laden, wenn man sich ihrem Akt nähert (spart ~40 MB beim Start)
    const actSeg = ACTS.map((_, a) => SEGS.findIndex((sg) => sg.kind === "act" && sg.act === a));
    const started = new Set<number>();
    const warm = (a: number) => {
      if (started.has(a)) return;
      started.add(a);
      const v = vids[a];
      if (v) {
        v.preload = "auto";
        v.load();
      }
    };
    let lastTheme = -1;

    const frame = (time: number) => {
      lenis.raf(time);
      const H = window.innerHeight;
      const max = document.documentElement.scrollHeight - H;
      const y = window.scrollY;
      const g = max > 0 ? clamp(y / max) : 0;
      let si = 0;
      for (let k = 0; k < SEGS.length; k++) if (y >= starts[k] - 0.5) si = k;
      const seg = SEGS[si];
      ACTS.forEach((_, a) => {
        if (si >= actSeg[a] - 3) warm(a);
      });
      const lenEff = si === SEGS.length - 1 ? Math.max(1, lens[si] - H) : lens[si];
      const p = clamp((y - starts[si]) / lenEff);
      vel = vel * 0.85 + (y - lastScroll) * 0.15;
      lastScroll = y;
      const s = sceneState;
      s.g = g;
      s.local = p;
      s.vel = vel;
      const curAct = seg.kind === "act" ? seg.act : -1;
      s.act = prevActOf(si);
      const next = SEGS[si + 1];
      const prev = SEGS[si - 1];
      const cw = canvas.width;
      const ch = canvas.height;

      let outT = 0;
      let inT = 0;
      if (seg.kind === "act") {
        const A = ACTS[seg.act];
        const v = vids[seg.act];
        const buf = bufs[seg.act];
        const playP = clamp(p / PLAY_END);
        if (v && v.duration) seek(v, playP * (v.duration - 0.03));
        outT = next ? smooth((p - BRIDGE_START) / (1 - BRIDGE_START)) : 0;
        inT = prev ? 1 - smooth(p / BRIDGE_IN) : 0;
        // Menü-Sprung: direkt im Akt landen, nicht im Übergang des vorherigen Showcase
        if (nav.act === seg.act) {
          nav.arrived = true;
          if (p < BRIDGE_IN) inT = 0;
        }
        ctx.fillStyle = `rgb(${A.bg[0]},${A.bg[1]},${A.bg[2]})`;
        ctx.fillRect(0, 0, cw, ch);
        const layerOn = Math.max(outT, inT) > 0.999;
        // Solange das Video noch kein Bild liefert, steht das Poster (kein leerer Einstiegsbildschirm)
        const pim = posters[seg.act];
        const src = buf && buf.ok ? buf : pim && pim.complete && pim.naturalWidth ? (pim as unknown as HTMLCanvasElement) : null;
        if (src && !layerOn) {
          const scale = 1 + 0.32 * smooth(outT) - 0.16 * inT + 0.06 * playP;
          const shift = smooth((p - PLAY_END) / 0.08) * (1 - smooth((p - (BRIDGE_START - 0.05)) / 0.06));
          drawVideo(src, scale, outT * 16 + inT * 14, shift);
        }
        const fogA = Math.max(outT, inT);
        if (fogA > 0.001) {
          const c = outT >= inT ? (next ? segBg(next) : A.bg) : prev ? segBg(prev) : A.bg;
          const grd = ctx.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, Math.max(cw, ch) * 0.7);
          const alpha = Math.min(1, fogA * 1.15);
          grd.addColorStop(0, `rgba(${Math.min(255, c[0] + 18)},${Math.min(255, c[1] + 18)},${Math.min(255, c[2] + 18)},${alpha})`);
          grd.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},${Math.min(1, alpha * 1.05)})`);
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, cw, ch);
        }
      } else {
        // Nachbar-Videos auf den richtigen Randframe vorspulen, damit der Einstieg nicht flackert
        const nx = next;
        if (nx && nx.kind === "act") seek(vids[nx.act], 0);
        const pv = prev;
        if (pv && pv.kind === "act" && vids[pv.act].duration) seek(vids[pv.act], vids[pv.act].duration - 0.03);
      }
      s.bridge = Math.max(outT, inT);

      // Ebenen (Interludes + Speisekarte)
      SEGS.forEach((sg, k) => {
        const el = layerRefs.current[k];
        if (!el) return;
        let op = 0;
        if (k === si) op = 1;
        else if (seg.kind === "act" && k === si + 1) op = outT;
        else if (seg.kind === "act" && k === si - 1) op = inT;
        else if (seg.kind === "inter" && k === si + 1 && next && next.kind === "inter") op = smooth((p - 0.94) / 0.06);
        else if (seg.kind === "inter" && k === si - 1 && prev && prev.kind === "inter") op = 1 - smooth(p / 0.06);
        el.style.opacity = String(op);
        el.style.visibility = op > 0.004 ? "visible" : "hidden";
        if (sg.kind === "inter" && op > 0.004) interReg[sg.id]?.(k === si ? p : k === si + 1 ? 0 : 1);
      });

      // Thema (HUD-Farben, Punkte, Zähler)
      let ti = si;
      if (seg.kind === "act") {
        if (outT > 0.55 && next) ti = si + 1;
        else if (inT > 0.55 && prev) ti = si - 1;
      }
      if (ti !== lastTheme) {
        lastTheme = ti;
        const tg = SEGS[ti];
        const pal = tg.kind === "act" ? { ink: ACTS[tg.act].ink, accent: ACTS[tg.act].accent, bg: ACTS[tg.act].bg } : { ink: tg.ink, accent: tg.accent, bg: tg.bg };
        const dot = prevActOf(ti);
        root.classList.toggle("menu-dark", tg.kind === "inter");
        root.style.setProperty("--ink", pal.ink);
        root.style.setProperty("--accent", pal.accent);
        root.style.setProperty("--bg", `rgb(${pal.bg.join(",")})`);
        dotsRef.current.forEach((d, i) => d && d.classList.toggle("on", i === dot));
        if (counterRef.current) {
          const idx = ACTS[dot].index;
          counterRef.current.innerHTML = `<b>${idx}</b>/ 0${TOTAL}`;
        }
      }

      // Hero + Cue
      if (nav.act >= 0 && nav.arrived && !(seg.kind === "act" && seg.act === nav.act)) {
        nav.act = -1;
        nav.arrived = false;
      }
      const heroOp = clamp(1 - y / (0.76 * H));
      if (heroRef.current) {
        heroRef.current.style.opacity = String(heroOp);
        heroRef.current.style.transform = `translateY(calc(-50% + ${(1 - heroOp) * -40}px)) scale(${1 + (1 - heroOp) * 0.06})`;
      }
      if (cueRef.current) cueRef.current.style.opacity = String(heroOp * 0.9);

      // Beats
      ACTS.forEach((ac, ai) => {
        ac.beats.forEach((b, bi) => {
          const el = beatRefs.current[ai][bi];
          if (!el) return;
          const o = ai === curAct ? win(p, b.at, b.span) : 0;
          el.style.opacity = String(o);
          const dir = b.side === "right" ? 1 : -1;
          el.style.transform = `translate3d(${(1 - o) * 46 * dir * -1}px, calc(-50% + ${(1 - o) * 28}px), 0)`;
          el.style.visibility = o > 0.002 ? "visible" : "hidden";
        });
        const ex = explainRefs.current[ai];
        if (ex) {
          const start = PLAY_END + 0.02;
          const end = BRIDGE_START - 0.01;
          const o = ai === curAct ? Math.min(smooth((p - start) / 0.06), smooth((end - p) / 0.04)) : 0;
          ex.style.opacity = String(o);
          ex.style.transform = `translate3d(0, ${(1 - o) * 34}px, 0)`;
          ex.style.visibility = o > 0.002 ? "visible" : "hidden";
          ex.querySelectorAll<HTMLElement>(".row").forEach((r, ri) => {
            r.style.opacity = String(smooth((p - start - 0.015 - ri * 0.035) / 0.05) * (o > 0 ? 1 : 0));
          });
        }
      });

      if (railRef.current) (railRef.current.firstElementChild as HTMLElement).style.width = `${g * 100}%`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Intro
    gsap.fromTo(".hero h1 span", { yPercent: 40, opacity: 0, filter: "blur(14px)" }, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 1.6, ease: "expo.out", stagger: 0.07, delay: 0.5 });
    gsap.fromTo(".hero p", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.3, ease: "expo.out", delay: 1.4 });

    // Loader
    const first = vids[0];
    const done = () => {
      setReady(true);
      warm(0);
    };
    void first;
    // Poster reicht für den Einstieg: Ladebildschirm geht weg, sobald das Poster dekodiert ist (Video lädt nach)
    posters[0].decode().then(done).catch(() => undefined);
    const t = setTimeout(done, 2500);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", layout);
      vids.forEach((v, i) => {
        v.removeEventListener("seeked", grabbers[i]);
        v.removeEventListener("loadeddata", grabbers[i]);
      });
      lenis.destroy();
    };
  }, [reduced]);

  const goTo = (i: number) => {
    const H = window.innerHeight;
    let c = 0;
    let target = 0;
    for (const sg of SEGS) {
      if (sg.kind === "act" && sg.act === i) {
        target = c + 3;
        break;
      }
      c += (sg.vh / 100) * H;
    }
    if (i === 0) target = 0.82 * H; // Eis: hinter dem Einstiegsbild (Hero) landen
    nav.act = i;
    nav.arrived = false;
    lenisRef.current?.scrollTo(target, { duration: 2.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  };

  if (reduced) {
    return (
      <main>
        <header style={{ padding: "5vh 7vw" }}>
          <img src={asset("/brand/eiswerk-wordmark.png")} alt="EISWERK" height={22} />
        </header>
        {ACTS.map((a) => (
          <section key={a.id} className="static-act" style={{ background: `rgb(${a.bg.join(",")})`, color: a.ink }}>
            <img src={a.poster} alt={`${a.name} bei EISWERK`} />
            <h2>{a.name}</h2>
            <p>{a.tagline}</p>
            <ul>
              {a.explain.rows.map((r) => (
                <li key={r.label}>
                  <strong>{r.label}.</strong> {r.text}
                </li>
              ))}
            </ul>
          </section>
        ))}
        <MenuText className="static-act" />
      </main>
    );
  }

  return (
    <main>
      <h1 className="sr-only">EISWERK, Eis, Açaí-Bowls, Milchshakes und Iced Coffee (Demo)</h1>
      {ACTS.map((a) => (
        <section key={a.id} className="sr-only" aria-label={a.name}>
          <h2>{a.name}</h2>
          <p>{a.tagline}</p>
          {a.beats.map((b) => (
            <p key={b.title}>
              {b.kicker}: {b.title} {b.text}
            </p>
          ))}
          <h3>{a.explain.heading}</h3>
          <ul>
            {a.explain.rows.map((r) => (
              <li key={r.label}>
                {r.label}: {r.text}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <MenuText className="sr-only" />
      <div style={{ height: `${SEGS.reduce((a, b) => a + b.vh, 0)}vh` }} aria-hidden />

      <div className="stage" aria-hidden>
        {ACTS.map((a, i) => (
          <video
            key={a.id}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={a.video}
            poster={a.poster}
            muted
            playsInline
            preload="none"
            style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
          />
        ))}
        <canvas ref={canvasRef} className="frames" />
        {webgl && <Particles count={pcount} />}
        <div className="vignette" />
        <div className="grain" />
      </div>

      {SEGS.map((sg, k) =>
        sg.kind === "act" ? null : (
          <div key={sg.id} className="il-layer" ref={(el) => { layerRefs.current[k] = el; }} style={{ visibility: "hidden", opacity: 0, background: `rgb(${sg.bg.join(",")})`, color: sg.ink, ["--accent" as string]: sg.accent }} aria-hidden>
            <Interlude id={sg.id} />
          </div>
        )
      )}

      <div className="hero" ref={heroRef} aria-hidden>
        <h1>
          {"EISWERK".split("").map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </h1>
        <p>Eis wie ein Kunstwerk.</p>
      </div>

      {ACTS.map((a, ai) =>
        a.beats.map((b, bi) => (
          <div
            key={`${a.id}-${bi}`}
            ref={(el) => {
              beatRefs.current[ai][bi] = el;
            }}
            className={`beat ${b.side}`}
            style={{ visibility: "hidden" }}
            aria-hidden
          >
            <div className="k">{a.index} · {b.kicker.toUpperCase()}</div>
            <h2>{b.title}</h2>
            <p>{b.text}</p>
          </div>
        ))
      )}

      {ACTS.map((a, ai) => (
        <div
          key={`ex-${a.id}`}
          ref={(el) => {
            explainRefs.current[ai] = el;
          }}
          className="explain"
          style={{ visibility: "hidden" }}
          aria-hidden
        >
          <h3>{a.explain.heading}</h3>
          {a.explain.rows.map((r, ri) => (
            <div className="row" key={r.label}>
              <em>0{ri + 1}</em>
              <strong>{r.label}</strong>
              <span>{r.text}</span>
            </div>
          ))}
        </div>
      ))}

      <div className="hud">
        <div className="brand">
          <img src={asset("/brand/eiswerk-wordmark.png")} alt="EISWERK" />
        </div>
        <div className="counter" ref={counterRef}>
          <b>01</b>/ 04
        </div>
        <nav className="dots" aria-label="Produkte">
          {ACTS.map((a) => a.name).map((nm, i) => (
            <button
              key={nm}
              ref={(el) => {
                dotsRef.current[i] = el;
              }}
              className={i === 0 ? "on" : ""}
              onClick={() => goTo(i)}
              aria-label={`${nm} ansehen`}
            />
          ))}
        </nav>
        <div className="cue" ref={cueRef}>
          SCROLLEN
          <span />
        </div>
        <MenuOverlay />
        <SiteNav onGo={goTo} />
        <div className="demo">DEMO · KEINE ECHTE EISDIELE</div>
        <div className="rail" ref={railRef as React.RefObject<HTMLDivElement>}>
          <i />
        </div>
      </div>

      <div className={`loader ${ready ? "done" : ""}`} aria-hidden={ready}>
        <div>
          <img src={asset("/brand/eiswerk-wordmark.png")} alt="EISWERK" />
          <small>WIRD ANGERICHTET</small>
        </div>
      </div>
    </main>
  );
}

function MenuText({ className }: { className: string }) {
  return (
    <section className={className} aria-label="Speisekarte" style={className === "static-act" ? { background: "rgb(243,231,211)", color: "#4a1230" } : undefined}>
      <h2>Speisekarte</h2>
      {MENU_PAGES.map((p) => (
        <div key={p.key}>
          <h3>
            {p.title} – {p.hero}, {p.price}
          </h3>
          <p>{p.desc}</p>
          <ul>
            {p.items.map((it) => (
              <li key={it.name}>
                {it.name}: {it.price}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p>Demo, Preise sind Platzhalter.</p>
    </section>
  );
}
