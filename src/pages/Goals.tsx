import { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Edit2, TrendingUp, Calendar, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PremiumLock from '../components/PremiumLock';

interface Goal {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  category: string;
  color: string;
  created_at: string;
}

const GOAL_COLORS = [
  '#6C63FF', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#3b82f6', '#f97316', '#a855f7'
];

const GOAL_CATEGORIES = [
  { id: 'viagem',     label: 'Viagem',       emoji: '✈️' },
  { id: 'veiculo',    label: 'Veículo',      emoji: '🚗' },
  { id: 'imovel',     label: 'Imóvel',       emoji: '🏠' },
  { id: 'educacao',   label: 'Educação',     emoji: '📚' },
  { id: 'emergencia', label: 'Emergência',   emoji: '🛡️' },
  { id: 'casamento',  label: 'Casamento',    emoji: '💍' },
  { id: 'tecnologia', label: 'Tecnologia',   emoji: '💻' },
  { id: 'outros',     label: 'Outros',       emoji: '🎯' },
];

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');

function daysLeft(deadline?: string): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline + 'T12:00:00').getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function monthsToGoal(current: number, target: number, monthlyAvg: number): string {
  if (monthlyAvg <= 0 || current >= target) return '—';
  const months = Math.ceil((target - current) / monthlyAvg);
  if (months > 120) return '> 10 anos';
  if (months > 24) return `${Math.ceil(months/12)} anos`;
  return `${months} mês${months > 1 ? 'es' : ''}`;
}

const emptyForm = { title: '', description: '', target_amount: '', current_amount: '', deadline: '', category: 'outros', color: GOAL_COLORS[0] };

export default function Goals() {
  const { user, isPremium } = useAuth();

  if (!isPremium) return <PremiumLock feature="🎯 Metas Financeiras" description="Defina objetivos e acompanhe seu progresso com o Plano Premium." />;
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [addFunds, setAddFunds] = useState<Goal | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setGoals((data || []) as Goal[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const openNew = () => { setForm(emptyForm); setEditGoal(null); setShowForm(true); };
  const openEdit = (g: Goal) => {
    setForm({
      title: g.title,
      description: g.description || '',
      target_amount: String(g.target_amount),
      current_amount: String(g.current_amount),
      deadline: g.deadline || '',
      category: g.category,
      color: g.color,
    });
    setEditGoal(g);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.target_amount) { alert('Preencha título e valor da meta.'); return; }
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount || '0'),
      deadline: form.deadline || null,
      category: form.category,
      color: form.color,
    };
    if (editGoal) {
      await supabase.from('goals').update(payload).eq('id', editGoal.id);
    } else {
      await supabase.from('goals').insert({ ...payload, created_at: new Date().toISOString() });
    }
    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta meta?')) return;
    await supabase.from('goals').delete().eq('id', id);
    load();
  };

  const handleAddFunds = async () => {
    if (!addFunds || !addAmount) return;
    const newVal = addFunds.current_amount + parseFloat(addAmount);
    await supabase.from('goals').update({ current_amount: newVal }).eq('id', addFunds.id);
    setAddFunds(null);
    setAddAmount('');
    load();
  };

  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0);
  const totalSaved  = goals.reduce((s, g) => s + g.current_amount, 0);
  const completed   = goals.filter(g => g.current_amount >= g.target_amount).length;

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' as const
  };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase' as const };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🎯 Metas Financeiras</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>Defina e acompanhe seus objetivos</p>
        </div>
        <button onClick={openNew} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
          background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10,
          fontWeight: 600, cursor: 'pointer', fontSize: 14
        }}>
          <Plus size={16} /> Nova Meta
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total de Metas', value: String(goals.length), color: '#6C63FF' },
          { label: 'Total a Economizar', value: fmt(totalTarget), color: '#f59e0b' },
          { label: 'Total Economizado', value: fmt(totalSaved), color: '#22c55e' },
          { label: 'Metas Concluídas', value: String(completed), color: '#14b8a6' },
        ].map((k, i) => (
          <div key={i} style={{ background: 'var(--surface)', borderRadius: 12, padding: '16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Goals List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Carregando metas...</div>
      ) : goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'var(--surface)', borderRadius: 16, border: '2px dashed var(--border)' }}>
          <Target size={48} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Nenhuma meta ainda</div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Crie sua primeira meta financeira!</div>
          <button onClick={openNew} style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
            + Criar Meta
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {goals.map(g => {
            const pct = Math.min(100, (g.current_amount / g.target_amount) * 100);
            const done = g.current_amount >= g.target_amount;
            const days = daysLeft(g.deadline);
            const cat = GOAL_CATEGORIES.find(c => c.id === g.category);
            return (
              <div key={g.id} style={{
                background: 'var(--surface)', borderRadius: 16, padding: 20,
                border: `1px solid ${done ? g.color : 'var(--border)'}`,
                position: 'relative', overflow: 'hidden'
              }}>
                {done && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: g.color, color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                    ✓ Concluída!
                  </div>
                )}

                {/* Cor da meta */}
                <div style={{ width: 4, height: '100%', background: g.color, position: 'absolute', left: 0, top: 0, borderRadius: '16px 0 0 16px' }} />

                <div style={{ paddingLeft: 8 }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{cat?.emoji || '🎯'}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{g.title}</div>
                  {g.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{g.description}</div>}

                  {/* Progresso */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: g.color }}>{fmt(g.current_amount)}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{fmt(g.target_amount)}</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: g.color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{pct.toFixed(0)}% concluído</div>
                  </div>

                  {/* Infos */}
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                    {g.deadline && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: days !== null && days < 30 ? '#f59e0b' : 'var(--text-muted)' }}>
                        <Calendar size={12} />
                        {days !== null && days < 0 ? 'Vencida' : days !== null ? `${days}d restantes` : fmtDate(g.deadline)}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <TrendingUp size={12} />
                      Falta {fmt(Math.max(0, g.target_amount - g.current_amount))}
                    </span>
                  </div>

                  {/* Ações */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!done && (
                      <button onClick={() => { setAddFunds(g); setAddAmount(''); }} style={{
                        flex: 1, padding: '8px 0', background: `${g.color}22`, color: g.color,
                        border: `1px solid ${g.color}44`, borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13
                      }}>
                        + Depositar
                      </button>
                    )}
                    <button onClick={() => openEdit(g)} style={{ padding: '8px 10px', background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(g.id)} style={{ padding: '8px 10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova/Editar Meta */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>{editGoal ? 'Editar Meta' : 'Nova Meta'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lbl}>Título *</label>
                <input style={inp} value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Ex: Viagem para Europa" />
              </div>
              <div>
                <label style={lbl}>Descrição</label>
                <input style={inp} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Opcional" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Valor da Meta (R$) *</label>
                  <input style={inp} type="number" min="0" step="0.01" value={form.target_amount} onChange={e => setForm(f => ({...f, target_amount: e.target.value}))} placeholder="5000,00" />
                </div>
                <div>
                  <label style={lbl}>Já Economizei (R$)</label>
                  <input style={inp} type="number" min="0" step="0.01" value={form.current_amount} onChange={e => setForm(f => ({...f, current_amount: e.target.value}))} placeholder="0,00" />
                </div>
              </div>
              <div>
                <label style={lbl}>Prazo</label>
                <input style={inp} type="date" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))} />
              </div>
              <div>
                <label style={lbl}>Categoria</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {GOAL_CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => setForm(f => ({...f, category: c.id}))} style={{
                      padding: '8px 4px', borderRadius: 8, border: `2px solid ${form.category === c.id ? 'var(--accent)' : 'var(--border)'}`,
                      background: form.category === c.id ? 'rgba(108,99,255,0.15)' : 'var(--surface2)',
                      cursor: 'pointer', textAlign: 'center', fontSize: 11, color: 'var(--text)'
                    }}>
                      <div style={{ fontSize: 18 }}>{c.emoji}</div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>{c.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl}>Cor</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {GOAL_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({...f, color: c}))} style={{
                      width: 32, height: 32, borderRadius: '50%', background: c, border: `3px solid ${form.color === c ? '#fff' : 'transparent'}`,
                      cursor: 'pointer', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none'
                    }} />
                  ))}
                </div>
              </div>
              <button onClick={handleSave} disabled={saving} style={{
                padding: '12px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10,
                fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 15, marginTop: 4
              }}>
                {saving ? 'Salvando...' : editGoal ? '✅ Salvar Alterações' : '🎯 Criar Meta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Depositar */}
      {addFunds && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>💰 Depositar na Meta</h3>
              <button onClick={() => setAddFunds(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{addFunds.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                {fmt(addFunds.current_amount)} de {fmt(addFunds.target_amount)}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Valor a depositar (R$)</label>
              <input style={inp} type="number" min="0" step="0.01" value={addAmount} onChange={e => setAddAmount(e.target.value)} placeholder="0,00" autoFocus />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setAddFunds(null)} style={{ flex: 1, padding: '10px', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleAddFunds} style={{ flex: 1, padding: '10px', background: addFunds.color, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                <Check size={16} style={{ marginRight: 4 }} />Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
