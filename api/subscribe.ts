import { VercelRequest, VercelResponse } from '@vercel/node';
import { redis } from './lib/redis';
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:test@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const subscription = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Suscripción inválida' });
    }

    // Save the subscription to Redis using the endpoint as unique key
    try {
      await redis.set(`sub:${subscription.endpoint}`, JSON.stringify(subscription));
    } catch (redisError: any) {
      console.error('Error saving to Redis:', redisError);
      return res.status(500).json({ 
        message: 'Error al guardar la suscripción en la base de datos',
        detail: redisError.message || String(redisError)
      });
    }

    // Send a welcome notification immediately as proof of work
    const payload = JSON.stringify({
      title: '¡Suscripción exitosa!',
      body: 'Recibirás un aviso el día antes de cada feriado.'
    });

    try {
      await webpush.sendNotification(subscription, payload);
    } catch (pushErr: any) {
      console.error('Error sending welcome notification', pushErr);
    }

    res.status(200).json({ message: 'Suscripción exitosa' });
  } catch (error: any) {
    console.error('General error in subscribe handler:', error);
    res.status(500).json({ message: 'Internal Server Error', detail: error.message });
  }
}
