import type { UpcomingHoliday } from '../types';

interface UpcomingHolidaysProps {
  holidays: UpcomingHoliday[];
}

export function UpcomingHolidays({ holidays }: UpcomingHolidaysProps) {
  if (holidays.length === 0) return null;

  return (
    <div className="w-full h-full space-y-4">
      <h4 className="text-sm font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase px-4 text-left">
        Siguientes feriados
      </h4>
      <div className="space-y-3">
        {holidays.map((h, i) => (
          <div 
            key={`${h.fecha}-${i}`}
            className="flex items-center justify-between p-4 bg-white dark:bg-secondary/30 rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-secondary/50 transition-colors shadow-sm dark:shadow-none"
          >
            <div className="flex flex-col text-left">
              <span className="font-semibold text-gray-800 dark:text-gray-200">{h.nombre}</span>
              <span className="text-sm text-gray-500 capitalize">
                {new Intl.DateTimeFormat('es-AR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                }).format(h.date)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-yellow-600 dark:text-accent">
                {h.daysRemaining}
              </span>
              <span className="text-xs text-gray-500 ml-1">días</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
