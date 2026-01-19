import React from 'react';
import { useStore } from '../services/store';
import { TransactionStatus, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { CheckCircle, XCircle, DollarSign, Users, AlertCircle } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { transactions, approveWithdrawal, rejectWithdrawal, user, users } = useStore();

  const withdrawalRequests = transactions.filter(
    t => t.type === TransactionType.WITHDRAWAL && t.status === TransactionStatus.ANALYSIS
  );

  // Calculate Revenue from Subscriptions (Transactions created after user sends receipt)
  const subscriptionRevenue = transactions
    .filter(t => t.type === TransactionType.SUBSCRIPTION && t.status === TransactionStatus.PAID)
    .reduce((acc, curr) => acc + curr.amountMoney, 0);

  const mockChartData = [
    { name: 'Seg', users: 400, revenue: 240 },
    { name: 'Ter', users: 300, revenue: 139 },
    { name: 'Qua', users: 200, revenue: 980 },
    { name: 'Qui', users: 278, revenue: 390 },
    { name: 'Sex', users: 189, revenue: 480 },
    { name: 'Sab', users: 239, revenue: 380 },
    { name: 'Dom', users: 349, revenue: 430 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
      <p className="text-slate-400">Bem-vindo, {user?.name}. Gerencie o sistema.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-blue-400" />
            <span className="text-slate-400 text-sm">Usuários Ativos</span>
          </div>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-emerald-400" />
            <span className="text-slate-400 text-sm">Receita Assinaturas</span>
          </div>
          <p className="text-2xl font-bold text-white">R$ {subscriptionRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-amber-400" />
            <span className="text-slate-400 text-sm">Saques Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-white">{withdrawalRequests.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Atividade Semanal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Fluxo de Caixa</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Withdrawal Approval */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Solicitações de Saque</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Usuário</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Chave Pix</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {withdrawalRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Nenhuma solicitação pendente.
                  </td>
                </tr>
              ) : (
                withdrawalRequests.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-700/30">
                    <td className="p-4 font-mono text-xs text-slate-500">{tx.id}</td>
                    <td className="p-4 text-sm text-white">{tx.userId}</td>
                    <td className="p-4 text-sm font-bold text-emerald-400">R$ {tx.amountMoney.toFixed(2)}</td>
                    <td className="p-4 text-sm text-slate-300">{tx.pixKey}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => approveWithdrawal(tx.id)}
                        className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20"
                        title="Aprovar"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => rejectWithdrawal(tx.id)}
                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                        title="Rejeitar"
                      >
                        <XCircle size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};