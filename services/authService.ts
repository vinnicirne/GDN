// authService.ts - CORRIGIDO
export const authService = {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw error;
    if (!data.user) throw new Error("Usuário não encontrado.");

    // Fetch profile - USANDO NOMES CORRETOS DAS COLUNAS
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
        name: profile?.name || data.user.user_metadata?.name || 'Usuário',
        email: data.user.email || '',
        role: (profile?.role === 'super_admin' || profile?.role === 'admin') ? 'admin' : 'user',
        plan: 'Gratuito',
        credits: profile?.creditors_saldo ?? 0, // CORRIGIDO: creditors_saldo
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

    // Criar usuário na tabela - USANDO NOMES CORRETOS
    const { error: profileError } = await supabase
        .from('usuarios')
        .insert([{
            id: data.user.id,
            email: email,
            name: name, // CORRIGIDO: name em vez de nome
            role: 'user',
            creditors_saldo: 3, // CORRIGIDO: creditors_saldo
            status: 'active',
            plano_id: 1, // Adicionar plano_id se necessário
            data_cadastro: new Date().toISOString()
        }]);

    if (profileError) {
        console.error("Erro ao criar perfil:", profileError);
        throw new Error("Erro ao criar perfil do usuário.");
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
  }
};