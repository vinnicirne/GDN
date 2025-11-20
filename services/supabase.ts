
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

// Verifica se as chaves são válidas (não são placeholders)
const url = getEnvVar('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL');
const key = getEnvVar('REACT_APP_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = () => {
    return url && key && url !== 'https://placeholder.supabase.co' && key !== 'placeholder';
};

// Fallback seguro
const supabaseUrl = url || 'https://placeholder.supabase.co';
const supabaseKey = key || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false // Evita erros de redirect em alguns ambientes
    }
});
