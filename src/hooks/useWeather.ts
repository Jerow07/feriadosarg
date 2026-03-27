import { useState, useEffect } from 'react';
import type { WeatherData } from '../types';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`
        );
        const data = await response.json();
        
        if (data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            conditionCode: data.current.weather_code,
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
