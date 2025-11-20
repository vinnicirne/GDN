// services/geminiService.ts - CORREÇÃO
import { GoogleGenerativeAI } from "@google/generative-ai"; // CORREÇÃO: Import correto
import { supabase } from './supabase';
import type { GeneratedNews } from '../types';

// CORREÇÃO: Função para obter API Key do banco
const getApiKey = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'gemini')
      .single();

    if (error || !data) {
      throw new Error('API Key do Gemini não configurada');
    }

    return data.valor.apiKey || '';
  } catch (error) {
    console.error('Erro ao buscar API Key:', error);
    return '';
  }
};

export const generateNewsArticle = async (theme: string, topic: string, tone: string): Promise<GeneratedNews> => {
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Usuário não autenticado. Faça login para continuar.");
  }

  // Verificar créditos
  const { data: userProfile, error: profileError } = await supabase
    .from('usuarios')
    .select('creditos_saldo')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile) {
    throw new Error("Erro ao verificar saldo da conta.");
  }

  if (userProfile.creditos_saldo <= 0) {
    throw new Error("Saldo insuficiente. Por favor, recarregue seus créditos.");
  }

  // CORREÇÃO: Obter API Key do banco
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error("API Key do Gemini não configurada no sistema.");
  }

  // CORREÇÃO: Usar GoogleGenerativeAI correto
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `[SEU PROMPT AQUI]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Processar resposta...
    let parsedContent: GeneratedNews;
    
    try {
      let cleanText = text.trim();
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }
      parsedContent = JSON.parse(cleanText);
    } catch (e) {
      throw new Error("Erro ao processar resposta da IA.");
    }

    // Atualizar créditos
    const newBalance = userProfile.creditos_saldo - 1;
    
    await supabase
      .from('usuarios')
      .update({ creditos_saldo: newBalance })
      .eq('id', user.id);

    // Salvar histórico
    await supabase
      .from('historico_prompts')
      .insert([{
        user_id: user.id,
        prompt_text: `${theme} - ${topic} (${tone})`,
        response_json: parsedContent,
        timestamp: new Date().toISOString()
      }]);

    return parsedContent;
    
  } catch (error) {
    console.error('Erro no Gemini:', error);
    throw new Error("Falha ao gerar notícia. Tente novamente.");
  }
};