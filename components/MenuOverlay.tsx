"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MENU_CATS, type MenuCat } from "@/lib/dishes";
import { asset } from "@/lib/asset";

export function MenuOverlay() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const h = (e: Event) => {
      const cat = (e as CustomEvent<{ cat?: string }>).detail?.cat;
      setOpen(true);
      if (cat) setTimeout(() => scroller.current?.querySelector(`#mo-${cat}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 700);
    };
    window.addEventListener("eiswerk:menu", h);
    return () => window.removeEventListener("eiswerk:menu", h);
  }, []);

  useEffect(() => {
    const el = wrap.current!;
    if (first.current) {
      first.current = false;
      return;
    }
    gsap.killTweensOf(el);
    if (open) {
      el.style.visibility = "visible";
      gsap.fromTo(el, { clipPath: "circle(0% at 50% 4%)" }, { clipPath: "circle(150% at 50% 4%)", duration: 1.1, ease: "power3.inOut" });
      const io = new IntersectionObserver(
        (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); e.target.setAttribute("data-in", "1"); } }),
        { root: scroller.current, threshold: 0.15 }
      );
      el.querySelectorAll(".mo-card, .mo-ch, .mc-h, .mc-row").forEach((n) => io.observe(n));
      scroller.current?.scrollTo(0, 0);
      const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", key);
      return () => {
        io.disconnect();
        window.removeEventListener("keydown", key);
      };
    }
    gsap.to(el, {
      clipPath: "circle(0% at 50% 4%)",
      duration: 0.7,
      ease: "power3.inOut",
      onComplete: () => {
        el.style.visibility = "hidden";
        el.querySelectorAll(".mo-card, .mo-ch, .mc-h, .mc-row").forEach((n) => { n.classList.remove("in"); n.removeAttribute("data-in"); });
      },
    });
  }, [open]);

  return (
    <>
      <div ref={wrap} className="mo" role="dialog" aria-modal="true" aria-label="Speisekarte" style={{ visibility: "hidden", clipPath: "circle(0% at 50% 4%)" }}>
        <div className="mo-glow" />
        <header className="mo-head">
          <img src={asset("/brand/eiswerk-wordmark.png")} alt="EISWERK" />
          <nav className="mo-tabs" aria-label="Kategorien">
            {MENU_CATS.map((c) => (
              <button key={c.id} onClick={() => scroller.current?.querySelector(`#mo-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                <em>{c.num}</em> {c.title}
              </button>
            ))}
          </nav>
          <button className="mo-close" onClick={() => setOpen(false)} aria-label="Speisekarte schließen">Schließen <span>×</span></button>
        </header>
        <div className="mo-scroll" ref={scroller} data-lenis-prevent>
          <div className="mo-intro">
            <p>Die Karte</p>
            <h2>Alles frisch.<br /><em>Alles hausgemacht.</em></h2>
          </div>
          {MENU_CATS.map((c) => (
            <MenuCat key={c.id} cat={c} />
          ))}
          <footer className="mo-foot">DEMO · KEINE ECHTE EISDIELE · PREISE SIND PLATZHALTER</footer>
        </div>
      </div>
    </>
  );
}

// Variante A (Eugen 03.11.2026): Editorial-Karte, Zeilenliste mit Preis, großes Gericht im Bogen links (wechselt mit der aktiven Zeile)
function MenuCat({ cat }: { cat: MenuCat }) {
  const dishes = cat.dishes.filter((d) => !d.todo);
  const [act, setAct] = useState(0);
  const words = cat.tagline.replace(/\.$/, "").split(" ");
  const last = words.pop();
  return (
    <section id={`mo-${cat.id}`} className="mc mo-cat" style={{ ["--w1" as string]: cat.w[0], ["--w2" as string]: cat.w[1], ["--w3" as string]: cat.w[2] }}>
      <header className="mc-h">
        <p>{cat.num} · {cat.title}</p>
        <h3>{words.join(" ")} <em>{last}.</em></h3>
      </header>
      <div className="mc-body">
        <div className="mc-hero" aria-hidden>
          {dishes.map((d, i) => (
            <img key={d.img} src={asset(`/menu/${d.img}.webp`)} alt="" loading="lazy" decoding="async" className={i === act ? "on" : ""} />
          ))}
          <span className="mc-no">{String(act + 1).padStart(2, "0")}</span>
        </div>
        <ul className="mc-list">
          {dishes.map((d, i) => (
            <li key={d.img} className={`mc-row ${i === act ? "on" : ""}`} onPointerEnter={() => setAct(i)} onFocus={() => setAct(i)} onClick={() => setAct(i)} tabIndex={0} style={{ ["--d" as string]: `${(i % 6) * 0.06}s` }}>
              <img className="mc-th" src={asset(`/menu/${d.img}.webp`)} alt={d.name} loading="lazy" decoding="async" />
              <div>
                <h4>{d.name}{d.tag && <small>{d.tag}</small>}</h4>
                <p>{d.sub}</p>
                {d.desc && <p className="mc-desc">{d.desc}</p>}
              </div>
              <b>{d.price}</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
