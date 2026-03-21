import { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/90 dark:bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-4 max-w-[90vw] w-fit border border-gray-800 dark:border-white/20"
      >
        <div className="flex items-center gap-3 text-white dark:text-gray-900">
          <WifiOff className="w-5 h-5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">Sin conexión</span>
            <span className="text-xs opacity-80">La app sigue funcionando offline</span>
          </div>
        </div>
        
        <button 
          onClick={() => setDismissed(true)}
          className="p-1 rounded-full hover:bg-white/10 dark:hover:bg-black/10 transition-colors text-white/70 dark:text-gray-900/70 hover:text-white dark:hover:text-black"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
