import { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets      from './pages/Budgets';
import Reports      from './pages/Reports';
import Goals        from './pages/Goals';
import AdminPage    from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import LoginPage    from './pages/LoginPage';
import TrialBlockedScreen from './pages/TrialBlockedScreen';
import PlansPage    from './pages/PlansPage';
import SupportPage  from './pages/SupportPage';
import {
  LayoutDashboard, ListOrdered, Target, BarChart2,
  Trash2, LogOut, CreditCard, MessageCircle, Zap
} from 'lucide-react';
import { useFinance } from './context/FinanceContext';

type Page = 'dashboard' | 'transactions' | 'budgets' | 'reports' | 'goals' | 'plans' | 'support';

const NAV_MAIN = [
  { id: 'dashboard'    as Page, label: 'Início',       icon: LayoutDashboard },
  { id: 'transactions' as Page, label: 'Lançamentos',  icon: ListOrdered     },
  { id: 'budgets'      as Page, label: 'Orçamentos',   icon: Target          },
  { id: 'reports'      as Page, label: 'Relatórios',   icon: BarChart2       },
  { id: 'goals'        as Page, label: 'Metas',        icon: Zap             },
];

const NAV_BOTTOM_MOBILE = [
  { id: 'dashboard'    as Page, label: 'Início',       icon: LayoutDashboard },
  { id: 'transactions' as Page, label: 'Gastos',       icon: ListOrdered     },
  { id: 'budgets'      as Page, label: 'Orçamentos',   icon: Target          },
  { id: 'reports'      as Page, label: 'Relatórios',   icon: BarChart2       },
  { id: 'goals'        as Page, label: 'Metas',        icon: Zap             },
];

function Shell() {
  const [page, setPage] = useState<Page>('dashboard');
  const { clearAll } = useFinance();
  const { user, signOut, profile } = useAuth();
  const now = new Date();

  const handleClear = () => {
    if (confirm('Apagar TODOS os dados? Esta ação não pode ser desfeita.')) clearAll();
  };

  const daysLeft = profile?.plan === 'trial'
    ? Math.max(0, Math.ceil((new Date(profile.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const PageComponent = {
    dashboard: () => <Dashboard />,
    transactions: () => <Transactions />,
    budgets: () => <Budgets />,
    reports: () => <Reports />,
    goals: () => <Goals />,
    plans: () => <PlansPage onBack={() => setPage('dashboard')} />,
    support: () => <SupportPage />,
  }[page];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>💰 FinanceIQ</h1>
          <p style={{ fontSize: '11px', opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </p>

          {/* Badge trial — clicável para abrir planos */}
          {profile?.plan === 'trial' && daysLeft > 0 && (
            <button
              onClick={() => setPage('plans')}
              style={{
                marginTop: '8px', padding: '6px 10px', borderRadius: '8px',
                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                fontSize: '11px', color: '#ffc107', cursor: 'pointer',
                textAlign: 'left', width: '100%'
              }}>
              ⏱ {daysLeft} dia{daysLeft !== 1 ? 's' : ''} de trial · Ver planos →
            </button>
          )}
          {profile?.plan === 'basico' || profile?.plan === 'basico_anual' ? (
            <div style={{
              marginTop: '8px', padding: '4px 8px', borderRadius: '6px',
              background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
              fontSize: '11px', color: '#3b82f6'
            }}>⭐ Plano Básico</div>
          ) : null}
          {profile?.plan === 'premium' || profile?.plan === 'premium_anual' ? (
            <div style={{
              marginTop: '8px', padding: '4px 8px', borderRadius: '6px',
              background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)',
              fontSize: '11px', color: '#a855f7'
            }}>👑 Plano Premium</div>
          ) : null}
        </div>

        <nav className="sidebar-nav">
          {NAV_MAIN.map(item => {
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

          {/* Planos */}
          <button
            className={`sidebar-nav-item ${page === 'plans' ? 'active' : ''}`}
            onClick={() => setPage('plans')}
            style={{ color: 'rgba(108,99,255,0.85)' }}
          >
            <CreditCard className="nav-icon" size={18} />
            Planos
          </button>

          {/* Suporte */}
          <button
            className={`sidebar-nav-item ${page === 'support' ? 'active' : ''}`}
            onClick={() => setPage('support')}
          >
            <MessageCircle className="nav-icon" size={18} />
            Suporte
          </button>

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

      {/* Bottom nav mobile */}
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          {NAV_BOTTOM_MOBILE.map(item => {
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

  // Rota admin (sem senha hardcoded — usa Supabase Auth normalmente)
  if (window.location.pathname === '/admin') {
    const isAdminAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    if (!user) return <LoginPage />;
    if (!isAdminAuth) return <AdminLoginPage onLogin={() => window.location.reload()} />;
    return <AdminPage />;
  }

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
