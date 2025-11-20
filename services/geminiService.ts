
import { GoogleGenAI } from "@google/genai";
import type { GeneratedNews } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Analytics Helper ---
const logAnalytics = (data: { 
  theme: string; 
  tone: string; 
  success: boolean; 
  latencyMs: number; 
  tokens?: number 
}) => {
  try {
    const existing = localStorage.getItem('news_app_analytics');
    const logs = existing ? JSON.parse(existing) : [];
    logs.push({
      ...data,
      timestamp: Date.now(),
    });
    // Keep only last 100 logs to prevent storage overflow in demo
    if (logs.length > 100) logs.shift();
    localStorage.setItem('news_app_analytics', JSON.stringify(logs));
  } catch (e) {
    console.warn("Analytics storage failed", e);
  }
};

export const generateNewsArticle = async (theme: string, topic: string, tone: string): Promise<GeneratedNews> => {
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
        // First attempt: direct parse
        parsedContent = JSON.parse(responseText);
    } catch (e) {
        // Second attempt: clean markdown code blocks
        let cleanText = responseText
            .replace(/^```json\s*/, "")
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "")
            .trim();

        try {
            parsedContent = JSON.parse(cleanText);
        } catch (e2) {
             // Third attempt: Extract JSON object from mixed text
             const firstBrace = cleanText.indexOf('{');
             const lastBrace = cleanText.lastIndexOf('}');
             
             if (firstBrace !== -1 && lastBrace !== -1) {
                try {
                    const extractedJson = cleanText.substring(firstBrace, lastBrace + 1);
                    parsedContent = JSON.parse(extractedJson);
                } catch (finalErr) {
                    console.error("Failed extracting JSON:", responseText);
                    throw new Error("A resposta da IA não retornou um JSON válido. Tente novamente.");
                }
             } else {
                 console.error("Raw response:", responseText);
                 throw new Error("A resposta da IA não retornou um JSON válido. Tente novamente.");
             }
        }
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

    // Log Success
    logAnalytics({
        theme,
        tone,
        success: true,
        latencyMs: performance.now() - startTime
    });

    return {
      ...parsedContent,
      sources,
    };
    
  } catch (error) {
    // Log Error
    logAnalytics({
        theme,
        tone,
        success: false,
        latencyMs: performance.now() - startTime
    });

    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Falha ao gerar notícia: ${error.message}`);
    }
    throw new Error("Falha ao gerar notícia: um erro desconhecido ocorreu.");
  }
};
