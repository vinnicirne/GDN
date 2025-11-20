
import { GoogleGenAI } from "@google/genai";
import { supabase } from './supabase';
import type { GeneratedNews } from '../types';

// Função auxiliar para obter a API Key
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
  
  // 1. Verificação de Segurança e Créditos
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
      throw new Error("Usuário não autenticado. Faça login para continuar.");
  }

  // Verificar saldo no banco de dados
  const { data: userProfile, error: profileError } = await supabase
      .from('usuarios')
      .select('creditos_saldo')
      .eq('id', user.id)
      .single();

  if (profileError || !userProfile) {
      throw new Error("Erro ao verificar saldo da conta.");
  }

  if (userProfile.creditos_saldo <= 0) {
      // Simula erro HTTP 402 Payment Required
      throw new Error("Saldo insuficiente. Por favor, recarregue seus créditos.");
  }

  const startTime = performance.now();
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `
    Aja como um jornalista sênior e especialista em SEO (Rank Math/Yoast).
    
    CONTEXTO TEMPORAL: Hoje é ${today}. Considere esta data para termos como "ontem", "hoje" ou "semana passada".
    TOM DE VOZ EXIGIDO: ${tone}. Adapte o vocabulário e a estrutura das frases para este estilo.

    Sua missão é escrever um artigo viral e tecnicamente perfeito para SEO.
    
    --- 1. DEFINIÇÃO DA ESTRATÉGIA (Mentalmente) ---
    Antes de escrever, defina uma "Palavra-chave de Foco" (Focus Keyword).
    Exemplo: Se o tema é "Vitória do Flamengo", a palavra-chave pode ser "Flamengo vence".
    
    --- 2. REGRAS OBRIGATÓRIAS DE SEO (CRÍTICO - NÃO IGNORE) ---
    Para obter pontuação máxima no Rank Math, você DEVE seguir estas regras estritas:
    
    A. A "Palavra-chave de Foco" DEVE aparecer EXATAMENTE (ipsis litteris) nos seguintes lugares:
       1. No Título H1.
       2. No Slug (URL amigável).
       3. Na Meta Description.
       4. **CRUCIAL**: Na PRIMEIRA FRASE do primeiro parágrafo do texto. O texto deve começar já abordando a palavra-chave.
       5. Em pelo menos um subtítulo (H2).
       
    B. Densidade: A palavra-chave deve aparecer naturalmente ao longo do texto (aprox 1-2%).

    --- 3. CONTEÚDO ---
    Analise o input:
    Tema: ${theme}
    ${topic ? `Tópico Específico: ${topic}` : ''}
    
    - Se for notícia recente: Reporte fatos, dados e citações.
    - Se for futuro/tendência: Faça uma análise preditiva.
    - Use Markdown: **Negrito**, ## H2, - Listas, 1. Listas numeradas.
    - Mínimo de 450 palavras.

    --- 4. TÍTULO E META ---
    - SEO Title: Clickbait saudável (ou agressivo, dependendo do Tom).
    - Slug: Curto, minúsculas e hífens.
    - Meta Description: Resumo instigante de até 160 caracteres contendo a palavra-chave.

    --- 5. VISUAL ---
    Crie um "imagePrompt" em inglês detalhado para gerar uma capa realista e cinematográfica.

    --- FORMATO DE RESPOSTA (JSON APENAS) ---
    Responda APENAS com este JSON válido:
    {
      "title": "H1 da Notícia",
      "body": "Conteúdo em Markdown...",
      "imagePrompt": "Detailed prompt in English...",
      "seo": {
        "focusKeyword": "A palavra-chave exata",
        "seoTitle": "Título SEO",
        "slug": "slug-com-a-palavra-chave",
        "metaDescription": "Descrição...",
        "tags": ["tag1", "tag2"]
      }
    }
  `;

  try {
    // 2. Chamada Gemini AI
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      }
    });

    const responseText = response.text;
    let parsedContent: GeneratedNews;
    
    try {
        let cleanText = responseText
            .replace(/^```json\s*/, "")
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "")
            .trim();
        
        // Tenta encontrar JSON dentro do texto se houver lixo ao redor
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }

        parsedContent = JSON.parse(cleanText);
    } catch (e) {
        console.error("Falha no parse JSON:", responseText);
        throw new Error("Erro ao processar resposta da IA. Tente novamente.");
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter(Boolean) 
      .map((webChunk: any) => ({
          uri: webChunk.uri,
          title: webChunk.title,
      }))
      .filter((source: any, index: number, self: any[]) => 
          index === self.findIndex((s) => s.uri === source.uri)
      );

    const finalNews = {
      ...parsedContent,
      sources,
    };

    // 3. Transação de Débito e Histórico (Atomic Operation)
    // Reduz saldo
    const newBalance = userProfile.creditos_saldo - 1;
    const { error: updateError } = await supabase
        .from('usuarios')
        .update({ creditos_saldo: newBalance })
        .eq('id', user.id);

    if (updateError) console.error("Erro ao debitar crédito", updateError);

    // Salva histórico no Supabase
    const { error: historyError } = await supabase
        .from('historico_prompts')
        .insert([{
            user_id: user.id,
            prompt_text: `${theme} - ${topic} (${tone})`,
            response_json: finalNews,
            timestamp: new Date().toISOString()
        }]);

    if (historyError) console.error("Erro ao salvar histórico", historyError);

    return finalNews;
    
  } catch (error) {
    console.error("Erro no processo de geração:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Falha desconhecida ao gerar notícia.");
  }
};
