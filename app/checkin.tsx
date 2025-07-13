import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Star } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { useTheme } from '@/contexts/ThemeContext';
import { useGoals } from '@/contexts/GoalContext';
import { moodEmojis } from '@/constants/themes';
import { CheckIn } from '@/types';

const moods = [
  { key: 'terrible', emoji: '😞', label: 'Terrible' },
  { key: 'bad', emoji: '😕', label: 'Bad' },
  { key: 'okay', emoji: '😐', label: 'Okay' },
  { key: 'good', emoji: '😊', label: 'Good' },
  { key: 'great', emoji: '😄', label: 'Great' }
] as const;

const difficulties = [1, 2, 3, 4, 5];

export default function CheckInScreen() {
  const { colors } = useTheme();
  const { activeGoal, addCheckIn } = useGoals();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [progress, setProgress] = useState('');
  const [selectedMood, setSelectedMood] = useState<CheckIn['mood'] | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeGoal) {
      Alert.alert('No Active Goal', 'Please set an active goal first.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [activeGoal]);

  const handleSubmit = async () => {
    if (!activeGoal) return;

    if (!progress.trim() || selectedMood === null || difficulty === null) {
      Alert.alert('Missing Information', 'Please fill in progress, mood, and difficulty level.');
      return;
    }

    const progressValue = parseFloat(progress);
    if (isNaN(progressValue) || progressValue < 0) {
      Alert.alert('Invalid Progress', 'Please enter a valid progress value.');
      return;
    }

    setLoading(true);

    try {
      const checkIn: Omit<CheckIn, 'id'> = {
        goalId: activeGoal.id,
        date: new Date(),
        progress: progressValue,
        mood: selectedMood,
        difficulty,
        notes: notes.trim(),
        isCompleted: progressValue >= activeGoal.dailyTarget
      };

      addCheckIn(activeGoal.id, checkIn);

      Alert.alert(
        'Progress Logged!',
        checkIn.isCompleted 
          ? `Great job! You've completed your daily target of ${activeGoal.dailyTarget} ${activeGoal.unit}.`
          : `Progress saved! You've made ${progressValue} ${activeGoal.unit} of progress today.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save your progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCompletionBadge = () => {
    if (!progress.trim() || !activeGoal) return null;

    const progressValue = parseFloat(progress);
    if (isNaN(progressValue)) return null;

    const percentage = (progressValue / activeGoal.dailyTarget) * 100;
    const isCompleted = progressValue >= activeGoal.dailyTarget;

    return (
      <View style={[
        styles.completionBadge,
        {
          backgroundColor: isCompleted ? colors.success : colors.warning,
        }
      ]}>
        {isCompleted && <Check size={16} color={colors.primary} />}
        <Text style={[styles.completionText, { color: colors.primary }]}>
          {Math.round(percentage)}%
        </Text>
      </View>
    );
  };

  if (!activeGoal) {
    return (
      <View style={[styles.container, { backgroundColor: colors.primary }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>
              No active goal found
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Log Progress</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Current Date */}
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>

          {/* Goal Information */}
          <GlassCard style={styles.goalCard}>
            <Text style={[styles.goalName, { color: colors.text }]}>
              {activeGoal.name}
            </Text>
            <Text style={[styles.goalTarget, { color: colors.textSecondary }]}>
              Daily Target: {activeGoal.dailyTarget} {activeGoal.unit}
            </Text>
            {activeGoal.description && (
              <Text style={[styles.goalDescription, { color: colors.textTertiary }]}>
                {activeGoal.description}
              </Text>
            )}
          </GlassCard>

          {/* Progress Input */}
          <GlassCard style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Today's Progress
              </Text>
              {getCompletionBadge()}
            </View>
            
            <View style={styles.progressInputContainer}>
              <TextInput
                style={[styles.progressInput, { 
                  backgroundColor: colors.secondary,
                  color: colors.text,
                  borderColor: colors.tertiary
                }]}
                value={progress}
                onChangeText={setProgress}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
              <Text style={[styles.unitText, { color: colors.textSecondary }]}>
                {activeGoal.unit}
              </Text>
            </View>

            {/* Progress Visualization */}
            {progress.trim() && !isNaN(parseFloat(progress)) && (
              <View style={styles.progressVisualization}>
                <View style={[styles.progressBar, { backgroundColor: colors.tertiary }]}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${Math.min(100, (parseFloat(progress) / activeGoal.dailyTarget) * 100)}%`,
                        backgroundColor: parseFloat(progress) >= activeGoal.dailyTarget ? colors.success : colors.accent
                      }
                    ]} 
                  />
                </View>
              </View>
            )}
          </GlassCard>

          {/* Mood Selection */}
          <GlassCard style={styles.moodCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              How are you feeling?
            </Text>
            <View style={styles.moodContainer}>
              {moods.map((mood) => (
                <TouchableOpacity
                  key={mood.key}
                  style={[
                    styles.moodOption,
                    {
                      backgroundColor: selectedMood === mood.key ? colors.accent : colors.secondary,
                      borderColor: selectedMood === mood.key ? colors.accent : colors.tertiary,
                    }
                  ]}
                  onPress={() => setSelectedMood(mood.key)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabel,
                    { 
                      color: selectedMood === mood.key ? colors.primary : colors.textSecondary 
                    }
                  ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          {/* Difficulty Rating */}
          <GlassCard style={styles.difficultyCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Difficulty Level
            </Text>
            <View style={styles.difficultyContainer}>
              {difficulties.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={styles.difficultyOption}
                  onPress={() => setDifficulty(level)}
                >
                  <Star
                    size={32}
                    color={difficulty && level <= difficulty ? colors.warning : colors.textTertiary}
                    fill={difficulty && level <= difficulty ? colors.warning : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.difficultyLabel, { color: colors.textTertiary }]}>
              1 = Very Easy, 5 = Very Hard
            </Text>
          </GlassCard>

          {/* Notes */}
          <GlassCard style={styles.notesCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Notes (Optional)
            </Text>
            <TextInput
              style={[styles.notesInput, { 
                backgroundColor: colors.secondary,
                color: colors.text,
                borderColor: colors.tertiary
              }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any thoughts about today's progress?"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </GlassCard>

          {/* Submit Button */}
          <PremiumButton
            title="Save Progress"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
            size="large"
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: 24,
  },
  goalCard: {
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  goalName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  goalTarget: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputCard: {
    padding: 20,
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completionText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginLeft: 4,
  },
  progressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  unitText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
  progressVisualization: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  moodCard: {
    padding: 20,
    marginBottom: 24,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  moodOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 60,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  difficultyCard: {
    padding: 20,
    marginBottom: 24,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  difficultyOption: {
    padding: 8,
  },
  difficultyLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  notesCard: {
    padding: 20,
    marginBottom: 32,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 12,
    minHeight: 80,
  },
  submitButton: {
    marginBottom: 24,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
  },
});