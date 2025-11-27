import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string, viteKey: string): string => {
  // Para SSR
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  // Para Vite/Front
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[viteKey] || (import.meta as any).env[key];
  }
  return '';
};

// Busca ENV
const SUPABASE_URL = getEnvVar('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('REACT_APP_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

// Aviso
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase não configurado.');
}

// Função de checagem
export const isSupabaseConfigured = () => !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

// Inicializa
export const supabase = createClient(
  SUPABASE_URL || 'https://supabase-not-configured.invalid',
  SUPABASE_ANON_KEY || 'placeholder-key', {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    }
});