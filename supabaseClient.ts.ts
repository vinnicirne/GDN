import { createClient } from '@supabase/supabase-js';

// Função para obter variáveis do ambiente Vite (FRONTEND)
const getFrontendEnvVar = (key: string): string => {
    // Vite expõe as variáveis prefixadas com VITE_ no import.meta.env
    return (import.meta as any).env[key] || '';
};

const supabaseUrl = getFrontendEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getFrontendEnvVar('VITE_SUPABASE_ANON_KEY');

// Verifica se as chaves necessárias para o FRONTEND existem.
export const isSupabaseConfigured = (): boolean => {
    return !!supabaseUrl && !!supabaseAnonKey;
};

// Se não configurado, usamos valores inválidos para evitar que a aplicação quebre,
// mas a função isSupabaseConfigured() garante que a lógica não será executada.
const finalUrl = supabaseUrl || 'https://supabase-not-configured.invalid';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

if (!isSupabaseConfigured()) {
    console.warn("⚠️ Supabase não configurado. Por favor, configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.");
}