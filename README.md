# Gerador de Notícias AI

Uma aplicação web moderna que utiliza Inteligência Artificial (Google Gemini) para gerar notícias, artigos e análises preditivas com foco em SEO.

## 🚀 Deploy no Vercel

Para conectar este repositório ao GitHub e realizar o deploy na Vercel:

1. Faça o push deste código para um repositório no GitHub.
2. Importe o projeto no painel da Vercel.
3. Nas configurações de **Environment Variables** (Variáveis de Ambiente) do projeto na Vercel, adicione:

| Variável | Descrição |
|----------|-----------|
| `API_KEY` | Sua chave de API do Google Gemini. |
| `VITE_SUPABASE_URL` | (Opcional) URL do seu projeto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | (Opcional) Chave pública (Anon) do Supabase. |

> **Nota:** As funcionalidades de backend (`backend/`) servem como referência para implementações server-side e requerem configuração adicional de servidor ou funções serverless se utilizadas.

## 🛠 Stack

- React 18
- TypeScript
- Tailwind CSS
- Google Gemini API
- Supabase (Opcional)
