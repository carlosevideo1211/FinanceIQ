import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Wallet, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    if (!email || !password) { setError('Preencha todos os campos.'); return }
    if (password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    setError('')
    setSuccess('')
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError('Email ou senha incorretos.')
    } else {
      const { error } = await signUp(email, password)
      if (error) setError(error.includes('Database') || error.includes('unexpected') ? 'Erro ao criar conta. Tente outro email ou senha mais forte.' : error)
      else setSuccess('Conta criada! Verifique seu email para confirmar.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d0f14 0%, #1a1d2e 50%, #0d0f14 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: "Inter, sans-serif"
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', padding: '40px',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Wallet size={32} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: 0 }}>FinanceIQ</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '4px' }}>
            Gestao financeira inteligente
          </p>
        </div>

        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.05)',
          borderRadius: '10px', padding: '4px', marginBottom: '24px'
        }}>
          {(['login', 'register']).map(m => (
            <button key={m} onClick={() => { setMode(m as any); setError(''); setSuccess('') }}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                background: mode === m ? 'linear-gradient(135deg, #6C63FF, #4ECDC4)' : 'transparent',
                color: mode === m ? 'white' : 'rgba(255,255,255,0.5)'
              }}>
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input type="email" placeholder="seu@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input type={showPass ? 'text' : 'password'} placeholder="••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '12px 40px 12px 40px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }} />
            <button onClick={() => setShowPass(!showPass)} style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)'
            }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p style={{ color: '#ff6b6b', fontSize: '13px', margin: 0, textAlign: 'center' }}>{error}</p>}
          {success && <p style={{ color: '#4ECDC4', fontSize: '13px', margin: 0, textAlign: 'center' }}>{success}</p>}
          <button onClick={handleSubmit} disabled={loading} style={{
            padding: '14px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
            color: 'white', fontSize: '15px', fontWeight: 700,
            opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar minha conta'}
          </button>
        </div>
        {mode === 'register' && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }}>
            Trial gratis de 14 dias!
          </p>
        )}
      </div>
    </div>
  )
}
