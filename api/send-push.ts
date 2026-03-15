import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import webpush from 'web-push';
import { differenceInDays, startOfDay, isBefore, isSameDay } from 'date-fns';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:test@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface Holiday {
  fecha: string;
  tipo: string;
  nombre: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CRON request via Vercel or manual trigger via POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const currentYear = new Date().getFullYear();
    const headers = { 'User-Agent': 'feriados-arg-cron' };
    
    // Fetch upcoming holidays
    const apiRes = await fetch(`https://api.argentinadatos.com/v1/feriados/${currentYear}`, { headers });
    let holidays: Holiday[] = await apiRes.json();
    
    // Check if we need to fetch next year
    const today = startOfDay(new Date());
    const hasFutureHolidays = holidays.some(h => {
      const [year, month, day] = h.fecha.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return !isBefore(date, today) || isSameDay(date, today);
    });

    if (!hasFutureHolidays) {
      const nextYearRes = await fetch(`https://api.argentinadatos.com/v1/feriados/${currentYear + 1}`, { headers });
      if (nextYearRes.ok) {
        const nextYearData: Holiday[] = await nextYearRes.json();
        holidays = [...holidays, ...nextYearData];
      }
    }

    // Find the next upcoming holiday
    const upcoming = holidays.map(h => {
      const [year, month, day] = h.fecha.split("-");
      const holidayDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const daysRemaining = differenceInDays(holidayDate, today);
      return { ...h, date: holidayDate, daysRemaining };
    }).filter(h => h.daysRemaining >= 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

    const nextHoliday = upcoming.length > 0 ? upcoming[0] : null;

    if (!nextHoliday) {
      return res.status(200).json({ message: 'No upcoming holidays found.' });
    }

    // Only send notification if it is exactly 1 day away (tomorrow), or manually forced
    const isManualTrigger = req.query.force === 'true';
    if (nextHoliday.daysRemaining !== 1 && !isManualTrigger && nextHoliday.daysRemaining !== 0) {
       return res.status(200).json({ 
         message: 'No push sent.', 
         next: nextHoliday.nombre, 
         daysRemaining: nextHoliday.daysRemaining 
       });
    }

    // Get all subscriptions from KV
    let errors = 0;
    let success = 0;
    let cursor = 0;

    let payloadTitle = nextHoliday.daysRemaining === 0 ? "¡Hoy es feriado!" : "¡Mañana es feriado!";
    let payloadBody = `${nextHoliday.nombre}. A disfrutar el día.`;
    
    if (isManualTrigger) {
      payloadTitle = `Próximo: ${nextHoliday.nombre}`;
      payloadBody = `Faltan ${nextHoliday.daysRemaining} días.`;
    }

    do {
      const scanRes = await kv.scan(cursor, { match: 'sub:*', count: 100 });
      cursor = scanRes[0] as unknown as number;
      const keys = scanRes[1];

      if (keys.length > 0) {
         const subscriptionsToProcess = await kv.mget(...keys);
         
         const promises = subscriptionsToProcess.map(async (subInfo: any, idx: number) => {
            if (!subInfo) return;
            try {
              const subObj = typeof subInfo === 'string' ? JSON.parse(subInfo) : subInfo;
              await webpush.sendNotification(
                subObj,
                JSON.stringify({ title: payloadTitle, body: payloadBody })
              );
              success++;
            } catch (err: any) {
              if (err.statusCode === 404 || err.statusCode === 410) {
                 // Subscription expired or unsubscribed, remove it
                 await kv.del(keys[idx]);
              }
              errors++;
            }
         });
         await Promise.all(promises);
      }
    } while (cursor !== 0);

    return res.status(200).json({ 
      message: 'Push Process finished', 
      success, 
      errors, 
      holidaySent: nextHoliday.nombre 
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
