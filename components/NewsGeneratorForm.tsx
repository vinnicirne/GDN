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
  onLoginRequired: () => void;
  isLoggedIn: boolean;
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
  onLoginRequired,
  isLoggedIn,
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
        <div className="bg-black border border-red-900/50 rounded-xl p-8 text-center shadow-[0_0_30px_rgba(220,38,38,0.15)] relative overflow-hidden animate-fade-in">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>
           
           <div className="mb-4 inline-block p-3 bg-red-900/20 rounded-full">
             <span className="text-3xl">🛑</span>
           </div>
           
           <h3 className="text-2xl font-bold text-white mb-3">Créditos Esgotados!</h3>
           <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
             {isLoggedIn 
                ? "Você utilizou todos os seus créditos de hoje. Atualize seu plano para continuar gerando notícias sem interrupções."
                : "Seu saldo de créditos gratuitos acabou. Para gerar mais notícias, faça login ou cadastre-se para adquirir um plano."
             }
           </p>
           
           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
              <button
                 type="button"
                 onClick={onOpenPro}
                 className="w-full sm:w-auto font-bold py-3.5 px-8 rounded-lg transition-all transform hover:scale-105 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-900/20 border border-green-500/50 uppercase tracking-wide text-xs"
               >
                 Comprar Créditos Agora
               </button>

              {!isLoggedIn && (
                 <button
                   type="button"
                   onClick={onLoginRequired}
                   className="w-full sm:w-auto font-bold py-3.5 px-8 rounded-lg transition-all hover:bg-gray-900 text-gray-300 border border-gray-700 hover:border-gray-500 hover:text-white uppercase tracking-wide text-xs"
                 >
                   Já Sou Cliente (Login)
                 </button>
              )}
           </div>
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