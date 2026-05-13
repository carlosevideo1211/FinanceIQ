# SKILL: Painel Admin (FinanceIQ)

## O que faz
Painel exclusivo do administrador para gerenciar usuários, alterar planos, cadastrar inquilinos e ver estatísticas do sistema.

## Arquivos
- `src/pages/AdminLoginPage.tsx` — login exclusivo admin
- `src/pages/AdminPage.tsx` — painel completo

## Acesso
- **URL:** `/admin-login`
- **Email admin:** definido em `VITE_ADMIN_EMAIL` no `.env`
- Verificação: `user?.email !== ADMIN_EMAIL` → redireciona

## Interface UserProfile
```typescript
interface UserProfile {
  id: string
  email: string
  trial_start: string
  trial_end: string
  plan: string
  created_at: string
}
```

## Planos disponíveis
```typescript
const PLANS = ['trial', 'basico', 'basico_anual', 'premium', 'premium_anual', 'cancelado']

const planLabel: Record<string, string> = {
  trial: '🕐 Trial',
  basico: '⭐ Básico',
  basico_anual: '⭐ Básico Anual',
  premium: '👑 Premium',
  premium_anual: '👑 Premium Anual',
  cancelado: '❌ Cancelado',
}
```

## Operações Supabase no Admin
```typescript
// Listar todos os usuários
const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })

// Alterar plano
await supabase.from('profiles').update({ plan: novoPlan }).eq('id', userId)

// Cadastrar inquilino
await supabase.from('profiles').insert([{
  id: uuid,
  email,
  name,
  plan: 'trial',
  trial_start: new Date().toISOString(),
  trial_end: addDays(new Date(), 14).toISOString(),
  created_at: new Date().toISOString()
}])
```

## Estatísticas calculadas
```typescript
const stats = {
  total: users.length,
  trial: users.filter(u => u.plan === 'trial').length,
  basico: users.filter(u => u.plan.startsWith('basico')).length,
  premium: users.filter(u => u.plan.startsWith('premium')).length,
  cancelado: users.filter(u => u.plan === 'cancelado').length,
}
```

## Busca e filtros
```typescript
const [search, setSearch] = useState('')
const [filter, setFilter] = useState('todos') // 'todos' | plano

const filtered = users.filter(u => {
  const matchSearch = u.email.toLowerCase().includes(search.toLowerCase())
  const matchFilter = filter === 'todos' || u.plan === filter
  return matchSearch && matchFilter
})
```

## Cadastro de inquilinos
O admin pode cadastrar novos usuários diretamente sem passar pelo fluxo normal de registro:
```typescript
// Campos do formulário
email: string     // email do inquilino
name: string      // nome
plan: string      // plano inicial (default: 'trial')
trialDays: number // dias de trial (default: 14)

// Gerar UUID para o novo usuário
import { v4 as uuidv4 } from 'uuid'
const newId = uuidv4()
```

## CSS/Layout do Admin
```css
.admin-header      /* cabeçalho com logo e logout */
.stats-grid        /* grid de cards de estatísticas */
.stat-card         /* card individual */
.users-table       /* tabela de usuários */
.badge             /* badge do plano */
.search-bar        /* barra de busca */
.filter-tabs       /* abas de filtro por plano */
```

## Segurança
- Apenas o email definido em `VITE_ADMIN_EMAIL` tem acesso
- Verificar no início do componente: `if (user?.email !== ADMIN_EMAIL) return <Navigate to="/" />`
- O AdminLoginPage tem formulário separado do login normal

## Como adicionar nova funcionalidade ao Admin
```typescript
// Exemplo: botão de enviar email para usuário
const sendEmail = async (userId: string) => {
  // chamar edge function do Supabase ou API externa
  await supabase.functions.invoke('send-email', { body: { userId } })
}
```

## Atenção
- `ADMIN_EMAIL` é lido de `import.meta.env.VITE_ADMIN_EMAIL`
- Admin não aparece no menu lateral do app normal
- Rota `/admin-login` é separada de `/login`
- Trial end é calculado como `trial_start + trialDays`
