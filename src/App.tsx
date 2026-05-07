import { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets      from './pages/Budgets';
import Reports      from './pages/Reports';
import LoginPage    from './pages/LoginPage';
import { LayoutDashboard, ListOrdered, Target, BarChart2, Trash2, LogOut } from 'lucide-react';
import { useFinance } from './context/FinanceContext';

type Page = 'dashboard' | 'transactions' | 'budgets' | 'reports';

const NAV = [
  { id: 'dashboard'    as Page, label: 'Início',       icon: LayoutDashboard },
  { id: 'transactions' as Page, label: 'Lançamentos',  icon: ListOrdered     },
  { id: 'budgets'      as Page, label: 'Orçamentos',   icon: Target          },
  { id: 'reports'      as Page, label: 'Relatórios',   icon: BarChart2       },
];

function Shell() {
  const [page, setPage] = useState<Page>('dashboard');
  const { clearAll } = useFinance();
  const { user, signOut } = useAuth();
  const now = new Date();

  const handleClear = () => {
    if (confirm('Apagar TODOS os dados? Esta ação não pode ser desfeita.')) clearAll();
  };

  const PageComponent = {
    dashboard: Dashboard,
    transactions: Transactions,
    budgets: Budgets,
    reports: Reports,
  }[page];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>💰 Controle de Gastos</h1>
          <p style={{ fontSize: '11px', opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <Icon className="nav-icon" />
                {item.label}
              </button>
            );
          })}
          <div className="divider" />
          <button className="sidebar-nav-item" onClick={handleClear} style={{ color: 'var(--expense)' }}>
            <Trash2 className="nav-icon" size={18} />
            Limpar dados
          </button>
          <button className="sidebar-nav-item" onClick={signOut} style={{ color: 'rgba(255,255,255,0.4)' }}>
            <LogOut className="nav-icon" size={18} />
            Sair
          </button>
        </nav>
        <div className="sidebar-date">
          {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </aside>
      <main className="main-content">
        <PageComponent />
      </main>
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          {NAV.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`bottom-nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <Icon size={22} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0d0f14', color: 'white', fontSize: '18px'
    }}>
      Carregando...
    </div>
  );

  if (!user) return <LoginPage />;

  return (
    <FinanceProvider>
      <Shell />
    </FinanceProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
