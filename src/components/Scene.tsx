"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 34;
const PALETTE = ["#111110", "#ff2e7e", "#ffffff", "#111110", "#ff2e7e"];

type Item = { base: THREE.Vector3; kind: number; color: string; scale: number; spin: THREE.Vector3 };

function Shapes() {
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const items = useMemo<Item[]>(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        base: new THREE.Vector3((Math.random() - 0.5) * 13, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6 - 1),
        kind: i % 4,
        color: PALETTE[i % PALETTE.length],
        scale: 0.25 + Math.random() * 0.55,
        spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5),
      })),
    []
  );
  const vel = useMemo(() => items.map(() => new THREE.Vector3()), [items]);
  const off = useMemo(() => items.map(() => new THREE.Vector3()), [items]);

  useFrame((state, dt) => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const prog = Math.min(1, window.scrollY / max);
    const g = group.current!;
    g.rotation.y += (prog * Math.PI * 1.5 - g.rotation.y) * Math.min(1, dt * 2);
    g.position.y += (prog * 3 - g.position.y) * Math.min(1, dt * 2);
    g.updateMatrixWorld();
    const mouse = new THREE.Vector3(state.pointer.x * 6, state.pointer.y * 3.6, 0);
    const t = state.clock.elapsedTime;
    items.forEach((it, i) => {
      const m = meshes.current[i];
      if (!m) return;
      const world = it.base.clone().add(off[i]);
      world.y += Math.sin(t * 0.6 + i) * 0.25;
      const wp = world.clone().applyMatrix4(g.matrixWorld);
      const d = wp.clone().sub(mouse);
      d.z = 0;
      const dist = d.length();
      if (dist < 2.6) vel[i].add(d.normalize().multiplyScalar((2.6 - dist) * dt * 9));
      vel[i].multiplyScalar(0.92);
      off[i].add(vel[i].clone().multiplyScalar(dt * 6));
      off[i].multiplyScalar(0.985);
      m.position.copy(world);
      m.rotation.x += it.spin.x * dt + vel[i].y * 0.3;
      m.rotation.y += it.spin.y * dt + vel[i].x * 0.3;
      m.rotation.z += it.spin.z * dt;
    });
  });

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <mesh key={i} ref={(el) => { meshes.current[i] = el; }} scale={it.scale}>
          {it.kind === 0 && <torusGeometry args={[1, 0.38, 20, 48]} />}
          {it.kind === 1 && <icosahedronGeometry args={[1, 0]} />}
          {it.kind === 2 && <octahedronGeometry args={[1.1, 0]} />}
          {it.kind === 3 && <torusKnotGeometry args={[0.8, 0.28, 64, 12]} />}
          <meshStandardMaterial color={it.color} roughness={0.28} metalness={it.color === "#ffffff" ? 0.0 : 0.35} flatShading={it.kind === 1 || it.kind === 2} />
        </mesh>
      ))}
    </group>
  );
}

export default function Scene() {
  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 1.75]}>
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 6, 5]} intensity={2.4} />
        <pointLight position={[-6, -3, 3]} intensity={30} color="#ff2e7e" />
        <Shapes />
      </Canvas>
    </div>
  );
}
