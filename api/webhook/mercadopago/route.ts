import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/services/supabase';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-signature');
    const type = request.headers.get('x-signature-type') || 'md5';

    if (!signature) {
      return NextResponse.json(
        { error: 'Assinatura não fornecida' },
        { status: 400 }
      );
    }

    const body = await request.text();
    const data = JSON.parse(body);

    console.log('📥 Webhook MercadoPago Recebido:', {
      type: data.type,
      id: data.data?.id,
      action: data.action
    });

    // Verificar o tipo de evento
    if (data.type === 'payment' && data.action === 'payment.updated') {
      await handlePaymentUpdate(data.data);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('❌ Erro no webhook MercadoPago:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function handlePaymentUpdate(paymentData: any) {
  const { id, status, transaction_amount, payer } = paymentData;

  console.log(`🔄 Processando pagamento ${id} - Status: ${status}`);

  try {
    // Buscar transação pelo ID do MercadoPago
    const { data: transaction, error: transactionError } = await supabase
      .from('transacoes')
      .select('*')
      .eq('mp_transaction_id', id)
      .single();

    if (transactionError || !transaction) {
      console.log(`❌ Transação não encontrada para MP ID: ${id}`);
      return;
    }

    // Atualizar status da transação
    const { error: updateError } = await supabase
      .from('transacoes')
      .update({
        status: status,
        payer_email: payer?.email || transaction.payer_email,
        updated_at: new Date().toISOString()
      })
      .eq('mp_transaction_id', id);

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ Transação ${id} atualizada para status: ${status}`);

    // Se o pagamento foi aprovado, adicionar créditos ao usuário
    if (status === 'approved') {
      await addUserCredits(transaction.user_id, transaction.creditos_comprados);
    }

  } catch (error) {
    console.error(`❌ Erro ao processar pagamento ${id}:`, error);
    throw error;
  }
}

async function addUserCredits(userId: string, credits: number) {
  try {
    // Buscar usuário atual
    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('creditos_saldo')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Calcular novo saldo
    const newBalance = (user.creditos_saldo || 0) + credits;

    // Atualizar créditos do usuário
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({
        creditos_saldo: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    console.log(`💰 Créditos adicionados: User ${userId} +${credits} créditos = ${newBalance} total`);

  } catch (error) {
    console.error('❌ Erro ao adicionar créditos:', error);
    throw error;
  }
}

// Método GET para verificação do webhook
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Webhook MercadoPago está funcionando!',
    timestamp: new Date().toISOString()
  }, { status: 200 });
}