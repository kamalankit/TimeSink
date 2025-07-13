import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  Activity,
  Quote
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusCard } from '@/components/ui/StatusCard';
import { useTheme } from '@/contexts/ThemeContext';
import { useGoals } from '@/contexts/GoalContext';
import { categories, motivationalQuotes, moodEmojis } from '@/constants/themes';

export default function Insights() {
  const { colors } = useTheme();
  const { goals, getTotalStats } = useGoals();

  const stats = getTotalStats();
  
  // Calculate category breakdown
  const categoryStats = categories.map(category => {
    const categoryGoals = goals.filter(g => g.category === category.name);
    const completedGoals = categoryGoals.filter(g => g.isCompleted).length;
    const totalGoals = categoryGoals.length;
    const percentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    
    return {
      ...category,
      completed: completedGoals,
      total: totalGoals,
      percentage
    };
  }).filter(cat => cat.total > 0);

  // Get recent activity
  const recentActivity = goals
    .flatMap(goal => 
      goal.checkIns.map(checkIn => ({
        ...checkIn,
        goalName: goal.name,
        goalCategory: goal.category
      }))
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  // Random motivational quote
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const overallProgress = goals.length > 0 
    ? (goals.filter(g => g.isCompleted).length / goals.length) * 100 
    : 0;

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
          <Text style={[styles.title, { color: colors.text }]}>
            Progress Insights
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your journey to success
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <StatusCard
            title="Completed Goals"
            value={stats.completedGoals}
            icon={<Target size={20} color={colors.primary} />}
            color={colors.success}
            subtitle={`of ${stats.totalGoals} total`}
            trend={stats.completedGoals > 0 ? 'up' : 'neutral'}
          />
          <StatusCard
            title="Best Streak"
            value={stats.bestStreak}
            icon={<TrendingUp size={20} color={colors.primary} />}
            color={colors.accent}
            subtitle="days in a row"
            trend="up"
          />
          <StatusCard
            title="Success Rate"
            value={`${Math.round(stats.successRate)}%`}
            icon={<Award size={20} color={colors.primary} />}
            color={colors.warning}
            subtitle="completion rate"
            trend={stats.successRate > 70 ? 'up' : 'neutral'}
          />
        </View>

        {/* Overall Progress */}
        <GlassCard style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Overall Progress
            </Text>
            <Text style={[styles.progressPercentage, { color: colors.accent }]}>
              {Math.round(overallProgress)}%
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.tertiary }]}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${overallProgress}%`,
                    backgroundColor: colors.accent 
                  }
                ]} 
              />
            </View>
          </View>
          
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {stats.completedGoals} of {stats.totalGoals} goals completed
          </Text>
        </GlassCard>

        {/* Goal Categories */}
        {categoryStats.length > 0 && (
          <GlassCard style={styles.categoriesCard}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Goal Categories
            </Text>
            <View style={styles.categoriesList}>
              {categoryStats.map((category) => (
                <View key={category.name} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      <View 
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: category.color + '20' }
                        ]}
                      >
                        <Text style={styles.categoryIconText}>
                          {category.name.charAt(0)}
                        </Text>
                      </View>
                      <Text style={[styles.categoryName, { color: colors.text }]}>
                        {category.name}
                      </Text>
                    </View>
                    <Text style={[styles.categoryPercentage, { color: colors.textSecondary }]}>
                      {Math.round(category.percentage)}%
                    </Text>
                  </View>
                  
                  <View style={styles.categoryProgressContainer}>
                    <View style={[styles.categoryProgressBar, { backgroundColor: colors.tertiary }]}>
                      <View 
                        style={[
                          styles.categoryProgressFill,
                          { 
                            width: `${category.percentage}%`,
                            backgroundColor: category.color 
                          }
                        ]} 
                      />
                    </View>
                  </View>
                  
                  <Text style={[styles.categoryStats, { color: colors.textTertiary }]}>
                    {category.completed}/{category.total} goals completed
                  </Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <GlassCard style={styles.activityCard}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Recent Activity
            </Text>
            <View style={styles.activityList}>
              {recentActivity.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Text style={styles.moodEmoji}>
                      {moodEmojis[activity.mood]}
                    </Text>
                  </View>
                  
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityGoal, { color: colors.text }]}>
                      {activity.goalName}
                    </Text>
                    <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
                      {activity.date.toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.activityBadge,
                    {
                      backgroundColor: activity.isCompleted 
                        ? colors.success + '20' 
                        : colors.warning + '20'
                    }
                  ]}>
                    <Text style={[
                      styles.activityBadgeText,
                      { 
                        color: activity.isCompleted ? colors.success : colors.warning 
                      }
                    ]}>
                      {activity.isCompleted ? 'Completed' : 'In Progress'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Motivational Quote */}
        <GlassCard style={styles.quoteCard}>
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quoteGradient}
          >
            <Quote size={24} color={colors.primary} style={styles.quoteIcon} />
            <Text style={[styles.quoteText, { color: colors.primary }]}>
              "{randomQuote.text}"
            </Text>
            <Text style={[styles.quoteAuthor, { color: colors.primary }]}>
              — {randomQuote.author}
            </Text>
          </LinearGradient>
        </GlassCard>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressCard: {
    margin: 24,
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  progressPercentage: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  categoriesCard: {
    margin: 24,
    padding: 20,
  },
  categoriesList: {
    marginTop: 16,
  },
  categoryItem: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  categoryPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  categoryProgressContainer: {
    marginBottom: 4,
  },
  categoryProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  categoryStats: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  activityCard: {
    margin: 24,
    padding: 20,
  },
  activityList: {
    marginTop: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moodEmoji: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityGoal: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activityBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  quoteCard: {
    margin: 24,
    overflow: 'hidden',
  },
  quoteGradient: {
    padding: 24,
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});