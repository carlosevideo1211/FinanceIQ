import { useAuth } from '../context/AuthContext'
import { Lock, Crown, Check } from 'lucide-react'

export default function TrialBlockedScreen() {
  const { user, signOut, profile } = useAuth()
  const daysUsed = profile ? Math.floor((Date.now() - new Date(profile.trial_start).getTime()) / (1000 * 60 * 60 * 24)) : 14

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d0f14 0%, #1a1d2e 50%, #0d0f14 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '100%', maxWidth: '440px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px', padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(255,107,107,0.15)', border: '2px solid rgba(255,107,107,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <Lock size={32} color="#ff6b6b" />
        </div>

        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>
          Seu trial encerrou
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: '0 0 32px', lineHeight: 1.6 }}>
          Você usou {daysUsed} dias grátis. Seus dados estão salvos e seguros.
          Assine para continuar acessando.
        </p>

        <div style={{
          background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: '16px', padding: '24px', marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <Crown size={20} color="#6C63FF" />
            <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>Plano Básico</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
            R$ 9,90<span style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>/mês</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px' }}>
            ou R$ 95,90/ano (2 meses grátis)
          </div>
          {['Dados sincronizados na nuvem', 'Acesso em todos os dispositivos', 'Histórico completo', 'Suporte por email'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Check size={16} color="#4ECDC4" />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{f}</span>
            </div>
          ))}
        </div>

        <a href="https://hotmart.com" target="_blank" rel="noopener noreferrer" style={{
          display: 'block', padding: '14px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
          color: 'white', fontSize: '16px', fontWeight: 700,
          textDecoration: 'none', marginBottom: '12px'
        }}>
          Assinar agora
        </a>

        <button onClick={signOut} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
          fontSize: '13px', cursor: 'pointer', padding: '8px'
        }}>
          Sair da conta ({user?.email})
        </button>
      </div>
    </div>
  )
}
