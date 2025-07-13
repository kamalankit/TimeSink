import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Settings, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  TrendingUp,
  Target,
  Award
} from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { StatusCard } from '@/components/ui/StatusCard';
import { Hourglass } from '@/components/ui/Hourglass';
import { useTheme } from '@/contexts/ThemeContext';
import { useGoals } from '@/contexts/GoalContext';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const { colors } = useTheme();
  const { goals, activeGoal, getTotalStats } = useGoals();
  const router = useRouter();
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);

  const stats = getTotalStats();
  const displayGoals = goals.slice(0, 3); // Show top 3 goals

  const handleAddNewGoal = () => {
    router.push('/goals');
  };

  const getDaysRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getGoalProgress = (goal: any) => {
    const totalDays = Math.ceil((goal.deadline.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = getDaysRemaining(goal.deadline);
    return Math.max(0, Math.min(1, (totalDays - daysRemaining) / totalDays));
  };

  const navigateGoal = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentGoalIndex(prev => Math.max(0, prev - 1));
    } else {
      setCurrentGoalIndex(prev => Math.min(displayGoals.length - 1, prev + 1));
    }
  };

  const currentDisplayGoal = displayGoals[currentGoalIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Good morning! 👋
            </Text>
            <Text style={[styles.activeGoal, { color: colors.textSecondary }]}>
              {activeGoal ? activeGoal.name : 'No active goal'}
            </Text>
            {activeGoal && (
              <View style={styles.daysRemaining}>
                <Calendar size={16} color={colors.accent} />
                <Text style={[styles.daysText, { color: colors.accent }]}>
                  {getDaysRemaining(activeGoal.deadline)} days left
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.settingsButton, { backgroundColor: colors.glass }]}
            onPress={() => router.push('/profile')}
          >
            <Settings size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Goal Carousel */}
        {displayGoals.length > 0 && (
          <View style={styles.carouselSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Goals
            </Text>
            
            <View style={styles.carouselContainer}>
              {displayGoals.length > 1 && (
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={() => navigateGoal('left')}
                  disabled={currentGoalIndex === 0}
                >
                  <ChevronLeft 
                    size={24} 
                    color={currentGoalIndex === 0 ? colors.textTertiary : colors.text} 
                  />
                </TouchableOpacity>
              )}
              
              <View style={styles.goalDisplay}>
                {currentDisplayGoal && (
                  <>
                    <Hourglass
                      totalDays={Math.ceil((currentDisplayGoal.deadline.getTime() - currentDisplayGoal.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                      remainingDays={getDaysRemaining(currentDisplayGoal.deadline)}
                      size={120}
                      animated={true}
                    />
                    <GlassCard style={styles.goalCard}>
                      <Text style={[styles.goalName, { color: colors.text }]}>
                        {currentDisplayGoal.name}
                      </Text>
                      <Text style={[styles.goalCategory, { color: colors.textSecondary }]}>
                        {currentDisplayGoal.category}
                      </Text>
                      <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { backgroundColor: colors.tertiary }]}>
                          <View 
                            style={[
                              styles.progressFill,
                              { 
                                width: `${getGoalProgress(currentDisplayGoal) * 100}%`,
                                backgroundColor: colors.accent 
                              }
                            ]} 
                          />
                        </View>
                        <Text style={[styles.progressText, { color: colors.textTertiary }]}>
                          {Math.round(getGoalProgress(currentDisplayGoal) * 100)}% complete
                        </Text>
                      </View>
                    </GlassCard>
                  </>
                )}
              </View>
              
              {displayGoals.length > 1 && (
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={() => navigateGoal('right')}
                  disabled={currentGoalIndex === displayGoals.length - 1}
                >
                  <ChevronRight 
                    size={24} 
                    color={currentGoalIndex === displayGoals.length - 1 ? colors.textTertiary : colors.text} 
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Pagination dots */}
            {displayGoals.length > 1 && (
              <View style={styles.pagination}>
                {displayGoals.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: index === currentGoalIndex ? colors.accent : colors.textTertiary,
                      }
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Statistics */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Progress
          </Text>
          <View style={styles.statsContainer}>
            <StatusCard
              title="Current Streak"
              value={stats.currentStreak}
              icon={<TrendingUp size={20} color={colors.primary} />}
              color={colors.success}
              trend="up"
            />
            <StatusCard
              title="Goals Completed"
              value={stats.completedGoals}
              icon={<Target size={20} color={colors.primary} />}
              color={colors.accent}
            />
            <StatusCard
              title="Success Rate"
              value={`${Math.round(stats.successRate)}%`}
              icon={<Award size={20} color={colors.primary} />}
              color={colors.warning}
              trend={stats.successRate > 70 ? 'up' : 'neutral'}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsContainer}>
            <GlassCard style={styles.actionCard} pressable onPress={() => router.push('/checkin')}>
              <LinearGradient
                colors={colors.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <Text style={[styles.actionTitle, { color: colors.primary }]}>
                  Log Progress
                </Text>
                <Text style={[styles.actionSubtitle, { color: colors.primary }]}>
                  Record today's achievements
                </Text>
              </LinearGradient>
            </GlassCard>
            
            <GlassCard style={styles.actionCard} pressable onPress={() => router.push('/goals')}>
              <LinearGradient
                colors={[colors.success, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <Text style={[styles.actionTitle, { color: colors.primary }]}>
                  Manage Goals
                </Text>
                <Text style={[styles.actionSubtitle, { color: colors.primary }]}>
                  Edit and organize your goals
                </Text>
              </LinearGradient>
            </GlassCard>
          </View>
        </View>

        {/* Add Goal Button */}
        <View style={styles.addGoalSection}>
          <PremiumButton
            title="Add New Goal"
            onPress={handleAddNewGoal}
            icon={<Plus size={20} color={colors.primary} />}
            size="large"
            style={styles.addGoalButton}
          />
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  activeGoal: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  daysRemaining: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navButton: {
    padding: 8,
  },
  goalDisplay: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  goalCard: {
    width: width * 0.7,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  goalName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  goalCategory: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  statsSection: {
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionsContainer: {
    paddingHorizontal: 24,
  },
  actionCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    borderRadius: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    opacity: 0.9,
  },
  addGoalSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  addGoalButton: {
    width: '100%',
  },
});