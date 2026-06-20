"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";

const NODES = 64;
const MAX_DIST = 2.2;
const dummy = new THREE.Object3D();
const tmp = new THREE.Vector3();

/**
 * Floating knowledge-graph (GraphRAG nod). Interactive: nodes scatter away
 * from the cursor in screen-space, and the whole graph tilts toward the
 * pointer. Gold nodes, coral edges.
 */
export default function NodeGraph() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const points = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < NODES; i++) {
      const r = 2.6 + Math.random() * 1.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) * 0.7,
          r * Math.cos(phi)
        )
      );
    }
    return arr;
  }, []);

  const edgeGeo = useMemo(() => {
    const verts: number[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (points[i].distanceTo(points[j]) < MAX_DIST) {
          verts.push(points[i].x, points[i].y, points[i].z);
          verts.push(points[j].x, points[j].y, points[j].z);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    return g;
  }, [points]);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const p = scrollState.progress;
    const ptr = scrollState.pointer;

    g.rotation.y += delta * 0.06 + scrollState.velocity * 0.0005;
    // tilt toward the cursor
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      -0.15 + p * 0.5 - ptr.y * 0.35,
      0.05
    );
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, ptr.x * 0.25, 0.05);
    g.updateMatrixWorld();

    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        // screen-space repel from cursor
        tmp.copy(pt).applyMatrix4(g.matrixWorld).project(camera);
        const dx = tmp.x - ptr.x;
        const dy = tmp.y - ptr.y;
        const d2 = dx * dx + dy * dy;
        const force = Math.max(0, 0.16 - d2) / 0.16; // 0..1 near cursor
        const push = 1 + force * 0.5;

        const s = 0.06 + Math.sin(t * 1.4 + i) * 0.018 + force * 0.05;
        dummy.position.copy(pt).multiplyScalar(push);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, NODES]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#f5b94a"
          emissive="#f5b94a"
          emissiveIntensity={1.1}
          roughness={0.35}
        />
      </instancedMesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#ff7a90" transparent opacity={0.16} />
      </lineSegments>
    </group>
  );
}
