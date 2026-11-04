// Single Source of Truth für Scroll-Fortschritt (kein React-State pro Frame)
export const sceneState = {
  g: 0, // global 0..1
  act: 0,
  local: 0, // lokal im Akt 0..1
  vel: 0, // Scroll-Geschwindigkeit
  bridge: 0, // 0..1 Stärke des Übergangs
  quality: 1, // 1 hoch, 0.5 mittel
  menu: 0, // Fortschritt der Speisekarte 0..1
  menuOn: 0, // Sichtbarkeit der Speisekarte 0..1
};
