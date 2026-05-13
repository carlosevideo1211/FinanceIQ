# SKILL: Deploy e Configuração (FinanceIQ)

## Stack de produção
- **Frontend:** React 18 + TypeScript + Vite
- **Banco de dados:** Supabase (PostgreSQL)
- **Hospedagem:** Vercel
- **Autenticação:** Supabase Auth
- **Repositório:** GitHub

## Variáveis de ambiente

### .env (local — nunca commitar)
```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ADMIN_EMAIL=carlosevideo28@gmail.com
```

### Vercel (configurar no dashboard)
1. Acessar projeto no Vercel
2. Settings → Environment Variables
3. Adicionar as mesmas variáveis do .env

## vercel.json
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```
Necessário para React Router funcionar (SPA routing).

## Comandos de desenvolvimento
```powershell
cd C:\FinanceIQ
npm install          # instalar dependências
npm run dev          # servidor local http://localhost:5173
npm run build        # build de produção
npm run preview      # testar build localmente
```

## Deploy automático
```powershell
git add .
git commit -m "feat: descrição da mudança"
git push
# Vercel detecta o push e faz deploy automaticamente
```

## Configuração inicial Supabase (novo projeto)

### 1. Criar projeto em supabase.com

### 2. Criar tabelas
```sql
-- Profiles
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  name text,
  plan text DEFAULT 'trial',
  trial_start timestamptz DEFAULT now(),
  trial_end timestamptz DEFAULT (now() + interval '14 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Transactions
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text CHECK (type IN ('income','expense')),
  amount numeric NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  date date NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- Budgets
CREATE TABLE budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  limit numeric NOT NULL,
  month text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);

-- Goals
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

-- Custom Categories
CREATE TABLE custom_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  emoji text DEFAULT '🏷️',
  color text DEFAULT '#3b82f6',
  bg text DEFAULT '#3b82f620',
  type text DEFAULT 'expense' CHECK (type IN ('income','expense','both')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own categories" ON custom_categories FOR ALL USING (auth.uid() = user_id);
```

### 3. Criar trigger de perfil
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
EXCEPTION WHEN OTHERS THEN
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 4. Copiar credenciais
- Settings → API → Project URL → `VITE_SUPABASE_URL`
- Settings → API → anon public → `VITE_SUPABASE_ANON_KEY`

## Configuração inicial Vercel (novo projeto)

### 1. Conectar repositório
- vercel.com → New Project → Import GitHub repo

### 2. Build settings
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3. Adicionar variáveis de ambiente
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_ADMIN_EMAIL

### 4. Domínio personalizado (versão Pro/comercial)
- Vercel → Project → Settings → Domains
- Adicionar domínio comprado (ex: financeiro.com.br)
- Configurar DNS no registrador de domínio:
  - Type: CNAME
  - Name: www
  - Value: cname.vercel-dns.com

## Planos Vercel recomendados
| Plano | Preço | Para |
|-------|-------|------|
| Hobby | Grátis | Desenvolvimento/testes |
| Pro | $20/mês | Produção/comercial |

**Para comercializar:** usar plano Pro (domínio customizado sem limitações)

## Checklist de deploy novo projeto
- [ ] Criar projeto Supabase
- [ ] Rodar SQL das tabelas
- [ ] Rodar SQL do trigger
- [ ] Copiar credenciais para .env
- [ ] Testar localmente com `npm run dev`
- [ ] Criar repositório GitHub
- [ ] `git push` inicial
- [ ] Conectar Vercel ao repositório
- [ ] Configurar variáveis no Vercel
- [ ] Testar em produção
- [ ] Configurar domínio (se aplicável)

## Atenção
- **Nunca commitar o .env** — está no .gitignore
- O `anon key` é seguro para expor no frontend (protegido por RLS)
- **Nunca usar a `service_role key`** no frontend
- Sempre testar localmente antes de fazer push
