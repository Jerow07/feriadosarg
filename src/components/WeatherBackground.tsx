import { useMemo, useState, useEffect, useRef } from 'react';
import { useWeather } from '../hooks/useWeather';

type Category = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'default';

function getCategory(code: number | undefined): Category {
  if (code === undefined) return 'default';
  if (code <= 1) return 'sunny';
  if (code <= 3 || code === 45 || code === 48) return 'cloudy';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rainy';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snowy';
  if (code >= 95) return 'stormy';
  return 'cloudy';
}

export function WeatherBackground() {
  const { weather } = useWeather();
  const category = getCategory(weather?.conditionCode);
  const isDay = weather?.isDay ?? true;

  const [flash, setFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const rainCount = category === 'stormy' ? 65 : 40;

  const rainDrops = useMemo(
    () =>
      Array.from({ length: rainCount }, () => ({
        left: `${Math.random() * 115 - 5}%`,
        delay: `${(Math.random() * 2).toFixed(2)}s`,
        duration: `${(0.3 + Math.random() * 0.5).toFixed(2)}s`,
        opacity: +(0.2 + Math.random() * 0.45).toFixed(2),
        height: `${10 + Math.floor(Math.random() * 12)}px`,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rainCount]
  );

  const snowFlakes = useMemo(
    () =>
      Array.from({ length: 32 }, () => ({
        left: `${Math.random() * 100}%`,
        delay: `${(Math.random() * 5).toFixed(2)}s`,
        duration: `${(4 + Math.random() * 5).toFixed(2)}s`,
        size: `${3 + Math.floor(Math.random() * 4)}px`,
      })),
    []
  );

  const clouds = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        top: `${3 + i * 9 + Math.random() * 4}%`,
        duration: `${22 + i * 7 + Math.floor(Math.random() * 8)}s`,
        delay: `${(-i * 4 - Math.random() * 6).toFixed(1)}s`,
        width: `${180 + Math.floor(Math.random() * 220)}px`,
        height: `${60 + Math.floor(Math.random() * 60)}px`,
        opacity: +(0.12 + Math.random() * 0.18).toFixed(2),
      })),
    []
  );

  useEffect(() => {
    if (category !== 'stormy') return;
    const schedule = () => {
      flashTimer.current = setTimeout(() => {
        setFlash(true);
        setTimeout(() => {
          setFlash(false);
          // double flash sometimes
          if (Math.random() > 0.5) {
            setTimeout(() => {
              setFlash(true);
              setTimeout(() => setFlash(false), 80);
            }, 120);
          }
        }, 100);
        schedule();
      }, 3500 + Math.random() * 6500);
    };
    schedule();
    return () => clearTimeout(flashTimer.current);
  }, [category]);

  const isRainy = category === 'rainy' || category === 'stormy';
  const showClouds = category === 'cloudy' || isRainy;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

      {/* ---- Gradient blobs — change color by weather ---- */}
      {category === 'sunny' && (
        <>
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full blur-[100px] bg-yellow-300/30 dark:bg-yellow-400/15 animate-sun-glow" />
          <div className="absolute top-[-20%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[120px] bg-yellow-200/20 dark:bg-yellow-500/8" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[120px] bg-orange-200/20 dark:bg-yellow-600/8" />
          {/* Sun rays */}
          {isDay && (
            <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[180px] h-[180px] rounded-full bg-yellow-300/20 dark:bg-yellow-400/10 blur-[30px] animate-sun-glow" />
          )}
        </>
      )}

      {category === 'cloudy' && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-slate-300/20 dark:bg-slate-600/10" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-slate-200/15 dark:bg-slate-700/8" />
        </>
      )}

      {isRainy && (
        <>
          <div className="absolute inset-0 bg-blue-950/5 dark:bg-blue-950/20" />
          <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full blur-[120px] bg-blue-400/10 dark:bg-blue-900/20" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] bg-indigo-400/8 dark:bg-indigo-900/15" />
        </>
      )}

      {category === 'snowy' && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-blue-100/25 dark:bg-sky-300/6" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-slate-100/20 dark:bg-slate-400/5" />
        </>
      )}

      {category === 'default' && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-accent/10 dark:bg-accent/5 transition-opacity duration-300" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-accent/10 dark:bg-accent/5 transition-opacity duration-300" />
        </>
      )}

      {/* ---- Drifting clouds ---- */}
      {showClouds && clouds.map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white dark:bg-white/5 blur-[35px]"
          style={{
            top: c.top,
            left: '-300px',
            width: c.width,
            height: c.height,
            opacity: c.opacity,
            animation: `cloud-drift ${c.duration} ${c.delay} linear infinite`,
          }}
        />
      ))}

      {/* ---- Rain drops ---- */}
      {isRainy && rainDrops.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-blue-300 dark:bg-blue-200"
          style={{
            left: d.left,
            top: '-25px',
            width: '1.5px',
            height: d.height,
            opacity: d.opacity,
            animation: `rain-fall ${d.duration} ${d.delay} linear infinite`,
            transform: 'rotate(14deg)',
          }}
        />
      ))}

      {/* ---- Lightning flash ---- */}
      {flash && (
        <div className="absolute inset-0 bg-white/25 dark:bg-white/12" />
      )}

      {/* ---- Snowflakes ---- */}
      {category === 'snowy' && snowFlakes.map((f, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/80 dark:bg-white/60"
          style={{
            left: f.left,
            top: '-12px',
            width: f.size,
            height: f.size,
            animation: `snow-fall ${f.duration} ${f.delay} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}
