import { useMemo } from 'react';
import { motion } from 'framer-motion';

export function YearProgress() {
  const { percent, dayOfYear, totalDays, daysLeft } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const percent = Math.round((dayOfYear / totalDays) * 1000) / 10; // one decimal
    const daysLeft = totalDays - dayOfYear;
    return { percent, dayOfYear, totalDays, daysLeft };
  }, []);

  // SVG ring params
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-full flex flex-col"
    >
      <h4 className="text-sm font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4 px-1">
        📊 Progreso del año
      </h4>

      <div className="bg-white dark:bg-secondary rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none p-6 flex-1 flex items-center">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
          {/* SVG Ring */}
          <div className="relative flex-shrink-0">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-gray-100 dark:text-white/5"
              />
              {/* Progress ring */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                stroke="url(#yearGradient)"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="yearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-gray-800 dark:text-gray-100 tabular-nums">
                {percent}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-4 flex-1 min-w-0 w-full">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {new Date().getFullYear()}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Día {dayOfYear} de {totalDays}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-white/5 rounded-2xl px-4 py-3 border border-gray-100 dark:border-white/10 flex flex-col justify-center">
                <span className="text-xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">{dayOfYear}</span>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Días pasados</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 rounded-2xl px-4 py-3 border border-gray-100 dark:border-white/10 flex flex-col justify-center">
                <span className="text-xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">{daysLeft}</span>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Días restantes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
