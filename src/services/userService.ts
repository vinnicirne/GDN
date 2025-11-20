import { supabase, isSupabaseConfigured } from './supabase';
import type { GeneratedNews } from '../types';

export const userService = {
  // Debita créditos do usuário
  async debitCredits(userId: string, currentCredits: number): Promise<number> {
    if (!isSupabaseConfigured()) throw new Error("Supabase não configurado.");
    
    const newCredits = currentCredits - 1;
    
    const { error } = await supabase
      .from('usuarios')
      .update({ creditos_saldo: newCredits })
      .eq('id', userId);
      
    if (error) throw error;
    return newCredits;
  },

  // Salva no histórico de gerações
  async saveHistory(userId: string, title: string, newsContent: GeneratedNews): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error("Supabase não configurado.");
    
    const { error } = await supabase
      .from('historico_geracoes')
      .insert([{
        user_id: userId,
        titulo: title,
        conteudo: newsContent,
        data_geracao: new Date().toISOString()
      }]);
      
    if (error) throw error;
  },

  // Busca perfil do usuário
  async getUserProfile(userId: string) {
    if (!isSupabaseConfigured()) throw new Error("Supabase não configurado.");
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  },

  // Atualiza créditos do usuário
  async updateUserCredits(userId: string, newCredits: number) {
    if (!isSupabaseConfigured()) throw new Error("Supabase não configurado.");
    
    const { error } = await supabase
      .from('usuarios')
      .update({ creditos_saldo: newCredits })
      .eq('id', userId);
      
    if (error) throw error;
  },

  // Busca créditos do usuário
  async getUserCredits(userId: string): Promise<number> {
    if (!isSupabaseConfigured()) throw new Error("Supabase não configurado.");
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('creditos_saldo')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data?.creditos_saldo ?? 0;
  }
};