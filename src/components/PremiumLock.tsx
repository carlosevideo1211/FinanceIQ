import { Lock } from 'lucide-react';

interface PremiumLockProps {
  feature: string;
  description?: string;
}

export default function PremiumLock({ feature, description }: PremiumLockProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', background: 'var(--surface)', borderRadius: 16,
      border: '2px dashed rgba(108,99,255,0.4)', textAlign: 'center', minHeight: 300
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(108,99,255,0.15)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16
      }}>
        <Lock size={28} style={{ color: '#6C63FF' }} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
        {feature}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, maxWidth: 320 }}>
        {description || 'Esta funcionalidade está disponível no Plano Premium.'}
      </div>
      <div style={{
        background: 'linear-gradient(135deg, #6C63FF, #a855f7)',
        color: '#fff', padding: '12px 28px', borderRadius: 10,
        fontWeight: 700, fontSize: 15, cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(108,99,255,0.4)'
      }}
        onClick={() => window.open('https://finance-iq-fawn.vercel.app', '_blank')}
      >
        ✨ Fazer Upgrade para Premium
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
        Plano Premium a partir de R$ 19,90/mês
      </div>
    </div>
  );
}
