"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from "@react-three/drei";

export default function AbstractCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Generate a procedural geometric "architecture"
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < 50; i++) {
      p.push(new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ));
    }
    return p;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* The "Core" - A glass-like distorted sphere representing the AI/Logic */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[1.5, 64, 64]} />
          <MeshDistortMaterial
            color="#3b82f6"
            speed={3}
            distort={0.4}
            radius={1}
            metalness={0.8}
            roughness={0.1}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Wireframe Shell - Representing the System Architecture */}
        <mesh>
          <icosahedronGeometry args={[2, 2]} />
          <meshStandardMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.1}
            metalness={1}
          />
        </mesh>

        {/* Inner Tech Bits - Floating particles/data */}
        {points.map((p, i) => (
          <mesh key={i} position={p}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2} />
          </mesh>
        ))}
      </Float>

      {/* Orbiting Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.01, 16, 100]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}
