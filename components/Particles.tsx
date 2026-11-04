"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ACTS } from "@/lib/acts";
import { sceneState } from "@/lib/state";

function sprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.35, "rgba(255,255,255,.65)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Field({ count }: { count: number }) {
  const pts = useRef<THREE.Points>(null!);
  const mat = useRef<THREE.PointsMaterial>(null!);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = -8 + Math.random() * 11;
      speeds[i] = 0.25 + Math.random() * 0.9;
    }
    return { positions, speeds };
  }, [count]);
  const tex = useMemo(() => sprite(), []);
  const colors = useMemo(() => ACTS.map((a) => new THREE.Color(a.particle)), []);
  const cur = useMemo(() => new THREE.Color(ACTS[0].particle), []);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const s = sceneState;
    cur.lerp(colors[s.act], 1 - Math.pow(0.0008, dt));
    mat.current.color.copy(cur);
    const arr = pts.current.geometry.attributes.position.array as Float32Array;
    const boost = 0.12 + Math.min(Math.abs(s.vel) * 0.0035, 2.4) + s.bridge * 2.2;
    for (let i = 0; i < count; i++) {
      const k = i * 3;
      arr[k + 1] += speeds[i] * boost * dt;
      arr[k + 2] += s.bridge * dt * 7;
      if (arr[k + 1] > 5.5) arr[k + 1] = -5.5;
      if (arr[k + 2] > 3) arr[k + 2] = -8;
    }
    pts.current.geometry.attributes.position.needsUpdate = true;
    pts.current.rotation.y += dt * 0.02;
    mat.current.opacity = 0.55 + s.bridge * 0.4;
  });

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={mat} map={tex} size={0.16} transparent depthWrite={false} sizeAttenuation opacity={0.6} />
    </points>
  );
}

export default function Particles({ count }: { count: number }) {
  return (
    <Canvas
      className="fx"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 55 }}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
    >
      <Field count={count} />
    </Canvas>
  );
}
