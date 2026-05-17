// =============================================================
// FinanceIQ — Webhook Mercado Pago
// Supabase Edge Function
//
// Esta função recebe notificações do Mercado Pago quando um
// pagamento é aprovado e atualiza automaticamente o plano
// do usuário no banco de dados.
//
// CONFIGURAÇÃO NO SUPABASE:
//   supabase secrets set MP_ACCESS_TOKEN="APP_USR-..."
//   supabase secrets set MP_WEBHOOK_SECRET="sua_chave_secreta"
//
// CONFIGURAÇÃO NO MERCADO PAGO:
//   Dashboard → Notificações → URL: https://[projeto].supabase.co/functions/v1/mp-webhook
//   Eventos: subscription_preapproval, subscription_authorized_payment
// =============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
}

// Mapeamento: ID do plano no MP → nome do plano no banco
// Substitua pelos IDs reais dos seus planos no Mercado Pago
const PLAN_MAP: Record<string, string> = {
  '48449155571c42728315c16c85caaff6': 'basico',
  '8ff79ea138144064b8dfb1fafbe6bfdf': 'basico_anual',
  'fbaa64d569bb4ac88a6ba8b222ea60e7': 'premium',
  'c7a81e826c3c47cb886c24028edc40e4': 'premium_anual',
}

serve(async (req) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!MP_ACCESS_TOKEN) {
      console.error('MP_ACCESS_TOKEN não configurado')
      return new Response('Config error', { status: 500 })
    }

    const body = await req.json()
    console.log('Webhook recebido:', JSON.stringify(body))

    // O Mercado Pago envia o tipo e o ID do recurso
    const { type, data } = body

    // Processar apenas eventos de assinatura
    if (type !== 'subscription_preapproval' && type !== 'subscription_authorized_payment') {
      console.log('Tipo de evento ignorado:', type)
      return new Response(JSON.stringify({ ok: true, message: 'Evento ignorado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const resourceId = data?.id
    if (!resourceId) {
      return new Response('ID do recurso não encontrado', { status: 400 })
    }

    // Buscar detalhes da assinatura na API do Mercado Pago
    let mpEndpoint = ''
    if (type === 'subscription_preapproval') {
      mpEndpoint = `https://api.mercadopago.com/preapproval/${resourceId}`
    } else {
      // Para pagamento autorizado, buscar a assinatura pelo authorized_payment
      const paymentRes = await fetch(
        `https://api.mercadopago.com/authorized_payments/${resourceId}`,
        { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } }
      )
      const payment = await paymentRes.json()
      mpEndpoint = `https://api.mercadopago.com/preapproval/${payment.preapproval_id}`
    }

    const mpRes = await fetch(mpEndpoint, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
    })
    const subscription = await mpRes.json()
    console.log('Assinatura MP:', JSON.stringify(subscription))

    const { status, preapproval_plan_id, external_reference, payer_email } = subscription

    // external_reference deve conter o user_id do Supabase
    // Configure isso ao criar o link de checkout no frontend
    const userId = external_reference

    if (!userId && !payer_email) {
      console.error('Sem identificador do usuário (external_reference ou payer_email)')
      return new Response('Usuário não identificado', { status: 400 })
    }

    // Determinar o plano baseado no ID do plano MP
    const newPlan = PLAN_MAP[preapproval_plan_id]
    if (!newPlan) {
      console.error('Plano não mapeado:', preapproval_plan_id)
      return new Response('Plano não reconhecido', { status: 400 })
    }

    // Criar cliente Supabase com service role (tem permissão de admin)
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    let targetUserId = userId

    // Se não tiver external_reference, buscar usuário pelo email do pagador
    if (!targetUserId && payer_email) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', payer_email)
        .single()

      if (profileData) {
        targetUserId = profileData.id
      }
    }

    if (!targetUserId) {
      console.error('Usuário não encontrado no banco')
      return new Response('Usuário não encontrado', { status: 404 })
    }

    // Atualizar plano baseado no status da assinatura
    let planToSet = newPlan
    if (status === 'cancelled' || status === 'paused') {
      planToSet = 'cancelado'
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        plan: planToSet,
        // Se reativando, resetar trial_end para não bloquear
        ...(planToSet !== 'cancelado' ? { trial_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() } : {})
      })
      .eq('id', targetUserId)

    if (error) {
      console.error('Erro ao atualizar plano:', error)
      return new Response('Erro ao atualizar banco', { status: 500 })
    }

    console.log(`✅ Plano atualizado: user ${targetUserId} → ${planToSet}`)

    return new Response(
      JSON.stringify({ ok: true, userId: targetUserId, plan: planToSet }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Erro no webhook:', err)
    return new Response('Erro interno', { status: 500 })
  }
})
