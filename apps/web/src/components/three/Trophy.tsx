'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Trophy() {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Create cup profile for LatheGeometry
  const cupPoints = useMemo(() => {
    const points: THREE.Vector2[] = [];
    // Base
    points.push(new THREE.Vector2(0.0, 0));
    points.push(new THREE.Vector2(0.8, 0));
    points.push(new THREE.Vector2(0.85, 0.05));
    points.push(new THREE.Vector2(0.85, 0.15));
    points.push(new THREE.Vector2(0.8, 0.2));
    // Stem
    points.push(new THREE.Vector2(0.25, 0.3));
    points.push(new THREE.Vector2(0.2, 0.5));
    points.push(new THREE.Vector2(0.18, 0.7));
    // Node
    points.push(new THREE.Vector2(0.3, 0.75));
    points.push(new THREE.Vector2(0.3, 0.85));
    points.push(new THREE.Vector2(0.2, 0.9));
    // Cup body
    points.push(new THREE.Vector2(0.2, 1.0));
    points.push(new THREE.Vector2(0.35, 1.2));
    points.push(new THREE.Vector2(0.55, 1.5));
    points.push(new THREE.Vector2(0.7, 1.8));
    points.push(new THREE.Vector2(0.8, 2.1));
    points.push(new THREE.Vector2(0.85, 2.4));
    points.push(new THREE.Vector2(0.83, 2.6));
    // Rim
    points.push(new THREE.Vector2(0.88, 2.65));
    points.push(new THREE.Vector2(0.9, 2.7));
    points.push(new THREE.Vector2(0.88, 2.75));
    points.push(new THREE.Vector2(0.82, 2.78));
    // Inner cup
    points.push(new THREE.Vector2(0.78, 2.75));
    points.push(new THREE.Vector2(0.75, 2.6));
    points.push(new THREE.Vector2(0.7, 2.3));
    points.push(new THREE.Vector2(0.6, 2.0));
    points.push(new THREE.Vector2(0.45, 1.7));
    points.push(new THREE.Vector2(0.3, 1.4));
    points.push(new THREE.Vector2(0.15, 1.1));
    points.push(new THREE.Vector2(0.0, 1.0));
    return points;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Slow idle rotation
      groupRef.current.rotation.y += 0.003;
      // Gentle float
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.2, 0]} scale={0.9}>
      {/* Main Cup Body */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[cupPoints, 64]} />
        <meshStandardMaterial
          color="#D4AF37"
          metalness={0.95}
          roughness={0.08}
          envMapIntensity={2.5}
          emissive="#B8860B"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Left Handle */}
      <mesh position={[-0.95, 1.8, 0]} rotation={[0, 0, Math.PI * 0.15]} castShadow>
        <torusGeometry args={[0.35, 0.06, 16, 32, Math.PI]} />
        <meshStandardMaterial
          color="#D4AF37"
          metalness={0.95}
          roughness={0.08}
          envMapIntensity={2.5}
          emissive="#B8860B"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Right Handle */}
      <mesh position={[0.95, 1.8, 0]} rotation={[0, Math.PI, Math.PI * 0.15]} castShadow>
        <torusGeometry args={[0.35, 0.06, 16, 32, Math.PI]} />
        <meshStandardMaterial
          color="#D4AF37"
          metalness={0.95}
          roughness={0.08}
          envMapIntensity={2.5}
          emissive="#B8860B"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Base Ring 1 */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <torusGeometry args={[0.82, 0.04, 16, 48]} />
        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.05} emissive="#FFD700" emissiveIntensity={0.2} />
      </mesh>

      {/* Base Ring 2 */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <torusGeometry args={[0.78, 0.03, 16, 48]} />
        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.05} emissive="#FFD700" emissiveIntensity={0.15} />
      </mesh>

      {/* Rim Ring */}
      <mesh position={[0, 2.72, 0]} castShadow>
        <torusGeometry args={[0.86, 0.04, 16, 48]} />
        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.03} emissive="#FFD700" emissiveIntensity={0.3} />
      </mesh>

      {/* Node decorations */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <torusGeometry args={[0.28, 0.03, 16, 32]} />
        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.05} emissive="#FFD700" emissiveIntensity={0.2} />
      </mesh>

      {/* Base plate */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.9, 1.0, 0.05, 48]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Glow sphere (for bloom) */}
      <mesh ref={glowRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[1.3, 16, 16]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.03}
          toneMapped={false}
        />
      </mesh>

      {/* Point light inside cup for glow */}
      <pointLight position={[0, 2.2, 0]} color="#FFD700" intensity={2} distance={3} />
      <pointLight position={[0, 0.5, 0]} color="#D4AF37" intensity={1} distance={2} />
    </group>
  );
}
