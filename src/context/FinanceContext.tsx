import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Transaction, Budget } from '../types';
import { SEED_TRANSACTIONS, SEED_BUDGETS } from '../types';

const TX_KEY = 'cg_transactions';
const BG_KEY = 'cg_budgets';
const SEEDED_KEY = 'cg_seeded';

interface FinanceCtx {
  transactions: Transaction[];
  budgets: Budget[];
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;
  clearAll: () => void;
}

const Ctx = createContext<FinanceCtx | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(TX_KEY);
      if (stored) return JSON.parse(stored);
      if (!localStorage.getItem(SEEDED_KEY)) return SEED_TRANSACTIONS;
      return [];
    } catch { return SEED_TRANSACTIONS; }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const stored = localStorage.getItem(BG_KEY);
      if (stored) return JSON.parse(stored);
      if (!localStorage.getItem(SEEDED_KEY)) return SEED_BUDGETS;
      return [];
    } catch { return SEED_BUDGETS; }
  });

  // Persist on change
  useEffect(() => {
    localStorage.setItem(TX_KEY, JSON.stringify(transactions));
    localStorage.setItem(SEEDED_KEY, '1');
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(BG_KEY, JSON.stringify(budgets));
  }, [budgets]);

  const addTransaction = useCallback((t: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newT: Transaction = { ...t, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setTransactions(prev => [newT, ...prev]);
  }, []);

  const updateTransaction = useCallback((t: Transaction) => {
    setTransactions(prev => prev.map(x => x.id === t.id ? t : x));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(x => x.id !== id));
  }, []);

  const addBudget = useCallback((b: Omit<Budget, 'id'>) => {
    setBudgets(prev => [...prev, { ...b, id: crypto.randomUUID() }]);
  }, []);

  const updateBudget = useCallback((b: Budget) => {
    setBudgets(prev => prev.map(x => x.id === b.id ? b : x));
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(x => x.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    localStorage.removeItem(TX_KEY);
    localStorage.removeItem(BG_KEY);
    localStorage.removeItem(SEEDED_KEY);
  }, []);

  return (
    <Ctx.Provider value={{
      transactions, budgets,
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

// ── Helpers ──────────────────────────────────────────────────
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
