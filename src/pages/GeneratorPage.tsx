import React, { useState } from 'react';
import Header from '../components/Header';
import NewsGeneratorForm from '../components/NewsGeneratorForm';
import UpgradeModal from '../components/UpgradeModal';
import CheckoutModal from '../components/CheckoutModal';
import { useAuth } from '../contexts/AuthContext';
import { generateNewsContent } from '../services/geminiService'; 
import { userService } from '../services/userService';
import type { GeneratedNews, PlanConfig } from '../types';
import { NEWS_THEMES, NEWS_TONES } from '../constants';

const GeneratorPage: React.FC = () => {
  const { user, updateCredits } = useAuth();

  const [theme, setTheme] = useState<string>(NEWS_THEMES[0]);
  const [topic, setTopic] = useState<string>('');
  const [tone, setTone] = useState<string>(NEWS_TONES[0]);
  const [generatedNews, setGeneratedNews] = useState<GeneratedNews | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanConfig | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (user.credits <= 0) {
        setShowUpgradeModal(true);
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedNews(null);

    try {
      const newsContent = await generateNewsContent(theme, topic, tone);
      const newBalance = await userService.debitCredits(user.id, user.credits);
      await userService.saveHistory(user.id, `${theme} - ${topic}`, newsContent);
      
      updateCredits(newBalance);
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

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-300">
      <Header 
        credits={user?.credits || 0} 
        onOpenPro={() => setShowUpgradeModal(true)}
        onOpenDocs={() => {}}
        onOpenProfile={() => {}}
        appConfig={{ appName: 'Gerador AI', logoUrl: '', supportEmail: '', whatsappNumber: '', contactMessage: '' }} 
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
        <div className="bg-gray-900/20 backdrop-blur-sm border border-green-900/30 rounded-2xl p-6 md:p-8 shadow-2xl">
          <NewsGeneratorForm
            theme={theme}
            setTheme={setTheme}
            topic={topic}
            setTopic={setTopic}
            tone={tone}
            setTone={setTone}
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
            <div className="bg-white text-black p-8 rounded-xl shadow-2xl">
              <h1 className="text-3xl font-bold mb-6">{generatedNews.title}</h1>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: generatedNews.body }} />
              </div>
            </div>
            
            {generatedNews.seo && (
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-green-400">Dados SEO</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Palavra-chave:</strong> {generatedNews.seo.focusKeyword}</p>
                    <p><strong>Slug:</strong> {generatedNews.seo.slug}</p>
                  </div>
                  <div>
                    <p><strong>Meta Description:</strong> {generatedNews.seo.metaDescription}</p>
                    <p><strong>Tags:</strong> {generatedNews.seo.tags?.join(', ')}</p>
                  </div>
                </div>
              </div>
            )}

            {generatedNews.imagePrompt && (
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold mb-2 text-green-400">Prompt para Imagem</h3>
                <p className="text-gray-300">{generatedNews.imagePrompt}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={(planId) => {
          const selectedPlan = {} as PlanConfig; // Substitua pela lógica real de seleção de planos
          setCheckoutPlan(selectedPlan);
          setShowUpgradeModal(false);
          setShowCheckoutModal(true);
        }}
        plans={[]}
        appConfig={{ appName: 'Gerador AI' } as any}
      />
      
      <CheckoutModal 
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        plan={checkoutPlan}
        appConfig={{ appName: 'Gerador AI' } as any}
      />
    </div>
  );
};

export default GeneratorPage;