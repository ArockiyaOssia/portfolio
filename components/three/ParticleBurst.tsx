"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";

const FILAMENTS = 180;
const PER = 120;
const COUNT = FILAMENTS * PER;
const MAX_R = 6.2;

/** Soft round sprite so points read as powder, not squares. */
function makeSprite() {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(200,230,255,0.9)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Radiating particle explosion (reference look): points scattered along
 * filaments from a dark core outward, denser inside, blue->cyan by radius.
 * Slow swirl + gentle low-sensitivity mouse parallax.
 */
export default function ParticleBurst() {
  const groupRef = useRef<THREE.Group>(null);
  const sprite = useMemo(() => makeSprite(), []);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);

    const inner = new THREE.Color("#dff1ff"); // near-white cyan core
    const mid = new THREE.Color("#4cc9ff"); // bright cyan-blue
    const outer = new THREE.Color("#1d4ed8"); // deep electric blue
    const tmp = new THREE.Color();

    let k = 0;
    for (let f = 0; f < FILAMENTS; f++) {
      // filament direction, biased toward a disc (flattened explosion)
      const theta = Math.random() * Math.PI * 2;
      const flat = (Math.random() - 0.5) * 0.7; // small z spread
      const dir = new THREE.Vector3(
        Math.cos(theta),
        Math.sin(theta) * 0.85,
        flat
      ).normalize();
      // perpendicular basis for powder spread
      const up = Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const p1 = new THREE.Vector3().crossVectors(dir, up).normalize();
      const p2 = new THREE.Vector3().crossVectors(dir, p1).normalize();

      for (let i = 0; i < PER; i++) {
        // concentrated inner, sparse outer
        const rN = Math.pow(Math.random(), 1.7);
        const r = 0.25 + rN * MAX_R;
        const spread = r * 0.22 * (Math.random() - 0.5) * 2;
        const spread2 = r * 0.22 * (Math.random() - 0.5) * 2;

        const x = dir.x * r + p1.x * spread + p2.x * spread2;
        const y = dir.y * r + p1.y * spread + p2.y * spread2;
        const z = dir.z * r + p1.z * spread + p2.z * spread2;

        positions[k * 3] = x;
        positions[k * 3 + 1] = y;
        positions[k * 3 + 2] = z;

        // color by radius: white-cyan -> cyan -> deep blue
        if (rN < 0.5) tmp.copy(inner).lerp(mid, rN / 0.5);
        else tmp.copy(mid).lerp(outer, (rN - 0.5) / 0.5);
        // slight per-point variance
        const v = 0.85 + Math.random() * 0.15;
        colors[k * 3] = tmp.r * v;
        colors[k * 3 + 1] = tmp.g * v;
        colors[k * 3 + 2] = tmp.b * v;
        k++;
      }
    }
    return { positions, colors };
  }, []);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const ptr = scrollState.pointer;
    const p = scrollState.progress;

    // strong, responsive cursor reactivity
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, ptr.y * 0.5, 0.09);
    const yTarget = g.rotation.y + delta * 0.02 + ptr.x * 0.012;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, yTarget, 0.12);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, ptr.x * 0.3, 0.08);

    // gentle breathing + slight expansion on scroll
    const s = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.015 + p * 0.12;
    g.scale.setScalar(s);
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          sizeAttenuation
          map={sprite}
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
