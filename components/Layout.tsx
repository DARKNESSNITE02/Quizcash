import React from 'react';
import { useStore } from '../services/store';
import { 
  Home, 
  Wallet, 
  User, 
  LogOut, 
  ShieldCheck, 
  Gamepad2,
  Menu,
  Medal
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  setView: (view: string) => void;
  currentView: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, setView, currentView }) => {
  const { user, isAdmin, logout } = useStore();

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'missions', label: 'Missões', icon: Gamepad2 },
    { id: 'achievements', label: 'Conquistas', icon: Medal },
    { id: 'wallet', label: 'Carteira', icon: Wallet },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-800 border-r border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">Q</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            QuizCash
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                currentView === item.id 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-2 mb-4">
            <img src={user?.photoUrl} alt="Profile" className="w-8 h-8 rounded-full bg-slate-600" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">Q</span>
          </div>
          <span className="font-bold text-lg">QuizCash</span>
        </div>
        <div className="bg-slate-700 px-3 py-1 rounded-full text-xs font-mono text-emerald-400">
          R$ {user?.balance.toFixed(2)}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 pb-safe z-30">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                currentView === item.id ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};