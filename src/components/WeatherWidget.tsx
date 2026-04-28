import { useWeather } from '../hooks/useWeather';
import { Loader2, MapPin } from 'lucide-react';
import { getWeatherIcon } from '../utils/weatherUtils';

const DEFAULT_LAT = -34.6118;
const DEFAULT_LON = -58.4173;

export function WeatherWidget() {
  const { weather, loading, coords, refreshLocation } = useWeather();

  const isDefaultLocation =
    !coords ||
    (Math.abs(coords.lat - DEFAULT_LAT) < 0.01 && Math.abs(coords.lon - DEFAULT_LON) < 0.01);

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
      <button
        onClick={refreshLocation}
        title={isDefaultLocation ? 'Usar mi ubicación' : 'Actualizar ubicación'}
        className={`ml-0.5 rounded-full p-0.5 transition-colors cursor-pointer ${
          isDefaultLocation
            ? 'text-gray-300 dark:text-gray-600 hover:text-yellow-500 dark:hover:text-accent'
            : 'text-yellow-500 dark:text-accent hover:text-yellow-600 dark:hover:text-yellow-300'
        }`}
      >
        <MapPin size={11} />
      </button>
    </div>
  );
}
