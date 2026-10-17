"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/* An interactive 3D "system core": a distorted solid, a wireframe lattice and
   orbiting rings. It leans toward the cursor and can be nudged by moving over it. */
function Core() {
  const group = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const lattice = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    const g = group.current!;
    g.rotation.y += (state.pointer.x * 0.9 - g.rotation.y) * Math.min(1, dt * 3);
    g.rotation.x += (-state.pointer.y * 0.6 - g.rotation.x) * Math.min(1, dt * 3);
    rings.current!.rotation.z += dt * 0.25;
    rings.current!.rotation.x += dt * 0.12;
    lattice.current!.rotation.y -= dt * 0.15;
  });

  return (
    <group ref={group}>
      <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh>
          <icosahedronGeometry args={[1.25, 12]} />
          <MeshDistortMaterial color="#c2410c" distort={0.32} speed={1.6} roughness={0.25} metalness={0.15} />
        </mesh>
        <mesh ref={lattice}>
          <icosahedronGeometry args={[1.85, 2]} />
          <meshBasicMaterial color="#14171a" wireframe transparent opacity={0.35} />
        </mesh>
        <group ref={rings}>
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[2.35, 0.018, 12, 160]} />
            <meshBasicMaterial color="#0e6b5c" />
          </mesh>
          <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
            <torusGeometry args={[2.7, 0.012, 12, 160]} />
            <meshBasicMaterial color="#14171a" />
          </mesh>
          <mesh position={[2.35, 0, 0]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshBasicMaterial color="#0e6b5c" />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

export default function HeroObject() {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 40 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 5, 6]} intensity={2.6} />
      <pointLight position={[-5, -2, 3]} intensity={18} color="#0e6b5c" />
      <Core />
    </Canvas>
  );
}
