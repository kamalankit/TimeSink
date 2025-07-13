export interface Goal {
  id: string;
  name: string;
  description?: string;
  category: string;
  deadline: Date;
  dailyTarget: number;
  unit: string;
  createdAt: Date;
  isActive: boolean;
  priority: number;
  checkIns: CheckIn[];
  completedDays: number;
  currentStreak: number;
  bestStreak: number;
  totalProgress: number;
  isCompleted: boolean;
}

export interface CheckIn {
  id: string;
  goalId: string;
  date: Date;
  progress: number;
  mood: 'terrible' | 'bad' | 'okay' | 'good' | 'great';
  difficulty: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  isCompleted: boolean;
}

export interface Category {
  name: string;
  color: string;
  icon: string;
}

export interface Stats {
  totalGoals: number;
  completedGoals: number;
  currentStreak: number;
  bestStreak: number;
  successRate: number;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  tertiary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  glass: string;
  glassStrong: string;
  shadow: string;
  gradient: string[];
}