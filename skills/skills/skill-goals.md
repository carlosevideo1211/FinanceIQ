# SKILL: Metas / Goals (FinanceIQ)

## O que faz
Permite criar e acompanhar metas financeiras (viagem, veículo, imóvel, etc). Cada meta tem valor alvo, valor atual, prazo e cor. O usuário pode contribuir com valores para cada meta.

## Arquivo
`src/pages/Goals.tsx`

## Dependências
```typescript
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PremiumLock from '../components/PremiumLock'  // bloqueio para trial/básico
```

## Interface Goal
```typescript
interface Goal {
  id: string
  user_id?: string
  title: string
  description?: string
  target_amount: number   // valor da meta
  current_amount: number  // valor já economizado
  deadline?: string       // YYYY-MM-DD
  category: string        // id de GOAL_CATEGORIES
  color: string           // hex
  created_at: string
}
```

## Tabela Supabase
```sql
CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_amount numeric NOT NULL,
  current_amount numeric DEFAULT 0,
  deadline date,
  category text DEFAULT 'outros',
  color text DEFAULT '#6C63FF',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own goals" ON goals FOR ALL USING (auth.uid() = user_id);
```

## Categorias de metas disponíveis
```typescript
const GOAL_CATEGORIES = [
  { id: 'viagem',     label: 'Viagem',     emoji: '✈️' },
  { id: 'veiculo',    label: 'Veículo',    emoji: '🚗' },
  { id: 'imovel',     label: 'Imóvel',     emoji: '🏠' },
  { id: 'educacao',   label: 'Educação',   emoji: '📚' },
  { id: 'emergencia', label: 'Emergência', emoji: '🛡️' },
  { id: 'casamento',  label: 'Casamento',  emoji: '💍' },
  { id: 'tecnologia', label: 'Tecnologia', emoji: '💻' },
  { id: 'saude',      label: 'Saúde',      emoji: '❤️' },
  { id: 'outros',     label: 'Outros',     emoji: '🎯' },
]
```

## Cores disponíveis
```typescript
const GOAL_COLORS = [
  '#6C63FF', '#22c55e', '#f59e0b', '#ec4899',
  '#14b8a6', '#3b82f6', '#f97316', '#a855f7'
]
```

## Operações Supabase (direto, sem contexto)
```typescript
// Carregar
const { data } = await supabase.from('goals').select('*').eq('user_id', user.id)

// Criar
await supabase.from('goals').insert([{ ...form, user_id: user.id, current_amount: 0 }])

// Atualizar (contribuir)
await supabase.from('goals').update({ current_amount: novoValor }).eq('id', goal.id)

// Deletar
await supabase.from('goals').delete().eq('id', goal.id)
```

## Cálculo de progresso
```typescript
const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
const remaining = goal.target_amount - goal.current_amount
const isCompleted = goal.current_amount >= goal.target_amount
```

## PremiumLock
Goals é uma feature premium. Usuários em trial ou plano básico veem o `PremiumLock`:
```typescript
const { user } = useAuth()
const isPremium = user?.plan === 'premium' || user?.plan === 'premium_anual'

if (!isPremium) return <PremiumLock feature="Metas Financeiras" />
```

## CSS usado
```css
.card              /* container de cada meta */
.progress-bar-wrap /* barra de progresso */
.progress-bar      /* width = pct%, cor da meta */
.goal-color        /* bolinha colorida */
.form-group .form-label .form-input .form-select .form-textarea
.btn .btn-primary .btn-secondary .btn-danger .btn-icon
.empty-state
```

## Como contribuir para uma meta
```typescript
// Modal de contribuição
const [contributeGoal, setContributeGoal] = useState<Goal | null>(null)
const [contributeAmount, setContributeAmount] = useState('')

const handleContribute = async () => {
  const amount = parseFloat(contributeAmount)
  const novoValor = Math.min(contributeGoal.current_amount + amount, contributeGoal.target_amount)
  await supabase.from('goals').update({ current_amount: novoValor }).eq('id', contributeGoal.id)
  // atualizar estado local
}
```

## Atenção
- `current_amount` nunca ultrapassa `target_amount`
- Metas concluídas devem mostrar badge "✅ Concluída"
- `deadline` é opcional — se não informado, não exibir prazo
- Ao deletar, pedir confirmação: `confirm('Excluir meta?')`
