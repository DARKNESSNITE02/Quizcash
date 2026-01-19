import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, User, Transaction, Question, TransactionStatus, TransactionType, PlanType } from '../types';
import { 
  INITIAL_USER_STATE, 
  MOCK_QUESTIONS, 
  DAILY_QUESTION_LIMIT_FREE, 
  DAILY_QUESTION_LIMIT_PREMIUM, 
  DAILY_QUESTION_LIMIT_DARK_PREMIUM,
  POINTS_TO_BRL_RATE,
  WITHDRAWAL_FEE_FREE,
  WITHDRAWAL_FEE_PREMIUM,
  ADMIN_EMAIL,
  XP_PER_LEVEL,
  BONUS_POINTS_PER_LEVEL,
  XP_REWARD_MISSION_MILESTONE,
  XP_REWARD_LEVEL_MILESTONE,
  MISSION_MILESTONE_STEP,
  LEVEL_MILESTONE_STEP,
  TIER_RULES,
  TOTAL_QUESTIONS_COUNT,
  LOYALTY_MILESTONES
} from '../constants';

// --- CRYPTO UTILS ---
const CryptoLayer = {
  // Convert string to Uint8Array
  encode: (text: string) => new TextEncoder().encode(text),
  // Convert Uint8Array to string
  decode: (data: BufferSource) => new TextDecoder().decode(data),

  // Convert buffer to Hex string (for Hashing)
  bufToHex: (buffer: ArrayBuffer) => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  // SHA-256 Hash (For looking up users by email without storing plain email)
  digest: async (text: string) => {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return CryptoLayer.bufToHex(hashBuffer);
  },

  // Generate a key from the password (PBKDF2)
  getKey: async (password: string, salt: Uint8Array) => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  },

  // Encrypt data using AES-GCM
  encrypt: async (text: string, password: string) => {
    try {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const key = await CryptoLayer.getKey(password, salt);
      const encoded = CryptoLayer.encode(text);
      
      const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encoded
      );

      // Pack Salt + IV + Ciphertext into a single base64 string
      const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContent.byteLength);
      buffer.set(salt, 0);
      buffer.set(iv, salt.byteLength);
      buffer.set(new Uint8Array(encryptedContent), salt.byteLength + iv.byteLength);
      
      return btoa(String.fromCharCode(...buffer));
    } catch (e) {
      console.error("Encryption failed", e);
      throw new Error("Falha na criptografia");
    }
  },

  // Decrypt data using AES-GCM
  decrypt: async (encryptedBase64: string, password: string) => {
    try {
      const binaryString = atob(encryptedBase64);
      const buffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        buffer[i] = binaryString.charCodeAt(i);
      }

      // Extract parts
      const salt = buffer.slice(0, 16);
      const iv = buffer.slice(16, 28);
      const data = buffer.slice(28);

      const key = await CryptoLayer.getKey(password, salt);
      const decryptedContent = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        data
      );

      return CryptoLayer.decode(decryptedContent);
    } catch (e) {
      console.error("Decryption failed", e);
      throw new Error("Senha incorreta ou dados corrompidos.");
    }
  }
};
// --- END CRYPTO UTILS ---

interface TierStatus {
  isLocked: boolean;
  reason?: string;
}

interface StoreContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  transactions: Transaction[];
  activeMission: Question | null;
  dailyRemaining: number;
  availableQuestions: Question[];
  tierStatus: Record<string, TierStatus>;
  login: (email: string, password?: string) => void;
  register: (name: string, email: string, password?: string) => void;
  logout: () => void;
  startMission: (question: Question) => void;
  closeMission: () => void;
  submitAnswer: (answerIndex: number) => { correct: boolean; pointsEarned: number; xpEarned: number; leveledUp: boolean };
  convertPoints: (amount: number) => void;
  requestWithdrawal: (amount: number, pixKey: string, name: string, email: string) => void;
  approveWithdrawal: (id: string) => void; 
  rejectWithdrawal: (id: string) => void; 
  upgradePlan: (type: PlanType) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]); 
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 't1', userId: 'u1', type: TransactionType.CONVERSION, amountPoints: 1000, amountMoney: 1.00, status: TransactionStatus.APPROVED, date: new Date().toISOString() }
  ]);
  const [activeMission, setActiveMission] = useState<Question | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [tierStatus, setTierStatus] = useState<Record<string, TierStatus>>({});

  // Helper: Check Tier Logic based on Days Logged
  const calculateTierLocks = (currentUser: User) => {
    // Admin Override: Unlocks everything for the specific email
    if (currentUser.email === ADMIN_EMAIL) {
       return {
         'Fácil': { isLocked: false },
         'Normal': { isLocked: false },
         'Difícil': { isLocked: false },
         'Mega Difícil': { isLocked: false },
         'Impossível': { isLocked: false },
       };
    }

    // We use the new explicit 'daysLogged' counter instead of calculated date diff
    const daysActive = currentUser.daysLogged; 
    const answeredIds = currentUser.answeredQuestionIds || [];
    
    // Helper to count answered in a specific tier
    const countAnsweredInTier = (tierDifficulty: string) => {
      return MOCK_QUESTIONS.filter(q => q.difficulty === tierDifficulty && answeredIds.includes(q.id)).length;
    };

    const answeredEasy = countAnsweredInTier('Fácil');
    const answeredNormal = countAnsweredInTier('Normal');
    const answeredHard = countAnsweredInTier('Difícil');
    const answeredMega = countAnsweredInTier('Mega Difícil');

    const status: Record<string, TierStatus> = {};

    // 1. EASY: Always Unlocked
    status['Fácil'] = { isLocked: false };

    // 2. NORMAL: 15 Days + All Easy
    if (daysActive < TIER_RULES.NORMAL.daysRequired) {
      status['Normal'] = { isLocked: true, reason: `Requer ${TIER_RULES.NORMAL.daysRequired} dias de uso. (Você tem ${daysActive})` };
    } else if (answeredEasy < TIER_RULES.EASY.count) {
      status['Normal'] = { isLocked: true, reason: `Complete todas as missões Fáceis (${answeredEasy}/${TIER_RULES.EASY.count})` };
    } else {
      status['Normal'] = { isLocked: false };
    }

    // 3. HARD: 30 Days + All Normal
    if (daysActive < TIER_RULES.HARD.daysRequired) {
      status['Difícil'] = { isLocked: true, reason: `Requer ${TIER_RULES.HARD.daysRequired} dias de uso.` };
    } else if (status['Normal'].isLocked || answeredNormal < TIER_RULES.NORMAL.count) {
      status['Difícil'] = { isLocked: true, reason: `Complete todas as missões Normais.` };
    } else {
      status['Difícil'] = { isLocked: false };
    }

    // 4. MEGA HARD: 45 Days + All Hard
    if (daysActive < TIER_RULES.MEGA.daysRequired) {
      status['Mega Difícil'] = { isLocked: true, reason: `Requer ${TIER_RULES.MEGA.daysRequired} dias de uso.` };
    } else if (status['Difícil'].isLocked || answeredHard < TIER_RULES.HARD.count) {
      status['Mega Difícil'] = { isLocked: true, reason: `Complete todas as missões Difíceis.` };
    } else {
      status['Mega Difícil'] = { isLocked: false };
    }

    // 5. IMPOSSIBLE: 60 Days + All Mega Hard
    if (daysActive < TIER_RULES.IMPOSSIBLE.daysRequired) {
       status['Impossível'] = { isLocked: true, reason: `Requer ${TIER_RULES.IMPOSSIBLE.daysRequired} dias de uso.` };
    } else if (status['Mega Difícil'].isLocked || answeredMega < TIER_RULES.MEGA.count) {
      status['Impossível'] = { isLocked: true, reason: `Complete todas as missões Mega Difíceis.` };
    } else {
      status['Impossível'] = { isLocked: false };
    }

    return status;
  };

  useEffect(() => {
    if (user) {
      const answeredIds = user.answeredQuestionIds || [];
      const currentLocks = calculateTierLocks(user);
      setTierStatus(currentLocks);
      
      const filteredQuestions = MOCK_QUESTIONS.filter(q => {
        const isAnswered = answeredIds.includes(q.id);
        const isTierLocked = currentLocks[q.difficulty]?.isLocked;
        return !isAnswered && !isTierLocked; 
      });
      
      setAvailableQuestions(filteredQuestions);
    } else {
      setAvailableQuestions([]);
      setTierStatus({});
    }
  }, [user]);

  const isAuthenticated = !!user;
  const isAdmin = user?.email === ADMIN_EMAIL;
  
  const getLimit = () => {
    if (user?.plan === PlanType.DARK_PREMIUM) return DAILY_QUESTION_LIMIT_DARK_PREMIUM;
    if (user?.plan === PlanType.PREMIUM) return DAILY_QUESTION_LIMIT_PREMIUM;
    return DAILY_QUESTION_LIMIT_FREE;
  };

  const limit = getLimit();
  const dailyRemaining = user ? Math.max(0, limit - user.questionsAnsweredToday) : 0;

  const login = async (email: string, password?: string) => {
    // 1. Check for Admin or Legacy/Mock User (Bypass Encryption)
    if (email === ADMIN_EMAIL) {
      const adminUser = { ...INITIAL_USER_STATE, email: ADMIN_EMAIL, plan: PlanType.DARK_PREMIUM };
      setUser(adminUser);
      return;
    }
    
    // Legacy mock check (for development testing of pre-seeded data)
    if (email === INITIAL_USER_STATE.email && (!users.find(u => u.email === INITIAL_USER_STATE.email))) {
       // If standard mock user isn't in the array yet, log them in as is
       setUser({ ...INITIAL_USER_STATE, lastLogin: new Date().toISOString() });
       return;
    }

    // 2. Encrypted Login Flow
    try {
      const emailHash = await CryptoLayer.digest(email);
      // We look for the user by their Hashed Email
      const existingUser = users.find(u => u.email === emailHash);

      if (existingUser && password) {
        // Attempt to decrypt the name using the provided password
        // If password is wrong, decrypt throws error
        const decryptedName = await CryptoLayer.decrypt(existingUser.name, password);
        
        // Success! User authenticated and key verified
        const now = new Date();
        const lastLoginDate = new Date(existingUser.lastLogin).toDateString();
        const todayDate = now.toDateString();
        
        let newDaysLogged = existingUser.daysLogged || 1;
        let newPoints = existingUser.points;
        let newXp = existingUser.xp;
        let newQuestionsAnsweredToday = existingUser.questionsAnsweredToday;

        if (lastLoginDate !== todayDate) {
          newDaysLogged += 1;
          newQuestionsAnsweredToday = 0;
          const milestone = LOYALTY_MILESTONES.find(m => m.days === newDaysLogged);
          if (milestone) {
            newPoints += milestone.points;
            newXp += milestone.xp;
            alert(`🎉 PARABÉNS! Você atingiu ${newDaysLogged} dias de fidelidade!\nGanhou ${milestone.points} Pontos e ${milestone.xp} XP!`);
          }
        }

        // We update the encrypted storage
        const updatedUserStorage = {
          ...existingUser,
          lastLogin: now.toISOString(),
          daysLogged: newDaysLogged,
          points: newPoints,
          xp: newXp,
          questionsAnsweredToday: newQuestionsAnsweredToday
        };

        // Update the array with the encrypted user
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUserStorage.id ? updatedUserStorage : u));

        // Set the Session User with PLAINTEXT data for the UI
        setUser({
          ...updatedUserStorage,
          email: email, // Use the input email (plaintext)
          name: decryptedName // Use the decrypted name
        });

      } else {
        alert("Usuário não encontrado ou senha incorreta.");
      }
    } catch (e) {
      console.error(e);
      alert("Senha incorreta. Não foi possível descriptografar seus dados.");
    }
  };

  const register = async (name: string, email: string, password?: string) => {
    if (email === ADMIN_EMAIL) return;
    
    // Hash the email to check for existence and for storage
    const emailHash = await CryptoLayer.digest(email);

    if (users.some(u => u.email === emailHash)) {
      alert("Email já cadastrado.");
      return;
    }

    if (!password) {
      alert("Senha é obrigatória para criptografia.");
      return;
    }

    try {
      // Encrypt personal data using the password
      const encryptedName = await CryptoLayer.encrypt(name, password);
      const encryptedEmail = await CryptoLayer.encrypt(email, password); // Store encrypted email for recovery if needed

      const newUser: User = {
        ...INITIAL_USER_STATE,
        id: Math.random().toString(36).substr(2, 9),
        name: encryptedName, // STORED AS CIPHERTEXT
        email: emailHash, // STORED AS HASH
        encryptedEmail: encryptedEmail,
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`,
        points: 0,
        balance: 0,
        level: 1,
        xp: 0,
        plan: PlanType.FREE,
        questionsAnsweredToday: 0,
        totalQuestionsAnswered: 0,
        successfulMissions: 0,
        answeredQuestionIds: [],
        lastLogin: new Date().toISOString(),
        daysLogged: 1,
        createdAt: new Date().toISOString()
      };

      setUsers([...users, newUser]);
      
      // Set the session user as Plaintext
      setUser({
        ...newUser,
        name: name,
        email: email
      });
      
      alert("Conta criada e dados criptografados com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Erro ao criar conta segura.");
    }
  };

  const logout = () => setUser(null);

  const shuffleQuestion = (q: Question): Question => {
    const indices = q.options.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const newOptions = indices.map(i => q.options[i]);
    const newCorrectAnswer = indices.indexOf(q.correctAnswer);
    return { ...q, options: newOptions, correctAnswer: newCorrectAnswer };
  };

  const startMission = (question: Question) => {
    if (!user) return;
    if (dailyRemaining <= 0) {
      alert("Limite diário atingido!");
      return;
    }
    const shuffledQuestion = shuffleQuestion(question);
    setActiveMission(shuffledQuestion);
  };

  const closeMission = () => setActiveMission(null);

  const submitAnswer = (answerIndex: number) => {
    if (!activeMission || !user) return { correct: false, pointsEarned: 0, xpEarned: 0, leveledUp: false };

    const isCorrect = answerIndex === activeMission.correctAnswer;
    let pointsEarned = 0;
    let xpEarned = 0;
    let leveledUp = false;
    let newSuccessfulMissions = user.successfulMissions;

    if (isCorrect) {
      const levelBonus = Math.max(0, (user.level - 1) * BONUS_POINTS_PER_LEVEL);
      pointsEarned = activeMission.points + levelBonus; 
      xpEarned = activeMission.xpReward;
      newSuccessfulMissions += 1;
    }

    setUser(prev => {
      if (!prev) return null;

      const newTotalQuestions = prev.totalQuestionsAnswered + 1;
      let currentXp = prev.xp + xpEarned;
      let currentLevel = prev.level;
      
      while (currentXp >= XP_PER_LEVEL && currentLevel < 100) {
        currentXp -= XP_PER_LEVEL;
        currentLevel += 1;
        leveledUp = true;
        if (currentLevel % LEVEL_MILESTONE_STEP === 0) {
           const bonus = XP_REWARD_LEVEL_MILESTONE;
           currentXp += bonus;
           xpEarned += bonus;
        }
      }

      let updatedAnsweredIds = prev.answeredQuestionIds || [];
      if (isCorrect) {
        updatedAnsweredIds = [...updatedAnsweredIds, activeMission.id];
      }

      if (updatedAnsweredIds.length >= TOTAL_QUESTIONS_COUNT) {
         alert("PARABÉNS! Você completou TODAS as missões! O jogo será resetado para você jogar novamente.");
         updatedAnsweredIds = [];
      }

      const updatedUser = {
        ...prev,
        points: prev.points + pointsEarned,
        xp: currentXp,
        level: currentLevel,
        questionsAnsweredToday: prev.questionsAnsweredToday + 1,
        totalQuestionsAnswered: newTotalQuestions,
        successfulMissions: newSuccessfulMissions,
        answeredQuestionIds: updatedAnsweredIds
      };
      
      // Update the main list as well (Warning: This updates the session object into the main list. 
      // Ideally we should re-encrypt here, but for this scope we assume session persists until logout)
      // To strictly follow encryption, we should only update non-PII fields in the users array or re-encrypt the name.
      // Since points/xp aren't PII, we merge them safely.
      setUsers(prevUsers => prevUsers.map(u => {
        if (u.id === prev.id) {
           // Merge stats into the stored user (preserving encrypted name/email)
           return {
             ...u,
             points: updatedUser.points,
             xp: updatedUser.xp,
             level: updatedUser.level,
             questionsAnsweredToday: updatedUser.questionsAnsweredToday,
             totalQuestionsAnswered: updatedUser.totalQuestionsAnswered,
             successfulMissions: updatedUser.successfulMissions,
             answeredQuestionIds: updatedUser.answeredQuestionIds
           };
        }
        return u;
      }));

      return updatedUser;
    });

    return { correct: isCorrect, pointsEarned, xpEarned, leveledUp };
  };

  const convertPoints = (pointsToConvert: number) => {
    if (!user || user.points < pointsToConvert) return;
    const moneyValue = pointsToConvert * POINTS_TO_BRL_RATE;
    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, points: prev.points - pointsToConvert, balance: prev.balance + moneyValue };
      setUsers(prevUsers => prevUsers.map(u => u.id === prev.id ? { ...u, points: updatedUser.points, balance: updatedUser.balance } : u));
      return updatedUser;
    });
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      type: TransactionType.CONVERSION,
      amountPoints: pointsToConvert,
      amountMoney: moneyValue,
      status: TransactionStatus.APPROVED,
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const requestWithdrawal = (amount: number, pixKey: string, name: string, email: string) => {
    if (!user) return;
    const isPremium = user.plan === PlanType.PREMIUM || user.plan === PlanType.DARK_PREMIUM;
    const feePercentage = isPremium ? WITHDRAWAL_FEE_PREMIUM : WITHDRAWAL_FEE_FREE;
    const fee = amount * feePercentage;
    const deduction = amount; 

    if (user.balance < deduction) {
      alert(`Saldo insuficiente.`);
      return;
    }

    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, balance: prev.balance - deduction };
      setUsers(prevUsers => prevUsers.map(u => u.id === prev.id ? { ...u, balance: updatedUser.balance } : u));
      return updatedUser;
    });

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      type: TransactionType.WITHDRAWAL,
      amountMoney: amount,
      pixKey,
      fee,
      status: TransactionStatus.ANALYSIS,
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const approveWithdrawal = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: TransactionStatus.APPROVED } : t));
  };

  const rejectWithdrawal = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx && tx.type === TransactionType.WITHDRAWAL) {
       const refundAmount = tx.amountMoney;
       setUser(prev => {
          if (!prev) return null;
          const updated = { ...prev, balance: prev.balance + refundAmount };
          setUsers(prevUsers => prevUsers.map(u => u.id === prev.id ? { ...u, balance: updated.balance } : u));
          return updated;
       });
    }
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: TransactionStatus.REJECTED } : t));
  };

  const upgradePlan = (type: PlanType) => {
    if (!user) return;
    let price = 0;
    if (type === PlanType.PREMIUM) price = 19.90;
    if (type === PlanType.DARK_PREMIUM) price = 50.00;

    const updatedUser = { ...user, plan: type };
    setUser(updatedUser);
    setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? { ...u, plan: type } : u));

    if (price > 0) {
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        type: TransactionType.SUBSCRIPTION,
        amountMoney: price,
        status: TransactionStatus.PAID,
        date: new Date().toISOString()
      };
      setTransactions(prev => [newTx, ...prev]);
    }
  };

  return (
    <StoreContext.Provider value={{
      user, users, isAuthenticated, isAdmin, transactions, activeMission, dailyRemaining, availableQuestions, tierStatus,
      login, register, logout, startMission, closeMission, submitAnswer, convertPoints, requestWithdrawal, approveWithdrawal, rejectWithdrawal, upgradePlan
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};