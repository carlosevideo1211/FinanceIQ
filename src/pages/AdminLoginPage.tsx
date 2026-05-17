import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ============================================================
// Admin é verificado pelo email do Supabase Auth
// Não há mais senha hardcoded - a segurança vem do Supabase
// ============================================================
const ADMIN_EMAIL = 'carlosevideo28@gmail.com';

interface AdminLoginPageProps {
  onLogin: () => void;
}

export default function AdminLoginPage({ onLogin }: AdminLoginPageProps) {
  const { user } = useAuth();

  // Se o usuário logado é o admin, autoriza automaticamente
  if (user?.email === ADMIN_EMAIL) {
    sessionStorage.setItem('admin_authenticated', 'true');
    onLogin();
    return null;
  }

  // Se não é o email admin, mostra acesso negado
  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0d0f14, #1a1a2e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
        borderRadius: 20, padding: 40, width: '100%', maxWidth: 400,
        border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
        }}>
          <Shield size={30} style={{ color: '#ef4444' }} />
        </div>
        <h2 style={{ color: '#fff', margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>Acesso Negado</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
          Esta área é restrita ao administrador do sistema.
          <br />Você está logado como: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{user?.email}</strong>
        </p>
        <button onClick={() => window.location.href = '/'} style={{
          marginTop: 24, padding: '12px 28px', background: 'rgba(255,255,255,0.1)',
          color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14
        }}>
          ← Voltar ao app
        </button>
      </div>
    </div>
  );
}
