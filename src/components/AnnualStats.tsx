import { useMemo } from 'react';
import type { Holiday } from '../types';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Target, Palmtree, CalendarDays } from 'lucide-react';
import { isBefore, startOfDay, getDay } from 'date-fns';

interface AnnualStatsProps {
  holidays: Holiday[];
}

export function AnnualStats({ holidays }: AnnualStatsProps) {
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const currentYear = today.getFullYear();
    
    // Solo contar feriados de este año
    const thisYearHolidays = holidays.filter(h => h.fecha.startsWith(String(currentYear)));
    
    // Feriados transcurridos vs por venir
    const pastHolidays = thisYearHolidays.filter(h => {
      const [year, month, day] = h.fecha.split("-").map(Number);
      return isBefore(new Date(year, month - 1, day), today);
    });
    const remainingHolidays = thisYearHolidays.length - pastHolidays.length;

    // Fines de semana largos (Feriados que caen Lunes o Viernes)
    const longWeekends = thisYearHolidays.filter(h => {
      const [year, month, day] = h.fecha.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      const weekDay = getDay(date);
      // 1 = Lunes, 5 = Viernes, y le sumamos los "Puente turístico"
      return weekDay === 1 || weekDay === 5 || h.tipo === 'puente';
    }).length;

    // Feriados en fin de semana (Sábado o Domingo)
    const weekendHolidays = thisYearHolidays.filter(h => {
      const [year, month, day] = h.fecha.split("-").map(Number);
      const weekDay = getDay(new Date(year, month - 1, day));
      return weekDay === 0 || weekDay === 6;
    }).length;

    return {
      total: thisYearHolidays.length,
      remaining: remainingHolidays,
      longWeekends,
      weekendHolidays
    };
  }, [holidays]);

  if (!holidays.length) return null;

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      <h4 className="text-sm font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase px-4 text-left">
        Termómetro del Año
      </h4>
      
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <motion.div variants={item} className="p-4 bg-white dark:bg-secondary rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-secondary/80 transition-colors shadow-sm dark:shadow-none">
          <CalendarDays className="w-6 h-6 text-blue-500 mb-2" />
          <span className="text-3xl font-black text-gray-800 dark:text-gray-100">{stats.remaining}</span>
          <span className="text-xs text-gray-500 font-medium">Feriados restantes</span>
        </motion.div>

        <motion.div variants={item} className="p-4 bg-white dark:bg-secondary rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-secondary/80 transition-colors shadow-sm dark:shadow-none">
          <Palmtree className="w-6 h-6 text-green-500 mb-2" />
          <span className="text-3xl font-black text-gray-800 dark:text-gray-100">{stats.longWeekends}</span>
          <span className="text-xs text-gray-500 font-medium">Fines de semana extra-largos</span>
        </motion.div>

        <motion.div variants={item} className="p-4 bg-white dark:bg-secondary rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-secondary/80 transition-colors shadow-sm dark:shadow-none sm:col-span-2">
          <div className="flex items-center gap-3 w-full px-2">
            <Target className="w-6 h-6 text-red-400 shrink-0" />
            <div className="flex flex-col text-left flex-1">
              <span className="font-semibold text-gray-800 dark:text-gray-200">En fin de semana</span>
              <span className="text-xs text-gray-500 mt-0.5">
                Lamentablemente, este año perdemos <strong className="text-gray-700 dark:text-gray-300">{stats.weekendHolidays}</strong> feriados que caen Sábado o Domingo.
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
