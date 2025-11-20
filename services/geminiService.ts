import { GoogleGenAI } from "@google/genai";

// ...configurações de API Key...

export const generateNewsContent = async (prompt: string) => {
  // Apenas gera o conteúdo e retorna
  const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { tools: [{googleSearch: {}}] }
  });
  // ... lógicas de parse do JSON ...
  return parsedContent; // Retorna o JSON limpo
};