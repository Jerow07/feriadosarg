import { useState, useMemo } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval, isToday
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Holiday } from '../types';

interface MiniCalendarProps {
  holidays: Holiday[];
  onClose: () => void;
}

export function MiniCalendar({ holidays, onClose }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  const getHolidayForDate = (date: Date) => {
    return holidays.find(h => {
      const [year, month, day] = h.fecha.split("-");
      return isSameDay(date, new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
    });
  };

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white dark:bg-secondary p-4 rounded-3xl ring-1 ring-gray-200 dark:ring-white/10 shadow-2xl z-50 w-72 md:w-80 animate-in fade-in zoom-in-95 duration-200 origin-top">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        <span className="font-semibold text-gray-800 dark:text-gray-100 capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </span>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full transition-colors ml-1 hidden md:block"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Mobile close button specifically absolute */}
      <button 
        onClick={onClose}
        className="md:hidden absolute -top-3 -right-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-1.5 rounded-full ring-2 ring-white dark:ring-secondary shadow-sm"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 select-none">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, idx) => {
          const holiday = getHolidayForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <div 
              key={idx} 
              className={`
                relative flex items-center justify-center p-2 rounded-xl text-sm transition-all select-none
                ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}
                ${isTodayDate && !holiday ? 'bg-gray-100 dark:bg-white/10 font-bold' : ''}
                ${holiday ? 'font-bold bg-yellow-100/50 dark:bg-accent/20 text-yellow-700 dark:text-accent ring-1 ring-yellow-300/50 dark:ring-accent/30' : ''}
              `}
              title={holiday?.nombre}
            >
              <span className="relative z-10">{format(day, 'd')}</span>
              {holiday && (
                <div className="absolute -bottom-0.5 w-1 h-1 bg-yellow-500 dark:bg-accent rounded-full" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 select-none">
         <div className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-accent" />
         <span>Feriado</span>
      </div>
    </div>
  );
}
