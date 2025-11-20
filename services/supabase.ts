import { createClient } from '@supabase/supabase-js'

// VITE: Usar import.meta.env diretamente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validação para build
if (!supabaseUrl || !supabaseKey) {
  console.warn('Variáveis de ambiente do Supabase não encontradas')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true // ← IMPORTANTE para Vite
    }
  }
)

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co'
}