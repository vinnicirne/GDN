import React, { useEffect, useState } from 'react';
import type { PlanConfig, AppConfig, User, SystemConfig } from '../types';
import { supabase } from '../services/supabase';
import { configService } from '../services/configService';

interface AdminDashboardProps {
  onBack: () => void;
  onOpenDocs: () => void;
  currentUserCredits: number;
  onUpdateUserCredits: (credits: number) => void;
  plans: PlanConfig[];
  onUpdatePlans: (plans: PlanConfig[]) => void;
  appConfig: AppConfig;
  onUpdateAppConfig: (config: AppConfig) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onBack, 
  onOpenDocs 
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'plans' | 'payments' | 'api' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(configService.getDefaultConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [testResults, setTestResults] = useState<{mercadoPago?: boolean, gemini?: boolean}>({});

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Buscar usuários
        const { data: usersData } = await supabase
          .from('usuarios')
          .select('*')
          .order('created_at', { ascending: false });

        if (usersData) {
          const mappedUsers: User[] = usersData.map((u: any) => ({
            id: u.id,
            name: u.name || 'Sem Nome',
            email: u.email,
            role: u.role === 'super_admin' ? 'admin' : 'user',
            plan: 'Gratuito',
            credits: u.creditos_saldo || 0,
            status: 'active',
            created_at: u.created_at
          }));
          setUsers(mappedUsers);
        }

        // Buscar configurações do sistema
        const config = await configService.getSystemConfig();
        if (config) {
          setSystemConfig(config);
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Salvar configurações
  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await configService.saveSystemConfig(systemConfig);
      alert('✅ Configurações salvas com sucesso!');
    } catch (error) {
      alert('❌ Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  // Testar Mercado Pago
  const testMercadoPago = async () => {
    try {
      setTestResults(prev => ({...prev, mercadoPago: undefined}));
      const result = await configService.testMercadoPago(systemConfig.mercadoPago);
      setTestResults(prev => ({...prev, mercadoPago: result}));
      alert('✅ Conexão com Mercado Pago estabelecida!');
    } catch (error: any) {
      setTestResults(prev => ({...prev, mercadoPago: false}));
      alert(`❌ Falha no Mercado Pago: ${error.message}`);
    }
  };

  // Testar Gemini
  const testGemini = async () => {
    try {
      setTestResults(prev => ({...prev, gemini: undefined}));
      const result = await configService.testGemini(systemConfig.gemini);
      setTestResults(prev => ({...prev, gemini: result}));
      alert('✅ Conexão com Gemini estabelecida!');
    } catch (error: any) {
      setTestResults(prev => ({...prev, gemini: false}));
      alert(`❌ Falha no Gemini: ${error.message}`);
    }
  };

  // Atualizar configurações
  const updateMercadoPagoConfig = (field: string, value: any) => {
    setSystemConfig(prev => ({
      ...prev,
      mercadoPago: {
        ...prev.mercadoPago,
        [field]: value
      }
    }));
  };

  const updateGeminiConfig = (field: string, value: any) => {
    setSystemConfig(prev => ({
      ...prev,
      gemini: {
        ...prev.gemini,
        [field]: value
      }
    }));
  };

  const updateAppConfig = (field: string, value: any) => {
    setSystemConfig(prev => ({
      ...prev,
      app: {
        ...prev.app,
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 text-gray-200 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-green-900/20 rounded-full transition text-gray-400 hover:text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
              <p className="text-gray-500 text-sm">Gestão completa do sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-green-500 border border-green-900 px-3 py-1.5 rounded-full bg-green-900/20">
              PRODUÇÃO
            </div>
            <button 
              onClick={onOpenDocs}
              className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full transition"
            >
              📚 Documentação
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-6 overflow-x-auto">
          {[
            { id: 'users', label: '👥 Usuários', icon: '👥' },
            { id: 'plans', label: '💎 Planos', icon: '💎' },
            { id: 'payments', label: '💰 Pagamentos', icon: '💰' },
            { id: 'api', label: '🔧 API', icon: '🔧' },
            { id: 'settings', label: '⚙️ Sistema', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-green-500 text-green-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content - Usuários */}
        {activeTab === 'users' && (
          <div className="bg-black border border-green-900/30 rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="text-center text-gray-500 py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                Carregando dados do banco...
              </div>
            ) : (
              <>
                <div className="p-4 bg-green-900/10 border-b border-green-900/30">
                  <h3 className="font-bold text-green-400">Gestão de Usuários</h3>
                  <p className="text-gray-400 text-sm">Total: {users.length} usuários</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-green-900/10 text-green-500 uppercase font-bold text-xs">
                      <tr>
                        <th className="p-4">Usuário</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Créditos</th>
                        <th className="p-4">Cadastro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-900/20">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-green-900/5 transition">
                          <td className="p-4 font-bold text-white">{user.name}</td>
                          <td className="p-4 text-gray-400 font-mono text-xs">{user.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.role === 'admin' 
                                ? 'bg-red-900/30 text-red-400' 
                                : 'bg-gray-900 text-gray-400'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-green-400 font-bold">{user.credits}</td>
                          <td className="p-4 text-gray-400 text-xs">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab Content - Pagamentos (Mercado Pago) */}
        {activeTab === 'payments' && (
          <div className="bg-black border border-green-900/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-green-400 text-xl">💰 Configurações de Pagamento</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={testMercadoPago}
                  disabled={!systemConfig.mercadoPago.accessToken}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition"
                >
                  {testResults.mercadoPago === undefined ? '🧪 Testar Conexão' : 
                   testResults.mercadoPago ? '✅ Conectado' : '❌ Testar Novamente'}
                </button>
                <div className={`w-3 h-3 rounded-full ${systemConfig.mercadoPago.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mercado Pago Config */}
              <div className="space-y-4">
                <h4 className="font-bold text-white border-b border-gray-800 pb-2">Mercado Pago</h4>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Access Token</label>
                  <input
                    type="password"
                    value={systemConfig.mercadoPago.accessToken}
                    onChange={(e) => updateMercadoPagoConfig('accessToken', e.target.value)}
                    placeholder="APP_USR-..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Public Key</label>
                  <input
                    type="text"
                    value={systemConfig.mercadoPago.publicKey}
                    onChange={(e) => updateMercadoPagoConfig('publicKey', e.target.value)}
                    placeholder="APP_USR-..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Webhook URL</label>
                  <input
                    type="text"
                    value={systemConfig.mercadoPago.webhookUrl}
                    onChange={(e) => updateMercadoPagoConfig('webhookUrl', e.target.value)}
                    placeholder="https://seusite.com/webhook/mp"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="mpEnabled"
                    checked={systemConfig.mercadoPago.enabled}
                    onChange={(e) => updateMercadoPagoConfig('enabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="mpEnabled" className="text-sm text-gray-300">
                    Habilitar Mercado Pago
                  </label>
                </div>
              </div>

              {/* Informações */}
              <div className="space-y-4">
                <h4 className="font-bold text-white border-b border-gray-800 pb-2">Informações</h4>
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                  <h5 className="font-bold text-blue-400 mb-2">📋 Configuração do Mercado Pago</h5>
                  <ul className="text-sm text-blue-300 space-y-1">
                    <li>• Acesse: <a href="https://www.mercadopago.com.br" target="_blank" className="underline">mercadopago.com.br</a></li>
                    <li>• Crie suas credenciais em "Desenvolvedores"</li>
                    <li>• Use credenciais de produção para ambiente real</li>
                    <li>• Configure o webhook para: {systemConfig.mercadoPago.webhookUrl || 'https://seusite.com/webhook/mp'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content - API (Gemini) */}
        {activeTab === 'api' && (
          <div className="bg-black border border-green-900/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-green-400 text-xl">🔧 Configurações de API</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={testGemini}
                  disabled={!systemConfig.gemini.apiKey}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition"
                >
                  {testResults.gemini === undefined ? '🧪 Testar Conexão' : 
                   testResults.gemini ? '✅ Conectado' : '❌ Testar Novamente'}
                </button>
                <div className={`w-3 h-3 rounded-full ${systemConfig.gemini.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gemini Config */}
              <div className="space-y-4">
                <h4 className="font-bold text-white border-b border-gray-800 pb-2">Google Gemini</h4>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">API Key</label>
                  <input
                    type="password"
                    value={systemConfig.gemini.apiKey}
                    onChange={(e) => updateGeminiConfig('apiKey', e.target.value)}
                    placeholder="AIza..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Modelo</label>
                    <select
                      value={systemConfig.gemini.model}
                      onChange={(e) => updateGeminiConfig('model', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                    >
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Temperature</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={systemConfig.gemini.temperature}
                      onChange={(e) => updateGeminiConfig('temperature', parseFloat(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="geminiEnabled"
                    checked={systemConfig.gemini.enabled}
                    onChange={(e) => updateGeminiConfig('enabled', e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="geminiEnabled" className="text-sm text-gray-300">
                    Habilitar Gemini API
                  </label>
                </div>
              </div>

              {/* Informações */}
              <div className="space-y-4">
                <h4 className="font-bold text-white border-b border-gray-800 pb-2">Informações</h4>
                <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
                  <h5 className="font-bold text-purple-400 mb-2">📋 Configuração do Gemini</h5>
                  <ul className="text-sm text-purple-300 space-y-1">
                    <li>• Acesse: <a href="https://aistudio.google.com" target="_blank" className="underline">Google AI Studio</a></li>
                    <li>• Crie uma API Key em "Get API Key"</li>
                    <li>• Temperature: controle de criatividade (0-1)</li>
                    <li>• Modelo: Gemini 2.0 Flash é mais rápido</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content - Configurações do Sistema */}
        {activeTab === 'settings' && (
          <div className="bg-black border border-green-900/30 rounded-xl p-6">
            <h3 className="font-bold text-green-400 text-xl mb-6">⚙️ Configurações do Sistema</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Configurações da Aplicação */}
              <div className="space-y-4">
                <h4 className="font-bold text-white border-b border-gray-800 pb-2">Aplicação</h4>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nome do Sistema</label>
                  <input
                    type="text"
                    value={systemConfig.app.appName}
                    onChange={(e) => updateAppConfig('appName', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email de Suporte</label>
                  <input
                    type="email"
                    value={systemConfig.app.supportEmail}
                    onChange={(e) => updateAppConfig('supportEmail', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">WhatsApp</label>
                  <input
                    type="text"
                    value={systemConfig.app.whatsappNumber}
                    onChange={(e) => updateAppConfig('whatsappNumber', e.target.value)}
                    placeholder="5511999999999"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 outline-none"
                  />
                </div>
              </div>

              {/* Ações do Sistema */}
              <div className="space-y-4">
                <h4 className="font-bold text-white border-b border-gray-800 pb-2">Ações</h4>
                
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <button
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 py-3 rounded-lg text-white font-medium transition"
                  >
                    {isSaving ? '💾 Salvando...' : '💾 Salvar Todas as Configurações'}
                  </button>

                  <button
                    onClick={() => setSystemConfig(configService.getDefaultConfig())}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 py-3 rounded-lg text-white font-medium transition"
                  >
                    🔄 Restaurar Padrões
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Isso irá reiniciar todas as configurações. Continuar?')) {
                        setSystemConfig(configService.getDefaultConfig());
                      }
                    }}
                    className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg text-white font-medium transition"
                  >
                    🗑️ Limpar Tudo
                  </button>
                </div>
              </div>
            </div>

            {/* Status do Sistema */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-bold text-white mb-3">📊 Status do Sistema</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-gray-800 rounded">
                  <div className="text-gray-400">Mercado Pago</div>
                  <div className={systemConfig.mercadoPago.enabled ? 'text-green-400 font-bold' : 'text-red-400'}>
                    {systemConfig.mercadoPago.enabled ? '✅ Ativo' : '❌ Inativo'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded">
                  <div className="text-gray-400">Gemini API</div>
                  <div className={systemConfig.gemini.enabled ? 'text-green-400 font-bold' : 'text-red-400'}>
                    {systemConfig.gemini.enabled ? '✅ Ativo' : '❌ Inativo'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded">
                  <div className="text-gray-400">Usuários</div>
                  <div className="text-blue-400 font-bold">{users.length}</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded">
                  <div className="text-gray-400">Configurações</div>
                  <div className="text-purple-400 font-bold">Salvas</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content - Planos (placeholder) */}
        {activeTab === 'plans' && (
          <div className="bg-black border border-green-900/30 rounded-xl p-6">
            <h3 className="font-bold text-green-400 mb-4">💎 Gestão de Planos</h3>
            <p className="text-gray-400">Funcionalidade em desenvolvimento...</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;