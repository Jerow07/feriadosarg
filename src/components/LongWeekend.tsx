import { useMemo } from 'react';
import { addDays, subDays, isWeekend, startOfDay } from 'date-fns';
import { Palmtree } from 'lucide-react';
import { motion } from 'framer-motion';
import type { UpcomingHoliday } from '../types';

interface LongWeekendProps {
  upcomingHolidays: UpcomingHoliday[];
}

interface LongWeekendInfo {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  holidays: UpcomingHoliday[];
  daysUntilStart: number;
}

/**
 * Detects long weekends (3+ consecutive non-working days)
 * by checking if holidays fall near weekends.
 * Works 100% offline — pure date math.
 */
function detectLongWeekends(holidays: UpcomingHoliday[]): LongWeekendInfo[] {
  const today = startOfDay(new Date());
  const results: LongWeekendInfo[] = [];

  // Build a Set of holiday date strings for fast lookup
  const holidayDates = new Set(
    holidays.map(h => h.date.toISOString().split('T')[0])
  );

  const isNonWorking = (date: Date): boolean => {
    const d = startOfDay(date);
    return isWeekend(d) || holidayDates.has(d.toISOString().split('T')[0]);
  };

  // For each upcoming holiday, expand outward to find the full non-working stretch
  const processed = new Set<string>();

  for (const holiday of holidays) {
    const key = holiday.date.toISOString().split('T')[0];
    if (processed.has(key)) continue;

    // Expand backward
    let start = startOfDay(holiday.date);
    while (isNonWorking(subDays(start, 1))) {
      start = subDays(start, 1);
    }

    // Expand forward
    let end = startOfDay(holiday.date);
    while (isNonWorking(addDays(end, 1))) {
      end = addDays(end, 1);
    }

    // Calculate total days in the stretch
    const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Only consider it a "finde largo" if it's 3+ days
    if (totalDays >= 3) {
      const startKey = start.toISOString().split('T')[0];
      if (!processed.has(startKey)) {
        // Collect all holidays in this stretch
        const stretchHolidays = holidays.filter(h => {
          const d = startOfDay(h.date);
          return d >= start && d <= end;
        });

        const daysUntilStart = Math.round((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Only show future or current long weekends
        if (daysUntilStart >= -1) {
          results.push({
            startDate: start,
            endDate: end,
            totalDays,
            holidays: stretchHolidays,
            daysUntilStart: Math.max(0, daysUntilStart),
          });
        }

        // Mark all days as processed
        let d = start;
        while (d <= end) {
          processed.add(d.toISOString().split('T')[0]);
          d = addDays(d, 1);
        }
      }
    }
  }

  return results.sort((a, b) => a.daysUntilStart - b.daysUntilStart);
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);

export function LongWeekend({ upcomingHolidays }: LongWeekendProps) {
  const longWeekends = useMemo(
    () => detectLongWeekends(upcomingHolidays).slice(0, 3),
    [upcomingHolidays]
  );

  if (longWeekends.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-full flex flex-col"
    >
      <h4 className="text-sm font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4 px-1">
        🏖️ Findes largos
      </h4>

      <div className="space-y-3 flex-1">
        {longWeekends.map((lw, i) => {
          const isCurrent = lw.daysUntilStart === 0;
          return (
            <motion.div
              key={lw.startDate.toISOString()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 24 }}
              className={`p-4 rounded-2xl border shadow-sm dark:shadow-none transition-colors ${
                isCurrent
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30'
                  : 'bg-white dark:bg-secondary border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-secondary/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    isCurrent
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-amber-50 dark:bg-amber-900/20'
                  }`}>
                    <Palmtree className={`w-5 h-5 ${
                      isCurrent ? 'text-green-600 dark:text-green-400' : 'text-amber-500'
                    }`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                      {lw.totalDays} días libres
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {formatDate(lw.startDate)} → {formatDate(lw.endDate)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {isCurrent ? (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800/30">
                      ¡Ahora! 🎉
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      en {lw.daysUntilStart} {lw.daysUntilStart === 1 ? 'día' : 'días'}
                    </span>
                  )}
                </div>
              </div>

              {/* Holiday names in this stretch */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {lw.holidays.map((h, j) => (
                  <span
                    key={j}
                    className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-full border border-gray-200 dark:border-white/10"
                  >
                    {h.nombre}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
