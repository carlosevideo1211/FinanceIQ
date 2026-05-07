import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Transaction, Budget } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface FinanceCtx {
  transactions: Transaction[];
  budgets: Budget[];
  loading: boolean;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBudget: (b: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (b: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const Ctx = createContext<FinanceCtx | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do Supabase
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const loadData = async () => {
      const [txRes, bgRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('budgets').select('*').eq('user_id', user.id)
      ]);

      if (txRes.data) {
        setTransactions(txRes.data.map(t => ({
          id: t.id,
          type: t.type === 'receita' ? 'income' : 'expense',
          amount: t.amount,
          description: t.description,
          category: t.category,
          date: t.date,
          createdAt: t.created_at
        })));
      }

      if (bgRes.data) {
        setBudgets(bgRes.data.map(b => ({
          id: b.id,
          category: b.category,
          limit: b.limit_amount,
          month: `${b.year}-${String(b.month).padStart(2, '0')}`
        })));
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  const addTransaction = useCallback(async (t: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: t.type === 'income' ? 'receita' : 'despesa',
      amount: t.amount,
      description: t.description,
      category: t.category,
      date: t.date
    }).select().single();

    if (data) {
      setTransactions(prev => [{
        id: data.id, type: t.type, amount: t.amount,
        description: t.description, category: t.category,
        date: t.date, createdAt: data.created_at
      }, ...prev]);
    }
  }, [user]);

  const updateTransaction = useCallback(async (t: Transaction) => {
    if (!user) return;
    await supabase.from('transactions').update({
      type: t.type === 'income' ? 'receita' : 'despesa',
      amount: t.amount, description: t.description,
      category: t.category, date: t.date
    }).eq('id', t.id).eq('user_id', user.id);
    setTransactions(prev => prev.map(x => x.id === t.id ? t : x));
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
    setTransactions(prev => prev.filter(x => x.id !== id));
  }, [user]);

  const addBudget = useCallback(async (b: Omit<Budget, 'id'>) => {
    if (!user) return;
    const [year, month] = b.month.split('-').map(Number);
    const { data } = await supabase.from('budgets').upsert({
      user_id: user.id, category: b.category,
      limit_amount: b.limit, month, year
    }, { onConflict: 'user_id,category,month,year' }).select().single();

    if (data) {
      setBudgets(prev => {
        const filtered = prev.filter(x => !(x.category === b.category && x.month === b.month));
        return [...filtered, { id: data.id, category: b.category, limit: b.limit, month: b.month }];
      });
    }
  }, [user]);

  const updateBudget = useCallback(async (b: Budget) => {
    if (!user) return;
    const [year, month] = b.month.split('-').map(Number);
    await supabase.from('budgets').update({ limit_amount: b.limit })
      .eq('user_id', user.id).eq('category', b.category).eq('month', month).eq('year', year);
    setBudgets(prev => prev.map(x => x.id === b.id ? b : x));
  }, [user]);

  const deleteBudget = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('budgets').delete().eq('id', id).eq('user_id', user.id);
    setBudgets(prev => prev.filter(x => x.id !== id));
  }, [user]);

  const clearAll = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      supabase.from('transactions').delete().eq('user_id', user.id),
      supabase.from('budgets').delete().eq('user_id', user.id)
    ]);
    setTransactions([]);
    setBudgets([]);
  }, [user]);

  return (
    <Ctx.Provider value={{
      transactions, budgets, loading,
      addTransaction, updateTransaction, deleteTransaction,
      addBudget, updateBudget, deleteBudget, clearAll
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useFinance must be inside FinanceProvider');
  return ctx;
}

export function filterByMonth(txs: Transaction[], month: string) {
  return txs.filter(t => t.date.startsWith(month));
}

export function sumByType(txs: Transaction[], type: 'income' | 'expense') {
  return txs.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);
}

export function groupByCategory(txs: Transaction[]) {
  const map: Record<string, number> = {};
  txs.forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
  return map;
}

export function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function monthLabel(ym: string) {
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}
