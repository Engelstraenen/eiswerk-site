"use client";
import { useEffect, useState } from "react";
import { ACTS } from "@/lib/acts";

// Hauptmenü (Eugen 03.11.2026): Kunden springen direkt zu Eis, Shake, Açaí, Coffee, Manufaktur oder öffnen die Speisekarte.
const LABELS = ["Eis", "Milchshake", "Açaí", "Iced Coffee", "Manufaktur"];

export function SiteNav({ onGo }: { onGo: (i: number) => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open]);

  const go = (i: number) => {
    setOpen(false);
    onGo(i);
  };
  const menu = () => {
    setOpen(false);
    window.dispatchEvent(new Event("eiswerk:menu"));
  };

  return (
    <>
      <nav className={`sitenav ${open ? "open" : ""}`} aria-label="Hauptmenü">
        {ACTS.map((a, i) => (
          <button key={a.id} onClick={() => go(i)}>
            {LABELS[i] ?? a.name}
          </button>
        ))}
        <button className="sn-menu" onClick={menu} aria-haspopup="dialog">
          Speisekarte
        </button>
      </nav>
      <button className="sn-burger" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Menü">
        <span />
        <span />
      </button>
    </>
  );
}
