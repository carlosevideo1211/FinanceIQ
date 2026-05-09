// ============================================================
//  TYPES & CONSTANTS
// ============================================================

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO date string YYYY-MM-DD
  note?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline?: string; // YYYY-MM-DD
  category: string;
  color: string;
  created_at: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string; // YYYY-MM
}

export const CATEGORIES: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  alimentacao: { label: 'Alimentação',    emoji: '🍔', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  transporte:  { label: 'Transporte',     emoji: '🚗', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  moradia:     { label: 'Moradia',        emoji: '🏠', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  saude:       { label: 'Saúde',          emoji: '❤️', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  lazer:       { label: 'Lazer',          emoji: '🎮', color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
  educacao:    { label: 'Educação',       emoji: '📚', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'  },
  roupas:      { label: 'Roupas',         emoji: '👕', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)'  },
  assinaturas: { label: 'Assinaturas',   emoji: '📺', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  salario:     { label: 'Salário',        emoji: '💰', color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  freelance:   { label: 'Freelance',      emoji: '💻', color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  outros:      { label: 'Outros',         emoji: '📦', color: '#64748b', bg: 'rgba(100,116,139,0.12)'},
};

export const INCOME_CATEGORIES = ['salario', 'freelance', 'outros'];
export const EXPENSE_CATEGORIES = ['alimentacao','transporte','moradia','saude','lazer','educacao','roupas','assinaturas','outros'];

// ============================================================
//  SEED DATA (demo)
// ============================================================
const today = new Date();
const m = (n: number) => {
  const d = new Date(today);
  d.setDate(n);
  return d.toISOString().slice(0, 10);
};

const prevMonth = (day: number) => {
  const d = new Date(today);
  d.setMonth(d.getMonth() - 1);
  d.setDate(day);
  return d.toISOString().slice(0, 10);
};

export const SEED_TRANSACTIONS: Transaction[] = [
  // Current month
  { id:'t1',  type:'income',  amount:4500,  description:'Salário',               category:'salario',     date: m(1),  createdAt: m(1) },
  { id:'t2',  type:'expense', amount:1200,  description:'Aluguel',               category:'moradia',     date: m(1),  createdAt: m(1) },
  { id:'t3',  type:'expense', amount:89.90, description:'Netflix + Spotify',     category:'assinaturas', date: m(2),  createdAt: m(2) },
  { id:'t4',  type:'expense', amount:320,   description:'Supermercado',          category:'alimentacao', date: m(3),  createdAt: m(3) },
  { id:'t5',  type:'expense', amount:150,   description:'Gasolina',              category:'transporte',  date: m(5),  createdAt: m(5) },
  { id:'t6',  type:'expense', amount:78.50, description:'Restaurante',           category:'alimentacao', date: m(7),  createdAt: m(7) },
  { id:'t7',  type:'income',  amount:800,   description:'Freela design',         category:'freelance',   date: m(8),  createdAt: m(8) },
  { id:'t8',  type:'expense', amount:200,   description:'Farmácia',              category:'saude',       date: m(9),  createdAt: m(9) },
  { id:'t9',  type:'expense', amount:45,    description:'Uber',                  category:'transporte',  date: m(10), createdAt: m(10) },
  { id:'t10', type:'expense', amount:230,   description:'Curso online',          category:'educacao',    date: m(11), createdAt: m(11) },
  { id:'t11', type:'expense', amount:120,   description:'Cinema + jantar',       category:'lazer',       date: m(12), createdAt: m(12) },
  { id:'t12', type:'expense', amount:280,   description:'Roupas novas',          category:'roupas',      date: m(14), createdAt: m(14) },
  // Previous month
  { id:'t13', type:'income',  amount:4500,  description:'Salário',               category:'salario',     date: prevMonth(1),  createdAt: prevMonth(1)  },
  { id:'t14', type:'expense', amount:1200,  description:'Aluguel',               category:'moradia',     date: prevMonth(1),  createdAt: prevMonth(1)  },
  { id:'t15', type:'expense', amount:89.90, description:'Netflix + Spotify',     category:'assinaturas', date: prevMonth(2),  createdAt: prevMonth(2)  },
  { id:'t16', type:'expense', amount:280,   description:'Supermercado',          category:'alimentacao', date: prevMonth(5),  createdAt: prevMonth(5)  },
  { id:'t17', type:'expense', amount:140,   description:'Gasolina',              category:'transporte',  date: prevMonth(8),  createdAt: prevMonth(8)  },
  { id:'t18', type:'income',  amount:500,   description:'Venda de itens',        category:'outros',      date: prevMonth(10), createdAt: prevMonth(10) },
  { id:'t19', type:'expense', amount:95,    description:'Academia',              category:'saude',       date: prevMonth(12), createdAt: prevMonth(12) },
  { id:'t20', type:'expense', amount:190,   description:'Churrasco lazer',       category:'lazer',       date: prevMonth(20), createdAt: prevMonth(20) },
];

export const SEED_BUDGETS: Budget[] = [
  { id:'b1', category:'alimentacao', limit:600,  month: today.toISOString().slice(0,7) },
  { id:'b2', category:'transporte',  limit:300,  month: today.toISOString().slice(0,7) },
  { id:'b3', category:'moradia',     limit:1300, month: today.toISOString().slice(0,7) },
  { id:'b4', category:'lazer',       limit:200,  month: today.toISOString().slice(0,7) },
  { id:'b5', category:'assinaturas', limit:100,  month: today.toISOString().slice(0,7) },
  { id:'b6', category:'saude',       limit:250,  month: today.toISOString().slice(0,7) },
];
