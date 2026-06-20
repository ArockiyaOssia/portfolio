"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";
import Brain from "./Brain";
import WaveTerrain from "./WaveTerrain";

const smooth = (f: number) => f * f * (3 - 2 * f);

/**
 * Camera flies through the scene on scroll — one waypoint per section, with
 * different positions AND angles, so scrolling reads as moving through 3D
 * space rather than a flat dolly. Cursor adds a small parallax on top.
 */
function Rig() {
  const { camera } = useThree();

  const path = useMemo(
    () => ({
      pos: [
        new THREE.Vector3(0, 0.8, 9.5), // hero
        new THREE.Vector3(-3.4, 1.4, 7.0), // about — swing left
        new THREE.Vector3(3.2, -0.5, 6.2), // experience — swing right + dip
        new THREE.Vector3(-2.2, 2.6, 5.0), // projects — rise, look down
        new THREE.Vector3(2.6, 0.3, 4.3), // skills — closer right
        new THREE.Vector3(0, -1.3, 3.5), // contact — push into core, low
      ],
      look: [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-0.6, 0.1, 0),
        new THREE.Vector3(0.4, -0.5, 0),
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(0.3, 0, 0),
        new THREE.Vector3(0, -0.7, 0),
      ],
    }),
    []
  );

  const target = useRef(new THREE.Vector3(0, 0.8, 9.5));
  const lookT = useRef(new THREE.Vector3());

  useFrame(() => {
    const n = path.pos.length - 1;
    const seg = THREE.MathUtils.clamp(scrollState.progress, 0, 1) * n;
    const i = Math.min(Math.floor(seg), n - 1);
    const f = smooth(seg - i);
    const ptr = scrollState.pointer;

    target.current.lerpVectors(path.pos[i], path.pos[i + 1], f);
    // low-sensitivity cursor parallax
    target.current.x += ptr.x * 0.22;
    target.current.y += ptr.y * 0.16;

    lookT.current.lerpVectors(path.look[i], path.look[i + 1], f);

    camera.position.lerp(target.current, 0.05);
    camera.lookAt(lookT.current);
  });
  return null;
}

export default function Scene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onMove = (e: PointerEvent) => {
      scrollState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scrollState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0.8, 9.5], fov: 50 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#05070f"]} />
        <fog attach="fog" args={["#05070f", 9, 28]} />

        <ambientLight intensity={0.5} />
        <pointLight position={[6, 6, 6]} intensity={70} color="#4cc9ff" />
        <pointLight position={[-6, -3, 4]} intensity={55} color="#3b6dff" />

        <Suspense fallback={null}>
          <Brain />
        </Suspense>
        <WaveTerrain />
        <Sparkles
          count={90}
          scale={[20, 14, 14]}
          size={1.6}
          speed={0.2}
          color="#9ecbff"
          opacity={0.4}
        />

        <Rig />
      </Canvas>

      {/* readability veils over the moving 3D */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(8,8,11,0.82)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(8,8,11,0.55)] via-transparent to-[rgba(8,8,11,0.7)]" />
    </div>
  );
}
