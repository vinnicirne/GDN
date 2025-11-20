// services/authService.ts - CORREÇÃO
import { supabase } from './supabase';
import type { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw error;
    if (!data.user) throw new Error("Usuário não encontrado.");

    // CORREÇÃO: Criar perfil se não existir
    const { data: profile, error: profileError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Criar perfil automaticamente
      const { data: newProfile, error: createError } = await supabase
        .from('usuarios')
        .insert([{
          id: data.user.id,
          name: data.user.user_metadata?.name || 'Usuário',
          email: data.user.email,
          role: 'user',
          plan: 'Gratuito',
          creditos_saldo: 3,
          status: 'active'
        }])
        .select()
        .single();

      if (createError) throw createError;
      
      return {
        id: data.user.id,
        name: newProfile.name,
        email: newProfile.email,
        role: newProfile.role as 'user' | 'admin',
        plan: newProfile.plan,
        credits: newProfile.creditos_saldo,
        status: newProfile.status,
        created_at: newProfile.created_at
      };
    }

    if (profileError) throw profileError;

    return {
      id: data.user.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as 'user' | 'admin',
      plan: profile.plan,
      credits: profile.creditos_saldo,
      status: profile.status,
      created_at: profile.created_at
    };
  },

  // ... resto do código mantido igual
};