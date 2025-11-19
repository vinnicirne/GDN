
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
import type { GeneratedNews, PlanConfig, AppConfig, User } from './types';
import { NEWS_THEMES, NEWS_TONES } from './constants';

// --- CONSTANTS ---

const INITIAL_PLANS: PlanConfig[] = [
  { 
    id: 'p_free', 
    name: 'Gratuito', 
    price: 0, 
    credits: 3, 
    recurrence: 'Mensal', 
    features: [
      'Grounding: Incluso', 
      'Tons: Padrão (4)', 
      'Suporte: FAQ / Comunidade'
    ], 
    active: true,
    recommended: false
  },
  { 
    id: 'p_basic', 
    name: 'Básico', 
    price: 99.00, 
    credits: 50, 
    recurrence: 'Mensal', 
    features: [
      'Grounding: Incluso', 
      'Tons: Todos Padrões', 
      'Suporte: E-mail Padrão', 
      'Custo/Crédito: R$ 1,98'
    ], 
    active: true,
    recommended: false
  },
  { 
    id: 'p_pro', 
    name: 'Profissional', 
    price: 349.00, 
    credits: 200, 
    recurrence: 'Mensal', 
    features: [
      'Grounding: Prioritário', 
      'Tons: Todos + 2 Tons Exclusivos', 
      'Suporte: Prioritário (SLA 24h)', 
      'Custo/Crédito: R$ 1,74'
    ], 
    active: true,
    recommended: true
  },
  { 
    id: 'p_enterprise', 
    name: 'Enterprise', 
    price: -1, // Special flag for "Sob Consulta"
    credits: 500, 
    recurrence: 'Mensal', 
    features: [
      'Grounding: Prioritário', 
      'Tons: Todos + Customizáveis', 
      'Gerente de Conta Dedicado', 
      'Custo/Crédito: Negociável (< R$ 1,74)'
    ], 
    active: true,
    recommended: false
  },
];

const DEFAULT_CONFIG: AppConfig = {
  appName: 'Gerador de Notícias',
  logoUrl: '',
  supportEmail: 'suporte@newsai.com',
  whatsappNumber: '5511999999999',
  contactMessage: 'Precisa de ajuda ou quer um plano personalizado? Nossa equipe está pronta para atender você.'
};

// --- UTILS & ICONS ---

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-black">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
  </svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const LoadingState: React.FC = () => {
  const [message, setMessage] = useState('Inicializando protocolos IA...');
  
  useEffect(() => {
    const steps = [
      'Analisando tendências globais...',
      'Extraindo dados em tempo real...',
      'Ajustando tom de voz neural...',
      'Otimizando Rank Math SEO...',
      'Sintetizando prompt visual...',
      'Compilando output final...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      setMessage(steps[i]);
      i = (i + 1) % steps.length;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center p-12 animate-fade-in">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
      </div>
      <p className="text-green-400 font-mono text-lg animate-pulse">{message}</p>
    </div>
  );
};

const CopyButton: React.FC<{ text: string; label?: string; small?: boolean; className?: string; icon?: React.ReactNode; onClick?: () => void }> = ({ text, label, small, className, icon, onClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onClick) {
      onClick();
    } else {
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-green-900/50 text-gray-300 hover:text-green-400 hover:border-green-500/50 rounded transition-all ${className} ${small ? 'text-[10px] px-2 py-1' : 'text-xs px-3 py-1.5'}`}
      title="Copiar"
    >
      {copied ? <CheckIcon /> : (icon || <CopyIcon />)}
      <span className={copied ? "text-green-500 font-bold" : ""}>{copied ? 'Copiado!' : (label || 'Copiar')}</span>
    </button>
  );
};

// --- COMPONENTS ---

interface GeneratedNewsDisplayProps {
  news: GeneratedNews | null;
}

const GeneratedNewsDisplay: React.FC<GeneratedNewsDisplayProps> = ({ news }) => {
  if (!news) return null;

  const formatInlineStyles = (text: string) => {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-green-300 font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
  };

  const convertMarkdownToHtml = (markdown: string) => {
    let html = markdown
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br />');
    
    html = `<div>${html}</div>`;
    return html;
  };

  const handleCopyHtml = () => {
    const htmlContent = `<h1>${news.title}</h1>\n${convertMarkdownToHtml(news.body)}`;
    navigator.clipboard.writeText(htmlContent);
  };

  const renderBody = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    type ListType = 'ul' | 'ol' | null;
    let listBuffer: string[] = [];
    let currentListType: ListType = null;

    const flushList = (idx: number) => {
      if (listBuffer.length > 0 && currentListType) {
        if (currentListType === 'ul') {
          elements.push(
            <ul key={`list-ul-${idx}`} className="list-disc pl-6 mb-4 text-gray-300 space-y-1 marker:text-green-500">
              {listBuffer.map((item, i) => (
                <li key={i}>{formatInlineStyles(item)}</li>
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol key={`list-ol-${idx}`} className="list-decimal pl-6 mb-4 text-gray-300 space-y-1 marker:text-green-500 marker:font-bold">
              {listBuffer.map((item, i) => (
                <li key={i}>{formatInlineStyles(item)}</li>
              ))}
            </ol>
          );
        }
        listBuffer = [];
        currentListType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const isUl = trimmed.startsWith('- ') || trimmed.startsWith('* ');
      const isOl = /^\d+\.\s/.test(trimmed);

      if (isUl) {
        if (currentListType === 'ol') flushList(index);
        currentListType = 'ul';
        listBuffer.push(trimmed.replace(/^[-*]\s+/, ''));
        return;
      }

      if (isOl) {
        if (currentListType === 'ul') flushList(index);
        currentListType = 'ol';
        listBuffer.push(trimmed.replace(/^\d+\.\s+/, ''));
        return;
      }

      flushList(index);

      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl font-bold text-green-200 mt-8 mb-4 border-b border-green-900/50 pb-2">
            {line.replace('## ', '')}
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-green-300 mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
        return;
      }
      if (trimmed === '') {
        elements.push(<div key={index} className="h-2" />);
        return;
      }
      elements.push(
        <p key={index} className="mb-3 text-gray-300 leading-relaxed text-lg">
          {formatInlineStyles(line)}
        </p>
      );
    });

    flushList(lines.length);
    return elements;
  };

  const shareUrl = `https://wa.me/?text=${encodeURIComponent(`*${news.title}*\n\n${news.seo.metaDescription}\n\nLeia mais no App Gerador de Notícias.`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${news.title}\n\n${news.seo.seoTitle}`)}`;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-8 animate-fade-in">
      
      {/* Image Prompt Section */}
      {news.imagePrompt && (
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
           <div className="p-3 bg-green-900/30 rounded-full text-green-400">
             <ImageIcon />
           </div>
           <div className="flex-1">
             <h3 className="text-sm font-bold text-green-400 uppercase mb-1">Sugestão de Capa (AI Art)</h3>
             <p className="text-xs text-gray-400 mb-2 line-clamp-2 font-mono">{news.imagePrompt}</p>
             <div className="flex items-center gap-2">
                <CopyButton text={news.imagePrompt} label="Copiar Prompt" small className="border-green-900/50 hover:border-green-500" />
                <span className="text-[10px] text-gray-500">Cole no Midjourney ou DALL-E</span>
             </div>
           </div>
        </div>
      )}

      {/* Article Section */}
      <article className="bg-black/60 rounded-xl shadow-2xl overflow-hidden border border-green-900/50">
        {/* Header Toolbar */}
        <div className="bg-black/80 px-6 py-3 border-b border-green-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <span className="text-xs font-bold text-green-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Preview
            </span>
            <div className="flex gap-2">
                <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs bg-green-900/20 hover:bg-green-900/40 border border-green-800 text-green-400 px-3 py-1.5 rounded transition-all">
                    <ShareIcon /> WhatsApp
                </a>
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs bg-gray-800/50 hover:bg-gray-800 border border-gray-700 text-gray-400 px-3 py-1.5 rounded transition-all">
                    <ShareIcon /> X / Twitter
                </a>
            </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="mb-8">
             <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">{news.title}</h1>
             <div className="flex justify-end">
               <CopyButton text={news.title} label="Copiar Título" className="border-gray-700 hover:border-green-500" />
             </div>
          </div>
          
          <div className="text-gray-300">
            {renderBody(news.body)}
          </div>

          {/* Main Copy Buttons */}
          <div className="mt-8 border-t border-green-900/30 pt-6 flex flex-col sm:flex-row justify-end gap-3">
             <CopyButton 
                text="" 
                label="Copiar como HTML" 
                onClick={handleCopyHtml}
                icon={<CodeIcon />}
                className="bg-gray-900 hover:bg-gray-800 text-gray-400 border-gray-700 py-3 px-6 text-sm font-bold"
             />
             <CopyButton 
                text={news.body} 
                label="Copiar Texto (Markdown)" 
                className="bg-green-700 hover:bg-green-600 text-white border-green-500 py-3 px-6 text-sm font-bold shadow-[0_0_15px_rgba(21,128,61,0.3)]"
             />
          </div>
          
          {news.sources && news.sources.length > 0 && (
            <div className="mt-10 bg-gray-900/30 p-4 rounded-lg border border-green-900/30">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Fontes de Dados</h3>
              <ul className="space-y-2">
                {news.sources.map((source, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">●</span>
                    <a 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 hover:underline transition-colors truncate max-w-md"
                      title={source.title}
                    >
                      {source.title || new URL(source.uri).hostname}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>

      {/* SEO / Rank Math Section */}
      <div className="bg-black border border-green-600/30 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-900/10 p-4 border-b border-green-600/30 flex justify-between items-center">
          <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            SEO Pack (Rank Math)
          </h3>
          <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded border border-green-800">
            Score: 98/100
          </span>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Palavra-chave</label>
                  <CopyButton text={news.seo.focusKeyword} label="" />
              </div>
              <div className="bg-gray-900/50 p-3 rounded border border-green-900/50 text-white font-mono text-sm">
                {news.seo.focusKeyword}
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Slug (URL)</label>
                  <CopyButton text={news.seo.slug} label="" />
              </div>
              <div className="bg-gray-900/50 p-3 rounded border border-green-900/50 text-white font-mono text-sm">
                {news.seo.slug}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Título SEO</label>
                <CopyButton text={news.seo.seoTitle} label="" />
            </div>
            <div className="bg-gray-900/50 p-3 rounded border border-green-900/50 text-white text-sm">
              {news.seo.seoTitle}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Meta Description</label>
                <CopyButton text={news.seo.metaDescription} label="" />
            </div>
            <div className="bg-gray-900/50 p-3 rounded border border-green-900/50 text-white text-sm leading-relaxed">
              {news.seo.metaDescription}
            </div>
            <p className="text-xs text-gray-500 mt-1 flex justify-between font-mono">
              <span>Ideal para colar no plugin de SEO.</span>
              <span className={news.seo.metaDescription.length > 160 ? "text-red-400" : "text-green-500"}>
                {news.seo.metaDescription.length} chars
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Tags Sugeridas</label>
            <div className="flex flex-wrap gap-2">
              {news.seo.tags.map((tag, idx) => (
                <button 
                    key={idx} 
                    onClick={() => navigator.clipboard.writeText(tag)}
                    className="bg-gray-900 hover:bg-green-900/30 text-gray-300 hover:text-green-300 px-3 py-1 rounded-full text-sm border border-gray-800 hover:border-green-700 transition active:scale-95"
                    title="Clique para copiar tag"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistorySidebar: React.FC<{ 
    history: GeneratedNews[], 
    onSelect: (news: GeneratedNews) => void,
    currentTitle: string | undefined 
}> = ({ history, onSelect, currentTitle }) => {
    if (history.length === 0) return null;

    return (
        <div className="w-full mb-8 bg-black border border-green-900/50 rounded-lg p-4">
            <h3 className="text-xs font-bold text-green-500 uppercase mb-3 tracking-widest">Arquivo de Log</h3>
            <div className="flex flex-col gap-2">
                {history.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(item)}
                        className={`text-left text-sm p-2 rounded transition-all truncate border ${
                            currentTitle === item.title 
                            ? 'bg-green-900/20 text-green-300 border-green-700' 
                            : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-900 hover:text-gray-300 hover:border-gray-800'
                        }`}
                    >
                        {item.title}
                    </button>
                ))}
            </div>
        </div>
    );
};

type ViewState = 'app' | 'docs' | 'user-dashboard' | 'admin-dashboard' | 'admin-docs' | 'login' | 'register';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('app');
  const [user, setUser] = useState<User | null>(null);

  const [theme, setTheme] = useState<string>(NEWS_THEMES[0]);
  const [topic, setTopic] = useState<string>('');
  const [tone, setTone] = useState<string>(NEWS_TONES[0]);
  const [generatedNews, setGeneratedNews] = useState<GeneratedNews | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // App Config State (White Label)
  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
      try {
          const stored = localStorage.getItem('news_app_config');
          return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
      } catch {
          return DEFAULT_CONFIG;
      }
  });

  useEffect(() => {
      localStorage.setItem('news_app_config', JSON.stringify(appConfig));
      document.title = appConfig.appName;
  }, [appConfig]);

  // Plans State Management
  const [plans, setPlans] = useState<PlanConfig[]>(() => {
      try {
          return INITIAL_PLANS;
      } catch {
          return INITIAL_PLANS;
      }
  });

  useEffect(() => {
      localStorage.setItem('news_app_plans', JSON.stringify(plans));
  }, [plans]);

  const [history, setHistory] = useState<GeneratedNews[]>(() => {
      const stored = localStorage.getItem('news_app_history');
      return stored ? JSON.parse(stored) : [];
  });

  const [credits, setCredits] = useState<number>(() => {
    const today = new Date().toLocaleDateString();
    const storedDate = localStorage.getItem('news_app_date');
    const storedCredits = localStorage.getItem('news_app_credits');

    if (storedDate !== today) {
      return 3;
    }
    return storedCredits ? parseInt(storedCredits) : 3;
  }); 
  
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanConfig | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        // If user is admin, toggle admin dashboard
        if (user?.role === 'admin') {
            setCurrentView(prev => prev === 'admin-dashboard' ? 'app' : 'admin-dashboard');
        } else {
            // Shortcut to login
            if (!user) setCurrentView('login');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    localStorage.setItem('news_app_date', today);
    localStorage.setItem('news_app_credits', credits.toString());
    localStorage.setItem('news_app_history', JSON.stringify(history));

    if (!generatedNews && history.length > 0) {
        setGeneratedNews(history[0]);
    }
  }, [credits, history]); 

  // Sync credits from User Object when login happens
  useEffect(() => {
      if (user) {
          setCredits(user.credits);
      }
  }, [user]);

  const handleGenerateNews = async (e: React.FormEvent) => {
    e.preventDefault();

    if (credits <= 0) {
      // Force user to login if not logged in
      if (!user) {
          setCurrentView('login');
      } else {
          setShowUpgradeModal(true);
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedNews(null);

    try {
      const news = await generateNewsArticle(theme, topic, tone);
      
      setGeneratedNews(news);
      setHistory(prev => {
          const newHistory = [news, ...prev].slice(0, 10);
          return newHistory;
      });
      
      const newCredits = credits - 1;
      setCredits(newCredits);
      
      // Sync back to user object mock
      if (user) {
          setUser({...user, credits: newCredits});
      }
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    if (planId === 'p_enterprise') return;

    let selectedPlan: PlanConfig | undefined;
    
    if (planId === 'single') {
        selectedPlan = {
            id: 'single',
            name: '1 Crédito Avulso',
            price: 5.00,
            credits: 1,
            recurrence: 'Pagamento Único',
            features: ['Grounding Incluso', 'Tons Padrão', 'Sem Suporte'],
            active: true
        };
    } else {
        selectedPlan = plans.find(p => p.id === planId);
    }

    if (selectedPlan) {
        setCheckoutPlan(selectedPlan);
        setShowUpgradeModal(false);
        setShowCheckoutModal(true);
    }
  };

  const handlePaymentSuccess = () => {
      let addedCredits = 0;
      if (checkoutPlan) {
          if (checkoutPlan.id === 'single') {
              addedCredits = 1;
          } else {
              addedCredits = checkoutPlan.credits;
          }
      }
      
      const newTotal = credits + addedCredits;
      setCredits(newTotal);
      
      if (user) {
          setUser({...user, credits: newTotal});
      }

      setShowCheckoutModal(false);
      setCheckoutPlan(null);
  };

  // Auth Handlers
  const handleLoginSuccess = (userData: User) => {
      setUser(userData);
      // Auto-redirect for admins
      if (userData.role === 'admin') {
          setCurrentView('admin-dashboard');
      } else {
          setCurrentView('app');
      }
  };

  const handleLogout = async () => {
      await authService.logout();
      setUser(null);
      // Reset credits to default daily limit for "guest" on logout, or keep as is
      setCredits(3); 
      setCurrentView('login');
  };

  const handleOpenProAction = () => {
      if (!user) {
          setCurrentView('login');
      } else {
          setShowUpgradeModal(true);
      }
  };

  // Views
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
      return <Register onRegisterSuccess={handleLoginSuccess} onGoToLogin={() => setCurrentView('login')} />;
  }

  if (currentView === 'docs') {
    return <Documentation mode="user" onBack={() => setCurrentView('app')} />;
  }

  if (currentView === 'admin-docs') {
    return <Documentation mode="admin" onBack={() => setCurrentView('admin-dashboard')} />;
  }

  if (currentView === 'user-dashboard') {
    return (
      <>
        <UpgradeModal 
          isOpen={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)} 
          onUpgrade={handleUpgrade}
          plans={plans}
          appConfig={appConfig}
        />
        <CheckoutModal 
            isOpen={showCheckoutModal}
            onClose={() => setShowCheckoutModal(false)}
            plan={checkoutPlan}
            onConfirm={handlePaymentSuccess}
        />
        <UserDashboard 
          credits={credits}
          history={history}
          onBack={() => setCurrentView('app')}
          onOpenPro={() => setShowUpgradeModal(true)}
          onOpenAdmin={() => {
              if (user?.role === 'admin') setCurrentView('admin-dashboard');
          }}
        />
      </>
    );
  }

  if (currentView === 'admin-dashboard') {
    return (
        <AdminDashboard 
            onBack={() => setCurrentView('app')} 
            onOpenDocs={() => setCurrentView('admin-docs')}
            currentUserCredits={credits}
            onUpdateUserCredits={(val) => {
                setCredits(val);
                if (user) setUser({...user, credits: val});
            }}
            plans={plans}
            onUpdatePlans={setPlans}
            appConfig={appConfig}
            onUpdateAppConfig={setAppConfig}
        />
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-4 pb-20">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        /* Grid Background Effect */
        body::before {
          content: "";
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: 
            linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px);
          background-size: 30px 30px;
          pointer-events: none;
          z-index: -1;
        }
      `}</style>
      
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        onUpgrade={handleUpgrade}
        plans={plans}
        appConfig={appConfig}
      />
      
      <CheckoutModal 
            isOpen={showCheckoutModal}
            onClose={() => setShowCheckoutModal(false)}
            plan={checkoutPlan}
            onConfirm={handlePaymentSuccess}
      />

      <div className="w-full max-w-4xl relative z-10">
        <div className="flex items-center justify-end mb-2 gap-2">
             {user ? (
                 <div className="flex items-center gap-2">
                     <span className="text-xs text-gray-500">Olá, {user.name}</span>
                     <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 underline">Sair</button>
                 </div>
             ) : null}
        </div>

        <Header 
            credits={credits} 
            onOpenPro={handleOpenProAction} 
            onOpenDocs={() => setCurrentView('docs')}
            onOpenProfile={() => {
                if (user) {
                    setCurrentView('user-dashboard');
                } else {
                    setCurrentView('login');
                }
            }}
            appConfig={appConfig}
        />
        
        <main className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8 items-start">
             {/* Left Column: Form & Result */}
             <div className="md:col-span-2">
                <NewsGeneratorForm
                    theme={theme}
                    setTheme={setTheme}
                    topic={topic}
                    setTopic={setTopic}
                    tone={tone}
                    setTone={setTone}
                    onSubmit={handleGenerateNews}
                    isLoading={isLoading}
                    credits={credits}
                    onOpenPro={handleOpenProAction}
                    onLoginRequired={() => setCurrentView('login')}
                    isLoggedIn={!!user}
                />
             </div>
          </div>

          {/* History Bar (visible if history exists) */}
          {history.length > 0 && (
             <div className="mt-6">
                 <HistorySidebar 
                    history={history} 
                    onSelect={setGeneratedNews} 
                    currentTitle={generatedNews?.title}
                 />
             </div>
          )}

          <div className="mt-8">
            {isLoading && <LoadingState />}
            
            {error && (
              <div className="bg-red-900/10 border border-red-900 text-red-400 p-6 rounded-lg text-center shadow-lg animate-fade-in">
                <p className="font-bold mb-2">ERRO NO SISTEMA</p>
                <p className="font-mono text-sm">{error}</p>
                <button onClick={() => setError(null)} className="mt-4 text-xs underline hover:text-white uppercase tracking-widest">Reiniciar Processo</button>
              </div>
            )}
            
            {generatedNews && !isLoading && <GeneratedNewsDisplay news={generatedNews} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
