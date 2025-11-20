import { supabase, isSupabaseConfigured } from './supabase';
import type { User } from '../types';

// Define a estrutura do serviço para exportação
export const authService = {
  
  async login(email: string, password: string): Promise<User> {
    if (!isSupabaseConfigured()) throw new Error("Supabase não configurado.");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("Usuário não encontrado.");

    // Busca detalhes adicionais na tabela 'usuarios'
    const { data: profile } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      id: data.user.id,
      name: profile?.name ?? data.user.user_metadata?.name ?? 'Usuário',
      email: data.user.email ?? '',
      role: (profile?.role === 'super_admin' || profile?.role === 'admin') ? 'admin' : 'user',
      plan: profile?.plan ?? 'Gratuito',
      credits: profile?.creditos_saldo ?? 0,
      status: profile?.status ?? 'active',
      created_at: data.user.created_at
    };
  },

  async register(name: string, email: string, password: string): Promise<User> {
    if (!isSupabaseConfigured()) throw new Error("Supabase não configurado.");

    // 1. Cria no Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Erro ao criar conta no Auth.");

    // 2. Cria na tabela pública 'usuarios' (Necessário para ler dados depois)
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

    if (dbError) {
        // Se falhar no banco, idealmente deveríamos desfazer o auth, 
        // mas aqui apenas lançamos o erro para o UI.
        console.error("Erro ao criar perfil de usuário:", dbError);
        throw new Error("Conta criada, mas falha ao configurar perfil. Tente login.");
    }

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: profile } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .single();

      return {
        id: session.user.id,
        name: profile?.name ?? session.user.user_metadata?.name ?? 'Usuário',
        email: session.user.email ?? '',
        role: (profile?.role === 'super_admin' || profile?.role === 'admin') ? 'admin' : 'user',
        plan: profile?.plan ?? 'Gratuito',
        credits: profile?.creditos_saldo ?? 0,
        status: profile?.status ?? 'active',
        created_at: session.user.created_at
      };
    } catch (error) {
      console.error("Erro ao recuperar sessão:", error);
      return null;
    }
  }
};