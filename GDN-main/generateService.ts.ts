import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js'; 
import type { GeneratedNews } from '../types'; 

// --- Configuração de Chaves (Apenas Backend/Servidor) ---
// Estas variáveis são lidas do ambiente do servidor Vercel (SEM PREFIXO VITE_)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''; 

// Cliente de Servidor (SERVICE_ROLE) para Débito de Crédito e Leitura Segura
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


export const generateNewsArticle = async (userId: string, theme: string, topic: string, tone: string): Promise<GeneratedNews> => {
  
  if (!SUPABASE_SERVICE_KEY || !GEMINI_API_KEY) {
      throw new Error("Erro de Servidor: Chaves de API (Gemini/Supabase) ausentes no ambiente Vercel.");
  }
  
  // 1. VERIFICAÇÃO DE SALDO (Segurança da Transação)
  const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('usuarios')
      .select('creditos_saldo')
      .eq('id', userId)
      .single();

  if (profileError || !userProfile) {
      throw new Error("Erro ao buscar saldo. Tente logar novamente.");
  }

  // LÓGICA DE PAYWALL: Retorna erro se créditos <= 0
  if (userProfile.creditos_saldo <= 0) {
      // Mensagem que o Frontend deve interpretar como 402/Paywall
      throw new Error("Saldo insuficiente. Por favor, recarregue seus créditos."); 
  }

  const startTime = performance.now();
  // ... (Resto da construção do prompt)

  try {
    // 2. Chamada Gemini AI
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      // ... (Resto da chamada Gemini)
    });
    
    // ... (Lógica de parse JSON e extração de sources)
    const finalNews: GeneratedNews = { /* ... parsed content ... */ } as any; 

    // 3. DÉBITO E HISTÓRICO (Usando o cliente ADMIN)
    const newBalance = userProfile.creditos_saldo - 1;
    
    // Débito
    const { error: updateError } = await supabaseAdmin
        .from('usuarios')
        .update({ creditos_saldo: newBalance })
        .eq('id', userId);

    if (updateError) console.error("Erro ao debitar crédito", updateError);

    // Histórico
    await supabaseAdmin
        .from('historico_prompts')
        .insert([{
            user_id: userId,
            // ... (Campos de histórico)
        }]);
    
    return finalNews;
    
  } catch (error) {
    console.error("Erro no processo de geração:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Falha desconhecida ao gerar notícia.");
  }
};