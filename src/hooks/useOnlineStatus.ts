import { useEffect, useState } from 'react';

/**
 * Hook to track online / offline network connectivity
 * Includes programmatic toggle for simulation / testing in demo environments
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(() => {
    try {
      return localStorage.getItem('foodbridge_simulated_offline') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleOnline = () => {
      if (!simulatedOffline) setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [simulatedOffline]);

  const toggleSimulatedOffline = () => {
    const nextState = !simulatedOffline;
    setSimulatedOffline(nextState);
    try {
      localStorage.setItem('foodbridge_simulated_offline', String(nextState));
    } catch {
      // ignore
    }
    setIsOnline(!nextState && (typeof navigator !== 'undefined' ? navigator.onLine : true));
  };

  return {
    isOnline: !simulatedOffline && isOnline,
    simulatedOffline,
    toggleSimulatedOffline,
  };
}
