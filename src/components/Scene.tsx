"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Fixed, low-contrast 3D terrain of points that ripples around the cursor and
   tilts with scroll. It sits behind the page content. */
const SIDE = 150;

const vert = /* glsl */ `
  uniform float uTime, uPx;
  uniform vec2 uMouse;
  varying float vH, vF;
  void main(){
    vec3 p = position;
    float h = sin(p.x*.55 + uTime*.5)*.35 + cos(p.z*.5 + uTime*.4)*.35;
    float d = distance(p.xz, uMouse);
    float f = smoothstep(4.5, 0., d);
    h += f * (1.2 + .5*sin(d*3. - uTime*4.));
    p.y = h;
    vec4 mv = modelViewMatrix * vec4(p,1.);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.4 + f*3.) * uPx * (14. / -mv.z);
    vH = h; vF = f;
  }`;
const frag = /* glsl */ `
  varying float vH, vF;
  void main(){
    float d = length(gl_PointCoord-.5);
    if(d>.5) discard;
    vec3 teal = vec3(.055,.42,.36), warm = vec3(.79,.51,.17);
    vec3 c = mix(teal, warm, smoothstep(.2,1.,vF));
    gl_FragColor = vec4(c, .55 + vF*.4);
  }`;

function Terrain() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const grp = useRef<THREE.Group>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(SIDE * SIDE * 3);
    for (let i = 0; i < SIDE; i++)
      for (let j = 0; j < SIDE; j++) a.set([(i - SIDE / 2) * 0.28, 0, (j - SIDE / 2) * 0.28], (i * SIDE + j) * 3);
    return a;
  }, []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPx: { value: 1 }, uMouse: { value: new THREE.Vector2(99, 99) } }), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const u = mat.current!.uniforms;
    u.uTime.value += dt;
    u.uPx.value = state.gl.getPixelRatio();
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const prog = Math.min(1, window.scrollY / max);
    const g = grp.current!;
    g.rotation.y += (prog * 0.9 - g.rotation.y) * Math.min(1, dt * 2);
    g.updateMatrixWorld();
    ray.setFromCamera(state.pointer, state.camera);
    const inv = new THREE.Plane().copy(plane).applyMatrix4(g.matrixWorld);
    if (ray.ray.intersectPlane(inv, hit)) {
      const local = g.worldToLocal(hit.clone());
      u.uMouse.value.lerp(new THREE.Vector2(local.x, local.z), Math.min(1, dt * 6));
    }
  });

  return (
    <group ref={grp} position={[0, -3.2, -4]}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} />
      </points>
    </group>
  );
}

export default function Scene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <Canvas
        camera={{ position: [0, 2.2, 9], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false }}
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
      >
        <Terrain />
      </Canvas>
    </div>
  );
}
