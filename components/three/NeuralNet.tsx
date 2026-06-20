"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";

const NEURONS = 150;
const K = 3; // synapses per neuron (nearest neighbours)
const PULSES = 70;
const R = 3.4;
const AXES = new THREE.Vector3(1.55, 1.05, 1.2); // brain-ish ellipsoid

const node = new THREE.Object3D();
const pulse = new THREE.Object3D();
const a = new THREE.Vector3();
const b = new THREE.Vector3();

function randDir() {
  // uniform direction
  const u = Math.random() * 2 - 1;
  const t = Math.random() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return new THREE.Vector3(s * Math.cos(t), u, s * Math.sin(t));
}

/**
 * Brain-like neural network: neuron nodes in a filled ellipsoid (denser
 * core), synapse links to nearest neighbours, and signal pulses that travel
 * along the links (firing). Slow organic drift + strong cursor reactivity.
 */
export default function NeuralNet() {
  const groupRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const pulsesRef = useRef<THREE.InstancedMesh>(null);

  const { points, sizes, edgeGeo, edges } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const sizes: number[] = [];
    for (let i = 0; i < NEURONS; i++) {
      const dir = randDir();
      const r = Math.pow(Math.random(), 0.6) * R; // denser toward centre
      points.push(
        new THREE.Vector3(
          dir.x * r * AXES.x,
          dir.y * r * AXES.y,
          dir.z * r * AXES.z
        )
      );
      sizes.push(0.05 + Math.random() * 0.07);
    }

    // nearest-neighbour synapses
    const set = new Set<string>();
    const edges: [number, number][] = [];
    for (let i = 0; i < NEURONS; i++) {
      const d = points
        .map((p, j) => ({ j, dist: i === j ? Infinity : p.distanceTo(points[i]) }))
        .sort((x, y) => x.dist - y.dist)
        .slice(0, K);
      for (const { j } of d) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!set.has(key)) {
          set.add(key);
          edges.push(i < j ? [i, j] : [j, i]);
        }
      }
    }

    const verts: number[] = [];
    for (const [i, j] of edges) {
      verts.push(points[i].x, points[i].y, points[i].z);
      verts.push(points[j].x, points[j].y, points[j].z);
    }
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(verts, 3)
    );

    return { points, sizes, edgeGeo, edges };
  }, []);

  // signal pulses travelling along edges
  const pulseState = useMemo(
    () =>
      Array.from({ length: PULSES }, () => ({
        edge: Math.floor(Math.random() * edges.length),
        t: Math.random(),
        speed: 0.25 + Math.random() * 0.5,
      })),
    [edges.length]
  );

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const ptr = scrollState.pointer;
    const p = scrollState.progress;

    // organic drift + strong cursor reactivity
    g.rotation.y += delta * 0.04;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, g.rotation.y + ptr.x * 0.01, 0.1);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, ptr.y * 0.5, 0.09);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, ptr.x * 0.25, 0.08);
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.02 + p * 0.1;
    g.scale.setScalar(breathe);

    // neuron pulse glow
    if (nodesRef.current) {
      const t = state.clock.elapsedTime;
      for (let i = 0; i < points.length; i++) {
        const s = sizes[i] * (1 + Math.sin(t * 2 + i * 0.7) * 0.25);
        node.position.copy(points[i]);
        node.scale.setScalar(s);
        node.updateMatrix();
        nodesRef.current.setMatrixAt(i, node.matrix);
      }
      nodesRef.current.instanceMatrix.needsUpdate = true;
    }

    // travelling signals
    if (pulsesRef.current) {
      for (let k = 0; k < pulseState.length; k++) {
        const ps = pulseState[k];
        ps.t += delta * ps.speed;
        if (ps.t > 1) {
          ps.t = 0;
          ps.edge = Math.floor(Math.random() * edges.length);
        }
        const [ei, ej] = edges[ps.edge];
        a.copy(points[ei]);
        b.copy(points[ej]);
        pulse.position.lerpVectors(a, b, ps.t);
        const fade = Math.sin(ps.t * Math.PI); // bright mid-edge
        pulse.scale.setScalar(0.04 + fade * 0.05);
        pulse.updateMatrix();
        pulsesRef.current.setMatrixAt(k, pulse.matrix);
      }
      pulsesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* neurons */}
      <instancedMesh ref={nodesRef} args={[undefined, undefined, NEURONS]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#bfe6ff"
          emissive="#7cc4ff"
          emissiveIntensity={2.2}
          roughness={0.3}
        />
      </instancedMesh>

      {/* synapses */}
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#3b6dff" transparent opacity={0.22} />
      </lineSegments>

      {/* travelling signals */}
      <instancedMesh ref={pulsesRef} args={[undefined, undefined, PULSES]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#d7f1ff" transparent opacity={0.95} />
      </instancedMesh>
    </group>
  );
}
