
import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-red-500 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 fixed bottom-0 w-full z-[10000] shadow-lg animate-in slide-in-from-bottom">
      <WifiOff size={14} />
      <span>You are currently offline. AI features will be unavailable and changes may not sync.</span>
    </div>
  );
};
