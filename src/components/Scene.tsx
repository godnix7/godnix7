"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 26000;

function sphere(n: number) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = i * 2.399963;
    a.set([Math.cos(t) * r * 2.2, y * 2.2, Math.sin(t) * r * 2.2], i * 3);
  }
  return a;
}
function knot(n: number) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2 * 3;
    const j = (Math.random() - 0.5) * 0.35;
    const r = 1.6 + Math.cos((t * 2) / 3) * 0.9;
    a.set([r * Math.cos(t) * 1.15 + j, Math.sin((t * 2) / 3) * 1.6 + j, r * Math.sin(t) * 1.15 + j], i * 3);
  }
  return a;
}
function wave(n: number) {
  const a = new Float32Array(n * 3);
  const side = Math.ceil(Math.sqrt(n));
  for (let i = 0; i < n; i++) {
    const x = (i % side) / side - 0.5;
    const z = Math.floor(i / side) / side - 0.5;
    a.set([x * 9, Math.sin(x * 12) * Math.cos(z * 12) * 0.5 - 0.6, z * 9], i * 3);
  }
  return a;
}

const vert = /* glsl */ `
  uniform float uTime, uMix, uPx;
  uniform vec3 uMouse;
  attribute vec3 aB, aC;
  attribute float aSeed;
  varying float vDepth, vSeed;
  void main(){
    vec3 p = mix(mix(position, aB, clamp(uMix,0.,1.)), aC, clamp(uMix-1.,0.,1.));
    p += 0.05*vec3(sin(uTime*.6+aSeed*40.), cos(uTime*.5+aSeed*31.), sin(uTime*.4+aSeed*17.));
    vec3 d = p - uMouse;
    float f = smoothstep(1.5, 0., length(d));
    p += normalize(d+1e-4) * f * 0.7;
    vec4 mv = modelViewMatrix * vec4(p,1.);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.3 + aSeed*1.6 + f*2.5) * uPx * (7. / -mv.z);
    vDepth = clamp((-mv.z-5.)/6.,0.,1.);
    vSeed = aSeed + f;
  }`;
const frag = /* glsl */ `
  varying float vDepth, vSeed;
  void main(){
    float d = length(gl_PointCoord-.5);
    if(d>.5) discard;
    vec3 bone = vec3(.93,.89,.80), ember = vec3(1.,.36,.17);
    vec3 c = mix(bone, ember, smoothstep(.55,1.,vSeed));
    float a = smoothstep(.5,.1,d) * (1.-vDepth*.65);
    gl_FragColor = vec4(c, a*.9);
  }`;

function Particles() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const pts = useRef<THREE.Points>(null);
  const { a, b, c, seed } = useMemo(
    () => ({ a: sphere(COUNT), b: knot(COUNT), c: wave(COUNT), seed: Float32Array.from({ length: COUNT }, () => Math.random()) }),
    []
  );
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uMix: { value: 0 }, uPx: { value: 1 }, uMouse: { value: new THREE.Vector3(99, 99, 99) } }),
    []
  );
  const smooth = useRef({ x: 0, y: 0 });

  useFrame((state, dt) => {
    const u = mat.current!.uniforms;
    u.uTime.value += dt;
    u.uPx.value = state.gl.getPixelRatio();
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const prog = Math.min(1, window.scrollY / max);
    u.uMix.value += (prog * 2.6 - u.uMix.value) * Math.min(1, dt * 2.5);
    smooth.current.x += (state.pointer.x - smooth.current.x) * Math.min(1, dt * 3);
    smooth.current.y += (state.pointer.y - smooth.current.y) * Math.min(1, dt * 3);
    const g = pts.current!;
    g.rotation.y += dt * 0.08;
    g.rotation.x = -smooth.current.y * 0.25 + prog * 0.6;
    g.position.x = Math.sin(prog * Math.PI * 2) * 1.6;
    g.position.z = -prog * 1.5;
    g.updateMatrixWorld();
    const w = new THREE.Vector3(state.pointer.x * 4.2, state.pointer.y * 2.6, 0);
    u.uMouse.value.copy(g.worldToLocal(w));
  });

  return (
    <points ref={pts} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[a, 3]} />
        <bufferAttribute attach="attributes-aB" args={[b, 3]} />
        <bufferAttribute attach="attributes-aC" args={[c, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seed, 1]} />
      </bufferGeometry>
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms}
        transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function Scene() {
  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 1.75]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Particles />
      </Canvas>
    </div>
  );
}
