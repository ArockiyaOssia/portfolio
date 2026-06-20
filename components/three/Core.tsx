"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Icosahedron } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";

/**
 * Scroll-driven central "core" — a distorting icosahedron that stands in for
 * a GLTF hero model (swap <Icosahedron> for <primitive object={gltf.scene} />
 * later by dropping a .glb in /public/models and loading with useGLTF).
 */
export default function Core() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const p = scrollState.progress;
    ref.current.rotation.y += delta * 0.25;
    ref.current.rotation.z += delta * 0.05;
    // grow + push back slightly as you scroll into the story
    const target = 0.7 + p * 0.5;
    ref.current.scale.setScalar(
      THREE.MathUtils.lerp(ref.current.scale.x, target, 0.06)
    );
    ref.current.position.z = THREE.MathUtils.lerp(
      ref.current.position.z,
      -p * 2.5,
      0.05
    );
  });

  return (
    <Icosahedron ref={ref} args={[1.15, 6]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color="#0a1c3f"
        emissive="#1d4ed8"
        emissiveIntensity={0.3}
        roughness={0.25}
        metalness={0.7}
        distort={0.45}
        speed={1.8}
      />
    </Icosahedron>
  );
}
