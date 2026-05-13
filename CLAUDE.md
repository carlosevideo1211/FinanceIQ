# CLAUDE.md — FinanceIQ

## 📋 Visão Geral do Projeto

**FinanceIQ** é um sistema de controle financeiro pessoal SaaS com autenticação, planos de assinatura e painel administrativo. Desenvolvido em React + TypeScript + Supabase + Vercel.

- **URL Produção:** https://finance-iq-fawn.vercel.app
- **Repositório:** https://github.com/carlosevideo1211/FinanceIQ
- **Admin:** carlosevideo28@gmail.com
- **Stack:** React 18, TypeScript, Vite, Supabase, Vercel

---

## 🏗️ Estrutura do Projeto

```
C:\FinanceIQ\
├── src/
│   ├── App.tsx                    # Roteamento principal
│   ├── index.css                  # Estilos globais (CSS vars, componentes)
│   ├── main.tsx                   # Entry point
│   ├── types.ts                   # Interfaces e constantes (CATEGORIES, etc)
│   ├── components/
│   │   ├── CategoryManager.tsx    # Modal para criar/deletar categorias personalizadas
│   │   ├── PremiumLock.tsx        # Bloqueio de features para planos pagos
│   │   ├── TransactionModal.tsx   # Modal de criar/editar lançamentos
│   │   └── TxItem.tsx             # Item de transação na lista
│   ├── context/
│   │   ├── AuthContext.tsx        # Autenticação Supabase (login/logout/user)
│   │   └── FinanceContext.tsx     # Estado global (transações, orçamentos, metas, categorias)
│   ├── lib/
│   │   └── supabase.ts            # Cliente Supabase configurado
│   └── pages/
│       ├── AdminLoginPage.tsx     # Login exclusivo do admin
│       ├── AdminPage.tsx          # Painel admin (usuários, planos, inquilinos)
│       ├── Budgets.tsx            # Orçamentos por categoria
│       ├── Dashboard.tsx          # Tela inicial com resumo financeiro
│       ├── Goals.tsx              # Metas financeiras
│       ├── LoginPage.tsx          # Login/registro de usuários
│       ├── Reports.tsx            # Relatórios e gráficos
│       ├── Transactions.tsx       # Lista de lançamentos com filtros
│       └── TrialBlockedScreen.tsx # Tela de trial expirado
├── .env                           # Variáveis de ambiente (não commitado)
├── index.html
├── package.json
├── tsconfig.json
├── vercel.json
└── vite.config.ts
```

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfil do usuário (plano, trial, nome, email) |
| `transactions` | Lançamentos financeiros |
| `budgets` | Orçamentos por categoria/mês |
| `goals` | Metas financeiras |
| `custom_categories` | Categorias personalizadas por usuário |

### Tabela `profiles`
```sql
id uuid (FK auth.users)
email text
name text
plan text -- 'trial' | 'basico' | 'basico_anual' | 'premium' | 'premium_anual' | 'cancelado'
trial_start timestamptz
trial_end timestamptz
created_at timestamptz
updated_at timestamptz
```

### Tabela `transactions`
```sql
id uuid PRIMARY KEY
user_id uuid (FK auth.users)
type text -- 'income' | 'expense'
amount numeric
description text
category text -- chave do CATEGORIES ou id de custom_category
date date
note text
created_at timestamptz
```

### Tabela `budgets`
```sql
id uuid PRIMARY KEY
user_id uuid (FK auth.users)
category text
limit numeric
month text -- 'YYYY-MM'
```

### Tabela `goals`
```sql
id uuid PRIMARY KEY
user_id uuid (FK auth.users)
title text
description text
target_amount numeric
current_amount numeric
deadline date
category text
color text
created_at timestamptz
```

### Tabela `custom_categories`
```sql
id uuid PRIMARY KEY
user_id uuid (FK auth.users)
label text
emoji text
color text
bg text
type text -- 'income' | 'expense' | 'both'
created_at timestamptz
```

---

## 🔐 Autenticação e Planos

### Planos disponíveis
| Plano | Valor | Funcionalidades |
|-------|-------|-----------------|
| `trial` | Grátis 14 dias | Acesso completo temporário |
| `basico` | R$9,90/mês | Funcionalidades básicas |
| `basico_anual` | R$99/ano | Funcionalidades básicas |
| `premium` | R$19,90/mês | Acesso completo |
| `premium_anual` | R$199/ano | Acesso completo |
| `cancelado` | — | Sem acesso |

### Fluxo de autenticação
1. Usuário se registra → trigger cria perfil em `profiles` com plano `trial`
2. Trial de 14 dias → ao expirar, redireciona para `TrialBlockedScreen`
3. Admin pode alterar plano manualmente no `AdminPage`

---

## 🎨 Design System (CSS Variables)

```css
--bg: #0d1117          /* fundo principal */
--surface: #161b22     /* cards e modais */
--surface2: #1c2128    /* inputs e elementos secundários */
--border: #30363d      /* bordas */
--text: #e6edf3        /* texto principal */
--text2: #8b949e       /* texto secundário */
--primary: #7c3aed     /* roxo — cor primária */
--income: #22c55e      /* verde — receitas */
--expense: #ef4444     /* vermelho — despesas */
--radius: 10px
```

### Classes de componentes disponíveis
```css
.btn .btn-primary .btn-secondary .btn-ghost .btn-danger .btn-icon
.modal .modal-overlay .modal-header .modal-body .modal-footer
.form-group .form-label .form-input .form-select .form-textarea
.card .page-header
.tx-item .tx-icon .tx-info .tx-desc .tx-meta .tx-amount
.type-btn .type-btn.active-income .type-btn.active-expense
.cat-badge
```

---

## 📦 Categorias Padrão (types.ts)

```typescript
CATEGORIES = {
  alimentacao, transporte, moradia, saude, lazer,
  educacao, roupas, assinaturas, salario, freelance, outros
}
INCOME_CATEGORIES  = ['salario', 'freelance', 'outros']
EXPENSE_CATEGORIES = ['alimentacao','transporte','moradia','saude',
                      'lazer','educacao','roupas','assinaturas','outros']
```

---

## ⚙️ Variáveis de Ambiente (.env)

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ADMIN_EMAIL=carlosevideo28@gmail.com
```

---

## 🚀 Comandos Úteis

```powershell
# Desenvolvimento
cd C:\FinanceIQ
npm run dev

# Build para produção
npm run build

# Deploy (automático via git push)
git add .
git commit -m "feat: descrição"
git push
```

---

## 🛠️ Painel Admin

- **URL:** /admin-login
- **Email:** carlosevideo28@gmail.com
- **Funcionalidades:**
  - Ver todos os usuários cadastrados
  - Alterar plano de qualquer usuário
  - Cadastrar inquilinos
  - Ativar/desativar usuários
  - Ver estatísticas (total, trial, básico, premium, cancelado)

---

## 🔧 Como Adicionar Novas Features

### 1. Nova página
```typescript
// src/pages/NovaPagina.tsx
export default function NovaPagina() { ... }

// src/App.tsx — adicionar rota
<Route path="/nova" element={<NovaPagina />} />
```

### 2. Nova tabela no Supabase
```sql
CREATE TABLE nova_tabela (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  -- campos...
  created_at timestamptz DEFAULT now()
);
ALTER TABLE nova_tabela ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own data" ON nova_tabela FOR ALL USING (auth.uid() = user_id);
```

### 3. Nova função no contexto
```typescript
// src/context/FinanceContext.tsx
// 1. Adicionar na interface FinanceCtx
// 2. Implementar a função
// 3. Adicionar no value do Provider
```

---

## 📝 Histórico de Versões

| Data | Versão | Descrição |
|------|--------|-----------|
| 05/05/2026 | 1.0.0 | Versão inicial — dashboard, lançamentos, orçamentos |
| 07/05/2026 | 1.1.0 | Metas financeiras, relatórios |
| 10/05/2026 | 1.2.0 | Painel admin, cadastro de inquilinos |
| 12/05/2026 | 1.3.0 | Categorias personalizadas |

---

## 🎯 FinanceIQ Pro (Próxima Versão)

Melhorias planejadas para a versão comercial:
- [ ] Dashboard com gráficos avançados (pizza, evolução mensal)
- [ ] Exportar relatórios em PDF
- [ ] Lançamentos recorrentes automáticos
- [ ] Importar extratos CSV do banco
- [ ] Controle de cartão de crédito
- [ ] IA para categorização automática
- [ ] Previsão de saldo (próximos 30 dias)
- [ ] Alertas de orçamento por email
- [ ] Modo dark/light toggle
- [ ] Domínio próprio + plano pago Vercel
