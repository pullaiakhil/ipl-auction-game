'use client';

import { useRef, useCallback, useEffect } from 'react';

interface AudioOptions {
  volume?: number;
  loop?: boolean;
}

export function useAudio() {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const globalMuted = useRef(false);

  const preload = useCallback((key: string, src: string) => {
    if (typeof window === 'undefined') return;
    const audio = new Audio(src);
    audio.preload = 'auto';
    audioRefs.current.set(key, audio);
  }, []);

  const play = useCallback((key: string, options: AudioOptions = {}) => {
    if (globalMuted.current) return;
    const audio = audioRefs.current.get(key);
    if (!audio) return;

    audio.volume = options.volume ?? 0.5;
    audio.loop = options.loop ?? false;
    audio.currentTime = 0;
    audio.play().catch(() => { /* ignore autoplay errors */ });
  }, []);

  const stop = useCallback((key: string) => {
    const audio = audioRefs.current.get(key);
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const stopAll = useCallback(() => {
    audioRefs.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    globalMuted.current = muted;
    if (muted) {
      audioRefs.current.forEach((audio) => {
        audio.pause();
      });
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(!globalMuted.current);
    return !globalMuted.current;
  }, [setMuted]);

  useEffect(() => {
    return () => {
      audioRefs.current.forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
      audioRefs.current.clear();
    };
  }, []);

  return {
    preload,
    play,
    stop,
    stopAll,
    setMuted,
    toggleMute,
    isMuted: globalMuted.current,
  };
}
