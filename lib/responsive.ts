// Mobil-Fassung (Eugen 20.11.2026): alles unter 1024 px bekommt eigene Hochformat-Komposition.
// Desktop ab 1024 px bleibt unverändert.
export const MOBILE_MQ = "(max-width: 1023px)";
export const DESKTOP_MQ = "(min-width: 1024px)";
export const isMobile = () => typeof window !== "undefined" && window.matchMedia(MOBILE_MQ).matches;

// Unterhalb dieses Seitenverhältnisses (Breite/Höhe) nutzt das Handy die 9:16-Videofassung,
// darüber (Tablet hochkant, Handy quer) wird das 16:9-Original bildfüllend mit Fokuspunkt beschnitten.
export const PORTRAIT_SRC_MAX_ASPECT = 0.68;

// Fokuspfad je Video: (Sekunde, Bildmitte 0..1). Gleiche Werte wie tools/make_portrait.py.
export type FocusKey = [number, number];
export const focusAt = (keys: FocusKey[], t: number) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, c1] = keys[i];
    if (t <= t1) {
      const [t0, c0] = keys[i - 1];
      const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
      return c0 + (c1 - c0) * u * u * (3 - 2 * u);
    }
  }
  return keys[keys.length - 1][1];
};
