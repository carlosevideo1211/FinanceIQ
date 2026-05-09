import { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets      from './pages/Budgets';
import Reports      from './pages/Reports';
import Goals       from './pages/Goals';
import LoginPage    from './pages/LoginPage';
import TrialBlockedScreen from './pages/TrialBlockedScreen';
import { LayoutDashboard, ListOrdered, Target, BarChart2, Trash2, LogOut } from 'lucide-react';
import { useFinance } from './context/FinanceContext';

type Page = 'dashboard' | 'transactions' | 'budgets' | 'reports' | 'goals';

const NAV = [
  { id: 'dashboard'    as Page, label: 'Início',       icon: LayoutDashboard },
  { id: 'transactions' as Page, label: 'Lançamentos',  icon: ListOrdered     },
  { id: 'budgets'      as Page, label: 'Orçamentos',   icon: Target          },
  { id: 'reports'      as Page, label: 'Relatórios',   icon: BarChart2       },
  { id: 'goals'        as Page, label: 'Metas',         icon: Target          },
];

function Shell() {
  const [page, setPage] = useState<Page>('dashboard');
  const { clearAll } = useFinance();
  const { user, signOut, profile } = useAuth();
  const now = new Date();

  const handleClear = () => {
    if (confirm('Apagar TODOS os dados? Esta ação não pode ser desfeita.')) clearAll();
  };

  const daysLeft = profile
    ? Math.max(0, Math.ceil((new Date(profile.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const PageComponent = {
    dashboard: Dashboard,
    transactions: Transactions,
    budgets: Budgets,
    reports: Reports,
    goals: Goals,
  }[page];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>💰 Controle de Gastos</h1>
          <p style={{ fontSize: '11px', opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          {profile?.plan === 'trial' && daysLeft > 0 && (
            <div style={{
              marginTop: '6px', padding: '4px 8px', borderRadius: '6px',
              background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.3)',
              fontSize: '11px', color: '#ffc107'
            }}>
              ⏱ {daysLeft} dia{daysLeft !== 1 ? 's' : ''} de trial restante{daysLeft !== 1 ? 's' : ''}
            </div>
          )}
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
  const { user, loading, trialExpired } = useAuth();

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0d0f14', color: 'white', fontSize: '18px'
    }}>
      Carregando...
    </div>
  );

  if (!user) return <LoginPage />;
  if (trialExpired) return <TrialBlockedScreen />;

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
