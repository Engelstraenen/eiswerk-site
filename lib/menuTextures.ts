import { asset } from "./asset";
import * as THREE from "three";
import { MENU_PAGES, type MenuPage } from "./menu";

export const PW = 896;
export const PH = 1216;
export const RING_Y = 0.53; // Anteil der Seitenhöhe (von oben): Standfläche des Gerichts im Farbfenster

const INK = "#4a1230";

function setSpacing(ctx: CanvasRenderingContext2D, px: number) {
  try {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${px}px`;
  } catch {
    /* ältere Browser */
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
  return yy;
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.28;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

function paper(ctx: CanvasRenderingContext2D, side: "left" | "right") {
  ctx.fillStyle = "#f7eddc";
  ctx.fillRect(0, 0, PW, PH);
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(120,80,40,${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * PW, Math.random() * PH, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  // Falz an der Heftmitte
  const gx = side === "left" ? PW : 0;
  const g = ctx.createLinearGradient(gx, 0, side === "left" ? PW - 110 : 110, 0);
  g.addColorStop(0, "rgba(70,35,20,.30)");
  g.addColorStop(0.35, "rgba(70,35,20,.10)");
  g.addColorStop(1, "rgba(70,35,20,0)");
  ctx.fillStyle = g;
  ctx.fillRect(side === "left" ? PW - 110 : 0, 0, 110, PH);
}

export const PANEL_TOP = 84;
export const PANEL_BOT = 800;

function bokeh(ctx: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, seed: number) {
  let r = seed;
  const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) {
    const x = x0 + rnd() * w;
    const y = y0 + rnd() * h;
    const rad = 14 + rnd() * 54;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(255,255,255,${0.1 + rnd() * 0.22})`);
    g.addColorStop(0.7, `rgba(255,255,255,${0.05 + rnd() * 0.08})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function paintPage(p: MenuPage, side: "left" | "right", fam: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = PW;
  c.height = PH;
  const ctx = c.getContext("2d")!;
  paper(ctx, side);
  const mIn = 118;
  const mOut = 70;
  const x0 = side === "left" ? mOut : mIn;
  const x1 = side === "left" ? PW - mIn : PW - mOut;
  const cx = (x0 + x1) / 2;
  ctx.textBaseline = "alphabetic";

  // Farbwelt-Fenster (wie die Videos: sattes Verlaufslicht, Bokeh, Korn)
  const rad = 34;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x0, PANEL_TOP, x1 - x0, PANEL_BOT - PANEL_TOP, [rad, rad, rad, rad]);
  ctx.clip();
  const lg = ctx.createLinearGradient(0, PANEL_TOP, 0, PANEL_BOT);
  lg.addColorStop(0, p.world[0]);
  lg.addColorStop(0.55, p.world[1]);
  lg.addColorStop(1, p.world[2]);
  ctx.fillStyle = lg;
  ctx.fillRect(x0, PANEL_TOP, x1 - x0, PANEL_BOT - PANEL_TOP);
  const glow = ctx.createRadialGradient(cx, PANEL_TOP + 330, 10, cx, PANEL_TOP + 330, 360);
  glow.addColorStop(0, "rgba(255,255,255,.55)");
  glow.addColorStop(0.5, "rgba(255,255,255,.12)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x0, PANEL_TOP, x1 - x0, PANEL_BOT - PANEL_TOP);
  bokeh(ctx, x0, PANEL_TOP, x1 - x0, PANEL_BOT - PANEL_TOP, 7 + MENU_PAGES.indexOf(p) * 13);
  for (let i = 0; i < 3500; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`;
    ctx.fillRect(x0 + Math.random() * (x1 - x0), PANEL_TOP + Math.random() * (PANEL_BOT - PANEL_TOP), 1.4, 1.4);
  }
  const vg = ctx.createLinearGradient(0, PANEL_BOT - 150, 0, PANEL_BOT);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,.28)");
  ctx.fillStyle = vg;
  ctx.fillRect(x0, PANEL_BOT - 150, x1 - x0, 150);
  ctx.restore();

  // Beschriftung im Fenster
  ctx.fillStyle = "rgba(255,246,238,.92)";
  ctx.font = `500 21px ${fam}`;
  setSpacing(ctx, 6);
  ctx.textAlign = "left";
  ctx.fillText(`${p.num}  ·  ${p.kicker.toUpperCase()}`, x0 + 36, PANEL_TOP + 58);
  setSpacing(ctx, 0);
  ctx.font = `italic 600 ${p.title.length > 14 ? 58 : 74}px ${fam}`;
  ctx.fillText(p.title, x0 + 36, PANEL_BOT - 96);
  ctx.font = `italic 400 27px ${fam}`;
  ctx.fillStyle = "rgba(255,246,238,.82)";
  ctx.fillText(p.sub, x0 + 36, PANEL_BOT - 52);

  // Gericht + Preis
  const hy = 866;
  ctx.fillStyle = INK;
  ctx.font = `italic 600 46px ${fam}`;
  ctx.textAlign = "left";
  ctx.fillText(p.hero, x0, hy);
  ctx.fillStyle = p.accent;
  ctx.font = `600 36px ${fam}`;
  ctx.textAlign = "right";
  ctx.fillText(p.price, x1, hy);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(74,18,48,.82)";
  ctx.font = `400 23px ${fam}`;
  const endY = wrap(ctx, p.desc, x0, hy + 38, x1 - x0, 31);

  // Preisliste
  let y = endY + 52;
  ctx.font = `400 23px ${fam}`;
  for (const it of p.items) {
    ctx.fillStyle = INK;
    ctx.textAlign = "left";
    ctx.fillText(it.name, x0, y);
    ctx.textAlign = "right";
    ctx.fillStyle = p.accent;
    ctx.fillText(it.price, x1, y);
    const w1 = ctx.measureText(it.price).width;
    ctx.textAlign = "left";
    const nw = ctx.measureText(it.name).width;
    ctx.fillStyle = "rgba(74,18,48,.35)";
    let dx = x0 + nw + 12;
    while (dx < x1 - w1 - 12) {
      ctx.fillRect(dx, y - 5, 2.2, 2.2);
      dx += 8;
    }
    y += 34;
  }

  // Fuß
  ctx.fillStyle = "rgba(74,18,48,.45)";
  ctx.font = `500 14px ${fam}`;
  setSpacing(ctx, 3);
  ctx.textAlign = side === "left" ? "left" : "right";
  ctx.fillText("DEMO · PREISE SIND PLATZHALTER", side === "left" ? x0 : x1, PH - 40);
  setSpacing(ctx, 0);
  ctx.font = `italic 400 22px ${fam}`;
  ctx.textAlign = side === "left" ? "right" : "left";
  ctx.fillText(String(MENU_PAGES.indexOf(p) + 2), side === "left" ? x1 : x0, PH - 38);
  return c;
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export async function paintCover(fam: string): Promise<HTMLCanvasElement> {
  const c = document.createElement("canvas");
  c.width = PW;
  c.height = PH;
  const ctx = c.getContext("2d")!;
  const bg = ctx.createLinearGradient(0, 0, PW, PH);
  bg.addColorStop(0, "#6a1c42");
  bg.addColorStop(1, "#3a0c26");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, PW, PH);
  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = `rgba(255,220,235,${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * PW, Math.random() * PH, 1.5, 1.5);
  }
  ctx.strokeStyle = "rgba(244,196,212,.55)";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(54, 54, PW - 108, PH - 108);
  ctx.lineWidth = 1;
  ctx.strokeRect(72, 72, PW - 144, PH - 144);
  // Falz links
  const g = ctx.createLinearGradient(0, 0, 90, 0);
  g.addColorStop(0, "rgba(0,0,0,.45)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 90, PH);

  const img = new Image();
  img.src = asset("/brand/eiswerk-wordmark-light.png");
  await new Promise<void>((res) => {
    img.onload = () => res();
    img.onerror = () => res();
  });
  const w = 640;
  if (img.width) ctx.drawImage(img, (PW - w) / 2, 250, w, (w * img.height) / img.width);
  ctx.fillStyle = "#f4c4d4";
  ctx.textAlign = "center";
  ctx.font = `italic 400 40px ${fam}`;
  ctx.fillText("Eis wie ein Kunstwerk.", PW / 2, 420);

  ctx.fillStyle = "#fbeee4";
  ctx.font = `italic 600 138px ${fam}`;
  ctx.fillText("Speise-", PW / 2, 660);
  ctx.fillText("karte", PW / 2, 790);

  ctx.fillStyle = "#f4c4d4";
  ctx.font = `500 20px ${fam}`;
  setSpacing(ctx, 7);
  ctx.fillText("ALLES FRISCH · ALLES HAUSGEMACHT", PW / 2, 900);
  setSpacing(ctx, 0);
  ["#f4c4d4", "#ead2bd", "#c3a1f2", "#e3b06e"].forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(PW / 2 - 90 + i * 60, 980, 14, 0, Math.PI * 2);
    ctx.fill();
  });
  return c;
}

export async function loadMenuTextures(maxAniso: number): Promise<THREE.Texture[]> {
  const fam = getComputedStyle(document.body).fontFamily || "Didot, Georgia, serif";
  try {
    await Promise.all(
      ["400", "500", "600"].flatMap((w) => [document.fonts.load(`${w} 30px ${fam}`), document.fonts.load(`italic ${w} 30px ${fam}`)])
    );
  } catch {
    /* Schrift-Fallback */
  }
  const canvases: HTMLCanvasElement[] = [await paintCover(fam)];
  MENU_PAGES.forEach((p, i) => canvases.push(paintPage(p, i % 2 === 0 ? "left" : "right", fam)));
  return canvases.map((cv) => {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, maxAniso);
    t.generateMipmaps = true;
    return t;
  });
}
