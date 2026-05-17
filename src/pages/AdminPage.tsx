import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Users, TrendingUp, Clock, Crown, Shield, Search, RefreshCw,
  LogOut, UserPlus, X, Check, Star, DollarSign, AlertTriangle, Activity
} from 'lucide-react';

const ADMIN_EMAIL = 'carlosevideo28@gmail.com';

interface UserProfile {
  id: string;
  email: string;
  trial_start: string;
  trial_end: string;
  plan: string;
  created_at: string;
  active?: boolean;
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

// Receita mensal por plano
const PLAN_MRR: Record<string, number> = {
  basico: 9.90,
  basico_anual: 99.99 / 12,
  premium: 19.90,
  premium_anual: 199.99 / 12,
};

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';
const fmtDT = (d: string) => d ? new Date(d).toLocaleString('pt-BR') : '—';
const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [updating, setUpdating] = useState<string | null>(null);
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', plan: 'trial', trialDays: '14' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <Shield size={48} style={{ color: '#ef4444' }} />
        <div style={{ fontSize: 20, fontWeight: 700 }}>Acesso Negado</div>
      </div>
    );
  }

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data || []) as UserProfile[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Métricas ──
  const totalUsers   = users.length;
  const trialUsers   = users.filter(u => u.plan === 'trial').length;
  const basicUsers   = users.filter(u => u.plan === 'basico' || u.plan === 'basico_anual').length;
  const premiumUsers = users.filter(u => u.plan === 'premium' || u.plan === 'premium_anual').length;
  const cancelados   = users.filter(u => u.plan === 'cancelado').length;
  const mrr          = users.reduce((s, u) => s + (PLAN_MRR[u.plan] || 0), 0);
  const conversionRate = totalUsers > 0 ? (((basicUsers + premiumUsers) / totalUsers) * 100).toFixed(1) : '0';

  // Novos usuários nos últimos 7 dias
  const last7d = users.filter(u => {
    if (!u.created_at) return false;
    const diff = Date.now() - new Date(u.created_at).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  // Trial expirando em 3 dias
  const expiringSoon = users.filter(u => {
    if (u.plan !== 'trial') return false;
    const diff = new Date(u.trial_end).getTime() - Date.now();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
  });

  const trialExpiredCount = users.filter(u =>
    u.plan === 'trial' && new Date(u.trial_end) < new Date()
  ).length;

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
      (filter === 'basico' && (u.plan === 'basico' || u.plan === 'basico_anual')) ||
      (filter === 'trial_expired' && u.plan === 'trial' && new Date(u.trial_end) < new Date());
    return matchSearch && matchFilter;
  });

  const createUser = async () => {
    setCreateError(''); setCreateSuccess('');
    if (!newUser.email.trim()) { setCreateError('Informe o email.'); return; }
    if (!newUser.password || newUser.password.length < 6) { setCreateError('Senha mínima: 6 caracteres.'); return; }
    setCreating(true);
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email.trim(), password: newUser.password, email_confirm: true,
      });
      if (error) throw error;
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + parseInt(newUser.trialDays || '14'));
      await supabase.from('profiles').insert({
        id: data.user.id, email: newUser.email.trim(),
        trial_start: new Date().toISOString(), trial_end: trialEnd.toISOString(),
        plan: newUser.plan, created_at: new Date().toISOString(), active: true,
      });
      setCreateSuccess(`✅ Usuário ${newUser.email} criado!`);
      setNewUser({ email: '', password: '', plan: 'trial', trialDays: '14' });
      load();
    } catch (err: any) {
      setCreateError(err.message || 'Erro ao criar usuário.');
    }
    setCreating(false);
  };

  const trialDaysLeft = (u: UserProfile) => Math.ceil((new Date(u.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isTrialExpired = (u: UserProfile) => u.plan === 'trial' && new Date(u.trial_end) < new Date();

  const inp: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface2)', color: 'var(--text)', fontSize: 14
  };

  const KPI = ({ label, value, color, icon, sub }: any) => (
    <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '18px 20px', border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #6C63FF, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Admin Panel</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>FinanceIQ — Painel de Controle</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</span>
          <button onClick={load} title="Atualizar" style={{ padding: 8, background: 'rgba(108,99,255,0.15)', border: 'none', borderRadius: 8, color: '#6C63FF', cursor: 'pointer' }}>
            <RefreshCw size={15} />
          </button>
          <button onClick={() => { setShowNewUser(true); setCreateError(''); setCreateSuccess(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'linear-gradient(135deg, #6C63FF, #a855f7)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            <UserPlus size={15} /> Novo Usuário
          </button>
          <button onClick={signOut} style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <LogOut size={13} /> Sair
          </button>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 1300, margin: '0 auto' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
          <KPI label="Total Usuários"  value={totalUsers}   color="#6C63FF" icon={<Users size={20}/>} sub={`+${last7d} esta semana`} />
          <KPI label="MRR Estimado"    value={fmtBRL(mrr)}  color="#22c55e" icon={<DollarSign size={20}/>} sub="Receita mensal recorrente" />
          <KPI label="Em Trial"        value={trialUsers}   color="#f59e0b" icon={<Clock size={20}/>} sub={`${trialExpiredCount} expirados`} />
          <KPI label="Plano Básico"    value={basicUsers}   color="#3b82f6" icon={<Star size={20}/>} />
          <KPI label="Plano Premium"   value={premiumUsers} color="#a855f7" icon={<Crown size={20}/>} />
          <KPI label="Conversão"       value={`${conversionRate}%`} color="#14b8a6" icon={<TrendingUp size={20}/>} sub="trial → pago" />
          <KPI label="Cancelados"      value={cancelados}   color="#ef4444" icon={<LogOut size={20}/>} />
          <KPI label="Ativos"          value={`${totalUsers - cancelados}`} color="#64748b" icon={<Activity size={20}/>} />
        </div>

        {/* Alerta trial expirando */}
        {expiringSoon.length > 0 && (
          <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div style={{ fontSize: 13 }}>
              <strong style={{ color: '#f59e0b' }}>{expiringSoon.length} usuário(s)</strong> com trial expirando em menos de 3 dias:
              {' '}{expiringSoon.map(u => u.email).join(', ')}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input style={{ ...inp, width: '100%', paddingLeft: 32, boxSizing: 'border-box' as const }} placeholder="Buscar por email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={inp} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="todos">Todos ({totalUsers})</option>
            <option value="trial">Trial ({trialUsers})</option>
            <option value="trial_expired">Trial Expirado ({trialExpiredCount})</option>
            <option value="basico">Básico ({basicUsers})</option>
            <option value="premium">Premium ({premiumUsers})</option>
            <option value="cancelado">Cancelado ({cancelados})</option>
          </select>
        </div>

        {/* Tabela */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{filtered.length} usuário(s)</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>MRR filtrado: {fmtBRL(filtered.reduce((s, u) => s + (PLAN_MRR[u.plan] || 0), 0))}</div>
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
                    {['Email', 'Plano', 'Trial / Status', 'Cadastro', 'MRR', 'Ações'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} style={{ borderTop: '1px solid var(--border)', opacity: u.active === false ? 0.5 : 1 }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{u.email}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{u.id?.slice(0, 8)}...</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: `${planColor[u.plan] || '#64748b'}22`, color: planColor[u.plan] || '#64748b', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {planLabel[u.plan] || u.plan}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13 }}>
                        {u.plan === 'trial' ? (
                          <div>
                            <div style={{ color: isTrialExpired(u) ? '#ef4444' : trialDaysLeft(u) < 3 ? '#f59e0b' : '#22c55e', fontWeight: 600 }}>
                              {isTrialExpired(u) ? '⚠️ Expirado' : `${trialDaysLeft(u)}d restantes`}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Expira: {fmt(u.trial_end)}</div>
                          </div>
                        ) : (
                          <span style={{ color: u.active === false ? '#ef4444' : '#22c55e', fontSize: 12, fontWeight: 600 }}>
                            {u.active === false ? '🚫 Inativo' : '✅ Ativo'}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
                        {u.created_at ? fmtDT(u.created_at) : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: PLAN_MRR[u.plan] ? '#22c55e' : 'var(--text-muted)' }}>
                        {PLAN_MRR[u.plan] ? fmtBRL(PLAN_MRR[u.plan]) : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <select style={{ ...inp, fontSize: 11, padding: '5px 8px' }} value={u.plan} disabled={updating === u.id}
                            onChange={e => updatePlan(u.id, e.target.value)}>
                            {PLANS.map(p => <option key={p} value={p}>{planLabel[p] || p}</option>)}
                          </select>
                          <button onClick={() => toggleActive(u.id, u.active !== false)} disabled={updating === u.id}
                            style={{ padding: '5px 10px', background: u.active === false ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: u.active === false ? '#22c55e' : '#ef4444', border: `1px solid ${u.active === false ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                            {u.active === false ? '✅ Ativar' : '🚫 Desativar'}
                          </button>
                          {u.plan === 'trial' && (
                            <button onClick={() => extendTrial(u.id)} disabled={updating === u.id}
                              style={{ padding: '5px 10px', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
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

      {/* Modal Novo Usuário */}
      {showNewUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, border: '1px solid rgba(108,99,255,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: 18 }}>👤 Novo Usuário</h3>
              <button onClick={() => setShowNewUser(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'EMAIL *', type: 'email', placeholder: 'email@exemplo.com', field: 'email' },
                { label: 'SENHA *', type: 'password', placeholder: 'Mínimo 6 caracteres', field: 'password' },
              ].map(f => (
                <div key={f.field}>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(108,99,255,0.3)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, boxSizing: 'border-box' as const }}
                    type={f.type} placeholder={f.placeholder} value={(newUser as any)[f.field]}
                    onChange={e => setNewUser(u => ({ ...u, [f.field]: e.target.value }))} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>PLANO</label>
                  <select style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(108,99,255,0.3)', background: '#1a1a2e', color: '#fff', fontSize: 14 }}
                    value={newUser.plan} onChange={e => setNewUser(u => ({ ...u, plan: e.target.value }))}>
                    {PLANS.map(p => <option key={p} value={p}>{planLabel[p] || p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>DIAS TRIAL</label>
                  <input style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(108,99,255,0.3)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, boxSizing: 'border-box' as const }}
                    type="number" min="1" max="365" value={newUser.trialDays}
                    onChange={e => setNewUser(u => ({ ...u, trialDays: e.target.value }))} />
                </div>
              </div>
              {createError && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13 }}>{createError}</div>}
              {createSuccess && <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '10px 14px', color: '#22c55e', fontSize: 13 }}>{createSuccess}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowNewUser(false)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={createUser} disabled={creating} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #6C63FF, #a855f7)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {creating ? 'Criando...' : <><Check size={15} /> Criar</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
