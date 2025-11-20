
import React, { useState } from 'react';
import type { GeneratedNews, User } from '../types';

interface UserDashboardProps {
  user: User;
  credits: number;
  history: GeneratedNews[];
  onBack: () => void;
  onOpenPro: () => void;
  onOpenAdmin: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, credits, history, onBack, onOpenPro, onOpenAdmin }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Credits Card */}
      <div className="bg-gradient-to-r from-gray-900 to-black border border-green-900/50 rounded-xl p-6 relative overflow-hidden shadow-[0_0_15px_rgba(0,255,0,0.05)]">
        <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-green-900/10 to-transparent"></div>
        <h3 className="text-green-500 text-xs uppercase font-bold mb-2 tracking-widest">Recursos Disponíveis</h3>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-bold text-white">{credits}</span>
          <span className="text-xl text-gray-500 mb-1 font-mono">/ 3 diários</span>
        </div>
        <div className="w-full bg-gray-900 h-2 rounded-full mt-4 overflow-hidden border border-gray-800">
          <div 
            className={`h-full ${credits > 0 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-red-900'}`} 
            style={{ width: `${(credits / 3) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2 font-mono">Reset do sistema em: 12h 30m</p>
        
        <button onClick={onOpenPro} className="mt-6 w-full py-2 bg-green-900/20 hover:bg-green-900/40 text-green-400 border border-green-900 rounded-lg font-bold text-sm transition uppercase tracking-wide">
          Adquirir Tokens
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-black border border-green-900/30 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">Log de Atividade</h3>
        {history.length === 0 ? (
          <p className="text-gray-600 text-sm font-mono">Nenhum dado processado ainda.</p>
        ) : (
          <ul className="space-y-3">
            {history.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex justify-between items-center border-b border-gray-900 pb-2 last:border-0">
                <div className="truncate pr-4">
                  <p className="text-gray-300 text-sm font-medium truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-600 font-mono uppercase">{item.seo.focusKeyword}</p>
                </div>
                <span className="text-[10px] bg-green-900/20 text-green-500 px-2 py-1 rounded border border-green-900/30">OK</span>
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => setActiveTab('history')} className="mt-4 text-green-500 text-xs hover:text-green-400 hover:underline font-mono uppercase">
          Ver histórico completo &rarr;
        </button>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="animate-fade-in">
       <h3 className="text-xl font-bold text-white mb-4">Histórico de Gerações</h3>
       <div className="bg-black border border-green-900/30 rounded-xl overflow-hidden">
         <table className="w-full text-left">
           <thead className="bg-green-900/10 text-green-500 text-xs uppercase font-bold tracking-wider">
             <tr>
               <th className="p-4 border-b border-green-900/30">Título</th>
               <th className="p-4 border-b border-green-900/30 hidden sm:table-cell">Palavra-Chave</th>
               <th className="p-4 border-b border-green-900/30 text-right">Ação</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-900">
            {history.map((item, idx) => (
              <tr key={idx} className="hover:bg-green-900/5 transition">
                <td className="p-4">
                  <div className="font-medium text-gray-300 truncate max-w-[200px] sm:max-w-md">{item.title}</div>
                  <div className="text-[10px] text-gray-600 sm:hidden uppercase font-mono mt-1">{item.seo.focusKeyword}</div>
                </td>
                <td className="p-4 text-gray-500 text-xs hidden sm:table-cell font-mono">{item.seo.focusKeyword}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => navigator.clipboard.writeText(item.body)}
                    className="text-xs bg-black hover:bg-green-900/20 text-green-500 px-2 py-1 rounded border border-green-900/50 transition"
                  >
                    Copiar
                  </button>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-600 font-mono">Nenhum registro encontrado no banco de dados.</td>
              </tr>
            )}
           </tbody>
         </table>
       </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-fade-in">
       <h3 className="text-xl font-bold text-white mb-4">Configurações da Conta</h3>
       
       <div className="bg-black border border-green-900/30 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-[10px] text-green-500 uppercase mb-1 font-bold tracking-wider">Nome de Usuário</label>
               <input type="text" value={user.name} className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-gray-400 font-mono text-sm" readOnly />
             </div>
             <div>
               <label className="block text-[10px] text-green-500 uppercase mb-1 font-bold tracking-wider">Email</label>
               <input type="email" value={user.email} className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-gray-400 font-mono text-sm" readOnly />
             </div>
          </div>
       </div>

       <div className="bg-black border border-green-900/30 rounded-xl p-6">
         <h4 className="text-white font-bold mb-2">Assinatura</h4>
         <div className="flex justify-between items-center">
           <div>
             <p className="text-gray-400 text-sm">Plano Atual: <span className="text-white font-bold">{user.plan}</span></p>
             <p className="text-gray-600 text-xs font-mono uppercase">Status: {user.status || 'Ativo'}</p>
           </div>
           <button onClick={onOpenPro} className="text-green-400 hover:text-green-300 text-xs font-bold border border-green-500/30 hover:border-green-500 px-4 py-2 rounded transition uppercase tracking-wider">
             Fazer Upgrade
           </button>
         </div>
       </div>
       
       {/* Admin Dashboard Access */}
       {user.role === 'admin' && (
           <div className="mt-12 pt-6 border-t border-gray-900">
             <button onClick={onOpenAdmin} className="text-xs text-red-500 hover:text-red-400 flex items-center gap-2 transition font-mono uppercase border border-red-900/30 px-4 py-2 rounded bg-red-900/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Acessar Painel Super Admin
             </button>
           </div>
       )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 text-gray-200 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-green-900/20 rounded-full transition text-gray-400 hover:text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Painel do Usuário</h1>
          </div>
          <div className="hidden md:block text-xs text-green-900 font-mono bg-green-900/10 px-2 py-1 rounded border border-green-900/30">
            ID: {user.id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition text-sm ${activeTab === 'overview' ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'text-gray-500 hover:bg-gray-900 hover:text-gray-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition text-sm ${activeTab === 'history' ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'text-gray-500 hover:bg-gray-900 hover:text-gray-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Histórico
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition text-sm ${activeTab === 'settings' ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'text-gray-500 hover:bg-gray-900 hover:text-gray-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 018.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.42 24.42 0 010 3.46" />
              </svg>
              Configurações
            </button>
          </nav>

          {/* Content Area */}
          <div className="bg-transparent">
             {activeTab === 'overview' && renderOverview()}
             {activeTab === 'history' && renderHistory()}
             {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
