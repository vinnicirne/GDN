import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { authService } from '../services/authService';
import type { User } from '../types';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  login: (u: User) => void;
  logout: () => void;
  updateCredits: (newAmount: number) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restaura sessão ao recarregar a página
    authService.getCurrentSession().then((u) => {
      setUser(u);
      setIsLoading(false);
    });

    // Ouve mudanças no Supabase (login/logout em outras abas)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
       if (event === 'SIGNED_OUT') setUser(null);
       else if (event === 'SIGNED_IN' && session?.user) {
           const u = await authService.getCurrentSession();
           setUser(u);
       }
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = (u: User) => setUser(u);
  const logout = async () => {
      await authService.logout();
      setUser(null);
  };
  
  // Função auxiliar para atualizar créditos localmente sem refresh
  const updateCredits = (newAmount: number) => {
      if (user) setUser({ ...user, credits: newAmount });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateCredits }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);