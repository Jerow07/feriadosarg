import { useWeather } from '../hooks/useWeather';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, Moon, Loader2 } from 'lucide-react';

export function WeatherWidget() {
  const { weather, loading } = useWeather();

  const getWeatherIcon = (code: number, isDay: boolean) => {
    if (code === 0 || code === 1) {
      return isDay ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-200" />;
    }
    if (code === 2 || code === 3) return <Cloud size={18} className="text-gray-400" />;
    if (code >= 51 && code <= 67) return <CloudRain size={18} className="text-blue-400" />;
    if (code >= 71 && code <= 77) return <Snowflake size={18} className="text-blue-200" />;
    if (code >= 95) return <CloudLightning size={18} className="text-purple-500" />;
    return <Cloud size={18} className="text-gray-400" />;
  };

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
