import { useState, useEffect, useCallback } from 'react';
import type { WeatherData } from '../types';

const LAT_KEY = 'feriadosarg_lat';
const LON_KEY = 'feriadosarg_lon';
const DEFAULT_LAT = -34.6118;
const DEFAULT_LON = -58.4173;

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refreshLocation = useCallback(() => {
    localStorage.removeItem(LAT_KEY);
    localStorage.removeItem(LON_KEY);
    setWeather(null);
    setLoading(true);
    setTrigger(t => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async (lat: number, lon: number) => {
      localStorage.setItem(LAT_KEY, String(lat));
      localStorage.setItem(LON_KEY, String(lon));
      if (!cancelled) setCoords({ lat, lon });

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day,precipitation,rain,showers&timezone=auto`
        );
        const data = await response.json();

        if (data.current && !cancelled) {
          let conditionCode = data.current.weather_code;
          if (conditionCode === 3 && (data.current.showers > 0 || data.current.rain > 0 || data.current.precipitation > 0)) {
            conditionCode = 80;
          }
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            conditionCode,
            time: data.current.time,
            isDay: data.current.is_day === 1,
          });
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const savedLat = localStorage.getItem(LAT_KEY);
    const savedLon = localStorage.getItem(LON_KEY);

    if (savedLat && savedLon) {
      fetchWeather(parseFloat(savedLat), parseFloat(savedLon));
      return () => { cancelled = true; };
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!cancelled) fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          if (!cancelled) fetchWeather(DEFAULT_LAT, DEFAULT_LON);
        },
        { timeout: 8000 }
      );
    } else {
      fetchWeather(DEFAULT_LAT, DEFAULT_LON);
    }

    return () => { cancelled = true; };
  }, [trigger]);

  return { weather, loading, coords, refreshLocation };
}
