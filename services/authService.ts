import { supabase, isSupabaseConfigured } from './supabase';
import type { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    if (!isSupabaseConfigured()) throw new Error("Supabase não configurado. Verifique as variáveis de ambiente (VITE_SUPABASE_URL).");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw error;
    if (!data.user) throw new Error("Usuário não encontrado.");

    // Buscar perfil completo, se houver, na tabela usuarios
    const { data: profile, error: profileError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      // Se não encontrou perfil, retorna dados mínimos do Auth
      console.warn("Perfil não encontrado na tabela usuarios, usando dados do Auth.");
    }

    return {
      id: data.user.id,
      name: profile?.name || data.user.user_metadata?.name || 'Usuário',
      email: data.user.email || '',
      role: (profile?.role === 'super_admin' || profile?.role === 'admin') ? 'admin' : 'user',
      plan: profile?.plan || 'Gratuito',
      credits: profile?.creditos_saldo ?? 0,
      status: profile?.status || 'active',
      created_at: data.user.created_at
    };
  },

  async register(name: string, email: string, password: string): Promise<User> {
    if (!isSupabaseConfigured()) throw new Error("Supabase não configurado. Impossível registrar usuários.");

    // Criação do usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Erro ao criar conta.");

    // Criação do registro na tabela usuarios
    const { error: dbError } = await supabase.from('usuarios').insert([{
      id: data.user.id,
      name,
      email,
      role: 'user',
      plan: 'Gratuito',
      creditos_saldo: 3,
      status: 'active',
      created_at: new Date().toISOString()
    }]);

    if (dbError) throw dbError;

    return {
      id: data.user.id,
      name,
      email,
      role: 'user',
      plan: 'Gratuito',
      credits: 3,
      status: 'active',
      created_at: data.user.created_at
    };
  },

  async logout(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
  },

  async getCurrentSession(): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) return null;

      // Buscar dados atualizados na tabela usuarios
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
        plan: profile?.plan || 'Gratuito',
        credits: profile?.creditos_saldo ?? 0,
        status: profile?.status || 'active',
        created_at: session.user.created_at
      };
    } catch (error) {
      return null;
    }
  }
};