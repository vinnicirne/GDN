
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
          throw new Error('Acesso negado: Este usuário não possui privilégios administrativos.');
      }
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Falha na autenticação. Verifique suas credenciais.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md border-2 border-red-900 bg-black rounded-none shadow-[0_0_50px_rgba(153,27,27,0.3)] relative overflow-hidden">
        
        {/* Header de Alerta */}
        <div className="bg-red-900/20 p-4 border-b border-red-900 flex items-center gap-3">
            <div className="bg-red-600 text-black font-bold px-2 py-0.5 text-xs uppercase tracking-wider animate-pulse">
                Restricted
            </div>
            <h2 className="text-red-500 font-mono text-sm uppercase tracking-widest font-bold">
                Acesso Administrativo
            </h2>
            <button onClick={onClose} className="ml-auto text-red-800 hover:text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>

        <div className="p-8">
            <div className="mb-6 text-center">
               <div className="w-16 h-16 bg-red-900/10 rounded-full border border-red-900/50 flex items-center justify-center mx-auto mb-3">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                 </svg>
               </div>
               <p className="text-red-400 text-xs font-mono">
                   Insira suas credenciais reais de administrador.
               </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                    <div className="bg-red-950 border border-red-800 text-red-400 px-3 py-2 text-xs font-mono">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-red-700 text-xs uppercase font-bold mb-1">Email</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-black border border-red-900/50 text-red-100 p-2 text-sm font-mono focus:border-red-600 outline-none placeholder-red-900/30"
                        placeholder="Digite seu email"
                    />
                </div>

                <div>
                    <label className="block text-red-700 text-xs uppercase font-bold mb-1">Senha</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-black border border-red-900/50 text-red-100 p-2 text-sm font-mono focus:border-red-600 outline-none placeholder-red-900/30"
                        placeholder="Sua senha"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-red-900 hover:bg-red-800 text-white font-bold py-3 text-xs uppercase tracking-widest border border-red-700 transition shadow-[0_0_15px_rgba(220,38,38,0.2)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Verificando Permissões...' : 'Acessar Painel'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminModal;
