import { useState, useEffect } from 'react';
import { Sunrise, Sunset } from 'lucide-react';
import { motion } from 'framer-motion';

interface SunData {
  sunrise: string; // "HH:MM"
  sunset: string;
}

export function SunTimes() {
  const [sun, setSun] = useState<SunData | null>(null);

  useEffect(() => {
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=-34.6118&longitude=-58.4173&daily=sunrise,sunset&timezone=America/Argentina/Buenos_Aires&forecast_days=1'
    )
      .then(res => res.json())
      .then(data => {
        if (data.daily?.sunrise?.[0] && data.daily?.sunset?.[0]) {
          // Extract HH:MM from ISO strings like "2026-03-22T06:58"
          const sunriseTime = data.daily.sunrise[0].split('T')[1];
          const sunsetTime = data.daily.sunset[0].split('T')[1];
          setSun({ sunrise: sunriseTime, sunset: sunsetTime });
        }
      })
      .catch(() => setSun(null));
  }, []);

  if (!sun) return null;

  // Calculate sun progress (0 = sunrise, 1 = sunset)
  const now = new Date();
  const [riseH, riseM] = sun.sunrise.split(':').map(Number);
  const [setH, setM] = sun.sunset.split(':').map(Number);

  const sunriseMinutes = riseH * 60 + riseM;
  const sunsetMinutes = setH * 60 + setM;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const totalDaylight = sunsetMinutes - sunriseMinutes;
  const elapsed = nowMinutes - sunriseMinutes;
  const progress = Math.max(0, Math.min(1, elapsed / totalDaylight));
  const isDaytime = nowMinutes >= sunriseMinutes && nowMinutes <= sunsetMinutes;

  // Hours of daylight
  const daylightHours = Math.floor(totalDaylight / 60);
  const daylightMins = totalDaylight % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <h4 className="text-sm font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4 px-1">
        ☀️ Sol de hoy
      </h4>

      <div className="bg-white dark:bg-secondary rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none p-5 space-y-4">
        {/* Sunrise & Sunset times */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl shrink-0">
              <Sunrise className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium truncate">Amanecer</span>
              <span className="text-sm sm:text-lg font-bold text-gray-800 dark:text-gray-100 tabular-nums">{sun.sunrise}</span>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-center">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
              {daylightHours}h {daylightMins}m de luz
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="flex flex-col items-end min-w-0">
              <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium truncate">Atardecer</span>
              <span className="text-sm sm:text-lg font-bold text-gray-800 dark:text-gray-100 tabular-nums">{sun.sunset}</span>
            </div>
            <div className="p-1.5 sm:p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl shrink-0">
              <Sunset className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Mobile daylight hours */}
        <div className="sm:hidden flex justify-center pt-1 pb-1">
          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium px-2.5 py-1 bg-gray-50 dark:bg-white/5 rounded-full ring-1 ring-gray-100 dark:ring-white/5 shadow-sm">
            {daylightHours}h {daylightMins}m de luz
          </span>
        </div>

        {/* Sun progress bar */}
        <div className="relative">
          <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progress * 100}%`,
                background: isDaytime
                  ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                  : 'linear-gradient(90deg, #1e3a5f, #334155)',
              }}
            />
          </div>
          {/* Sun indicator dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-md border-2 transition-all duration-1000"
            style={{
              left: `calc(${progress * 100}% - 8px)`,
              background: isDaytime ? '#f59e0b' : '#475569',
              borderColor: isDaytime ? '#fbbf24' : '#64748b',
              boxShadow: isDaytime ? '0 0 8px rgba(245, 158, 11, 0.5)' : '0 0 8px rgba(71, 85, 105, 0.3)',
            }}
          />
        </div>

        {/* Status text */}
        <p className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
          {!isDaytime && nowMinutes < sunriseMinutes
            ? `El sol sale en ${sunriseMinutes - nowMinutes} minutos`
            : !isDaytime && nowMinutes > sunsetMinutes
              ? 'El sol ya se ocultó por hoy 🌙'
              : `Quedan ${sunsetMinutes - nowMinutes} minutos de luz solar`
          }
        </p>
      </div>
    </motion.div>
  );
}
