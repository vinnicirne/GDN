// src/App.tsx
import React, { useState, useEffect } from 'react';

// Interfaces básicas
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
  features: string[];
  recurrence: string;
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
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

// Serviço de autenticação mock
const authService = {
  getCurrentUser: async (): Promise<User | null> => {
    return null; // Mock - sempre retorna não logado
  },
  logout: async (): Promise<void> => {
    // Mock - não faz nada
  }
};

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

// Componentes básicos (mock)
const Welcome: React.FC<{ onLogin: () => void; onRegister: () => void; onOpenDocs: () => void }> = ({ onLogin, onRegister }) => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">Gerador de Notícias AI</h1>
      <p className="text-gray-400 mb-8">Bem-vindo! Faça login ou registre-se para começar.</p>
      <div className="space-x-4">
        <button 
          onClick={onLogin}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Login
        </button>
        <button 
          onClick={onRegister}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Registrar
        </button>
      </div>
    </div>
  </div>
);

const Login: React.FC<{ onLoginSuccess: (user: User) => void; onGoToRegister: () => void; onBack: () => void }> = ({ onLoginSuccess, onGoToRegister, onBack }) => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center">
    <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      <button 
        onClick={() => onLoginSuccess({ id: '1', email: 'user@test.com', role: 'user', credits: 3 })}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold mb-4"
      >
        Entrar como Teste
      </button>
      <div className="flex space-x-2">
        <button onClick={onBack} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded">
          Voltar
        </button>
        <button onClick={onGoToRegister} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
          Registrar
        </button>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<{ user: User; onLogout: () => void; onGenerateNews: () => void }> = ({ user, onLogout, onGenerateNews }) => (
  <div className="min-h-screen bg-black text-white p-8">
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Bem-vindo, {user.email}!</h2>
        <p className="text-green-400 mb-2">Créditos disponíveis: {user.credits}</p>
        <p className="text-gray-400">Plano: {user.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
      </div>

      <button 
        onClick={onGenerateNews}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
      >
        Gerar Nova Notícia
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
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
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setCurrentView('welcome');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Handlers de navegação
  const handleGoToLogin = () => setCurrentView('login');
  const handleGoToRegister = () => setCurrentView('register');
  const handleGoToWelcome = () => setCurrentView('welcome');
  const handleGoToDashboard = () => setCurrentView('dashboard');
  const handleGoToGenerator = () => setCurrentView('generator');

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
            onOpenDocs={() => alert('Documentação em breve!')}
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

      case 'dashboard':
        if (!user) return handleGoToLogin();
        return (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onGenerateNews={handleGoToGenerator}
          />
        );

      case 'generator':
        if (!user) return handleGoToLogin();
        return (
          <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Gerador de Notícias</h2>
              <p className="text-gray-400 mb-6">Funcionalidade em desenvolvimento</p>
              <button 
                onClick={handleGoToDashboard}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return (
          <Welcome
            onLogin={handleGoToLogin}
            onRegister={handleGoToRegister}
            onOpenDocs={() => alert('Documentação em breve!')}
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