async register(name: string, email: string, password: string): Promise<User> {
  if (!isSupabaseConfigured()) throw new Error("Supabase não configurado. Impossível registrar usuários.");

  // Cria usuário no Auth
  const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
  });

  if (error) throw error;
  if (!data.user) throw new Error("Erro ao criar conta.");

  // Cria registro no banco, tabela usuarios
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
      name: name,
      email: email,
      role: 'user',
      plan: 'Gratuito',
      credits: 3,
      status: 'active'
  };
}