import { supabase } from './supabase';

export const userService = {
  // Função para debitar créditos do usuário
  async debitCredits(userId: string, currentBalance: number) {
    if (currentBalance <= 0) throw new Error("Saldo insuficiente.");

    const newBalance = currentBalance - 1;

    // Atualiza no banco
    const { error } = await supabase
        .from('usuarios')
        .update({ creditos_saldo: newBalance })
        .eq('id', userId);
    
    if (error) {
      console.error("Erro ao debitar créditos:", error);
      throw new Error("Erro ao atualizar saldo.");
    }

    return newBalance;
  },

  // Função para salvar o histórico da notícia gerada
  async saveHistory(userId: string, promptText: string, responseJson: any) {
      const { error } = await supabase.from('historico_prompts').insert([{
          user_id: userId,
          prompt_text: promptText,
          response_json: responseJson,
          timestamp: new Date().toISOString()
      }]);

      if (error) {
        console.error("Erro ao salvar histórico:", error);
        // Não lançamos erro aqui para não travar a UI se apenas o histórico falhar
      }
  }
};