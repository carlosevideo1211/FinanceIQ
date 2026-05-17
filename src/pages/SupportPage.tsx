import { MessageCircle, Mail, HelpCircle, Clock } from 'lucide-react'

// ============================================================
// CONFIGURAÇÃO — Altere o número do WhatsApp abaixo
// ============================================================
const WHATSAPP_NUMBER = '5592993100884'
const SUPPORT_EMAIL   = 'carlosevideo28@gmail.com'

const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20o%20FinanceIQ`

const FAQ = [
  {
    q: 'Como assinar um plano pago?',
    a: 'Vá até "Planos" no menu lateral e escolha o plano desejado. O pagamento é feito de forma segura pelo Mercado Pago.'
  },
  {
    q: 'Como cancelar minha assinatura?',
    a: 'O cancelamento é feito diretamente pelo app do Mercado Pago ou pelo site mercadopago.com.br → Assinaturas. Sem burocracia.'
  },
  {
    q: 'Meus dados ficam seguros?',
    a: 'Sim. Seus dados são armazenados com criptografia na nuvem via Supabase. Nenhuma informação sensível é compartilhada.'
  },
  {
    q: 'Posso usar em mais de um dispositivo?',
    a: 'Sim! Como tudo fica na nuvem, você acessa do celular, tablet e computador com a mesma conta.'
  },
  {
    q: 'Esqueci minha senha. O que faço?',
    a: 'Na tela de login, clique em "Esqueci minha senha". Você vai receber um link de recuperação por email.'
  },
  {
    q: 'O que é o período de trial?',
    a: 'São 14 dias gratuitos para você testar todas as features sem precisar inserir cartão. Após o período, escolha um plano ou perca o acesso.'
  },
]

export default function SupportPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <div className="page-header">
        <div>
          <h2>Suporte</h2>
          <p>Estamos aqui para ajudar!</p>
        </div>
      </div>

      {/* Cards de contato */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>

        {/* WhatsApp — canal principal */}
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 28, borderRadius: 16, textDecoration: 'none',
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
          transition: 'transform 0.2s', cursor: 'pointer'
        }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(34,197,94,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: 14
          }}>
            <MessageCircle size={26} style={{ color: '#22c55e' }} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#22c55e', marginBottom: 6 }}>WhatsApp</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', lineHeight: 1.5 }}>
            Canal principal de suporte.<br />Resposta rápida!
          </div>
          <div style={{
            marginTop: 14, padding: '8px 20px', borderRadius: 8,
            background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 700, fontSize: 13
          }}>
            Abrir WhatsApp →
          </div>
        </a>

        {/* Email */}
        <a href={`mailto:${SUPPORT_EMAIL}`} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 28, borderRadius: 16, textDecoration: 'none',
          background: 'var(--surface)', border: '1px solid var(--border)',
          transition: 'transform 0.2s', cursor: 'pointer'
        }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(108,99,255,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: 14
          }}>
            <Mail size={26} style={{ color: '#6C63FF' }} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#6C63FF', marginBottom: 6 }}>Email</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', lineHeight: 1.5 }}>
            {SUPPORT_EMAIL}<br />Respondemos em até 24h
          </div>
          <div style={{
            marginTop: 14, padding: '8px 20px', borderRadius: 8,
            background: 'rgba(108,99,255,0.12)', color: '#6C63FF', fontWeight: 700, fontSize: 13
          }}>
            Enviar email →
          </div>
        </a>
      </div>

      {/* Horário de atendimento */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32,
        padding: '14px 18px', borderRadius: 12,
        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)'
      }}>
        <Clock size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          <strong style={{ color: '#f59e0b' }}>Horário de atendimento:</strong> Segunda a sexta, das 9h às 18h.
          Nos fins de semana respondemos até as mensagens urgentes pelo WhatsApp.
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <HelpCircle size={20} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 700, fontSize: 18 }}>Perguntas Frequentes</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQ.map((item, i) => (
            <details key={i} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, overflow: 'hidden'
            }}>
              <summary style={{
                padding: '16px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                userSelect: 'none'
              }}>
                {item.q}
                <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>+</span>
              </summary>
              <div style={{
                padding: '0 20px 16px', color: 'var(--text-muted)',
                fontSize: 14, lineHeight: 1.7
              }}>
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
