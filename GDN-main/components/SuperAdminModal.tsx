
import React, { useState } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const SuperAdminModal: React.FC<SuperAdminModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = await authService.login(email, password);
      
      if (user.role !== 'admin') {
          throw new Error('Acesso Negado: Esta conta não possui privilégios de administrador.');
      }
      
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Falha na autenticação.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-gray-900 border border-red-900/50 rounded-xl shadow-2xl overflow-hidden">
        
        <div className="bg-red-900/10 p-4 border-b border-red-900/30 flex items-center justify-between">
            <h2 className="text-red-500 font-bold uppercase tracking-wider text-sm">
                Painel de Controle
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition">
                ✕
            </button>
        </div>

        <div className="p-8">
            <div className="text-center mb-6">
               <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500 border border-red-500/20">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                 </svg>
               </div>
               <p className="text-gray-400 text-sm">
                   Área restrita para super administradores.
               </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                    <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-3 py-2 text-xs rounded text-center">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-gray-500 text-xs uppercase font-bold mb-1">Email</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-red-500 outline-none transition placeholder-gray-700"
                        placeholder="admin@exemplo.com"
                    />
                </div>

                <div>
                    <label className="block text-gray-500 text-xs uppercase font-bold mb-1">Senha</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-red-500 outline-none transition placeholder-gray-700"
                        placeholder="••••••••"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-red-900/20 mt-2 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transform"
                >
                    {isLoading ? 'Verificando Permissões...' : 'Acessar Sistema'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminModal;
