// geminiService.ts - PRODUÇÃO
export const generateNewsArticle = async (theme: string, topic: string, tone: string): Promise<GeneratedNews> => {
  
  // 1. Verificação de Segurança e Créditos - ESTRUTURA PRODUÇÃO
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
      throw new Error("Usuário não autenticado. Faça login para continuar.");
  }

  // Verificar saldo na tabela de produção
  const { data: userProfile, error: profileError } = await supabase
      .from('usuarios')
      .select('creditos_saldo')
      .eq('id', user.id)
      .single();

  if (profileError || !userProfile) {
      throw new Error("Erro ao verificar saldo da conta.");
  }

  if (userProfile.creditos_saldo <= 0) {
      throw new Error("Saldo insuficiente. Por favor, recarregue seus créditos.");
  }

  const startTime = performance.now();
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // ... (restante do prompt permanece igual)

  try {
    // 2. Chamada Gemini AI (permanece igual)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      }
    });

    const responseText = response.text;
    let parsedContent: GeneratedNews;
    
    // ... (processamento da resposta permanece igual)

    // 3. Transação de Débito e Histórico - ESTRUTURA PRODUÇÃO
    
    // Reduz saldo na tabela de produção
    const newBalance = userProfile.creditos_saldo - 1;
    const { error: updateError } = await supabase
        .from('usuarios')
        .update({ creditos_saldo: newBalance })
        .eq('id', user.id);

    if (updateError) console.error("Erro ao debitar crédito", updateError);

    // Salva histórico na tabela de produção
    const { error: historyError } = await supabase
        .from('historico_prompts')
        .insert([{
            user_id: user.id,
            topico_input: `${theme} - ${topic} (${tone})`,
            titulo_output: parsedContent.title,
            conteudo_completo: parsedContent.body,
            creditors_consumidos: 1,
            plano_usado: 'Gratuito',
            tokens_consumidos: responseText.length,
            status: 'sucesso',
            timestamp: new Date().toISOString()
        }]);

    if (historyError) console.error("Erro ao salvar histórico", historyError);

    return finalNews;
    
  } catch (error) {
    console.error("Erro no processo de geração:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Falha desconhecida ao gerar notícia.");
  }
};