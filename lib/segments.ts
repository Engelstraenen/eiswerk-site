import { ACT_VH } from "./acts";

export type InterId = "show-eis" | "show-shake" | "show-acai" | "show-coffee" | "process" | "manifest" | "finale" | "parlor";
export type Seg =
  | { kind: "act"; act: number; vh: number }
  | { kind: "inter"; id: InterId; vh: number; bg: [number, number, number]; ink: string; accent: string };

// Dramaturgie (Eugen 29.10.2026): nach jedem Video eine Showcase-Seite mit extremen Kreationen dieses Produkts.
// Die Speisekarte ist kein Scroll-Kapitel mehr, sondern ein Menüpunkt (flaches Overlay).
export const SEGS: Seg[] = [
  { kind: "act", act: 0, vh: ACT_VH },
  { kind: "inter", id: "show-eis", vh: 380, bg: [58, 15, 41], ink: "#fbeee4", accent: "#f4c4d4" },
  { kind: "act", act: 1, vh: ACT_VH },
  { kind: "inter", id: "show-shake", vh: 380, bg: [44, 22, 14], ink: "#fbeee4", accent: "#f0c9a8" },
  { kind: "act", act: 2, vh: ACT_VH },
  { kind: "inter", id: "show-acai", vh: 340, bg: [30, 12, 54], ink: "#f6ecff", accent: "#d9c2f6" },
  { kind: "act", act: 3, vh: ACT_VH },
  { kind: "inter", id: "show-coffee", vh: 340, bg: [46, 27, 13], ink: "#f8ead6", accent: "#e9b46c" },
  { kind: "act", act: 4, vh: ACT_VH },
  { kind: "inter", id: "finale", vh: 460, bg: [38, 10, 28], ink: "#fbeee4", accent: "#f4c4d4" },
];

// Interlude-Fortschritt: Registry, jede Interlude meldet hier ihre scrub-Funktion an
export const interReg: Record<string, (p: number) => void> = {};
