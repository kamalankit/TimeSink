import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, CheckIn, Stats } from '@/types';

interface GoalContextType {
  goals: Goal[];
  activeGoal: Goal | null;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  setActiveGoal: (id: string) => void;
  reorderGoals: (fromIndex: number, toIndex: number) => void;
  addCheckIn: (goalId: string, checkIn: Omit<CheckIn, 'id'>) => void;
  getTotalStats: () => Stats;
  loading: boolean;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

interface GoalProviderProps {
  children: ReactNode;
}

export function GoalProvider({ children }: GoalProviderProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Priority calculation function
  const calculateGoalPriority = (goal: Goal): number => {
    const now = new Date();
    const daysRemaining = Math.ceil((goal.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.ceil((goal.deadline.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const progressRatio = totalDays > 0 ? goal.completedDays / totalDays : 0;

    // Base priority calculation
    let priority = 0;

    // Urgency factor (most important)
    if (goal.isCompleted) {
      priority += 10000; // Completed goals go to bottom
    } else if (daysRemaining <= 0) {
      priority += 1; // Overdue goals get highest priority
    } else if (daysRemaining <= 7) {
      priority += 100; // Due within a week
    } else if (daysRemaining <= 30) {
      priority += 500; // Due within a month
    } else {
      priority += daysRemaining; // Further out goals
    }

    // Streak momentum boost
    if (goal.currentStreak > 0) {
      priority -= goal.currentStreak * 10; // Active streaks get priority boost
    }

    // Progress factor
    priority += (1 - progressRatio) * 50; // Less progress = higher priority

    return Math.max(1, priority);
  };

  // Sort goals by priority
  const sortGoalsByPriority = (goalsList: Goal[]): Goal[] => {
    return goalsList.sort((a, b) => {
      // Manual priority overrides automatic calculation
      if (a.priority >= 1000 && b.priority >= 1000) {
        return a.priority - b.priority;
      }
      if (a.priority >= 1000) return -1;
      if (b.priority >= 1000) return 1;

      const aPriority = calculateGoalPriority(a);
      const bPriority = calculateGoalPriority(b);
      return aPriority - bPriority;
    });
  };

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    saveGoals();
    // Auto-set active goal to highest priority incomplete goal
    if (goals.length > 0) {
      const sortedGoals = sortGoalsByPriority([...goals]);
      const highestPriorityIncomplete = sortedGoals.find(g => !g.isCompleted && !g.isActive);
      if (highestPriorityIncomplete && !goals.some(g => g.isActive)) {
        setActiveGoal(highestPriorityIncomplete.id);
      }
    }
  }, [goals]);

  const loadGoals = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem('goals');
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals).map((goal: any) => ({
          ...goal,
          deadline: new Date(goal.deadline),
          createdAt: new Date(goal.createdAt),
          checkIns: goal.checkIns.map((checkIn: any) => ({
            ...checkIn,
            date: new Date(checkIn.date)
          }))
        }));
        const sortedGoals = sortGoalsByPriority(parsedGoals);
        setGoals(sortedGoals);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGoals = async () => {
    try {
      await AsyncStorage.setItem('goals', JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const addGoal = (goalData: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      checkIns: [],
      completedDays: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalProgress: 0,
      isCompleted: false,
      priority: calculateGoalPriority({
        ...goalData,
        id: '',
        checkIns: [],
        completedDays: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalProgress: 0,
        isCompleted: false,
        priority: 0
      })
    };
    setGoals(prev => sortGoalsByPriority([...prev, newGoal]));
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => {
      const updated = prev.map(goal => 
        goal.id === id ? { ...goal, ...updates } : goal
      );
      return sortGoalsByPriority(updated);
    });
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const setActiveGoal = (id: string) => {
    setGoals(prev => prev.map(goal => ({
      ...goal,
      isActive: goal.id === id
    })));
  };

  const reorderGoals = (fromIndex: number, toIndex: number) => {
    setGoals(prev => {
      const newGoals = [...prev];
      const [removed] = newGoals.splice(fromIndex, 1);
      newGoals.splice(toIndex, 0, removed);
      // Assign manual priority values to maintain order
      return newGoals.map((goal, index) => ({
        ...goal,
        priority: (index + 1) * 1000 // Large values to override automatic priority
      }));
    });
  };

  const addCheckIn = (goalId: string, checkInData: Omit<CheckIn, 'id'>) => {
    const newCheckIn: CheckIn = {
      ...checkInData,
      id: Date.now().toString()
    };

    setGoals(prev => {
      const updatedGoals = prev.map(goal => {
        if (goal.id === goalId) {
          const updatedCheckIns = [...goal.checkIns, newCheckIn];
          const completedDays = updatedCheckIns.filter(c => c.isCompleted).length;
          const totalProgress = updatedCheckIns.reduce((sum, c) => sum + c.progress, 0);
          
          // Calculate streak
          let currentStreak = 0;
          const sortedCheckIns = updatedCheckIns.sort((a, b) => b.date.getTime() - a.date.getTime());
          for (let i = 0; i < sortedCheckIns.length; i++) {
            if (sortedCheckIns[i].isCompleted) {
              currentStreak++;
            } else {
              break;
            }
          }

          const bestStreak = Math.max(goal.bestStreak, currentStreak);
          const daysTotal = Math.ceil((goal.deadline.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          const isCompleted = completedDays >= daysTotal;

          return {
            ...goal,
            checkIns: updatedCheckIns,
            completedDays,
            currentStreak,
            bestStreak,
            totalProgress,
            isCompleted
          };
        }
        return goal;
      });
      
      // Re-sort goals after check-in
      return sortGoalsByPriority(updatedGoals);
    });
  };

  const getTotalStats = (): Stats => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.isCompleted).length;
    const currentStreak = Math.max(...goals.map(g => g.currentStreak), 0);
    const bestStreak = Math.max(...goals.map(g => g.bestStreak), 0);
    const successRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    return {
      totalGoals,
      completedGoals,
      currentStreak,
      bestStreak,
      successRate
    };
  };

  const activeGoal = goals.find(g => g.isActive) || null;

  return (
    <GoalContext.Provider value={{
      goals,
      activeGoal,
      addGoal,
      updateGoal,
      deleteGoal,
      setActiveGoal,
      reorderGoals,
      addCheckIn,
      getTotalStats,
      loading
    }}>
      {children}
    </GoalContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
}