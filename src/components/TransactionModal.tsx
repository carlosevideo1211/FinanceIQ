import { useState } from 'react';
import { useFinance, formatBRL } from '../context/FinanceContext';
import { CATEGORIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import type { Transaction } from '../types';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  initial?: Transaction;
}

export default function TransactionModal({ onClose, initial }: Props) {
  const { addTransaction, updateTransaction, customCategories } = useFinance();
  const [type, setType] = useState<'income' | 'expense'>(initial?.type ?? 'expense');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState(initial?.note ?? '');

  const customCatKeys = customCategories
    .filter(c => c.type === type || c.type === 'both')
    .map(c => c.id);

  const catOptions = [
    ...(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES),
    ...customCatKeys
  ];

  const allCategories = {
    ...CATEGORIES,
    ...Object.fromEntries(customCategories.map(c => [c.id, { label: c.label, emoji: c.emoji, color: c.color, bg: c.bg }]))
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(',', '.'));
    if (!val || val <= 0 || !description.trim() || !category || !date) return;
    const data = { type, amount: val, description: description.trim(), category, date, note: note.trim() };
    if (initial) {
      updateTransaction({ ...initial, ...data });
    } else {
      addTransaction(data);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{initial ? 'Editar lançamento' : 'Novo lançamento'}</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Tipo */}
          <div className="form-group">
            <label>Tipo</label>
            <div className="type-toggle">
              <button type="button" className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
                onClick={() => { setType('expense'); setCategory(''); }}>
                Despesa
              </button>
              <button type="button" className={`type-btn ${type === 'income' ? 'active income' : ''}`}
                onClick={() => { setType('income'); setCategory(''); }}>
                Receita
              </button>
            </div>
          </div>

          {/* Valor */}
          <div className="form-group">
            <label>Valor (R$)</label>
            <input className="input" type="number" step="0.01" min="0.01" placeholder="0,00"
              value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label>Descrição</label>
            <input className="input" type="text" placeholder="Ex: Aluguel, Salário..."
              value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          {/* Categoria */}
          <div className="form-group">
            <label>Categoria</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)} required>
              <option value="">Selecione...</option>
              {catOptions.map(k => (
                <option key={k} value={k}>{allCategories[k]?.emoji} {allCategories[k]?.label}</option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div className="form-group">
            <label>Data</label>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          {/* Nota */}
          <div className="form-group">
            <label>Nota (opcional)</label>
            <input className="input" type="text" placeholder="Observação..."
              value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              {initial ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
