import { useState, useMemo } from 'react';
import { useFinance, filterByMonth, formatBRL } from '../context/FinanceContext';
import { CATEGORIES } from '../types';
import { Plus, Search } from 'lucide-react';
import TransactionModal from '../components/TransactionModal';
import CategoryManager from '../components/CategoryManager';
import TxItem from '../components/TxItem';
import type { Transaction } from '../types';

export default function Transactions() {
  const { transactions, customCategories = [] } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [showCatManager, setShowCatManager] = useState(false);

  const now = new Date();
  const [month, setMonth] = useState(now.toISOString().slice(0, 7));
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [catFilter, setCatFilter] = useState('');

  const navMonth = (dir: number) => {
    const d = new Date(month + '-01');
    d.setMonth(d.getMonth() + dir);
    setMonth(d.toISOString().slice(0, 7));
  };

  const monthLabel = (ym: string) =>
    new Date(ym + '-01T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const filtered = useMemo(() => {
    let txs = filterByMonth(transactions, month);
    if (typeFilter !== 'all') txs = txs.filter(t => t.type === typeFilter);
    if (catFilter) txs = txs.filter(t => t.category === catFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      txs = txs.filter(t => t.description.toLowerCase().includes(s));
    }
    return [...txs].sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, month, typeFilter, catFilter, search]);

  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Lançamentos</h2>
          <p>{filtered.length} transações encontradas</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setShowCatManager(true)}>
            Categorias
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Novo lançamento
          </button>
        </div>
      </div>

      {/* Month navigator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div className="month-selector">
          <button className="btn btn-icon" onClick={() => navMonth(-1)}>‹</button>
          <span>{monthLabel(month).charAt(0).toUpperCase() + monthLabel(month).slice(1)}</span>
          <button className="btn btn-icon" onClick={() => navMonth(1)} disabled={month >= now.toISOString().slice(0,7)}>›</button>
        </div>
        <div style={{ display: 'flex', gap: 16, marginLeft: 'auto', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--income)', fontWeight: 600 }}>+{formatBRL(totalIncome)}</span>
          <span style={{ fontSize: 13, color: 'var(--expense)', fontWeight: 600 }}>-{formatBRL(totalExpense)}</span>
          <span style={{ fontSize: 13, color: 'var(--accent2)', fontWeight: 700 }}>{formatBRL(totalIncome - totalExpense)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32 }}
            placeholder="Buscar descrição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}>
          <option value="all">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
        <select className="form-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">Todas categorias</option>
          {[...Object.entries(CATEGORIES), ...customCategories.map(c => [c.id, { label: c.label, emoji: c.emoji }])].map(([k, v]: any) => (
            <option key={k} value={k}>{v.emoji} {v.label}</option>
          ))}
        </select>
        {(search || typeFilter !== 'all' || catFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setTypeFilter('all'); setCatFilter(''); }}>
            Limpar filtros
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="tx-list">
          {filtered.map(tx => (
            <TxItem key={tx.id} tx={tx} onEdit={t => { setEditing(t); setShowModal(true); }} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Nenhum lançamento encontrado</h3>
          <p>Tente ajustar os filtros ou adicione um novo lançamento</p>
        </div>
      )}

      {showCatManager && <CategoryManager onClose={() => setShowCatManager(false)} />}
      {showModal && (
        <TransactionModal
          onClose={() => { setShowModal(false); setEditing(null); }}
          initial={editing ?? undefined}
        />
      )}
      <button className="fab" onClick={() => setShowModal(true)}>+</button>
    </div>
  );
}
