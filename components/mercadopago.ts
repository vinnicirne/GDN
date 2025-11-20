import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../src/services/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-signature, x-signature-type'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Webhook MercadoPago está funcionando!',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    try {
      const signature = req.headers['x-signature'] as string;
      const type = req.headers['x-signature-type'] as string || 'md5';

      if (!signature) {
        return res.status(400).json({ error: 'Assinatura não fornecida' });
      }

      const data = req.body;

      console.log('📥 Webhook MercadoPago Recebido:', {
        type: data.type,
        id: data.data?.id,
        action: data.action
      });

      // Verificar o tipo de evento
      if (data.type === 'payment' && data.action === 'payment.updated') {
        await handlePaymentUpdate(data.data);
      }

      return res.status(200).json({ received: true });

    } catch (error) {
      console.error('❌ Erro no webhook MercadoPago:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
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