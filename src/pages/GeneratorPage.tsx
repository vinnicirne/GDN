import React, { useState } from 'react';
import Header from '../components/Header';
import NewsGeneratorForm from '../components/NewsGeneratorForm';
import UpgradeModal from '../components/UpgradeModal';
import CheckoutModal from '../components/CheckoutModal';

// Importamos o hook de autenticação que criamos no passo anterior
import { useAuth } from '../contexts/AuthContext';

// Importamos os serviços separados (IA e Banco de Dados)
import { generateNewsContent } from '../services/geminiService'; 
import { userService } from '../services/userService'; // Suposta nova service de usuário
import type { GeneratedNews, PlanConfig } from '../types';
import { NEWS_THEMES, NEWS_TONES } from '../constants';

const GeneratorPage: React.FC = () => {
  // 1. Pegamos o usuário e a função de atualizar créditos do contexto global
  const { user, updateCredits } = useAuth();

  // 2. Estados locais apenas da página
  const [theme, setTheme] = useState<string>(NEWS_THEMES[0]);
  const [topic, setTopic] = useState<string>('');
  const [tone, setTone] = useState<string>(NEWS_TONES[0]);
  const [generatedNews, setGeneratedNews] = useState<GeneratedNews | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modais locais
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanConfig | null>(null);

  // 3. A Nova Lógica "Orquestrada"
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return; // O Router já deve ter protegido essa rota, mas garantimos aqui

    // Validação de créditos
    if (user.credits <= 0) {
        setShowUpgradeModal(true);
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedNews(null);

    try {
      // A. Chama a IA (apenas gera o texto, não mexe no banco)
      const newsContent = await generateNewsContent(theme, topic, tone);

      // B. Chama o Banco de Dados (debita e salva histórico)
      // Nota: Você precisará criar essa função no userService conforme conversamos
      const newBalance = await userService.debitCredits(user.id, user.credits);
      await userService.saveHistory(user.id, `${theme} - ${topic}`, newsContent);
      
      // C. Atualiza a tela e o contexto global
      updateCredits(newBalance); // Atualiza o numerozinho no Header automaticamente
      setGeneratedNews(newsContent);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Falha desconhecida ao gerar notícia.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Renderização (Cópia do JSX que estava no App.tsx)
  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-300">
      {/* O Header agora pega os créditos direto do contexto dentro dele, ou passamos via user */}
      <Header 
        credits={user?.credits || 0} 
        onOpenPro={() => setShowUpgradeModal(true)}
        onOpenDocs={() => {}} // Redirecionar via router navigate('/docs')
        onOpenProfile={() => {}} // Redirecionar via router navigate('/dashboard')
        appConfig={{ appName: 'Gerador AI', logoUrl: '', supportEmail: '', whatsappNumber: '', contactMessage: '' }} 
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
        <div className="bg-gray-900/20 backdrop-blur-sm border border-green-900/30 rounded-2xl p-6 md:p-8 shadow-2xl">
          <NewsGeneratorForm
            theme={theme} setTheme={setTheme}
            topic={topic} setTopic={setTopic}
            tone={tone} setTone={setTone}
            onSubmit={handleGenerate}
            isLoading={isLoading}
            credits={user?.credits || 0}
            onOpenPro={() => setShowUpgradeModal(true)}
            onLoginRequired={() => {}} 
            isLoggedIn={true}
          />
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-xl text-center">
            ⚠️ {error}
          </div>
        )}

        {generatedNews && (
          <div className="animate-fade-in space-y-6 pb-12">
             {/* ... (Aqui vai todo o bloco de exibição da notícia que estava no App.tsx) ... */}
             <div className="bg-white text-black p-8 rounded-xl shadow-2xl">
                <h1 className="text-3xl font-bold mb-6">{generatedNews.title}</h1>
                <div className="whitespace-pre-wrap">{generatedNews.body}</div>
             </div>
          </div>
        )}
      </main>

      {/* Modais */}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={(planId) => { /* Lógica de seleção de plano */ }}
        plans={[]} // Pegar planos de uma config ou constants
        appConfig={{ appName: 'Gerador AI' } as any}
      />
      
      {/* Adicione o CheckoutModal se necessário */}
    </div>
  );
};

export default GeneratorPage;