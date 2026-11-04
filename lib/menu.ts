import { asset } from "./asset";
export type MenuItem = { name: string; price: string };
export type MenuPage = {
  key: string;
  num: string;
  kicker: string;
  title: string;
  sub: string;
  hero: string;
  price: string;
  desc: string;
  items: MenuItem[];
  accent: string;
  world: [string, string, string];
  photo: string;
  dish: "cone" | "eis" | "shake" | "acai" | "coffee" | "sundae";
};

// Seiten-Reihenfolge im Heft: F0 (links, Innendeckel) F1 | F2 F3 | F4 F5
export const MENU_PAGES: MenuPage[] = [
  {
    key: "huernchen", num: "00", kicker: "Zum Anfang", title: "Hörnchen & Kugeln", sub: "Handgedreht, jeden Morgen frisch.",
    hero: "Waffelhörnchen", price: "ab 2,80 €",
    desc: "Knusprig gebackenes Hörnchen, dazu so viele Kugeln, wie du tragen kannst. Jede Sorte wird am Morgen im Haus gerührt.",
    items: [{ name: "Eine Kugel", price: "2,80" }, { name: "Zwei Kugeln", price: "4,80" }, { name: "Drei Kugeln", price: "6,50" }, { name: "Vegane Kugel", price: "+0,50" }],
    accent: "#c2457a", world: ["#ffd1e0", "#ee7aa8", "#8f2159"], photo: asset("/menu/cone.webp"), dish: "cone",
  },
  {
    key: "eis", num: "01", kicker: "Eis-Bowl", title: "Eis-Bowl", sub: "Eis wie ein Kunstwerk.",
    hero: "Die Eis-Bowl", price: "8,90 €",
    desc: "Drei Kugeln Frucht-Eis, Waffel-Krokant, frische Erdbeeren und eine Haube aus Sahne. Obendrauf Streusel in Rosa.",
    items: [{ name: "Streusel & Soße", price: "+0,50" }, { name: "Frische Beeren", price: "+1,00" }, { name: "Nüsse & Krokant", price: "+0,80" }, { name: "Protein-Boost", price: "+1,50" }],
    accent: "#c2457a", world: ["#ffc2d8", "#e0659b", "#7d1a4c"], photo: asset("/menu/eis.webp"), dish: "eis",
  },
  {
    key: "shake", num: "02", kicker: "Milchshake", title: "Milchshake", sub: "Dicht. Kalt. Schokoladig.",
    hero: "Schoko-Cookie-Shake", price: "6,90 €",
    desc: "Vollmilch, dunkles Schoko-Eis und Cookie-Stücke, eiskalt gemixt. Mit Sahne, Splittern und einem roten Strohhalm.",
    items: [{ name: "Schoko-Cookie", price: "6,90" }, { name: "Vanille-Bourbon", price: "6,50" }, { name: "Erdbeer-Sahne", price: "6,50" }, { name: "Protein-Boost", price: "+1,50" }],
    accent: "#8a4a2d", world: ["#f3dcc6", "#b9784f", "#43200f"], photo: asset("/menu/shake.webp"), dish: "shake",
  },
  {
    key: "acai", num: "03", kicker: "Açaí-Bowl", title: "Açaí-Bowl", sub: "Dick. Dunkel. Tropisch.",
    hero: "Die Açaí-Bowl", price: "9,50 €",
    desc: "Dick pürierte Açaí-Beere mit Banane und Kokoswasser, löffelfest wie Sorbet. Mit Obst-Mosaik, Granola und Kokos.",
    items: [{ name: "Banane & Kiwi", price: "inkl." }, { name: "Erdnussbutter", price: "+0,80" }, { name: "Chia & Kokos", price: "+0,50" }, { name: "Protein-Boost", price: "+1,50" }],
    accent: "#6d3fb0", world: ["#dcc6f4", "#8452c9", "#26103f"], photo: asset("/menu/acai.webp"), dish: "acai",
  },
  {
    key: "coffee", num: "04", kicker: "Iced Coffee", title: "Iced Coffee", sub: "Karamell trifft Crunch.",
    hero: "Karamell-Crunch", price: "5,50 €",
    desc: "Doppelter Espresso aus eigener Röstung, kalte Milch, Karamell und Eiswürfel. Mit Cookie-Crumbles gekrönt.",
    items: [{ name: "Classic Iced Coffee", price: "4,80" }, { name: "Vanille-Latte", price: "5,20" }, { name: "Hafer statt Milch", price: "+0,50" }, { name: "Protein-Milch", price: "+1,50" }],
    accent: "#b0682a", world: ["#f4d8a4", "#c98238", "#42250c"], photo: asset("/menu/coffee.webp"), dish: "coffee",
  },
  {
    key: "becher", num: "05", kicker: "Zum Schluss", title: "Eisbecher & Extras", sub: "Für alle, die nicht aufhören wollen.",
    hero: "Der EISWERK-Becher", price: "9,20 €",
    desc: "Drei Kugeln, Waffelfächer, Kirsche und Soße im Glas. Dazu: alle Toppings einzeln, wie du sie liebst.",
    items: [{ name: "Sahne", price: "+0,60" }, { name: "Soßen", price: "+0,50" }, { name: "Streusel", price: "+0,50" }, { name: "Protein-Boost", price: "+1,50" }],
    accent: "#c2457a", world: ["#f6cfdb", "#b04374", "#4a1230"], photo: asset("/menu/f1.webp"), dish: "sundae",
  },
];

export const MENU_VH = 840;
export const BOOK_W = 2.3;
export const BOOK_H = 3.1;
export const MENU_BG: [number, number, number] = [243, 231, 211];

export const TL = {
  intro: [0.0, 0.08] as [number, number],
  flip0: [0.1, 0.2] as [number, number],
  flip1: [0.47, 0.58] as [number, number],
  flip2: [0.8, 0.9] as [number, number],
  // [Pop ein von, bis, Pop aus von, bis]
  pop: [
    [0.2, 0.27, 0.41, 0.46],
    [0.27, 0.34, 0.41, 0.46],
    [0.58, 0.65, 0.74, 0.79],
    [0.65, 0.72, 0.74, 0.79],
    [0.9, 0.95, 2, 3],
    [0.94, 0.99, 2, 3],
  ] as [number, number, number, number][],
  // Kamera-Fokus im Hochformat: [m, -1 links | 0 Mitte | 1 rechts]
  focus: [
    [0, 0], [0.1, 0], [0.2, -1], [0.27, -1], [0.31, 1], [0.47, 1], [0.52, 0], [0.58, -1],
    [0.65, -1], [0.69, 1], [0.8, 1], [0.85, 0], [0.9, -1], [0.945, -1], [0.965, 1], [1, 1],
  ] as [number, number][],
};
