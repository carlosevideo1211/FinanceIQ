import { Crown, Star, Check, MessageCircle, X } from 'lucide-react'

// ============================================================
// CONFIGURAÇÃO — Mercado Pago
// ============================================================
const MP_LINKS = {
  basico_mensal:  'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=48449155571c42728315c16c85caaff6',
  basico_anual:   'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=8ff79ea138144064b8dfb1fafbe6bfdf',
  premium_mensal: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=fbaa64d569bb4ac88a6ba8b222ea60e7',
  premium_anual:  'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=c7a81e826c3c47cb886c24028edc40e4',
}
const WHATSAPP_LINK = 'https://wa.me/5592993100884?text=Ol%C3%A1!%20Tenho%20interesse%20no%20FinanceIQ'

interface PremiumLockProps {
  feature: string
  description?: string
  /** Se true, exibe apenas o upgrade para Premium. Se false, exibe ambos os planos. */
  premiumOnly?: boolean
  onClose?: () => void
}

export default function PremiumLock({ feature, description, premiumOnly = true, onClose }: PremiumLockProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', background: 'var(--surface)', borderRadius: 16,
      border: '2px dashed rgba(108,99,255,0.3)', textAlign: 'center', minHeight: 320,
      position: 'relative'
    }}>
      {onClose && (
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12,
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
        }}>
          <X size={18} />
        </button>
      )}

      <div style={{
        width: 68, height: 68, borderRadius: '50%',
        background: 'rgba(168,85,247,0.12)', border: '2px solid rgba(168,85,247,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
      }}>
        <Crown size={30} style={{ color: '#a855f7' }} />
      </div>

      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>
        {feature}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28, maxWidth: 340, lineHeight: 1.6 }}>
        {description || 'Esta funcionalidade está disponível no Plano Premium.'}
      </div>

      {!premiumOnly ? (
        /* Mostra ambos os planos */
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 560 }}>
          {/* Básico */}
          <div style={{ flex: 1, minWidth: 200, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Star size={18} style={{ color: '#3b82f6' }} />
              <span style={{ fontWeight: 700, color: '#3b82f6' }}>Básico</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>R$ 9,90<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>/mês</span></div>
            {['Dashboard', 'Lançamentos', 'Orçamentos', 'Relatórios'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginTop: 6, color: 'var(--text-muted)' }}>
                <Check size={12} style={{ color: '#3b82f6' }} />{f}
              </div>
            ))}
            <a href={MP_LINKS.basico_mensal} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', marginTop: 14, padding: '9px', borderRadius: 8,
              background: 'rgba(59,130,246,0.2)', color: '#3b82f6',
              fontWeight: 700, fontSize: 13, textDecoration: 'none', textAlign: 'center'
            }}>Assinar Básico</a>
          </div>

          {/* Premium */}
          <div style={{ flex: 1, minWidth: 200, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.35)', borderRadius: 14, padding: 20, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 10, right: 10, background: '#a855f7', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>RECOMENDADO</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Crown size={18} style={{ color: '#a855f7' }} />
              <span style={{ fontWeight: 700, color: '#a855f7' }}>Premium</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>R$ 19,90<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>/mês</span></div>
            {['Tudo do Básico', 'Metas Financeiras 🎯', 'Exportação Excel/PDF', 'Categorias personalizadas'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginTop: 6, color: 'var(--text-muted)' }}>
                <Check size={12} style={{ color: '#a855f7' }} />{f}
              </div>
            ))}
            <a href={MP_LINKS.premium_mensal} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', marginTop: 14, padding: '9px', borderRadius: 8,
              background: 'linear-gradient(135deg, #6C63FF, #a855f7)', color: '#fff',
              fontWeight: 700, fontSize: 13, textDecoration: 'none', textAlign: 'center',
              boxShadow: '0 4px 12px rgba(168,85,247,0.35)'
            }}>✨ Assinar Premium</a>
          </div>
        </div>
      ) : (
        /* Só Premium */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300 }}>
          <a href={MP_LINKS.premium_mensal} target="_blank" rel="noopener noreferrer" style={{
            display: 'block', padding: '13px 28px', borderRadius: 11,
            background: 'linear-gradient(135deg, #6C63FF, #a855f7)',
            color: '#fff', fontSize: 15, fontWeight: 700,
            textDecoration: 'none', boxShadow: '0 4px 15px rgba(108,99,255,0.4)'
          }}>
            ✨ Upgrade para Premium — R$ 19,90/mês
          </a>
          <a href={MP_LINKS.premium_anual} target="_blank" rel="noopener noreferrer" style={{
            display: 'block', padding: '10px 20px', borderRadius: 10,
            background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)',
            color: '#a855f7', fontSize: 13, fontWeight: 600, textDecoration: 'none'
          }}>
            Plano Anual — R$ 199,99 (2 meses grátis) 🏷️
          </a>
        </div>
      )}

      <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20,
        color: '#22c55e', fontSize: 12, textDecoration: 'none'
      }}>
        <MessageCircle size={14} /> Tem dúvidas? Fale conosco no WhatsApp
      </a>
    </div>
  )
}
