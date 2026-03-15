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
    await kv.set(`sub:${subscription.endpoint}`, JSON.stringify(subscription));

    res.status(200).json({ message: 'Suscripción exitosa' });
  } catch (error) {
    console.error('Error saving subscription', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
