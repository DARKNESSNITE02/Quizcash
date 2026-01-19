export enum UserLevelTitle {
  BEGINNER = 'Iniciante',
  INTERMEDIATE = 'Intermediário',
  ADVANCED = 'Avançado',
  EXPERT = 'Mestre',
  LEGEND = 'Lenda'
}

export enum PlanType {
  FREE = 'Gratuito',
  PREMIUM = 'Premium',
  DARK_PREMIUM = 'Dark Premium'
}

export enum TransactionStatus {
  PENDING = 'Pendente',
  ANALYSIS = 'Em Análise',
  APPROVED = 'Aprovado',
  PAID = 'Pago',
  REJECTED = 'Recusado'
}

export enum TransactionType {
  CONVERSION = 'Conversão',
  WITHDRAWAL = 'Saque',
  SUBSCRIPTION = 'Assinatura'
}

export interface User {
  id: string;
  name: string; // Stored as Ciphertext in DB, Plaintext in Session
  email: string; // Stored as Hash in DB, Plaintext in Session
  encryptedEmail?: string; // Backup of encrypted email for recovery if needed
  photoUrl: string;
  points: number;
  balance: number; // In BRL
  level: number; // 1 to 100
  xp: number;
  plan: PlanType;
  questionsAnsweredToday: number;
  totalQuestionsAnswered: number;
  successfulMissions: number; // Track successfully completed missions
  answeredQuestionIds: string[]; // List of IDs of questions successfully answered
  lastLogin: string; // ISO String of last login timestamp
  daysLogged: number; // Counter of unique days logged in
  createdAt: string; // To calculate days active
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index
  points: number;
  xpReward: number; // New field for specific XP
  timeLimit: number; // Seconds
  category: string;
  difficulty: 'Fácil' | 'Normal' | 'Difícil' | 'Mega Difícil' | 'Impossível';
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amountPoints?: number;
  amountMoney: number;
  pixKey?: string;
  fee?: number;
  status: TransactionStatus;
  date: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[]; // Mock database
  transactions: Transaction[];
  activeMission: Question | null;
  dailyLimit: number;
}