import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeneratedNews } from '../types';

// 1. Configuração da API Key
const getApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
  }
  return '';
};

const apiKey = getApiKey();

// 2. Inicialização Segura
// Se não tiver chave, não quebra a página imediatamente, mas falhará ao tentar gerar.
const genAI = new GoogleGenerativeAI(apiKey || 'SEM_CHAVE');

export const generateNewsContent = async (theme: string, topic: string, tone: string): Promise<GeneratedNews> => {
  if (!apiKey) {
    throw new Error("Chave de API não configurada. Verifique o arquivo .env");
  }

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // 3. Definição do Modelo (Usando o flash por ser rápido e barato)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    Responda ESTRITAMENTE com este JSON (sem crases ou markdown extra):
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
    // 4. Geração do Conteúdo
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // 5. Limpeza e Parse do JSON
    // Removemos blocos de código markdown que a IA possa colocar (```json ... ```)
    let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Garante que pegamos apenas o objeto JSON (caso haja texto antes ou depois)
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    const parsedContent: GeneratedNews = JSON.parse(cleanText);

    return {
      ...parsedContent,
      sources: [] // O modelo 1.5 Flash padrão não retorna fontes da web da mesma forma
    };
    
  } catch (error) {
    console.error("Erro na IA:", error);
    throw new Error("Falha ao gerar notícia. Tente novamente ou verifique seus créditos de API.");
  }
};