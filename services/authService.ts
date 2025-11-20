// services/authService.ts - VERSÃO COMPLETA CORRIGIDA
import { supabase } from './supabase';
import type { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) throw error;
    if (!data.user) throw new Error("Usuário não encontrado.");

    // Buscar ou criar perfil do usuário
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
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
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

  async register(email: string, password: string, name: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name: name
        }
      }
    });
    
    if (error) throw error;
    if (!data.user) throw new Error("Falha ao criar usuário.");

    // Criar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('usuarios')
      .insert([{
        id: data.user.id,
        name: name,
        email: data.user.email,
        role: 'user',
        plan: 'Gratuito',
        creditos_saldo: 3,
        status: 'active'
      }])
      .select()
      .single();

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

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) return null;

    return {
      id: user.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as 'user' | 'admin',
      plan: profile.plan,
      credits: profile.creditos_saldo,
      status: profile.status,
      created_at: profile.created_at
    };
  },

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  }
};