# SKILL: Orçamentos / Budgets (FinanceIQ)

## O que faz
Define limites de gastos por categoria para o mês atual. Mostra barra de progresso com % utilizada. Permite criar, editar e excluir orçamentos.

## Arquivo
`src/pages/Budgets.tsx`

## Dependências
```typescript
import { useFinance, filterByMonth, formatBRL } from '../context/FinanceContext'
import { CATEGORIES, EXPENSE_CATEGORIES } from '../types'
```

## Interface Budget
```typescript
interface Budget {
  id: string
  user_id: string  // (no Supabase)
  category: string // chave do CATEGORIES
  limit: number    // valor máximo
  month: string    // 'YYYY-MM'
}
```

## Tabela Supabase
```sql
CREATE TABLE budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  limit numeric NOT NULL,
  month text NOT NULL, -- 'YYYY-MM'
  created_at timestamptz DEFAULT now()
);
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);
```

## Lógica principal
```typescript
const currentMonth = new Date().toISOString().slice(0, 7)
const monthTxs = filterByMonth(transactions, currentMonth)

// Gastos por categoria no mês
const expByCategory: Record<string, number> = {}
monthTxs.filter(t => t.type === 'expense').forEach(t => {
  expByCategory[t.category] = (expByCategory[t.category] ?? 0) + t.amount
})

// Orçamentos do mês atual
const monthBudgets = budgets.filter(b => b.month === currentMonth)

// Para cada orçamento
const spent = expByCategory[b.category] ?? 0
const pct = (spent / b.limit) * 100
// pct < 60  → cor verde (safe)
// pct 60-80 → cor amarela (warning)
// pct > 80  → cor vermelha (danger)
```

## Cores da barra de progresso
```typescript
const barColor = pct >= 100 ? 'var(--expense)'
               : pct >= 80  ? '#f59e0b'
               : pct >= 60  ? '#eab308'
               : 'var(--income)'
```

## Funções do contexto
```typescript
addBudget(b: Omit<Budget, 'id'>)     // cria novo
updateBudget(b: Budget)               // atualiza existente
deleteBudget(id: string)              // remove
```

## Estado do formulário
```typescript
const [showForm, setShowForm] = useState(false)
const [editing, setEditing] = useState<Budget | null>(null)
const [formCat, setFormCat] = useState('')
const [formLimit, setFormLimit] = useState('')

// Categorias já com orçamento (para não duplicar)
const usedCats = monthBudgets.map(b => b.category)
// No select: mostrar apenas categorias sem orçamento ainda
const availableCats = EXPENSE_CATEGORIES.filter(c => !usedCats.includes(c) || editing?.category === c)
```

## CSS usado
```css
.card              /* container de cada orçamento */
.progress-bar-wrap /* barra de progresso */
.progress-bar      /* barra colorida — width = pct% */
.form-group .form-label .form-input .form-select
.btn .btn-primary .btn-secondary .btn-danger .btn-icon
```

## Como adicionar suporte a categorias custom nos orçamentos
```typescript
// 1. Pegar customCategories do contexto
const { customCategories = [] } = useFinance()

// 2. Mesclar com EXPENSE_CATEGORIES para o select
const allExpenseOptions = [
  ...EXPENSE_CATEGORIES,
  ...customCategories.filter(c => c.type === 'expense' || c.type === 'both').map(c => c.id)
]

// 3. Para exibir label da categoria
const allCats = { ...CATEGORIES, ...Object.fromEntries(customCategories.map(c => [c.id, c])) }
const catLabel = allCats[b.category]?.label ?? b.category
```

## Atenção
- Orçamentos são por mês — `month: currentMonth`
- Uma categoria pode ter apenas 1 orçamento por mês
- Ao editar, `usedCats` deve incluir a categoria do orçamento sendo editado para aparecer no select
- O `limit` deve ser `> 0`
