import React, { useEffect, useState } from 'react';
import type { PlanConfig, AppConfig, User, SystemConfig, MercadoPagoConfig, GeminiConfig } from '../types';
import { supabase } from '../services/supabase';

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
  onOpenDocs,
  currentUserCredits,
  onUpdateUserCredits,
  plans,
  onUpdatePlans,
  appConfig,
  onUpdateAppConfig 
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'plans' | 'analytics' | 'settings'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // ← ADICIONE ESTA LINHA
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    creditsConsumed: 0,
    estimatedRevenue: 0,
    totalTransactions: 0
  });

  // Configurações do sistema
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    mercadoPago: {
      accessToken: '',
      publicKey: '',
      webhookUrl: '',
      enabled: false
    },
    gemini: {
      apiKey: '',
      model: 'gemini-2.0-flash',
      maxTokens: 1000,
      temperature: 0.7,
      enabled: false
    },
    app: appConfig
  });

  // Gerar URL do webhook automaticamente
  const generateWebhookUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/webhook/mercadopago`;
    }
    return '';
  };

  // Buscar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Buscar usuários
        const { data: usersData, error: usersError } = await supabase
          .from('usuarios')
          .select('*')
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        // Buscar estatísticas de uso
        const { data: usageData, error: usageError } = await supabase
          .from('historico_prompts')
          .select('user_id, timestamp');

        // Buscar transações
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transacoes')
          .select('valor_pago, status');

        // Buscar configurações do sistema
        const { data: configData, error: configError } = await supabase
          .from('configuracoes')
          .select('chave, valor');

        if (!configError && configData) {
          const configMap: any = {};
          configData.forEach(item => {
            configMap[item.chave] = item.valor;
          });

          setSystemConfig({
            mercadoPago: configMap.mercadopago || systemConfig.mercadoPago,
            gemini: configMap.gemini || systemConfig.gemini,
            app: configMap.app || systemConfig.app
          });
        }

        if (usersData) {
          const mappedUsers: User[] = usersData.map((u: any) => ({
            id: u.id,
            name: u.name || 'Sem Nome',
            email: u.email,
            role: u.role === 'super_admin' ? 'admin' : 'user',
            plan: u.plan || 'Gratuito',
            credits: u.creditos_saldo,
            status: u.status || 'active',
            created_at: u.created_at
          }));
          
          setUsers(mappedUsers);

          // Calcular estatísticas
          const totalUsers = usersData.length;
          const activeUsers = usersData.filter((u: any) => u.status === 'active').length;
          const creditsConsumed = usageData?.length || 0;
          const totalTransactions = transactionsData?.length || 0;
          
          // Calcular receita estimada das transações aprovadas
          const estimatedRevenue = transactionsData
            ?.filter((t: any) => t.status === 'approved')
            .reduce((total: number, transaction: any) => total + (transaction.valor_pago || 0), 0) || 0;

          setStats({
            totalUsers,
            activeUsers,
            creditsConsumed,
            estimatedRevenue,
            totalTransactions
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [plans]);

  // Atualizar créditos do usuário
  const updateUserCredits = async (userId: string, newCredits: number) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ creditos_saldo: newCredits })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, credits: newCredits } : user
      ));

      alert('Créditos atualizados com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar créditos');
    }
  };

  /// Salvar configurações do sistema - VERSÃO CORRIGIDA
const saveSystemConfig = async () => {
  setIsSaving(true);
  console.log('🔄 Iniciando salvamento das configurações...');
  
  try {
    // Verificar se temos conexão com Supabase
    const { data: testData, error: testError } = await supabase
      .from('configuracoes')
      .select('chave')
      .limit(1);

    if (testError) {
      throw new Error(`Erro de conexão com Supabase: ${testError.message}`);
    }

    console.log('✅ Conexão com Supabase OK');

    // Preparar configurações para salvar
    const configsToSave = [
      { 
        chave: 'gemini', 
        valor: {
          ...systemConfig.gemini,
          // Garantir que valores numéricos sejam números
          maxTokens: Number(systemConfig.gemini.maxTokens) || 1000,
          temperature: Number(systemConfig.gemini.temperature) || 0.7
        }, 
        descricao: 'Configurações da API Gemini', 
        categoria: 'api' 
      },
      { 
        chave: 'mercadopago', 
        valor: {
          ...systemConfig.mercadoPago,
          webhookUrl: systemConfig.mercadoPago.webhookUrl || generateWebhookUrl(),
          // Garantir que enabled seja booleano
          enabled: Boolean(systemConfig.mercadoPago.enabled)
        }, 
        descricao: 'Configurações do MercadoPago', 
        categoria: 'pagamento' 
      },
      { 
        chave: 'app', 
        valor: {
          ...systemConfig.app,
          // Garantir campos obrigatórios
          appName: systemConfig.app.appName || 'Gerador de Notícias AI',
          supportEmail: systemConfig.app.supportEmail || '',
          whatsappNumber: systemConfig.app.whatsappNumber || '',
          contactMessage: systemConfig.app.contactMessage || ''
        }, 
        descricao: 'Configurações da Aplicação', 
        categoria: 'app' 
      }
    ];

    console.log('💾 Configurações a salvar:', configsToSave);

    // Salvar cada configuração individualmente com tratamento de erro
    const results = [];
    for (const config of configsToSave) {
      console.log(`📝 Salvando configuração: ${config.chave}`, config.valor);
      
      const { data, error } = await supabase
        .from('configuracoes')
        .upsert({
          chave: config.chave,
          valor: config.valor,
          descricao: config.descricao,
          categoria: config.categoria,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'chave',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error(`❌ Erro ao salvar ${config.chave}:`, error);
        throw new Error(`Erro ao salvar ${config.chave}: ${error.message}`);
      } else {
        console.log(`✅ ${config.chave} salvo com sucesso:`, data);
        results.push({ chave: config.chave, success: true });
      }
    }

    // Verificar se todas as configurações foram salvas
    if (results.length === configsToSave.length) {
      // Atualizar o appConfig no componente pai
      onUpdateAppConfig(systemConfig.app);
      
      console.log('✅ Todas as configurações salvas com sucesso!');
      alert('✅ Configurações salvas com sucesso!');
      
      // Recarregar as configurações do banco
      setTimeout(() => {
        window.location.reload(); // Ou recarregar dados via useEffect
      }, 1000);
    } else {
      throw new Error('Algumas configurações não foram salvas');
    }

  } catch (error: any) {
    console.error('❌ Erro completo ao salvar configurações:', error);
    alert(`❌ Erro ao salvar configurações: ${error.message}`);
  } finally {
    setIsSaving(false);
  }
};

  // Testar configuração do MercadoPago - VERSÃO ATUALIZADA
const testMercadoPagoConfig = async () => {
  if (!systemConfig.mercadoPago.accessToken) {
    alert('Por favor, configure o Access Token do MercadoPago primeiro');
    return;
  }

  try {
    setIsLoading(true);
    
    // Testar autenticação com a API do MercadoPago
    const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${systemConfig.mercadoPago.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      alert('✅ Credenciais do MercadoPago válidas! Conexão estabelecida com sucesso.');
    } else if (response.status === 401) {
      alert('❌ Access Token inválido ou expirado. Verifique suas credenciais.');
    } else {
      alert(`⚠️ Credenciais válidas, mas houve um erro na API: ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao testar MercadoPago:', error);
    alert('❌ Erro ao conectar com MercadoPago. Verifique sua conexão.');
  } finally {
    setIsLoading(false);
  }
};

  // Testar configuração do Gemini
  const testGeminiConfig = async () => {
    if (!systemConfig.gemini.apiKey) {
      alert('Por favor, configure a API Key do Gemini primeiro');
      return;
    }

    try {
      // Teste simples da API do Gemini
      const response = await fetch('https://generativelanguage.googleapis.com/v1/models', {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': systemConfig.gemini.apiKey
        }
      });

      if (response.ok) {
        alert('✅ Conexão com Gemini API estabelecida com sucesso!');
      } else {
        alert('❌ Erro ao conectar com Gemini API. Verifique sua API Key.');
      }
    } catch (error) {
      console.error('Erro ao testar Gemini:', error);
      alert('❌ Erro ao testar configuração do Gemini. Verifique a conexão.');
    }
  };

  // Testar webhook - VERSÃO MELHORADA
const testWebhook = async () => {
  const webhookUrl = systemConfig.mercadoPago.webhookUrl || generateWebhookUrl();
  
  if (!webhookUrl) {
    alert('URL do webhook não configurada');
    return;
  }

  try {
    setIsLoading(true);
    
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (response.ok) {
      alert('✅ Webhook está respondendo corretamente! Serviço online.');
    } else {
      alert(`❌ Webhook retornou erro: ${response.status} - ${JSON.stringify(result)}`);
    }
  } catch (error) {
    console.error('Erro ao testar webhook:', error);
    alert('❌ Erro ao testar webhook: Verifique se a URL está correta e acessível.');
  } finally {
    setIsLoading(false);
  }
};

  // Renderizar Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-black border border-green-900/30 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Usuários</h3>
          <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
        </div>
        
        <div className="bg-black border border-green-900/30 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Usuários Ativos</h3>
          <div className="text-2xl font-bold text-green-400">{stats.activeUsers}</div>
        </div>
        
        <div className="bg-black border border-green-900/30 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Créditos Usados</h3>
          <div className="text-2xl font-bold text-yellow-400">{stats.creditsConsumed}</div>
        </div>
        
        <div className="bg-black border border-green-900/30 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Transações</h3>
          <div className="text-2xl font-bold text-blue-400">{stats.totalTransactions}</div>
        </div>
        
        <div className="bg-black border border-green-900/30 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Receita Total</h3>
          <div className="text-2xl font-bold text-purple-400">
            R$ {stats.estimatedRevenue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Status das Integrações e Últimos Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-black border border-green-900/30 rounded-xl p-6">
          <h3 className="text-white text-lg font-bold mb-4">Status das Integrações</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Google Gemini</span>
              <span className={`px-2 py-1 rounded text-xs ${
                systemConfig.gemini.enabled && systemConfig.gemini.apiKey 
                  ? 'bg-green-900/30 text-green-400' 
                  : 'bg-red-900/30 text-red-400'
              }`}>
                {systemConfig.gemini.enabled && systemConfig.gemini.apiKey ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">MercadoPago</span>
              <span className={`px-2 py-1 rounded text-xs ${
                systemConfig.mercadoPago.enabled && systemConfig.mercadoPago.accessToken 
                  ? 'bg-green-900/30 text-green-400' 
                  : 'bg-red-900/30 text-red-400'
              }`}>
                {systemConfig.mercadoPago.enabled && systemConfig.mercadoPago.accessToken ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Webhook</span>
              <span className={`px-2 py-1 rounded text-xs ${
                systemConfig.mercadoPago.webhookUrl ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
              }`}>
                {systemConfig.mercadoPago.webhookUrl ? 'Configurado' : 'Não Configurado'}
              </span>
            </div>
          </div>
        </div>

        {/* Últimos Usuários */}
        <div className="bg-black border border-green-900/30 rounded-xl p-6">
          <h3 className="text-white text-lg font-bold mb-4">Últimos Usuários</h3>
          <div className="space-y-3">
            {users.slice(0, 3).map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-900/30 rounded-full flex items-center justify-center text-green-400 font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded text-xs ${
                    user.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                  }`}>
                    {user.status}
                  </div>
                  <div className="text-green-400 text-xs mt-1">{user.credits} créditos</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar Gestão de Usuários
  const renderUsersManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-white text-lg font-bold">Gestão de Usuários</h3>
        <div className="text-gray-400 text-sm">
          Total: {users.length} usuários
        </div>
      </div>

      <div className="bg-black border border-green-900/50 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-green-900/10 text-green-500 uppercase font-bold text-xs">
            <tr>
              <th className="p-4">Usuário</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Créditos</th>
              <th className="p-4">Plano</th>
              <th className="p-4">Status</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-900/20">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-green-900/5 transition">
                <td className="p-4 font-bold text-white">{user.name}</td>
                <td className="p-4 text-gray-400 font-mono text-xs">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.role === 'admin' ? 'bg-red-900/30 text-red-400' : 'bg-gray-900 text-gray-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-green-400 font-bold">{user.credits}</span>
                    <button 
                      onClick={() => {
                        const newCredits = prompt(`Novos créditos para ${user.name}:`, user.credits.toString());
                        if (newCredits && !isNaN(Number(newCredits))) {
                          updateUserCredits(user.id, Number(newCredits));
                        }
                      }}
                      className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded hover:bg-blue-900/50 transition"
                    >
                      Editar
                    </button>
                  </div>
                </td>
                <td className="p-4 text-gray-300">{user.plan}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => {
                      alert(`Ações para usuário: ${user.name}`);
                    }}
                    className="text-xs bg-gray-900 text-gray-400 px-2 py-1 rounded hover:bg-gray-800 transition"
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Renderizar Configurações
  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-white text-lg font-bold">Configurações do Sistema</h3>
      
      {/* Configurações da Aplicação */}
      <div className="bg-black border border-green-900/30 rounded-xl p-6 space-y-6">
        <h4 className="text-green-400 font-bold">Configurações da Aplicação</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Nome do Sistema
            </label>
            <input
              type="text"
              value={systemConfig.app.appName}
              onChange={(e) => setSystemConfig({
                ...systemConfig,
                app: { ...systemConfig.app, appName: e.target.value }
              })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Email de Suporte
            </label>
            <input
              type="email"
              value={systemConfig.app.supportEmail}
              onChange={(e) => setSystemConfig({
                ...systemConfig,
                app: { ...systemConfig.app, supportEmail: e.target.value }
              })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              WhatsApp
            </label>
            <input
              type="text"
              value={systemConfig.app.whatsappNumber}
              onChange={(e) => setSystemConfig({
                ...systemConfig,
                app: { ...systemConfig.app, whatsappNumber: e.target.value }
              })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
              placeholder="5511999999999"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Mensagem de Contato
            </label>
            <input
              type="text"
              value={systemConfig.app.contactMessage}
              onChange={(e) => setSystemConfig({
                ...systemConfig,
                app: { ...systemConfig.app, contactMessage: e.target.value }
              })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Configurações do Gemini */}
      <div className="bg-black border border-green-900/30 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-green-400 font-bold">Google Gemini API</h4>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={systemConfig.gemini.enabled}
                onChange={(e) => setSystemConfig({
                  ...systemConfig,
                  gemini: { ...systemConfig.gemini, enabled: e.target.checked }
                })}
              />
              <div className={`block w-14 h-8 rounded-full ${
                systemConfig.gemini.enabled ? 'bg-green-900' : 'bg-gray-700'
              }`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                systemConfig.gemini.enabled ? 'transform translate-x-6' : ''
              }`}></div>
            </div>
            <div className="ml-3 text-gray-400 font-medium">
              {systemConfig.gemini.enabled ? 'Ativo' : 'Inativo'}
            </div>
          </label>
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            API Key do Gemini
          </label>
          <input
            type="password"
            value={systemConfig.gemini.apiKey}
            onChange={(e) => setSystemConfig({
              ...systemConfig,
              gemini: { ...systemConfig.gemini, apiKey: e.target.value }
            })}
            placeholder="Digite sua API Key do Google Gemini"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500 font-mono text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Modelo
            </label>
            <select
              value={systemConfig.gemini.model}
              onChange={(e) => setSystemConfig({
                ...systemConfig,
                gemini: { ...systemConfig.gemini, model: e.target.value }
              })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Temperature: {systemConfig.gemini.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={systemConfig.gemini.temperature}
              onChange={(e) => setSystemConfig({
                ...systemConfig,
                gemini: { ...systemConfig.gemini, temperature: parseFloat(e.target.value) }
              })}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={testGeminiConfig}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Testar Conexão
          </button>
        </div>
      </div>

      {/* Configurações do MercadoPago */}
      <div className="bg-black border border-green-900/30 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-green-400 font-bold">MercadoPago</h4>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={systemConfig.mercadoPago.enabled}
                onChange={(e) => setSystemConfig({
                  ...systemConfig,
                  mercadoPago: { ...systemConfig.mercadoPago, enabled: e.target.checked }
                })}
              />
              <div className={`block w-14 h-8 rounded-full ${
                systemConfig.mercadoPago.enabled ? 'bg-green-900' : 'bg-gray-700'
              }`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                systemConfig.mercadoPago.enabled ? 'transform translate-x-6' : ''
              }`}></div>
            </div>
            <div className="ml-3 text-gray-400 font-medium">
              {systemConfig.mercadoPago.enabled ? 'Ativo' : 'Inativo'}
            </div>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Access Token
            </label>
            <input
              type="password"
              value={systemConfig.mercadoPago.accessToken}
              onChange={(e) => setSystemConfig({
                ...systemConfig,
                mercadoPago: { ...systemConfig.mercadoPago, accessToken: e.target.value }
              })}
              placeholder="Digite seu Access Token"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500 font-mono text-sm"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Public Key
            </label>
            <input
              type="text"
              value={systemConfig.mercadoPago.publicKey}
              onChange={(e) => setSystemConfig({
                ...systemConfig,
                mercadoPago: { ...systemConfig.mercadoPago, publicKey: e.target.value }
              })}
              placeholder="Digite sua Public Key"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500 font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Webhook URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={systemConfig.mercadoPago.webhookUrl || generateWebhookUrl()}
              onChange={(e) => setSystemConfig({
                ...systemConfig,
                mercadoPago: { ...systemConfig.mercadoPago, webhookUrl: e.target.value }
              })}
              placeholder="https://seusite.com/api/webhook/mercadopago"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
            />
            <button
              onClick={() => {
                const url = generateWebhookUrl();
                setSystemConfig({
                  ...systemConfig,
                  mercadoPago: { ...systemConfig.mercadoPago, webhookUrl: url }
                });
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Auto
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(systemConfig.mercadoPago.webhookUrl || generateWebhookUrl());
                alert('URL copiada para a área de transferência!');
              }}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Copiar
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-1">
            Esta URL deve ser configurada no painel do MercadoPago
          </p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={testMercadoPagoConfig}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Testar Credenciais
          </button>
          <button 
            onClick={testWebhook}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Testar Webhook
          </button>
        </div>
      </div>

      {/* Botão Salvar */}
<div className="flex justify-end">
  <button 
    onClick={saveSystemConfig}
    disabled={isSaving}
    className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
  >
    {isSaving ? (
      <>
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        Salvando...
      </>
    ) : (
      <>
        <span>💾</span>
        Salvar Todas as Configurações
      </>
    )}
  </button>
</div>
  );
};

export default AdminDashboard;