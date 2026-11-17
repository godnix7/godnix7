"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

export default function AbstractCore() {
  const groupRef = useRef<THREE.Group>(null);
  const orbitalRef = useRef<THREE.Group>(null);
  const satelliteRef = useRef<THREE.Mesh>(null);
  const pointer = useThree((state) => state.pointer);
  const nodes = useMemo(() => {
    const count = 28;
    return Array.from({ length: count }, (_, index) => {
      const y = 1 - (index / (count - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = Math.PI * (3 - Math.sqrt(5)) * index;
      return new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius).multiplyScalar(2.04);
    });
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, pointer.y * 0.14, 4, delta);
      groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, -pointer.x * 0.12, 4, delta);
    }
    if (orbitalRef.current) orbitalRef.current.rotation.y += delta * 0.15;
    if (satelliteRef.current) {
      const t = state.clock.elapsedTime * 0.55;
      satelliteRef.current.position.set(Math.cos(t) * 2.45, Math.sin(t * 0.7) * 0.38, Math.sin(t) * 2.45);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1.43, 5]} />
        <MeshDistortMaterial color="#d8fa63" roughness={0.19} metalness={0.62} distort={0.23} speed={1.1} radius={1} />
      </mesh>
      <mesh scale={1.51}>
        <icosahedronGeometry args={[1, 4]} />
        <meshBasicMaterial color="#efffa9" wireframe transparent opacity={0.12} />
      </mesh>

      <group ref={orbitalRef}>
        <mesh rotation={[0.5, 0.15, 0.65]}>
          <torusGeometry args={[2.04, 0.012, 8, 140]} />
          <meshBasicMaterial color="#e5fb89" transparent opacity={0.8} />
        </mesh>
        <mesh rotation={[1.27, -0.35, 0.2]}>
          <torusGeometry args={[2.23, 0.007, 8, 140]} />
          <meshBasicMaterial color="#ff8268" transparent opacity={0.7} />
        </mesh>
        {nodes.map((node, index) => (
          <mesh key={index} position={node} scale={index % 5 === 0 ? 0.045 : 0.025}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color={index % 4 === 0 ? "#ff8268" : "#ebffa1"} />
          </mesh>
        ))}
        <mesh ref={satelliteRef}>
          <octahedronGeometry args={[0.13, 0]} />
          <meshStandardMaterial color="#ff8268" emissive="#ff4f39" emissiveIntensity={0.7} metalness={0.3} roughness={0.25} />
        </mesh>
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.006, 8, 120]} />
        <meshBasicMaterial color="#f1ffbd" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}
