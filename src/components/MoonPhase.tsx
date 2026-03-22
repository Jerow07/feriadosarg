import { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Calculate moon phase using a simple synodic period algorithm.
 * Returns a value between 0 and 1 representing the moon phase:
 * 0.00 = New Moon
 * 0.25 = First Quarter
 * 0.50 = Full Moon
 * 0.75 = Last Quarter
 * 
 * No API needed — works 100% offline.
 */
function getMoonPhase(date: Date): number {
  // Reference new moon: January 6, 2000 18:14 UTC
  const referenceNewMoon = new Date('2000-01-06T18:14:00Z');
  const synodicMonth = 29.53058770576; // days

  const daysSinceRef = (date.getTime() - referenceNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((daysSinceRef % synodicMonth) + synodicMonth) % synodicMonth;
  return phase / synodicMonth; // normalize to 0-1
}

interface PhaseInfo {
  name: string;
  emoji: string;
  description: string;
}

function getPhaseInfo(phase: number): PhaseInfo {
  if (phase < 0.0625) return { name: 'Luna Nueva', emoji: '🌑', description: 'La luna no es visible desde la Tierra' };
  if (phase < 0.1875) return { name: 'Creciente Iluminante', emoji: '🌒', description: 'Un fino arco comienza a verse' };
  if (phase < 0.3125) return { name: 'Cuarto Creciente', emoji: '🌓', description: 'La mitad derecha está iluminada' };
  if (phase < 0.4375) return { name: 'Gibosa Creciente', emoji: '🌔', description: 'Más de la mitad está iluminada' };
  if (phase < 0.5625) return { name: 'Luna Llena', emoji: '🌕', description: 'La luna está completamente iluminada' };
  if (phase < 0.6875) return { name: 'Gibosa Menguante', emoji: '🌖', description: 'Comienza a decrecer la luz' };
  if (phase < 0.8125) return { name: 'Cuarto Menguante', emoji: '🌗', description: 'La mitad izquierda está iluminada' };
  if (phase < 0.9375) return { name: 'Creciente Menguante', emoji: '🌘', description: 'Solo un fino arco queda visible' };
  return { name: 'Luna Nueva', emoji: '🌑', description: 'La luna no es visible desde la Tierra' };
}

function getIlluminationPercent(phase: number): number {
  // Illumination follows a cosine curve
  return Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);
}

export function MoonPhase() {
  const { info, illumination, daysUntilFull, daysUntilNew } = useMemo(() => {
    const now = new Date();
    const phase = getMoonPhase(now);
    const info = getPhaseInfo(phase);
    const illumination = getIlluminationPercent(phase);

    // Calculate days until next full moon (phase = 0.5)
    const synodicMonth = 29.53;
    const currentDayInCycle = phase * synodicMonth;
    const fullMoonDay = 0.5 * synodicMonth;
    const daysUntilFull = currentDayInCycle <= fullMoonDay
      ? Math.round(fullMoonDay - currentDayInCycle)
      : Math.round(synodicMonth - currentDayInCycle + fullMoonDay);

    // Calculate days until next new moon (phase = 0)
    const daysUntilNew = Math.round(synodicMonth - currentDayInCycle);

    return { phase, info, illumination, daysUntilFull, daysUntilNew };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full"
    >
      <h4 className="text-sm font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4 px-1">
        🌙 Luna de hoy
      </h4>

      <div className="bg-white dark:bg-secondary rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none p-5">
        <div className="flex items-center gap-5">
          {/* Moon visual */}
          <div className="relative flex-shrink-0">
            <div className="text-5xl leading-none select-none" role="img" aria-label={info.name}>
              {info.emoji}
            </div>
          </div>

          {/* Moon info */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-gray-800 dark:text-gray-100">
                {info.name}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-800/30">
                {illumination}% iluminada
              </span>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {info.description}
            </p>

            {/* Illumination bar */}
            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mt-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${illumination}%` }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
                }}
              />
            </div>

            <div className="flex gap-3 mt-0.5">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                🌕 Llena en {daysUntilFull} {daysUntilFull === 1 ? 'día' : 'días'}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                🌑 Nueva en {daysUntilNew} {daysUntilNew === 1 ? 'día' : 'días'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
