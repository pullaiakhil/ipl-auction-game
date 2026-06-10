'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useCountdown(initialTime: number, onComplete?: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback((newTime?: number) => {
    stop();
    setTimeLeft(newTime ?? initialTime);
  }, [stop, initialTime]);

  const setTime = useCallback((time: number) => {
    setTimeLeft(time);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const percentage = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;
  const urgency: 'normal' | 'warning' | 'critical' =
    timeLeft <= 5 ? 'critical' : timeLeft <= 10 ? 'warning' : 'normal';

  return {
    timeLeft,
    isRunning,
    percentage,
    urgency,
    start,
    stop,
    reset,
    setTime,
  };
}
