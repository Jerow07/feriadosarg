import { useMemo, useState, useEffect } from 'react';
import { endOfMonth, isWeekend, subDays, addDays, isBefore, isSameDay, addMonths, startOfDay, startOfMonth } from 'date-fns';
import { Landmark, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Holiday } from '../types';

interface BankPaydayProps {
  holidays: Holiday[];
}

export function BankPayday({ holidays }: BankPaydayProps) {
  const [activeTab, setActiveTab] = useState<'bank' | 'normal'>('normal'); 
  const [normalPaydayType, setNormalPaydayType] = useState<'first' | 'second' | 'third' | 'fourth' | 'fifth' | 'last'>(() => {
    return (localStorage.getItem('feriadosarg_normalPaydayType') as 'first' | 'second' | 'third' | 'fourth' | 'fifth' | 'last') || 'fifth';
  });

  useEffect(() => {
    localStorage.setItem('feriadosarg_normalPaydayType', normalPaydayType);
  }, [normalPaydayType]);

  const paydays = useMemo(() => {
    let targetMonthBank = new Date();
    let targetMonthNormal = new Date();
    const today = startOfDay(new Date());
    
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

    const getPenultimateBusinessDay = (dateInMonth: Date) => {
      const lastDay = startOfDay(endOfMonth(dateInMonth));
      const lastBusiness = getPreviousBusinessDay(lastDay);
      return getPreviousBusinessDay(subDays(lastBusiness, 1));
    };

    const getNthBusinessDay = (dateInMonth: Date, n: number) => {
      let current = startOfDay(startOfMonth(dateInMonth));
      current = getNextBusinessDay(current); 
      for (let i = 1; i < n; i++) {
        current = getNextBusinessDay(addDays(current, 1)); 
      }
      return current;
    };

    const getLastBusinessDay = (dateInMonth: Date) => {
      return getPreviousBusinessDay(startOfDay(endOfMonth(dateInMonth)));
    };

    const getNormalDay = (dateInMonth: Date) => {
      switch (normalPaydayType) {
        case 'first': return getNthBusinessDay(dateInMonth, 1);
        case 'second': return getNthBusinessDay(dateInMonth, 2);
        case 'third': return getNthBusinessDay(dateInMonth, 3);
        case 'fourth': return getNthBusinessDay(dateInMonth, 4);
        case 'fifth': return getNthBusinessDay(dateInMonth, 5);
        case 'last': return getLastBusinessDay(dateInMonth);
        default: return getNthBusinessDay(dateInMonth, 5);
      }
    };

    let bankDay = getPenultimateBusinessDay(targetMonthBank);
    let normalDay = getNormalDay(targetMonthNormal);

    if (isBefore(bankDay, today)) {
      targetMonthBank = addMonths(today, 1);
      bankDay = getPenultimateBusinessDay(targetMonthBank);
    }
    
    if (isBefore(normalDay, today)) {
      targetMonthNormal = addMonths(today, 1);
      normalDay = getNormalDay(targetMonthNormal);
    }

    // Función para calcular días hábiles entre hoy (sin contar hoy) y una fecha objetivo
    const getBusinessDaysUntil = (targetDate: Date) => {
      let count = 0;
      let iterDate = addDays(today, 1); // empezamos desde mañana
      while (isBefore(iterDate, targetDate) || isSameDay(iterDate, targetDate)) {
        if (!isWeekend(iterDate)) {
          const isHol = holidays.some(h => {
            const [year, month, day] = h.fecha.split("-");
            return isSameDay(iterDate, new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
          });
          if (!isHol) {
            count++;
          }
        }
        iterDate = addDays(iterDate, 1);
      }
      return count;
    };

    return { 
      bankDay, 
      normalDay, 
      businessDaysToBank: getBusinessDaysUntil(bankDay),
      businessDaysToNormal: getBusinessDaysUntil(normalDay)
    };
  }, [holidays, normalPaydayType]);

  const activePayday = activeTab === 'normal' ? paydays.normalDay : paydays.bankDay;
  const activeBusinessDays = activeTab === 'normal' ? paydays.businessDaysToNormal : paydays.businessDaysToBank;
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

      <div className="relative flex flex-col items-center justify-center p-6 bg-white dark:bg-secondary rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-secondary/80 transition-colors shadow-sm dark:shadow-none h-[calc(100%-2.5rem)] min-h-[180px] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center w-full"
          >
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
                <div className="flex flex-col items-center mt-4 border-t border-gray-100 dark:border-white/5 pt-4 w-full gap-2 z-10 relative">
                  <span className="text-xs font-medium text-gray-400 text-center px-4 flex items-center justify-center gap-1 flex-wrap">
                    {new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(activePayday)} 
                    {activeTab === 'normal' ? (
                      <select
                        value={normalPaydayType}
                        onChange={(e) => setNormalPaydayType(e.target.value as 'first' | 'second' | 'third' | 'fourth' | 'fifth' | 'last')}
                        className="bg-transparent border-b border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-400 focus:outline-none text-gray-500 dark:text-gray-400 cursor-pointer text-xs p-0 appearance-none text-center transition-colors pb-0.5 pointer-events-auto"
                        style={{ textAlignLast: 'center' }}
                      >
                        <option value="first">(1º día hábil)</option>
                        <option value="second">(2º día hábil)</option>
                        <option value="third">(3º día hábil)</option>
                        <option value="fourth">(4º día hábil)</option>
                        <option value="fifth">(5º día hábil)</option>
                        <option value="last">(último día hábil)</option>
                      </select>
                    ) : ' (anteúltimo día hábil)'}
                  </span>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-blue-100 dark:border-blue-800/30">
                    {activeBusinessDays === 1 ? 'Falta' : 'Faltan'} {activeBusinessDays} {activeBusinessDays === 1 ? 'día hábil' : 'días hábiles'} para cobrar
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
