import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = ({ durationMinutes = 30, timerId, onExpire, isEnabled = true }) => {
  const storageKey = `examiq_timer_${timerId}`;
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const hasExpiredRef = useRef(false);

  const getTargetEndTime = useCallback(() => {
    if (typeof window === 'undefined' || !timerId) return Date.now() + durationMinutes * 60 * 1000;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      const newTarget = Date.now() + durationMinutes * 60 * 1000;
      localStorage.setItem(storageKey, newTarget.toString());
      return newTarget;
    } catch {
      return Date.now() + durationMinutes * 60 * 1000;
    }
  }, [timerId, durationMinutes, storageKey]);

  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (!isEnabled) return durationMinutes * 60;
    const target = getTargetEndTime();
    return Math.max(0, Math.floor((target - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!isEnabled || !timerId) return;

    const targetEndTime = getTargetEndTime();

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((targetEndTime - Date.now()) / 1000));
      setSecondsRemaining(remaining);

      if (remaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        clearInterval(interval);
        if (onExpireRef.current) {
          onExpireRef.current();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isEnabled, timerId, getTargetEndTime]);

  const clearTimer = useCallback(() => {
    if (typeof window !== 'undefined' && timerId) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey, timerId]);

  // Format MM:SS or HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const isWarning = secondsRemaining <= 300 && secondsRemaining > 0; // Last 5 minutes
  const isExpired = secondsRemaining <= 0;

  return {
    secondsRemaining,
    formattedTime: formatTime(secondsRemaining),
    isWarning,
    isExpired,
    clearTimer,
  };
};

export default useTimer;
