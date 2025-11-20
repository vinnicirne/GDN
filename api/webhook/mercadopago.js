// api/webhook/mercadopago.js
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Webhook MercadoPago funcionando!',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;
      console.log('📥 Webhook recebido:', data);

      // Aqui você processaria o webhook
      // Por enquanto, apenas confirmamos recebimento
      
      return res.status(200).json({ 
        received: true,
        message: 'Webhook processado com sucesso'
      });

    } catch (error) {
      console.error('❌ Erro no webhook:', error);
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}