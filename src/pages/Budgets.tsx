import { useState, useMemo } from 'react';
import { useFinance, filterByMonth, formatBRL } from '../context/FinanceContext';
import { CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import type { Budget } from '../types';
import { Plus, X, Pencil } from 'lucide-react';

export default function Budgets() {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget } = useFinance();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [formCat, setFormCat] = useState('');
  const [formLimit, setFormLimit] = useState('');

  const monthTxs = useMemo(() => filterByMonth(transactions, currentMonth), [transactions, currentMonth]);
  const expByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    });
    return map;
  }, [monthTxs]);

  const monthBudgets = budgets.filter(b => b.month === currentMonth);
  const usedCats = monthBudgets.map(b => b.category);

  const openAdd = () => { setEditing(null); setFormCat(''); setFormLimit(''); setShowForm(true); };
  const openEdit = (b: Budget) => { setEditing(b); setFormCat(b.category); setFormLimit(String(b.limit)); setShowForm(true); };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(formLimit.replace(',', '.'));
    if (!formCat || !limit || limit <= 0) return;
    if (editing) {
      updateBudget({ ...editing, category: formCat, limit });
    } else {
      addBudget({ category: formCat, limit, month: currentMonth });
    }
    setShowForm(false);
  };

  const availableCats = EXPENSE_CATEGORIES.filter(c => !usedCats.includes(c) || (editing && c === editing.category));

  const budgetItems = monthBudgets.map(b => {
    const spent = expByCategory[b.category] ?? 0;
    const pct = Math.min((spent / b.limit) * 100, 100);
    const overPct = (spent / b.limit) * 100;
    const color = overPct >= 100 ? 'var(--expense)' : overPct >= 80 ? 'var(--warning)' : 'var(--income)';
    return { ...b, spent, pct, overPct, color };
  }).sort((a, b) => b.overPct - a.overPct);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Orçamentos</h2>
          <p>Limites de gasto por categoria — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Novo orçamento
        </button>
      </div>

      {budgetItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>Nenhum orçamento definido</h3>
          <p>Defina limites de gasto por categoria para controlar melhor suas finanças</p>
        </div>
      ) : (
        <div className="budget-grid">
          {budgetItems.map(b => {
            const cat = CATEGORIES[b.category];
            return (
              <div key={b.id} className="budget-card">
                <div className="budget-card-header">
                  <div className="budget-cat-info">
                    <div className="budget-cat-icon" style={{ background: cat?.bg }}>
                      <span>{cat?.emoji}</span>
                    </div>
                    <div>
                      <div className="budget-cat-name">{cat?.label ?? b.category}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>Limite mensal</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span
                      className="budget-pct"
                      style={{
                        background: b.overPct >= 100 ? 'var(--expense-bg)' : b.overPct >= 80 ? 'var(--warning-bg)' : 'var(--income-bg)',
                        color: b.color
                      }}
                    >
                      {b.overPct.toFixed(0)}%
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-icon" onClick={() => openEdit(b)}><Pencil size={12} /></button>
                      <button className="btn btn-icon btn-danger" onClick={() => { if(confirm('Remover orçamento?')) deleteBudget(b.id); }}><X size={12} /></button>
                    </div>
                  </div>
                </div>
                <div className="progress-bar-wrap">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${b.pct}%`, background: b.color }}
                  />
                </div>
                <div className="budget-amounts">
                  <span className="budget-spent" style={{ color: b.color }}>{formatBRL(b.spent)}</span>
                  <span className="budget-limit">de {formatBRL(b.limit)}</span>
                </div>
                {b.overPct >= 100 && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--expense)', fontWeight: 600 }}>
                    ⚠️ Excedeu em {formatBRL(b.spent - b.limit)}
                  </div>
                )}
                {b.overPct >= 80 && b.overPct < 100 && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--warning)', fontWeight: 600 }}>
                    Restam {formatBRL(b.limit - b.spent)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Editar orçamento' : 'Novo orçamento'}</h3>
              <button className="btn btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select className="form-select" value={formCat} onChange={e => setFormCat(e.target.value)} required disabled={!!editing}>
                    <option value="">Selecione uma categoria</option>
                    {availableCats.map(k => (
                      <option key={k} value={k}>{CATEGORIES[k]?.emoji} {CATEGORIES[k]?.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Limite mensal (R$)</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="Ex: 500,00"
                    value={formLimit}
                    onChange={e => setFormLimit(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
