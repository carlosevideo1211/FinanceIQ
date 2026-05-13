import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { X, Plus, Trash2 } from 'lucide-react';

const EMOJIS = ['🏷️','🎯','💡','🔖','⭐','🎁','🏦','💳','🐾','🌱','🏋️','✈️','🎓','🏥','🛒','🎨','🎵','💼','🔧','🍕'];
const COLORS = ['#f97316','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#06b6d4','#f43f5e','#a855f7','#22c55e','#f59e0b','#64748b','#e11d48'];

interface Props { onClose: () => void; }

export default function CategoryManager({ onClose }: Props) {
  const { customCategories = [], addCustomCategory, deleteCustomCategory } = useFinance();
  const [label, setLabel] = useState('');
  const [emoji, setEmoji] = useState('🏷️');
  const [color, setColor] = useState('#3b82f6');
  const [type, setType] = useState<'income' | 'expense' | 'both'>('expense');
  const [saving, setSaving] = useState(false);

  const bg = (hex: string) => hex + '20';

  const handleAdd = async () => {
    if (!label.trim()) return;
    setSaving(true);
    await addCustomCategory({ label: label.trim(), emoji, color, bg: bg(color), type });
    setLabel('');
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3>Gerenciar Categorias</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Nova categoria */}
          <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Nova categoria</h4>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="Nome da categoria"
                value={label}
                onChange={e => setLabel(e.target.value)}
                style={{ flex: 1 }}
              />
              <select className="input" value={type} onChange={e => setType(e.target.value as any)} style={{ width: 130 }}>
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
                <option value="both">Ambos</option>
              </select>
            </div>

            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Emoji</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setEmoji(e)}
                    style={{ fontSize: 18, padding: '4px 6px', borderRadius: 8, border: emoji === e ? '2px solid var(--primary)' : '2px solid transparent', background: emoji === e ? 'var(--primary-soft)' : 'transparent', cursor: 'pointer' }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Cor</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    style={{ width: 28, height: 28, borderRadius: 8, background: c, border: color === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer', outline: color === c ? `2px solid ${c}` : 'none' }} />
                ))}
              </div>
            </div>

            {label && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Preview:</span>
                <span style={{ background: bg(color), color, padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                  {emoji} {label}
                </span>
              </div>
            )}

            <button className="btn btn-primary" onClick={handleAdd} disabled={!label.trim() || saving} style={{ alignSelf: 'flex-start' }}>
              <Plus size={16} /> {saving ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>

          {/* Lista */}
          {customCategories.length > 0 ? (
            <div>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--text-secondary)' }}>Minhas categorias ({customCategories.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {customCategories.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', borderRadius: 10, padding: '8px 12px' }}>
                    <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                      {c.emoji} {c.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {c.type === 'income' ? 'Receita' : c.type === 'expense' ? 'Despesa' : 'Ambos'}
                      </span>
                      <button className="icon-btn" onClick={() => deleteCustomCategory(c.id)} style={{ color: '#ef4444' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
              Nenhuma categoria personalizada ainda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
