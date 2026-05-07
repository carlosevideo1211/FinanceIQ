import { useMemo, useState } from 'react';
import { useFinance, filterByMonth, sumByType, groupByCategory, formatBRL, monthLabel } from '../context/FinanceContext';
import { CATEGORIES } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Reports() {
  const { transactions } = useFinance();
  const now = new Date();
  const [month, setMonth] = useState(now.toISOString().slice(0, 7));

  const navMonth = (dir: number) => {
    const d = new Date(month + '-01');
    d.setMonth(d.getMonth() + dir);
    setMonth(d.toISOString().slice(0, 10).slice(0, 7));
  };

  // Last 6 months bar chart
  const barData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      const m = d.toISOString().slice(0, 7);
      const txs = filterByMonth(transactions, m);
      return {
        label: d.toLocaleDateString('pt-BR', { month: 'short' }),
        Receitas: parseFloat(sumByType(txs, 'income').toFixed(2)),
        Despesas: parseFloat(sumByType(txs, 'expense').toFixed(2)),
      };
    });
  }, [transactions]);

  // Selected month details
  const monthTxs = useMemo(() => filterByMonth(transactions, month), [transactions, month]);
  const income  = useMemo(() => sumByType(monthTxs, 'income'),  [monthTxs]);
  const expense = useMemo(() => sumByType(monthTxs, 'expense'), [monthTxs]);
  const balance = income - expense;

  const expByCategory = useMemo(() => groupByCategory(monthTxs.filter(t => t.type === 'expense')), [monthTxs]);
  const incByCategory = useMemo(() => groupByCategory(monthTxs.filter(t => t.type === 'income')),  [monthTxs]);

  const pieData = useMemo(() =>
    Object.entries(expByCategory)
      .map(([k, v]) => ({ name: CATEGORIES[k]?.label ?? k, value: v, color: CATEGORIES[k]?.color ?? '#64748b' }))
      .sort((a, b) => b.value - a.value)
  , [expByCategory]);

  const mLabel = (ym: string) => {
    const s = monthLabel(ym);
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Relatório Mensal</h2>
          <p>Análise completa das suas finanças</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-title">Receitas vs Despesas — Últimos 6 meses</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'var(--text3)', fontSize: 12 }} tickFormatter={v => `R$${v}`} width={70} />
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
              formatter={(v: number) => [formatBRL(v), '']}
            />
            <Legend wrapperStyle={{ fontSize: 13, color: 'var(--text2)' }} />
            <Bar dataKey="Receitas" fill="var(--income)"  radius={[4,4,0,0]} />
            <Bar dataKey="Despesas" fill="var(--expense)" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Month detail */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div className="month-selector">
          <button className="btn btn-icon" onClick={() => navMonth(-1)}><ChevronLeft size={16}/></button>
          <span>{mLabel(month)}</span>
          <button className="btn btn-icon" onClick={() => navMonth(1)} disabled={month >= now.toISOString().slice(0,7)}>
            <ChevronRight size={16}/>
          </button>
        </div>
      </div>

      <div className="report-grid">
        {/* Summary */}
        <div className="card">
          <div className="section-title">Resumo do Mês</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Total Recebido', value: income,  color: 'var(--income)' },
              { label: 'Total Gasto',    value: expense, color: 'var(--expense)' },
              { label: 'Saldo Final',    value: balance, color: balance >= 0 ? 'var(--income)' : 'var(--expense)' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, color: 'var(--text2)' }}>{row.label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: row.color }}>{formatBRL(row.value)}</span>
              </div>
            ))}
          </div>
          {monthTxs.length === 0 && (
            <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 16, textAlign: 'center' }}>Sem lançamentos neste mês</p>
          )}
        </div>

        {/* Pie */}
        <div className="card">
          <div className="section-title">Despesas por Categoria</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                    formatter={(v: number) => [formatBRL(v), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                      {d.name}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: d.color }}>{formatBRL(d.value)}</span>
                      <span style={{ color: 'var(--text3)', marginLeft: 8 }}>
                        {expense > 0 ? ((d.value / expense) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '20px 0' }}><p>Sem despesas neste mês</p></div>
          )}
        </div>

        {/* Income by category */}
        {Object.keys(incByCategory).length > 0 && (
          <div className="card">
            <div className="section-title">Receitas por Categoria</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(incByCategory).sort((a,b) => b[1]-a[1]).map(([k, v]) => {
                const cat = CATEGORIES[k];
                return (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{cat?.emoji}</span>
                      <span>{cat?.label ?? k}</span>
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--income)' }}>{formatBRL(v)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
