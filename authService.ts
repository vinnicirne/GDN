import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { User } from '../types'; 

// Mapeia o usuário do Auth para o nosso objeto User customizado (com role e créditos)
const mapUser = (sessionUser: any, profile: any): User => {
    return {
        id: sessionUser.id,
        name: profile?.name || sessionUser.user_metadata?.name || 'Usuário',
        email: sessionUser.email || '',
        // Acesso de Admin: Checa a role na sua tabela 'usuarios'
        role: (profile?.role === 'super_admin' || profile?.role === 'admin') ? 'admin' : 'user',
        plan: profile?.plan || 'Gratuito',
        credits: profile?.creditos_saldo ?? 0, // Usa 0 se for null
        status: profile?.status || 'active',
        created_at: sessionUser.created_at
    };
};

export const authService = {
  
  // --- LOGIN ---
  async login(email: string, password: string): Promise<User> {
    if (!isSupabaseConfigured()) throw new Error("Erro de Configuração. O serviço de autenticação está offline.");

    // 1. Tenta autenticar no Supabase Auth
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
    
    if (error) throw error;
    if (!data.user) throw new Error("Usuário não encontrado.");

    // 2. Busca o perfil na tabela 'usuarios' para obter a role e créditos
    const { data: profile } = await supabase!
        .from('usuarios')
        .select('name, role, creditos_saldo, plan, status')
        .eq('id', data.user.id)
        .single();

    // Se o perfil não for encontrado, o usuário será mapeado com role 'user' e 0 créditos.
    return mapUser(data.user, profile);
  },

  // --- REGISTRO ---
  async register(name: string, email: string, password: string): Promise<User> {
    if (!isSupabaseConfigured()) throw new Error("Erro de Configuração. Impossível registrar usuários.");

    // O trigger do Supabase deve garantir que a entrada na tabela 'usuarios' seja criada com 3 créditos.
    const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: { data: { name } }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Erro ao criar conta.");

    return mapUser(data.user, { name: name, role: 'user', credits_saldo: 3 });
  },
  
  // --- SESSÃO ATUAL ---
  async getCurrentSession(): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;
    
    const { data: { session } } = await supabase!.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase!
        .from('usuarios')
        .select('name, role, creditos_saldo, plan, status')
        .eq('id', session.user.id)
        .single();
          
    return mapUser(session.user, profile);
  },

  // --- LOGOUT ---
  async logout(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    await supabase!.auth.signOut();
  }
};