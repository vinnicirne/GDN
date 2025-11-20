import { createClient } from '@supabase/supabase-js';

// Na Vercel (Backend), usamos process.env
// A VITE_SUPABASE_URL geralmente é exposta automaticamente, mas a chave SERVICE_KEY precisa ser adicionada manualmente nas configs da Vercel
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // <--- IMPORTANTE: Precisa ser a chave Service Role (começa com eyJ...)

if (!supabaseUrl || !supabaseKey) {
    throw new Error('ERRO CRÍTICO: Faltam variáveis de ambiente no backend (SUPABASE_URL ou SUPABASE_SERVICE_KEY).');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export default supabase;