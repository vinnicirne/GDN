// App.tsx
import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import type { User, PlanConfig, AppConfig, GeneratedNews } from './types';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import NewsGenerator from './components/NewsGenerator';
import Plans from './components/Plans';

// Planos padrão
const defaultPlans: PlanConfig[] = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    credits: 3,
    features: [
      '3 créditos grátis',
      'Acesso básico ao gerador',
      'Suporte por email'
    ],
    recurrence: 'Pagamento Único',
    active: true
  },
  {
    id: 'basic',
    name: 'Básico',
    price: 29.90,
    credits: 50,
    features: [
      '50 créditos mensais',
      'Todos os temas disponíveis',
      'Suporte prioritário',
      'Histórico de notícias'
    ],
    recurrence: 'Mensal',
    active: true
  },
  {
    id: 'pro',
    name: 'Profissional',
    price: 79.90,
    credits: 150,
    features: [
      '150 créditos mensais',
      'Todos os temas disponíveis',
      'Suporte VIP',
      'Histórico ilimitado',
      'Exportação em PDF'
    ],
    recurrence: 'Mensal',
    active: true,
    recommended: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199.90,
    credits: 500,
    features: [
      '500 créditos mensais',
      'Todos os temas premium',
      'Suporte 24/7',
      'API access',
      'Customização avançada'
    ],
    recurrence: 'Mensal',
    active: true
  }
];

// Configuração padrão do app
const defaultAppConfig: AppConfig = {
  appName: 'Gerador de Notícias AI',
  logoUrl: '',
  supportEmail: 'suporte@newsai.com',
  whatsappNumber: '5511999999999',
  contactMessage: 'Como podemos ajudar?'
};

type AppView = 'welcome' | 'login' | 'register' | 'dashboard' | 'admin' | 'generator' | 'plans';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<PlanConfig[]>(defaultPlans);
  const [appConfig, setAppConfig] = useState<AppConfig>(defaultAppConfig);
  const [generatedNews, setGeneratedNews] = useState<GeneratedNews | null>(null);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Redirecionar para dashboard se já estiver autenticado
          setCurrentView(currentUser.role === 'admin' ? 'admin' : 'dashboard');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handlers de autenticação
  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setCurrentView(userData.role === 'admin' ? 'admin' : 'dashboard');
  };

  const handleRegisterSuccess = (userData: User) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setCurrentView('welcome');
      setGeneratedNews(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Handlers de navegação
  const handleGoToLogin = () => setCurrentView('login');
  const handleGoToRegister = () => setCurrentView('register');
  const handleGoToWelcome = () => setCurrentView('welcome');
  const handleGoToDashboard = () => setCurrentView('dashboard');
  const handleGoToAdmin = () => setCurrentView('admin');
  const handleGoToGenerator = () => setCurrentView('generator');
  const handleGoToPlans = () => setCurrentView('plans');

  // Handlers de dados
  const handleUpdateUserCredits = (credits: number) => {
    if (user) {
      setUser({ ...user, credits });
    }
  };

  const handleUpdatePlans = (updatedPlans: PlanConfig[]) => {
    setPlans(updatedPlans);
  };

  const handleUpdateAppConfig = (config: AppConfig) => {
    setAppConfig(config);
  };

  const handleNewsGenerated = (news: GeneratedNews) => {
    setGeneratedNews(news);
    // Atualizar créditos do usuário
    if (user) {
      handleUpdateUserCredits(user.credits - 1);
    }
  };

  const handleOpenDocs = () => {
    alert('Documentação será aberta em breve!');
    // Implementar abertura de documentação
  };

  // Renderizar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-400">Carregando...</div>
        </div>
      </div>
    );
  }

  // Renderizar views baseado no estado atual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'welcome':
        return (
          <Welcome
            onLogin={handleGoToLogin}
            onRegister={handleGoToRegister}
            onOpenDocs={handleOpenDocs}
          />
        );

      case 'login':
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={handleGoToRegister}
            onBack={handleGoToWelcome}
          />
        );

      case 'register':
        return (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onGoToLogin={handleGoToLogin}
            onBack={handleGoToWelcome}
          />
        );

      case 'dashboard':
        if (!user) return handleGoToLogin();
        return (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onGenerateNews={handleGoToGenerator}
            onViewPlans={handleGoToPlans}
            onOpenDocs={handleOpenDocs}
            currentNews={generatedNews}
          />
        );

      case 'admin':
        if (!user || user.role !== 'admin') {
          return handleGoToLogin();
        }
        return (
          <AdminDashboard
            onBack={handleGoToDashboard}
            onOpenDocs={handleOpenDocs}
            currentUserCredits={user?.credits || 0}
            onUpdateUserCredits={handleUpdateUserCredits}
            plans={plans}
            onUpdatePlans={handleUpdatePlans}
            appConfig={appConfig}
            onUpdateAppConfig={handleUpdateAppConfig}
          />
        );

      case 'generator':
        if (!user) return handleGoToLogin();
        return (
          <NewsGenerator
            user={user}
            onBack={handleGoToDashboard}
            onNewsGenerated={handleNewsGenerated}
            onUpdateUserCredits={handleUpdateUserCredits}
          />
        );

      case 'plans':
        if (!user) return handleGoToLogin();
        return (
          <Plans
            user={user}
            plans={plans}
            onBack={handleGoToDashboard}
            onSubscribe={(planId) => {
              console.log('Assinando plano:', planId);
              // Implementar lógica de assinatura
              alert(`Redirecionando para pagamento do plano: ${planId}`);
            }}
          />
        );

      default:
        return (
          <Welcome
            onLogin={handleGoToLogin}
            onRegister={handleGoToRegister}
            onOpenDocs={handleOpenDocs}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
};

export default App;