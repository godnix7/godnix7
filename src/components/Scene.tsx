"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Fixed wireframe "fabric": a flowing mesh that bulges and ripples around the
   cursor, fades into the distance and swings gently as you scroll. */
const vert = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  varying float vF, vFade;
  void main(){
    vec3 p = position;
    float h = sin(p.x*.45 + uTime*.45)*.55 + sin(p.z*.35 - uTime*.35)*.5 + sin((p.x+p.z)*.25 + uTime*.3)*.4;
    float d = distance(p.xz, uMouse);
    float f = smoothstep(5., 0., d);
    h += f * (1.5 + .35*sin(d*2.5 - uTime*4.));
    p.y = h;
    vFade = 1. - smoothstep(10., 26., length(p.xz));
    vF = f;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.);
  }`;
const frag = /* glsl */ `
  varying float vF, vFade;
  void main(){
    vec3 ink = vec3(.08,.09,.10), rust = vec3(.76,.255,.05);
    vec3 c = mix(ink, rust, smoothstep(.0,.9,vF));
    gl_FragColor = vec4(c, (.16 + vF*.7) * vFade);
  }`;

function Fabric() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const grp = useRef<THREE.Group>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(99, 99) } }), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const u = mat.current!.uniforms;
    u.uTime.value += dt;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const prog = Math.min(1, window.scrollY / max);
    const g = grp.current!;
    g.rotation.y += (Math.sin(prog * Math.PI) * 0.5 - g.rotation.y) * Math.min(1, dt * 2);
    g.position.y += (-3.4 + prog * 1.4 - g.position.y) * Math.min(1, dt * 2);
    g.updateMatrixWorld();
    ray.setFromCamera(state.pointer, state.camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0).applyMatrix4(g.matrixWorld);
    if (ray.ray.intersectPlane(plane, hit)) {
      const l = g.worldToLocal(hit.clone());
      u.uMouse.value.lerp(new THREE.Vector2(l.x, l.z), Math.min(1, dt * 6));
    }
  });

  return (
    <group ref={grp} position={[0, -3.4, -3]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
        <planeGeometry args={[60, 60, 110, 110]} />
        <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} wireframe transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function Scene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <Canvas
        camera={{ position: [0, 2.4, 9], fov: 52 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
      >
        <Fabric />
      </Canvas>
    </div>
  );
}
