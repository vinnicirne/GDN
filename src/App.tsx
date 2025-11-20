import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NewsGeneratorForm from './components/NewsGeneratorForm';
import UpgradeModal from './components/UpgradeModal';
import CheckoutModal from './components/CheckoutModal';
import Documentation from './components/Documentation';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Register from './components/Register';
import { generateNewsArticle } from './services/geminiService';
import { authService } from './services/authService';
import { supabase, isSupabaseConfigured } from './services/supabase';
import type { GeneratedNews, PlanConfig, AppConfig, User } from './types';
import { NEWS_THEMES, NEWS_TONES } from './constants';

// --- CONSTANTS ---

// No início do App.tsx, depois dos imports
console.log('=== SUPABASE DEBUG ===');
console.log('Supabase object:', supabase);
console.log('Supabase URL:', supabase?.supabaseUrl);
console.log('isConfigured:', isSupabaseConfigured());

const INITIAL_PLANS: PlanConfig[] = [
  { 
    id: 'p_free', 
    name: 'Gratuito', 
    price: 0, 
    credits: 3, 
    recurrence: 'Mensal', 
    features: ['Grounding: Incluso', 'Tons: Padrão (4)', 'Suporte: FAQ'], 
    active: true,
    recommended: false
  },
  { 
    id: 'p_basic', 
    name: 'Básico', 
    price: 99.00, 
    credits: 50, 
    recurrence: 'Mensal', 
    features: ['Grounding: Incluso', 'Tons: Todos', 'Custo/Crédito: R$ 1,98'], 
    active: true,
    recommended: false
  },
  { 
    id: 'p_pro', 
    name: 'Profissional', 
    price: 349.00, 
    credits: 200, 
    recurrence: 'Mensal', 
    features: ['Prioridade', 'Suporte 24h', 'Custo/Crédito: R$ 1,74'], 
    active: true,
    recommended: true
  }
];

const DEFAULT_CONFIG: AppConfig = {
  appName: 'Gerador de Notícias',
  logoUrl: '',
  supportEmail: 'suporte@newsai.com',
  whatsappNumber: '5511999999999',
  contactMessage: 'Olá, preciso de ajuda com a plataforma.'
};

// --- UTILS ---
const LoadingState: React.FC = () => (
    <div className="flex flex-col justify-center items-center p-12 animate-fade-in">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-green-400 font-mono text-sm animate-pulse">Carregando Sistema...</p>
    </div>
);

// --- MAIN COMPONENT ---
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'app' | 'login' | 'register' | 'user-dashboard' | 'admin-dashboard' | 'docs' | 'admin-docs'>('app');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [theme, setTheme] = useState<string>(NEWS_THEMES[0]);
  const [topic, setTopic] = useState<string>('');
  const [tone, setTone] = useState<string>(NEWS_TONES[0]);
  const [generatedNews, setGeneratedNews] = useState<GeneratedNews | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [plans, setPlans] = useState<PlanConfig[]>(INITIAL_PLANS);
  
  const [credits, setCredits] = useState<number>(0);
  const [history, setHistory] = useState<GeneratedNews[]>([]);

  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanConfig | null>(null);

  // --- AUTH INITIALIZATION ---
  useEffect(() => {
      const initAuth = async () => {
          setIsAuthLoading(true);
          try {
              const sessionUser = await authService.getCurrentSession();
              if (sessionUser) {
                  setUser(sessionUser);
                  setCredits(sessionUser.credits);
              }
          } catch (error) {
              console.error("Erro ao restaurar sessão:", error);
          } finally {
              setIsAuthLoading(false);
          }
      };
      initAuth();

      if (isSupabaseConfigured()) {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
              if (event === 'SIGNED_OUT') {
                  setUser(null);
                  setCredits(0);
                  setCurrentView('login');
              } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                   if (session?.user) {
                       const refreshedUser = await authService.getCurrentSession();
                       if (refreshedUser) {
                           setUser(refreshedUser);
                           setCredits(refreshedUser.credits);
                       }
                   }
              }
          });
          return () => subscription.unsubscribe();
      }
  }, []);

  // Load History when user logs in
  useEffect(() => {
      const fetchHistory = async () => {
          if (!user) {
              setHistory([]);
              return;
          }

          // Produção: Buscar sempre do Supabase
          const { data, error } = await supabase
            .from('historico_prompts')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false });
          
          if (data) {
             const formatted: GeneratedNews[] = data.map((item: any) => {
                 const content = item.response_json;
                 return { ...content, created_at: item.timestamp };
             });
             setHistory(formatted);
          }
      };
      fetchHistory();
  }, [user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
        setCurrentView('login');
        return;
    }

    if (credits <= 0) {
        setShowUpgradeModal(true);
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedNews(null);

    try {
      const result = await generateNewsArticle(theme, topic, tone);
      setGeneratedNews(result);
      
      setCredits(prev => Math.max(0, prev - 1));
      setHistory(prev => [result, ...prev]);

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

  const handleLoginSuccess = (u: User) => {
      setUser(u);
      setCredits(u.credits);
      
      if (u.role === 'admin') {
          setCurrentView('admin-dashboard');
      } else {
          setCurrentView('app');
      }
  };

  const handleLogout = async () => {
      await authService.logout();
      setUser(null);
      setCredits(0);
      setCurrentView('login');
  };

  // --- RENDER ---

  if (isAuthLoading) return <LoadingState />;

  if (currentView === 'login') {
      return (
        <Login 
            onLoginSuccess={handleLoginSuccess} 
            onGoToRegister={() => setCurrentView('register')} 
            onBack={() => setCurrentView('app')}
        />
      );
  }

  if (currentView === 'register') {
      return <Register 
          onRegisterSuccess={handleLoginSuccess}
          onGoToLogin={() => setCurrentView('login')} 
      />;
  }

  if (currentView === 'docs') {
      return <Documentation mode="user" onBack={() => setCurrentView('app')} />;
  }

  if (currentView === 'admin-docs') {
      return <Documentation mode="admin" onBack={() => setCurrentView('app')} />;
  }

  if (currentView === 'user-dashboard' && user) {
      return <UserDashboard 
          user={user}
          credits={credits}
          history={history}
          onBack={() => setCurrentView('app')}
          onOpenPro={() => {
            setCurrentView('app');
            setShowUpgradeModal(true);
          }}
          onOpenAdmin={() => {
              if (user.role === 'admin') setCurrentView('admin-dashboard');
          }}
      />;
  }

  if (currentView === 'admin-dashboard' && user?.role === 'admin') {
      return <AdminDashboard 
          onBack={() => setCurrentView('app')}
          onOpenDocs={() => setCurrentView('admin-docs')}
          currentUserCredits={credits}
          onUpdateUserCredits={setCredits}
          plans={plans}
          onUpdatePlans={setPlans}
          appConfig={appConfig}
          onUpdateAppConfig={setAppConfig}
      />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-300 font-sans selection:bg-green-900 selection:text-green-100">
      
      <Header 
        credits={credits} 
        onOpenPro={() => setShowUpgradeModal(true)}
        onOpenDocs={() => setCurrentView('docs')}
        onOpenProfile={() => user ? setCurrentView('user-dashboard') : setCurrentView('login')}
        appConfig={appConfig}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
        
        {/* Intro Section */}
        <div className="text-center space-y-4 animate-fade-in-down">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
            Notícias com <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">IA & SEO</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
            Gere artigos otimizados para Rank Math e Yoast em segundos. Escolha o tema, o tom e deixe a inteligência artificial trabalhar.
          </p>
          {!user && (
             <div className="flex justify-center gap-4 pt-2">
                <button onClick={() => setCurrentView('login')} className="text-sm font-bold text-green-400 border border-green-900/50 px-4 py-2 rounded-full hover:bg-green-900/20 transition">
                   Login
                </button>
                <button onClick={() => setCurrentView('register')} className="text-sm font-bold text-white bg-green-900/20 border border-green-900/50 px-4 py-2 rounded-full hover:bg-green-900/40 transition">
                   Cadastrar
                </button>
             </div>
          )}
        </div>

        {/* Main Form */}
        <div className="bg-gray-900/20 backdrop-blur-sm border border-green-900/30 rounded-2xl p-6 md:p-8 shadow-2xl shadow-green-900/10">
          <NewsGeneratorForm
            theme={theme}
            setTheme={setTheme}
            topic={topic}
            setTopic={setTopic}
            tone={tone}
            setTone={setTone}
            onSubmit={handleGenerate}
            isLoading={isLoading}
            credits={credits}
            onOpenPro={() => setShowUpgradeModal(true)}
            onLoginRequired={() => setCurrentView('login')}
            isLoggedIn={!!user}
          />
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-xl text-center animate-pulse">
            ⚠️ {error}
          </div>
        )}

        {generatedNews && (
          <div className="animate-fade-in space-y-6 pb-12">
             
             <div className="flex justify-between items-center bg-black border border-green-900/30 p-4 rounded-xl sticky top-20 z-20 shadow-lg">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-500 font-mono text-xs uppercase font-bold">Gerado com Sucesso</span>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(generatedNews.body)}
                  className="bg-green-600 hover:bg-green-500 text-black font-bold py-1.5 px-4 rounded text-sm transition flex items-center gap-2"
                >
                  Copiar Markdown
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black p-4 rounded-xl border border-gray-800">
                   <h4 className="text-gray-500 text-xs uppercase font-bold mb-1">Focus Keyword</h4>
                   <p className="text-green-400 font-bold font-mono">{generatedNews.seo.focusKeyword}</p>
                </div>
                <div className="bg-black p-4 rounded-xl border border-gray-800">
                   <h4 className="text-gray-500 text-xs uppercase font-bold mb-1">SEO Title</h4>
                   <p className="text-white text-sm">{generatedNews.seo.seoTitle}</p>
                </div>
                <div className="bg-black p-4 rounded-xl border border-gray-800">
                   <h4 className="text-gray-500 text-xs uppercase font-bold mb-1">URL Slug</h4>
                   <p className="text-gray-400 text-sm font-mono text-ellipsis overflow-hidden">{generatedNews.seo.slug}</p>
                </div>
             </div>

             <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-xl border border-gray-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl">Midjourney / DALL-E 3</div>
                <h4 className="text-gray-400 text-xs uppercase font-bold mb-2">Image Prompt</h4>
                <p className="text-gray-300 text-sm italic font-serif leading-relaxed select-all">
                  "{generatedNews.imagePrompt}"
                </p>
             </div>

             <div className="bg-white text-black p-8 rounded-xl shadow-2xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight border-b pb-4 border-gray-200">
                  {generatedNews.title}
                </h1>
                <div className="prose prose-lg max-w-none">
                   <div className="whitespace-pre-wrap font-serif leading-relaxed text-gray-800">
                     {generatedNews.body}
                   </div>
                </div>
                
                {generatedNews.sources && generatedNews.sources.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Fontes Utilizadas</h4>
                        <ul className="space-y-2">
                            {generatedNews.sources.map((source, idx) => (
                                <li key={idx}>
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-2">
                                        <span>🔗</span> {source.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
             </div>

          </div>
        )}

      </main>

      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={(planId) => {
            const plan = plans.find(p => p.id === planId);
            if (plan) {
                setCheckoutPlan(plan);
                setShowUpgradeModal(false);
                setShowCheckoutModal(true);
            } else if (planId === 'single') {
                 setCheckoutPlan({ id: 'single', name: 'Crédito Avulso', price: 5.00, credits: 1, recurrence: 'Pagamento Único', features: [], active: true });
                 setShowUpgradeModal(false);
                 setShowCheckoutModal(true);
            }
        }}
        plans={plans}
        appConfig={appConfig}
      />

      <CheckoutModal 
         isOpen={showCheckoutModal}
         onClose={() => setShowCheckoutModal(false)}
         plan={checkoutPlan}
         onConfirm={() => {
             setShowCheckoutModal(false);
             if (checkoutPlan) {
                 setCredits(prev => prev + checkoutPlan.credits);
                 alert(`Pagamento confirmado! +${checkoutPlan.credits} créditos adicionados.`);
             }
         }}
      />

      <footer className="border-t border-green-900/30 mt-12 bg-black py-8 text-center">
         <p className="text-gray-600 text-sm">
           © {new Date().getFullYear()} {appConfig.appName}. Powered by Google Gemini 2.0 Flash.
         </p>
      </footer>
    </div>
  );
};

export default App;