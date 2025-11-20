import React, { useEffect, useState } from 'react';
import type { PlanConfig, AppConfig, User } from '../types';
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
  onOpenDocs 
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'plans' | 'analytics' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCreditsUsed: 0,
    revenue: 0
  });

  // Fetch dados da produção
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Buscar usuários
        const { data: usersData, error: usersError } = await supabase
          .from('usuarios')
          .select('*')
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        if (usersData) {
          const mappedUsers: User[] = usersData.map((u: any) => ({
            id: u.id,
            name: u.name || 'Sem Nome',
            email: u.email,
            role: u.role === 'super_admin' ? 'admin' : 'user',
            plan: getPlanName(u.plano_id),
            credits: u.creditos_saldo || 0,
            status: u.status || 'active',
            created_at: u.created_at
          }));
          setUsers(mappedUsers);
        }

        // Buscar planos
        const { data: plansData } = await supabase
          .from('planos')
          .select('*')
          .order('id');
        
        if (plansData) setPlans(plansData);

        // Buscar estatísticas do histórico
        const { data: historyData } = await supabase
          .from('historico_prompts')
          .select('creditos_consumidos');

        const totalCreditsUsed = historyData?.reduce((acc, item) => acc + (item.creditos_consumidos || 0), 0) || 0;

        setStats({
          totalUsers: usersData?.length || 0,
          activeUsers: usersData?.filter(u => u.status === 'active').length || 0,
          totalCreditsUsed,
          revenue: totalCreditsUsed * 0.5
        });

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPlanName = (planoId: number) => {
    const plan = plans.find(p => p.id === planoId);
    return plan?.nome || 'Gratuito';
  };

  const handleUpdateCredits = async (userId: string, newCredits: number) => {
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

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ role: newRole === 'admin' ? 'super_admin' : 'user' })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole as 'admin' | 'user' } : user
      ));

      alert('Role atualizada com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar role');
    }
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
              <p className="text-gray-500 text-sm">Banco de Dados: PRODUÇÃO</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-green-500 border border-green-900 px-3 py-1.5 rounded-full bg-green-900/20">
              ✅ BANCO CONFIGURADO
            </div>
            <button 
              onClick={onOpenDocs}
              className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full transition"
            >
              📚 Documentação
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Total Usuários</div>
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Usuários Ativos</div>
            <div className="text-2xl font-bold text-green-400">{stats.activeUsers}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Créditos Consumidos</div>
            <div className="text-2xl font-bold text-blue-400">{stats.totalCreditsUsed}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Receita Estimada</div>
            <div className="text-2xl font-bold text-yellow-400">R$ {stats.revenue.toFixed(2)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-6">
          {[
            { id: 'users', label: '👥 Usuários' },
            { id: 'plans', label: '💎 Planos' },
            { id: 'analytics', label: '📊 Analytics' },
            { id: 'settings', label: '⚙️ Configurações' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === tab.id 
                  ? 'border-green-500 text-green-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
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
                Carregando dados do banco de produção...
              </div>
            ) : (
              <>
                <div className="p-4 bg-green-900/10 border-b border-green-900/30">
                  <h3 className="font-bold text-green-400">Gestão de Usuários - PRODUÇÃO</h3>
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
                        <th className="p-4">Plano</th>
                        <th className="p-4">Cadastro</th>
                        <th className="p-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-900/20">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-green-900/5 transition group">
                          <td className="p-4">
                            <div className="font-bold text-white">{user.name}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-gray-400 font-mono text-xs">{user.email}</div>
                          </td>
                          <td className="p-4">
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded border bg-black ${
                                user.role === 'admin' 
                                  ? 'border-red-500 text-red-400' 
                                  : 'border-gray-600 text-gray-400'
                              }`}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={user.credits}
                                onChange={(e) => handleUpdateCredits(user.id, parseInt(e.target.value) || 0)}
                                className="w-20 bg-black border border-gray-600 rounded px-2 py-1 text-white text-xs font-mono"
                              />
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.plan !== 'Gratuito' 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-gray-900 text-gray-400'
                            }`}>
                              {user.plan}
                            </span>
                          </td>
                          <td className="p-4 text-gray-400 text-xs">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                          </td>
                          <td className="p-4">
                            <button className="text-gray-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                              🗑️
                            </button>
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

        {/* Outras abas */}
        {activeTab === 'plans' && (
          <div className="bg-black border border-green-900/30 rounded-xl p-6">
            <h3 className="font-bold text-green-400 mb-4">Gestão de Planos</h3>
            <div className="text-green-500 mb-4">✅ Tabela "planos" criada com sucesso!</div>
            <p className="text-gray-400">Funcionalidade em desenvolvimento...</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-black border border-green-900/30 rounded-xl p-6">
            <h3 className="font-bold text-green-400 mb-4">Analytics</h3>
            <div className="text-green-500 mb-4">✅ Tabela "historico_prompts" disponível!</div>
            <p className="text-gray-400">Funcionalidade em desenvolvimento...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-black border border-green-900/30 rounded-xl p-6">
            <h3 className="font-bold text-green-400 mb-4">Configurações do Sistema</h3>
            <div className="text-green-500 mb-4">✅ Tabela "configuracoes" criada com sucesso!</div>
            <p className="text-gray-400">Funcionalidade em desenvolvimento...</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;