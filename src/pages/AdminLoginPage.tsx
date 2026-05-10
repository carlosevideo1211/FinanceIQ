import { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';

const ADMIN_EMAIL = 'carlosevideo28@gmail.com';
const ADMIN_PASSWORD = 'carlos 123';

interface AdminLoginPageProps {
  onLogin: () => void;
}

export default function AdminLoginPage({ onLogin }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');

  const handleReset = () => {
    setError('');
    setSuccess('');
    if (!email) { setError('Digite seu email de admin.'); return; }
    if (email !== ADMIN_EMAIL) { setError('Email não autorizado.'); return; }
    if (!newPassword) { setError('Digite a nova senha.'); return; }
    if (newPassword !== confirmPassword) { setError('Senhas não coincidem.'); return; }
    if (newPassword.length < 6) { setError('Senha deve ter pelo menos 6 caracteres.'); return; }
    setLoading(true);
    setTimeout(() => {
      // Store new password in localStorage
      localStorage.setItem('admin_custom_password', newPassword);
      setSuccess('Senha redefinida com sucesso! Faça login com a nova senha.');
      setResetMode(false);
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
    }, 800);
  };

  const handleReset = () => {
    setError('');
    setSuccess('');
    if (!email) { setError('Digite seu email de admin.'); return; }
    if (email !== ADMIN_EMAIL) { setError('Email não autorizado.'); return; }
    if (!newPassword) { setError('Digite a nova senha.'); return; }
    if (newPassword !== confirmPassword) { setError('Senhas não coincidem.'); return; }
    if (newPassword.length < 6) { setError('Senha deve ter pelo menos 6 caracteres.'); return; }
    setLoading(true);
    setTimeout(() => {
      // Store new password in localStorage
      localStorage.setItem('admin_custom_password', newPassword);
      setSuccess('Senha redefinida com sucesso! Faça login com a nova senha.');
      setResetMode(false);
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
    }, 800);
  };

  const handleLogin = () => {
    setError('');
    if (!email || !password) { setError('Preencha todos os campos.'); return; }
    setLoading(true);
    setTimeout(() => {
      const customPassword = localStorage.getItem('admin_custom_password');
      const validPassword = customPassword || ADMIN_PASSWORD;
      if (email === ADMIN_EMAIL && password === validPassword) {
        sessionStorage.setItem('admin_authenticated', 'true');
        onLogin();
      } else {
        setError('Email ou senha incorretos.');
      }
      setLoading(false);
    }, 800);
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid rgba(108,99,255,0.3)', background: 'rgba(255,255,255,0.05)',
    color: '#fff', fontSize: 15, boxSizing: 'border-box' as const, outline: 'none'
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0d0f14, #1a1a2e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
        borderRadius: 20, padding: 40, width: '100%', maxWidth: 400,
        border: '1px solid rgba(108,99,255,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6C63FF, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Shield size={30} style={{ color: '#fff' }} />
          </div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: 0 }}>Admin Panel</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '8px 0 0' }}>
            FinanceIQ — Área Restrita
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              style={inp}
              type="email"
              placeholder="admin@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <input
                style={inp}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              padding: '14px', background: loading ? 'rgba(108,99,255,0.5)' : 'linear-gradient(135deg, #6C63FF, #a855f7)',
              color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700,
              fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(108,99,255,0.4)', marginTop: 4
            }}
          >
            {loading ? 'Verificando...' : '🔐 Entrar no Admin'}
          </button>
        </div>

        {!resetMode ? (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={() => { setResetMode(true); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: 'rgba(108,99,255,0.7)', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}
            >
              Esqueci minha senha
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16, padding: '16px', background: 'rgba(108,99,255,0.1)', borderRadius: 10, border: '1px solid rgba(108,99,255,0.2)' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>🔑 Redefinir Senha</div>
            <input style={inp} type="email" placeholder="Seu email de admin" value={email} onChange={e => setEmail(e.target.value)} />
            <input style={inp} type="password" placeholder="Nova senha" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <input style={inp} type="password" placeholder="Confirmar nova senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            {success && <div style={{ color: '#22c55e', fontSize: 13, textAlign: 'center' }}>{success}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setResetMode(false); setError(''); }} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleReset} disabled={loading} style={{ flex: 1, padding: '10px', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 16, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          Acesso restrito a administradores
        </div>
      </div>
    </div>
  );
}
