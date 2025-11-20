
import React, { useEffect, useState } from 'react';
import type { PlanConfig, AppConfig } from '../types';

interface AnalyticsLog {
  theme: string;
  tone: string;
  success: boolean;
  latencyMs: number;
  timestamp: number;
  tokens?: number;
}

interface AuditLog {
  id: string;
  timestamp: string; // ISO Date
  adminName: string;
  userId: string;
  userName: string;
  action: 'ADD' | 'REMOVE';
  amount: number;
  reason: string;
  previousBalance: number;
  newBalance: number;
}

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

// --- MOCK DATA TYPES ---
interface User {
  id: string;
  name: string;
  email: string;
  plan: 'Gratuito' | 'Básico' | 'Pro' | 'Enterprise';
  credits: number;
  status: 'Active' | 'Churned' | 'Suspended';
  ltv: number; // Lifetime Value
  joinedAt: string;
}

const DEMO_USER_ID = 'USER-8392-DEMO';

// --- MOCK DATA (Baseado no texto do prompt) ---
const INITIAL_USERS: User[] = [
  { id: DEMO_USER_ID, name: 'Visitante Demo (Você)', email: 'usuario@exemplo.com', plan: 'Gratuito', credits: 3, status: 'Active', ltv: 0.00, joinedAt: '2023-11-25' },
  { id: 'USR-001', name: 'Admin Demo', email: 'admin@newsai.com', plan: 'Enterprise', credits: 999, status: 'Active', ltv: 1200.00, joinedAt: '2023-01-10' },
  { id: 'USR-082', name: 'João Silva', email: 'joao@email.com', plan: 'Gratuito', credits: 0, status: 'Active', ltv: 0.00, joinedAt: '2023-10-05' },
  { id: 'USR-193', name: 'Maria Garcia', email: 'maria.g@email.com', plan: 'Pro', credits: 45, status: 'Active', ltv: 89.70, joinedAt: '2023-09-15' },
  { id: 'USR-220', name: 'Tech Corp', email: 'contact@techcorp.com', plan: 'Enterprise', credits: 1200, status: 'Active', ltv: 5000.00, joinedAt: '2023-05-20' },
  { id: 'USR-331', name: 'Roberto Dev', email: 'roberto@dev.com', plan: 'Básico', credits: 10, status: 'Churned', ltv: 29.90, joinedAt: '2023-08-01' },
  { id: 'USR-442', name: 'Agência Vrum', email: 'hello@vrum.com', plan: 'Pro', credits: 12, status: 'Suspended', ltv: 150.00, joinedAt: '2023-07-12' },
];

// Mock initial Audit Logs
const INITIAL_AUDIT_LOGS: AuditLog[] = [
    {
        id: 'log-1',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        adminName: 'System',
        userId: DEMO_USER_ID,
        userName: 'Visitante Demo (Você)',
        action: 'ADD',
        amount: 3,
        reason: 'Renovação Diária Automática',
        previousBalance: 0,
        newBalance: 3
    }
];

// --- ICONS ---
const MoneyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onOpenDocs, currentUserCredits, onUpdateUserCredits, plans, onUpdatePlans, appConfig, onUpdateAppConfig }) => {
  const [activeTab, setActiveTab] = useState<'bi' | 'plans' | 'users' | 'settings' | 'branding'>('bi');
  
  // Initialize users from local storage or default
  const [users, setUsers] = useState<User[]>(() => {
      try {
        const stored = localStorage.getItem('news_app_users');
        return stored ? JSON.parse(stored) : INITIAL_USERS;
      } catch {
        return INITIAL_USERS;
      }
  });
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [userSearch, setUserSearch] = useState('');

  // --- STATES FOR ADD/EDIT USER MODAL ---
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // --- STATES FOR ADD PLAN MODAL ---
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    name: '',
    price: 0,
    credits: 30,
    recurrence: 'Mensal' as 'Mensal' | 'Anual',
    featuresRaw: ''
  });

  // --- STATES FOR EDIT PLAN MODAL ---
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);
  
  // Manual Adjustment States
  const [adjustmentDelta, setAdjustmentDelta] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');

  // Config Form State
  const [configForm, setConfigForm] = useState<AppConfig>(appConfig);

  useEffect(() => {
      setConfigForm(appConfig);
  }, [appConfig]);

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    plan: 'Gratuito' as User['plan'],
    credits: 3
  });

  // Sync with Local Storage
  useEffect(() => {
    localStorage.setItem('news_app_users', JSON.stringify(users));
  }, [users]);

  // --- SYNC CURRENT USER WITH APP STATE ---
  useEffect(() => {
    setUsers(prev => prev.map(u => {
        if (u.id === DEMO_USER_ID) {
            return { ...u, credits: currentUserCredits };
        }
        return u;
    }));
  }, [currentUserCredits]);

  // --- BI METRICS (Hardcoded from Prompt for Demo Fidelity) ---
  const kpiData = {
    mrr: { value: 12500.00, delta: 8.5, action: "Focar em estabilizar a taxa de Churn." },
    totalUsers: { value: 1850, delta: 6.9, deltaNum: 120, action: "Considere um plano de incentivo para upgrades." },
    activeUsers: { value: 1150, delta: -2.1, action: "Analisar o Gráfico de Churn para entender a queda." },
    churnRate: { value: 5.5, delta: 1.2, action: "Rever a comunicação de valor após o 1º mês." }
  };

  // --- WATERFALL DATA (Simulated Logic) ---
  const waterfallData = {
    start: 11520, // MRR Anterior aprox
    add: 1605,    // Vendas/Upgrades
    less: 625,    // Churn/Downgrades
    end: 12500    // MRR Atual
  };

  // Clear adjustment form when opening a user
  useEffect(() => {
      setAdjustmentDelta(0);
      setAdjustmentReason('');
  }, [editingUser]);

  const handleAddUser = (e: React.FormEvent) => {
      e.preventDefault();
      // Generate a temp password for the new user
      const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();
      
      const newUser: User = {
          id: `USR-${Math.floor(Math.random() * 10000)}`,
          name: newUserForm.name,
          email: newUserForm.email,
          plan: newUserForm.plan,
          credits: newUserForm.credits,
          status: 'Active',
          ltv: 0,
          joinedAt: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
      setIsAddUserModalOpen(false);
      setNewUserForm({ name: '', email: '', plan: 'Gratuito', credits: 3 });
      
      // Simulate Email / Password delivery
      alert(`✅ Usuário Criado com Sucesso!\n\n🔑 Senha Temporária Gerada: ${tempPassword}\n\n📧 Um link de "Redefinição de Senha" foi enviado para ${newUser.email}.\n\n⚠️ O usuário será obrigado a alterar esta senha no primeiro acesso.`);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    // Only updates basic info here. Credits are handled separately via audit.
    setUsers(prevUsers => prevUsers.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
  };

  const handleResetPassword = () => {
    if (!editingUser) return;
    const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();
    alert(`Senha redefinida para o usuário ${editingUser.name}.\n\nNova Senha Temporária: ${tempPassword}\n\nEmail de notificação enviado para ${editingUser.email}.`);
  };

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: PlanConfig = {
      id: `p_${Date.now()}`,
      name: newPlanForm.name,
      price: newPlanForm.price,
      credits: newPlanForm.credits,
      recurrence: newPlanForm.recurrence,
      features: newPlanForm.featuresRaw.split(',').map(f => f.trim()).filter(Boolean),
      active: true
    };

    onUpdatePlans([...plans, newPlan]);
    setIsAddPlanModalOpen(false);
    setNewPlanForm({ name: '', price: 0, credits: 30, recurrence: 'Mensal', featuresRaw: '' });
    alert('Novo plano criado com sucesso!');
  };

  const handleUpdatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    onUpdatePlans(plans.map(p => p.id === editingPlan.id ? editingPlan : p));
    setEditingPlan(null);
    alert('Plano atualizado com sucesso!');
  };

  const confirmCreditAdjustment = () => {
      if (!editingUser) return;
      if (adjustmentDelta === 0) {
          alert("A quantidade a adicionar/remover não pode ser zero.");
          return;
      }
      if (!adjustmentReason.trim()) {
          alert("É obrigatório informar o Motivo da alteração para fins de auditoria.");
          return;
      }

      const previousBalance = editingUser.credits;
      const newBalance = Math.max(0, previousBalance + adjustmentDelta);
      
      // Update User State
      const updatedUser = { ...editingUser, credits: newBalance };
      setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      setEditingUser(updatedUser); // Update modal view

      // If it's the demo user, sync with app
      if (editingUser.id === DEMO_USER_ID) {
          onUpdateUserCredits(newBalance);
      }

      // Create Audit Log
      const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          adminName: 'Admin (Você)',
          userId: editingUser.id,
          userName: editingUser.name,
          action: adjustmentDelta > 0 ? 'ADD' : 'REMOVE',
          amount: Math.abs(adjustmentDelta),
          reason: adjustmentReason,
          previousBalance,
          newBalance
      };

      setAuditLogs([newLog, ...auditLogs]);
      
      // Reset form
      setAdjustmentDelta(0);
      setAdjustmentReason('');
      alert(`Sucesso: Saldo atualizado de ${previousBalance} para ${newBalance}.`);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAppConfig(configForm);
    alert("Configurações de White Label salvas com sucesso!");
  };

  const renderBIPanel = () => (
    <div className="space-y-8 animate-fade-in">
      {/* 1. CENTRAL DE COMANDO (TOP KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="bg-black border border-green-900/50 p-5 rounded-xl hover:border-green-500/50 transition group relative overflow-hidden shadow-lg shadow-green-900/20">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative">
             <div className="p-2 bg-green-900/30 rounded-lg text-green-400 border border-green-800/50">
               <MoneyIcon />
             </div>
             <span className="text-xs font-bold bg-green-900/40 text-green-400 px-2 py-1 rounded border border-green-800 flex items-center gap-1">
               ▲ {kpiData.mrr.delta}%
             </span>
          </div>
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">MRR (Receita Recorrente)</p>
          <h3 className="text-3xl font-bold text-white">R$ {kpiData.mrr.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          <div className="mt-3 pt-3 border-t border-green-900/30">
            <p className="text-[10px] text-green-500/80 flex items-center gap-1 font-mono">
               <ActivityIcon /> {kpiData.mrr.action}
            </p>
          </div>
        </div>

        {/* Total Users Card */}
        <div className="bg-black border border-green-900/50 p-5 rounded-xl hover:border-green-500/50 transition group relative overflow-hidden">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-green-900/30 rounded-lg text-green-400 border border-green-800/50">
               <UsersIcon />
             </div>
             <span className="text-xs font-bold bg-green-900/40 text-green-400 px-2 py-1 rounded border border-green-800 flex items-center gap-1">
               ▲ {kpiData.totalUsers.deltaNum} ({kpiData.totalUsers.delta}%)
             </span>
          </div>
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Total de Usuários</p>
          <h3 className="text-3xl font-bold text-white">{kpiData.totalUsers.value.toLocaleString('pt-BR')}</h3>
          <div className="mt-3 pt-3 border-t border-green-900/30">
            <p className="text-[10px] text-green-500/80 flex items-center gap-1 font-mono">
               <TrendingUpIcon /> {kpiData.totalUsers.action}
            </p>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="bg-black border border-green-900/50 p-5 rounded-xl hover:border-green-500/50 transition group relative overflow-hidden">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-green-900/30 rounded-lg text-green-400 border border-green-800/50">
               <ActivityIcon />
             </div>
             <span className="text-xs font-bold bg-red-900/20 text-red-400 px-2 py-1 rounded border border-red-900/50 flex items-center gap-1">
               ▼ {Math.abs(kpiData.activeUsers.delta)}%
             </span>
          </div>
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Usuários Ativos (30d)</p>
          <h3 className="text-3xl font-bold text-white">{kpiData.activeUsers.value.toLocaleString('pt-BR')}</h3>
          <div className="mt-3 pt-3 border-t border-green-900/30">
            <p className="text-[10px] text-green-500/80 flex items-center gap-1 font-mono">
               <AlertIcon /> {kpiData.activeUsers.action}
            </p>
          </div>
        </div>

        {/* Churn Rate Card */}
         <div className="bg-black border border-green-900/50 p-5 rounded-xl hover:border-green-500/50 transition group relative overflow-hidden">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-green-900/30 rounded-lg text-green-400 border border-green-800/50">
               <AlertIcon />
             </div>
             <span className="text-xs font-bold bg-red-900/20 text-red-400 px-2 py-1 rounded border border-red-900/50 flex items-center gap-1">
               ▲ {kpiData.churnRate.delta} p.p.
             </span>
          </div>
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Churn Rate</p>
          <h3 className="text-3xl font-bold text-white">{kpiData.churnRate.value}%</h3>
          <div className="mt-3 pt-3 border-t border-green-900/30">
            <p className="text-[10px] text-red-400/80 flex items-center gap-1 font-mono">
               <AlertIcon /> {kpiData.churnRate.action}
            </p>
          </div>
        </div>
      </div>

      {/* 2. GRÁFICOS PREDITIVOS E WATERFALL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* A. REVENUE WATERFALL */}
          <div className="lg:col-span-2 bg-black border border-green-900/50 rounded-xl p-6 relative">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
             <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Revenue Waterfall
                    </h3>
                    <p className="text-xs text-gray-500">Fluxo de receita detalhado (Mês Corrente)</p>
                </div>
             </div>

             {/* CSS Chart Implementation */}
             <div className="h-64 w-full flex items-end justify-between gap-4 px-4 pb-4 border-b border-green-900/30 relative z-10">
                {/* Initial */}
                <div className="flex flex-col items-center gap-2 w-full">
                    <span className="text-xs text-gray-400 font-mono">R${waterfallData.start}</span>
                    <div className="w-full bg-gray-800 border border-gray-700 rounded-t hover:opacity-80 transition relative group" style={{ height: '60%' }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Início</span>
                </div>
                {/* Gains */}
                <div className="flex flex-col items-center gap-2 w-full">
                    <span className="text-xs text-green-400 font-mono">+R${waterfallData.add}</span>
                    <div className="w-full bg-green-600 border border-green-400/50 rounded-t hover:opacity-80 transition relative group mb-[60%] shadow-[0_0_15px_rgba(34,197,94,0.2)]" style={{ height: '15%' }}>
                    </div>
                    <span className="text-[10px] text-green-500 uppercase font-bold tracking-wider">Vendas</span>
                </div>
                 {/* Losses */}
                 <div className="flex flex-col items-center gap-2 w-full">
                    <span className="text-xs text-red-400 font-mono">-R${waterfallData.less}</span>
                    <div className="w-full bg-red-900/80 border border-red-700 rounded-b hover:opacity-80 transition relative group mt-[-25%]" style={{ height: '8%' }}>
                    </div>
                    <span className="text-[10px] text-red-500 uppercase font-bold tracking-wider">Churn</span>
                </div>
                 {/* Final */}
                 <div className="flex flex-col items-center gap-2 w-full">
                    <span className="text-xs text-green-400 font-mono font-bold">R${waterfallData.end}</span>
                    <div className="w-full bg-green-500 rounded-t hover:opacity-80 transition relative group shadow-[0_0_20px_rgba(34,197,94,0.4)]" style={{ height: '67%' }}>
                         <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                    <span className="text-[10px] text-green-400 uppercase font-bold tracking-wider">Final</span>
                </div>
             </div>
          </div>

          {/* B. CONSUMO DE CRÉDITOS & METAS */}
          <div className="space-y-6">
             {/* Metas */}
             <div className="bg-black border border-green-900/50 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-600/10 to-transparent rounded-bl-full"></div>
                <h3 className="text-lg font-bold text-white mb-2">4. Metas de Crescimento</h3>
                <p className="text-xs text-gray-500 mb-4">Projeção para R$ 14.000,00 (Próximo Mês)</p>
                
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-bold text-white">89%</span>
                    <span className="text-xs text-gray-400 mb-1">da meta atingida</span>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-2 mb-4 border border-gray-800">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-400 h-2 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ width: `89%` }}></div>
                </div>
                <div className="bg-gray-900/50 rounded p-3 border border-green-900/30">
                    <p className="text-xs text-gray-400">🎯 Você precisa de <strong className="text-green-400">50 novas assinaturas PRO</strong> para bater a meta.</p>
                </div>
             </div>

             {/* Consumo por Plano */}
             <div className="bg-black border border-green-900/50 rounded-xl p-6">
                 <h3 className="text-lg font-bold text-white mb-4">📊 Consumo de Créditos</h3>
                 <div className="space-y-4">
                    {/* Gratuito */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Plano Gratuito</span>
                            <span className="text-amber-500 font-bold">100% (Crítico)</span>
                        </div>
                        <div className="w-full bg-gray-900 h-2 rounded-full border border-gray-800">
                            <div className="h-2 rounded-full bg-amber-500" style={{ width: '100%' }}></div>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-1">Usuários esgotando limite diariamente.</p>
                    </div>
                    {/* Pro */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Plano PRO</span>
                            <span className="text-green-500">95% (Saudável)</span>
                        </div>
                        <div className="w-full bg-gray-900 h-2 rounded-full border border-gray-800">
                            <div className="h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" style={{ width: '95%' }}></div>
                        </div>
                    </div>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );

  const renderPlansPanel = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-black border border-green-900/50 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
             <div>
                 <h2 className="text-xl font-bold text-white">3. Gestão de Planos & Precificação</h2>
                 <p className="text-gray-400 text-sm">Controle total sobre produtos no Mercado Pago e funcionalidades.</p>
             </div>
             <button 
                onClick={() => alert("Integração Mercado Pago: Sincronizando produtos...")}
                className="text-xs bg-green-900/20 text-green-400 border border-green-800 hover:bg-green-900/40 px-4 py-2 rounded transition flex items-center gap-2 font-mono"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                SYNC_MERCADOPAGO_DB
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {plans.map(plan => (
                  <div key={plan.id} className={`border rounded-xl p-6 relative group transition-all ${plan.active ? 'bg-green-900/10 border-green-800 hover:border-green-500' : 'bg-gray-900/20 border-gray-800 opacity-60'}`}>
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                              <p className="text-xs text-gray-500 uppercase">{plan.recurrence}</p>
                          </div>
                          <div className="text-right">
                              {plan.price < 0 ? (
                                <div className="text-sm font-bold text-gray-400">Sob Consulta</div>
                              ) : (
                                <div className="text-xl font-bold text-green-400">R$ {plan.price.toFixed(2)}</div>
                              )}
                          </div>
                      </div>
                      
                      <ul className="space-y-2 mb-6">
                          <li className="text-sm text-gray-300 flex items-center gap-2">
                              <span className="text-green-500">⚡</span> {plan.credits >= 500 ? '500+ Créditos' : `${plan.credits} Créditos`}
                          </li>
                          {plan.features.map((feat, i) => (
                              <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                                  <span className="text-green-700">✓</span> {feat}
                              </li>
                          ))}
                      </ul>

                      <div className="flex gap-2">
                          <button 
                              onClick={() => setEditingPlan(plan)}
                              className="flex-1 bg-green-900/30 hover:bg-green-900/50 text-green-300 border border-green-800 hover:border-green-600 text-xs py-2 rounded font-bold transition"
                          >
                              Editar Plano
                          </button>
                          <button className="px-3 py-2 border border-gray-800 rounded text-gray-500 hover:text-green-400 hover:border-green-600 transition">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                          </button>
                      </div>
                  </div>
              ))}
              
              {/* Add New Plan */}
              <button 
                  onClick={() => setIsAddPlanModalOpen(true)}
                  className="border-2 border-dashed border-green-900/40 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-green-600 hover:bg-green-900/10 transition group text-gray-600 hover:text-green-400"
              >
                  <div className="w-12 h-12 rounded-full bg-gray-900 group-hover:bg-green-900/30 flex items-center justify-center transition border border-gray-800 group-hover:border-green-700">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                  </div>
                  <span className="font-bold text-sm">Criar Novo Plano</span>
              </button>
          </div>
       </div>
       
       {/* --- MODAL DE ADICIONAR PLANO (UPDATED SIZE) --- */}
       {isAddPlanModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-black border border-green-500 rounded-xl w-full max-w-sm shadow-[0_0_30px_rgba(34,197,94,0.2)] relative">
                <button 
                   onClick={() => setIsAddPlanModalOpen(false)}
                   className="absolute top-4 right-4 text-gray-500 hover:text-green-400 transition"
                >
                   ✕
                </button>
                
                <div className="p-5 border-b border-green-900/50">
                   <h3 className="text-lg font-bold text-white">Criar Novo Plano</h3>
                   <p className="text-xs text-green-600 font-mono">Definir nova estratégia de precificação.</p>
                </div>

                <form onSubmit={handleAddPlan} className="p-5 space-y-3">
                   <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Nome do Plano</label>
                      <input 
                         type="text" 
                         required
                         value={newPlanForm.name}
                         onChange={e => setNewPlanForm({...newPlanForm, name: e.target.value})}
                         className="w-full bg-gray-900 border border-green-900/50 rounded p-2 text-gray-200 focus:border-green-500 outline-none text-sm transition"
                         placeholder="Ex: Ultra Pro"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Preço (R$)</label>
                          <input 
                             type="number"
                             step="0.01" 
                             required
                             value={newPlanForm.price}
                             onChange={e => setNewPlanForm({...newPlanForm, price: parseFloat(e.target.value)})}
                             className="w-full bg-gray-900 border border-green-900/50 rounded p-2 text-gray-200 focus:border-green-500 outline-none text-sm transition"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Créditos</label>
                          <input 
                             type="number" 
                             required
                             value={newPlanForm.credits}
                             onChange={e => setNewPlanForm({...newPlanForm, credits: parseInt(e.target.value)})}
                             className="w-full bg-gray-900 border border-green-900/50 rounded p-2 text-gray-200 focus:border-green-500 outline-none text-sm transition"
                          />
                       </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Recorrência</label>
                      <select 
                         value={newPlanForm.recurrence}
                         onChange={e => setNewPlanForm({...newPlanForm, recurrence: e.target.value as 'Mensal' | 'Anual'})}
                         className="w-full bg-gray-900 border border-green-900/50 rounded p-2 text-gray-200 focus:border-green-500 outline-none text-sm transition"
                      >
                         <option value="Mensal">Mensal</option>
                         <option value="Anual">Anual</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Features (separar por vírgula)</label>
                      <textarea 
                         rows={3}
                         value={newPlanForm.featuresRaw}
                         onChange={e => setNewPlanForm({...newPlanForm, featuresRaw: e.target.value})}
                         className="w-full bg-gray-900 border border-green-900/50 rounded p-2 text-gray-200 focus:border-green-500 outline-none text-sm transition resize-none"
                         placeholder="Ex: Suporte VIP, Acesso à API, Sem anúncios"
                      />
                   </div>

                   <div className="pt-4 flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setIsAddPlanModalOpen(false)}
                        className="flex-1 bg-gray-900 text-gray-400 py-2 rounded border border-gray-800 hover:bg-gray-800 transition text-sm font-bold"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 bg-green-600 text-black py-2 rounded border border-green-500 hover:bg-green-500 transition text-sm font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                      >
                        Criar Plano
                      </button>
                   </div>
                </form>
            </div>
         </div>
       )}

       {/* --- MODAL DE EDITAR PLANO (UPDATED SIZE) --- */}
       {editingPlan && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            {/* Reduced size to max-w-sm */}
            <div className="bg-black border border-green-500 rounded-xl w-full max-w-sm shadow-[0_0_30px_rgba(34,197,94,0.2)] relative">
                <button 
                   onClick={() => setEditingPlan(null)}
                   className="absolute top-3 right-3 text-gray-500 hover:text-green-400 transition"
                >
                   ✕
                </button>
                
                <div className="p-4 border-b border-green-900/50">
                   <h3 className="text-lg font-bold text-white">Editar Plano</h3>
                   <p className="text-[10px] text-green-600 font-mono">ID: {editingPlan.id}</p>
                </div>

                <form onSubmit={handleUpdatePlan} className="p-4 space-y-3">
                   <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Nome do Plano</label>
                      <input 
                         type="text" 
                         required
                         value={editingPlan.name}
                         onChange={e => setEditingPlan({...editingPlan, name: e.target.value})}
                         className="w-full bg-gray-900 border border-green-900/50 rounded p-1.5 text-gray-200 focus:border-green-500 outline-none text-xs transition"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                       <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Preço (R$)</label>
                          <input 
                             type="number"
                             step="0.01" 
                             required
                             value={editingPlan.price}
                             onChange={e => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})}
                             className="w-full bg-gray-900 border border-green-900/50 rounded p-1.5 text-gray-200 focus:border-green-500 outline-none text-xs transition"
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Créditos</label>
                          <input 
                             type="number" 
                             required
                             value={editingPlan.credits}
                             onChange={e => setEditingPlan({...editingPlan, credits: parseInt(e.target.value)})}
                             className="w-full bg-gray-900 border border-green-900/50 rounded p-1.5 text-gray-200 focus:border-green-500 outline-none text-xs transition"
                          />
                       </div>
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Recorrência</label>
                      <select 
                         value={editingPlan.recurrence}
                         onChange={e => setEditingPlan({...editingPlan, recurrence: e.target.value as 'Mensal' | 'Anual'})}
                         className="w-full bg-gray-900 border border-green-900/50 rounded p-1.5 text-gray-200 focus:border-green-500 outline-none text-xs transition"
                      >
                         <option value="Mensal">Mensal</option>
                         <option value="Anual">Anual</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Features (separar por vírgula)</label>
                      <textarea 
                         rows={3}
                         value={editingPlan.features.join(', ')}
                         onChange={e => setEditingPlan({...editingPlan, features: e.target.value.split(',').map(f => f.trim())})}
                         className="w-full bg-gray-900 border border-green-900/50 rounded p-1.5 text-gray-200 focus:border-green-500 outline-none text-xs transition resize-none"
                      />
                   </div>
                   
                   <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Status</label>
                        <div className="flex items-center gap-2">
                            <button 
                                type="button"
                                onClick={() => setEditingPlan({...editingPlan, active: !editingPlan.active})}
                                className={`w-8 h-4 rounded-full p-0.5 transition ${editingPlan.active ? 'bg-green-600' : 'bg-gray-700'}`}
                            >
                                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition ${editingPlan.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </button>
                            <span className={`text-xs ${editingPlan.active ? 'text-green-400' : 'text-gray-500'}`}>{editingPlan.active ? 'Ativo' : 'Inativo'}</span>
                        </div>
                   </div>
                   
                   <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Destaque (Recomendado)</label>
                        <div className="flex items-center gap-2">
                            <button 
                                type="button"
                                onClick={() => setEditingPlan({...editingPlan, recommended: !editingPlan.recommended})}
                                className={`w-8 h-4 rounded-full p-0.5 transition ${editingPlan.recommended ? 'bg-green-600' : 'bg-gray-700'}`}
                            >
                                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition ${editingPlan.recommended ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </button>
                            <span className={`text-xs ${editingPlan.recommended ? 'text-green-400' : 'text-gray-500'}`}>{editingPlan.recommended ? 'Sim' : 'Não'}</span>
                        </div>
                   </div>

                   <div className="pt-4 flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setEditingPlan(null)}
                        className="flex-1 bg-gray-900 text-gray-400 py-2 rounded border border-gray-800 hover:bg-gray-800 transition text-xs font-bold"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 bg-green-600 text-black py-2 rounded border border-green-500 hover:bg-green-500 transition text-xs font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                      >
                        Salvar
                      </button>
                   </div>
                </form>
            </div>
         </div>
       )}
    </div>
  );

  const renderUsersPanel = () => {
    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
    
    return (
      <div className="space-y-6 animate-fade-in">
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-white">Gestão de Usuários</h2>
            <div className="flex gap-3 w-full md:w-auto">
               <input 
                  type="text" 
                  placeholder="Buscar usuário..." 
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="bg-gray-900 border border-green-900/50 rounded px-4 py-2 text-sm text-gray-200 outline-none focus:border-green-500 w-full"
               />
               <button 
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="bg-green-600 text-black font-bold px-4 py-2 rounded text-sm hover:bg-green-500 whitespace-nowrap"
               >
                  + Novo Usuário
               </button>
            </div>
         </div>
         
         <div className="bg-black border border-green-900/50 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-green-900/10 text-green-500 uppercase font-bold text-xs">
                  <tr>
                     <th className="p-4">Usuário</th>
                     <th className="p-4 hidden sm:table-cell">Plano</th>
                     <th className="p-4">Créditos</th>
                     <th className="p-4 hidden md:table-cell">Status</th>
                     <th className="p-4 text-right">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-green-900/20">
                  {filteredUsers.map(user => (
                     <tr key={user.id} className="hover:bg-green-900/5 transition">
                        <td className="p-4">
                           <div className="font-bold text-white">{user.name}</div>
                           <div className="text-gray-500 text-xs">{user.email}</div>
                        </td>
                        <td className="p-4 hidden sm:table-cell text-gray-300">
                           <span className={`px-2 py-0.5 rounded border text-xs ${user.plan === 'Pro' || user.plan === 'Enterprise' ? 'border-green-800 bg-green-900/20 text-green-400' : 'border-gray-800 bg-gray-900/50'}`}>
                              {user.plan}
                           </span>
                        </td>
                        <td className="p-4 font-mono text-white">{user.credits}</td>
                        <td className="p-4 hidden md:table-cell">
                           <span className={`text-xs ${user.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>● {user.status}</span>
                        </td>
                        <td className="p-4 text-right">
                           <button 
                              onClick={() => setEditingUser(user)}
                              className="text-gray-400 hover:text-green-400 transition"
                           >
                              Editar
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* --- ADD USER MODAL --- */}
         {isAddUserModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
               <div className="bg-black border border-green-500 rounded-xl w-full max-w-md relative p-6">
                  <button onClick={() => setIsAddUserModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
                  <h3 className="text-xl font-bold text-white mb-6">Adicionar Usuário</h3>
                  <form onSubmit={handleAddUser} className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Nome</label>
                        <input type="text" required value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} className="w-full bg-gray-900 border border-green-900/50 rounded p-2 text-white outline-none focus:border-green-500" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Email</label>
                        <input type="email" required value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} className="w-full bg-gray-900 border border-green-900/50 rounded p-2 text-white outline-none focus:border-green-500" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Plano Inicial</label>
                            <select value={newUserForm.plan} onChange={e => setNewUserForm({...newUserForm, plan: e.target.value as any})} className="w-full bg-gray-900 border border-green-900/50 rounded p-2 text-white outline-none focus:border-green-500">
                               <option value="Gratuito">Gratuito</option>
                               <option value="Básico">Básico</option>
                               <option value="Pro">Pro</option>
                               <option value="Enterprise">Enterprise</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Créditos</label>
                            <input type="number" required value={newUserForm.credits} onChange={e => setNewUserForm({...newUserForm, credits: parseInt(e.target.value)})} className="w-full bg-gray-900 border border-green-900/50 rounded p-2 text-white outline-none focus:border-green-500" />
                         </div>
                     </div>
                     <button type="submit" className="w-full bg-green-600 text-black font-bold py-2 rounded mt-4 hover:bg-green-500">Criar Conta</button>
                  </form>
               </div>
            </div>
         )}

         {/* --- EDIT USER MODAL --- */}
         {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
               <div className="bg-black border border-green-500 rounded-xl w-full max-w-lg relative p-6 overflow-y-auto max-h-[90vh]">
                  <button onClick={() => setEditingUser(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
                  
                  <div className="mb-6 pb-4 border-b border-green-900/30">
                     <h3 className="text-xl font-bold text-white">Editar: {editingUser.name}</h3>
                     <p className="text-xs text-gray-500">{editingUser.id}</p>
                  </div>

                  <div className="space-y-8">
                     {/* 1. Info Básica */}
                     <form onSubmit={handleUpdateUser} className="space-y-4">
                        <h4 className="text-green-400 font-bold text-sm uppercase tracking-wider">Dados Cadastrais</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs text-gray-500 mb-1">Plano</label>
                              <select 
                                 value={editingUser.plan} 
                                 onChange={e => setEditingUser({...editingUser, plan: e.target.value as any})}
                                 className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm"
                              >
                                 <option value="Gratuito">Gratuito</option>
                                 <option value="Básico">Básico</option>
                                 <option value="Pro">Pro</option>
                                 <option value="Enterprise">Enterprise</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-xs text-gray-500 mb-1">Status</label>
                              <select 
                                 value={editingUser.status} 
                                 onChange={e => setEditingUser({...editingUser, status: e.target.value as any})}
                                 className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm"
                              >
                                 <option value="Active">Ativo</option>
                                 <option value="Suspended">Suspenso</option>
                                 <option value="Churned">Cancelado</option>
                              </select>
                           </div>
                        </div>
                        <button onClick={handleUpdateUser} className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded w-full border border-gray-600">
                            Salvar Alterações de Cadastro
                        </button>
                        <button type="button" onClick={handleResetPassword} className="text-xs text-red-400 hover:text-red-300 underline w-full text-center">
                            Resetar Senha & Enviar Email
                        </button>
                     </form>

                     {/* 2. Área de Risco: Créditos */}
                     <div className="bg-red-900/10 border border-red-900/50 p-4 rounded-lg">
                        <h4 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                           <AlertIcon /> Ajuste Manual de Saldo
                        </h4>
                        
                        <div className="flex justify-between items-center mb-4 bg-black p-3 rounded border border-red-900/30">
                            <span className="text-gray-400 text-sm">Saldo Atual:</span>
                            <span className="text-2xl font-bold text-white">{editingUser.credits}</span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Ajuste (+ para adicionar, - para remover)</label>
                                <input 
                                    type="number" 
                                    value={adjustmentDelta}
                                    onChange={e => setAdjustmentDelta(parseInt(e.target.value))}
                                    className="w-full bg-black border border-red-900/50 rounded p-2 text-white font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Motivo (Obrigatório para Auditoria)</label>
                                <input 
                                    type="text" 
                                    value={adjustmentReason}
                                    onChange={e => setAdjustmentReason(e.target.value)}
                                    placeholder="Ex: Erro no sistema, Reembolso, Bônus..."
                                    className="w-full bg-black border border-red-900/50 rounded p-2 text-white text-sm"
                                />
                            </div>
                            <button 
                                onClick={confirmCreditAdjustment}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded text-sm shadow-[0_0_10px_rgba(220,38,38,0.4)]"
                            >
                                Confirmar Ajuste Financeiro
                            </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
    );
  };

  const renderSettingsPanel = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-black border border-green-900/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Logs de Auditoria</h2>
            <p className="text-gray-400 text-sm mb-6">Registro imutável de todas as ações administrativas sensíveis.</p>
            
            <div className="overflow-x-auto rounded border border-green-900/30">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-900 text-gray-400 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-3">Data/Hora</th>
                            <th className="p-3">Admin</th>
                            <th className="p-3">Ação</th>
                            <th className="p-3">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 bg-black">
                        {auditLogs.map(log => (
                            <tr key={log.id}>
                                <td className="p-3 text-gray-500 font-mono text-xs">
                                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                                </td>
                                <td className="p-3 text-gray-300">{log.adminName}</td>
                                <td className="p-3">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${log.action === 'ADD' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                        {log.action === 'ADD' ? 'CRÉDITO' : 'DÉBITO'}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-400 text-xs">
                                    <div className="flex flex-col">
                                        <span className="text-white">Usuário: {log.userName}</span>
                                        <span>{log.action === 'ADD' ? '+' : '-'}{log.amount} Créditos</span>
                                        <span className="italic text-gray-600">"{log.reason}"</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  const renderBrandingPanel = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="bg-black border border-green-900/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Configuração White Label</h2>
              <p className="text-gray-400 text-sm mb-6">Personalize a identidade visual e os canais de contato do SaaS.</p>
              
              <form onSubmit={handleSaveConfig} className="space-y-6 max-w-2xl">
                  
                  {/* Identidade Visual */}
                  <div className="space-y-4 border-b border-gray-800 pb-6">
                      <h3 className="text-green-400 font-bold text-xs uppercase tracking-wider">Identidade Visual</h3>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nome da Aplicação</label>
                          <input 
                              type="text" 
                              value={configForm.appName}
                              onChange={e => setConfigForm({...configForm, appName: e.target.value})}
                              className="w-full bg-gray-900 border border-green-900/50 rounded p-3 text-white outline-none focus:border-green-500"
                              placeholder="Gerador de Notícias"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">URL do Logotipo (Imagem)</label>
                          <input 
                              type="text" 
                              value={configForm.logoUrl}
                              onChange={e => setConfigForm({...configForm, logoUrl: e.target.value})}
                              className="w-full bg-gray-900 border border-green-900/50 rounded p-3 text-white outline-none focus:border-green-500"
                              placeholder="https://..."
                          />
                          <p className="text-[10px] text-gray-600 mt-1">Deixe em branco para usar o padrão.</p>
                      </div>
                  </div>

                  {/* Canais de Contato */}
                  <div className="space-y-4 border-b border-gray-800 pb-6">
                      <h3 className="text-green-400 font-bold text-xs uppercase tracking-wider">Canais de Contato</h3>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">E-mail de Suporte</label>
                          <input 
                              type="email" 
                              value={configForm.supportEmail}
                              onChange={e => setConfigForm({...configForm, supportEmail: e.target.value})}
                              className="w-full bg-gray-900 border border-green-900/50 rounded p-3 text-white outline-none focus:border-green-500"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Número WhatsApp (Link Direto)</label>
                          <input 
                              type="text" 
                              value={configForm.whatsappNumber}
                              onChange={e => setConfigForm({...configForm, whatsappNumber: e.target.value})}
                              className="w-full bg-gray-900 border border-green-900/50 rounded p-3 text-white outline-none focus:border-green-500"
                              placeholder="5511999999999"
                          />
                      </div>
                  </div>

                  {/* Mensagens */}
                  <div className="space-y-4">
                      <h3 className="text-green-400 font-bold text-xs uppercase tracking-wider">Conteúdo</h3>
                       <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Mensagem Inicial (WhatsApp Direct)</label>
                          <textarea 
                              rows={3}
                              value={configForm.contactMessage}
                              onChange={e => setConfigForm({...configForm, contactMessage: e.target.value})}
                              className="w-full bg-gray-900 border border-green-900/50 rounded p-3 text-white outline-none focus:border-green-500 resize-none"
                          />
                      </div>
                  </div>

                  <button 
                      type="submit"
                      className="bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-8 rounded shadow-[0_0_15px_rgba(34,197,94,0.4)] transition transform hover:scale-105"
                  >
                      Salvar Configurações
                  </button>
              </form>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 text-gray-200 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 hover:bg-green-900/20 rounded-full transition text-gray-400 hover:text-green-400">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
               </svg>
             </button>
             <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                   <span className="text-green-500">●</span> Painel Administrativo
                </h1>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">Sistema de Gestão SaaS v2.4.0</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={onOpenDocs}
                className="flex items-center gap-2 text-xs bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-green-500 text-gray-300 px-4 py-2 rounded transition"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Documentação Técnica
             </button>
             <div className="text-right hidden md:block">
                <div className="text-xs text-gray-500">Admin Logado</div>
                <div className="text-sm font-bold text-green-400">root@system</div>
             </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-gray-800 mb-8 pb-1">
           <button 
              onClick={() => setActiveTab('bi')}
              className={`px-6 py-2 text-sm font-bold rounded-t-lg transition whitespace-nowrap ${activeTab === 'bi' ? 'bg-green-900/20 text-green-400 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-300'}`}
           >
              Business Intelligence
           </button>
           <button 
              onClick={() => setActiveTab('plans')}
              className={`px-6 py-2 text-sm font-bold rounded-t-lg transition whitespace-nowrap ${activeTab === 'plans' ? 'bg-green-900/20 text-green-400 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-300'}`}
           >
              Planos & Preços
           </button>
           <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2 text-sm font-bold rounded-t-lg transition whitespace-nowrap ${activeTab === 'users' ? 'bg-green-900/20 text-green-400 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-300'}`}
           >
              Usuários & CRM
           </button>
           <button 
              onClick={() => setActiveTab('branding')}
              className={`px-6 py-2 text-sm font-bold rounded-t-lg transition whitespace-nowrap ${activeTab === 'branding' ? 'bg-green-900/20 text-green-400 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-300'}`}
           >
              White Label & Config
           </button>
           <button 
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2 text-sm font-bold rounded-t-lg transition whitespace-nowrap ${activeTab === 'settings' ? 'bg-green-900/20 text-green-400 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-300'}`}
           >
              Auditoria & Logs
           </button>
        </div>

        {/* Content Area */}
        <div>
           {activeTab === 'bi' && renderBIPanel()}
           {activeTab === 'plans' && renderPlansPanel()}
           {activeTab === 'users' && renderUsersPanel()}
           {activeTab === 'branding' && renderBrandingPanel()}
           {activeTab === 'settings' && renderSettingsPanel()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
