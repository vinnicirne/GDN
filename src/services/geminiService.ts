import { GoogleGenAI } from "@google/genai";
import type { GeneratedNews } from '../types';

// Obtém a chave API de forma segura
const getApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
  }
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generateNewsContent = async (theme: string, topic: string, tone: string): Promise<GeneratedNews> => {
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `
    Aja como um jornalista sénior e especialista em SEO.
    CONTEXTO: Hoje é ${today}.
    TEMA: ${theme}
    TÓPICO: ${topic}
    TOM: ${tone}

    Crie uma notícia viral com:
    1. Título H1 otimizado.
    2. Conteúdo em Markdown (mínimo 400 palavras).
    3. Uma "Focus Keyword" definida e usada no 1º parágrafo.
    4. Meta Description.
    5. Um prompt para gerar imagem de capa.

    Responda APENAS com este JSON:
    {
      "title": "Título H1",
      "body": "Conteúdo Markdown...",
      "imagePrompt": "Prompt da imagem em inglês...",
      "seo": {
        "focusKeyword": "palavra-chave",
        "seoTitle": "Título SEO",
        "slug": "slug-da-noticia",
        "metaDescription": "Descrição...",
        "tags": ["tag1", "tag2"]
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: prompt }] }], // Formato corrigido para nova SDK
    });

    const responseText = response.response.text(); // Ajuste para extrair texto corretamente
    
    // Limpeza do JSON (remove crases se existirem)
    let cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    const parsedContent: GeneratedNews = JSON.parse(cleanText);

    // Adiciona fontes vazias se a IA não retornar (para evitar erro de tipo)
    return {
      ...parsedContent,
      sources: [] 
    };
    
  } catch (error) {
    console.error("Erro na IA:", error);
    throw new Error("Falha ao gerar notícia com a IA.");
  }
};