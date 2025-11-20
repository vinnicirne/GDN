
import React from 'react';
import { NEWS_THEMES, NEWS_TONES } from '../constants';

interface NewsGeneratorFormProps {
  theme: string;
  setTheme: (theme: string) => void;
  topic: string;
  setTopic: (topic: string) => void;
  tone: string;
  setTone: (tone: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  credits: number;
  onOpenPro: () => void;
}

const NewsGeneratorForm: React.FC<NewsGeneratorFormProps> = ({
  theme,
  setTheme,
  topic,
  setTopic,
  tone,
  setTone,
  onSubmit,
  isLoading,
  credits,
  onOpenPro,
}) => {
  const isLimitReached = credits === 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={onSubmit} className={`space-y-4 ${isLimitReached ? 'opacity-50 pointer-events-none filter blur-[1px] select-none' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-400 mb-1">
                Tema da Notícia
              </label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                disabled={isLimitReached}
                className="w-full bg-black border border-green-900/60 text-gray-200 rounded-md p-2.5 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50 outline-none"
              >
                {NEWS_THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-400 mb-1">
                Tom de Voz
              </label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={isLimitReached}
                className="w-full bg-black border border-green-900/60 text-green-100 rounded-md p-2.5 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50 outline-none"
              >
                {NEWS_TONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-400 mb-1">
            Tópico Específico (Opcional)
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLimitReached}
            placeholder="Ex: Lançamento do novo iPhone, final da Champions League..."
            className="w-full bg-black border border-green-900/60 text-gray-200 rounded-md p-2.5 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50 outline-none placeholder-gray-700"
          />
        </div>
      </form>

      {isLimitReached ? (
        <div className="bg-black border border-red-900/50 rounded-xl p-6 text-center shadow-[0_0_20px_rgba(220,38,38,0.1)] relative overflow-hidden animate-fade-in">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-800"></div>
           
           <div className="mb-4">
             <span className="text-4xl">🛑</span>
           </div>
           
           <h3 className="text-xl font-bold text-white mb-2">Limite Diário Atingido</h3>
           <p className="text-gray-400 mb-6 max-w-md mx-auto">
             Você utilizou todos os seus 3 créditos gratuitos de hoje. Não pare agora! Desbloqueie o potencial ilimitado da IA.
           </p>
           
           <button
             type="button"
             onClick={onOpenPro}
             className="w-full md:w-auto bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all transform hover:scale-105 flex items-center justify-center gap-2 mx-auto border border-green-500"
           >
             👑 Seja PRO e Continue Gerando
           </button>
        </div>
      ) : (
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full bg-green-600 text-black font-bold py-3 px-4 rounded-md hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-700 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(22,163,74,0.3)] border border-green-500"
        >
          {isLoading ? 'Processando Dados...' : 'Inicializar Geração'}
        </button>
      )}
    </div>
  );
};

export default NewsGeneratorForm;
