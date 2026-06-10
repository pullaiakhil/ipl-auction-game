'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleSystemProps {
  count?: number;
  spread?: number;
  colors?: string[];
}

export function ParticleSystem({ count = 3000, spread = 6, colors = ['#FFD700', '#6366f1', '#f59e0b', '#ec4899'] }: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * spread;

      temp.push({
        position: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        ),
        speed: 0.2 + Math.random() * 0.8,
        offset: Math.random() * Math.PI * 2,
        scale: 0.01 + Math.random() * 0.03,
        colorIndex: Math.floor(Math.random() * colors.length),
      });
    }
    return temp;
  }, [count, spread, colors.length]);

  const colorArray = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      tempColor.set(colors[particles[i].colorIndex]);
      arr[i * 3] = tempColor.r;
      arr[i * 3 + 1] = tempColor.g;
      arr[i * 3 + 2] = tempColor.b;
    }
    return arr;
  }, [count, colors, particles]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const p = particles[i];

      dummy.position.set(
        p.position.x + Math.sin(time * p.speed + p.offset) * 0.3,
        p.position.y + Math.cos(time * p.speed * 0.7 + p.offset) * 0.3,
        p.position.z + Math.sin(time * p.speed * 0.5 + p.offset * 2) * 0.2
      );

      const pulse = 1 + Math.sin(time * 2 + p.offset) * 0.3;
      dummy.scale.setScalar(p.scale * pulse);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color="#FFD700"
        transparent
        opacity={0.8}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
