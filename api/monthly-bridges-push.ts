import { VercelRequest, VercelResponse } from '@vercel/node';
import { redis } from './lib/redis.js';
import webpush from 'web-push';
import { isSameMonth } from 'date-fns';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const isManualTrigger = req.query.force === 'true';

    // 1. Initialize VAPID with cleaning
    const pubKey = (process.env.VAPID_PUBLIC_KEY || '').trim().replace(/['"=]/g, '');
    const privKey = (process.env.VAPID_PRIVATE_KEY || '').trim().replace(/['"]/g, '');
    const subject = (process.env.VAPID_SUBJECT || 'mailto:test@example.com').trim().replace(/['"]/g, '');
    webpush.setVapidDetails(subject, pubKey, privKey);

    // Solo corre automáticamente el día 1 del mes
    if (today.getDate() !== 1 && !isManualTrigger) {
      return res.status(200).json({ message: 'No es el primer día del mes. No se envió push.' });
    }

    const headers = { 'User-Agent': 'feriados-arg-cron' };
    const apiRes = await fetch(`https://api.argentinadatos.com/v1/feriados/${currentYear}`, { headers });
    const holidays: Holiday[] = await apiRes.json();
    
    // Busca feriados "puente" en el mes actual
    const bridgeHolidays = holidays.filter(h => {
      if (h.tipo !== 'puente') return false;
      const [year, month, day] = h.fecha.split("-");
      const holidayDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return isSameMonth(holidayDate, today);
    });

    if (bridgeHolidays.length === 0) {
      return res.status(200).json({ message: 'No se encontraron feriados puente para este mes.' });
    }

    // Formatear fechas para el mensaje
    const titlesAndDates = bridgeHolidays.map(h => {
       const [, month, day] = h.fecha.split("-");
       return `${day}/${month}`;
    }).join(' y ');

    // Prepara el payload del mensaje
    const payloadTitle = "¡Mes con fin de semana extra largo!";
    const payloadBody = bridgeHolidays.length === 1 
        ? `Este mes tenemos feriado con fines turísticos el ${titlesAndDates}. ¡A planear!`
        : `Este mes tenemos múltiples feriados con fines turísticos los días ${titlesAndDates}. ¡A planear!`;

    // 2. Scan Redis for subscriptions using ioredis
    let success = 0;
    let errors = 0;
    let cursor = '0';

    do {
      const [newCursor, keys] = await redis.scan(cursor, 'MATCH', 'sub:*', 'COUNT', 100);
      cursor = newCursor;

      if (keys.length > 0) {
        const subscriptionsToProcess = await redis.mget(...keys);
        const promises = subscriptionsToProcess.map(async (subInfo: string | null, idx: number) => {
          if (!subInfo) return;
          try {
            const subObj = JSON.parse(subInfo);
            await webpush.sendNotification(
              subObj,
              JSON.stringify({ title: payloadTitle, body: payloadBody })
            );
            success++;
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
      message: 'Push Process finished para feriados puente', 
      success, 
      errors, 
      bridges: bridgeHolidays 
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

interface Holiday {
  fecha: string;
  tipo: string;
  nombre: string;
}
