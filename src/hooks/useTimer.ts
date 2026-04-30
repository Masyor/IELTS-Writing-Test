import { useState, useEffect, useCallback } from 'react';

export function useTimer(initialSeconds: number, onComplete?: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      onComplete?.();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const start = useCallback(() => setIsActive(true), []);
  const pause = useCallback(() => setIsActive(false), []);
  const reset = useCallback((seconds: number) => {
    setTimeLeft(seconds);
    setIsActive(false);
  }, []);

  const formatTime = useCallback(() => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    return {
      hours,
      minutes,
      seconds,
      formatted: `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
  }, [timeLeft]);

  return { timeLeft, isActive, start, pause, reset, formatTime, setTimeLeft };
}
