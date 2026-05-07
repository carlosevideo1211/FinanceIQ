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
  const { addTransaction, updateTransaction } = useFinance();

  const [type, setType] = useState<'income' | 'expense'>(initial?.type ?? 'expense');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState(initial?.note ?? '');

  const catOptions = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

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
          <button className="btn btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn ${type === 'income' ? 'active-income' : ''}`}
                onClick={() => { setType('income'); setCategory(''); }}
              >
                ⬆️ Receita
              </button>
              <button
                type="button"
                className={`type-btn ${type === 'expense' ? 'active-expense' : ''}`}
                onClick={() => { setType('expense'); setCategory(''); }}
              >
                ⬇️ Despesa
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Valor (R$)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descrição</label>
              <input
                className="form-input"
                type="text"
                placeholder="Ex: Supermercado, Salário..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                maxLength={80}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              >
                <option value="">Selecione uma categoria</option>
                {catOptions.map(k => (
                  <option key={k} value={k}>
                    {CATEGORIES[k]?.emoji} {CATEGORIES[k]?.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data</label>
              <input
                className="form-input"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Observação (opcional)</label>
              <textarea
                className="form-textarea"
                placeholder="Anotações adicionais..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              {initial ? 'Salvar alterações' : `Adicionar ${type === 'income' ? 'receita' : 'despesa'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
