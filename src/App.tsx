import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Importação das Páginas (caminhos baseados na sua estrutura de pastas)
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import GeneratorPage from './pages/GeneratorPage';
import UserDashboardPage from './pages/UserDashboard';
import AdminDashboardPage from './pages/AdminDashboard';
import DocumentationPage from './pages/Documentation';

// Importação de Tipos e Constantes
import { DEFAULT_APP_CONFIG, INITIAL_PLANS } from './constants';
import type { PlanConfig, AppConfig } from './types';

// --- COMPONENTES DE ROTA PROTEGIDA ---

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  
  return user?.role === 'admin' ? children : <Navigate to="/" />;
};

// --- WRAPPERS (ADAPTADORES DE NAVEGAÇÃO) ---

const LoginWrapper = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <LoginPage
      onLoginSuccess={(user) => {
        login(user);
        navigate('/');
      }}
      onGoToRegister={() => navigate('/register')}
      onBack={() => navigate('/')}
    />
  );
};

const RegisterWrapper = () => {
  const navigate = useNavigate();
  
  return (
    <RegisterPage
      onRegisterSuccess={() => {
        alert("Conta criada com sucesso! Faça login.");
        navigate('/login');
      }}
      onGoToLogin={() => navigate('/login')}
    />
  );
};

const DashboardWrapper = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <UserDashboardPage
      user={user}
      credits={user.credits}
      history={[]} // TODO: Implementar busca de histórico no Contexto ou aqui
      onBack={() => navigate('/')}
      onOpenPro={() => {
        navigate('/'); 
        // Nota: Idealmente, passar um state via navigate para abrir o modal na home
        // ex: navigate('/', { state: { openPro: true } })
      }}
      onOpenAdmin={() => navigate('/admin')}
    />
  );
};

const AdminWrapper = () => {
  const { user, updateCredits } = useAuth();
  const navigate = useNavigate();
  
  // Estados locais para simular edição (já que não temos backend para isso ainda)
  const [plans, setPlans] = useState<PlanConfig[]>(INITIAL_PLANS);
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);

  if (!user) return null;

  return (
    <AdminDashboardPage
      onBack={() => navigate('/dashboard')}
      onOpenDocs={() => navigate('/admin/docs')}
      currentUserCredits={user.credits}
      onUpdateUserCredits={updateCredits}
      plans={plans}
      onUpdatePlans={setPlans}
      appConfig={appConfig}
      onUpdateAppConfig={setAppConfig}
    />
  );
};

// --- APLICAÇÃO PRINCIPAL ---

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<LoginWrapper />} />
      <Route path="/register" element={<RegisterWrapper />} />
      <Route path="/docs" element={<DocumentationPage mode="user" onBack={() => window.history.back()} />} />

      {/* Rotas Protegidas */}
      <Route path="/" element={
        <PrivateRoute>
          <GeneratorPage />
        </PrivateRoute>
      } />
      
      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardWrapper />
        </PrivateRoute>
      } />

      {/* Rotas de Administrador */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminWrapper />
        </AdminRoute>
      } />
      
      <Route path="/admin/docs" element={
        <AdminRoute>
          <DocumentationPage mode="admin" onBack={() => window.history.back()} />
        </AdminRoute>
      } />

      {/* Fallback (404) */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;