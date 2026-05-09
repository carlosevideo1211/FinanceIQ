import { useMemo, useState } from 'react';
import { useFinance, filterByMonth, sumByType, groupByCategory, formatBRL, monthLabel } from '../context/FinanceContext';
import { CATEGORIES } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { ChevronLeft, ChevronRight, FileDown, FileSpreadsheet } from 'lucide-react';

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


  const exportPDF = () => {
    const rows = monthTxs.map(t => `
      <tr>
        <td>${new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
        <td>${t.description}</td>
        <td>${CATEGORIES[t.category]?.label ?? t.category}</td>
        <td style="color:${t.type === 'income' ? '#22c55e' : '#ef4444'}">${t.type === 'income' ? '+' : '-'}R$ ${t.amount.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Relatório ${mLabel(month)}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; color: #1a1a2e; }
      h1 { color: #6C63FF; margin-bottom: 4px; }
      .subtitle { color: #666; margin-bottom: 24px; font-size: 14px; }
      .summary { display: flex; gap: 16px; margin-bottom: 24px; }
      .kpi { background: #f8f9fa; border-radius: 8px; padding: 16px; flex: 1; text-align: center; }
      .kpi-label { font-size: 12px; color: #666; margin-bottom: 4px; }
      .kpi-value { font-size: 20px; font-weight: 700; }
      .income { color: #22c55e; } .expense { color: #ef4444; } .balance { color: #6C63FF; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th { background: #6C63FF; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
      td { padding: 9px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
      tr:nth-child(even) { background: #f8f9fa; }
      .footer { margin-top: 24px; font-size: 11px; color: #999; text-align: center; }
      @media print { body { padding: 16px; } }
    </style></head><body>
    <h1>💰 Relatório Financeiro</h1>
    <div class="subtitle">Período: ${mLabel(month)} • Gerado em ${new Date().toLocaleDateString('pt-BR')}</div>
    <div class="summary">
      <div class="kpi"><div class="kpi-label">Total Recebido</div><div class="kpi-value income">R$ ${income.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div></div>
      <div class="kpi"><div class="kpi-label">Total Gasto</div><div class="kpi-value expense">R$ ${expense.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div></div>
      <div class="kpi"><div class="kpi-label">Saldo Final</div><div class="kpi-value balance">R$ ${balance.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div></div>
    </div>
    <table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:#999">Sem lançamentos neste mês</td></tr>'}</tbody></table>
    <div class="footer">FinanceIQ — Controle de Gastos Pessoal</div>
    </body></html>`;

    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) { alert('Permita popups para exportar PDF'); return; }
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.print(); }, 500);
  };

  const exportCSV = () => {
    const header = 'Data,Descrição,Categoria,Tipo,Valor\n';
    const rows = monthTxs.map(t =>
      `${t.date},"${t.description}","${CATEGORIES[t.category]?.label ?? t.category}",${t.type === 'income' ? 'Receita' : 'Despesa'},${t.amount.toFixed(2)}`
    ).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Relatório Mensal</h2>
          <p>Análise completa das suas finanças</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportCSV} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            background: 'rgba(34,197,94,0.15)', color: '#22c55e',
            border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8,
            fontWeight: 600, cursor: 'pointer', fontSize: 13
          }}>
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={exportPDF} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            background: 'rgba(108,99,255,0.15)', color: '#6C63FF',
            border: '1px solid rgba(108,99,255,0.3)', borderRadius: 8,
            fontWeight: 600, cursor: 'pointer', fontSize: 13
          }}>
            <FileDown size={15} /> PDF
          </button>
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
