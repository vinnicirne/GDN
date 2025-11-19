
import React from 'react';
import type { PlanConfig, AppConfig } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (planId: string) => void;
  plans: PlanConfig[];
  appConfig: AppConfig;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, plans, appConfig }) => {
  if (!isOpen) return null;

  const activePlans = plans.filter(p => p.active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-black rounded-2xl border border-green-500/30 shadow-[0_0_50px_rgba(0,255,0,0.1)] w-full max-w-2xl overflow-hidden relative my-4 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-green-400 transition z-20 bg-black/50 rounded-full p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 text-center relative z-10 overflow-y-auto">
          <h2 className="text-lg font-bold text-white mb-1">Marketplace de Recursos</h2>
          <p className="text-gray-400 mb-3 font-mono text-[10px]">Escolha a melhor estratégia para escalar sua produção.</p>

          <div className="grid md:grid-cols-2 gap-3 mb-3">
            {activePlans.map((plan) => {
                const isFree = plan.price === 0;
                const isConsult = plan.price < 0;
                const isRecommended = plan.recommended;

                const priceDisplay = isConsult
                    ? 'Sob Consulta'
                    : isFree
                        ? 'R$ 0,00'
                        : `R$ ${plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

                return (
                    <div 
                        key={plan.id}
                        className={`rounded-xl p-4 border flex flex-col relative transition-all ${
                            isRecommended 
                                ? 'bg-gradient-to-b from-green-900/20 to-black border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
                                : 'bg-gray-900/30 border-gray-800 hover:opacity-100 opacity-75'
                        }`}
                    >
                        {isRecommended && (
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-600 text-black text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                Recomendado
                            </div>
                        )}

                        <h3 className={`text-sm font-bold ${isRecommended ? 'text-white' : 'text-gray-300'}`}>{plan.name}</h3>
                        
                        <div className={`text-lg font-bold my-1.5 ${isRecommended ? 'text-green-400' : 'text-white'}`}>
                            {priceDisplay}
                            {!isConsult && <span className="text-[9px] font-normal text-gray-500">/{plan.recurrence === 'Mensal' ? 'mês' : 'ano'}</span>}
                        </div>

                        <ul className="text-left space-y-1 mb-3 flex-1 text-[10px] font-mono leading-tight">
                            <li className="flex items-center gap-2 text-gray-300">
                                <span className={isRecommended ? 'text-green-400' : 'text-green-500'}>★</span> 
                                <strong>
                                    {plan.id === 'p_enterprise' 
                                        ? 'A partir de 500 Gerações' 
                                        : plan.credits >= 999 ? 'Gerações Ilimitadas' : `${plan.credits} Gerações`
                                    }
                                </strong>
                            </li>
                            {plan.features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-400">
                                    <span className="text-green-700 mt-0.5">✓</span> <span className="flex-1">{feat}</span>
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={isFree ? undefined : () => {
                                if (isConsult) {
                                    // Redirect to custom WhatsApp
                                     const waNumber = appConfig.whatsappNumber.replace(/\D/g, '');
                                     window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(`Olá, tenho interesse no plano Enterprise do ${appConfig.appName || 'Gerador de Notícias'}.`)}`, '_blank');
                                } else {
                                    onUpgrade(plan.id);
                                }
                            }}
                            disabled={isFree}
                            className={`w-full py-2 rounded-lg font-bold transition uppercase tracking-wide text-[10px] ${
                                isFree 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                                    : isConsult
                                        ? 'bg-gray-800 text-white border border-gray-600 hover:bg-gray-700 hover:border-green-500'
                                        : 'bg-green-600 hover:bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                            }`}
                        >
                            {isConsult ? 'Fale Conosco' : isFree ? 'Plano Atual' : 'Assinar Agora'}
                        </button>
                    </div>
                );
            })}
          </div>

          {/* Single Credit Purchase Section */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-2 text-[9px] text-gray-500 uppercase tracking-wider font-bold">Micro-Produtos</span>
            </div>
          </div>

          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 hover:border-gray-600 transition mt-1 group">
             <div className="text-left">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                   ⚡ Crédito Avulso <span className="text-[9px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-800 uppercase">Express</span>
                </h3>
                <p className="text-[9px] text-gray-500 mt-1 font-mono">
                    Grounding Incluso • Tons Padrão • Sem Suporte
                </p>
             </div>
             <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="text-right hidden sm:block">
                   <div className="text-sm font-bold text-white">R$ 5,00</div>
                   <div className="text-[9px] text-gray-500">Pagamento Único</div>
                </div>
                <button 
                   onClick={() => onUpgrade('single')}
                   className="flex-1 sm:flex-none whitespace-nowrap bg-white text-black font-bold py-1.5 px-4 rounded-lg hover:bg-gray-200 transition shadow-[0_0_10px_rgba(255,255,255,0.1)] text-[10px] uppercase tracking-wide"
                >
                   Comprar
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;