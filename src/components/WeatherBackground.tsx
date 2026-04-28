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

  const rainCount = category === 'stormy' ? 70 : 45;

  const rainDrops = useMemo(
    () =>
      Array.from({ length: rainCount }, () => ({
        left: `${Math.random() * 115 - 5}%`,
        delay: `${(Math.random() * 2).toFixed(2)}s`,
        duration: `${(0.3 + Math.random() * 0.45).toFixed(2)}s`,
        opacity: +(0.4 + Math.random() * 0.4).toFixed(2),
        height: `${14 + Math.floor(Math.random() * 14)}px`,
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
        size: `${4 + Math.floor(Math.random() * 5)}px`,
      })),
    []
  );

  // Each cloud is 2 overlapping blobs to look more natural
  const clouds = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        top: `${4 + i * 10 + Math.random() * 5}%`,
        duration: `${24 + i * 6 + Math.floor(Math.random() * 8)}s`,
        delay: `${(-i * 5 - Math.random() * 8).toFixed(1)}s`,
        w1: `${260 + Math.floor(Math.random() * 180)}px`,
        h1: `${90 + Math.floor(Math.random() * 60)}px`,
        w2: `${160 + Math.floor(Math.random() * 100)}px`,
        h2: `${70 + Math.floor(Math.random() * 40)}px`,
        offsetX: `${40 + Math.floor(Math.random() * 80)}px`,
        offsetY: `-${20 + Math.floor(Math.random() * 20)}px`,
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
          if (Math.random() > 0.5) {
            setTimeout(() => {
              setFlash(true);
              setTimeout(() => setFlash(false), 80);
            }, 130);
          }
        }, 110);
        schedule();
      }, 3000 + Math.random() * 7000);
    };
    schedule();
    return () => clearTimeout(flashTimer.current);
  }, [category]);

  const isRainy = category === 'rainy' || category === 'stormy';
  const showClouds = category === 'cloudy' || isRainy;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

      {/* Sky tint overlay */}
      {category === 'sunny' && isDay && (
        <div className="absolute inset-0 bg-yellow-50/25 dark:bg-transparent" />
      )}
      {category === 'cloudy' && (
        <div className="absolute inset-0 bg-slate-200/30 dark:bg-slate-800/20" />
      )}
      {isRainy && (
        <div className="absolute inset-0 bg-slate-400/15 dark:bg-blue-950/30" />
      )}

      {/* ---- Gradient blobs ---- */}
      {category === 'sunny' && (
        <>
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full blur-[90px] bg-yellow-300/40 dark:bg-yellow-400/20 animate-sun-glow" />
          <div className="absolute top-[-25%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[130px] bg-yellow-200/30 dark:bg-yellow-500/10" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[130px] bg-orange-200/25 dark:bg-yellow-600/10" />
        </>
      )}
      {category === 'cloudy' && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full blur-[130px] bg-slate-400/25 dark:bg-slate-600/15" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[130px] bg-slate-300/20 dark:bg-slate-700/12" />
        </>
      )}
      {isRainy && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[130px] bg-slate-500/25 dark:bg-blue-900/30" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full blur-[130px] bg-slate-400/20 dark:bg-indigo-900/20" />
        </>
      )}
      {category === 'snowy' && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[130px] bg-sky-200/30 dark:bg-sky-300/8" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[130px] bg-slate-200/25 dark:bg-slate-400/6" />
        </>
      )}
      {category === 'default' && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-accent/10 dark:bg-accent/5" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-accent/10 dark:bg-accent/5" />
        </>
      )}

      {/* ---- Clouds (2-blob layered shape per cloud) ---- */}
      {showClouds && clouds.map((c, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: c.top,
            left: '-350px',
            animation: `cloud-drift ${c.duration} ${c.delay} linear infinite`,
          }}
        >
          {/* main body */}
          <div
            className="absolute rounded-full bg-slate-300 dark:bg-slate-200 blur-[18px]"
            style={{ width: c.w1, height: c.h1, opacity: 0.55 }}
          />
          {/* top bump */}
          <div
            className="absolute rounded-full bg-slate-200 dark:bg-white blur-[14px]"
            style={{ width: c.w2, height: c.h2, opacity: 0.45, left: c.offsetX, top: c.offsetY }}
          />
        </div>
      ))}

      {/* ---- Rain drops ---- */}
      {isRainy && rainDrops.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-slate-400 dark:bg-slate-300"
          style={{
            left: d.left,
            top: '-25px',
            width: '2px',
            height: d.height,
            opacity: d.opacity,
            animation: `rain-fall ${d.duration} ${d.delay} linear infinite`,
            transform: 'rotate(14deg)',
          }}
        />
      ))}

      {/* ---- Lightning flash ---- */}
      {flash && (
        <div className="absolute inset-0 bg-white/30 dark:bg-white/15" />
      )}

      {/* ---- Snowflakes ---- */}
      {category === 'snowy' && snowFlakes.map((f, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white dark:bg-white/80 shadow-sm"
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
