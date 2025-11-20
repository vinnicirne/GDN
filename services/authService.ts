// authService.ts - CORRIGIDO
import { supabase } from './supabase';

// ✅ Exportar como funções nomeadas ou objeto correto
export const getCurrentSession = async (): Promise<User | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return null;

    const { data: profile } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    return {
      id: session.user.id,
      name: profile?.name || session.user.user_metadata?.name || 'Usuário',
      email: session.user.email || '',
      role: (profile?.role === 'super_admin' || profile?.role === 'admin') ? 'admin' : 'user',
      plan: 'Gratuito',
      credits: profile?.creditors_saldo ?? 0,
      status: 'active',
      created_at: session.user.created_at
    };
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) throw error;
  if (!data.user) throw new Error("Usuário não encontrado.");

  const { data: profile } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    id: data.user.id,
    name: profile?.name || data.user.user_metadata?.name || 'Usuário',
    email: data.user.email || '',
    role: (profile?.role === 'super_admin' || profile?.role === 'admin') ? 'admin' : 'user',
    plan: 'Gratuito',
    credits: profile?.creditors_saldo ?? 0,
    status: 'active',
    created_at: data.user.created_at
  };
};

// Exportar como objeto se preferir
export const authService = {
  login,
  getCurrentSession,
  // ... outras funções
};