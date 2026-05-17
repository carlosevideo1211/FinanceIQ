import { useState } from 'react';
import { X, Copy, Check, MessageCircle } from 'lucide-react';

// ============================================================
// CONFIGURAÇÃO PIX — Altere a chave abaixo
// ============================================================
const PIX_KEY        = 'carlosevideo28@gmail.com'; // Sua chave PIX
const PIX_NAME       = 'Carlos Eduardo';            // Seu nome
const WHATSAPP_NUM   = '5592993100884';

interface PixModalProps {
  planName: string;   // Ex: "Básico Mensal"
  amount: number;     // Ex: 9.90
  period: string;     // Ex: "mês" ou "ano"
  onClose: () => void;
}

export default function PixModal({ planName, amount, period, onClose }: PixModalProps) {
  const [copied, setCopied] = useState(false);

  const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleCopy = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const waMsg = encodeURIComponent(
    `Olá! Acabei de fazer o pagamento PIX do plano *${planName}* (${fmtBRL(amount)}/${period}) no FinanceIQ.\n` +
    `Por favor, ative meu plano! 🙏\n\nEmail da minha conta: `
  );
  const waLink = `https://wa.me/${WHATSAPP_NUM}?text=${waMsg}`;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0d1117, #161b22)',
        border: '1px solid rgba(34,197,94,0.3)',
        borderRadius: 20, padding: 32, width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        position: 'relative'
      }}>
        {/* Fechar */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          background: 'rgba(255,255,255,0.08)', border: 'none',
          borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center'
        }}>
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>💸</div>
          <h2 style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 800 }}>Pagar via PIX</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '6px 0 0' }}>
            Ative seu plano com um PIX simples e rápido
          </p>
        </div>

        {/* Plano + Valor */}
        <div style={{
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 20, textAlign: 'center'
        }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {planName}
          </div>
          <div style={{ color: '#22c55e', fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginTop: 4 }}>
            {fmtBRL(amount)}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>por {period}</div>
        </div>

        {/* Chave PIX */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            CHAVE PIX
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '10px 14px'
          }}>
            <div style={{ flex: 1, color: '#fff', fontSize: 14, fontWeight: 600, wordBreak: 'break-all' }}>
              {PIX_KEY}
            </div>
            <button onClick={handleCopy} style={{
              background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(108,99,255,0.2)',
              border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(108,99,255,0.3)'}`,
              borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
              color: copied ? '#22c55e' : '#6C63FF', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 700, flexShrink: 0, transition: 'all 0.2s'
            }}>
              {copied ? <><Check size={13} /> Copiado!</> : <><Copy size={13} /> Copiar</>}
            </button>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 6 }}>
            Favorecido: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{PIX_NAME}</strong>
          </div>
        </div>

        {/* Instruções */}
        <div style={{
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 10, padding: '12px 14px', marginBottom: 20
        }}>
          <div style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>📋 INSTRUÇÕES</div>
          <ol style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
            <li>Copie a chave PIX acima</li>
            <li>Faça o pagamento de <strong style={{ color: '#fff' }}>{fmtBRL(amount)}</strong> no seu banco</li>
            <li>Na descrição do PIX, escreva: <strong style={{ color: '#f59e0b' }}>{planName}</strong></li>
            <li>Clique no botão abaixo para confirmar via WhatsApp</li>
            <li>Seu plano será ativado em até <strong style={{ color: '#fff' }}>2 horas</strong> ⚡</li>
          </ol>
        </div>

        {/* Botão WhatsApp */}
        <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 20px rgba(37,211,102,0.3)'
          }}>
            <MessageCircle size={18} />
            Confirmar pagamento via WhatsApp
          </button>
        </a>

        <div style={{ textAlign: 'center', marginTop: 12, color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
          Após confirmar, o plano será ativado manualmente pelo administrador
        </div>
      </div>
    </div>
  );
}
