import { supabase } from './supabase';

export const userService = {
  async debitCredits(userId: string, currentBalance: number) {
    const newBalance = currentBalance - 1;
    if (newBalance < 0) throw new Error("Saldo insuficiente");

    const { error } = await supabase
        .from('usuarios')
        .update({ creditos_saldo: newBalance })
        .eq('id', userId);
    
    if (error) throw error;
    return newBalance;
  },

  async saveHistory(userId: string, promptText: string, responseJson: any) {
      const { error } = await supabase.from('historico_prompts').insert([{
          user_id: userId,
          prompt_text: promptText,
          response_json: responseJson,
          timestamp: new Date().toISOString()
      }]);
      if (error) throw error;
  }
};