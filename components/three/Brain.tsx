"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";

const COUNT = 55000;
const URL = "/models/brain.glb?v=2";
const TARGET = 6; // normalized max dimension
const FACE_Y = 0; // base yaw so the face points at the viewer (tuned)

/** Sample the GLB surface into a normalized, centered point cloud. */
function useModelPoints() {
  const { scene } = useGLTF(URL);

  return useMemo(() => {
    scene.updateMatrixWorld(true);

    const meshes: THREE.Mesh[] = [];
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.geometry?.attributes?.position) meshes.push(m);
    });

    const samplers = meshes.map((m) => {
      const s = new MeshSurfaceSampler(m).build();
      const g = m.geometry as THREE.BufferGeometry;
      const tris = g.index ? g.index.count / 3 : g.attributes.position.count / 3;
      return { s, m, tris };
    });
    const total = samplers.reduce((a, b) => a + b.tris, 0) || 1;
    let acc = 0;
    const cum = samplers.map((x) => (acc += x.tris, acc / total));

    const temp = new THREE.Vector3();
    const raw = new Float32Array(COUNT * 3);
    let minx = Infinity, miny = Infinity, minz = Infinity;
    let maxx = -Infinity, maxy = -Infinity, maxz = -Infinity;

    for (let i = 0; i < COUNT; i++) {
      const r = Math.random();
      let idx = cum.findIndex((c) => r <= c);
      if (idx < 0) idx = samplers.length - 1;
      const { s, m } = samplers[idx];
      s.sample(temp);
      temp.applyMatrix4(m.matrixWorld);
      raw[i * 3] = temp.x;
      raw[i * 3 + 1] = temp.y;
      raw[i * 3 + 2] = temp.z;
      if (temp.x < minx) minx = temp.x;
      if (temp.y < miny) miny = temp.y;
      if (temp.z < minz) minz = temp.z;
      if (temp.x > maxx) maxx = temp.x;
      if (temp.y > maxy) maxy = temp.y;
      if (temp.z > maxz) maxz = temp.z;
    }

    const cx = (minx + maxx) / 2;
    const cy = (miny + maxy) / 2;
    const cz = (minz + maxz) / 2;
    const dim = Math.max(maxx - minx, maxy - miny, maxz - minz) || 1;
    const scale = TARGET / dim;

    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const top = new THREE.Color("#bfe4ff");
    const mid = new THREE.Color("#3ba9f5");
    const low = new THREE.Color("#1b3fcc");
    const tmp = new THREE.Color();
    const half = TARGET / 2;

    for (let i = 0; i < COUNT; i++) {
      const x = (raw[i * 3] - cx) * scale;
      const y = (raw[i * 3 + 1] - cy) * scale;
      const z = (raw[i * 3 + 2] - cz) * scale;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      const h = THREE.MathUtils.clamp((y / half + 1) / 2, 0, 1);
      if (h > 0.5) tmp.copy(mid).lerp(top, (h - 0.5) / 0.5);
      else tmp.copy(low).lerp(mid, h / 0.5);
      const v = 0.55 + Math.random() * 0.2;
      colors[i * 3] = tmp.r * v;
      colors[i * 3 + 1] = tmp.g * v;
      colors[i * 3 + 2] = tmp.b * v;
    }
    return { positions, colors };
  }, [scene]);
}

export default function Brain() {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { positions, colors } = useModelPoints();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uSize: { value: 0.85 },
      uPixelRatio: { value: 1.5 },
      uOpacity: { value: 0.9 },
    }),
    []
  );

  // responsive placement: anchored in the right empty space on wide screens,
  // recentred as a dim backdrop on portrait/mobile.
  const { size } = useThree();
  const aspect = size.width / size.height;
  const { gx, gy, gz, gScale, gOpacity } = useMemo(() => {
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    if (aspect < 0.95) {
      // portrait / mobile — faint figure low behind the stacked text
      return { gx: 0, gy: -1.6, gz: -3.4, gScale: 0.62, gOpacity: 0.3 };
    }
    // landscape — slide further right + grow a touch on very wide screens
    const k = clamp01((aspect - 1.0) / 1.0);
    return {
      gx: 3.5 + k * 1.3,
      gy: -0.1,
      gz: -1.0,
      gScale: 0.7 + k * 0.2,
      gOpacity: 0.9,
    };
  }, [aspect]);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const ptr = scrollState.pointer;
    const p = scrollState.progress;
    const t = state.clock.elapsedTime;

    // scroll drives full 360° spin; mouse adds small orbit on top
    const yTarget = FACE_Y + p * Math.PI * 2 + ptr.x * 0.62 + Math.sin(t * 0.3) * 0.08;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, yTarget, 0.07);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, ptr.y * 0.22, 0.07);
    g.scale.setScalar(1 + p * 0.12);

    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
      matRef.current.uniforms.uMouse.value.set(ptr.x, ptr.y);
      matRef.current.uniforms.uOpacity.value = gOpacity;
    }
  });

  return (
    <group position={[gx, gy, gz]} scale={gScale}>
      <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={/* glsl */ `
            uniform float uSize;
            uniform float uPixelRatio;
            uniform vec2  uMouse;
            attribute vec3 aColor;
            varying vec3 vColor;
            varying float vForce;
            void main() {
              vColor = aColor;
              vec4 clip0 = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              vec2 scr = clip0.xy / clip0.w;
              vec2 diff = scr - uMouse;
              float md = length(diff);
              float force = smoothstep(0.20, 0.0, md);
              vForce = force;
              // screen-space repulsion: push particle away from cursor direction
              vec3 camRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
              vec3 camUp    = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
              vec2 pushDir  = md > 0.001 ? normalize(diff) : vec2(0.0);
              vec3 worldPush = (pushDir.x * camRight + pushDir.y * camUp) * force * 0.45;
              vec3 pos = position + worldPush;
              vec4 mv = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = uSize * uPixelRatio * (1.0 / -mv.z) * 16.0 * (1.0 + force * 0.6);
              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={/* glsl */ `
            uniform float uOpacity;
            varying vec3 vColor;
            varying float vForce;
            void main() {
              float d = length(gl_PointCoord - 0.5);
              float alpha = 1.0 - smoothstep(0.40, 0.5, d);
              if (alpha <= 0.001) discard;
              gl_FragColor = vec4(vColor, alpha * uOpacity);
            }
          `}
        />
      </points>
      </group>
    </group>
  );
}

useGLTF.preload(URL);
