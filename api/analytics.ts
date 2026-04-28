import { VercelRequest, VercelResponse } from '@vercel/node';
import { redis } from './lib/redis.js';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function dateStr(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { event, userId } = req.body || {};
    if (!userId || event !== 'pageview') return res.status(400).json({ error: 'invalid' });

    const today = todayStr();
    try {
      await Promise.all([
        redis.sadd(`analytics:uv:${today}`, String(userId)),
        redis.incr(`analytics:pv:${today}`),
      ]);
    } catch (e) {
      console.error('Analytics track error:', e);
    }
    return res.json({ ok: true });
  }

  if (req.method === 'GET') {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) return res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });
    if (req.query.password !== adminPassword) return res.status(401).json({ error: 'unauthorized' });

    try {
      const days = Array.from({ length: 30 }, (_, i) => dateStr(i));

      const [pvValues, uvCounts] = await Promise.all([
        Promise.all(days.map(d => redis.get(`analytics:pv:${d}`))),
        Promise.all(days.map(d => redis.scard(`analytics:uv:${d}`))),
      ]);

      const pushSubscriberCount = await countPushSubscribers();

      const stats = days.map((date, i) => ({
        date,
        pageviews: Number(pvValues[i]) || 0,
        uniqueVisitors: uvCounts[i] || 0,
      }));

      const totals = {
        pv7d: stats.slice(0, 7).reduce((s, d) => s + d.pageviews, 0),
        uv7d: stats.slice(0, 7).reduce((s, d) => s + d.uniqueVisitors, 0),
        pv30d: stats.reduce((s, d) => s + d.pageviews, 0),
        uv30d: stats.reduce((s, d) => s + d.uniqueVisitors, 0),
        pushSubscribers: pushSubscriberCount,
      };

      return res.json({ stats, totals });
    } catch (e: any) {
      console.error('Analytics read error:', e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'method not allowed' });
}

async function countPushSubscribers(): Promise<number> {
  let count = 0;
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', 'sub:*', 'COUNT', '100') as [string, string[]];
    count += keys.length;
    cursor = nextCursor;
  } while (cursor !== '0');
  return count;
}
