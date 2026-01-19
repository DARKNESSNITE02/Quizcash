import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { 
  Trophy, 
  Target, 
  Clock, 
  Coins, 
  ArrowRight, 
  Lock, 
  Zap,
  TrendingUp,
  History,
  CreditCard,
  Check,
  Star,
  Skull,
  XCircle,
  Medal,
  Award,
  AlertCircle,
  Brain,
  Flame,
  Bot,
  Scan,
  Loader2,
  ExternalLink,
  Upload,
  Crown,
  LogOut,
  Calendar
} from 'lucide-react';
import { 
  WITHDRAWAL_OPTIONS, 
  WITHDRAWAL_FEE_FREE, 
  WITHDRAWAL_FEE_PREMIUM, 
  POINTS_TO_BRL_RATE, 
  XP_PER_LEVEL, 
  BONUS_POINTS_PER_LEVEL, 
  MISSION_MILESTONE_STEP, 
  XP_REWARD_MISSION_MILESTONE, 
  LEVEL_MILESTONE_STEP, 
  XP_REWARD_LEVEL_MILESTONE, 
  TIER_RULES, 
  PAYMENT_LINK_BASE, 
  DAILY_QUESTION_LIMIT_FREE, 
  DAILY_QUESTION_LIMIT_PREMIUM, 
  DAILY_QUESTION_LIMIT_DARK_PREMIUM,
  LOYALTY_MILESTONES
} from '../constants';
import { PlanType, TransactionStatus, TransactionType, UserLevelTitle, Question } from '../types';

// Helper to get title from level number
const getLevelTitle = (level: number) => {
  if (level < 10) return UserLevelTitle.BEGINNER;
  if (level < 30) return UserLevelTitle.INTERMEDIATE;
  if (level < 60) return UserLevelTitle.ADVANCED;
  if (level < 90) return UserLevelTitle.EXPERT;
  return UserLevelTitle.LEGEND;
};

// --- Dashboard ---
export const Dashboard: React.FC<{ setView: (v: string) => void }> = ({ setView }) => {
  const { user, dailyRemaining } = useStore();
  const xpPercentage = user ? (user.xp / XP_PER_LEVEL) * 100 : 0;
  // Calculate bonus display: (Level - 1) * Bonus. Min 0.
  const levelBonus = user ? Math.max(0, (user.level - 1) * BONUS_POINTS_PER_LEVEL) : 0;
  
  const getDailyLimit = () => {
    if (user?.plan === PlanType.DARK_PREMIUM) return DAILY_QUESTION_LIMIT_DARK_PREMIUM;
    if (user?.plan === PlanType.PREMIUM) return DAILY_QUESTION_LIMIT_PREMIUM;
    return DAILY_QUESTION_LIMIT_FREE;
  };

  const dailyLimit = getDailyLimit();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Olá, {user?.name}!</h1>
          <p className="text-slate-400">Pronto para ganhar hoje?</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-2">
             <div className="bg-emerald-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-900 border-2 border-emerald-400">
               {user?.level}
             </div>
             <span className="text-emerald-400 font-bold text-sm uppercase">{getLevelTitle(user?.level || 1)}</span>
          </div>
          <div className="w-32 bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${xpPercentage}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{user?.xp} / {XP_PER_LEVEL} XP</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Coins size={48} />
          </div>
          <p className="text-slate-400 text-xs mb-1">Meus Pontos</p>
          <p className="text-xl md:text-2xl font-bold text-yellow-400">{user?.points.toLocaleString()}</p>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
           <p className="text-slate-400 text-xs mb-1">Saldo R$</p>
           <p className="text-xl md:text-2xl font-bold text-emerald-400">R$ {user?.balance.toFixed(2)}</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
           <p className="text-slate-400 text-xs mb-1">Bônus de Nível</p>
           <p className="text-xl md:text-2xl font-bold text-purple-400">+{levelBonus} pts</p>
           <p className="text-[10px] text-slate-500">Por missão respondida</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 cursor-pointer hover:border-emerald-500 transition-colors" onClick={() => setView('wallet')}>
           <div className="flex items-center gap-2 h-full justify-center text-emerald-400 font-semibold">
              <span className="text-sm">Resgatar</span>
              <ArrowRight size={16} />
           </div>
        </div>
      </div>

      {/* Banner */}
      {user?.plan === PlanType.FREE && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-2">Seja Premium! 💎</h3>
            <p className="text-purple-100 text-sm mb-4 max-w-md">
              Desbloqueie mais perguntas diárias, prioridade no saque e missões exclusivas por apenas R$19,90/mês.
            </p>
            <button onClick={() => setView('profile')} className="bg-white text-purple-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-50 transition">
              Ver Planos
            </button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10">
            <Trophy size={150} />
          </div>
        </div>
      )}

      {/* Quick Action */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Começar Agora</h2>
          <div 
            onClick={() => setView('missions')}
            className="group bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 transition-all rounded-xl p-6 cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">Missões Diárias</h3>
                <p className="text-slate-400 text-sm">Responda perguntas e acumule pontos.</p>
                <p className="text-xs text-slate-500 mt-1">Hoje: {user?.questionsAnsweredToday} / {dailyLimit}</p>
              </div>
            </div>
            <div className="bg-slate-900 rounded-full p-2 text-slate-400 group-hover:text-white group-hover:bg-blue-600 transition-all">
              <ArrowRight size={20} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Minhas Conquistas</h2>
          <div 
            onClick={() => setView('achievements')}
            className="group bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500 transition-all rounded-xl p-6 cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Medal size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">Conquistas & XP</h3>
                <p className="text-slate-400 text-sm">Acompanhe seu progresso e bônus.</p>
                <p className="text-xs text-slate-500 mt-1">Missões completas: {user?.successfulMissions}</p>
              </div>
            </div>
            <div className="bg-slate-900 rounded-full p-2 text-slate-400 group-hover:text-white group-hover:bg-purple-600 transition-all">
              <ArrowRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Missions ---
export const MissionsList: React.FC = () => {
  const { availableQuestions, startMission, user, tierStatus } = useStore();
  // Calculate bonus display: (Level - 1) * Bonus. Min 0.
  const levelBonus = user ? Math.max(0, (user.level - 1) * BONUS_POINTS_PER_LEVEL) : 0;

  const tiers = [
    { key: 'Fácil', label: 'Nível Fácil', color: 'emerald', icon: <Target size={20} />, stats: TIER_RULES.EASY },
    { key: 'Normal', label: 'Nível Normal', color: 'blue', icon: <Brain size={20} />, stats: TIER_RULES.NORMAL },
    { key: 'Difícil', label: 'Nível Difícil', color: 'orange', icon: <Star size={20} />, stats: TIER_RULES.HARD },
    { key: 'Mega Difícil', label: 'Nível Mega Difícil', color: 'red', icon: <Flame size={20} />, stats: TIER_RULES.MEGA },
    { key: 'Impossível', label: 'Nível Impossível', color: 'purple', icon: <Skull size={20} />, stats: TIER_RULES.IMPOSSIBLE },
  ];

  const getColorClasses = (color: string) => {
    const map: any = {
      emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return map[color] || map.emerald;
  };

  const getButtonColor = (color: string) => {
    const map: any = {
      emerald: 'bg-emerald-600 hover:bg-emerald-500',
      blue: 'bg-blue-600 hover:bg-blue-500',
      orange: 'bg-orange-600 hover:bg-orange-500',
      red: 'bg-red-600 hover:bg-red-500',
      purple: 'bg-purple-600 hover:bg-purple-500',
    };
    return map[color] || 'bg-slate-600';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-white">Missões</h2>
         <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
           Seu bônus de nível: <span className="text-emerald-400">+{levelBonus} pts</span>
         </div>
      </div>
      
      {tiers.map((tier) => {
        const status = tierStatus[tier.key];
        const isLocked = status?.isLocked;
        const tierQuestions = availableQuestions.filter(q => q.difficulty === tier.key);
        
        const totalInTier = tier.stats.count;
        const answeredInTier = (user?.answeredQuestionIds || []).filter(id => id.startsWith(tier.key === 'Fácil' ? 'easy' : tier.key === 'Normal' ? 'normal' : tier.key === 'Difícil' ? 'hard' : tier.key === 'Mega Difícil' ? 'mega' : 'imp')).length;

        return (
          <div key={tier.key} className={`rounded-2xl border ${isLocked ? 'border-slate-800 bg-slate-900 opacity-75' : 'border-slate-700 bg-slate-800/50'}`}>
             {/* Header */}
             <div className="p-4 border-b border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                 <div className={`p-3 rounded-xl ${isLocked ? 'bg-slate-800 text-slate-500' : getColorClasses(tier.color)}`}>
                   {isLocked ? <Lock size={20} /> : tier.icon}
                 </div>
                 <div>
                   <h3 className={`font-bold text-lg ${isLocked ? 'text-slate-500' : 'text-white'}`}>{tier.label}</h3>
                   <div className="flex gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Target size={12}/> {totalInTier} Missões</span>
                      <span className="flex items-center gap-1"><Coins size={12} className="text-yellow-500"/> {tier.stats.points} Pts</span>
                      <span className="flex items-center gap-1"><Zap size={12} className="text-blue-500"/> {tier.stats.xp} XP</span>
                   </div>
                 </div>
               </div>
               
               {isLocked ? (
                 <div className="bg-slate-950 border border-red-900/30 text-red-400 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                   <Lock size={12} />
                   {status.reason}
                 </div>
               ) : (
                 <div className="text-right">
                    <span className="text-xs text-slate-400">Progresso</span>
                    <div className="w-32 h-2 bg-slate-700 rounded-full mt-1 overflow-hidden">
                       <div 
                        className={`h-full ${tier.color === 'emerald' ? 'bg-emerald-500' : tier.color === 'blue' ? 'bg-blue-500' : 'bg-orange-500'}`} 
                        style={{ width: `${(answeredInTier / totalInTier) * 100}%` }}
                       ></div>
                    </div>
                    <span className="text-[10px] text-slate-500">{answeredInTier}/{totalInTier}</span>
                 </div>
               )}
             </div>

             {/* Questions Grid */}
             {!isLocked && (
               <div className="p-4">
                  {tierQuestions.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 bg-slate-800/50 rounded-xl">
                      <Check className="mx-auto mb-2 text-emerald-500" />
                      Todas as missões deste nível foram concluídas!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tierQuestions.slice(0, 4).map((q) => (
                        <div key={q.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between group hover:border-slate-600 transition-all">
                           <div>
                              <div className="text-sm font-medium text-slate-200 mb-1 line-clamp-1">{q.text}</div>
                              <div className="text-xs text-slate-500">{q.category} • {q.timeLimit}s</div>
                           </div>
                           <button 
                            onClick={() => startMission(q)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-lg ${getButtonColor(tier.color)}`}
                           >
                             Jogar
                           </button>
                        </div>
                      ))}
                      {tierQuestions.length > 4 && (
                        <div className="col-span-1 md:col-span-2 text-center py-2">
                          <span className="text-xs text-slate-500 italic">e mais {tierQuestions.length - 4} missões disponíveis...</span>
                        </div>
                      )}
                    </div>
                  )}
               </div>
             )}
          </div>
        );
      })}
    </div>
  );
};

// --- Mission Player ---
export const MissionPlayer: React.FC = () => {
  const { activeMission, submitAnswer, closeMission } = useStore();
  const [timeLeft, setTimeLeft] = useState(activeMission?.timeLimit || 0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<{correct: boolean, points: number, xpEarned: number, leveledUp: boolean} | null>(null);

  useEffect(() => {
    if (!activeMission || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeMission, result]);

  const handleTimeOut = () => {
    const res = submitAnswer(-1); 
    setResult({ correct: false, points: 0, xpEarned: 0, leveledUp: false });
  };

  const handleAnswer = (index: number) => {
    setSelectedOption(index);
    const res = submitAnswer(index);
    setResult({ 
      correct: res.correct, 
      points: res.pointsEarned, 
      xpEarned: res.xpEarned,
      leveledUp: res.leveledUp 
    });
  };

  if (!activeMission) return null;

  return (
    <div className="max-w-2xl mx-auto py-10 relative">
      <div className="w-full bg-slate-700 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 5 ? 'bg-red-500' : 'bg-emerald-500'}`}
          style={{ width: `${(timeLeft / activeMission.timeLimit) * 100}%` }}
        />
      </div>

      <div className={`border rounded-2xl p-8 shadow-2xl relative transition-all ${result ? 'blur-sm brightness-50' : ''} ${activeMission.difficulty === 'Impossível' ? 'bg-slate-900 border-purple-500' : 'bg-slate-800 border-slate-700'}`}>
        <div className="flex justify-between items-center mb-6">
            <span className={`text-xs px-2 py-1 rounded uppercase tracking-wider font-bold ${activeMission.difficulty === 'Impossível' ? 'text-purple-400 bg-purple-900/50' : 'text-slate-400'}`}>
              {activeMission.difficulty}
            </span>
            <div className="flex items-center gap-1 text-slate-300">
              <Clock size={16} />
              <span>{timeLeft}s</span>
            </div>
        </div>
        
        <h2 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
          {activeMission.text}
        </h2>

        <div className="space-y-3">
          {activeMission.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => !result && handleAnswer(idx)}
              disabled={!!result}
              className={`w-full text-left p-4 rounded-xl border transition-all font-medium ${
                selectedOption === idx 
                  ? 'bg-blue-600 border-blue-500 text-white' 
                  : 'bg-slate-700/50 hover:bg-slate-700 border-slate-600 text-slate-200'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl p-8 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 border-4 ${result.correct ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                {result.correct ? <Trophy size={40} /> : <XCircle size={40} />}
              </div>
              
              <h2 className={`text-2xl font-bold mb-2 ${result.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.correct ? 'Você Acertou!' : 'Tente Novamente!'}
              </h2>
              
              {result.correct && (
                <div className="flex justify-center gap-4 mb-4 mt-4">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 min-w-[80px]">
                      <span className="block text-xs text-slate-500 uppercase tracking-wider">Pontos</span>
                      <span className="text-yellow-400 font-bold text-xl">+{result.points}</span>
                  </div>
                  {result.xpEarned > 0 && (
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 min-w-[80px]">
                        <span className="block text-xs text-slate-500 uppercase tracking-wider">XP</span>
                        <span className="text-blue-400 font-bold text-xl">+{result.xpEarned}</span>
                    </div>
                  )}
                </div>
              )}
              
              {result.leveledUp && (
                  <div className="mb-6 animate-pulse bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg text-slate-900 font-bold shadow-lg shadow-emerald-500/20">
                    🎉 LEVEL UP! 🎉
                  </div>
              )}

              <p className="text-slate-400 mb-6 text-sm">
                {result.correct 
                  ? 'Ótimo trabalho! Seus pontos foram adicionados à sua carteira.' 
                  : 'Não foi dessa vez. Continue jogando para melhorar seus resultados!'}
              </p>
              
              <button 
                onClick={closeMission} 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Wallet ---
export const WalletView: React.FC = () => {
  const { user, convertPoints, requestWithdrawal, transactions } = useStore();
  
  // States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [modalStep, setModalStep] = useState<'selection' | 'payment' | 'verification' | 'success'>('selection');
  const [selectedWithdrawAmount, setSelectedWithdrawAmount] = useState<number | null>(null);
  
  // Verification State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form State
  const [withdrawName, setWithdrawName] = useState('');
  const [withdrawEmail, setWithdrawEmail] = useState('');
  const [withdrawPixKey, setWithdrawPixKey] = useState('');

  useEffect(() => {
    if (user) {
      setWithdrawName(user.name);
      setWithdrawEmail(user.email);
    }
  }, [user]);

  const conversionSteps = [250, 500, 1000, 5000];

  const handleWithdrawClick = (amount: number) => {
    setSelectedWithdrawAmount(amount);
    setModalStep('payment');
    setShowWithdrawModal(true);
  };

  const handlePaymentClick = () => {
    window.open(PAYMENT_LINK_BASE, '_blank');
  };

  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    
    // Simulate AI Analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      if (selectedWithdrawAmount && withdrawName && withdrawEmail && withdrawPixKey) {
        requestWithdrawal(selectedWithdrawAmount, withdrawPixKey, withdrawName, withdrawEmail);
        setModalStep('success');
      }
    }, 3000);
  };

  const closeWithdrawalFlow = () => {
    setShowWithdrawModal(false);
    setModalStep('selection');
    setSelectedWithdrawAmount(null);
    setWithdrawPixKey('');
  };

  const calculateFee = (amount: number) => {
    if (!user) return 0;
    const isPremium = user.plan === PlanType.PREMIUM || user.plan === PlanType.DARK_PREMIUM;
    const rate = isPremium ? WITHDRAWAL_FEE_PREMIUM : WITHDRAWAL_FEE_FREE;
    return amount * rate;
  };

  return (
    <div className="space-y-8 relative">
      <h1 className="text-2xl font-bold text-white">Minha Carteira</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Converter */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-purple-400" />
            <h3 className="text-lg font-bold text-white">Converter Pontos</h3>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Saldo de Pontos: <span className="text-white font-bold">{user?.points}</span>
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
             {conversionSteps.map(step => (
                <button
                  key={step}
                  onClick={() => convertPoints(step)}
                  disabled={!user || user.points < step}
                  className="bg-slate-700 disabled:opacity-50 hover:bg-purple-600/20 hover:border-purple-500 border border-transparent p-3 rounded-lg text-sm text-center transition-all"
                >
                  <div className="text-white font-bold">{step} pts</div>
                  <div className="text-xs text-slate-400">= R$ {(step * POINTS_TO_BRL_RATE).toFixed(2)}</div>
                </button>
             ))}
          </div>
          <p className="text-xs text-slate-500 text-center">Conversão instantânea</p>
        </div>

        {/* Withdrawal Selection */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Solicitar Saque</h3>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Saldo Disponível: <span className="text-emerald-400 font-bold text-xl">R$ {user?.balance.toFixed(2)}</span>
          </p>

          <div className="grid grid-cols-3 gap-2 mb-4">
             {WITHDRAWAL_OPTIONS.map(val => {
                const disabled = !user || user.balance < val;

                return (
                  <button
                    key={val}
                    onClick={() => handleWithdrawClick(val)}
                    disabled={disabled}
                    className="bg-slate-700 disabled:opacity-50 hover:bg-emerald-600/20 hover:border-emerald-500 border border-transparent p-2 rounded-lg transition-all"
                  >
                    <div className="text-white font-bold text-sm">R${val}</div>
                  </button>
                );
             })}
          </div>
          <p className="text-xs text-slate-500 text-center">
            Taxa atual: <span className={(user?.plan === PlanType.PREMIUM || user?.plan === PlanType.DARK_PREMIUM) ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {((user?.plan === PlanType.PREMIUM || user?.plan === PlanType.DARK_PREMIUM) ? WITHDRAWAL_FEE_PREMIUM : WITHDRAWAL_FEE_FREE) * 100}%
            </span>
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center gap-2">
           <History size={18} className="text-slate-400" />
           <h3 className="font-semibold text-white">Histórico de Transações</h3>
        </div>
        <div className="divide-y divide-slate-700">
           {transactions.filter(t => t.userId === user?.id).map(t => (
             <div key={t.id} className="p-4 flex justify-between items-center">
                <div>
                   <p className="text-white text-sm font-medium">{t.type}</p>
                   <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${t.type === TransactionType.WITHDRAWAL ? 'text-red-400' : 'text-emerald-400'}`}>
                    {t.type === TransactionType.WITHDRAWAL ? '-' : '+'} R$ {t.amountMoney.toFixed(2)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-700 inline-block text-slate-300">
                    {t.status}
                  </p>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Multi-Step Withdrawal Modal */}
      {showWithdrawModal && selectedWithdrawAmount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {modalStep === 'verification' ? <Bot className="text-emerald-400" /> : <CreditCard className="text-emerald-500" />}
                {modalStep === 'payment' && 'Confirmar & Pagar Taxa'}
                {modalStep === 'verification' && 'Verificação Inteligente'}
                {modalStep === 'success' && 'Solicitação Enviada'}
              </h3>
              <button onClick={closeWithdrawalFlow} className="text-slate-400 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              
              {/* STEP 1: PAYMENT & INFO */}
              {modalStep === 'payment' && (
                <div className="space-y-6">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between text-sm mb-2">
                       <span className="text-slate-400">Valor do Saque</span>
                       <span className="text-white font-bold">R$ {selectedWithdrawAmount.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-slate-400">
                         Taxa de Liberação ({((user?.plan === PlanType.PREMIUM || user?.plan === PlanType.DARK_PREMIUM) ? WITHDRAWAL_FEE_PREMIUM : WITHDRAWAL_FEE_FREE) * 100}%)
                       </span>
                       <span className="text-red-400 font-bold">R$ {calculateFee(selectedWithdrawAmount).toFixed(2)}</span>
                     </div>
                     <p className="text-[10px] text-slate-500 mt-2 italic">
                       * A taxa deve ser paga externamente para liberar a transação.
                     </p>
                  </div>

                  <div className="space-y-3">
                     <input 
                       type="text" 
                       value={withdrawName}
                       onChange={(e) => setWithdrawName(e.target.value)}
                       className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm focus:border-emerald-500 outline-none"
                       placeholder="Nome Completo"
                     />
                     <input 
                       type="text" 
                       value={withdrawPixKey}
                       onChange={(e) => setWithdrawPixKey(e.target.value)}
                       className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm focus:border-emerald-500 outline-none"
                       placeholder="Sua Chave Pix"
                     />
                  </div>

                  <div className="space-y-3 pt-2">
                     <button 
                       onClick={handlePaymentClick}
                       className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 transition-all"
                     >
                       Pagar Taxa <ExternalLink size={16} />
                     </button>
                     <button 
                       onClick={() => setModalStep('verification')}
                       disabled={!withdrawPixKey}
                       className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-all"
                     >
                       Já realizei o pagamento
                     </button>
                  </div>
                </div>
              )}

              {/* STEP 2: AI VERIFICATION */}
              {modalStep === 'verification' && (
                <div className="text-center space-y-6">
                  {!isAnalyzing ? (
                    <>
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 relative">
                        <Bot size={32} className="text-emerald-400" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-bold text-lg">Verificação de Comprovante</h4>
                        <p className="text-slate-400 text-sm mt-1">
                          Olá, eu sou o agente de validação. Por favor, envie uma foto do comprovante de pagamento da taxa.
                        </p>
                      </div>

                      <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 hover:border-emerald-500 transition-colors cursor-pointer group bg-slate-900/30">
                        <Upload className="mx-auto text-slate-500 group-hover:text-emerald-400 mb-2" size={32} />
                        <p className="text-xs text-slate-400 group-hover:text-white">Clique para enviar foto</p>
                        <input 
                          type="file" 
                          className="opacity-0 absolute inset-0 cursor-pointer w-full h-full" // Overlay hack for demo
                          style={{ display: 'none' }}
                          id="file-upload"
                          onChange={handleProofSubmit}
                        />
                        <label htmlFor="file-upload" className="absolute inset-0 cursor-pointer"></label>
                      </div>
                      <p className="text-[10px] text-slate-500">Formatos: JPG, PNG, PDF</p>
                    </>
                  ) : (
                    <div className="py-10">
                      <div className="relative w-20 h-20 mx-auto mb-6">
                         <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                         <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full animate-spin"></div>
                         <Scan size={32} className="absolute inset-0 m-auto text-emerald-400 animate-pulse" />
                      </div>
                      <h4 className="text-white font-bold animate-pulse">Analisando Comprovante...</h4>
                      <p className="text-slate-500 text-xs mt-2">Verificando autenticidade bancária</p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: SUCCESS */}
              {modalStep === 'success' && (
                <div className="text-center py-6">
                   <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                     <Check size={40} />
                   </div>
                   <h3 className="text-xl font-bold text-white">Solicitação Recebida!</h3>
                   <p className="text-slate-400 text-sm mt-2 mb-6">
                     Seu comprovante foi validado pela IA. O valor será enviado para sua conta Pix em breve.
                   </p>
                   <button 
                    onClick={closeWithdrawalFlow}
                    className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all"
                   >
                     Fechar
                   </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Profile ---
export const Profile: React.FC = () => {
  const { user, upgradePlan, logout } = useStore();
  
  // Subscription Modal State
  const [showSubModal, setShowSubModal] = useState(false);
  const [subStep, setSubStep] = useState<'payment' | 'verification' | 'success'>('payment');
  const [targetPlan, setTargetPlan] = useState<PlanType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubscribeClick = (plan: PlanType) => {
    setTargetPlan(plan);
    setSubStep('payment');
    setShowSubModal(true);
  };

  const handlePaymentClick = () => {
    window.open(PAYMENT_LINK_BASE, '_blank');
  };

  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    
    // Simulate AI Analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      if (targetPlan) {
        upgradePlan(targetPlan);
        setSubStep('success');
      }
    }, 3000);
  };

  const closeSubModal = () => {
    setShowSubModal(false);
    setSubStep('payment');
    setTargetPlan(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-6">
          <img src={user?.photoUrl} className="w-20 h-20 rounded-full border-4 border-slate-700" alt="Profile" />
          <div className="flex-1">
             <div className="flex justify-between items-start">
               <div>
                 <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                 <p className="text-slate-400 text-sm mb-2">{user?.email}</p>
               </div>
             </div>
             <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 font-bold">
                  Nível {user?.level}
                </span>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30">
                  {user?.successfulMissions} Missões Completas
                </span>
                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30 flex items-center gap-1">
                  <Calendar size={12} />
                  {user?.daysLogged} Dias
                </span>
                <span className={`text-xs px-2 py-1 rounded border font-bold ${
                  user?.plan === PlanType.DARK_PREMIUM ? 'bg-slate-950 text-amber-400 border-amber-500/50' : 
                  user?.plan === PlanType.PREMIUM ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 
                  'bg-slate-700 text-slate-300 border-slate-600'
                }`}>
                  {user?.plan}
                </span>
             </div>
          </div>
       </div>

       {user?.plan !== PlanType.DARK_PREMIUM && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Regular Premium */}
            {user?.plan === PlanType.FREE && (
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 p-6 rounded-xl text-center flex flex-col justify-between">
                  <div>
                    <Trophy size={40} className="mx-auto text-indigo-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
                    <p className="text-slate-300 text-xs mb-4">
                      15 missões diárias + Saque Prioritário (Taxa 20%)
                    </p>
                    <div className="text-2xl font-bold text-white mb-4">
                      R$ 19,90 <span className="text-xs text-slate-400 font-normal">/mês</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSubscribeClick(PlanType.PREMIUM)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                  >
                    Assinar Premium
                  </button>
              </div>
            )}

            {/* Dark Premium */}
            <div className="bg-gradient-to-br from-slate-950 to-black border border-amber-500/30 p-6 rounded-xl text-center flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="relative z-10">
                  <Crown size={40} className="mx-auto text-amber-400 mb-4 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                  <h3 className="text-xl font-bold text-amber-100 mb-2">Dark Premium</h3>
                  <p className="text-amber-500/80 text-xs mb-4">
                    100 missões diárias + Status Lendário + Taxa Reduzida
                  </p>
                  <div className="text-2xl font-bold text-amber-400 mb-4">
                    R$ 50,00 <span className="text-xs text-slate-500 font-normal">/mês</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleSubscribeClick(PlanType.DARK_PREMIUM)}
                  className="relative z-10 w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 border border-amber-500/50"
                >
                  Assinar Dark
                </button>
            </div>
         </div>
       )}
       
       <button 
         onClick={logout}
         className="w-full bg-slate-800 hover:bg-red-900/20 border border-slate-700 hover:border-red-800 text-slate-300 hover:text-red-400 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
       >
         <LogOut size={18} />
         Sair da Conta
       </button>

       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-white font-semibold mb-4">Termos e Segurança</h3>
          <ul className="space-y-2 text-sm text-slate-400">
             <li className="flex gap-2 items-center"><Check size={16} className="text-emerald-500" /> Seus dados estão protegidos (LGPD).</li>
             <li className="flex gap-2 items-center"><Check size={16} className="text-emerald-500" /> Pagamentos processados via Pix Seguro.</li>
             <li className="flex gap-2 items-center"><Check size={16} className="text-emerald-500" /> Sistema antifraude ativo.</li>
          </ul>
       </div>

       {/* Subscription Modal */}
       {showSubModal && targetPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {subStep === 'verification' ? <Bot className="text-emerald-400" /> : <CreditCard className="text-emerald-500" />}
                Assinar {targetPlan}
              </h3>
              <button onClick={closeSubModal} className="text-slate-400 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              
              {/* STEP 1: PAYMENT */}
              {subStep === 'payment' && (
                <div className="space-y-6">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-center">
                     <p className="text-slate-400 text-sm mb-2">Valor da Assinatura</p>
                     <p className="text-2xl font-bold text-white">
                       {targetPlan === PlanType.PREMIUM ? 'R$ 19,90' : 'R$ 50,00'}
                       <span className="text-sm font-normal text-slate-500"> /mês</span>
                     </p>
                  </div>

                  <div className="space-y-3 pt-2">
                     <button 
                       onClick={handlePaymentClick}
                       className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 transition-all"
                     >
                       Pagar Agora <ExternalLink size={16} />
                     </button>
                     <button 
                       onClick={() => setSubStep('verification')}
                       className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                     >
                       Já realizei o pagamento
                     </button>
                  </div>
                </div>
              )}

              {/* STEP 2: VERIFICATION */}
              {subStep === 'verification' && (
                <div className="text-center space-y-6">
                  {!isAnalyzing ? (
                    <>
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 relative">
                        <Bot size={32} className="text-emerald-400" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-bold text-lg">Validação de Assinatura</h4>
                        <p className="text-slate-400 text-sm mt-1">
                          Envie o comprovante de pagamento para liberar seu acesso imediatamente.
                        </p>
                      </div>

                      <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 hover:border-emerald-500 transition-colors cursor-pointer group bg-slate-900/30">
                        <Upload className="mx-auto text-slate-500 group-hover:text-emerald-400 mb-2" size={32} />
                        <p className="text-xs text-slate-400 group-hover:text-white">Clique para enviar comprovante</p>
                        <input 
                          type="file" 
                          className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                          style={{ display: 'none' }}
                          id="sub-proof-upload"
                          onChange={handleProofSubmit}
                        />
                        <label htmlFor="sub-proof-upload" className="absolute inset-0 cursor-pointer"></label>
                      </div>
                    </>
                  ) : (
                    <div className="py-10">
                      <div className="relative w-20 h-20 mx-auto mb-6">
                         <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                         <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full animate-spin"></div>
                         <Scan size={32} className="absolute inset-0 m-auto text-emerald-400 animate-pulse" />
                      </div>
                      <h4 className="text-white font-bold animate-pulse">Validando Pagamento...</h4>
                      <p className="text-slate-500 text-xs mt-2">Aguarde enquanto verificamos</p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: SUCCESS */}
              {subStep === 'success' && (
                <div className="text-center py-6">
                   <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                     <Check size={40} />
                   </div>
                   <h3 className="text-xl font-bold text-white">Assinatura Ativada!</h3>
                   <p className="text-slate-400 text-sm mt-2 mb-6">
                     Parabéns! Agora você é {targetPlan}. Aproveite todos os benefícios exclusivos.
                   </p>
                   <button 
                    onClick={closeSubModal}
                    className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all"
                   >
                     Fechar
                   </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Achievements ---
export const AchievementsView: React.FC = () => {
  const { user } = useStore();

  const nextMissionMilestone = user ? Math.ceil((user.successfulMissions + 1) / MISSION_MILESTONE_STEP) * MISSION_MILESTONE_STEP : MISSION_MILESTONE_STEP;
  
  // Progress bar for missions (within current chunk of 5)
  const missionsProgress = user ? ((user.successfulMissions % MISSION_MILESTONE_STEP) / MISSION_MILESTONE_STEP) * 100 : 0;
  
  const nextLevelMilestone = user ? Math.ceil((user.level + 0.1) / LEVEL_MILESTONE_STEP) * LEVEL_MILESTONE_STEP : LEVEL_MILESTONE_STEP;
  // Progress within current level block
  const levelProgress = user ? ((user.level % LEVEL_MILESTONE_STEP) / LEVEL_MILESTONE_STEP) * 100 : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Conquistas & Marcos</h1>
      <p className="text-slate-400">Desbloqueie bônus ao atingir marcos importantes.</p>

      {/* Grid of Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mission Milestone */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
           <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
               <Target size={24} />
             </div>
             <div>
               <h3 className="font-bold text-white">Mestre das Missões</h3>
               <p className="text-sm text-slate-400">Bônus a cada {MISSION_MILESTONE_STEP} missões.</p>
             </div>
           </div>
           
           <div className="mb-2 flex justify-between text-sm">
             <span className="text-slate-300">Próximo Marco: {nextMissionMilestone} Missões</span>
             <span className="text-emerald-400">+{XP_REWARD_MISSION_MILESTONE} XP</span>
           </div>
           <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
             <div className="bg-blue-500 h-full transition-all" style={{ width: `${missionsProgress}%` }}></div>
           </div>
           <p className="text-xs text-slate-500 mt-2 text-right">
             {user?.successfulMissions} / {nextMissionMilestone} completas
           </p>
        </div>

        {/* Level Milestone */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
           <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
               <Trophy size={24} />
             </div>
             <div>
               <h3 className="font-bold text-white">Escalada de Nível</h3>
               <p className="text-sm text-slate-400">Bônus a cada {LEVEL_MILESTONE_STEP} níveis.</p>
             </div>
           </div>

           <div className="mb-2 flex justify-between text-sm">
             <span className="text-slate-300">Próximo Marco: Nível {nextLevelMilestone}</span>
             <span className="text-emerald-400">+{XP_REWARD_LEVEL_MILESTONE} XP</span>
           </div>
           <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
             <div 
               className="bg-purple-500 h-full transition-all" 
               style={{ width: `${levelProgress}%` }}
             ></div>
           </div>
           <p className="text-xs text-slate-500 mt-2 text-right">
             Nível Atual: {user?.level}
           </p>
        </div>
      </div>
      
      {/* Loyalty Milestones */}
      <h2 className="text-xl font-bold text-white mt-8">Fidelidade (Dias Jogados)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {LOYALTY_MILESTONES.map((milestone) => {
          const progress = user?.daysLogged ? Math.min(100, (user.daysLogged / milestone.days) * 100) : 0;
          const isCompleted = user?.daysLogged && user.daysLogged >= milestone.days;

          return (
            <div key={milestone.days} className={`p-4 rounded-xl border ${isCompleted ? 'bg-slate-800 border-yellow-500/50' : 'bg-slate-900 border-slate-800'}`}>
               <div className="flex justify-between items-start mb-2">
                 <div className={`p-2 rounded-lg ${isCompleted ? 'bg-yellow-500 text-slate-900' : 'bg-slate-800 text-slate-600'}`}>
                   <Calendar size={20} />
                 </div>
                 {isCompleted && <Check size={20} className="text-emerald-500" />}
               </div>
               <h4 className={`font-bold ${isCompleted ? 'text-white' : 'text-slate-500'}`}>{milestone.days} Dias de Uso</h4>
               <p className="text-xs text-slate-400 mt-1">Recompensa: {milestone.points} pts + {milestone.xp} XP</p>
               
               <div className="w-full bg-slate-950 h-2 rounded-full mt-3 overflow-hidden">
                  <div className={`h-full transition-all ${isCompleted ? 'bg-yellow-500' : 'bg-slate-700'}`} style={{ width: `${progress}%` }}></div>
               </div>
               <p className="text-[10px] text-right text-slate-500 mt-1">{user?.daysLogged || 0} / {milestone.days} dias</p>
            </div>
          );
        })}
      </div>

      {/* Badges / Tiers */}
      <h2 className="text-xl font-bold text-white mt-8">Insígnias de Classe</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(TIER_RULES).map(([key, rule]) => {
           let difficulty = '';
           if(key === 'EASY') difficulty = 'Fácil';
           if(key === 'NORMAL') difficulty = 'Normal';
           if(key === 'HARD') difficulty = 'Difícil';
           if(key === 'MEGA') difficulty = 'Mega Difícil';
           if(key === 'IMPOSSIBLE') difficulty = 'Impossível';

           const answeredInTier = (user?.answeredQuestionIds || []).filter(id => {
              if (key === 'EASY') return id.startsWith('easy');
              if (key === 'NORMAL') return id.startsWith('normal');
              if (key === 'HARD') return id.startsWith('hard');
              if (key === 'MEGA') return id.startsWith('mega');
              if (key === 'IMPOSSIBLE') return id.startsWith('imp');
              return false;
           }).length;
           
           const isCompleted = answeredInTier >= rule.count;
           
           return (
             <div key={key} className={`p-4 rounded-xl border flex flex-col items-center text-center ${isCompleted ? 'bg-slate-800 border-emerald-500/50' : 'bg-slate-900 border-slate-800 opacity-50'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                  {isCompleted ? <Medal size={24} /> : <Lock size={24} />}
                </div>
                <h4 className={`font-bold text-sm ${isCompleted ? 'text-white' : 'text-slate-500'}`}>{difficulty}</h4>
                <p className="text-[10px] text-slate-500 mt-1">{answeredInTier}/{rule.count}</p>
             </div>
           )
        })}
      </div>
    </div>
  );
};