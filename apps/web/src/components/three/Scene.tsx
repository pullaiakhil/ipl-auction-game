'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { Trophy } from './Trophy';
import { ParticleSystem } from './ParticleSystem';
import { PostProcessing } from './PostProcessing';

interface SceneProps {
  className?: string;
}

export function Scene({ className }: SceneProps) {
  return (
    <div className={`w-full h-full ${className || ''}`}>
      <Canvas
        camera={{ position: [0, 1.5, 7], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: 3, // ACESFilmicToneMapping
          toneMappingExposure: 1.2,
        }}
        shadows
        dpr={[1, 2]}
      >
        <color attach="background" args={['#030014']} />
        <fog attach="fog" args={['#030014', 8, 25]} />

        {/* Lighting */}
        <ambientLight intensity={0.15} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-far={20}
          color="#FFE4B5"
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#6366f1" />
        <spotLight
          position={[0, 10, 0]}
          intensity={3}
          angle={0.3}
          penumbra={1}
          color="#FFD700"
          castShadow
        />
        <pointLight position={[3, 2, 3]} intensity={0.5} color="#6366f1" />
        <pointLight position={[-3, 2, -3]} intensity={0.5} color="#f59e0b" />

        {/* Environment */}
        <Suspense fallback={null}>
          <Environment preset="night" />
        </Suspense>

        {/* Stars background */}
        <Stars radius={50} depth={50} count={300} factor={3} saturation={0.5} fade speed={0.5} />

        {/* Trophy */}
        <Suspense fallback={null}>
          <Trophy />
        </Suspense>

        {/* Particles */}
        <ParticleSystem count={150} spread={5} />

        {/* Ground reflection plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial
            color="#030014"
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Post Processing */}
        <PostProcessing />
      </Canvas>
    </div>
  );
}
