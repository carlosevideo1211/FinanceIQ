# SKILL: Relatórios / Reports (FinanceIQ)

## O que faz
Exibe relatórios financeiros com gráficos de barras, comparativos entre meses, ranking de categorias e resumo anual.

## Arquivo
`src/pages/Reports.tsx`

## Dependências
```typescript
import { useFinance, filterByMonth, sumByType, groupByCategory, formatBRL } from '../context/FinanceContext'
import { CATEGORIES } from '../types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import PremiumLock from '../components/PremiumLock'
```

## Dados calculados
```typescript
// Últimos 6 meses
const months = [] // array de { month: 'YYYY-MM', label: 'jan' }
for (let i = 5; i >= 0; i--) {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - i)
  months.push({ month: d.toISOString().slice(0, 7), label: d.toLocaleDateString('pt-BR', { month: 'short' }) })
}

// Dados para gráfico de barras (receita vs despesa por mês)
const barData = months.map(({ month, label }) => {
  const txs = filterByMonth(transactions, month)
  return {
    label,
    receitas: sumByType(txs, 'income'),
    despesas: sumByType(txs, 'expense'),
  }
})

// Mês atual
const currentMonth = new Date().toISOString().slice(0, 7)
const monthTxs = filterByMonth(transactions, currentMonth)

// Ranking de categorias (despesas)
const expByCategory = groupByCategory(monthTxs.filter(t => t.type === 'expense'))
const categoryRanking = Object.entries(expByCategory)
  .map(([k, v]) => ({ key: k, label: CATEGORIES[k]?.label ?? k, value: v, color: CATEGORIES[k]?.color }))
  .sort((a, b) => b.value - a.value)

// Total anual
const currentYear = new Date().getFullYear()
const yearTxs = transactions.filter(t => t.date.startsWith(String(currentYear)))
const totalIncome  = sumByType(yearTxs, 'income')
const totalExpense = sumByType(yearTxs, 'expense')
const totalBalance = totalIncome - totalExpense
```

## Gráfico de barras (recharts)
```tsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={barData}>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
    <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 12 }} />
    <YAxis tickFormatter={v => `R$${v}`} tick={{ fill: 'var(--text3)', fontSize: 12 }} />
    <Tooltip
      contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
      formatter={(v: number) => [formatBRL(v), '']}
    />
    <Legend />
    <Bar dataKey="receitas" fill="var(--income)"  radius={[4,4,0,0]} name="Receitas" />
    <Bar dataKey="despesas" fill="var(--expense)" radius={[4,4,0,0]} name="Despesas" />
  </BarChart>
</ResponsiveContainer>
```

## PremiumLock
Relatórios é feature premium:
```typescript
const isPremium = user?.plan === 'premium' || user?.plan === 'premium_anual'
if (!isPremium) return <PremiumLock feature="Relatórios" />
```

## CSS usado
```css
.card .section-title
.stat-cards .stat-card
.ranking-item      /* linha do ranking de categorias */
.cat-badge         /* badge colorida */
.progress-bar-wrap .progress-bar
```

## Como adicionar novo relatório
```typescript
// Exemplo: relatório por dia da semana
const byWeekday = transactions.reduce((acc, t) => {
  const day = new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })
  acc[day] = (acc[day] ?? 0) + t.amount
  return acc
}, {} as Record<string, number>)

const weekdayData = Object.entries(byWeekday).map(([label, value]) => ({ label, value }))

// Adicionar gráfico de barras com weekdayData
```

## Como exportar relatório em PDF (FinanceIQ Pro)
```typescript
// Instalar: npm install jspdf jspdf-autotable
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const exportPDF = () => {
  const doc = new jsPDF()
  doc.text('Relatório FinanceIQ', 14, 15)
  autoTable(doc, {
    head: [['Data', 'Descrição', 'Categoria', 'Valor']],
    body: transactions.map(t => [t.date, t.description, CATEGORIES[t.category]?.label, formatBRL(t.amount)]),
  })
  doc.save(`relatorio-${currentMonth}.pdf`)
}
```

## Atenção
- Relatórios usam `transactions` completo (não filtrado por mês) para cálculos anuais
- Meses sem dados aparecem com valor 0 no gráfico
- Ranking de categorias é do mês atual
- Se não houver transações, exibir `.empty-state`
