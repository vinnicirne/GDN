
import React from 'react';
import type { AppConfig } from '../types';

interface HeaderProps {
  credits: number;
  onOpenPro: () => void;
  onOpenDocs: () => void;
  onOpenProfile: () => void;
  appConfig: AppConfig;
}

const Header: React.FC<HeaderProps> = ({ credits, onOpenPro, onOpenDocs, onOpenProfile, appConfig }) => {
  return (
    <header className="w-full border-b border-green-900/30 bg-black/80 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_15px_rgba(0,255,0,0.05)]">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3 md:gap-8">
        
        {/* Lado Esquerdo: Título e Descrição / Logo */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          {appConfig.logoUrl ? (
              <img 
                src={appConfig.logoUrl} 
                alt={appConfig.appName} 
                className="h-8 md:h-10 object-contain"
              />
          ) : null}
          
          <div className="flex flex-col justify-center">
            <h1 className={`text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 truncate pr-2 tracking-tight ${appConfig.logoUrl ? 'hidden md:block' : ''}`}>
              {appConfig.appName || 'Gerador de Notícias'}
            </h1>
            {!appConfig.logoUrl && (
                <p className="text-gray-500 text-xs md:text-sm mt-0.5 hidden md:block truncate font-mono">
                    Inteligência Artificial & Análise Preditiva
                </p>
            )}
          </div>
        </div>

        {/* Lado Direito: Ações (Docs, Créditos, Pro, Perfil) */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0">
          
          {/* Botão Docs */}
          <button 
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 text-gray-400 hover:text-green-400 text-sm font-medium transition-colors px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg hover:bg-green-900/20 border border-transparent hover:border-green-900/50"
            title="Documentação do Sistema"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="hidden sm:inline">Docs</span>
          </button>

          {/* Separador Vertical */}
          <div className="h-5 w-px bg-gray-800 hidden sm:block"></div>

          {/* Contador de Créditos */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Créditos</span>
            <span className={`font-mono font-bold text-sm leading-none ${credits === 0 ? 'text-red-500' : 'text-green-400'}`}>
              {credits}/3
            </span>
          </div>
          
          {/* Ícone de Perfil / Conta */}
          <button
            onClick={onOpenProfile}
            className="p-2 rounded-full text-gray-400 hover:text-green-400 hover:bg-green-900/20 transition-colors"
            title="Minha Conta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Botão PRO */}
          <button 
            onClick={onOpenPro}
            className="bg-green-600 hover:bg-green-500 text-black text-xs sm:text-sm font-bold py-2 px-3 sm:px-4 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)] transition-all transform hover:scale-105 whitespace-nowrap border border-green-400"
          >
            👑 <span className="hidden sm:inline">Seja </span>PRO
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
