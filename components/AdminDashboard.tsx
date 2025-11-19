
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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onOpenDocs }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Real Users from Supabase
  useEffect(() => {
      const fetchUsers = async () => {
          setIsLoading(true);
          const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('created_at', { ascending: false });

          if (data) {
              const mappedUsers: User[] = data.map((u: any) => ({
                  id: u.id,
                  name: u.name || 'Sem Nome',
                  email: u.email,
                  role: u.role === 'super_admin' ? 'admin' : 'user',
                  plan: u.plan || 'Gratuito',
                  credits: u.creditos_saldo,
                  status: 'Active',
                  created_at: u.created_at
              }));
              setUsers(mappedUsers);
          }
          setIsLoading(false);
      };
      fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 text-gray-200 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 hover:bg-green-900/20 rounded-full transition text-gray-400 hover:text-green-400">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
               </svg>
             </button>
             <h1 className="text-2xl font-bold text-white">Painel Administrativo (Supabase)</h1>
          </div>
          <div className="text-xs font-mono text-green-500 border border-green-900 px-2 py-1 rounded">CONNECTED: PROD</div>
        </div>

        {isLoading ? (
            <div className="text-center text-gray-500 py-20">Carregando dados do banco...</div>
        ) : (
            <div className="bg-black border border-green-900/50 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                   <thead className="bg-green-900/10 text-green-500 uppercase font-bold text-xs">
                      <tr>
                         <th className="p-4">Usuário</th>
                         <th className="p-4">Email</th>
                         <th className="p-4">Role (DB)</th>
                         <th className="p-4">Créditos</th>
                         <th className="p-4">Plano</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-green-900/20">
                      {users.map(user => (
                         <tr key={user.id} className="hover:bg-green-900/5 transition">
                            <td className="p-4 font-bold text-white">{user.name}</td>
                            <td className="p-4 text-gray-400 font-mono text-xs">{user.email}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-900/30 text-red-400' : 'bg-gray-900 text-gray-400'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="p-4 font-mono text-green-400 font-bold">{user.credits}</td>
                            <td className="p-4 text-gray-300">{user.plan}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
