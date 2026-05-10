import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, TrendingUp, Clock, Crown, Shield, Search, RefreshCw, LogOut } from 'lucide-react';

const ADMIN_EMAIL = 'carlosevideo28@gmail.com';

interface UserProfile {
  id: string;
  email: string;
  trial_start: string;
  trial_end: string;
  plan: string;
  created_at: string;
}

const PLANS = ['trial', 'basico', 'basico_anual', 'premium', 'premium_anual', 'cancelado'];

const planLabel: Record<string, string> = {
  trial: '🕐 Trial',
  basico: '⭐ Básico',
  basico_anual: '⭐ Básico Anual',
  premium: '👑 Premium',
  premium_anual: '👑 Premium Anual',
  cancelado: '❌ Cancelado',
};

const planColor: Record<string, string> = {
  trial: '#f59e0b',
  basico: '#3b82f6',
  basico_anual: '#3b82f6',
  premium: '#a855f7',
  premium_anual: '#a855f7',
  cancelado: '#ef4444',
};

const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR');
const fmtDT = (d: string) => new Date(d).toLocaleString('pt-BR');

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [updating, setUpdating] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, trial: 0, basico: 0, premium: 0, cancelado: 0 });

  // Verificar se é admin
  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <Shield size={48} style={{ color: '#ef4444' }} />
        <div style={{ fontSize: 20, fontWeight: 700 }}>Acesso Negado</div>
        <div style={{ color: 'var(--text-muted)' }}>Você não tem permissão para acessar esta área.</div>
      </div>
    );
  }

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const list = (data || []) as UserProfile[];
    setUsers(list);
    setStats({
      total: list.length,
      trial: list.filter(u => u.plan === 'trial').length,
      basico: list.filter(u => u.plan === 'basico' || u.plan === 'basico_anual').length,
      premium: list.filter(u => u.plan === 'premium' || u.plan === 'premium_anual').length,
      cancelado: list.filter(u => u.plan === 'cancelado').length,
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updatePlan = async (userId: string, plan: string) => {
    setUpdating(userId);
    await supabase.from('profiles').update({ plan }).eq('id', userId);
    await load();
    setUpdating(null);
  };

  const toggleActive = async (userId: string, currentActive: boolean) => {
    setUpdating(userId);
    await supabase.from('profiles').update({ active: !currentActive }).eq('id', userId);
    await load();
    setUpdating(null);
  };

  const extendTrial = async (userId: string) => {
    setUpdating(userId);
    const newEnd = new Date();
    newEnd.setDate(newEnd.getDate() + 14);
    await supabase.from('profiles').update({ trial_end: newEnd.toISOString() }).eq('id', userId);
    await load();
    setUpdating(null);
  };

  const filtered = users.filter(u => {
    const matchSearch = u.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'todos' || u.plan === filter || 
      (filter === 'premium' && (u.plan === 'premium' || u.plan === 'premium_anual')) ||
      (filter === 'basico' && (u.plan === 'basico' || u.plan === 'basico_anual'));
    return matchSearch && matchFilter;
  });

  const trialExpired = (u: UserProfile) => u.plan === 'trial' && new Date(u.trial_end) < new Date();
  const daysLeft = (u: UserProfile) => {
    const diff = new Date(u.trial_end).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const inp: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface2)', color: 'var(--text)', fontSize: 14
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield size={28} style={{ color: '#6C63FF' }} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Admin Panel</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>FinanceIQ — Gestão de Usuários</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</span>
          <button onClick={load} style={{ padding: '8px', background: 'rgba(108,99,255,0.2)', border: 'none', borderRadius: 8, color: '#6C63FF', cursor: 'pointer' }}>
            <RefreshCw size={16} />
          </button>
          <button onClick={signOut} style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Usuários', value: stats.total, color: '#6C63FF', icon: <Users size={20} /> },
            { label: 'Em Trial', value: stats.trial, color: '#f59e0b', icon: <Clock size={20} /> },
            { label: 'Plano Básico', value: stats.basico, color: '#3b82f6', icon: <TrendingUp size={20} /> },
            { label: 'Plano Premium', value: stats.premium, color: '#a855f7', icon: <Crown size={20} /> },
            { label: 'Cancelados', value: stats.cancelado, color: '#ef4444', icon: <LogOut size={20} /> },
          ].map((k, i) => (
            <div key={i} style={{ background: 'var(--surface)', borderRadius: 12, padding: '16px', border: `1px solid ${k.color}33`, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ color: k.color }}>{k.icon}</div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{k.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input style={{ ...inp, width: '100%', paddingLeft: 32, boxSizing: 'border-box' as const }} placeholder="Buscar por email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={inp} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="todos">Todos os planos</option>
            <option value="trial">Trial</option>
            <option value="basico">Básico</option>
            <option value="premium">Premium</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Tabela */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700 }}>{filtered.length} usuário(s)</div>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum usuário encontrado</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)' }}>
                    {['Email', 'Plano', 'Trial Expira', 'Cadastro', 'Ações'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 16px', fontSize: 14, opacity: u.active === false ? 0.5 : 1 }}>
                        <div style={{ fontWeight: 600 }}>{u.email}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{u.id.slice(0,8)}...</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: `${planColor[u.plan] || '#64748b'}22`, color: planColor[u.plan] || '#64748b', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                          {planLabel[u.plan] || u.plan}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13 }}>
                        {u.plan === 'trial' ? (
                          <div>
                            <div style={{ color: trialExpired(u) ? '#ef4444' : daysLeft(u) < 3 ? '#f59e0b' : '#22c55e', fontWeight: 600 }}>
                              {trialExpired(u) ? '⚠️ Expirado' : `${daysLeft(u)} dias restantes`}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(u.trial_end)}</div>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
                        {u.created_at ? fmtDT(u.created_at) : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <select
                            style={{ ...inp, fontSize: 12, padding: '6px 8px' }}
                            value={u.plan}
                            disabled={updating === u.id}
                            onChange={e => updatePlan(u.id, e.target.value)}
                          >
                            {PLANS.map(p => <option key={p} value={p}>{planLabel[p] || p}</option>)}
                          </select>
                          <button
                              onClick={() => toggleActive(u.id, u.active !== false)}
                              disabled={updating === u.id}
                              style={{ padding: '6px 10px', background: u.active === false ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: u.active === false ? '#22c55e' : '#ef4444', border: `1px solid ${u.active === false ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                            >
                              {u.active === false ? '✅ Ativar' : '🚫 Desativar'}
                            </button>
                          {u.plan === 'trial' && (
                            <button
                              onClick={() => extendTrial(u.id)}
                              disabled={updating === u.id}
                              style={{ padding: '6px 10px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                            >
                              +14 dias
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
