import { useMemo } from 'react';
import { endOfMonth, isWeekend, subDays, isBefore, isSameDay, addMonths, startOfDay } from 'date-fns';
import { Landmark } from 'lucide-react';
import type { Holiday } from '../types';

interface BankPaydayProps {
  holidays: Holiday[];
}

export function BankPayday({ holidays }: BankPaydayProps) {
  const nextPayday = useMemo(() => {
    let targetMonthDate = new Date();
    
    // Función auxiliar para obtener el primer día hábil hacia atrás desde una fecha dada (inclusive)
    const getPreviousBusinessDay = (date: Date) => {
      let candidate = date;
      while (true) {
        if (isWeekend(candidate)) {
          candidate = subDays(candidate, candidate.getDay() === 0 ? 2 : 1); 
        }
        const isHoliday = holidays.some(h => {
          const [year, month, day] = h.fecha.split("-");
          const hDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          return isSameDay(candidate, hDate);
        });

        if (isHoliday) {
          candidate = subDays(candidate, 1);
        } else if (isWeekend(candidate)) {
          continue;
        } else {
          break;
        }
      }
      return candidate;
    };

    const getPenultimateBusinessDay = (dateInMonth: Date) => {
      const lastDay = startOfDay(endOfMonth(dateInMonth));
      const lastBusiness = getPreviousBusinessDay(lastDay);
      return getPreviousBusinessDay(subDays(lastBusiness, 1));
    };

    let candidatePayday = getPenultimateBusinessDay(targetMonthDate);
    const today = startOfDay(new Date());

    if (isBefore(candidatePayday, today)) {
      targetMonthDate = addMonths(today, 1);
      candidatePayday = getPenultimateBusinessDay(targetMonthDate);
    }

    return candidatePayday;
  }, [holidays]);

  if (!nextPayday) return null;

  const isToday = isSameDay(nextPayday, new Date());

  return (
    <div className="w-full h-full space-y-4">
      <h4 className="text-sm font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase px-4 flex items-center">
        <Landmark className="w-4 h-4 mr-2" />
        Día de Cobro Bancario
      </h4>
      <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-secondary/30 rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-secondary/50 transition-colors shadow-sm dark:shadow-none h-[calc(100%-2.5rem)] min-h-[180px]">
        {isToday ? (
          <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-300 animate-pulse-slow">
            ¡ES HOY!
          </span>
        ) : (
          <>
            <span className="text-6xl md:text-7xl font-display font-black text-gray-800 dark:text-gray-100 tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-white/50 px-2 pb-2">
              {nextPayday.getDate()}
            </span>
            <span className="text-lg font-medium text-gray-500 capitalize mt-[-8px]">
              {new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(nextPayday)}
            </span>
            <span className="text-xs font-medium text-gray-400 mt-4 text-center border-t border-gray-100 dark:border-white/5 pt-4 w-full px-4">
              {new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(nextPayday)} (anteúltimo día hábil)
            </span>
          </>
        )}
      </div>
    </div>
  );
}
