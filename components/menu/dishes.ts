import * as THREE from "three";

export type Dish = { group: THREE.Group; bouncers: THREE.Object3D[]; scale: number };

const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0, ...o });
const glass = () =>
  new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.26, roughness: 0.06, metalness: 0, depthWrite: false, side: THREE.DoubleSide });

function lathe(pts: [number, number][], mat: THREE.Material, seg = 40) {
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg), mat);
  (mat as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  return m;
}
function ball(r: number, color: number, x: number, y: number, z: number, o: THREE.MeshStandardMaterialParameters = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), std(color, o));
  m.position.set(x, y, z);
  return m;
}
function scoop(r: number, color: number, x: number, y: number, z: number) {
  const g = new THREE.Group();
  g.add(ball(r, color, 0, 0, 0, { roughness: 0.78 }));
  const sk = new THREE.Mesh(new THREE.TorusGeometry(r * 0.92, r * 0.2, 12, 32), std(color, { roughness: 0.78 }));
  sk.rotation.x = Math.PI / 2;
  sk.position.y = -r * 0.42;
  g.add(sk);
  g.position.set(x, y, z);
  return g;
}
function cherry(x: number, y: number, z: number, r = 0.058) {
  const g = new THREE.Group();
  g.add(ball(r, 0xc2102f, 0, 0, 0, { roughness: 0.2 }));
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 6), std(0x4a7a2a));
  stem.position.set(0.02, r + 0.04, 0);
  stem.rotation.z = -0.4;
  g.add(stem);
  g.position.set(x, y, z);
  return g;
}
function strawberry(x: number, y: number, z: number, r = 0.07) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 16), std(0xd8283f, { roughness: 0.35 }));
  b.scale.set(1, 1.2, 1);
  g.add(b);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.8, r * 0.5, 7), std(0x3f8a34));
  cap.position.y = r * 1.1;
  g.add(cap);
  g.position.set(x, y, z);
  return g;
}
function sprinkles(n: number, rad: number, cy: number, colors: number[], dome = 0.2, ox = 0, oz = 0) {
  const geo = new THREE.CapsuleGeometry(0.008, 0.03, 3, 6);
  const m = new THREE.InstancedMesh(geo, std(0xffffff), n);
  const d = new THREE.Object3D();
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = Math.sqrt(Math.random()) * rad;
    d.position.set(ox + Math.cos(a) * rr, cy + dome * Math.sqrt(Math.max(0, 1 - (rr / rad) ** 2)), oz + Math.sin(a) * rr);
    d.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    d.updateMatrix();
    m.setMatrixAt(i, d.matrix);
    c.setHex(colors[i % colors.length]);
    m.setColorAt(i, c);
  }
  return m;
}
function waffleTex() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!;
  x.fillStyle = "#e2b068";
  x.fillRect(0, 0, 128, 128);
  x.strokeStyle = "#a9722f";
  x.lineWidth = 5;
  for (let i = -128; i < 256; i += 22) {
    x.beginPath();
    x.moveTo(i, 0);
    x.lineTo(i + 128, 128);
    x.stroke();
    x.beginPath();
    x.moveTo(i + 128, 0);
    x.lineTo(i, 128);
    x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 2);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function straw(h: number, color: number, tilt: number, x: number, z: number, y = 0) {
  const g = new THREE.Group();
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, h, 12), std(color, { roughness: 0.3 }));
  s.position.y = h / 2;
  g.add(s);
  for (let i = 1; i < 5; i++) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.0235, 0.0235, h * 0.07, 12), std(0xffffff, { roughness: 0.3 }));
    b.position.y = (h * i) / 5;
    g.add(b);
  }
  g.rotation.z = tilt;
  g.position.set(x, y, z);
  return g;
}
function crumbs(n: number, rad: number, cy: number, color: number, dome = 0.05, size = 0.03) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = Math.sqrt(Math.random()) * rad;
    const m = new THREE.Mesh(new THREE.BoxGeometry(size * (0.6 + Math.random()), size * 0.6, size * (0.6 + Math.random())), std(color, { roughness: 0.9 }));
    m.position.set(Math.cos(a) * rr, cy + dome * Math.sqrt(Math.max(0, 1 - (rr / rad) ** 2)), Math.sin(a) * rr);
    m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    g.add(m);
  }
  return g;
}
const ceramic = () => std(0xfdf6ee, { roughness: 0.22 });
const bowlProfile = (r: number, h: number): [number, number][] => [
  [0, 0], [r * 0.42, 0], [r * 0.7, h * 0.18], [r * 0.98, h * 0.82], [r, h], [r - 0.025, h], [r * 0.94, h * 0.8], [r * 0.66, h * 0.2], [r * 0.4, 0.03], [0, 0.03],
];
const cream = () => std(0xfff8ec, { roughness: 0.45 });

function cone(): Dish {
  const g = new THREE.Group();
  const b: THREE.Object3D[] = [];
  const cn = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.72, 28), new THREE.MeshStandardMaterial({ map: waffleTex(), roughness: 0.85 }));
  cn.rotation.x = Math.PI;
  cn.position.y = 0.36;
  g.add(cn);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.016, 8, 28), std(0xb07a35));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.72;
  g.add(rim);
  g.add(scoop(0.215, 0xf6a9c4, 0, 0.88, 0));
  const top = scoop(0.2, 0xb9d98f, 0, 1.22, 0.01);
  g.add(top);
  b.push(top);
  const ch = cherry(0.01, 1.47, 0);
  g.add(ch);
  b.push(ch);
  g.add(sprinkles(36, 0.17, 1.28, [0xff5a8a, 0xffffff, 0xffd34d, 0x6fc3ff], 0.14, 0, 0.01));
  return { group: g, bouncers: b, scale: 0.7 };
}

function eis(): Dish {
  const g = new THREE.Group();
  const b: THREE.Object3D[] = [];
  g.add(lathe(bowlProfile(0.47, 0.32), ceramic()));
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.455, 0.012, 8, 40), std(0xc2457a));
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.2;
  g.add(band);
  g.add(scoop(0.2, 0xf6a9c4, -0.17, 0.46, 0.05));
  g.add(scoop(0.2, 0xb9d98f, 0.17, 0.46, 0.05));
  g.add(scoop(0.2, 0xfff0cf, 0, 0.46, -0.2));
  const t = scoop(0.19, 0xff8fb3, 0, 0.74, -0.01);
  g.add(t);
  b.push(t);
  const w = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.018, 0.2), new THREE.MeshStandardMaterial({ map: waffleTex(), roughness: 0.85 }));
  w.position.set(0.22, 0.78, -0.05);
  w.rotation.set(0.2, 0.5, -0.9);
  g.add(w);
  [[-0.3, 0.42, 0.22], [0.02, 0.4, 0.3], [0.3, 0.42, 0.2]].forEach(([x, y, z]) => {
    const s = strawberry(x, y, z);
    g.add(s);
    b.push(s);
  });
  const ch = cherry(-0.02, 0.97, -0.01);
  g.add(ch);
  b.push(ch);
  g.add(sprinkles(60, 0.34, 0.5, [0xff5a8a, 0xffffff, 0xffd34d, 0x6fc3ff, 0xb9d98f], 0.25));
  return { group: g, bouncers: b, scale: 0.9 };
}

function shake(): Dish {
  const g = new THREE.Group();
  const b: THREE.Object3D[] = [];
  g.add(lathe([[0, 0], [0.21, 0], [0.3, 0.88], [0.285, 0.88], [0.195, 0.045], [0, 0.045]], glass()));
  const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.272, 0.2, 0.74, 32), std(0x7a4429, { roughness: 0.3 }));
  liq.position.y = 0.42;
  g.add(liq);
  [0.9, 0.96, 1.02].forEach((y, i) => {
    const c = ball(0.2 - i * 0.045, 0xfff8ec, 0, y, 0, { roughness: 0.45 });
    c.scale.y = 0.62;
    g.add(c);
  });
  g.add(crumbs(18, 0.2, 0.93, 0x4a2a18, 0.1, 0.04));
  const ch = cherry(0, 1.12, 0);
  g.add(ch);
  b.push(ch);
  const st = straw(1.2, 0xd8283f, 0.16, 0.06, 0, 0.15);
  g.add(st);
  b.push(st);
  [[-0.16, 1.0, 0.08], [0.15, 1.02, -0.08]].forEach(([x, y, z]) => {
    const k = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 18), std(0x5b351f, { roughness: 0.9 }));
    k.position.set(x, y, z);
    k.rotation.set(1.1, 0.3, 0.5);
    g.add(k);
    b.push(k);
  });
  return { group: g, bouncers: b, scale: 0.78 };
}

function acai(): Dish {
  const g = new THREE.Group();
  const b: THREE.Object3D[] = [];
  g.add(lathe(bowlProfile(0.47, 0.34), ceramic()));
  const dome = ball(0.43, 0x4a1670, 0, 0.27, 0, { roughness: 0.55 });
  dome.scale.set(1, 0.36, 1);
  g.add(dome);
  const dy = (r: number) => 0.27 + 0.155 * Math.sqrt(Math.max(0, 1 - (r / 0.43) ** 2));
  const put = (o: THREE.Object3D, ang: number, r: number, lift = 0.02) => {
    o.position.set(Math.cos(ang) * r, dy(r) + lift, Math.sin(ang) * r);
    g.add(o);
    return o;
  };
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 20), std(0xf7e08a, { roughness: 0.5 }));
    s.rotation.set(0.5 + i * 0.1, 0, -0.3 + i * 0.15);
    put(s, 2.3 + i * 0.18, 0.31 - i * 0.01, 0.035);
    b.push(s);
  }
  for (let i = 0; i < 3; i++) {
    const sb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 12), std(0xd8283f, { roughness: 0.35 }));
    sb.scale.y = 0.45;
    put(sb, -0.5 + i * 0.5, 0.3, 0.025);
    b.push(sb);
  }
  for (let i = 0; i < 9; i++) put(ball(0.036, 0x2d3a8c, 0, 0, 0, { roughness: 0.3 }), 0.9 + i * 0.7, 0.04 + (i % 3) * 0.09, 0.03);
  [[0.7, 0.27], [1.1, 0.24]].forEach(([a, r], i) => {
    const k = new THREE.Group();
    k.add(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.025, 24), std(0x6db03a)));
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.028, 24), std(0xcfe58a));
    k.add(inner);
    k.rotation.x = 0.35;
    put(k, a + i, r, 0.03);
    b.push(k);
  });
  g.add(crumbs(26, 0.38, 0.4, 0xffffff, 0.08, 0.035));
  g.add(crumbs(22, 0.36, 0.41, 0x9b6a3a, 0.08, 0.035));
  return { group: g, bouncers: b, scale: 0.98 };
}

function coffee(): Dish {
  const g = new THREE.Group();
  const b: THREE.Object3D[] = [];
  g.add(lathe([[0, 0], [0.19, 0], [0.26, 1.02], [0.245, 1.02], [0.18, 0.045], [0, 0.045]], glass()));
  const dark = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.178, 0.44, 32), std(0x2a1408, { roughness: 0.25 }));
  dark.position.y = 0.27;
  g.add(dark);
  const milk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.205, 0.44, 32), std(0xc89a6a, { roughness: 0.3 }));
  milk.position.y = 0.71;
  g.add(milk);
  [[-0.08, 0.98, 0.02, 0.3], [0.1, 1.0, -0.05, 0.9], [0.0, 0.93, 0.1, 1.5]].forEach(([x, y, z, r]) => {
    const ic = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), new THREE.MeshStandardMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.55, roughness: 0.05 }));
    ic.position.set(x, y, z);
    ic.rotation.set(r, r * 0.6, r * 0.3);
    g.add(ic);
    b.push(ic);
  });
  const dol = ball(0.16, 0xfff8ec, 0, 1.09, 0, { roughness: 0.45 });
  dol.scale.y = 0.6;
  g.add(dol);
  for (let i = 0; i < 2; i++) {
    const tor = new THREE.Mesh(new THREE.TorusGeometry(0.1 - i * 0.04, 0.012, 8, 28), std(0xd08a2c, { roughness: 0.2 }));
    tor.rotation.x = Math.PI / 2;
    tor.position.y = 1.15 + i * 0.03;
    g.add(tor);
  }
  g.add(crumbs(16, 0.14, 1.15, 0x5b351f, 0.05, 0.04));
  const st = straw(1.3, 0xefe3d0, 0.14, 0.07, 0, 0.1);
  g.add(st);
  b.push(st);
  return { group: g, bouncers: b, scale: 0.7 };
}

function sundae(): Dish {
  const g = new THREE.Group();
  const b: THREE.Object3D[] = [];
  g.add(lathe([[0, 0], [0.17, 0], [0.17, 0.02], [0.04, 0.05], [0.04, 0.3], [0.2, 0.36], [0.4, 0.56], [0.39, 0.57], [0.19, 0.38], [0.02, 0.3], [0, 0.3]], glass()));
  g.add(scoop(0.19, 0xfff0cf, -0.14, 0.62, 0.05));
  g.add(scoop(0.19, 0x6b3a24, 0.14, 0.62, 0.05));
  g.add(scoop(0.19, 0xf6a9c4, 0, 0.62, -0.17));
  const top = scoop(0.18, 0xb9d98f, 0, 0.86, 0);
  g.add(top);
  b.push(top);
  for (let i = 0; i < 2; i++) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.16 - i * 0.05, 0.016, 8, 30), std(0x4a1c10, { roughness: 0.15 }));
    t.rotation.x = Math.PI / 2;
    t.position.y = 0.76 + i * 0.12;
    g.add(t);
  }
  const wf = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 3), new THREE.MeshStandardMaterial({ map: waffleTex(), roughness: 0.85 }));
  wf.scale.z = 0.12;
  wf.position.set(0.24, 0.9, -0.03);
  wf.rotation.z = -0.55;
  g.add(wf);
  b.push(wf);
  const ch = cherry(0, 1.1, 0);
  g.add(ch);
  b.push(ch);
  g.add(sprinkles(40, 0.26, 0.7, [0xff5a8a, 0xffffff, 0xffd34d, 0x6fc3ff], 0.2));
  return { group: g, bouncers: b, scale: 0.82 };
}

export function buildDish(kind: "cone" | "eis" | "shake" | "acai" | "coffee" | "sundae"): Dish {
  return { cone, eis, shake, acai, coffee, sundae }[kind]();
}

export function disposeTree(o: THREE.Object3D) {
  o.traverse((n) => {
    const m = n as THREE.Mesh;
    m.geometry?.dispose?.();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
      (x as THREE.MeshStandardMaterial).map?.dispose();
      x.dispose();
    });
  });
}
