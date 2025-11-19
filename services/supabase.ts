
import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string, viteKey: string) => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        return (import.meta as any).env[viteKey] || (import.meta as any).env[key];
    }
    return '';
};

// Obtém as variáveis de ambiente
const url = getEnvVar('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL');
const key = getEnvVar('REACT_APP_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

if (!url || !key) {
    console.warn("⚠️ Supabase não configurado. O app rodará em modo limitado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar autenticação e banco de dados.");
}

export const isSupabaseConfigured = () => {
    return !!url && !!key;
};

// Se não houver URL configurada, usamos um valor fictício para satisfazer a validação da lib.
// Usamos .invalid (RFC 2606) para indicar claramente que é um domínio inválido.
const supabaseUrl = url || 'https://supabase-not-configured.invalid';
const supabaseKey = key || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
    }
});
