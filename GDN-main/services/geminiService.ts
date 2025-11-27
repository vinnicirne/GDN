import { GoogleGenAI } from "@google/genai";
import { supabase } from './supabase';
import type { GeneratedNews } from '../types';

const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env.VITE_API_KEY || (import.meta as any).env.API_KEY;
  }
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generateNewsArticle = async (theme: string, topic: string, tone: string): Promise<GeneratedNews> => {
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
      throw new Error("Usuário não autenticado. Faça login para continuar.");
  }

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

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `[PROMPT COMPLETO DO GEMINI AQUI]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      }
    });

    const responseText = response.text;
    let parsedContent: GeneratedNews;
    
    try {
        let cleanText = responseText.trim();
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }
        parsedContent = JSON.parse(cleanText);
    } catch (e) {
        throw new Error("Erro ao processar resposta da IA.");
    }

    // CORREÇÃO AQUI: créditos_saldo (não creditors.saldo)
    const newBalance = userProfile.creditos_saldo - 1;
    
    await supabase
        .from('usuarios')
        .update({ creditos_saldo: newBalance })
        .eq('id', user.id);

    // Salva histórico
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
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Falha ao gerar notícia.");
  }
};