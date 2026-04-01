import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, Moon, CloudSun, CloudMoon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Maps WMO (World Meteorological Organization) weather codes to icons and descriptions.
 * Source: https://open-meteo.com/en/docs
 */

export const getWeatherIcon = (code: number, isDay: boolean = true, size: number = 20): ReactNode => {
  // Clear sky
  if (code === 0) {
    return isDay ? <Sun size={size} className="text-yellow-500" /> : <Moon size={size} className="text-blue-300" />;
  }
  
  // Mainly clear, partly cloudy
  if (code === 1 || code === 2) {
    return isDay ? <CloudSun size={size} className="text-yellow-500/80" /> : <CloudMoon size={size} className="text-blue-200/80" />;
  }

  // Overcast
  if (code === 3) {
    return <Cloud size={size} className="text-gray-400" />;
  }

  // Fog and depositing rime fog
  if (code === 45 || code === 48) {
    return <Cloud size={size} className="text-gray-300 contrast-50" />;
  }

  // Drizzle, Rain, Freezing Rain, Rain showers
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain size={size} className="text-blue-400" />;
  }

  // Snow fall, Snow grains, Snow showers
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return <Snowflake size={size} className="text-blue-200" />;
  }

  // Thunderstorm, Thunderstorm with hail
  if (code >= 95) {
    return <CloudLightning size={size} className="text-purple-500" />;
  }

  // Fallback
  return isDay ? <Sun size={size} className="text-yellow-500" /> : <Moon size={size} className="text-blue-300" />;
};

export const getTodayWeatherPhrase = (code: number): string => {
  if (code === 0) return '¡Cielo despejado! Un día espectacular para andar al sol.';
  if (code === 1 || code === 2) return 'El sol se asoma entre las nubes, ideal para un mate al aire libre.';
  if (code === 3) return 'Cielo cubierto... perfecto para unos mates y facturas.';
  if (code === 45 || code === 48) return 'Mucha niebla fuera. ¡Cuidado si manejás!';
  if (code >= 51 && code <= 55) return 'Llovizna persistente... ideal para tortas fritas.';
  if (code >= 61 && code <= 67) return 'Día de lluvia... perfecto para peli y manta.';
  if (code >= 80 && code <= 82) return '¡Chubascos! Cuidado con los chaparrones pasajeros.';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return '¡Mucho frío! Abrigarse bien hoy.';
  if (code >= 95) return '¡Tormenta eléctrica! Mejor quedarse en casa.';
  return '¡Disfrutá este día mientras esperás el feriado!';
};

export const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Se pronostica cielo despejado, ideal para pasear al sol';
  if (code === 1 || code === 2) return 'El pronóstico indica un día algo nublado pero agradable';
  if (code === 3) return 'Se espera un clima mayormente nublado para este feriado';
  if (code === 45 || code === 48) return 'Precaución: se esperan bancos de niebla durante la mañana';
  if (code >= 51 && code <= 55) return 'El pronóstico indica lloviznas intermitentes';
  if (code >= 61 && code <= 67) return 'Se prevén lluvias para este feriado, ¡ideal para peli y manta!';
  if (code >= 80 && code <= 82) return 'Se esperan chubascos y chaparrones aislados';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return '¡Increíble! El pronóstico marca probabilidad de nieve';
  if (code >= 95) return 'Atención: se pronostican fuertes tormentas eléctricas';
  return 'Buen clima esperado para disfrutar del feriado';
};
