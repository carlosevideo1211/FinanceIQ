import { CATEGORIES } from '../types';
import { formatBRL, useFinance } from '../context/FinanceContext';
import type { Transaction } from '../types';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  tx: Transaction;
  onEdit: (t: Transaction) => void;
}

export default function TxItem({ tx, onEdit }: Props) {
  const { deleteTransaction } = useFinance();
  const cat = CATEGORIES[tx.category];

  const handleDelete = () => {
    if (confirm(`Excluir "${tx.description}"?`)) deleteTransaction(tx.id);
  };

  return (
    <div className="tx-item">
      <div className="tx-icon" style={{ background: cat?.bg ?? '#1a1f2e' }}>
        <span style={{ fontSize: 18 }}>{cat?.emoji ?? '📦'}</span>
      </div>
      <div className="tx-info">
        <div className="tx-desc">{tx.description}</div>
        <div className="tx-meta">
          <span>{new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
          <span
            className="cat-badge"
            style={{ background: cat?.bg, color: cat?.color }}
          >
            {cat?.label ?? tx.category}
          </span>
        </div>
      </div>
      <span className={`tx-amount ${tx.type}`}>
        {tx.type === 'income' ? '+' : '-'}{formatBRL(tx.amount)}
      </span>
      <div className="tx-actions">
        <button className="btn btn-icon" onClick={() => onEdit(tx)} title="Editar">
          <Pencil size={14} />
        </button>
        <button className="btn btn-icon btn-danger" onClick={handleDelete} title="Excluir">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
