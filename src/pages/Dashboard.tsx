import { useState, useMemo } from 'react';
import { useFinance, filterByMonth, sumByType, groupByCategory, formatBRL, monthLabel } from '../context/FinanceContext';
import { CATEGORIES } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react';
import TransactionModal from '../components/TransactionModal';
import TxItem from '../components/TxItem';
import type { Transaction } from '../types';

export default function Dashboard() {
  const { transactions, budgets, customCategories } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTxs = useMemo(() => filterByMonth(transactions, currentMonth), [transactions, currentMonth]);

  const totalIncome  = useMemo(() => sumByType(monthTxs, 'income'),  [monthTxs]);
  const totalExpense = useMemo(() => sumByType(monthTxs, 'expense'), [monthTxs]);
  const balance      = totalIncome - totalExpense;

  // Pie chart — expenses by category
  const expByCategory = useMemo(() => groupByCategory(monthTxs.filter(t => t.type === 'expense')), [monthTxs]);
  const pieData = useMemo(() => {
    // Mescla categorias padrão + categorias customizadas do usuário
    const customMap = Object.fromEntries(
      (customCategories || []).map(c => [c.id, { label: `${c.emoji} ${c.label}`, color: c.color }])
    );
    return Object.entries(expByCategory)
      .map(([k, v]) => {
        const cat = CATEGORIES[k] || customMap[k];
        return { name: cat?.label ?? 'Outros', value: v, color: cat?.color ?? '#64748b' };
      })
      .sort((a, b) => b.value - a.value);
  }, [expByCategory, customCategories]);

  // Line chart — last 6 months balance
  const lineData = useMemo(() => {
    const months: { month: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      months.push({ month: d.toISOString().slice(0, 7), label: d.toLocaleDateString('pt-BR', { month: 'short' }) });
    }
    return months.map(({ month, label }) => {
      const txs = filterByMonth(transactions, month);
      const inc = sumByType(txs, 'income');
      const exp = sumByType(txs, 'expense');
      return { label, saldo: parseFloat((inc - exp).toFixed(2)) };
    });
  }, [transactions]);

  // Budget alerts
  const alerts = useMemo(() => {
    return budgets
      .filter(b => b.month === currentMonth)
      .map(b => {
        const spent = expByCategory[b.category] ?? 0;
        const pct = (spent / b.limit) * 100;
        return { ...b, spent, pct };
      })
      .filter(b => b.pct >= 80)
      .sort((a, b) => b.pct - a.pct);
  }, [budgets, expByCategory, currentMonth]);

  const recentTxs = useMemo(() => [...monthTxs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6), [monthTxs]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>{monthLabel(currentMonth).charAt(0).toUpperCase() + monthLabel(currentMonth).slice(1)}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Novo lançamento
        </button>
      </div>

      {/* Stat cards */}
      <div className="stat-cards">
        <div className="stat-card income">
          <div className="stat-label"><TrendingUp size={14} /> Receitas</div>
          <div className="stat-value">{formatBRL(totalIncome)}</div>
          <div className="stat-sub">{monthTxs.filter(t => t.type === 'income').length} lançamentos</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-label"><TrendingDown size={14} /> Despesas</div>
          <div className="stat-value">{formatBRL(totalExpense)}</div>
          <div className="stat-sub">{monthTxs.filter(t => t.type === 'expense').length} lançamentos</div>
        </div>
        <div className="stat-card balance">
          <div className="stat-label"><Wallet size={14} /> Saldo do Mês</div>
          <div className="stat-value" style={{ color: balance >= 0 ? 'var(--income)' : 'var(--expense)' }}>
            {formatBRL(balance)}
          </div>
          <div className="stat-sub">{balance >= 0 ? '✅ Positivo' : '⚠️ Negativo'}</div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {alerts.map(a => (
            <div key={a.id} className={`alert ${a.pct >= 100 ? 'alert-danger' : 'alert-warning'}`}>
              <AlertTriangle size={16} />
              <span>
                <strong>{CATEGORIES[a.category]?.label}</strong>:{' '}
                {a.pct >= 100
                  ? `Orçamento excedido! Gastou ${formatBRL(a.spent)} de ${formatBRL(a.limit)}`
                  : `${a.pct.toFixed(0)}% do orçamento usado (${formatBRL(a.spent)} de ${formatBRL(a.limit)})`}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Line chart */}
        <div className="card">
          <div className="section-title">Evolução do Saldo — Últimos 6 meses</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 12 }} tickFormatter={v => `R$${v}`} width={70} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text2)' }}
                formatter={(v: number) => [formatBRL(v), 'Saldo']}
              />
              <Line type="monotone" dataKey="saldo" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--accent)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <div className="section-title">Gastos por Categoria</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                    formatter={(v: number) => [formatBRL(v), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {pieData.slice(0, 5).map(d => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                      {d.name}
                    </span>
                    <span style={{ fontWeight: 600, color: d.color }}>{formatBRL(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <p>Nenhuma despesa este mês</p>
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="card full">
          <div className="section-title">
            Últimos lançamentos
            <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
              {monthTxs.length} no mês
            </span>
          </div>
          {recentTxs.length > 0 ? (
            <div className="tx-list">
              {recentTxs.map(tx => (
                <TxItem key={tx.id} tx={tx} onEdit={t => { setEditing(t); setShowModal(true); }} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Nenhum lançamento este mês</h3>
              <p>Clique em "Novo lançamento" para começar</p>
            </div>
          )}
        </div>
      </div>

      {(showModal) && (
        <TransactionModal
          onClose={() => { setShowModal(false); setEditing(null); }}
          initial={editing ?? undefined}
        />
      )}

      {/* FAB for mobile */}
      <button className="fab" onClick={() => setShowModal(true)} aria-label="Novo lançamento">
        +
      </button>
    </div>
  );
}
