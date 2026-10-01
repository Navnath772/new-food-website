import { useEffect, useState } from 'react';

const EVENT_NAME = 'foodbridge_network_toggle';

/**
 * Hook to track online / offline network connectivity
 * Includes programmatic toggle for simulation / testing in demo environments
 * Synchronizes reactively across all mounted components
 */
export function useOnlineStatus() {
  const getSimulatedState = () => {
    try {
      return localStorage.getItem('foodbridge_simulated_offline') === 'true';
    } catch {
      return false;
    }
  };

  const getSystemOnline = () => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  };

  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(getSimulatedState);
  const [systemOnline, setSystemOnline] = useState<boolean>(getSystemOnline);

  useEffect(() => {
    const handleOnline = () => setSystemOnline(true);
    const handleOffline = () => setSystemOnline(false);

    const handleCustomChange = () => {
      setSimulatedOffline(getSimulatedState());
      setSystemOnline(getSystemOnline());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(EVENT_NAME, handleCustomChange);
    window.addEventListener('storage', handleCustomChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(EVENT_NAME, handleCustomChange);
      window.removeEventListener('storage', handleCustomChange);
    };
  }, []);

  const toggleSimulatedOffline = () => {
    const nextState = !getSimulatedState();
    try {
      localStorage.setItem('foodbridge_simulated_offline', String(nextState));
    } catch {
      // ignore
    }
    setSimulatedOffline(nextState);
    window.dispatchEvent(new Event(EVENT_NAME));
  };

  const effectiveOnline = !simulatedOffline && systemOnline;

  return {
    isOnline: effectiveOnline,
    simulatedOffline,
    toggleSimulatedOffline,
  };
}
