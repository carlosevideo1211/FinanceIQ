// =============================================================
// Script para criar os 4 planos de assinatura no Mercado Pago
// Execute: node criar-planos-mp.js
// Resultado: vai imprimir os 4 IDs que você precisa
// =============================================================

const ACCESS_TOKEN = 'APP_USR-4b3ec4f1-6317-424b-a6ee-d9094c2c5556';

const plans = [
  {
    nome: 'BÁSICO MENSAL',
    body: {
      reason: 'FinanceIQ Básico Mensal',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 9.90,
        currency_id: 'BRL',
      },
      back_url: 'https://finance-iq-fawn.vercel.app',
    }
  },
  {
    nome: 'BÁSICO ANUAL',
    body: {
      reason: 'FinanceIQ Básico Anual',
      auto_recurring: {
        frequency: 12,
        frequency_type: 'months',
        transaction_amount: 99.99,
        currency_id: 'BRL',
      },
      back_url: 'https://finance-iq-fawn.vercel.app',
    }
  },
  {
    nome: 'PREMIUM MENSAL',
    body: {
      reason: 'FinanceIQ Premium Mensal',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 19.90,
        currency_id: 'BRL',
      },
      back_url: 'https://finance-iq-fawn.vercel.app',
    }
  },
  {
    nome: 'PREMIUM ANUAL',
    body: {
      reason: 'FinanceIQ Premium Anual',
      auto_recurring: {
        frequency: 12,
        frequency_type: 'months',
        transaction_amount: 199.99,
        currency_id: 'BRL',
      },
      back_url: 'https://finance-iq-fawn.vercel.app',
    }
  }
];

async function createPlan(plan) {
  const res = await fetch('https://api.mercadopago.com/preapproval_plan', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(plan.body),
  });
  const data = await res.json();
  return { nome: plan.nome, id: data.id, status: data.status, error: data.message };
}

async function main() {
  console.log('\n🚀 Criando planos no Mercado Pago...\n');
  const results = [];
  for (const plan of plans) {
    const result = await createPlan(plan);
    results.push(result);
    if (result.id) {
      console.log(`✅ ${result.nome}: ${result.id}`);
    } else {
      console.log(`❌ ${result.nome}: ERRO — ${result.error}`);
    }
  }

  console.log('\n=== COPIE ESSES IDs PARA O ANTIGRAVITY ===\n');
  results.forEach(r => {
    if (r.id) console.log(`${r.nome}: ${r.id}`);
  });
  console.log('\n==========================================\n');
}

main().catch(console.error);
