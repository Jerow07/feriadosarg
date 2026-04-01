import { useState, useEffect } from 'react';
import type { WeatherData } from '../types';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day,precipitation,rain,showers&timezone=auto`
        );
        const data = await response.json();
        
        if (data.current) {
          console.log('Weather data received:', data.current);
          
          // Force weather code to 80 (showers) if the API says showers > 0 but code is still 3 (overcast)
          let conditionCode = data.current.weather_code;
          if (conditionCode === 3 && (data.current.showers > 0 || data.current.rain > 0 || data.current.precipitation > 0)) {
            conditionCode = 80; // Slight rain showers
          }

          setWeather({
            temp: Math.round(data.current.temperature_2m),
            conditionCode,
            time: data.current.time,
            isDay: data.current.is_day === 1
          });
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    // Default to Buenos Aires
    const defaultLat = -34.6118;
    const defaultLon = -58.4173;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Fallback to Buenos Aires if denied
          fetchWeather(defaultLat, defaultLon);
        }
      );
    } else {
      fetchWeather(defaultLat, defaultLon);
    }
  }, []);

  return { weather, loading };
}
