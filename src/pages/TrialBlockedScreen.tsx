import { useAuth } from '../context/AuthContext'
import { Lock, Crown, Star, Check, MessageCircle } from 'lucide-react'

// ============================================================
// CONFIGURAÇÃO DE PLANOS — Mercado Pago
// Substitua os links abaixo pelos links reais do Mercado Pago
// após criar os planos no dashboard de desenvolvedor
// ============================================================
const MP_LINKS = {
  basico_mensal:  'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=48449155571c42728315c16c85caaff6',
  basico_anual:   'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=8ff79ea138144064b8dfb1fafbe6bfdf',
  premium_mensal: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=fbaa64d569bb4ac88a6ba8b222ea60e7',
  premium_anual:  'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=c7a81e826c3c47cb886c24028edc40e4',
}

const WHATSAPP_LINK = 'https://wa.me/5592993100884?text=Ol%C3%A1!%20Tenho%20interesse%20no%20FinanceIQ'

const BASICO_FEATURES = [
  'Dashboard e gráficos',
  'Lançamentos ilimitados',
  'Orçamentos mensais',
  'Relatórios com gráficos',
  'Dados na nuvem (todos dispositivos)',
  'Suporte via WhatsApp',
]

const PREMIUM_FEATURES = [
  'Tudo do plano Básico',
  'Metas financeiras 🎯',
  'Exportação Excel e PDF',
  'Categorias personalizadas',
  'Análises avançadas',
  'Suporte prioritário',
]

function PlanCard({
  name, icon, color, monthly, annual, annualTotal, features, links, highlight
}: {
  name: string, icon: React.ReactNode, color: string, monthly: string,
  annual: string, annualTotal: string, features: string[],
  links: { mensal: string, anual: string }, highlight?: boolean
}) {
  return (
    <div style={{
      background: highlight ? `linear-gradient(135deg, ${color}15, ${color}08)` : 'rgba(255,255,255,0.04)',
      border: `1px solid ${highlight ? color + '55' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: '20px', padding: '28px', flex: 1,
      position: 'relative', overflow: 'hidden',
      boxShadow: highlight ? `0 8px 32px ${color}22` : 'none'
    }}>
      {highlight && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: color, color: '#fff', padding: '3px 12px',
          borderRadius: 20, fontSize: 11, fontWeight: 700
        }}>MAIS POPULAR</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ color }}>{icon}</div>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{name}</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>
          R$ {monthly}<span style={{ fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>/mês</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
          ou R$ {annualTotal}/ano (~R$ {annual}/mês — 2 meses grátis)
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {features.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <Check size={15} style={{ color, flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>{f}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <a href={links.mensal} target="_blank" rel="noopener noreferrer" style={{
          display: 'block', padding: '12px', textAlign: 'center', borderRadius: 10,
          background: `linear-gradient(135deg, ${color}, ${color}cc)`,
          color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none',
          boxShadow: `0 4px 15px ${color}44`
        }}>
          Assinar Mensal — R$ {monthly}/mês
        </a>
        <a href={links.anual} target="_blank" rel="noopener noreferrer" style={{
          display: 'block', padding: '10px', textAlign: 'center', borderRadius: 10,
          background: `${color}18`, border: `1px solid ${color}44`,
          color, fontSize: 13, fontWeight: 600, textDecoration: 'none'
        }}>
          Assinar Anual — R$ {annualTotal}/ano 🏷️
        </a>
      </div>
    </div>
  )
}

export default function TrialBlockedScreen() {
  const { user, signOut, profile } = useAuth()
  const daysUsed = profile
    ? Math.floor((Date.now() - new Date(profile.trial_start).getTime()) / (1000 * 60 * 60 * 24))
    : 14

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d0f14 0%, #1a1d2e 50%, #0d0f14 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px', fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '800px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(255,107,107,0.15)', border: '2px solid rgba(255,107,107,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Lock size={32} color="#ff6b6b" />
          </div>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 800, margin: '0 0 10px' }}>
            Seu período de teste encerrou
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: 0, lineHeight: 1.6 }}>
            Você usou <strong style={{ color: '#fff' }}>{daysUsed} dias grátis</strong>. Seus dados estão salvos e seguros.
            <br />Escolha um plano para continuar usando o FinanceIQ.
          </p>
        </div>

        {/* Cards de planos */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
          <PlanCard
            name="Básico"
            icon={<Star size={24} />}
            color="#3b82f6"
            monthly="9,90"
            annual="8,33"
            annualTotal="99,99"
            features={BASICO_FEATURES}
            links={{ mensal: MP_LINKS.basico_mensal, anual: MP_LINKS.basico_anual }}
          />
          <PlanCard
            name="Premium"
            icon={<Crown size={24} />}
            color="#a855f7"
            monthly="19,90"
            annual="16,66"
            annualTotal="199,99"
            features={PREMIUM_FEATURES}
            links={{ mensal: MP_LINKS.premium_mensal, anual: MP_LINKS.premium_anual }}
            highlight
          />
        </div>

        {/* Suporte e sair */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
            color: '#22c55e', fontSize: 13, fontWeight: 600, textDecoration: 'none'
          }}>
            <MessageCircle size={16} />
            Falar com suporte via WhatsApp
          </a>
          <button onClick={signOut} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)',
            fontSize: '13px', cursor: 'pointer', padding: '6px 12px'
          }}>
            Sair da conta ({user?.email})
          </button>
        </div>
      </div>
    </div>
  )
}
