import { useState, useEffect } from 'react';
import { BookOpenText, Loader2, Flag, ChevronDown } from 'lucide-react';
import { motion, useAnimationControls } from 'framer-motion';
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
  const [expandedEvents, setExpandedEvents] = useState<Record<number, boolean>>({});
  const controls = useAnimationControls();

  const toggleEvent = (index: number) => {
    setExpandedEvents(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        const res = await fetch(`https://es.wikipedia.org/api/rest_v1/feed/onthisday/all/${month}/${day}`);
        
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        // Combine holidays and events
        const allItems = [
          ...(data.holidays || []),
          ...(data.events || [])
        ];

        // 1. De-duplicate by text
        const uniqueItems: WikiEvent[] = [];
        const seenTexts = new Set<string>();

        // Also get today's holiday name to exclude it
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const argentineHolidayName = holidays?.find(h => h.fecha === todayStr)?.nombre?.toLowerCase();

        for (const item of allItems) {
          const lowerText = item.text.toLowerCase();
          // Exclude if seen OR if it's the same as the main holiday
          if (!seenTexts.has(lowerText) && (!argentineHolidayName || !lowerText.includes(argentineHolidayName))) {
            seenTexts.add(lowerText);
            uniqueItems.push(item);
          }
        }

        // 2. Select a fresh mix of exactly 3 events
        const finalSelection = uniqueItems
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .sort((a, b) => (b.year || 0) - (a.year || 0)); // Chronological order (newest first)

        setEvents(finalSelection);
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [holidays]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const argentineHoliday = holidays?.find(h => h.fecha === todayStr);

  return (
    <div className="w-full h-full space-y-4">
      <h4 className="text-sm font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase px-4 flex items-center text-left">
        <BookOpenText className="w-4 h-4 mr-2" />
        Hoy en la historia
      </h4>
      <div className="flex flex-col p-5 bg-white dark:bg-secondary rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-secondary/80 transition-colors shadow-sm dark:shadow-none h-[400px] overflow-hidden">
        <div className="text-center mb-4 pb-3 border-b border-gray-100 dark:border-white/5 shrink-0">
          <span className="text-5xl md:text-6xl font-display font-black text-gray-800 dark:text-gray-100 tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-white/50 px-2 leading-none block">
            {today.getDate()}
          </span>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-sm font-bold text-gray-500 capitalize">
              {new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(today)}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-l border-gray-200 dark:border-white/10 pl-2">
              {new Intl.DateTimeFormat('es-AR', { weekday: 'short' }).format(today)}
            </span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-start relative overflow-hidden group">
          {/* Gradient Masks */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white dark:from-secondary to-transparent z-20 pointer-events-none opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-secondary to-transparent z-20 pointer-events-none opacity-100 transition-opacity" />
          
          <div className="flex-1 overflow-hidden mask-v-fade">
            <div className="scrollbar-hide h-full overflow-y-auto pt-2 pb-8">
              {argentineHoliday && (
                <div className="text-left text-sm leading-relaxed p-3 bg-yellow-50 dark:bg-accent/10 border border-yellow-200 dark:border-accent/30 rounded-xl relative overflow-hidden mb-4 shrink-0">
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
                <div 
                  className="relative h-full"
                  onMouseEnter={() => controls.stop()}
                  onMouseLeave={() => controls.start({
                    y: ["-25%", 0],
                    transition: { duration: 15 + events.length * 8, repeat: Infinity, ease: "linear", repeatType: "loop" }
                  })}
                >
                  <motion.div 
                    className="flex flex-col space-y-4"
                    animate={controls}
                    initial={{ y: "-25%" }}
                    onViewportEnter={() => {
                      controls.start({
                        y: ["-25%", 0],
                        transition: { 
                          duration: 15 + events.length * 8, 
                          repeat: Infinity, 
                          ease: "linear", 
                          repeatType: "loop" 
                        }
                      });
                    }}
                  >
                    {[...events, ...events, ...events, ...events].map((ev, i) => {
                      const isExpanded = expandedEvents[i % events.length];
                      const isLongText = ev.text.length > 120;

                      return (
                        <div key={`${ev.year}-${i}`} className="text-left text-sm leading-relaxed border-b border-gray-50 dark:border-white/5 pb-3 last:border-0 last:pb-0 shrink-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {ev.year && <span className="font-bold text-yellow-600 dark:text-accent mr-2">{ev.year}:</span>}
                              <div className="relative overflow-hidden">
                                <span className={`text-gray-600 dark:text-gray-300 ${isLongText && !isExpanded ? 'line-clamp-2' : ''}`}>
                                  {ev.text.replace(/\.([A-ZÁÉÍÓÚ])/g, '. $1')}
                                </span>
                              </div>
                            </div>
                            {isLongText && (
                              <button 
                                onClick={() => toggleEvent(i % events.length)}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 shrink-0 self-start"
                                aria-label={isExpanded ? "Ver menos" : "Ver más"}
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">No hay eventos destacados para hoy.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
