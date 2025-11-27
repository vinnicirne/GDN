import React, { useState } from 'react';
import { authService } from '../services/authService.ts';
import type { User } from '../types.ts';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onGoToRegister: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onGoToRegister, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Authenticate using Supabase
      const user = await authService.login(email, password);
      
      // Check for Admin privileges if in Admin Mode
      if (isAdminMode && user.role !== 'admin') {
          throw new Error('Acesso negado: Credenciais sem privilégios de Super Admin.');
      }

      onLoginSuccess(user);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Falha ao autenticar.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className={`w-full max-w-md backdrop-blur-md border rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10 animate-fade-in transition-all duration-500 ${isAdminMode ? 'bg-gray-900/50 border-red-900/30' : 'bg-gray-900/30 border-green-900/50'}`}>
        
        {/* Back Button */}
        <div className="absolute top-4 left-4">
            <button 
                onClick={onBack}
                className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors flex items-center gap-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Voltar
            </button>
        </div>

        {/* Admin Toggle */}
        <div className="absolute top-4 right-4">
            <button 
                onClick={() => { setIsAdminMode(!isAdminMode); setError(null); }}
                className={`text-[10px] uppercase font-bold px-2 py-1 rounded border transition-colors ${isAdminMode ? 'bg-red-900/20 text-red-400 border-red-900' : 'text-gray-600 border-transparent hover:text-gray-400'}`}
            >
                {isAdminMode ? 'Modo Admin' : 'Admin?'}
            </button>
        </div>

        {/* Header / Branding */}
        <div className="text-center mb-8 mt-4">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border mb-4 shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-colors duration-300 ${isAdminMode ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-green-900/30 border-green-500/30 text-green-400'}`}>
             {isAdminMode ? (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                 </svg>
             ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                 </svg>
             )}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isAdminMode ? 'Superadmin' : 'Gerador de Notícias'} <span className={isAdminMode ? 'text-red-500' : 'text-green-500'}>AI</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {isAdminMode ? 'Acesso restrito ao gerenciamento do sistema.' : 'Acesse sua conta para continuar.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
              <div className="bg-red-900/20 border border-red-900/50 text-red-400 text-xs p-3 rounded text-center">
                  {error}
              </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdminMode ? "admin@newsai.com" : "seu@email.com"}
                className={`w-full bg-black/50 border rounded-lg px-4 py-3 text-gray-200 placeholder-gray-700 outline-none transition-all ${isAdminMode ? 'border-red-900/30 focus:border-red-500 focus:ring-red-500/50' : 'border-green-900/30 focus:border-green-500 focus:ring-green-500/50'}`}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Senha
                </label>
                {!isAdminMode && <a href="#" className="text-xs text-green-500 hover:text-green-400 transition">Esqueceu a senha?</a>}
            </div>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-black/50 border rounded-lg px-4 py-3 text-gray-200 placeholder-gray-700 outline-none transition-all ${isAdminMode ? 'border-red-900/30 focus:border-red-500 focus:ring-red-500/50' : 'border-green-900/30 focus:border-green-500 focus:ring-green-500/50'}`}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-black font-bold py-3.5 rounded-lg shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2 ${isAdminMode ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 shadow-red-900/20' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-900/20'}`}
          >
            {isLoading ? 'Autenticando...' : isAdminMode ? 'Acessar Painel Admin' : 'Entrar na Plataforma'}
          </button>
        </form>

        {!isAdminMode && (
            <div className="mt-6 text-center pt-6 border-t border-green-900/30">
            <p className="text-sm text-gray-500">
                Não tem uma conta?{' '}
                <button 
                    onClick={onGoToRegister}
                    className="text-green-400 hover:text-green-300 font-bold transition hover:underline"
                >
                Criar conta gratuita
                </button>
            </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Login;