"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";

/**
 * Animated low-poly terrain. Interactive: a raycast from the cursor onto the
 * plane raises a travelling bump (uMouse + uMouseStrength). Color mixes
 * gold -> coral by elevation.
 */
export default function WaveTerrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { camera, raycaster } = useThree();
  const ndc = useRef(new THREE.Vector2());
  const localHit = useRef(new THREE.Vector2(999, 999));
  const strength = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(999, 999) },
      uMouseStrength: { value: 0 },
      uGold: { value: new THREE.Color("#3b6dff") },
      uCoral: { value: new THREE.Color("#4cc9ff") },
      uBg: { value: new THREE.Color("#05070f") },
    }),
    []
  );

  useFrame((_, delta) => {
    if (!matRef.current || !meshRef.current) return;
    matRef.current.uniforms.uTime.value += delta;
    matRef.current.uniforms.uProgress.value = scrollState.progress;

    // Project cursor onto the terrain to get a local (plane-space) point.
    ndc.current.set(scrollState.pointer.x, scrollState.pointer.y);
    raycaster.setFromCamera(ndc.current, camera);
    const hit = raycaster.intersectObject(meshRef.current, false)[0];
    if (hit) {
      const local = meshRef.current.worldToLocal(hit.point.clone());
      localHit.current.set(local.x, local.y);
      strength.current = THREE.MathUtils.lerp(strength.current, 1, 0.09);
    } else {
      strength.current = THREE.MathUtils.lerp(strength.current, 0, 0.05);
    }
    matRef.current.uniforms.uMouse.value.copy(localHit.current);
    matRef.current.uniforms.uMouseStrength.value = strength.current;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.1, 0, 0]} position={[0, -6.5, -2]}>
      <planeGeometry args={[70, 70, 140, 140]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        wireframe
        transparent
        depthWrite={false}
        vertexShader={/* glsl */ `
          uniform float uTime;
          uniform float uProgress;
          uniform vec2  uMouse;
          uniform float uMouseStrength;
          varying float vElevation;
          void main() {
            vec3 p = position;
            float e =
              sin(p.x * 0.35 + uTime * 0.55) * 0.55 +
              sin(p.y * 0.4  - uTime * 0.42) * 0.55 +
              sin((p.x + p.y) * 0.22 + uTime * 0.28) * 0.85;
            e *= 1.0 + uProgress * 0.7;

            // interactive cursor bump
            float d = distance(p.xy, uMouse);
            float bump = exp(-d * d * 0.04) * 1.3 * uMouseStrength;
            e += bump;

            p.z += e;
            vElevation = e;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3  uGold;
          uniform vec3  uCoral;
          uniform vec3  uBg;
          uniform float uProgress;
          varying float vElevation;
          void main() {
            float t = smoothstep(-1.4, 2.4, vElevation);
            vec3 col = mix(uGold, uCoral, t);
            col = mix(uBg, col, 0.92);
            float alpha = mix(0.08, 0.5, t) * (0.5 + uProgress * 0.4);
            gl_FragColor = vec4(col, alpha);
          }
        `}
      />
    </mesh>
  );
}
