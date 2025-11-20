
import React, { useState } from 'react';
import { authService } from '../services/authService.ts';
import type { User } from '../types.ts';

interface RegisterProps {
  onRegisterSuccess: (user: User) => void;
  onGoToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onGoToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
    }

    if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    setIsLoading(true);

    try {
      const user = await authService.register(name, email, password);
      onRegisterSuccess(user);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Falha ao criar conta.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background Effects */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-green-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-gray-900/30 backdrop-blur-md border border-gray-700 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10 animate-fade-in">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Crie sua Conta
          </h1>
          <p className="text-gray-400 text-sm mt-2">Comece a gerar notícias com IA gratuitamente.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
              <div className="bg-red-900/20 border border-red-900/50 text-red-400 text-xs p-3 rounded text-center">
                  {error}
              </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-green-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-green-500 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Senha</label>
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-green-500 outline-none transition-all"
                required
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Confirmar</label>
                <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-green-500 outline-none transition-all"
                required
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3.5 rounded-lg shadow-lg transition-all transform active:scale-95 mt-4"
          >
            {isLoading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center pt-6 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            Já tem uma conta?{' '}
            <button 
                onClick={onGoToLogin}
                className="text-white hover:text-green-400 font-bold transition hover:underline"
            >
              Fazer Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
