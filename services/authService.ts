
import { supabase, isSupabaseConfigured } from './supabase';
import type { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    if (!isSupabaseConfigured()) throw new Error("Supabase não configurado. Verifique as variáveis de ambiente (VITE_SUPABASE_URL).");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw error;
    if (!data.user) throw new Error("Usuário não encontrado.");

    // 1. Tenta buscar o perfil na tabela pública 'usuarios'
    const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

    let finalProfile = profile;

    // 2. AUTO-FIX (SELF-HEALING) no Login
    // Se o perfil não existir, cria agora.
    if (!finalProfile) {
         console.warn("Perfil público não encontrado. Tentando criar registro de emergência...");
         
         const newProfile = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || 'Usuário',
            role: 'user',
            plan: 'Gratuito',
            creditos_saldo: 3,
            status: 'active'
         };
         
         const { data: created, error: insertError } = await supabase
            .from('usuarios')
            .insert([newProfile])
            .select()
            .single();

         if (!insertError && created) {
            finalProfile = created;
         } else {
            console.error("Não foi possível criar o perfil público (Erro DB):", insertError);
            finalProfile = newProfile;
         }
    }

    // Normalização de Roles
    const rawRole = finalProfile?.role || 'user';
    const normalizedRole = (rawRole === 'super_admin' || rawRole === 'admin') ? 'admin' : 'user';

    return {
        id: data.user.id,
        name: finalProfile?.name || 'Usuário',
        email: data.user.email || '',
        role: normalizedRole,
        plan: finalProfile?.plan || 'Gratuito',
        credits: finalProfile?.creditos_saldo ?? 0,
        status: finalProfile?.status || 'active',
        created_at: data.user.created_at
    };
  },

  async register(name: string, email: string, password: string): Promise<User> {
    if (!isSupabaseConfigured()) throw new Error("Supabase não configurado.");

    // 1. Cria autenticação no Supabase Auth
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

    // 2. GARANTIA DE PERFIL PÚBLICO
    // Força a inserção na tabela 'usuarios' mesmo se o Trigger falhar.
    // O 'upsert' com onConflict evita erros se o trigger já tiver funcionado.
    const newProfile = {
        id: data.user.id,
        name: name,
        email: email,
        role: 'user',
        plan: 'Gratuito',
        creditos_saldo: 3, // Créditos iniciais
        status: 'active'
    };

    const { error: profileError } = await supabase
        .from('usuarios')
        .upsert(newProfile, { onConflict: 'id' });

    if (profileError) {
        console.warn("Aviso: Falha ao sincronizar perfil público:", profileError.message);
    }

    return {
        id: data.user.id,
        name: name,
        email: email,
        role: 'user',
        plan: 'Gratuito',
        credits: 3, 
        status: 'active',
        created_at: new Date().toISOString()
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
          .maybeSingle();
        
        const userName = profile?.name || session.user.user_metadata?.name || 'Usuário';
        const rawRole = profile?.role || session.user.user_metadata?.role || 'user';
        const role = (rawRole === 'super_admin' || rawRole === 'admin') ? 'admin' : 'user';

         return {
          id: session.user.id,
          name: userName,
          email: session.user.email || '',
          role,
          plan: profile?.plan || 'Gratuito',
          credits: profile?.creditos_saldo ?? 3,
          status: profile?.status || 'active',
          created_at: session.user.created_at
      };
    } catch (error) {
        return null;
    }
  }
};
