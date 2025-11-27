import React, { useState, useEffect } from 'react';
import type { PlanConfig } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanConfig | null;
  onConfirm: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  
  // Form States
  const [email, setEmail] = useState('usuario@exemplo.com');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [docType, setDocType] = useState('CPF');
  const [docNumber, setDocNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setLoading(false);
      setCardNumber('');
      setCardName('');
      setExpiry('');
      setCvc('');
      setDocNumber('');
    }
  }, [isOpen]);

  if (!isOpen || !plan) return null;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep('processing');

    // Simulate Payment Processing Time
    setTimeout(() => {
      setStep('success');
      
      // Auto close after success animation
      setTimeout(() => {
        onConfirm();
      }, 2000);
    }, 3000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#111] rounded-2xl border border-gray-800 shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col">
        
        {/* Header with MP Branding */}
        <div className="bg-[#009EE3] px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.5 16h-5v2h5v-2zm-2.5-4c-2.5 0-4.5 2-4.5 4.5S9.5 21 12 21s4.5-2 4.5-4.5S14.5 12 12 12zm0 7c-1.4 0-2.5-1.1-2.5-2.5S10.6 14 12 14s2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              </svg>
              <span className="text-white font-bold text-lg tracking-tight">Mercado Pago</span>
           </div>
           <button onClick={onClose} className="text-white/80 hover:text-white">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>

        {step === 'form' && (
            <div className="p-6">
                {/* Order Summary */}
                <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
                    <div>
                        <h3 className="text-gray-300 font-medium">Você está pagando por</h3>
                        <p className="text-white font-bold text-lg">{plan.name}</p>
                    </div>
                    <div className="text-right">
                         <span className="text-2xl font-bold text-[#009EE3]">
                             R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                         </span>
                    </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-5">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Seus Dados</h4>
                        <div>
                            <input 
                                type="email" 
                                required
                                placeholder="E-mail"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#009EE3] outline-none transition placeholder-gray-600"
                            />
                        </div>
                        <div className="flex gap-3">
                            <select 
                                value={docType}
                                onChange={e => setDocType(e.target.value)}
                                className="bg-black border border-gray-700 rounded-lg px-3 py-3 text-white focus:border-[#009EE3] outline-none transition w-24"
                            >
                                <option>CPF</option>
                                <option>CNPJ</option>
                            </select>
                            <input 
                                type="text" 
                                required
                                placeholder="Número do documento"
                                value={docNumber}
                                onChange={e => setDocNumber(e.target.value)}
                                className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#009EE3] outline-none transition placeholder-gray-600"
                            />
                        </div>
                    </div>

                    {/* Card Info */}
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center">
                             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cartão de Crédito</h4>
                             <div className="flex gap-2 opacity-60">
                                 <div className="w-8 h-5 bg-gray-700 rounded"></div>
                                 <div className="w-8 h-5 bg-gray-700 rounded"></div>
                                 <div className="w-8 h-5 bg-gray-700 rounded"></div>
                             </div>
                        </div>
                        
                        <div className="relative">
                            <input 
                                type="text" 
                                required
                                placeholder="Número do cartão"
                                maxLength={19}
                                value={cardNumber}
                                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#009EE3] outline-none transition placeholder-gray-600 font-mono"
                            />
                            <svg className="absolute right-4 top-3.5 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>

                        <div>
                            <input 
                                type="text" 
                                required
                                placeholder="Nome impresso no cartão"
                                value={cardName}
                                onChange={e => setCardName(e.target.value.toUpperCase())}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#009EE3] outline-none transition placeholder-gray-600"
                            />
                        </div>

                        <div className="flex gap-4">
                            <input 
                                type="text" 
                                required
                                placeholder="MM/AA"
                                maxLength={5}
                                value={expiry}
                                onChange={e => setExpiry(e.target.value)}
                                className="w-1/2 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#009EE3] outline-none transition placeholder-gray-600 text-center"
                            />
                            <input 
                                type="text" 
                                required
                                placeholder="CVC"
                                maxLength={4}
                                value={cvc}
                                onChange={e => setCvc(e.target.value)}
                                className="w-1/2 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#009EE3] outline-none transition placeholder-gray-600 text-center"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-[#009EE3] hover:bg-[#0081b9] text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 mt-4 flex items-center justify-center gap-2"
                    >
                        Pagar R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </button>
                    
                    <div className="text-center">
                         <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Pagamento processado de forma segura pelo Mercado Pago
                         </p>
                    </div>
                </form>
            </div>
        )}

        {step === 'processing' && (
            <div className="p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 border-4 border-[#009EE3] border-t-transparent rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-white mb-2">Processando Pagamento...</h3>
                <p className="text-gray-500 text-sm">Estamos validando seus dados com a operadora.</p>
            </div>
        )}

        {step === 'success' && (
             <div className="p-12 flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pagamento Aprovado!</h3>
                <p className="text-gray-400">Seus créditos já estão disponíveis na sua conta.</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutModal;
