"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { sceneState } from "@/lib/state";
import { BOOK_H as H, BOOK_W as W, MENU_PAGES, TL } from "@/lib/menu";
import { RING_Y, loadMenuTextures } from "@/lib/menuTextures";
import { disposeTree } from "./menu/dishes";

type Dish = { group: THREE.Group; bouncers: THREE.Object3D[]; scale: number };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rng = (m: number, [a, b]: [number, number]) => clamp((m - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const backOut = (t: number) => {
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const TILT = -0.86;
const PILE = 0.012;

function softDisc(inner: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function pageGeo() {
  return new THREE.PlaneGeometry(W, H, 28, 1);
}

type Leaf = { group: THREE.Group; front: THREE.Mesh; back: THREE.Mesh; fMat: THREE.MeshBasicMaterial; bMat: THREE.MeshBasicMaterial; base: Float32Array; lastT: number };

function Scene({ tex }: { tex: THREE.Texture[] }) {
  const book = useRef<THREE.Group>(null!);
  const { camera, size, pointer } = useThree();
  const leaves = useRef<Leaf[]>([]);
  const anchors = useRef<{ g: THREE.Group; dish: Dish; shadow: THREE.Mesh; burst: THREE.Points; dirs: Float32Array; kind: number }[]>([]);
  const camX = useRef(0);
  const shadowTex = useMemo(() => softDisc("rgba(40,12,24,.55)"), []);
  const tableTex = useMemo(() => softDisc("rgba(60,30,10,.38)"), []);
  const spark = useMemo(() => softDisc("rgba(255,255,255,1)"), []);
  const root = useMemo(() => new THREE.Group(), []);

  // Heft aufbauen (einmalig)
  useEffect(() => {
    const bk = book.current;
    const cleanup: THREE.Object3D[] = [];
    const planeMat = (t: THREE.Texture) => new THREE.MeshBasicMaterial({ map: t, toneMapped: false });
    // Pappen
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x4a1230, roughness: 0.6 });
    [-1, 1].forEach((s) => {
      const bd = new THREE.Mesh(new THREE.BoxGeometry(W + 0.1, H + 0.12, 0.05), boardMat);
      bd.position.set((s * W) / 2, 0, -0.04);
      bk.add(bd);
    });
    // statische Rückseite (F5) rechts unten
    const endPage = new THREE.Mesh(pageGeo(), planeMat(tex[6]));
    endPage.position.set(W / 2, 0, 0.0);
    bk.add(endPage);
    // Blätter: Leaf0 (Cover | F0), Leaf1 (F1 | F2), Leaf2 (F3 | F4)
    const pairs: [number, number][] = [[0, 1], [2, 3], [4, 5]];
    pairs.forEach(([fi, bi]) => {
      const group = new THREE.Group();
      const fMat = planeMat(tex[fi]);
      const bMat = planeMat(tex[bi]);
      const front = new THREE.Mesh(pageGeo(), fMat);
      front.position.set(W / 2, 0, 0.002);
      const back = new THREE.Mesh(pageGeo(), bMat);
      back.position.set(W / 2, 0, -0.002);
      back.rotation.y = Math.PI;
      group.add(front, back);
      bk.add(group);
      leaves.current.push({ group, front, back, fMat, bMat, base: (front.geometry.attributes.position.array as Float32Array).slice(), lastT: -1 });
    });
    // Tischschatten
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(W * 2.5, H * 1.35), new THREE.MeshBasicMaterial({ map: tableTex, transparent: true, depthWrite: false }));
    sh.position.z = -0.08;
    bk.add(sh);
    // Gerichte
    MENU_PAGES.forEach((p, i) => {
      const pivot = new THREE.Group();
      pivot.rotation.x = -TILT; // Foto steht aufrecht zur Kamera
      const pgeo = new THREE.PlaneGeometry(1.5, 1.5);
      pgeo.translate(0, 0.75, 0);
      const pm = new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false, opacity: 1 });
      const pmesh = new THREE.Mesh(pgeo, pm);
      new THREE.TextureLoader().load(p.photo, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        pm.map = t;
        pm.needsUpdate = true;
        const asp = t.image.width / t.image.height;
        const hh = Math.min(1.75, 1.5 / asp);
        pmesh.scale.set((hh * asp) / 1.5, hh / 1.5, 1);
      });
      pivot.add(pmesh);
      const dish: Dish = { group: pivot, bouncers: [], scale: 1 };
      const g = new THREE.Group();
      const side = i % 2 === 0 ? -1 : 1;
      g.position.set((side * W) / 2, (0.5 - RING_Y) * H, 0.05);
      g.add(pivot);
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.25), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
      shadow.position.z = 0.012;
      g.add(shadow);
      const N = 46;
      const pos = new Float32Array(N * 3);
      const dirs = new Float32Array(N * 3);
      for (let k = 0; k < N; k++) {
        const a = Math.random() * Math.PI * 2;
        const e = 0.25 + Math.random() * 0.8;
        dirs[k * 3] = Math.cos(a) * e;
        dirs[k * 3 + 1] = Math.sin(a) * e;
        dirs[k * 3 + 2] = 0.4 + Math.random() * 1.1;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const col = new THREE.Color(p.accent);
      const burst = new THREE.Points(geo, new THREE.PointsMaterial({ map: spark, color: col.lerp(new THREE.Color(0xffffff), 0.25), size: 0.11, transparent: true, depthWrite: false, opacity: 0, sizeAttenuation: true, blending: THREE.AdditiveBlending }));
      burst.frustumCulled = false;
      g.add(burst);
      bk.add(g);
      anchors.current.push({ g, dish, shadow, burst, dirs, kind: i });
      cleanup.push(g);
    });
    return () => {
      cleanup.forEach(disposeTree);
      leaves.current = [];
      anchors.current = [];
      while (bk.children.length) bk.remove(bk.children[0]);
    };
  }, [tex, shadowTex, tableTex, spark]);

  const bend = (leaf: Leaf, c: number) => {
    const fa = leaf.front.geometry.attributes.position as THREE.BufferAttribute;
    const ba = leaf.back.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < fa.count; i++) {
      const x = leaf.base[i * 3];
      const s = clamp((x + W / 2) / W);
      const dz = -c * 0.5 * s * s;
      fa.setZ(i, dz);
      ba.setZ(i, -dz);
    }
    fa.needsUpdate = true;
    ba.needsUpdate = true;
  };

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const m = sceneState.menu;
    const time = state.clock.elapsedTime;
    const bk = book.current;
    if (!bk || !leaves.current.length) return;

    // Blätter
    const ts = [smooth(rng(m, TL.flip0)), smooth(rng(m, TL.flip1)), smooth(rng(m, TL.flip2))];
    leaves.current.forEach((lf, i) => {
      const t = ts[i];
      lf.group.rotation.y = -Math.PI * t;
      const n = leaves.current.length;
      lf.group.position.z = (n - i) * PILE * (1 - t) + (i + 1) * PILE * t + 0.01;
      if (Math.abs(t - lf.lastT) > 0.0004) {
        bend(lf, Math.sin(Math.PI * t));
        lf.lastT = t;
      }
      const shade = 1 - 0.38 * Math.sin(Math.PI * t);
      lf.fMat.color.setScalar(shade);
      lf.bMat.color.setScalar(shade);
    });

    // Buch-Position: zu = rechts, auf = mittig
    const intro = rng(m, TL.intro);
    const k = backOut(intro);
    bk.position.x = (-W / 2) * (1 - ts[0]);
    bk.position.y = (1 - k) * -2.4 + (0.1 * Math.sin(time * 0.8));
    bk.rotation.set(TILT + pointer.y * 0.05, pointer.x * 0.1, (1 - k) * 0.28 + pointer.x * 0.01);
    bk.scale.setScalar(0.78 + 0.22 * clamp(k, 0, 1.05));

    // Gerichte
    anchors.current.forEach((a, i) => {
      const w = TL.pop[i];
      const uIn = rng(m, [w[0], w[1]]);
      const uOut = 1 - rng(m, [w[2], w[3]]);
      const u = Math.min(uIn, uOut);
      const vis = u > 0.001;
      a.g.visible = vis;
      if (!vis) return;
      const sc = a.dish.scale * Math.max(0, uIn < 1 ? backOut(uIn) : 1) * smooth(uOut);
      const d = a.dish.group;
      d.scale.setScalar(Math.max(0.0001, sc));
      d.position.y = 0.03 * Math.sin(time * 1.4 + i) * smooth(u);
      d.rotation.y = Math.sin(time * 0.55 + i) * 0.1 + pointer.x * 0.28;
      d.rotation.z = (1 - smooth(u)) * (i % 2 ? -0.35 : 0.35);
      a.dish.bouncers.forEach((b, bi) => {
        const base = b.userData.s0 ?? (b.userData.s0 = b.scale.x);
        const ph = time * 3.1 + bi * 1.7;
        b.scale.setScalar(base * (1 + 0.07 * Math.sin(ph) * smooth(u)));
        b.position.y += (Math.sin(ph) * 0.0005) * smooth(u);
      });
      const sm = a.shadow.material as THREE.MeshBasicMaterial;
      sm.opacity = 0.7 * smooth(u);
      a.shadow.scale.setScalar(0.5 + 0.6 * smooth(u));
      // Funken: nur während der Pop-Phase
      const bm = a.burst.material as THREE.PointsMaterial;
      const bu = uIn < 1 ? uIn : 0;
      const pos = a.burst.geometry.attributes.position as THREE.BufferAttribute;
      if (bu > 0 && bu < 1) {
        const e = 1 - Math.pow(1 - bu, 2.2);
        for (let q = 0; q < pos.count; q++) {
          pos.setXYZ(q, a.dirs[q * 3] * e * 0.9, a.dirs[q * 3 + 1] * e * 0.9, 0.2 + a.dirs[q * 3 + 2] * e * 0.9 - 0.9 * e * e * 0.4);
        }
        pos.needsUpdate = true;
        bm.opacity = Math.sin(bu * Math.PI) * 0.95;
      } else bm.opacity = 0;
    });

    // Kamera
    const asp = size.width / size.height;
    const portrait = asp < 0.95;
    const cam = camera as THREE.PerspectiveCamera;
    const ft = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const needW = portrait ? W * 1.1 : 2 * W * 1.02;
    const needH = H * Math.cos(TILT) * 1.12 + 1.9;
    const closedFit = portrait ? 0 : 0;
    const dist = Math.max(needW / (2 * ft * asp), needH / (2 * ft)) + closedFit;
    let fx = 0;
    if (portrait) {
      const f = TL.focus;
      for (let q = 0; q < f.length - 1; q++) {
        if (m >= f[q][0] && m <= f[q + 1][0]) {
          const tt = smooth((m - f[q][0]) / (f[q + 1][0] - f[q][0]));
          fx = f[q][1] + (f[q + 1][1] - f[q][1]) * tt;
          break;
        }
      }
      fx *= W / 2;
    }
    camX.current += (fx - camX.current) * (1 - Math.pow(0.0005, dt));
    cam.position.set(camX.current, 0.45, dist);
    cam.lookAt(camX.current, portrait ? 0.55 : 0.3, 0);
    cam.updateProjectionMatrix();
  });

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[2.5, 4, 5]} intensity={2.4} />
      <directionalLight position={[-3, 1, 3]} intensity={0.8} color="#ffd9e8" />
      <group ref={book} />
      <primitive object={root} />
    </>
  );
}

export default function MenuBook() {
  const [tex, setTex] = useState<THREE.Texture[] | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let dead = false;
    const run = () => loadMenuTextures(8).then((t) => !dead && setTex(t));
    const idle = (window as unknown as { requestIdleCallback?: (f: () => void) => number }).requestIdleCallback;
    if (idle) idle(run);
    else setTimeout(run, 400);
    const iv = setInterval(() => setLive(sceneState.menuOn > 0.01), 160);
    return () => {
      dead = true;
      clearInterval(iv);
    };
  }, []);

  return (
    <Canvas
      className="menu-canvas"
      frameloop={live && tex ? "always" : "never"}
      dpr={[1, 2]}
      camera={{ position: [0, 0.45, 8], fov: 34, near: 0.1, far: 60 }}
      gl={{ alpha: true, antialias: true, toneMapping: THREE.NoToneMapping }}
      style={{ position: "absolute", inset: 0 }}
    >
      {tex && <Scene tex={tex} />}
    </Canvas>
  );
}
