import { useState, useEffect, useMemo } from 'react';
import { differenceInDays, startOfDay, isBefore, isSameDay } from 'date-fns';
import type { Holiday, UpcomingHoliday } from '../types';

export function useHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const currentYear = new Date().getFullYear();
        
        // Fetch current year
        const res = await fetch(`https://api.argentinadatos.com/v1/feriados/${currentYear}`);
        if (!res.ok) throw new Error('Error al obtener feriados');
        
        let data: Holiday[] = await res.json();
        
        // If we are late in December and all holidays passed, fetch next year just in case
        const today = startOfDay(new Date());
        const hasFutureHolidays = data.some(h => {
          const [year, month, day] = h.fecha.split("-");
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          return !isBefore(date, today) || isSameDay(date, today);
        });

        if (!hasFutureHolidays) {
          const nextYearRes = await fetch(`https://api.argentinadatos.com/v1/feriados/${currentYear + 1}`);
          if (nextYearRes.ok) {
            const nextYearData: Holiday[] = await nextYearRes.json();
            data = [...data, ...nextYearData];
          }
        }

        if (isMounted) {
          setHolidays(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err as Error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHolidays();
    return () => { isMounted = false; };
  }, []);

  const upcomingHolidays = useMemo(() => {
    const today = startOfDay(new Date());

    const mapped: UpcomingHoliday[] = holidays.map(h => {
      const [year, month, day] = h.fecha.split("-");
      const holidayDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const daysRemaining = differenceInDays(holidayDate, today);
      return { ...h, date: holidayDate, daysRemaining };
    });

    // Filter out past holidays (daysRemaining < 0)
    return mapped
      .filter(h => h.daysRemaining >= 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [holidays]);

  const nextHoliday = upcomingHolidays.length > 0 ? upcomingHolidays[0] : null;

  return { holidays, upcomingHolidays, nextHoliday, loading, error };
}
