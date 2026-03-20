import { useState } from 'react';
import type { UpcomingHoliday, Holiday } from '../types';
import { Calendar } from 'lucide-react';
import { MiniCalendar } from './MiniCalendar';

interface CountdownProps {
  nextHoliday: UpcomingHoliday;
  holidays: Holiday[];
}

export function Countdown({ nextHoliday, holidays }: CountdownProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const isToday = nextHoliday.daysRemaining === 0;
  const isTomorrow = nextHoliday.daysRemaining === 1;



  const getDayOfWeek = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(date);
  };

  const getFormattedDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
    }).format(date);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="relative">
        <button 
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="bg-white dark:bg-secondary p-3 rounded-2xl ring-1 ring-gray-600 dark:ring-white/10 shadow-sm dark:shadow-none backdrop-blur-sm self-center flex items-center space-x-2 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-secondary/80 transition-colors cursor-pointer"
        >
          <Calendar size={18} />
          <span className="text-sm font-medium tracking-wide uppercase">Próximo Feriado</span>
        </button>
        
        {isCalendarOpen && (
          <MiniCalendar holidays={holidays} onClose={() => setIsCalendarOpen(false)} />
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-7xl md:text-9xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-white/50 animate-pulse-slow px-4 pb-4">
          {isToday ? '¡Hoy!' : nextHoliday.daysRemaining}
        </h2>
        {!isToday && !isTomorrow && (
          <p className="text-xl md:text-2xl font-medium text-gray-500 dark:text-gray-400">
            días
          </p>
        )}
      </div>

      <div className="space-y-1.5 mt-8 max-w-md mx-auto bg-gradient-to-b from-white dark:from-secondary to-transparent p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl dark:shadow-2xl">
        <h3 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-accent dark:to-yellow-200">
          {nextHoliday.nombre}
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-300 capitalize">
          {getDayOfWeek(nextHoliday.date)}, {getFormattedDate(nextHoliday.date)}
        </p>
        <span className="inline-block mt-2 px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-xs font-medium text-gray-500 dark:text-white capitalize border border-gray-200 dark:border-transparent">
          {nextHoliday.tipo}
        </span>
      </div>
    </div>
  );
}
