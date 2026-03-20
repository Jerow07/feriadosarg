import { useMemo, useState } from 'react';
import { endOfMonth, isWeekend, subDays, addDays, isBefore, isSameDay, addMonths, startOfDay, startOfMonth } from 'date-fns';
import { Landmark, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Holiday } from '../types';

interface BankPaydayProps {
  holidays: Holiday[];
}

export function BankPayday({ holidays }: BankPaydayProps) {
  const [activeTab, setActiveTab] = useState<'bank' | 'normal'>('normal'); // 'normal' = 5th business day, 'bank' = penultimate business day

  // Memoized payday logic
  const paydays = useMemo(() => {
    let targetMonthBank = new Date();
    let targetMonthNormal = new Date();
    const today = startOfDay(new Date());
    
    // Helper para obtener el primer día hábil hacia atrás desde una fecha dada (inclusive)
    const getPreviousBusinessDay = (date: Date) => {
      let candidate = date;
      while (true) {
        if (isWeekend(candidate)) {
          candidate = subDays(candidate, candidate.getDay() === 0 ? 2 : 1); 
        }
        const isHoliday = holidays.some(h => {
          const [year, month, day] = h.fecha.split("-");
          return isSameDay(candidate, new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
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

    // Helper para obtener el primer día hábil hacia adelante desde una fecha (inclusive)
    const getNextBusinessDay = (date: Date) => {
      let candidate = date;
      while (true) {
        if (isWeekend(candidate)) {
          candidate = addDays(candidate, candidate.getDay() === 6 ? 2 : 1); 
        }
        const isHoliday = holidays.some(h => {
          const [year, month, day] = h.fecha.split("-");
          return isSameDay(candidate, new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
        });

        if (isHoliday) {
          candidate = addDays(candidate, 1);
        } else if (isWeekend(candidate)) {
          continue;
        } else {
          break;
        }
      }
      return candidate;
    };

    // Calcular el anteúltimo día hábil
    const getPenultimateBusinessDay = (dateInMonth: Date) => {
      const lastDay = startOfDay(endOfMonth(dateInMonth));
      const lastBusiness = getPreviousBusinessDay(lastDay);
      return getPreviousBusinessDay(subDays(lastBusiness, 1));
    };

    // Calcular el quinto día hábil
    const getFifthBusinessDay = (dateInMonth: Date) => {
      let current = startOfDay(startOfMonth(dateInMonth));
      current = getNextBusinessDay(current); // Día hábil 1
      for (let i = 1; i < 5; i++) {
        current = getNextBusinessDay(addDays(current, 1)); // Buscar siguientes 4 días hábiles
      }
      return current;
    };

    // Obtener las fechas para este mes inicial
    let bankDay = getPenultimateBusinessDay(targetMonthBank);
    let normalDay = getFifthBusinessDay(targetMonthNormal);

    // Si ya pasaron, buscar el del próximo mes
    if (isBefore(bankDay, today)) {
      targetMonthBank = addMonths(today, 1);
      bankDay = getPenultimateBusinessDay(targetMonthBank);
    }
    
    if (isBefore(normalDay, today)) {
      targetMonthNormal = addMonths(today, 1);
      normalDay = getFifthBusinessDay(targetMonthNormal);
    }

    return { bankDay, normalDay };
  }, [holidays]);

  const activePayday = activeTab === 'normal' ? paydays.normalDay : paydays.bankDay;
  const isToday = isSameDay(activePayday, new Date());

  const handleNextTab = () => {
    setActiveTab(prev => prev === 'normal' ? 'bank' : 'normal');
  };

  return (
    <div className="w-full h-full space-y-4">
      <div className="flex items-center justify-between px-4">
        <h4 className="text-sm font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase flex items-center gap-2">
          {activeTab === 'normal' ? <Briefcase className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
          {activeTab === 'normal' ? 'Cobro Normal' : 'Cobro Bancario'}
        </h4>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleNextTab}
            className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button 
            onClick={handleNextTab}
            className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden flex flex-col items-center justify-center p-6 bg-white dark:bg-secondary rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-secondary/80 transition-colors shadow-sm dark:shadow-none h-[calc(100%-2.5rem)] min-h-[180px]">
        {/* Usamos !key para forzar re-animación al cambiar de tab si se desea, o simplemente mostramos el contenido condicional */}
        <div key={activeTab} className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-4 duration-300">
          {isToday ? (
            <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-300 animate-pulse-slow">
              ¡ES HOY!
            </span>
          ) : (
            <>
              <span className="text-6xl md:text-7xl font-display font-black text-gray-800 dark:text-gray-100 tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-white/50 px-2 pb-2">
                {activePayday.getDate()}
              </span>
              <span className="text-lg font-medium text-gray-500 capitalize mt-[-8px]">
                {new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(activePayday)}
              </span>
              <span className="text-xs font-medium text-gray-400 mt-4 text-center border-t border-gray-100 dark:border-white/5 pt-4 w-full px-4">
                {new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(activePayday)} 
                {activeTab === 'normal' ? ' (5º día hábil)' : ' (anteúltimo día hábil)'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
