import { asset } from "./asset";
export type Beat = {
  at: number; // lokale Position im Akt 0..1, Mitte des Beats
  span: number; // Dauer in lokaler Position
  kicker: string;
  title: string;
  text: string;
  side: "left" | "right" | "center";
};

export type Act = {
  id: "eis" | "shake" | "acai" | "coffee" | "manufaktur";
  index: string;
  name: string;
  tagline: string;
  video: string;
  poster: string;
  bg: [number, number, number];
  ink: string;
  accent: string;
  particle: string;
  beats: Beat[];
  explain: { heading: string; rows: { label: string; text: string }[] };
};

// Reihenfolge (Eugen 29.10.2026): Eis → Milchshake → Açaí → Iced Coffee
export const ACTS: Act[] = [
  {
    id: "eis",
    index: "01",
    name: "Eis-Bowl",
    tagline: "Eis wie ein Kunstwerk.",
    video: asset("/assets/video/eis.mp4"),
    poster: asset("/assets/poster/eis.jpg"),
    bg: [244, 196, 212],
    ink: "#4a1230",
    accent: "#c2457a",
    particle: "#ff9ec1",
    beats: [
      { at: 0.1, span: 0.16, kicker: "Die Frucht", title: "Frisch gepflückt.", text: "Reife Erdbeeren, jeden Morgen frisch, kein Konzentrat.", side: "left" },
      { at: 0.3, span: 0.16, kicker: "Die Milch", title: "Cremig verwirbelt.", text: "Vollmilch trifft Frucht und wird zu samtigem Eis.", side: "right" },
      { at: 0.5, span: 0.16, kicker: "Der Moment", title: "Knackig. Bunt. Explosiv.", text: "Waffel, Streusel und Beeren fallen in die Bowl.", side: "left" },
    ],
    explain: {
      heading: "So entsteht deine Eis-Bowl",
      rows: [
        { label: "Zusammensetzung", text: "Frucht-Eis, Waffel-Krokant, frische Beeren, Sahnehaube." },
        { label: "Toppings", text: "Streusel, Beeren, Soßen, Nüsse. Du wählst, wir türmen." },
        { label: "Protein-Boost", text: "Optional ein Scoop Protein ins Eis, ohne Geschmacksverlust." },
      ],
    },
  },
  {
    id: "shake",
    index: "02",
    name: "Milchshake",
    tagline: "Dicht. Kalt. Schokoladig.",
    video: asset("/assets/video/shake.mp4"),
    poster: asset("/assets/poster/shake.jpg"),
    bg: [238, 214, 196],
    ink: "#3a2118",
    accent: "#8a4a2d",
    particle: "#e9b995",
    beats: [
      { at: 0.1, span: 0.16, kicker: "Schoko & Cookie", title: "Zwei Klassiker.", text: "Dunkle Schokolade und knusprige Cookies als Basis.", side: "right" },
      { at: 0.3, span: 0.16, kicker: "Die Milch", title: "Eiskalt gemixt.", text: "Kalte Milch schmilzt alles zu einem dichten Wirbel.", side: "left" },
      { at: 0.5, span: 0.16, kicker: "Der Moment", title: "Ins Glas.", text: "Der Shake fließt in einem Strahl, Sahne und Splitter obendrauf.", side: "right" },
    ],
    explain: {
      heading: "So entsteht dein Milchshake",
      rows: [
        { label: "Zusammensetzung", text: "Vollmilch, Schoko-Eis, Cookie-Stücke, Sahne." },
        { label: "Toppings", text: "Schoko-Drizzle, Cookie-Splitter, Sahne, Sprinkles." },
        { label: "Protein-Boost", text: "Optional Whey oder vegan, cremig eingerührt." },
      ],
    },
  },
  {
    id: "acai",
    index: "03",
    name: "Açaí-Bowl",
    tagline: "Dick. Dunkel. Tropisch.",
    video: asset("/assets/video/acai.mp4"),
    poster: asset("/assets/poster/acai.jpg"),
    bg: [221, 206, 238],
    ink: "#2f1b4d",
    accent: "#6d3fb0",
    particle: "#c3a1f2",
    beats: [
      { at: 0.1, span: 0.16, kicker: "Die Beere", title: "Direkt aus dem Amazonas.", text: "Frische Açaí-Beeren, dick püriert, ohne Eis, ohne Zuckerzusatz.", side: "left" },
      { at: 0.3, span: 0.16, kicker: "Die Base", title: "Cremig-körnig.", text: "Mit Banane und Kokoswasser zu einer löffelfesten Masse gemixt.", side: "right" },
      { at: 0.5, span: 0.16, kicker: "Der Moment", title: "Ein Wirbel aus Früchten.", text: "Erdnussbutter, Banane, Beeren, Kiwi, Granola und Kokos landen Stück für Stück.", side: "left" },
    ],
    explain: {
      heading: "So entsteht deine Açaí-Bowl",
      rows: [
        { label: "Zusammensetzung", text: "Açaí-Püree, Banane, Kokoswasser, Granola, frisches Obst." },
        { label: "Toppings", text: "Banane, Erdbeere, Blaubeere, Kokos, Chia, Erdnussbutter." },
        { label: "Protein-Boost", text: "Optional Vanille-Protein in die Base, voll im Geschmack." },
      ],
    },
  },
  {
    id: "coffee",
    index: "04",
    name: "Iced Coffee",
    tagline: "Karamell trifft Crunch.",
    video: asset("/assets/video/coffee.mp4"),
    poster: asset("/assets/poster/coffee.jpg"),
    bg: [226, 190, 148],
    ink: "#3b2410",
    accent: "#b0682a",
    particle: "#f0c27a",
    beats: [
      { at: 0.1, span: 0.16, kicker: "Die Bohne", title: "Frisch geröstet.", text: "Ein doppelter Espresso aus Bohnen der Hausrösterei.", side: "right" },
      { at: 0.3, span: 0.16, kicker: "Der Wirbel", title: "Espresso, Milch, Karamell.", text: "Alles dreht sich zu einer glänzenden Kugel.", side: "left" },
      { at: 0.5, span: 0.16, kicker: "Der Moment", title: "Eiswürfel und Crumbles.", text: "Cookie-Crumbles regnen über das Glas.", side: "right" },
    ],
    explain: {
      heading: "So entsteht dein Iced Coffee",
      rows: [
        { label: "Zusammensetzung", text: "Doppelter Espresso, Milch, Karamell, Eiswürfel." },
        { label: "Toppings", text: "Cookie-Crumbles, Karamell-Drizzle, Sahne, Kakao." },
        { label: "Protein-Boost", text: "Optional Protein-Milch für den Kick nach dem Training." },
      ],
    },
  },
  {
    id: "manufaktur",
    index: "05",
    name: "Eismanufaktur",
    tagline: "Selbstgemacht. In unseren Kesseln.",
    video: asset("/assets/video/manufaktur.mp4"),
    poster: asset("/assets/poster/manufaktur.jpg"),
    bg: [244, 196, 212],
    ink: "#4a1230",
    accent: "#b0502f",
    particle: "#ff9ec1",
    beats: [
      { at: 0.1, span: 0.16, kicker: "Der Kessel", title: "Milch und Frucht.", text: "Frische Vollmilch und Fruchtpüree laufen in den Kupferkessel.", side: "left" },
      { at: 0.3, span: 0.16, kicker: "Das Rühren", title: "Langsam gefroren.", text: "Im Kessel wird die Masse kalt, dick und seidig.", side: "right" },
      { at: 0.5, span: 0.16, kicker: "Der Moment", title: "Frisch aus dem Kessel.", text: "Rosa, dicht und glänzend: Eis, das heute früh entstanden ist.", side: "left" },
    ],
    explain: {
      heading: "So entsteht unser Eis",
      rows: [
        { label: "Zutaten", text: "Vollmilch, Sahne, reife Früchte. Keine Konzentrate." },
        { label: "Handwerk", text: "Jeden Morgen frisch angesetzt, in kleinen Chargen." },
        { label: "Sorten", text: "24 im Wechsel, saisonal und aus der eigenen Manufaktur." },
      ],
    },
  },
];

export const ACT_VH = 560; // Scroll-Länge pro Akt in vh
export const PLAY_END = 0.7; // Ab hier steht das Video am letzten Bild (Erklär-Phase)
export const BRIDGE_START = 0.88; // Brücke zum nächsten Akt
export const BRIDGE_IN = 0.12; // Einblendung des neuen Akts
