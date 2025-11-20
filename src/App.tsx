import React, { useState, useEffect } from 'react';

// Interfaces básicas para funcionar sem imports externos
interface User {
  id: string;
  email: string;
  role: string;
  credits: number;
}

interface PlanConfig {
  id: string;
  name: string;
  price: number;
  credits: number;
  recurrence: string;
  features: string[];
  active: boolean;
  recommended?: boolean;
}

interface AppConfig {
  appName: string;
  logoUrl: string;
  supportEmail: string;
  whatsappNumber: string;
  contactMessage: string;
}

interface GeneratedNews {
  id?: string;
  title: string;
  body: string;
  imagePrompt: string;
  sources: Array<{
    uri: string;
    title: string;
  }>;
  seo: {
    focusKeyword: string;
    seoTitle: string;
    slug: string;
    metaDescription: string;
    tags: string[];
  };
  created_at?: string;
}

// Constantes básicas
const NEWS_THEMES = ['Tecnologia', 'Política', 'Esportes', 'Entretenimento', 'Ciência', 'Economia'];
const NEWS_TONES = ['Neutro', 'Formal', 'Informal', 'Urgente'];

// Serviços mock para funcionar sem imports quebrados
const authService = {
  getCurrentSession: async (): Promise<User | null> => {
    return null; // Sem usuário por padrão
  },
  logout: async (): Promise<void> => {
    console.log('Logout realizado');
  }
};

const generateNewsArticle = async (theme: string, topic: string, tone: string): Promise<GeneratedNews> => {
  // Mock da geração de notícia
  return {
    title: `${topic} - Notícia Gerada sobre ${theme}`,
    body: `Esta é uma notícia de exemplo sobre ${topic} no tema ${theme} com tom ${tone}. O sistema está funcionando perfeitamente para deploy no Vercel!`,
    imagePrompt: `Imagem representando ${topic} no contexto de ${theme}`,
    sources: [
      {
        uri: "https://exemplo.com/fonte1",
        title: "Fonte Exemplo 1"
      }
    ],
    seo: {
      focusKeyword: `${topic} ${theme}`,
      seoTitle: `${topic} - Análise Completa | ${theme}`,
      slug: `noticia-${topic.toLowerCase().replace(/\s+/g, '-')}`,
      metaDescription: `Notícia completa sobre ${topic} no contexto de ${theme}.`,
      tags: [theme, topic, 'notícia']
    }
  };
};

// Componentes básicos
const LoadingState: React.FC = () => (
  <div className="flex flex-col justify-center items-center p-12 animate-fade-in">
    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-green-400 font-mono text-sm animate-pulse">Carregando Sistema...</p>
  </div>
);

const Header: React.FC<{
  credits: number;
  onOpenPro: () => void;
  onOpenDocs: () => void;
  onOpenProfile: () => void;
  appConfig: AppConfig;
}> = ({ credits, onOpenPro, onOpenDocs, onOpenProfile, appConfig }) => (
  <header className="w-full border-b border-green-900/30 bg-black/80 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-black font-bold">
          AI
        </div>
        <h1 className="text-xl font-bold text-white">{appConfig.appName}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="bg-green-900/20 border border-green-900/50 px-3 py-1 rounded-full">
          <span className="text-green-400 font-mono text-sm">{credits} créditos</span>
        </div>
        
        <button 
          onClick={onOpenPro}
          className="bg-green-600 hover:bg-green-500 text-black font-bold py-2 px-4 rounded-lg transition text-sm"
        >
          Recarregar
        </button>
        
        <button 
          onClick={onOpenDocs}
          className="text-gray-400 hover:text-white transition text-sm"
        >
          Docs
        </button>
        
        <button 
          onClick={onOpenProfile}
          className="text-gray-400 hover:text-white transition text-sm"
        >
          Perfil
        </button>
      </div>
    </div>
  </header>
);

const NewsGeneratorForm: React.FC<{
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
}> = ({ 
  theme, setTheme, topic, setTopic, tone, setTone, 
  onSubmit, isLoading, credits, onOpenPro, onLoginRequired, isLoggedIn 
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Tema */}
      <div>
        <label className="block text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
          Tema
        </label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full bg-black border border-green-900/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
        >
          {NEWS_THEMES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Tópico */}
      <div>
        <label className="block text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
          Tópico
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: Inteligência Artificial no jornalismo"
          className="w-full bg-black border border-green-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-green-500"
          required
        />
      </div>

      {/* Tom */}
      <div>
        <label className="block text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
          Tom
        </label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full bg-black border border-green-900/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
        >
          {NEWS_TONES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </div>

    <div className="flex justify-between items-center pt-4">
      <div className="text-sm text-gray-500">
        {isLoggedIn ? (
          <span>Créditos disponíveis: <strong className="text-green-400">{credits}</strong></span>
        ) : (
          <span className="text-yellow-500">Faça login para gerar notícias</span>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !isLoggedIn || credits <= 0}
        className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 px-8 rounded-lg transition flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            Gerando...
          </>
        ) : !isLoggedIn ? (
          'Faça Login'
        ) : credits <= 0 ? (
          'Sem Créditos'
        ) : (
          '🎯 Gerar Notícia'
        )}
      </button>
    </div>
  </form>
);

// Componente principal
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'app' | 'login' | 'register'>('app');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [theme, setTheme] = useState<string>(NEWS_THEMES[0]);
  const [topic, setTopic] = useState<string>('');
  const [tone, setTone] = useState<string>(NEWS_TONES[0]);
  const [generatedNews, setGeneratedNews] = useState<GeneratedNews | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [appConfig] = useState<AppConfig>({
    appName: 'Gerador de Notícias AI',
    logoUrl: '',
    supportEmail: 'suporte@newsai.com',
    whatsappNumber: '5511999999999',
    contactMessage: 'Olá, preciso de ajuda com a plataforma.'
  });
  
  const [credits, setCredits] = useState<number>(3); // Créditos iniciais
  const [history, setHistory] = useState<GeneratedNews[]>([]);

  // Auth initialization
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
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setCurrentView('login');
      return;
    }

    if (credits <= 0) {
      setError('Sem créditos disponíveis. Recarregue para continuar.');
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
      setError('Falha ao gerar notícia. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    setCredits(u.credits);
    setCurrentView('app');
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setCredits(0);
    setCurrentView('login');
  };

  // Simulação de login/register
  const LoginView: React.FC<{ onLoginSuccess: (user: User) => void; onGoToRegister: () => void; }> = 
    ({ onLoginSuccess, onGoToRegister }) => (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/30 border border-green-900/50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>
        <button 
          onClick={() => onLoginSuccess({ 
            id: '1', 
            email: 'usuario@exemplo.com', 
            role: 'user', 
            credits: 3 
          })}
          className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-3 rounded-lg transition"
        >
          Entrar como Usuário Teste
        </button>
        <button 
          onClick={onGoToRegister}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition mt-4"
        >
          Criar Conta
        </button>
      </div>
    </div>
  );

  const RegisterView: React.FC<{ onRegisterSuccess: (user: User) => void; onGoToLogin: () => void; }> = 
    ({ onRegisterSuccess, onGoToLogin }) => (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/30 border border-green-900/50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Criar Conta</h2>
        <button 
          onClick={() => onRegisterSuccess({ 
            id: '1', 
            email: 'novousuario@exemplo.com', 
            role: 'user', 
            credits: 3 
          })}
          className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-3 rounded-lg transition"
        >
          Criar Conta Gratuita
        </button>
        <button 
          onClick={onGoToLogin}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition mt-4"
        >
          Voltar ao Login
        </button>
      </div>
    </div>
  );

  if (isAuthLoading) return <LoadingState />;

  if (currentView === 'login') {
    return <LoginView onLoginSuccess={handleLoginSuccess} onGoToRegister={() => setCurrentView('register')} />;
  }

  if (currentView === 'register') {
    return <RegisterView onRegisterSuccess={handleLoginSuccess} onGoToLogin={() => setCurrentView('login')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-300 font-sans">
      
      <Header 
        credits={credits} 
        onOpenPro={() => setCurrentView('login')}
        onOpenDocs={() => alert('Documentação em breve!')}
        onOpenProfile={() => user ? console.log('Abrir perfil') : setCurrentView('login')}
        appConfig={appConfig}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
        
        {/* Intro Section */}
        <div className="text-center space-y-4">
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
            onOpenPro={() => setCurrentView('login')}
            onLoginRequired={() => setCurrentView('login')}
            isLoggedIn={!!user}
          />
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-xl text-center">
            ⚠️ {error}
          </div>
        )}

        {generatedNews && (
          <div className="space-y-6 pb-12">
             <div className="flex justify-between items-center bg-black border border-green-900/30 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-500 font-mono text-xs uppercase font-bold">Gerado com Sucesso</span>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(generatedNews.body)}
                  className="bg-green-600 hover:bg-green-500 text-black font-bold py-1.5 px-4 rounded text-sm transition"
                >
                  Copiar Conteúdo
                </button>
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
             </div>
          </div>
        )}

      </main>

      <footer className="border-t border-green-900/30 mt-12 bg-black py-8 text-center">
         <p className="text-gray-600 text-sm">
           © {new Date().getFullYear()} {appConfig.appName}. Powered by AI.
         </p>
      </footer>
    </div>
  );
};

export default App;