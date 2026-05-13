# SKILL: Dashboard (FinanceIQ)

## O que faz
Exibe resumo financeiro do mês atual: receitas, despesas, saldo, gráfico de linha dos últimos 6 meses, gráfico de pizza por categoria, alertas de orçamento e últimos lançamentos.

## Arquivo
`src/pages/Dashboard.tsx`

## Dependências
- `useFinance()` → `transactions`, `budgets`
- `filterByMonth`, `sumByType`, `groupByCategory`, `formatBRL`, `monthLabel` de `FinanceContext`
- `CATEGORIES` de `types.ts`
- `recharts`: `PieChart`, `LineChart`, `ResponsiveContainer`
- `TransactionModal`, `TxItem`

## Estrutura dos dados usados
```typescript
// Transações do mês atual
const monthTxs = filterByMonth(transactions, currentMonth)
const totalIncome  = sumByType(monthTxs, 'income')
const totalExpense = sumByType(monthTxs, 'expense')
const balance      = totalIncome - totalExpense

// Gráfico pizza — despesas por categoria
const expByCategory = groupByCategory(monthTxs.filter(t => t.type === 'expense'))
const pieData = Object.entries(expByCategory).map(([k, v]) => ({
  name: CATEGORIES[k]?.label ?? k,
  value: v,
  color: CATEGORIES[k]?.color ?? '#64748b'
}))

// Gráfico linha — últimos 6 meses
// Gera array de { label: 'jan', saldo: 1500 }

// Alertas — orçamentos >= 80% utilizados
const alerts = budgets
  .filter(b => b.month === currentMonth)
  .map(b => ({ ...b, spent: expByCategory[b.category] ?? 0, pct: spent/b.limit*100 }))
  .filter(b => b.pct >= 80)
```

## CSS usado
```css
.stat-cards        /* grid de 3 cards */
.stat-card.income  /* card receitas — verde */
.stat-card.expense /* card despesas — vermelho */
.stat-card.balance /* card saldo */
.stat-label .stat-value .stat-sub
.alert.alert-warning  /* >= 80% do orçamento */
.alert.alert-danger   /* >= 100% do orçamento */
.dashboard-grid    /* grid 2 colunas */
.card              /* container branco/escuro */
.card.full         /* ocupa linha inteira */
.section-title
.tx-list
.empty-state .empty-icon
.fab               /* botão flutuante mobile */
```

## Como adicionar novo card de estatística
```typescript
// 1. Calcular o valor com useMemo
const novoValor = useMemo(() => ..., [monthTxs])

// 2. Adicionar no JSX dentro de .stat-cards
<div className="stat-card">
  <div className="stat-label"><Icon size={14} /> Label</div>
  <div className="stat-value">{formatBRL(novoValor)}</div>
  <div className="stat-sub">descrição</div>
</div>
```

## Como adicionar novo gráfico
```typescript
// Importar de recharts
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// Dentro de .card
<ResponsiveContainer width="100%" height={200}>
  <BarChart data={dados}>
    <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 12 }} />
    <YAxis tickFormatter={v => `R$${v}`} />
    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
    <Bar dataKey="valor" fill="var(--primary)" radius={[4,4,0,0]} />
  </BarChart>
</ResponsiveContainer>
```

## Atenção
- `currentMonth` é sempre `new Date().toISOString().slice(0, 7)` — formato `YYYY-MM`
- Alertas só aparecem se `alerts.length > 0`
- FAB (botão +) é visível apenas no mobile via CSS
- `recentTxs` mostra apenas os 6 mais recentes do mês
