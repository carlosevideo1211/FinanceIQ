# SKILL: Lançamentos / Transactions (FinanceIQ)

## O que faz
Lista todas as transações com filtros por mês, tipo (receita/despesa) e categoria. Permite criar, editar e excluir lançamentos. Inclui gerenciador de categorias personalizadas.

## Arquivos
- `src/pages/Transactions.tsx` — página principal
- `src/components/TransactionModal.tsx` — modal criar/editar
- `src/components/TxItem.tsx` — item da lista
- `src/components/CategoryManager.tsx` — gerenciar categorias custom

## Dependências
```typescript
import { useFinance, filterByMonth, formatBRL } from '../context/FinanceContext'
import { CATEGORIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types'
```

## Estado local (Transactions.tsx)
```typescript
const [showModal, setShowModal] = useState(false)
const [editing, setEditing] = useState<Transaction | null>(null)
const [showCatManager, setShowCatManager] = useState(false)
const [month, setMonth] = useState(now.toISOString().slice(0, 7))
const [search, setSearch] = useState('')
const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
const [catFilter, setCatFilter] = useState('')
```

## Filtros aplicados
```typescript
const filtered = useMemo(() => {
  let txs = filterByMonth(transactions, month)
  if (typeFilter !== 'all') txs = txs.filter(t => t.type === typeFilter)
  if (catFilter) txs = txs.filter(t => t.category === catFilter)
  if (search.trim()) txs = txs.filter(t => t.description.toLowerCase().includes(search.toLowerCase()))
  return [...txs].sort((a, b) => b.date.localeCompare(a.date))
}, [transactions, month, typeFilter, catFilter, search])
```

## TransactionModal — campos
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| type | 'income' \| 'expense' | Sim |
| amount | number | Sim |
| description | string | Sim |
| category | string (chave CATEGORIES ou id custom) | Sim |
| date | string YYYY-MM-DD | Sim |
| note | string | Não |

## Categorias no modal
```typescript
// Mescla categorias padrão + personalizadas
const customCatKeys = customCategories
  .filter(c => c.type === type || c.type === 'both')
  .map(c => c.id)

const catOptions = [
  ...(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES),
  ...customCatKeys
]

const allCategories = {
  ...CATEGORIES,
  ...Object.fromEntries(customCategories.map(c => [c.id, { label: c.label, emoji: c.emoji, color: c.color, bg: c.bg }]))
}
```

## CSS usado
```css
.form-group     /* container de cada campo */
.form-label     /* label uppercase pequeno */
.form-input     /* input de texto/número/data */
.form-select    /* select dropdown */
.type-btn                  /* botão Despesa/Receita */
.type-btn.active-income    /* receita selecionada — verde */
.type-btn.active-expense   /* despesa selecionada — vermelho */
.tx-item        /* linha de transação */
.tx-icon        /* ícone colorido da categoria */
.tx-info .tx-desc .tx-meta
.tx-amount.income  /* valor verde */
.tx-amount.expense /* valor vermelho */
.cat-badge      /* badge colorida da categoria */
```

## TxItem — como funciona
```typescript
// Busca categoria em allCategories (padrão + custom)
const { customCategories = [], deleteTransaction } = useFinance()
const allCategories = { ...CATEGORIES, ...Object.fromEntries(customCategories.map(c => [c.id, {...}])) }
const cat = allCategories[tx.category]
// Exibe: cat.emoji, cat.label, cat.color, cat.bg
```

## CategoryManager — categorias personalizadas
```typescript
// Campos
label: string      // Nome
emoji: string      // Emoji escolhido da lista
color: string      // Cor hex
bg: string         // color + '20' (transparência)
type: 'income' | 'expense' | 'both'

// Funções do contexto
addCustomCategory({ label, emoji, color, bg, type })
deleteCustomCategory(id)
```

## Como adicionar novo filtro
```typescript
// 1. Adicionar estado
const [novoFiltro, setNovoFiltro] = useState('')

// 2. Aplicar no useMemo
if (novoFiltro) txs = txs.filter(t => t.campo === novoFiltro)

// 3. Adicionar select/input no JSX
<select value={novoFiltro} onChange={e => setNovoFiltro(e.target.value)}>
  ...
</select>
```

## Atenção
- Ao editar, passa `initial={editing}` para o TransactionModal
- Ao fechar modal: `setShowModal(false); setEditing(null)`
- Navegação de mês usa `d.setMonth(d.getMonth() + dir)`
- Totais do mês filtrado ficam no topo: `totalIncome`, `totalExpense`, `totalBalance`
