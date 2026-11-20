# Video-Briefing: Hochformat-Fassungen (9:16) für das Handy

Stand 20.11.2026 · gehört zum Branch `mobil-responsive`

## Kurzfassung

| | Status |
|---|---|
| **Fassung 1 (ist eingebaut)** | Aus jedem 16:9-Video wurde ein 9:16-Ausschnitt geschnitten, der dem Motiv folgt (`tools/make_portrait.py`). Dateien: `public/assets/video/{eis,shake,acai,coffee,manufaktur}-portrait.mp4` (608 × 1080, 24 fps, jedes Bild ein Keyframe) und `public/assets/poster/*-portrait.jpg`. Damit läuft die Handy-Seite vollständig: Video bildfüllend, keine Querformat-Fläche, rund 30 MB statt 66 MB. |
| **Fassung 2 (optional, bessere Qualität)** | Echte 9:16-Fassungen. Sie lösen die zwei Schwächen des Ausschnitts: (a) am Ende von **Eis-Bowl** und **Açaí-Bowl** ist die Schale seitlich angeschnitten, weil sie im 16:9-Bild breiter ist als ein Hochformat-Ausschnitt; (b) 608 px Breite sind ausreichend, aber nicht gestochen scharf. |

**Nötig ist Fassung 2 nicht**; die Seite funktioniert ohne sie. Wenn ihr sie produziert, legt ihr pro Video eine Master-Datei ab und führt **einen** Befehl aus (siehe „Einbau“). Am Code muss dann nichts geändert werden.

Reihenfolge nach Nutzen: **1. Eis-Bowl**, **2. Açaí-Bowl** (Schale angeschnitten), danach optional Iced Coffee, Milchshake, Manufaktur (Ausschnitt ist dort schon gut).

---

## Technische Vorgaben (gelten für alle fünf Videos)

| Punkt | Vorgabe |
|---|---|
| Format | **9:16 hochkant, 1080 × 1920 px** (Master). Der Einbau-Befehl rechnet auf 720 × 1280 herunter. |
| Länge | **10 s** (8–12 s gehen auch; die Seite liest die Länge selbst aus). |
| Bildrate | 24 fps (andere werden beim Einbau auf 24 fps umgerechnet). |
| Ton | keiner (wird entfernt). |
| Kamera | **ruhig**: keine Schnitte, keine schnellen Schwenks, keine Blitze. Das Video wird per Scrollen vor- und zurückgespult; harte Schnitte wirken dabei wie Flackern. |
| Letzte Sekunde | **Standbild-ähnlich** (fertiges Produkt, nur minimale Bewegung). Auf dem letzten Bild steht die Seite eine Weile, während das Erklär-Panel eingeblendet wird. |
| Erstes Bild | Ruhiges Startmotiv, möglichst nah am ersten Bild des 16:9-Videos (wird auch als Poster genutzt). |
| Bildaufbau | Motiv **mittig**, Schwerpunkt bei **ca. 40 % der Bildhöhe**. **Oben 12 %** frei von wichtigen Details (Logo/Menü liegen darüber). **Unten 35 %** ruhig halten: dort liegen auf dem Handy die Textkarten. Im Endbild muss das Produkt **vollständig zwischen 10 % und 60 % der Höhe** stehen. |
| Schriftzug | Wo das Original „EISWERK“ auf Schale/Glas zeigt, muss er **korrekt geschrieben und vollständig sichtbar** sein (Serifenschrift, weinrot). Falsche Buchstaben = Video nicht abnehmen. |
| Stil | Identisch zum 16:9-Original: Werbefilm-Look, Studiolicht, gleiche Farbwelt (siehe je Video). |
| Abgabe | `eis_9x16_master.mp4`, `acai_9x16_master.mp4`, `coffee_9x16_master.mp4`, `shake_9x16_master.mp4`, `manufaktur_9x16_master.mp4` (H.264 oder ProRes). |

### Abnahme (bitte vor dem Einbau prüfen)
1. Video einmal langsam vor- und zurückspulen: kein Springen, kein Flackern, keine Morph-Artefakte.
2. Schriftzug „EISWERK“ an jeder Stelle korrekt.
3. Endbild: Produkt vollständig im oberen 60-%-Bereich, letzte Sekunde ruhig.
4. Farbwelt passt zum Hintergrund der Seite (Eis rosa, Shake karamell/beige, Açaí flieder, Coffee warmbraun, Manufaktur rosa-kupfer).

---

## Produktionsweg (mit dem verbundenen SJinn-Konto ausführbar)

Für jedes Video drei Schritte. Modelle und Parameter sind so gewählt, dass die Hochformat-Fassung der Choreografie des Originals folgt.

**Schritt 1 · Schlüsselbilder aus dem Original ziehen** (10 Bilder je Video):
```bash
for t in 0 1.1 2.2 3.3 4.4 5.5 6.6 7.7 8.8 10.08; do
  ffmpeg -v error -y -ss $t -i public/assets/video/eis.mp4 -frames:v 1 -q:v 2 key_eis_$t.jpg
done
```
(`eis` je Video ersetzen durch `shake`, `acai`, `coffee`, `manufaktur`.)

**Schritt 2 · Jedes Schlüsselbild auf 9:16 erweitern** — Bildmodell `nano-banana-pro` (Alternative: `gpt-image-2`), Ausgabe 9:16, Referenzbild = Schlüsselbild. Prompt (für alle Bilder gleich, nur die Zeile *Hintergrund* je Video aus der Tabelle unten einsetzen):

```text
Reframe this product photo into a vertical 9:16 image (1080x1920).
Keep the main subject exactly as it is: same object, same shape, same colours, same lighting,
same size relative to the frame width, and any lettering ("EISWERK") letter-for-letter identical.
Scale the subject so it is fully visible with a little margin on the left and right,
place it horizontally centred with its centre at about 40% of the image height.
Extend the scene naturally above and below the original frame: {HINTERGRUND}.
No new objects in the bottom third, keep it calm and soft. No text other than the existing "EISWERK".
Photorealistic high-end food commercial, studio lighting, shallow depth of field, no borders, no letterboxing.
```

**Schritt 3 · Video aus den Schlüsselbildern** — Videomodell `kling4-frames`:
`first_frame_url` = Bild 0, `keyframe_urls` = Bilder 1.1 … 8.8 (in dieser Reihenfolge), `last_frame_url` = Bild 10.08, `duration` = 10, `resolution` = `1080p`, Prompt je Video aus der Tabelle unten. Danach Abnahme (siehe oben), dann Einbau.

Fallback, falls `kling4-frames` die Bilder nicht sauber verbindet: `veo3.1-fast` mit erstem und letztem Bild und demselben Prompt; dazwischen keine Schlüsselbilder.

---

## Die fünf Videos im Einzelnen

Zeitangaben = Sekunde im Video. Die Texte, die auf der Seite dazu erscheinen, stehen in Klammern; das Bild sollte zu ihnen passen.

### 1 · Eis-Bowl (`eis`) — Priorität 1
- **Problem im Ausschnitt:** Endbild-Schale breiter als der Hochformat-Ausschnitt, Schriftzug am Rand angeschnitten.
- **Ablauf:** 0–1 s Erdbeere schwebt im Milch-Splash · 1–3 s weiße Sahne-/Milchspirale wickelt sich um die Erdbeere („Frisch gepflückt.“) · 3–4 s Spirale wird zu rosa Eis („Cremig verwirbelt.“) · 4–6 s Eiskugel auf Waffel, Erdbeeren und Waffelstücke fliegen · 6–8 s Kugel fällt in die weiße Schale („Knackig. Bunt. Explosiv.“) · 8–10 s fertige Eis-Bowl: weiße Schale mit weinrotem Schriftzug „EISWERK“, drei rosa Kugeln, Erdbeeren, Waffelecken, bunte Streusel, ruhig.
- **Hintergrund (Schritt 2):** `soft pink studio backdrop with pink cotton-candy clouds and a few floating strawberries, bright and airy`
- **Video-Prompt (Schritt 3):**
```text
Vertical 9:16 high-end ice cream commercial, slow continuous motion, no cuts.
A ripe strawberry floats in a splash of milk; a ribbon of white cream spirals around it and
turns into swirled pink strawberry ice cream; a scoop lands on a waffle cone while strawberries
and waffle pieces fly past; the scoop drops into a white bowl with the burgundy serif lettering
"EISWERK"; final shot: the finished bowl with three pink scoops, fresh strawberry halves,
waffle triangles and colourful sprinkles, fully visible in the upper half of the frame,
almost still for the last second. Soft pink background with pink clouds, studio light.
Keep the lettering "EISWERK" sharp and correctly spelled.
```

### 2 · Açaí-Bowl (`acai`) — Priorität 2
- **Problem im Ausschnitt:** Endbild-Schale seitlich angeschnitten.
- **Ablauf:** 0–1.5 s Traube aus Açaí-Beeren schwebt („Direkt aus dem Amazonas.“) · 2–3.5 s dunkelviolettes Püree wirbelt und fließt in eine weiße Schale („Cremig-körnig.“) · 4–5.5 s Schale füllt sich, Erdnussbutter läuft in Schlaufen darüber · 6–9 s Bananenscheiben, Erdbeere, Heidelbeeren, Kiwi, Granola, Kokos und Chia landen nacheinander („Ein Wirbel aus Früchten.“) · 9–10 s fertige Bowl, weiße Schale mit Schriftzug „EISWERK“, ruhig.
- **Hintergrund (Schritt 2):** `pastel lilac-to-peach studio gradient with soft lavender mist at the bottom`
- **Video-Prompt (Schritt 3):**
```text
Vertical 9:16 premium açaí bowl commercial, slow continuous motion, no cuts.
A cluster of dark açaí berries floats, bursts into a swirl of thick deep-purple purée that pours
into a white bowl with the grey serif lettering "EISWERK"; peanut butter drizzles in loops over
the purée; banana slices, a strawberry half, blueberries, kiwi slices, granola, coconut flakes
and chia seeds land one after another and arrange neatly; final shot: the finished bowl fully
visible in the upper half of the frame, almost still for the last second.
Pastel lilac and peach background with soft lavender mist. Lettering sharp and correctly spelled.
```

### 3 · Iced Coffee (`coffee`) — optional
- **Ablauf:** 0–1 s glühende Kaffeebohne („Frisch geröstet.“) · 1–3 s Bohne in Milch-Karamell-Wirbel („Espresso, Milch, Karamell.“) · 3–4 s glänzende Kaffeekugel mit Eiswürfeln · 4–5 s Explosion aus Eis und Kaffee · 5–7 s Eiswürfel fallen in ein hohes Glas mit Schriftzug „EISWERK“ („Eiswürfel und Crumbles.“) · 7–10 s Glas füllt sich, Schaum, Cookie-Crumbles, Karamell läuft herab, ruhig.
- **Hintergrund (Schritt 2):** `warm caramel-brown studio gradient with a soft golden glow behind the subject`
- **Video-Prompt (Schritt 3):**
```text
Vertical 9:16 iced coffee commercial, slow continuous motion, no cuts.
A glowing roasted coffee bean with sparks, swallowed by a swirl of milk and caramel; the swirl
forms a glossy sphere of coffee with ice cubes, which bursts; ice cubes and cookie crumbles fall
into a tall clear glass with the dark sans-serif lettering "EISWERK"; the glass fills with
coffee and milk, topped with foam and two cookie pieces, caramel slowly dripping down;
final shot: the full glass centred in the upper half, almost still for the last second.
Warm caramel-brown background with a golden glow. Lettering sharp and correctly spelled.
```

### 4 · Milchshake (`shake`) — optional
- **Ablauf:** 0–2 s Schokoladentafel und Cookies schweben über einem leeren Glas („Zwei Klassiker.“) · 2–4 s Sahnespirale, Kakaopulver wirbelt („Eiskalt gemixt.“) · 4–7 s Schoko-Wirbel mit Sahnetupfen · 7–8.5 s Shake fließt in einem Strahl ins Glas („Ins Glas.“) · 8.5–10 s volles Glas mit Schriftzug „EISWERK“, Sahne, Schokostück, Schoko-Drip, ruhig.
- **Hintergrund (Schritt 2):** `soft beige-to-cocoa studio gradient with light cream-coloured mist at the bottom`
- **Video-Prompt (Schritt 3):**
```text
Vertical 9:16 chocolate milkshake commercial, slow continuous motion, no cuts.
A chocolate bar and chocolate sandwich cookies float above an empty tall glass with the serif
lettering "EISWERK"; a ribbon of whipped cream and cocoa powder spirals around them and melts
into a swirling mass of chocolate shake with cream dollops; the shake pours in one thick stream
into the glass; final shot: the full glass with whipped cream, a chocolate piece and chocolate
drips, fully visible in the upper half, almost still for the last second.
Beige-cocoa background with soft mist. Lettering sharp and correctly spelled.
```

### 5 · Eismanufaktur (`manufaktur`) — optional
- **Ablauf:** 0–0.7 s Blick in die rosa Manufaktur mit Kupferkesseln · 1–3 s Milch und Fruchtpüree laufen aus einer Kanne in den Kupferkessel („Milch und Frucht.“) · 3–6 s Rührwerk, Masse wird rosa und dick („Langsam gefroren.“) · 6–8 s Portionierer zieht eine Kugel aus dem Kessel · 8–10 s Kugel mit Fruchtstücken auf Waffel in behandschuhter Hand („Frisch aus dem Kessel.“), ruhig.
- **Hintergrund (Schritt 2):** `blurred copper ice-cream kettles and warm pink manufactory interior`
- **Video-Prompt (Schritt 3):**
```text
Vertical 9:16 artisan ice cream manufactory film, slow continuous motion, no cuts.
A bright pink manufactory with copper kettles; fresh milk and red berry purée pour from a steel
jug into a copper kettle; a steel stirrer folds the mixture until it becomes thick, glossy pink
ice cream with berry pieces; a steel scoop pulls a perfect round scoop out of the kettle and
places it on a waffle cone held by a hand in a white glove; final shot: the scoop on the cone,
centred in the upper half, almost still for the last second. Warm pink and copper tones.
```

---

## Einbau (ein Befehl je Video)

```bash
python3 tools/make_portrait.py eis --master /pfad/zu/eis_9x16_master.mp4
```
Das Skript rechnet auf 720 × 1280, 24 fps, jedes Bild ein Keyframe (nötig für ruckelfreies Scrubben, auch rückwärts), ersetzt `public/assets/video/eis-portrait.mp4` und erzeugt das passende Poster `public/assets/poster/eis-portrait.jpg` aus dem ersten Bild. Danach committen; Code-Änderungen sind nicht nötig.

Zurück zur Fassung 1 (Ausschnitt): `python3 tools/make_portrait.py eis`
