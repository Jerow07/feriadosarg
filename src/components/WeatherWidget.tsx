import { useWeather } from '../hooks/useWeather';
import { Loader2 } from 'lucide-react';
import { getWeatherIcon } from '../utils/weatherUtils';

export function WeatherWidget() {
  const { weather, loading } = useWeather();

  if (loading) return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-secondary/30 backdrop-blur-md rounded-full border border-gray-200 dark:border-white/5 animate-pulse">
      <Loader2 size={14} className="animate-spin text-gray-400" />
    </div>
  );

  if (!weather) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-secondary/30 backdrop-blur-md rounded-full border border-gray-200 dark:border-white/5 shadow-sm hover:bg-white/80 dark:hover:bg-secondary/50 transition-all group cursor-default">
      {getWeatherIcon(weather.conditionCode, weather.isDay)}
      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
        {weather.temp}°
      </span>
      <div className="w-[1px] h-3 bg-gray-300 dark:bg-white/10 mx-0.5" />
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
        HOY
      </span>
    </div>
  );
}
