import React, { useState } from 'react';
import { StoreProvider, useStore } from './services/store';
import { Layout } from './components/Layout';
import { Dashboard, MissionsList, MissionPlayer, WalletView, Profile, AchievementsView } from './pages/UserViews';
import { AdminPanel } from './pages/AdminPanel';
import { ADMIN_EMAIL } from './constants';

const AuthScreen = () => {
  const { login, register } = useStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      if (name && email && password) {
        register(name, email, password);
      }
    } else {
      if (email && password) {
        login(email, password);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <span className="text-2xl font-bold text-white">Q</span>
          </div>
          <h1 className="text-2xl font-bold text-white">QuizCash</h1>
          <p className="text-slate-400 text-sm mt-2">
            {isRegistering ? 'Crie sua conta para começar' : 'Entre para continuar ganhando'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nome Completo</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:border-emerald-500 outline-none transition-all"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">E-mail</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Senha</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 focus:border-emerald-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
          >
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700 text-center">
           <button 
             onClick={() => setIsRegistering(!isRegistering)} 
             className="text-slate-400 hover:text-white text-sm transition-colors"
           >
             {isRegistering 
               ? 'Já tem uma conta? Faça login' 
               : 'Não tem conta? Crie agora'}
           </button>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated, activeMission, isAdmin } = useStore();
  const [currentView, setView] = useState('dashboard');

  // If mission is active, override view
  if (activeMission) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <MissionPlayer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <Layout currentView={currentView} setView={setView}>
      {currentView === 'dashboard' && <Dashboard setView={setView} />}
      {currentView === 'missions' && <MissionsList />}
      {currentView === 'achievements' && <AchievementsView />}
      {currentView === 'wallet' && <WalletView />}
      {currentView === 'profile' && <Profile />}
      {currentView === 'admin' && isAdmin && <AdminPanel />}
      {currentView === 'admin' && !isAdmin && <div className="text-center p-10 text-red-400">Acesso Negado</div>}
    </Layout>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;