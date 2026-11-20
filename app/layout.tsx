import type { Metadata, Viewport } from "next";
import { Bodoni_Moda } from "next/font/google";
import "./globals.css";
import { asset, BASE } from "@/lib/asset";

const bodoni = Bodoni_Moda({ subsets: ["latin"], display: "swap", variable: "--font-main", weight: ["400", "500", "600", "700"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "EISWERK – Eis, Açaí, Shakes & Iced Coffee (Demo)",
  description: "EISWERK Eisdiele: Eis-Bowl, Milchshake, Açaí-Bowl und Iced Coffee. Interaktive Scroll-Demo.",
  openGraph: { title: "EISWERK", description: "Eis wie ein Kunstwerk.", images: [asset("/assets/poster/eis.jpg")] },
  // Statische Demo-Version (GitHub Pages) nicht indexieren
  ...(BASE ? { metadataBase: new URL("https://engelstraenen.github.io"), robots: { index: false, follow: false } } : {}),
};
// viewportFit cover: Video läuft auf Handys mit Notch bis an den Rand, HUD hält per env(safe-area-inset-*) Abstand
export const viewport: Viewport = { themeColor: "#f4c4d4", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={bodoni.variable}>
      <body>{children}</body>
    </html>
  );
}
