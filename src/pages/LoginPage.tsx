import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Wallet, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    if (mode === 'forgot') {
      if (!email) { setError('Informe seu email.'); return }
      setLoading(true); setError(''); setSuccess('')
      const { error } = await resetPassword(email)
      if (error) setError('Erro ao enviar email. Verifique o endereço.')
      else setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.')
      setLoading(false)
      return
    }

    if (!email || !password) { setError('Preencha todos os campos.'); return }
    if (password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true); setError(''); setSuccess('')

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError('Email ou senha incorretos.')
    } else {
      const { error } = await signUp(email, password)
      if (error) setError(
        error.includes('Database') || error.includes('unexpected')
          ? 'Erro ao criar conta. Tente outro email ou senha mais forte.'
          : error
      )
      else setSuccess('Conta criada! Verifique seu email para confirmar o cadastro.')
    }
    setLoading(false)
  }

  const switchMode = (m: 'login' | 'register' | 'forgot') => {
    setMode(m); setError(''); setSuccess(''); setEmail(''); setPassword('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d0f14 0%, #1a1d2e 50%, #0d0f14 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px', padding: '40px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(108,99,255,0.4)'
          }}>
            <Wallet size={34} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: '26px', fontWeight: 800, margin: 0 }}>FinanceIQ</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginTop: '6px' }}>
            {mode === 'forgot' ? 'Recuperação de senha' : 'Gestão financeira inteligente'}
          </p>
        </div>

        {/* Tabs (login/registro) */}
        {mode !== 'forgot' && (
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px', padding: '4px', marginBottom: '24px'
          }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                style={{
                  flex: 1, padding: '9px', borderRadius: '9px', border: 'none',
                  cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                  background: mode === m ? 'linear-gradient(135deg, #6C63FF, #4ECDC4)' : 'transparent',
                  color: mode === m ? 'white' : 'rgba(255,255,255,0.45)',
                  transition: 'all 0.2s'
                }}>
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Campo Email */}
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '13px 13px 13px 42px', borderRadius: '11px',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
          </div>

          {/* Campo Senha (apenas login e registro) */}
          {mode !== 'forgot' && (
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{
                  width: '100%', padding: '13px 42px 13px 42px', borderRadius: '11px',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }} />
              <button onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)'
              }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}

          {/* Link esqueci senha (só no login) */}
          {mode === 'login' && (
            <button
              onClick={() => switchMode('forgot')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(108,99,255,0.9)', fontSize: '13px',
                textAlign: 'right', padding: 0, marginTop: -4
              }}>
              Esqueci minha senha
            </button>
          )}

          {/* Mensagens */}
          {error && <p style={{ color: '#ff6b6b', fontSize: '13px', margin: 0, textAlign: 'center', background: 'rgba(255,107,107,0.1)', padding: '10px', borderRadius: 8 }}>{error}</p>}
          {success && <p style={{ color: '#4ECDC4', fontSize: '13px', margin: 0, textAlign: 'center', background: 'rgba(78,205,196,0.1)', padding: '10px', borderRadius: 8 }}>{success}</p>}

          {/* Botão principal */}
          <button onClick={handleSubmit} disabled={loading} style={{
            padding: '14px', borderRadius: '11px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
            color: 'white', fontSize: '15px', fontWeight: 700,
            opacity: loading ? 0.75 : 1,
            boxShadow: '0 4px 15px rgba(108,99,255,0.35)',
            transition: 'opacity 0.2s'
          }}>
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar minha conta grátis' : 'Enviar email de recuperação'}
          </button>

          {/* Voltar (modo forgot) */}
          {mode === 'forgot' && (
            <button onClick={() => switchMode('login')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)', fontSize: '13px', padding: '4px'
            }}>
              ← Voltar para o login
            </button>
          )}
        </div>

        {/* Trial info no registro */}
        {mode === 'register' && (
          <div style={{
            marginTop: '20px', padding: '14px', borderRadius: '12px',
            background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ color: '#4ECDC4', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
              🎉 14 dias grátis, sem cartão!
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
              Após o trial, escolha o plano que melhor se encaixa em você
            </div>
          </div>
        )}

        {/* Footer legal */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', lineHeight: 1.6 }}>
            Ao continuar, você concorda com nossos{' '}
            <a href="/termos-de-uso.html" target="_blank" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>Termos de Uso</a>
            {' '}e{' '}
            <a href="/politica-privacidade.html" target="_blank" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>Política de Privacidade</a>
          </p>
        </div>
      </div>
    </div>
  )
}
