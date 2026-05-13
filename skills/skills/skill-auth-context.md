# SKILL: Autenticação e Contextos (FinanceIQ)

## Arquivos
- `src/context/AuthContext.tsx` — autenticação Supabase
- `src/context/FinanceContext.tsx` — estado financeiro global
- `src/lib/supabase.ts` — cliente Supabase

## AuthContext

### Interface
```typescript
interface AuthCtx {
  user: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

interface UserProfile {
  id: string
  email: string
  name: string
  plan: 'trial' | 'basico' | 'basico_anual' | 'premium' | 'premium_anual' | 'cancelado'
  trial_start: string
  trial_end: string
  created_at: string
}
```

### Fluxo de autenticação
```typescript
// 1. Ao montar — verifica sessão existente
supabase.auth.getSession() → busca perfil em profiles → seta user

// 2. Login
supabase.auth.signInWithPassword({ email, password })
→ busca profiles WHERE id = session.user.id
→ seta user no contexto

// 3. Registro
supabase.auth.signUp({ email, password, options: { data: { name } } })
→ trigger SQL cria perfil automaticamente em profiles
→ faz login automático após registro

// 4. Logout
supabase.auth.signOut() → user = null

// 5. Listener de mudanças de auth
supabase.auth.onAuthStateChange((event, session) => { ... })
```

### Trigger SQL (criação automática de perfil)
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name, plan, trial_start, trial_end, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'trial',
    now(),
    now() + interval '14 days',
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## FinanceContext

### Interface completa
```typescript
interface FinanceCtx {
  transactions: Transaction[]
  budgets: Budget[]
  customCategories: CustomCategory[]
  loading: boolean

  // Transactions
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>
  updateTransaction: (t: Transaction) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>

  // Budgets
  addBudget: (b: Omit<Budget, 'id'>) => Promise<void>
  updateBudget: (b: Budget) => Promise<void>
  deleteBudget: (id: string) => Promise<void>

  // Custom Categories
  addCustomCategory: (c: Omit<CustomCategory, 'id' | 'user_id'>) => Promise<void>
  deleteCustomCategory: (id: string) => Promise<void>

  clearAll: () => Promise<void>
}
```

### Operações Supabase no contexto
```typescript
// Transactions
supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false })
supabase.from('transactions').insert([{ ...t, user_id: user.id }]).select().single()
supabase.from('transactions').update(updates).eq('id', id)
supabase.from('transactions').delete().eq('id', id)

// Budgets
supabase.from('budgets').select('*').eq('user_id', user.id)
supabase.from('budgets').insert([{ ...b, user_id: user.id }]).select().single()
supabase.from('budgets').update(updates).eq('id', id)
supabase.from('budgets').delete().eq('id', id)

// Custom Categories
supabase.from('custom_categories').select('*').eq('user_id', user.id)
supabase.from('custom_categories').insert([{ ...c, user_id: user.id }]).select().single()
supabase.from('custom_categories').delete().eq('id', id)
```

### Funções utilitárias exportadas
```typescript
filterByMonth(txs: Transaction[], month: string): Transaction[]
// → txs.filter(t => t.date.startsWith(month))

sumByType(txs: Transaction[], type: 'income' | 'expense'): number
// → txs.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0)

groupByCategory(txs: Transaction[]): Record<string, number>
// → { alimentacao: 500, transporte: 200, ... }

formatBRL(value: number): string
// → 'R$ 1.234,56'

monthLabel(ym: string): string
// → 'maio de 2026'
```

## supabase.ts
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
export const isSupabaseConfigured = () => !!supabaseUrl && !!supabaseKey
```

## App.tsx — proteção de rotas
```typescript
// Rotas protegidas (requer login)
<Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />

// Rotas públicas
<Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />

// Trial expirado
<Route path="/trial-expired" element={<TrialBlockedScreen />} />

// Admin (rota separada)
<Route path="/admin-login" element={<AdminLoginPage />} />
<Route path="/admin" element={<AdminPage />} />
```

## Como adicionar nova tabela ao contexto
```typescript
// 1. Adicionar interface e estado
const [novaTabela, setNovaTabela] = useState<NovoTipo[]>([])

// 2. Carregar no useEffect
const { data } = await supabase.from('nova_tabela').select('*').eq('user_id', user.id)
if (data) setNovaTabela(data)

// 3. Funções CRUD
const addItem = async (item) => {
  const { data } = await supabase.from('nova_tabela').insert([{ ...item, user_id: user.id }]).select().single()
  if (data) setNovaTabela(prev => [...prev, data])
}

// 4. Expor no value do Provider
<Ctx.Provider value={{ ..., novaTabela, addItem }}>
```

## Atenção
- `loading = true` enquanto carrega dados do Supabase
- Sempre verificar `if (!user) return` antes de operações
- RLS (Row Level Security) garante que cada usuário vê apenas seus dados
- `clearAll` apaga todas as transações e orçamentos do usuário
