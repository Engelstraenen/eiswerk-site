"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { interReg, type InterId } from "@/lib/segments";
import { sceneState } from "@/lib/state";
import { MENU_CATS } from "@/lib/dishes";
import { asset } from "@/lib/asset";

const IMG = (n: string) => `/interlude/${n}.jpg`;

function useScrub(id: InterId, build: (root: HTMLDivElement) => gsap.core.Timeline) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current!;
    let tl: gsap.core.Timeline;
    const ctx = gsap.context(() => {
      tl = build(root);
      tl.pause(0);
    }, root);
    interReg[id] = (p: number) => tl.progress(Math.min(1, Math.max(0, p)));
    return () => {
      delete interReg[id];
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

/* 1 · Showcases: große Gerichte in der Mitte, je Produkt anderer Einflug-Stil */
type Dish = { img: string; name: string; sub: string; c1: string; c2: string; todo?: boolean };
type Mode = "ltr" | "rtl" | "drop" | "rise" | "diag";
type ShowDef = { ghost: string; kicker: string; head: string; facts: [string, string][]; mode: Mode; items: Dish[]; orb: [string, string, string] };

const SHOWS: Record<string, ShowDef> = {
  "show-eis": {
    ghost: "EIS · EIS · EIS · EIS",
    kicker: "Eiskreationen",
    head: "Eis, das man sieht, bevor man es schmeckt.",
    facts: [["24", "Sorten im Wechsel"], ["0", "Konzentrate"], ["100 %", "hausgemacht"]],
    mode: "ltr",
    orb: ["#ff6fa8", "#9a6bff", "#ffb86b"],
    items: [
      { img: "f1", name: "Coupe Royal", sub: "Pistazie · Himbeere · Blattgold", c1: "#ff8fb8", c2: "#6d1743" },
      { img: "f2", name: "Waffel-Traum", sub: "Erdbeere · Macarons", c1: "#ffb0c8", c2: "#7d1a4c" },
      { img: "f3", name: "Schoko-Pistazie", sub: "dunkle Schokolade · Salz", c1: "#e79bbd", c2: "#4a1236" },
      { img: "f6", name: "Banana Split", sub: "drei Kugeln · Karamell", c1: "#ff8fb8", c2: "#5e163f" },
      { img: "f8", name: "Cookie-Sandwich", sub: "Vanille · Streusel", c1: "#f6a9c4", c2: "#6a1c42" },
      { img: "f9", name: "Eistorte", sub: "Beeren · Biskuit", c1: "#ff9ec1", c2: "#7d1a4c" },
      { img: "e1", name: "Regenbogen-Waffelbowl", sub: "sechs Kugeln · Zuckerfunken", c1: "#ff9ec1", c2: "#5a1740", todo: true },
      { img: "e2", name: "Jar-Cake", sub: "Vanille · Erdbeere · Oreo", c1: "#ffb0c8", c2: "#6a1c42", todo: true },
      { img: "e3", name: "Macaron-Trio", sub: "Rosa · Pistazie · Zitrone", c1: "#f6a9c4", c2: "#6d1743" },
      { img: "e4", name: "Shortcake-Becher", sub: "Erdbeere · Sahnewolken", c1: "#ff8fb8", c2: "#7d1a4c" },
      { img: "f10", name: "Mango-Parfait", sub: "Passionsfrucht · Pistazie", c1: "#ffb86b", c2: "#6a1c42" },
    ],
  },
  "show-shake": {
    ghost: "SHAKE · SHAKE · SHAKE",
    kicker: "Milchshakes",
    head: "So dicht, dass der Löffel stehen bleibt.",
    facts: [["7", "Toppings pro Glas"], ["400", "ml pures Glück"], ["0", "Kompromisse"]],
    mode: "rtl",
    orb: ["#d89a6b", "#ff8fb8", "#ffcf8a"],
    items: [
      { img: "f7", name: "Donut-Freakshake", sub: "Macarons · Schoko-Drip", c1: "#e0a47c", c2: "#43200f" },
      { img: "s1", name: "Einhorn-Shake", sub: "Zuckerwatte · Glitzer", c1: "#ff9ec1", c2: "#4a1d3c" },
      { img: "s2", name: "Cookies & Cream", sub: "Keks-Rand · Sahneturm", c1: "#c99872", c2: "#2f170a" },
      { img: "s3", name: "Salted Caramel Pop", sub: "Popcorn · Brezel", c1: "#e9b46c", c2: "#3b210c" },
      { img: "s4", name: "Cheesecake-Shake", sub: "Erdbeere · Graham", c1: "#ffb0c8", c2: "#5a1a3a" },
      { img: "s5", name: "Pistazie & Schoko", sub: "Cannoli · Gold", c1: "#b9d98f", c2: "#2f2a10" },
      { img: "s6", name: "Brownie-Mocha", sub: "Brownie · Schoko-Drip", c1: "#c99872", c2: "#2f170a" },
      { img: "s7", name: "Drachenfrucht-Shake", sub: "Erdbeere · Blüten", c1: "#ff9ec1", c2: "#4a1d3c" },
      { img: "s8", name: "Cookie-Dough", sub: "Karamell · Streusel", c1: "#e0a47c", c2: "#43200f" },
    ],
  },
  "show-acai": {
    ghost: "AÇAÍ · AÇAÍ · AÇAÍ",
    kicker: "Açaí-Bowls",
    head: "Bowls wie Gemälde. Jede ein Unikat.",
    facts: [["5", "Superfrüchte"], ["0", "Zuckerzusatz"], ["100 %", "Amazonas-Pulp"]],
    mode: "rise",
    orb: ["#9a6bff", "#ff6fc0", "#6bd0ff"],
    items: [
      { img: "f4", name: "Pitaya-Bowl", sub: "Orchideen · Kokos", c1: "#ff7ac0", c2: "#3a0f4a" },
      { img: "acai", name: "Klassik-Bowl", sub: "Beeren · Granola", c1: "#c3a1f2", c2: "#26103f" },
      { img: "a1", name: "Ananas-Bowl", sub: "Drachenfrucht · Honig", c1: "#c3a1f2", c2: "#26103f" },
      { img: "a2", name: "Regenbogen-Bowl", sub: "gelegt, nicht gestreut", c1: "#a67be0", c2: "#1f0d3a" },
      { img: "a3", name: "Erdnuss & Kakao", sub: "Banane · Granola", c1: "#b08ae6", c2: "#2a0f3e" },
      { img: "a4", name: "Kokosnuss-Bowl", sub: "Feige · Granatapfel", c1: "#c9a6f7", c2: "#24104a" },
      { img: "a5", name: "Bananenboot", sub: "Açaí · Honig · Granola", c1: "#c3a1f2", c2: "#26103f" },
      { img: "a6", name: "Sternfrucht-Bowl", sub: "Goji · Blüten", c1: "#b08ae6", c2: "#2a0f3e" },
      { img: "a7", name: "Herz-Bowl", sub: "Beeren · Mandelmus", c1: "#c9a6f7", c2: "#24104a" },
    ],
  },
  "show-coffee": {
    ghost: "COFFEE · COFFEE",
    kicker: "Iced Coffee",
    head: "Kalt gebrüht. Heiß begehrt.",
    facts: [["18", "Stunden Cold Brew"], ["2", "Espresso-Shots"], ["1", "Krone aus Sahne"]],
    mode: "diag",
    orb: ["#e9b46c", "#ff8f5a", "#c98238"],
    items: [
      { img: "f5", name: "Affogato Royal", sub: "Vanille · Espresso · Gold", c1: "#e9b46c", c2: "#3b210c" },
      { img: "coffee", name: "Karamell-Crunch", sub: "Iced Coffee", c1: "#f0c27a", c2: "#42250c" },
      { img: "c1", name: "Caramel Macchiato", sub: "Keks-Rand · Karamell", c1: "#e6b878", c2: "#42250c" },
      { img: "c2", name: "Tiramisu Cold Brew", sub: "Mascarpone · Kakao", c1: "#d6a066", c2: "#2f1a0a" },
      { img: "c3", name: "Mocha Frappé", sub: "Schoko · Sahne", c1: "#c98a5a", c2: "#35200f" },
      { img: "c4", name: "Coffee Float", sub: "Vanilleeis · Wafer", c1: "#f0c27a", c2: "#42250c" },
      { img: "c5", name: "Vanilla Cold Foam", sub: "Karamell · Biscotti", c1: "#f0c27a", c2: "#42250c" },
      { img: "c6", name: "Coffee-Eis-Latte", sub: "Kakao · Bohnen", c1: "#d6a066", c2: "#2f1a0a" },
      { img: "c7", name: "Matcha & Espresso", sub: "Eiswürfel · Sahnewirbel", c1: "#b9d98f", c2: "#2f2a10" },
      { img: "c8", name: "Salted Caramel Brew", sub: "Zimt · Karamell", c1: "#e6b878", c2: "#42250c" },
    ],
  },
};

const bounceOut = (t: number) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const backOut = (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);

function Showcase({ id }: { id: InterId }) {
  const base = SHOWS[id];
  const def = { ...base, items: base.items.filter((d) => !d.todo) };
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current!;
    const items = [...root.querySelectorAll<HTMLElement>(".bt-item")];
    const names = [...root.querySelectorAll<HTMLElement>(".bt-name")];
    const bgA = root.querySelector<HTMLElement>(".bt-bg")!;
    const ghost = root.querySelector<HTMLElement>(".bt-ghost")!;
    const blobs = [...root.querySelectorAll<HTMLElement>(".blob")];
    const dots = [...root.querySelectorAll<HTMLElement>(".bokeh i")];
    const head = root.querySelector<HTMLElement>(".bt-head")!;
    const N = items.length;
    let skew = 0;
    let lastP = 0;
    const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const upd = (p: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      skew += (Math.max(-12, Math.min(12, sceneState.vel * 0.06)) - skew) * 0.12;
      let best = 0;
      let bestD = 9;
      items.forEach((el, i) => {
        let tx = 0;
        let ty = 0;
        let sc = 1;
        let rot = 0;
        let rotY = 0;
        let op = 1;
        let blur = 0;
        let near = 1;
        if (def.mode === "ltr" || def.mode === "rtl") {
          const gap = Math.max(vw * 0.46, 380);
          const total = gap * N;
          let x = -total + (total + vw * 1.1) * p + gap * (i + 0.5);
          if (def.mode === "rtl") x = vw - x - (el.offsetWidth || 0);
          const d = (x - vw / 2) / (vw * 0.55);
          const ad = Math.abs(d);
          near = ad;
          tx = x;
          ty = (-ad * 4 - Math.cos(d * 2.2) * 2) * (vh / 100);
          sc = 0.62 + 0.62 * Math.max(0, 1 - ad * 0.85);
          rot = d * 9;
          op = Math.max(0, 1 - Math.max(0, ad - 0.95) * 4);
          blur = ad > 0.55 ? (ad - 0.55) * 6 : 0;
        } else {
          // sequenziell: pos -1 (kommt) … 0 (Mitte, kurz gehalten) … 1 (geht)
          let k = p * (N + 1) - 1 - i;
          const hold = 0.16;
          k = Math.sign(k) * Math.max(0, Math.abs(k) - hold) / (1 - hold);
          const ak = Math.abs(k);
          near = ak;
          const vis = ak < 1 ? 1 : 0;
          op = vis;
          const cx = vw / 2 - (el.offsetWidth || 0) / 2;
          tx = cx;
          if (def.mode === "drop") {
            if (k < 0) {
              const t = bounceOut(1 + k);
              ty = -(1 - t) * vh * 1.1;
              rot = (1 - t) * (i % 2 ? 16 : -16);
              sc = 0.9 + 0.2 * t;
            } else {
              ty = easeOut(k) * vh * 0.9;
              tx = cx + easeOut(k) * vw * 0.55 * (i % 2 ? -1 : 1);
              rot = k * (i % 2 ? -28 : 28);
              sc = 1.1 - 0.3 * k;
              op = 1 - k * k;
            }
          } else if (def.mode === "rise") {
            if (k < 0) {
              const t = backOut(1 + k);
              ty = (1 - Math.min(1, t)) * vh * 0.85;
              rotY = (1 + k < 1 ? (-k) * 80 : 0) * (i % 2 ? -1 : 1);
              sc = 0.45 + 0.65 * Math.min(1.05, t);
              op = Math.min(1, (1 + k) * 2.4);
            } else {
              sc = 1.1 + k * 1.4;
              ty = -k * vh * 0.18;
              op = 1 - k * k * 1.1;
              blur = k * 14;
              rotY = k * 25 * (i % 2 ? -1 : 1);
            }
          } else {
            // diag: von rechts oben nach links unten
            if (k < 0) {
              const t = easeOut(1 + k);
              tx = cx + (1 - t) * vw * 0.85;
              ty = -(1 - t) * vh * 0.55;
              rot = (1 - t) * -26;
              sc = 0.7 + 0.4 * t;
              blur = (1 - t) * 8;
            } else {
              tx = cx - easeOut(k) * vw * 0.9;
              ty = easeOut(k) * vh * 0.5;
              rot = k * 24;
              sc = 1.1 - 0.4 * k;
              blur = k * 8;
            }
          }
          op = Math.max(0, Math.min(1, op));
        }
        if (near < bestD) {
          bestD = near;
          best = i;
        }
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0) perspective(900px) rotateY(${rotY}deg) scale(${sc}) rotate(${rot}deg) skewX(${-skew}deg)`;
        el.style.opacity = String(op);
        el.style.zIndex = String(100 - Math.round(near * 50));
        el.style.filter = blur > 0.3 ? `blur(${blur}px)` : "none";
      });
      names.forEach((el, i) => {
        let o = 0;
        let off = 0;
        if (def.mode === "ltr" || def.mode === "rtl") {
          const gap = Math.max(vw * 0.46, 380);
          const total = gap * N;
          let x = -total + (total + vw * 1.1) * p + gap * (i + 0.5);
          if (def.mode === "rtl") x = vw - x - (items[i].offsetWidth || 0);
          const d = (x - vw / 2) / (vw * 0.55);
          o = Math.max(0, 1 - Math.abs(d) * 3.2);
          off = -d * 160;
        } else {
          let k = p * (N + 1) - 1 - i;
          const hold = 0.16;
          k = Math.sign(k) * Math.max(0, Math.abs(k) - hold) / (1 - hold);
          o = Math.max(0, 1 - Math.abs(k) * 2.4);
          off = k * 120;
        }
        el.style.opacity = String(o);
        el.style.transform = `translate3d(${off}px, 0, 0) scale(${0.92 + o * 0.08})`;
      });
      const cur = def.items[best];
      const c1 = hex(cur.c1);
      const c2 = hex(cur.c2);
      bgA.style.background = `radial-gradient(ellipse at 50% 55%, rgba(${c1.join(",")},.55) 0%, rgba(${c2.join(",")},.95) 62%, rgb(${c2.map((v) => Math.round(v * 0.55)).join(",")}) 100%)`;
      const gdir = def.mode === "diag" || def.mode === "rtl" ? 1 : -1;
      ghost.style.transform = `translate3d(${(gdir * -p * 0.6 + 0.1) * vw * 2.6}px, -50%, 0)`;
      blobs.forEach((b, i) => {
        b.style.transform = `translate3d(${Math.sin(p * 5 + i * 1.7) * 18}vw, ${Math.cos(p * 4 + i * 2.1) * 14}vh, 0) scale(${1 + Math.sin(p * 6 + i) * 0.15})`;
      });
      dots.forEach((d, i) => {
        const sp = 0.4 + (i % 5) * 0.28;
        d.style.transform = `translate3d(0, ${-((p * sp * vh * 1.6) % (vh * 1.2))}px, 0)`;
      });
      head.style.opacity = String(Math.min(1, p * 12) * Math.min(1, (1 - p) * 12));
      lastP = p;
    };
    interReg[id] = upd;
    upd(lastP);
    const tick = () => upd(lastP);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      delete interReg[id];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div ref={ref} className={`il il-belt mode-${def.mode}`}>
      <div className="bt-bg" />
      <div className="blob b1" style={{ background: def.orb[0] }} />
      <div className="blob b2" style={{ background: def.orb[1] }} />
      <div className="blob b3" style={{ background: def.orb[2] }} />
      <div className="bt-ghost">{def.ghost}</div>
      <div className="bokeh">{Array.from({ length: 22 }).map((_, i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${20 + ((i * 53) % 90)}%`, width: 10 + ((i * 17) % 46), height: 10 + ((i * 17) % 46) }} />
      ))}</div>
      <div className="bt-head">
        <p className="il-k">{def.kicker}</p>
        <h2>{def.head}</h2>
      </div>
      {def.items.map((d) => (
        <div className="bt-name" key={d.name}>
          <span>{d.name}</span>
          <small>{d.sub}</small>
        </div>
      ))}
      {def.items.map((d) => (
        <div className="bt-item" key={d.img}>
          <img src={asset(`/menu/${d.img}.webp`)} alt={d.name} decoding="async" />
        </div>
      ))}
      <div className="bt-facts">
        {def.facts.map(([n, t]) => (
          <span key={t}><b>{n}</b> {t}</span>
        ))}
      </div>
      <div className="il-grain" />
    </div>
  );
}

/* 2 · Prozess */
const STEPS = [
  { t: "Milch & Sahne", d: "Frische Vollmilch und Sahne vom Hof, jeden Morgen geliefert.", img: "p1", tick: "Milch" },
  { t: "Frucht", d: "Reife Früchte werden püriert, ohne Konzentrat, ohne Aroma.", img: "p2", tick: "Frucht" },
  { t: "Pasteurisieren & Reifen", d: "Langsam auf 85 °C erhitzt, dann vier Stunden gekühlt: das macht es cremig.", img: "p3", tick: "Reifen" },
  { t: "Rühren & Frieren", d: "Im Kessel entstehen feine Eiskristalle, die Masse wird samtig.", img: "p4", tick: "Rühren" },
  { t: "Die Kugel", d: "Bei −18 °C wird das Eis fest und bekommt seine Form.", img: "p5", tick: "Kugel" },
];

function Process() {
  const ref = useScrub("process", (r) => {
    const q = gsap.utils.selector(r);
    const layer = r.parentElement!;
    const tl = gsap.timeline({ defaults: { ease: "none" } });
    const T = { v: 4 };
    const mix = (a: number[], b: number[], k: number) => a.map((x, i) => Math.round(x + (b[i] - x) * k));
    const setTemp = () => {
      const v = Math.round(T.v);
      const el = r.querySelector(".pr-temp span");
      if (el) el.innerHTML = v < 0 ? `<u class="mn"></u>${Math.abs(v)}` : String(v);
      const base = [46, 14, 26];
      const hot = [84, 18, 24];
      const cold = [12, 28, 48];
      const c = T.v >= 4 ? mix(base, hot, Math.min(1, (T.v - 4) / 81)) : mix(base, cold, Math.min(1, (4 - T.v) / 22));
      layer.style.background = `rgb(${c.join(",")})`;
    };
    tl.to(T, { v: 4, duration: 0.2 }, 0);
    tl.to(T, { v: 85, duration: 0.2, onUpdate: setTemp }, 0.2);
    tl.to(T, { v: 4, duration: 0.2, onUpdate: setTemp }, 0.4);
    tl.to(T, { v: -8, duration: 0.2, onUpdate: setTemp }, 0.6);
    tl.to(T, { v: -18, duration: 0.18, onUpdate: setTemp }, 0.8);
    tl.fromTo(q(".pr-line i"), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
    tl.fromTo(q(".il-k"), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0);
    q(".pr-step").forEach((el: Element, i: number) => {
      const a = i * 0.2;
      tl.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.05, ease: "power3.out" }, a + (i === 0 ? 0 : 0.015));
      if (i < 4) tl.to(el, { opacity: 0, y: -22, duration: 0.04, ease: "power2.in" }, a + 0.16);
    });
    q(".pr-bg img").forEach((el: Element, i: number) => {
      const a = i * 0.2;
      tl.fromTo(el, { scale: 1.35 }, { scale: 1.1, duration: 0.2 }, a);
      tl.fromTo(el, { opacity: i === 0 ? 1 : 0 }, { opacity: 1, duration: 0.06 }, a);
    });
    q(".pr-frame img").forEach((el: Element, i: number) => {
      const a = i * 0.2;
      tl.fromTo(el, { scale: 1.16 }, { scale: 1, duration: 0.2 }, a);
      tl.fromTo(el, { opacity: i === 0 ? 1 : 0 }, { opacity: 1, duration: 0.05 }, a);
    });
    tl.fromTo(q(".pr-frame"), { yPercent: 3 }, { yPercent: -3, duration: 1 }, 0);
    return tl;
  });
  return (
    <div ref={ref} className="il il-proc">
      <div className="pr-bg">
        {STEPS.map((s) => (
          <img key={s.img} src={IMG(s.img)} alt="" />
        ))}
      </div>
      <div className="il-glow" />
      <div className="pr">
        <div className="pr-l">
          <p className="il-k">So entsteht EISWERK-Eis</p>
          {STEPS.map((s, i) => (
            <div className="pr-step" key={s.t}>
              <div className="pr-num">0{i + 1}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
          <div className="pr-gauge">
            <div className="pr-temp"><span>4</span><i>°C</i></div>
            <div className="pr-line"><i /></div>
            <div className="pr-ticks">
              {STEPS.map((s) => (
                <span key={s.tick}>{s.tick}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="pr-r">
          <div className="pr-out" />
          <div className="pr-frame">
            {STEPS.map((s) => (
              <img key={s.img} src={IMG(s.img)} alt={s.t} decoding="async" />
            ))}
          </div>
        </div>
      </div>
      <div className="il-grain" />
    </div>
  );
}

/* 3 · Manifest */
const LINES: [string, string, string, boolean, string][] = [
  ["Hausgemacht.", "jede Charge, jeden Morgen", "f2", false, "linear-gradient(135deg,#ffb0c8,#7d1a4c)"],
  ["Handgerührt.", "keine Maschine, die Eile hat", "f5", true, "linear-gradient(135deg,#e6b878,#3b210c)"],
  ["Handverlesen.", "Frucht, die man schmeckt", "f4", false, "linear-gradient(135deg,#ff7ac0,#4a0f3a)"],
];

function Manifest() {
  const ref = useScrub("manifest", (r) => {
    const q = gsap.utils.selector(r);
    const tl = gsap.timeline({ defaults: { ease: "none" } });
    tl.fromTo(q(".sw"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6 }, 0);
    q(".mf-block").forEach((el: Element, i: number) => {
      const a = 0.05 + i * 0.26;
      tl.fromTo(el.querySelector(".mf-w"), { yPercent: 110, skewY: 4 }, { yPercent: 0, skewY: 0, duration: 0.13, ease: "expo.out" }, a);
      tl.fromTo(el.querySelector(".mf-pill"), { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, transformOrigin: "0 50%", duration: 0.14, ease: "power3.inOut" }, a + 0.03);
      tl.fromTo(el.querySelector(".mf-pill img"), { yPercent: 60, scale: 0.6, rotate: -12 }, { yPercent: 0, scale: 1, rotate: 0, duration: 0.2, ease: "back.out(1.5)" }, a + 0.06);
      tl.fromTo(el.querySelector(".mf-s"), { opacity: 0, x: -14 }, { opacity: 0.85, x: 0, duration: 0.07, ease: "power2.out" }, a + 0.1);
    });
    tl.fromTo(q(".mf-foot"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.1, ease: "power3.out" }, 0.84);
    return tl;
  });
  return (
    <div ref={ref} className="il il-mf">
      <div className="il-glow" />
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path className="sw" pathLength={1} strokeDasharray="1" d="M-200 820 C 200 520, 360 900, 720 700 S 1180 420, 1700 640" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity=".55" />
        <path className="sw" pathLength={1} strokeDasharray="1" d="M-200 90 C 260 300, 520 -80, 900 160 S 1300 340, 1700 120" fill="none" stroke="#fff" strokeWidth="1" opacity=".25" />
      </svg>
      <div className="mf">
        {LINES.map(([w, s, img, flip, grad]) => (
          <div className="mf-block" key={w}>
            <p className="mf-s">{s}</p>
            <div className="mf-line" style={{ flexDirection: flip ? "row-reverse" : "row", justifyContent: flip ? "flex-end" : "flex-start" }}>
              <h2 className="mf-w">{w}</h2>
              <div className="mf-pill" style={{ background: grad }}><img src={asset(`/menu/${img}.webp`)} alt="" decoding="async" /></div>
            </div>
          </div>
        ))}
        <p className="mf-foot">Das schmeckt man. Seit dem ersten Löffel.</p>
      </div>
      <div className="il-grain" />
    </div>
  );
}

/* 4 · Finale = Die Karte: große Typo-Liste, Hover/Scroll wechselt das Gericht, Klick öffnet die Kategorie */
function Finale() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current!;
    const rows = [...root.querySelectorAll<HTMLElement>(".kf-row")];
    const stages = [...root.querySelectorAll<HTMLElement>(".kf-st")];
    const head = root.querySelector<HTMLElement>(".kf-head")!;
    const cta = root.querySelector<HTMLElement>(".kf-cta")!;
    const bg = root.querySelector<HTMLElement>(".kf-bg")!;
    let hover = -1;
    let active = -1;
    let lastP = 0;
    const setActive = (i: number) => {
      if (i === active) return;
      active = i;
      rows.forEach((r, k) => r.classList.toggle("on", k === i));
      stages.forEach((st, k) => st.classList.toggle("on", k === i));
      const w = MENU_CATS[i].w;
      bg.style.background = `radial-gradient(ellipse at 72% 50%, ${w[1]}55 0%, transparent 60%), radial-gradient(ellipse at 10% 90%, ${w[2]}88 0%, transparent 55%), #1a0612`;
    };
    const enter = rows.map((_, i) => () => {
      hover = i;
      setActive(i);
    });
    const leave = () => (hover = -1);
    rows.forEach((r, i) => {
      r.addEventListener("pointerenter", enter[i]);
      r.addEventListener("pointerleave", leave);
    });
    const upd = (p: number) => {
      lastP = p;
      const n = rows.length;
      rows.forEach((r, i) => {
        const a = 0.04 + i * 0.07;
        const t = Math.max(0, Math.min(1, (p - a) / 0.16));
        r.style.opacity = String(t);
        r.style.transform = `translate3d(${(1 - t) * -70}px, ${(1 - t) * 26}px, 0)`;
      });
      const hs = Math.min(1, p * 8);
      head.style.opacity = String(hs);
      const co = Math.max(0, Math.min(1, (p - 0.45) / 0.15));
      cta.style.opacity = String(co);
      cta.style.pointerEvents = co > 0.5 ? "auto" : "none";
      if (hover < 0) setActive(Math.min(n - 1, Math.floor(Math.max(0, p - 0.1) * (n / 0.72))));
    };
    interReg["finale"] = upd;
    upd(0);
    return () => {
      delete interReg["finale"];
      rows.forEach((r, i) => {
        r.removeEventListener("pointerenter", enter[i]);
        r.removeEventListener("pointerleave", leave);
      });
      void lastP;
    };
  }, []);
  const open = (id?: string) => window.dispatchEvent(new CustomEvent("eiswerk:menu", { detail: { cat: id } }));
  return (
    <div ref={ref} className="il il-kf">
      <div className="kf-bg" />
      <div className="il-grain" />
      <div className="kf-head">
        <p className="il-k">Die Karte</p>
      </div>
      <ul className="kf-list">
        {MENU_CATS.map((c) => (
          <li key={c.id}>
            <button className="kf-row" onClick={() => open(c.id)} aria-label={`${c.title} in der Speisekarte öffnen`}>
              <em>{c.num}</em>
              <strong>{c.title}</strong>
              <span>{c.dishes.filter((d) => !d.todo).length} Kreationen</span>
              <i aria-hidden>→</i>
            </button>
          </li>
        ))}
      </ul>
      <div className="kf-stage" aria-hidden>
        {MENU_CATS.map((c) => {
          const ds = c.dishes.filter((d) => !d.todo).slice(0, 3);
          return (
            <div className="kf-st" key={c.id}>
              {ds.map((d, k) => (
                <img key={d.img} className={`kf-img k${k}`} src={asset(`/menu/${d.img}.webp`)} alt="" decoding="async" draggable={false} />
              ))}
              <p>{c.tagline}</p>
            </div>
          );
        })}
      </div>
      <div className="kf-cta">
        <button onClick={() => open()}>Ganze Speisekarte öffnen</button>
        <span>Demo · Preise sind Platzhalter</span>
      </div>
    </div>
  );
}

/* 3 · Die Eisdiele: Vollbild-Szenen (Außen/Innen), Ken-Burns + Textwechsel */
const SCENES = [
  { img: "parlor-a", k: "Außen", t: "Hier fängt es an.", d: "Rosa Terrazzo, Messing und ein Fenster, hinter dem schon die Vitrine leuchtet." },
  { img: "parlor-b", k: "Innen · Die Theke", t: "24 Sorten, jede Charge frisch.", d: "Täglich frisch gerührt, in der Vitrine zum Greifen nah." },
  { img: "parlor-c", k: "Die Vitrine", t: "Jede Sorte mit dem, was dazugehört.", d: "Pistazie mit Pistazien, Erdbeere mit Erdbeeren, Schoko mit Schokosplittern: so sieht man, was drin ist." },
  { img: "parlor-d", k: "Innen · Sitzen", t: "Bleib ein Weilchen.", d: "Samt, Marmor und warmes Licht für die schönste Pause des Tages." },
];

function Parlor() {
  const ref = useScrub("parlor", (r) => {
    const q = gsap.utils.selector(r);
    const tl = gsap.timeline({ defaults: { ease: "none" } });
    const n = SCENES.length;
    q(".pa-img").forEach((el: Element, i: number) => {
      const a = i / n;
      tl.fromTo(el, { scale: 1.22 }, { scale: 1.02, duration: 1 / n + 0.12 }, Math.max(0, a - 0.06));
      tl.fromTo(el, { opacity: i === 0 ? 1 : 0 }, { opacity: 1, duration: 0.07 }, a - 0.02 < 0 ? 0 : a - 0.02);
    });
    q(".pa-txt").forEach((el: Element, i: number) => {
      const a = i / n;
      tl.fromTo(el, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.06, ease: "power3.out" }, a + 0.02);
      if (i < n - 1) tl.to(el, { opacity: 0, y: -26, duration: 0.05, ease: "power2.in" }, a + 1 / n - 0.07);
    });
    tl.fromTo(q(".pa-bar i"), { scaleX: 0 }, { scaleX: 1, duration: 1, transformOrigin: "0 50%" }, 0);
    return tl;
  });
  return (
    <div ref={ref} className="il il-par">
      {SCENES.map((s) => (
        <img key={s.img} className="pa-img" src={`/interlude/${s.img}.jpg`} alt={s.k} decoding="async" />
      ))}
      <div className="pa-shade" />
      <div className="pa-lead"><p className="il-k">Die Eisdiele</p></div>
      {SCENES.map((s, i) => (
        <div className="pa-txt" key={s.t}>
          <em>0{i + 1} / 0{SCENES.length} · {s.k}</em>
          <h3>{s.t}</h3>
          <p>{s.d}</p>
        </div>
      ))}
      <div className="pa-bar"><i /></div>
      <div className="il-grain" />
    </div>
  );
}

export function Interlude({ id }: { id: InterId }) {
  if (id === "parlor") return <Parlor />;
  if (id === "finale") return <Finale />;
  if (id === "process") return <Process />;
  if (id === "manifest") return <Manifest />;
  return <Showcase id={id} />;
}
