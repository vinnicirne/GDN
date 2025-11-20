import { createClient } from '@supabase/supabase-js';

// Função para obter variáveis de ambiente de forma segura
const getEnvVar = (key: string): string => {
  // Verifica se estamos no ambiente Vite (import.meta.env)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || '';
  }
  // Fallback para process.env (caso necessário)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

// Cria a instância do cliente Supabase
// Se as chaves não existirem, usa valores placeholder para não quebrar a compilação,
// mas a função isSupabaseConfigured impedirá o uso real.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);