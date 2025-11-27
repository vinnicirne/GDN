
import type { User } from '../types';

// Simulação de banco de dados local
const MOCK_USERS: User[] = [
  {
    id: 'admin-01',
    name: 'Super Admin',
    email: 'admin@newsai.com',
    role: 'admin',
    plan: 'Enterprise',
    credits: 9999
  },
  {
    id: 'user-01',
    name: 'Usuário Demo',
    email: 'demo@user.com',
    role: 'user',
    plan: 'Gratuito',
    credits: 0 // Simulando sem créditos para teste
  }
];

export const authService = {
  login: async (email: string, password: string, type: 'user' | 'admin'): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulação simples: qualquer senha > 3 chars funciona para fins de demo
        // Em produção, validar hash de senha real via Supabase
        if (password.length < 3) {
            reject(new Error('Senha inválida'));
            return;
        }

        const foundUser = MOCK_USERS.find(u => u.email === email);
        
        if (foundUser) {
            // Verifica se o usuário tentou logar na área certa
            if (type === 'admin' && foundUser.role !== 'admin') {
                reject(new Error('Acesso negado: Este usuário não é administrador.'));
                return;
            }
            resolve(foundUser);
        } else {
            // Se não achou mock, cria um usuário fake na hora para permitir teste
            if (type === 'admin') {
                 reject(new Error('Admin não encontrado. Use admin@newsai.com'));
                 return;
            }
            // Login "fake" para novos emails
            const newUser: User = {
                id: `user-${Date.now()}`,
                name: email.split('@')[0],
                email,
                role: 'user',
                plan: 'Gratuito',
                credits: 3 // Novos usuários ganham 3 créditos
            };
            resolve(newUser);
        }
      }, 1000);
    });
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newUser: User = {
                id: `user-${Date.now()}`,
                name,
                email,
                role: 'user',
                plan: 'Gratuito',
                credits: 3
            };
            resolve(newUser);
        }, 1500);
    });
  },

  logout: async (): Promise<void> => {
      return new Promise(resolve => setTimeout(resolve, 500));
  }
};
