import { VercelRequest, VercelResponse } from '@vercel/node';
import { redis } from './lib/redis.js';
import webpush from 'web-push';
import { endOfMonth, isWeekend, subDays, addDays, isSameDay, startOfMonth, startOfDay, addMonths } from 'date-fns';

interface Holiday {
  fecha: string;
  tipo: string;
  nombre: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    const currentYear = today.getFullYear();
    const isManualTrigger = req.query.force === 'true';

    // 1. Initialize VAPID
    const pubKey = (process.env.VAPID_PUBLIC_KEY || '').trim().replace(/['"=]/g, '');
    const privKey = (process.env.VAPID_PRIVATE_KEY || '').trim().replace(/['"]/g, '');
    const subject = (process.env.VAPID_SUBJECT || 'mailto:test@example.com').trim().replace(/['"]/g, '');
    webpush.setVapidDetails(subject, pubKey, privKey);

    // 2. Fetch Holidays
    const headers = { 'User-Agent': 'feriados-arg-cron' };
    const apiRes = await fetch(`https://api.argentinadatos.com/v1/feriados/${currentYear}`, { headers });
    let holidays: Holiday[] = await apiRes.json();
    
    // Add next year if we are near the end of year
    if (today.getMonth() >= 10) {
      const nextYearRes = await fetch(`https://api.argentinadatos.com/v1/feriados/${currentYear + 1}`, { headers });
      if (nextYearRes.ok) {
        const nextYearData = await nextYearRes.json();
        holidays = [...holidays, ...nextYearData];
      }
    }

    // --- Business Logic Helper Functions ---
    const isHoliday = (date: Date) => {
      return holidays.some(h => {
        const [y, m, d] = h.fecha.split("-");
        return isSameDay(date, new Date(parseInt(y), parseInt(m) - 1, parseInt(d)));
      });
    };

    const getPreviousBusinessDay = (date: Date) => {
      let candidate = date;
      while (isWeekend(candidate) || isHoliday(candidate)) {
        candidate = subDays(candidate, 1);
      }
      return candidate;
    };

    const getNextBusinessDay = (date: Date) => {
      let candidate = date;
      while (isWeekend(candidate) || isHoliday(candidate)) {
        candidate = addDays(candidate, 1);
      }
      return candidate;
    };

    const getNthBusinessDay = (dateInMonth: Date, n: number) => {
      let current = getNextBusinessDay(startOfMonth(dateInMonth));
      for (let i = 1; i < n; i++) {
        current = getNextBusinessDay(addDays(current, 1));
      }
      return current;
    };

    const getLastBusinessDay = (dateInMonth: Date) => {
      return getPreviousBusinessDay(startOfDay(endOfMonth(dateInMonth)));
    };

    const getPenultimateBusinessDay = (dateInMonth: Date) => {
      const last = getLastBusinessDay(dateInMonth);
      return getPreviousBusinessDay(subDays(last, 1));
    };

    const calculatePayday = (paydayType: string, dateInMonth: Date): Date => {
      let payday;
      switch (paydayType) {
        case 'first': payday = getNthBusinessDay(dateInMonth, 1); break;
        case 'second': payday = getNthBusinessDay(dateInMonth, 2); break;
        case 'third': payday = getNthBusinessDay(dateInMonth, 3); break;
        case 'fourth': payday = getNthBusinessDay(dateInMonth, 4); break;
        case 'fifth': payday = getNthBusinessDay(dateInMonth, 5); break;
        case 'last': payday = getLastBusinessDay(dateInMonth); break;
        case 'bank': payday = getPenultimateBusinessDay(dateInMonth); break;
        default: payday = getNthBusinessDay(dateInMonth, 5);
      }
      
      // If the payday already passed this month, calculate for next month
      if (isBefore(payday, today) && !isSameDay(payday, today)) {
        payday = calculatePayday(paydayType, addMonths(dateInMonth, 1));
      }
      return payday;
    };

    function isBefore(date1: Date, date2: Date) {
      return date1.getTime() < date2.getTime();
    }

    // 3. Scan Redis and Send Notifs
    let success = 0;
    let errors = 0;
    let cursor = '0';

    do {
      const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'sub:*', 'COUNT', 100);
      cursor = newCursor;

      if (keys.length > 0) {
        const items = await redis.mget(...keys);
        const promises = items.map(async (item: string | null, idx: number) => {
          if (!item) return;
          try {
            const data = JSON.parse(item);
            // Legacy support: if it's just a subscription object, migrate or default
            const subscription = data.subscription || data;
            const preferences = data.preferences || { paydayType: 'fifth' };
            const paydayType = preferences.paydayType || 'fifth';

            const nextPayday = calculatePayday(paydayType, today);

            if (isSameDay(nextPayday, tomorrow) || isManualTrigger) {
              await webpush.sendNotification(
                subscription, 
                JSON.stringify({ 
                  title: '¡Mañana cobras! 💰', 
                  body: 'Tu fecha de cobro es mañana. ¡A disfrutar!' 
                })
              );
              success++;
            }
          } catch (err: any) {
            if (err.statusCode === 404 || err.statusCode === 410) {
              await redis.del(keys[idx]);
            }
            errors++;
          }
        });
        await Promise.all(promises);
      }
    } while (cursor !== '0');

    return res.status(200).json({ 
      message: 'Payday push process finished', 
      success, 
      errors 
    });

  } catch (error: any) {
    console.error('Payday Push Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
