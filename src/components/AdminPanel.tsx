import { useState } from 'react';
import { X, Lock, Users, Eye, Bell, TrendingUp } from 'lucide-react';

interface DayStat {
  date: string;
  pageviews: number;
  uniqueVisitors: number;
}

interface AdminStats {
  stats: DayStat[];
  totals: {
    pv7d: number;
    uv7d: number;
    pv30d: number;
    uv30d: number;
    pushSubscribers: number;
  };
}

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [password, setPassword] = useState('');
  const [data, setData] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStats = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/analytics?password=${encodeURIComponent(password)}`);
      if (res.status === 401) { setError('Contraseña incorrecta'); return; }
      if (!res.ok) { setError('Error del servidor'); return; }
      setData(await res.json());
    } catch {
      setError('No se pudo conectar');
    } finally {
      setLoading(false);
    }
  };

  const last7 = data?.stats.slice(0, 7).reverse() ?? [];
  const maxUV = last7.length ? Math.max(...last7.map(d => d.uniqueVisitors), 1) : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white dark:bg-secondary rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-yellow-500 dark:text-accent" />
            <h2 className="font-bold text-gray-900 dark:text-white tracking-tight">Admin Stats</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {!data ? (
          <form onSubmit={fetchStats} className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Lock size={14} />
              <span>Contraseña de admin</span>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 dark:focus:ring-accent/50"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 rounded-xl bg-yellow-400 dark:bg-accent text-black font-semibold text-sm hover:bg-yellow-500 dark:hover:bg-yellow-400 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : 'Ver estadísticas'}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            {/* Totals */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={<Users size={14} />} label="Visitantes únicos 7d" value={data.totals.uv7d} />
              <StatCard icon={<Eye size={14} />} label="Vistas 7d" value={data.totals.pv7d} />
              <StatCard icon={<Bell size={14} />} label="Suscriptores push" value={data.totals.pushSubscribers} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Users size={14} />} label="Visitantes únicos 30d" value={data.totals.uv30d} />
              <StatCard icon={<Eye size={14} />} label="Vistas 30d" value={data.totals.pv30d} />
            </div>

            {/* Bar chart last 7 days */}
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Últimos 7 días</p>
              <div className="flex items-end gap-1.5 h-20">
                {last7.map(d => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-yellow-400 dark:bg-accent rounded-t-md transition-all"
                      style={{ height: `${Math.max(4, (d.uniqueVisitors / maxUV) * 64)}px` }}
                      title={`${d.uniqueVisitors} visitantes únicos`}
                    />
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 tabular-nums">
                      {d.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setData(null); setPassword(''); }}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-3 border border-gray-100 dark:border-white/5">
      <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 mb-1">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider leading-tight">{label}</span>
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{value.toLocaleString('es-AR')}</p>
    </div>
  );
}
