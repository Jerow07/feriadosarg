import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CalendarPlus, Wifi, Smartphone, Check, X } from 'lucide-react';

const CURRENT_VERSION = '2.0.0';

export function ReleaseNotes() {
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    // Verificar temporalidad para no molestar si ya lo vio
    const lastSeenVersion = localStorage.getItem('feriados_last_version');
    
    if (lastSeenVersion !== CURRENT_VERSION) {
      // Damos un pequeño delay para que la app cargue primero
      const timer = setTimeout(() => {
        setShowNotes(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowNotes(false);
    localStorage.setItem('feriados_last_version', CURRENT_VERSION);
  };

  const features = [
    {
      icon: <CalendarPlus className="w-5 h-5 text-blue-500" />,
      title: 'Exportá a tu Calendario',
      description: 'Añadí todos los feriados a Google Calendar o Apple Calendar con un solo clic.'
    },
    {
      icon: <Wifi className="w-5 h-5 text-green-500" />,
      title: 'Soporte 100% Offline',
      description: 'Llevá los feriados a todos lados. La app ahora funciona incluso sin conexión a internet.'
    },
    {
      icon: <Smartphone className="w-5 h-5 text-purple-500" />,
      title: 'Instalación Nativa (PWA)',
      description: 'Instalá FeriadosArg en tu pantalla de inicio como una app más de tu celular.'
    },
    {
      icon: <Sparkles className="w-5 h-5 text-yellow-500" />,
      title: 'Nuevas Animaciones',
      description: 'Una experiencia visual mucho más fluida, rápida y placentera.'
    }
  ];

  if (!showNotes) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-16 -mt-16" />
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors z-10"
              aria-label="Cerrar novedades"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative z-10 flex flex-col items-center">
              <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3 backdrop-blur-md">
                Versión {CURRENT_VERSION}
              </span>
              <h2 className="text-2xl font-black text-white shrink-0 tracking-tight">
                ¡Novedades en FeriadosArg!
              </h2>
              <p className="text-yellow-50 text-sm mt-1 font-medium">
                Descubrí todo lo nuevo que sumamos.
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              {features.map((feature, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  key={i} 
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-white/5">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 leading-none mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={handleClose}
              className="w-full py-3.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl transition-colors shadow-lg shadow-gray-200 dark:shadow-none flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              ¡Genial, a probar!
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
