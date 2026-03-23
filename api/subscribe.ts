import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
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
    
    // Validate subscription object
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Suscripción inválida' });
    }

    // Save the subscription to KV Storage using the endpoint as unique key
    try {
      await kv.set(`sub:${subscription.endpoint}`, JSON.stringify(subscription));
    } catch (kvError: any) {
      console.error('Error saving to KV:', kvError);
      return res.status(500).json({ 
        message: 'Error al guardar la suscripción en la base de datos',
        detail: kvError.message || String(kvError)
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
      // We don't return error here because the subscription IS saved in KV
      // and future pushes might work.
    }

    res.status(200).json({ message: 'Suscripción exitosa' });
  } catch (error: any) {
    console.error('General error in subscribe handler:', error);
    res.status(500).json({ message: 'Internal Server Error', detail: error.message });
  }
}
