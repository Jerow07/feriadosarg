import { VercelRequest, VercelResponse } from '@vercel/node';
import { redis } from './lib/redis.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { endpoint } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({ message: 'Endpoint faltante' });
    }

    // Remove the subscription from Redis
    await redis.del(`sub:${endpoint}`);

    res.status(200).json({ message: 'Desuscripción exitosa' });
  } catch (error) {
    console.error('Error deleting subscription', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
