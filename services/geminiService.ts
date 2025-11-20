// geminiService.ts - CORRIGIDO
export const generateNewsArticle = async (theme: string, topic: string, tone: string): Promise<GeneratedNews> => {
  
  // 1. Verificação de Segurança e Créditos
  const { data: { user } } = await supabase.auth.getUser(); // ✅ supabase correto
  
  if (!user) {
      throw new Error("Usuário não autenticado. Faça login para continuar.");
  }

  // Verificar saldo - COLUNA CORRETA
  const { data: userProfile, error: profileError } = await supabase
      .from('usuarios')
      .select('creditors_saldo') // ✅ creditors_saldo (do seu SQL)
      .eq('id', user.id)
      .single();

  if (profileError || !userProfile) {
      throw new Error("Erro ao verificar saldo da conta.");
  }

  if (userProfile.creditors_saldo <= 0) {
      throw new Error("Saldo insuficiente. Por favor, recarregue seus créditos.");
  }

  // ... resto do código permanece

  // 3. Transação de Débito - COLUNA CORRETA
  const newBalance = userProfile.creditors_saldo - 1;
  const { error: updateError } = await supabase
      .from('usuarios')
      .update({ creditors_saldo: newBalance }) // ✅ creditors_saldo
      .eq('id', user.id);
};