import { VercelRequest, VercelResponse } from '@vercel/node';
import { redis } from './lib/redis.js';
import webpush from 'web-push';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Global try-catch to ensure we ALWAYS return JSON and avoid the "Unexpected token A" error
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Initialize VAPID only when needed and inside try-catch
    try {
      const pubKey = (process.env.VAPID_PUBLIC_KEY || '').trim().replace(/['"=]/g, '');
      const privKey = (process.env.VAPID_PRIVATE_KEY || '').trim().replace(/['"]/g, '');
      const subject = (process.env.VAPID_SUBJECT || 'mailto:test@example.com').trim().replace(/['"]/g, '');

      webpush.setVapidDetails(subject, pubKey, privKey);
    } catch (vapidErr: any) {
      return res.status(500).json({ 
        message: 'Error en configuración VAPID', 
        detail: vapidErr.message 
      });
    }

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
        message: 'Error al guardar la suscripción en la base de datos (Redis)',
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
      // Not returning 500 here as sub is already in Redis
    }

    return res.status(200).json({ message: 'Suscripción exitosa' });
  } catch (error: any) {
    console.error('CRITICAL BACKEND ERROR:', error);
    return res.status(500).json({ 
      message: 'Fallo crítico en el servidor', 
      detail: error.message || 'Error desconocido'
    });
  }
}
