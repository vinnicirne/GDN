
import { supabase, isSupabaseConfigured } from './supabase';
import type { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    if (!isSupabaseConfigured()) throw new Error("Supabase não configurado. Verifique as variáveis de ambiente (VITE_SUPABASE_URL).");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw error;
    if (!data.user) throw new Error("Usuário não encontrado.");

    // Tenta buscar o perfil na tabela pública 'usuarios'
    const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single();

    // FALLBACK ROBUSTO:
    // Se o trigger do Supabase falhou ou não rodou, o 'profile' será null.
    // Nesse caso, montamos um objeto de usuário temporário usando os metadados do Auth
    // para que o usuário não fique bloqueado.
    
    const roleFromTable = profile?.role;
    const roleFromMeta = data.user.user_metadata?.role;
    
    const finalRole = (roleFromTable === 'super_admin' || roleFromTable === 'admin' || roleFromMeta === 'super_admin' || roleFromMeta === 'admin') 
        ? 'admin' 
        : 'user';

    const userName = profile?.name || data.user.user_metadata?.name || 'Usuário';
    const userCredits = profile?.creditos_saldo ?? 3; // Default se não houver banco

    return {
        id: data.user.id,
        name: userName,
        email: data.user.email || '',
        role: finalRole,
        plan: profile?.plan || 'Gratuito',
        credits: userCredits,
        status: profile?.status || 'active',
        created_at: data.user.created_at
    };
  },

  async register(name: string, email: string, password: string): Promise<User> {
    if (!isSupabaseConfigured()) throw new Error("Supabase não configurado. Impossível registrar usuários.");

    // Ao registrar, passamos 'name' nos metadados.
    // O Trigger do Supabase (se configurado corretamente) usará isso para preencher public.usuarios.
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
            data: { 
                name, 
                role: 'user' 
            } 
        }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Erro ao criar conta.");

    // Retorna um objeto otimista imediatamente
    return {
        id: data.user.id,
        name: name,
        email: email,
        role: 'user',
        plan: 'Gratuito',
        credits: 3, 
        status: 'active'
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

        const { data: profile } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        const roleFromTable = profile?.role;
        const roleFromMeta = session.user.user_metadata?.role;
        
        const finalRole = (roleFromTable === 'super_admin' || roleFromTable === 'admin' || roleFromMeta === 'super_admin' || roleFromMeta === 'admin') 
            ? 'admin' 
            : 'user';
        
        const userName = profile?.name || session.user.user_metadata?.name || 'Usuário';
        const userCredits = profile?.creditos_saldo ?? 3;
      
         return {
          id: session.user.id,
          name: userName,
          email: session.user.email || '',
          role: finalRole,
          plan: profile?.plan || 'Gratuito',
          credits: userCredits,
          status: profile?.status || 'active',
          created_at: session.user.created_at
      };
    } catch (error) {
        return null;
    }
  }
};
