import { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function InstallPWA() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Detect if already installed (standalone mode)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    setIsStandalone(isStandaloneMode);

    // Show prompt if not installed
    // We delay to not interrupt the initial load immediately
    if (!isStandaloneMode) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (isStandalone || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 150, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 150, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-3 sm:max-w-sm sm:mx-auto"
      >
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Instalar App</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">Accede rápido y sin conexión</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 text-sm text-gray-600 dark:text-gray-300 mt-1">
          {isIOS ? (
            <div className="flex flex-col gap-2">
              <p>Para iOS:</p>
              <p className="flex items-center gap-2">
                1. Toca compartir <Share className="w-4 h-4 ml-1" />
              </p>
              <p className="flex items-center gap-2">
                2. Elige <strong>Agregar a inicio</strong> <PlusSquare className="w-4 h-4 ml-1" />
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p>Activa el modo de aplicación nativo.</p>
              <p>Busca la opción <strong>Instalar Aplicación</strong> en las opciones de tu navegador o toca el banner inferior si aparece.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
