// authService.ts - PRODUÇÃO
export const authService = {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw error;
    if (!data.user) throw new Error("Usuário não encontrado.");

    // Fetch profile from produção table
    const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (profileError) {
       console.warn("Perfil não encontrado, usando metadados de auth");
    }

    return {
        id: data.user.id,
        name: profile?.nome || data.user.user_metadata?.name || 'Usuário',
        email: data.user.email || '',
        role: (profile?.role === 'super_admin' || profile?.role === 'admin') ? 'admin' : 'user',
        plan: 'Gratuito', // Podemos ajustar depois com join com planos
        credits: profile?.creditos_saldo ?? 0,
        status: 'active',
        created_at: data.user.created_at
    };
  },

  async register(name: string, email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Erro ao criar conta.");

    // Criar usuário na tabela de produção
    const { error: profileError } = await supabase
        .from('usuarios')
        .insert([{
            id: data.user.id,
            email: email,
            nome: name,
            role: 'user',
            creditos_saldo: 3,
            data_cadastro: new Date().toISOString()
        }]);

    if (profileError) {
        console.error("Erro ao criar perfil:", profileError);
    }

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

  async getCurrentSession(): Promise<User | null> {
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
          name: profile?.nome || session.user.user_metadata?.name || 'Usuário',
          email: session.user.email || '',
          role: (profile?.role === 'super_admin' || profile?.role === 'admin') ? 'admin' : 'user',
          plan: 'Gratuito',
          credits: profile?.creditos_saldo ?? 0,
          status: 'active',
          created_at: session.user.created_at
      };
    } catch (error) {
        return null;
    }
  }
};