import { useState, useEffect } from 'react';
import type { UpcomingHoliday, Holiday } from '../types';
import { Calendar, Download, Share2 } from 'lucide-react';
import { MiniCalendar } from './MiniCalendar';
import { downloadCalendar } from '../utils/icsGenerator';
import { useWeather } from '../hooks/useWeather';
import { getWeatherIcon, getTodayWeatherPhrase, getWeatherDescription } from '../utils/weatherUtils';

interface CountdownProps {
  nextHoliday: UpcomingHoliday;
  holidays: Holiday[];
}

export function Countdown({ nextHoliday, holidays }: CountdownProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { weather: currentWeather } = useWeather();
  const [holidayWeather, setHolidayWeather] = useState<{ min: number; max: number; code: number } | null>(null);
  
  const isToday = nextHoliday.daysRemaining === 0;

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);

    if (nextHoliday.daysRemaining <= 10 && nextHoliday.daysRemaining >= 0) {
      const yyyy = nextHoliday.date.getFullYear();
      const mm = String(nextHoliday.date.getMonth() + 1).padStart(2, '0');
      const dd = String(nextHoliday.date.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=-34.6118&longitude=-58.4173&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=America/Argentina/Buenos_Aires&start_date=${dateStr}&end_date=${dateStr}`)
        .then(res => res.json())
        .then(data => {
          if (data.daily && typeof data.daily.weathercode[0] === 'number') {
            setHolidayWeather({
              code: data.daily.weathercode[0],
              max: Math.round(data.daily.temperature_2m_max[0]),
              min: Math.round(data.daily.temperature_2m_min[0])
            });
          }
        })
        .catch(() => setHolidayWeather(null));
    } else {
      setHolidayWeather(null);
    }
  }, [nextHoliday.date, nextHoliday.daysRemaining]);

  // Live countdown timer — works 100% offline
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Target is midnight (00:00) of the holiday date
      const target = new Date(nextHoliday.date);
      target.setHours(0, 0, 0, 0);
      
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [nextHoliday.date]);


  const shareHoliday = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: 'FeriadosArg',
        text: `¡${isToday ? '¡Es hoy' : `Faltan ${nextHoliday.daysRemaining} ${nextHoliday.daysRemaining === 1 ? 'día' : 'días'} para`} el próximo feriado: ${nextHoliday.nombre}! 🔥`,
        url: window.location.origin
      });
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

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
      <div className="relative flex items-center justify-center gap-2 sm:gap-3">
        <button 
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="bg-white dark:bg-secondary p-3 rounded-2xl ring-1 ring-gray-600 dark:ring-white/10 shadow-sm dark:shadow-none backdrop-blur-sm flex items-center space-x-2 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-secondary/80 transition-colors cursor-pointer z-10"
        >
          <Calendar size={18} />
          <span className="text-sm font-medium tracking-wide uppercase hidden sm:inline">Calendario</span>
        </button>

        <button 
          onClick={() => downloadCalendar(holidays, 'feriados_arg.ics')}
          className="bg-yellow-50 dark:bg-accent/10 p-3 rounded-2xl ring-1 ring-yellow-400/30 shadow-sm backdrop-blur-sm flex items-center space-x-2 text-yellow-700 dark:text-accent hover:bg-yellow-100 dark:hover:bg-accent/20 transition-colors cursor-pointer z-10"
          title="Exportar todos los feriados a mi calendario"
        >
          <Download size={18} />
          <span className="text-sm font-medium tracking-wide uppercase hidden sm:inline">Exportar</span>
        </button>

        {canShare && (
          <button 
            onClick={shareHoliday}
            className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl ring-1 ring-blue-400/30 shadow-sm backdrop-blur-sm flex items-center space-x-2 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer z-10"
            title="Compartir feriado"
          >
            <Share2 size={18} />
          </button>
        )}
        
        {isCalendarOpen && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50">
            <MiniCalendar holidays={holidays} onClose={() => setIsCalendarOpen(false)} />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        {!isToday && (
          <p className="text-lg md:text-xl font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Faltan
          </p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-8 w-full max-w-5xl mx-auto px-4">
          {/* Left spacer for perfect centering of the middle column on desktop */}
          <div className="hidden md:block" />

          {/* Main Number, "días" label, and Time Remaining - Perfectly Centered */}
          <div className="flex flex-col items-center space-y-2 md:space-y-4 px-2">
            <div className="flex flex-col items-center space-y-2 md:space-y-4">
              <h2 className="text-8xl md:text-9xl font-sans font-black tracking-normal text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-white/50 animate-pulse-slow leading-none py-2 px-4">
                {isToday ? '¡Hoy!' : nextHoliday.daysRemaining}
              </h2>
              {!isToday && (
                <p className="text-xl md:text-2xl font-medium text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mt-2">
                  {nextHoliday.daysRemaining === 1 ? 'día' : 'días'}
                </p>
              )}
            </div>

            {!isToday && (
              <div className="flex items-center gap-2 sm:gap-3 mt-4 md:mt-6">
                {[
                  { value: timeLeft.hours, label: 'hs' },
                  { value: timeLeft.minutes, label: 'min' },
                  { value: timeLeft.seconds, label: 'seg' },
                ].map((unit) => (
                  <div key={unit.label} className="flex flex-col items-center">
                    <span className="text-xl sm:text-2xl font-bold tabular-nums text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/5 rounded-xl px-2.5 py-1 border border-gray-200 dark:border-white/10 min-w-[48px] text-center">
                      {String(unit.value).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">
                      {unit.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>

      <div className="space-y-4 mt-8 max-w-md mx-auto bg-gradient-to-b from-white dark:from-secondary to-transparent p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl dark:shadow-2xl">
        <div className="space-y-1.5">
          <h3 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-accent dark:to-yellow-200">
            {nextHoliday.nombre}
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 capitalize">
            {getDayOfWeek(nextHoliday.date)}, {getFormattedDate(nextHoliday.date)}
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-3 border-t border-gray-100 dark:border-white/5 pt-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5">
              {nextHoliday.tipo === 'inamovible' ? 'Inamovible 📌' : nextHoliday.tipo === 'trasladable' ? 'Trasladable 🔄' : nextHoliday.tipo === 'puente' ? 'Puente Turístico 🌉' : nextHoliday.tipo}
            </span>
            {holidayWeather && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full border border-blue-100 dark:border-blue-800/50 text-xs font-medium" title="Pronóstico para el feriado">
                {getWeatherIcon(holidayWeather.code)}
                <span>{holidayWeather.min}° a {holidayWeather.max}°</span>
              </div>
            )}
          </div>
 
          {holidayWeather && (
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 max-w-[280px] text-center italic">
              "{getWeatherDescription(holidayWeather.code)}"
            </p>
          )}
        </div>
      </div>

      {/* Weather Info - To the right on desktop (using absolute), and at the bottom on mobile */}
      <div className="md:absolute md:top-[180px] md:right-[5%] lg:right-[10%] xl:right-[15%] order-2 md:order-none mt-8 md:mt-0">
        {currentWeather && !isToday && (
          <div className="flex items-center gap-4 bg-white/50 dark:bg-secondary/30 backdrop-blur-md p-4 rounded-[32px] border border-gray-200 dark:border-white/5 shadow-sm animate-in slide-in-from-bottom-4 md:slide-in-from-right-4 duration-500 mx-auto w-fit">
            <div className="flex flex-col items-center">
              {getWeatherIcon(currentWeather.conditionCode, currentWeather.isDay)}
              <span className="text-xl md:text-2xl font-black text-gray-800 dark:text-white">
                {currentWeather.temp}°
              </span>
            </div>
            
            <div className="w-[1px] h-10 bg-gray-200 dark:bg-white/10" />
            
            <div className="flex flex-col items-start min-w-[120px] max-w-[160px]">
              <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300 italic leading-tight">
                "{getTodayWeatherPhrase(currentWeather.conditionCode)}"
              </p>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-2">
                Hoy en tu ciudad
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
