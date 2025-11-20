import { createClient } from '@supabase/supabase-js';

/**
 * Busca variável de ambiente compatível com Vite e Node (SSR).
 * Ex: getEnvVar('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL')
 */
const getEnvVar = (key: string, viteKey: string): string => {
  // Para ambientes Node (SSR ou teste)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  // Para ambientes Vite/Front-end
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[viteKey] || (import.meta as any).env[key];
  }
  return '';
};

// Buscando ENV - Ajuste conforme suas variáveis
const SUPABASE_URL = getEnvVar('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('REACT_APP_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

// Aviso se faltando configuração
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar o banco e autenticação.');
}

// Função de checagem usada em outros módulos
export const isSupabaseConfigured = () => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
};

// Inicializa o client (com fallback explícito para evitar crash)
const url = SUPABASE_URL || 'https://supabase-not-configured.invalid';
const key = SUPABASE_ANON_KEY || 'supabase-placeholder-key';

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  }
});