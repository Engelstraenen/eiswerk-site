// Basis-Pfad für statisches Hosting unter /<repo>/ (GitHub Pages); lokal leer.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (p: string) => BASE + p;
