import { PlanType, Question } from './types';

export const ADMIN_EMAIL = 'conceicaoeurico75@gmail.com';

// Conversion Rules
export const POINTS_TO_BRL_RATE = 0.001; // 1000 points = R$ 1.00

// Withdrawal Fees
export const WITHDRAWAL_FEE_FREE = 0.25; // 25% for Free users
export const WITHDRAWAL_FEE_PREMIUM = 0.20; // 20% for Premium/Dark users
export const PAYMENT_LINK_BASE = "https://link.mercadopago.com.br/visionapps";

// Withdrawal Tiers
export const WITHDRAWAL_OPTIONS = [10, 15, 20, 25, 30, 50];

// Limits
export const DAILY_QUESTION_LIMIT_FREE = 7;
export const DAILY_QUESTION_LIMIT_PREMIUM = 15;
export const DAILY_QUESTION_LIMIT_DARK_PREMIUM = 100;

// Leveling Rules
export const XP_PER_LEVEL = 1000;
export const BONUS_POINTS_PER_LEVEL = 1;

// Achievement / Milestone Rules
export const MISSION_MILESTONE_STEP = 5;
export const XP_REWARD_MISSION_MILESTONE = 100;

export const LEVEL_MILESTONE_STEP = 5;
export const XP_REWARD_LEVEL_MILESTONE = 400;

// Loyalty Rewards (7, 15, 30 days)
export const LOYALTY_MILESTONES = [
  { days: 7, points: 150, xp: 1500 },
  { days: 15, points: 150, xp: 1500 },
  { days: 30, points: 150, xp: 1500 }
];

// --- MISSION RULES ---
export const TIER_RULES = {
  EASY: { count: 50, points: 10, xp: 50, daysRequired: 0 },
  NORMAL: { count: 40, points: 30, xp: 100, daysRequired: 15 },
  HARD: { count: 30, points: 100, xp: 200, daysRequired: 30 },
  MEGA: { count: 15, points: 300, xp: 500, daysRequired: 45 },
  IMPOSSIBLE: { count: 7, points: 1000, xp: 1500, daysRequired: 60 } // 2 Months
};

// Question Generator Helper
const generateQuestions = (): Question[] => {
  const questions: Question[] = [];
  let idCounter = 1;

  // 1. EASY (50 Questions)
  for (let i = 1; i <= TIER_RULES.EASY.count; i++) {
    questions.push({
      id: `easy_${i}`,
      text: `Pergunta Fácil #${i}: Quanto é ${i} + ${i}?`,
      options: [`${i+i}`, `${i+i+1}`, `${i+i-1}`, `${i*2+2}`],
      correctAnswer: 0,
      points: TIER_RULES.EASY.points,
      xpReward: TIER_RULES.EASY.xp,
      timeLimit: 15,
      category: 'Geral',
      difficulty: 'Fácil'
    });
  }

  // 2. NORMAL (40 Questions)
  for (let i = 1; i <= TIER_RULES.NORMAL.count; i++) {
    questions.push({
      id: `normal_${i}`,
      text: `Pergunta Normal #${i}: Qual a capital do país imaginário ${i}?`,
      options: ['Cidade A', 'Cidade B', `Capital ${i}`, 'Cidade D'],
      correctAnswer: 2,
      points: TIER_RULES.NORMAL.points,
      xpReward: TIER_RULES.NORMAL.xp,
      timeLimit: 20,
      category: 'Geografia',
      difficulty: 'Normal'
    });
  }

  // 3. HARD (30 Questions)
  for (let i = 1; i <= TIER_RULES.HARD.count; i++) {
    questions.push({
      id: `hard_${i}`,
      text: `Pergunta Difícil #${i}: Resolva a equação complexa ${i}x + 10 = 20.`,
      options: ['x=10', 'x=5', 'x=1', 'x=0'],
      correctAnswer: 0, // Placeholder
      points: TIER_RULES.HARD.points,
      xpReward: TIER_RULES.HARD.xp,
      timeLimit: 30,
      category: 'Matemática',
      difficulty: 'Difícil'
    });
  }

  // 4. MEGA HARD (15 Questions)
  for (let i = 1; i <= TIER_RULES.MEGA.count; i++) {
    questions.push({
      id: `mega_${i}`,
      text: `Desafio Mega Difícil #${i}: Teoria Quântica aplicada ao caso ${i}.`,
      options: ['Opção Alpha', 'Opção Beta', 'Opção Gamma', 'Opção Delta'],
      correctAnswer: 1,
      points: TIER_RULES.MEGA.points,
      xpReward: TIER_RULES.MEGA.xp,
      timeLimit: 45,
      category: 'Ciência Avançada',
      difficulty: 'Mega Difícil'
    });
  }

  // 5. IMPOSSIBLE (7 Questions)
  for (let i = 1; i <= TIER_RULES.IMPOSSIBLE.count; i++) {
    questions.push({
      id: `imp_${i}`,
      text: `Missão Impossível #${i}: O segredo do universo número ${i}.`,
      options: ['42', 'Nada', 'Tudo', 'Infinito'],
      correctAnswer: 0,
      points: TIER_RULES.IMPOSSIBLE.points,
      xpReward: TIER_RULES.IMPOSSIBLE.xp,
      timeLimit: 10,
      category: 'Desafio Supremo',
      difficulty: 'Impossível'
    });
  }

  return questions;
};

export const MOCK_QUESTIONS = generateQuestions();
export const TOTAL_QUESTIONS_COUNT = MOCK_QUESTIONS.length;

export const INITIAL_USER_STATE = {
  id: 'u1',
  name: 'Eurico Conceição',
  email: 'conceicaoeurico75@gmail.com',
  photoUrl: 'https://picsum.photos/200',
  points: 12500,
  balance: 25.50,
  level: 12,
  xp: 450,
  plan: PlanType.DARK_PREMIUM, // Default to Dark Premium for this user
  questionsAnsweredToday: 0,
  totalQuestionsAnswered: 49,
  successfulMissions: 0,
  answeredQuestionIds: [], 
  lastLogin: new Date().toISOString(),
  daysLogged: 12, // Initial days state
  createdAt: new Date('2023-01-01').toISOString()
};