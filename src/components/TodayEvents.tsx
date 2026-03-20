import { useState, useEffect, useMemo } from 'react';
import { BookOpenText, Loader2, Flag } from 'lucide-react';
import type { Holiday } from '../types';

interface WikiEvent {
  text: string;
  year: number;
}

interface TodayEventsProps {
  holidays: Holiday[];
}

export function TodayEvents({ holidays }: TodayEventsProps) {
  const [events, setEvents] = useState<WikiEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        const res = await fetch(`https://es.wikipedia.org/api/rest_v1/feed/onthisday/all/${month}/${day}`, {
          headers: {
            'User-Agent': 'FeriadosArgApp/1.0 (https://feriadosarg.vercel.app)'
          }
        });
        
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        let mixedEvents: WikiEvent[] = [];
        
        // Priorizar efemérides y días internacionales (holidays)
        if (data.holidays && data.holidays.length > 0) {
           // Filtrar santos y beatos si queremos, pero de momento mostramos cualquiera
           // o simplemente tomamos los primeros
           mixedEvents = [...data.holidays];
        }
        
        // Si hay espacio o no hay holidays, agregar eventos históricos
        if (data.events && data.events.length > 0) {
           mixedEvents = [...mixedEvents, ...data.events];
        }

        // Tomamos 3 efemérides. Tratar de que la primera sea una celebración (holiday)
        if (mixedEvents.length > 0) {
          // Filtramos un poco para que no dominen los santos católicos si hay muchos, 
          // pero para asegurar que salga el Día de la Felicidad, no los mezclamos al azar completamente,
          // o podemos mezclarlos pero manteniendo los holidays al principio
          const topHolidays = data.holidays ? data.holidays.slice(0, 2) : [];
          const randomEvents = data.events ? data.events.sort(() => 0.5 - Math.random()).slice(0, 3) : [];
          
          let finalSelection = [...topHolidays, ...randomEvents].slice(0, 3);
          setEvents(finalSelection);
        }
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  const today = new Date();

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const argentineHoliday = holidays?.find(h => h.fecha === todayStr);

  return (
    <div className="w-full h-full space-y-4">
      <h4 className="text-sm font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase px-4 flex items-center text-left">
        <BookOpenText className="w-4 h-4 mr-2" />
        Hoy en la historia
      </h4>
      <div className="flex flex-col p-6 bg-white dark:bg-secondary rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-secondary/80 transition-colors shadow-sm dark:shadow-none h-[calc(100%-2.5rem)] min-h-[180px]">
        <div className="text-center mb-5 pb-4 border-b border-gray-100 dark:border-white/5 shrink-0">
          <span className="text-6xl md:text-7xl font-display font-black text-gray-800 dark:text-gray-100 tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-white/50 px-2 pb-2 block">
            {today.getDate()}
          </span>
          <span className="text-md font-medium text-gray-500 capitalize mt-[-8px] block">
            {new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(today)}
          </span>
          <span className="text-xs font-medium text-gray-400 mt-1 block">
            {new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(today)}
          </span>
        </div>
        
        <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto">
          {argentineHoliday && (
            <div className="text-left text-sm leading-relaxed p-3 bg-yellow-50 dark:bg-accent/10 border border-yellow-200 dark:border-accent/30 rounded-xl relative overflow-hidden">
              <div className="absolute -right-2 -top-2 text-yellow-500/10 dark:text-accent/10">
                <Flag className="w-16 h-16" />
              </div>
              <div className="relative z-10 flex flex-col">
                <span className="font-bold text-yellow-700 dark:text-accent mb-0.5 whitespace-normal flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" /> 
                  Feriado Nacional:
                </span>
                <span className="text-yellow-900 dark:text-yellow-100 font-semibold text-base mb-1">{argentineHoliday.nombre}</span>
                <span className="inline-block px-2 py-0.5 bg-yellow-200/50 dark:bg-white/10 rounded-full text-[10px] font-bold text-yellow-700 dark:text-gray-300 uppercase tracking-wider self-start border border-yellow-300/50 dark:border-transparent">
                  {argentineHoliday.tipo}
                </span>
              </div>
            </div>
          )}

          {loading ? (
             <div className="flex justify-center items-center h-full">
               <Loader2 className="animate-spin text-gray-400 w-6 h-6" />
             </div>
          ) : events.length > 0 ? (
            events.map((ev, i) => (
              <div key={i} className="text-left text-sm leading-relaxed">
                {ev.year && <span className="font-bold text-yellow-600 dark:text-accent mr-2">{ev.year}:</span>}
                <span className="text-gray-600 dark:text-gray-300">{ev.text}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center">No hay eventos destacados para hoy.</p>
          )}
        </div>
      </div>
    </div>
  );
}
