'use client';

import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';

export function PostProcessing() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.8}
        luminanceSmoothing={0.9}
        intensity={1.8}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.0015, 0.0015)}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette
        darkness={0.65}
        offset={0.3}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={0.15}
      />
    </EffectComposer>
  );
}
