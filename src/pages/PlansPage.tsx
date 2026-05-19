import { useState } from 'react'
import { Crown, Star, Check, MessageCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PixModal from '../components/PixModal'

// ============================================================
// CONFIGURAÇÃO — Mercado Pago
// ============================================================
const MP_LINKS = {
  basico_mensal:  'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=48449155571c42728315c16c85caaff6',
  basico_anual:   'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=8ff79ea138144064b8dfb1fafbe6bfdf',
  premium_mensal: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=fbaa64d569bb4ac88a6ba8b222ea60e7',
  premium_anual:  'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=c7a81e826c3c47cb886c24028edc40e4',
}
const WHATSAPP_LINK = 'https://wa.me/5592993100884?text=Ol%C3%A1!%20Quero%20saber%20mais%20sobre%20o%20FinanceIQ'

const BASICO_FEATURES = [
  { text: 'Dashboard com gráficos', inc: true },
  { text: 'Lançamentos ilimitados', inc: true },
  { text: 'Orçamentos mensais', inc: true },
  { text: 'Relatórios com análises', inc: true },
  { text: 'Dados na nuvem (todos dispositivos)', inc: true },
  { text: 'Suporte via WhatsApp', inc: true },
  { text: 'Metas financeiras', inc: false },
  { text: 'Exportação Excel e PDF', inc: false },
  { text: 'Categorias personalizadas', inc: false },
]

const PREMIUM_FEATURES = [
  { text: 'Dashboard com gráficos', inc: true },
  { text: 'Lançamentos ilimitados', inc: true },
  { text: 'Orçamentos mensais', inc: true },
  { text: 'Relatórios com análises', inc: true },
  { text: 'Dados na nuvem (todos dispositivos)', inc: true },
  { text: 'Suporte prioritário via WhatsApp', inc: true },
  { text: 'Metas financeiras 🎯', inc: true },
  { text: 'Exportação Excel e PDF', inc: true },
  { text: 'Categorias personalizadas', inc: true },
]

interface PlansPageProps {
  onBack?: () => void
}

export default function PlansPage({ onBack }: PlansPageProps) {
  const { profile } = useAuth()
  const [pixModal, setPixModal] = useState<{ planName: string; amount: number; period: string } | null>(null)

  const daysLeft = profile?.plan === 'trial'
    ? Math.max(0, Math.ceil((new Date(profile.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (<>
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        {onBack && (
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 13, marginBottom: 16, padding: 0
          }}>
            <ArrowLeft size={14} /> Voltar
          </button>
        )}

        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>💳 Planos e Preços</h2>

        {profile?.plan === 'trial' && daysLeft > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10,
            padding: '8px 16px', borderRadius: 10,
            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
            color: '#f59e0b', fontSize: 13, fontWeight: 600
          }}>
            ⏱ {daysLeft} dia{daysLeft !== 1 ? 's' : ''} de trial restante{daysLeft !== 1 ? 's' : ''}
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 10 }}>
          Escolha o plano ideal para você. Cancele quando quiser.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>

        {/* Básico */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={20} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Básico</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Para uso no dia a dia</div>
            </div>
          </div>

          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: '#3b82f6' }}>R$ 9,90</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 15 }}>/mês</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
            ou R$ 99,99/ano · equivale a R$ 8,33/mês
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 24 }}>
            {BASICO_FEATURES.map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: f.inc ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {f.inc
                    ? <Check size={11} style={{ color: '#3b82f6' }} />
                    : <span style={{ color: 'var(--text-muted)', fontSize: 10, lineHeight: 1 }}>—</span>
                  }
                </div>
                <span style={{ color: f.inc ? 'var(--text)' : 'var(--text-muted)' }}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            <a href={MP_LINKS.basico_mensal} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', padding: '13px', textAlign: 'center', borderRadius: 11,
              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
              color: '#3b82f6', fontWeight: 700, fontSize: 14, textDecoration: 'none'
            }}>
              💳 Assinar por R$ 9,90/mês
            </a>
            <a href={MP_LINKS.basico_anual} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', padding: '10px', textAlign: 'center', borderRadius: 10,
              border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, textDecoration: 'none'
            }}>
              💳 Anual por R$ 99,99 (2 meses grátis) 🏷️
            </a>
          </div>

          {/* Separador PIX */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>ou pague via</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Botões PIX */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            <button onClick={() => setPixModal({ planName: 'Básico Mensal', amount: 9.90, period: 'mês' })} style={{
              padding: '10px', borderRadius: 10, border: '1px solid rgba(34,197,94,0.3)',
              background: 'rgba(34,197,94,0.08)', color: '#22c55e',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'center'
            }}>
              💸 PIX Mensal — R$ 9,90/mês
            </button>
            <button onClick={() => setPixModal({ planName: 'Básico Anual', amount: 99.99, period: 'ano' })} style={{
              padding: '9px', borderRadius: 10, border: '1px solid rgba(34,197,94,0.2)',
              background: 'rgba(34,197,94,0.05)', color: '#22c55e',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center'
            }}>
              💸 PIX Anual — R$ 99,99/ano 🏷️
            </button>
          </div>
        </div>

        {/* Premium */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(168,85,247,0.05))',
          border: '1px solid rgba(168,85,247,0.4)',
          borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column',
          position: 'relative', boxShadow: '0 8px 32px rgba(108,99,255,0.15)'
        }}>
          <div style={{
            position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #6C63FF, #a855f7)',
            color: '#fff', padding: '5px 18px', borderRadius: '0 0 12px 12px',
            fontSize: 11, fontWeight: 800, letterSpacing: 0.5
          }}>⭐ MAIS POPULAR</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, marginTop: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crown size={20} style={{ color: '#a855f7' }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Premium</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Controle financeiro completo</div>
            </div>
          </div>

          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: '#a855f7' }}>R$ 19,90</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 15 }}>/mês</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
            ou R$ 199,99/ano · equivale a R$ 16,66/mês
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 24 }}>
            {PREMIUM_FEATURES.map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(168,85,247,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Check size={11} style={{ color: '#a855f7' }} />
                </div>
                <span style={{ color: 'var(--text)' }}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            <a href={MP_LINKS.premium_mensal} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', padding: '13px', textAlign: 'center', borderRadius: 11,
              background: 'linear-gradient(135deg, #6C63FF, #a855f7)',
              color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(108,99,255,0.4)'
            }}>
              💳 Assinar por R$ 19,90/mês ✨
            </a>
            <a href={MP_LINKS.premium_anual} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', padding: '10px', textAlign: 'center', borderRadius: 10,
              background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)',
              color: '#a855f7', fontWeight: 600, fontSize: 13, textDecoration: 'none'
            }}>
              💳 Anual por R$ 199,99 (2 meses grátis) 🏷️
            </a>
          </div>

          {/* Separador PIX */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>ou pague via</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Botões PIX */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            <button onClick={() => setPixModal({ planName: 'Premium Mensal', amount: 19.90, period: 'mês' })} style={{
              padding: '10px', borderRadius: 10, border: '1px solid rgba(34,197,94,0.3)',
              background: 'rgba(34,197,94,0.08)', color: '#22c55e',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'center'
            }}>
              💸 PIX Mensal — R$ 19,90/mês
            </button>
            <button onClick={() => setPixModal({ planName: 'Premium Anual', amount: 199.99, period: 'ano' })} style={{
              padding: '9px', borderRadius: 10, border: '1px solid rgba(34,197,94,0.2)',
              background: 'rgba(34,197,94,0.05)', color: '#22c55e',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center'
            }}>
              💸 PIX Anual — R$ 199,99/ano 🏷️
            </button>
          </div>
        </div>
      </div>

      {/* FAQ rápido */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>❓ Perguntas frequentes</div>
        {[
          { q: 'Posso cancelar quando quiser?', a: 'Sim. Sem multa, sem burocracia. Você pode cancelar a qualquer momento pelo painel do Mercado Pago.' },
          { q: 'Meus dados ficam salvos se eu cancelar?', a: 'Sim, seus dados permanecem salvos. Se você reativar, tudo estará lá.' },
          { q: 'Quais formas de pagamento aceitam?', a: 'Cartão de crédito, débito e Pix via Mercado Pago.' },
          { q: 'Posso mudar de plano depois?', a: 'Sim. Entre em contato pelo WhatsApp e fazemos a migração para você.' },
        ].map(item => (
          <div key={item.q} style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.q}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>{item.a}</div>
          </div>
        ))}
      </div>

      {/* Suporte */}
      <div style={{ textAlign: 'center' }}>
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 24px', borderRadius: 12,
          background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
          color: '#22c55e', fontWeight: 600, fontSize: 14, textDecoration: 'none'
        }}>
          <MessageCircle size={18} />
          Ainda tem dúvidas? Fale com a gente no WhatsApp
        </a>
      </div>
    </div>

    {/* Modal PIX */}
    {pixModal && (
      <PixModal
        planName={pixModal.planName}
        amount={pixModal.amount}
        period={pixModal.period}
        onClose={() => setPixModal(null)}
      />
    )}
  </>)
}
