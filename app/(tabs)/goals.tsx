import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Plus, Calendar, MoveVertical as MoreVertical, Flag, Clock, Target, Trash2, CreditCard as Edit3, ChevronUp, ChevronDown } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { useTheme } from '@/contexts/ThemeContext';
import { useGoals } from '@/contexts/GoalContext';
import { categories } from '@/constants/themes';
import { Goal } from '@/types';

const quickDeadlines = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '60 Days', days: 60 },
  { label: '90 Days', days: 90 },
];

export default function GoalsScreen() {
  const { colors } = useTheme();
  const { goals, addGoal, updateGoal, deleteGoal, setActiveGoal, reorderGoals } = useGoals();
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedQuickDeadline, setSelectedQuickDeadline] = useState<number>(30);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Fitness',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    dailyTarget: '1',
    unit: 'task'
  });

  const handleAddGoal = () => {
    setEditingGoal(null);
    setSelectedQuickDeadline(30);
    setShowDatePicker(false);
    setFormData({
      name: '',
      description: '',
      category: 'Fitness',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      dailyTarget: '1',
      unit: 'task'
    });
    setShowModal(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setSelectedQuickDeadline(0); // Custom date for existing goals
    setShowDatePicker(false);
    setFormData({
      name: goal.name,
      description: goal.description || '',
      category: goal.category,
      deadline: new Date(goal.deadline),
      dailyTarget: goal.dailyTarget.toString(),
      unit: goal.unit
    });
    setShowModal(true);
  };

  const handleQuickDeadlineSelect = (days: number) => {
    setSelectedQuickDeadline(days);
    if (days > 0) {
      const newDeadline = new Date();
      newDeadline.setDate(newDeadline.getDate() + days);
      setFormData(prev => ({ ...prev, deadline: newDeadline }));
    } else {
      // Custom date selected
      setShowDatePicker(true);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, deadline: selectedDate }));
      setSelectedQuickDeadline(0); // Mark as custom when date is manually selected
    }
  };

  const handleCloseDatePicker = () => {
    setShowDatePicker(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setShowDatePicker(false);
    setSelectedQuickDeadline(30);
    setEditingGoal(null);
  };

  const handleSaveGoal = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a goal name');
      return;
    }

    if (!formData.dailyTarget.trim() || isNaN(parseFloat(formData.dailyTarget))) {
      Alert.alert('Error', 'Please enter a valid daily target');
      return;
    }

    if (formData.deadline <= new Date()) {
      Alert.alert('Error', 'Please select a future deadline');
      return;
    }

    const goalData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      deadline: formData.deadline,
      dailyTarget: parseFloat(formData.dailyTarget),
      unit: formData.unit.trim() || 'task',
      createdAt: editingGoal?.createdAt || new Date(),
      isActive: editingGoal?.isActive || false
    };

    try {
      if (editingGoal) {
        updateGoal(editingGoal.id, goalData);
      } else {
        addGoal(goalData);
      }
      handleModalClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    }
  };

  const handleDeleteGoal = (goal: Goal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(goal.id) }
      ]
    );
  };

  const handleMoveGoal = (goalIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? goalIndex - 1 : goalIndex + 1;
    if (newIndex >= 0 && newIndex < goals.length) {
      reorderGoals(goalIndex, newIndex);
    }
  };

  const getDaysRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getUrgencyColor = (days: number) => {
    if (days > 30) return colors.success;
    if (days > 7) return colors.warning;
    return colors.danger;
  };

  const getCategoryInfo = (categoryName: string) => {
    return categories.find(c => c.name === categoryName) || categories[0];
  };

  const formatDeadlineDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Goals</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            onPress={handleAddGoal}
          >
            <Plus size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Goals List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Target size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Goals Yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Create your first goal to start tracking your progress
              </Text>
              <PremiumButton
                title="Create Your First Goal"
                onPress={handleAddGoal}
                style={styles.emptyButton}
              />
            </View>
          ) : (
            goals.map((goal, index) => {
              const daysRemaining = getDaysRemaining(goal.deadline);
              const categoryInfo = getCategoryInfo(goal.category);
              const totalDays = Math.ceil((goal.deadline.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
              const progress = totalDays > 0 ? (goal.completedDays / totalDays) * 100 : 0;

              return (
                <GlassCard key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={[styles.priorityBadge, { backgroundColor: colors.accent }]}>
                      <Text style={[styles.priorityText, { color: colors.primary }]}>
                        #{index + 1}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.moreButton}
                      onPress={() => {
                        Alert.alert(
                          'Goal Options',
                          `Choose an action for "${goal.name}"`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Edit', onPress: () => handleEditGoal(goal) },
                            ...(index > 0 ? [{ text: 'Move Up', onPress: () => handleMoveGoal(index, 'up') }] : []),
                            ...(index < goals.length - 1 ? [{ text: 'Move Down', onPress: () => handleMoveGoal(index, 'down') }] : []),
                            { text: 'Delete', style: 'destructive', onPress: () => handleDeleteGoal(goal) }
                          ]
                        );
                      }}
                    >
                      <MoreVertical size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.goalName, { color: colors.text }]}>
                    {goal.name}
                  </Text>

                  <View style={styles.goalMeta}>
                    <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
                      <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
                        {goal.category}
                      </Text>
                    </View>
                    
                    <View style={styles.deadlineContainer}>
                      <Calendar size={14} color={colors.textSecondary} />
                      <Text style={[styles.deadlineText, { color: colors.textSecondary }]}>
                        {goal.deadline.toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.daysContainer}>
                    <Clock size={16} color={getUrgencyColor(daysRemaining)} />
                    <Text style={[styles.daysText, { color: getUrgencyColor(daysRemaining) }]}>
                      {daysRemaining} days remaining
                    </Text>
                  </View>

                  {goal.description && (
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                      {goal.description}
                    </Text>
                  )}

                  <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {goal.completedDays}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                        Days Done
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {goal.currentStreak}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                        Streak
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {Math.round(progress)}%
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                        Progress
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: colors.tertiary }]}>
                      <View 
                        style={[
                          styles.progressFill,
                          { 
                            width: `${Math.min(100, progress)}%`,
                            backgroundColor: colors.accent 
                          }
                        ]} 
                      />
                    </View>
                  </View>

                  <PremiumButton
                    title={goal.isActive ? "Active Goal" : "Set Active"}
                    onPress={() => setActiveGoal(goal.id)}
                    variant={goal.isActive ? "secondary" : "primary"}
                    disabled={goal.isActive}
                    style={styles.setActiveButton}
                  />
                </GlassCard>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Create/Edit Goal Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleModalClose}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.primary }]}>
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleModalClose}>
                <Text style={[styles.cancelButton, { color: colors.accent }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </Text>
              <TouchableOpacity onPress={handleSaveGoal}>
                <Text style={[styles.saveButton, { color: colors.accent }]}>
                  {editingGoal ? 'Save' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Goal Name */}
              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Goal Name *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.secondary,
                    color: colors.text,
                    borderColor: colors.tertiary
                  }]}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter your goal name"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              {/* Description */}
              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: colors.secondary,
                    color: colors.text,
                    borderColor: colors.tertiary
                  }]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Describe your goal (optional)"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Category */}
              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.name}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: formData.category === category.name 
                            ? category.color 
                            : colors.secondary,
                          borderColor: category.color
                        }
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, category: category.name }))}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        { 
                          color: formData.category === category.name 
                            ? colors.primary 
                            : colors.text 
                        }
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Quick Deadline Selection */}
              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Deadline</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deadlineScroll}>
                  {quickDeadlines.map((deadline) => (
                    <TouchableOpacity
                      key={deadline.label}
                      style={[
                        styles.deadlineChip,
                        {
                          backgroundColor: selectedQuickDeadline === deadline.days 
                            ? colors.accent 
                            : colors.secondary,
                          borderColor: colors.accent
                        }
                      ]}
                      onPress={() => handleQuickDeadlineSelect(deadline.days)}
                    >
                      <Text style={[
                        styles.deadlineChipText,
                        { 
                          color: selectedQuickDeadline === deadline.days 
                            ? colors.primary 
                            : colors.text 
                        }
                      ]}>
                        {deadline.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[
                      styles.deadlineChip,
                      {
                        backgroundColor: selectedQuickDeadline === 0 
                          ? colors.accent 
                          : colors.secondary,
                        borderColor: colors.accent
                      }
                    ]}
                    onPress={() => handleQuickDeadlineSelect(0)}
                  >
                    <Text style={[
                      styles.deadlineChipText,
                      { 
                        color: selectedQuickDeadline === 0 
                          ? colors.primary 
                          : colors.text 
                      }
                    ]}>
                      Custom
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Date Preview */}
              <GlassCard style={styles.datePreviewCard}>
                <View style={styles.datePreviewContent}>
                  <Calendar size={20} color={colors.accent} />
                  <Text style={[styles.datePreviewText, { color: colors.text }]}>
                    {formatDeadlineDate(formData.deadline)}
                  </Text>
                </View>
                {selectedQuickDeadline === 0 && (
                  <TouchableOpacity 
                    style={styles.customDateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={[styles.customDateButtonText, { color: colors.accent }]}>
                      Change Date
                    </Text>
                  </TouchableOpacity>
                )}
              </GlassCard>

              {/* Daily Target */}
              <View style={styles.formRow}>
                <View style={[styles.formSection, { flex: 2 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Daily Target *</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colors.secondary,
                      color: colors.text,
                      borderColor: colors.tertiary
                    }]}
                    value={formData.dailyTarget}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, dailyTarget: text }))}
                    placeholder="1"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.formSection, { flex: 1, marginLeft: 16 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Unit</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colors.secondary,
                      color: colors.text,
                      borderColor: colors.tertiary
                    }]}
                    value={formData.unit}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, unit: text }))}
                    placeholder="task"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.modalBottomPadding} />
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseDatePicker}
      >
        <View style={[styles.datePickerContainer, { backgroundColor: colors.primary }]}>
          <SafeAreaView style={styles.datePickerSafeArea}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={handleCloseDatePicker}>
                <Text style={[styles.cancelButton, { color: colors.accent }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.datePickerTitle, { color: colors.text }]}>
                Select Deadline
              </Text>
              <TouchableOpacity onPress={handleCloseDatePicker}>
                <Text style={[styles.saveButton, { color: colors.accent }]}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.datePickerContent}>
              <DateTimePicker
                value={formData.deadline}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={styles.datePicker}
                textColor={colors.text}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  emptyButton: {
    paddingHorizontal: 32,
  },
  goalCard: {
    padding: 20,
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  moreButton: {
    padding: 4,
  },
  goalName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  daysText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  setActiveButton: {
    width: '100%',
  },
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  saveButton: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginHorizontal: -4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  deadlineScroll: {
    marginHorizontal: -4,
  },
  deadlineChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  deadlineChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  datePreviewCard: {
    padding: 16,
    marginBottom: 16,
  },
  datePreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  datePreviewText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 12,
    flex: 1,
  },
  customDateButton: {
    alignSelf: 'flex-start',
  },
  customDateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  datePicker: {
    marginVertical: 16,
  },
  datePickerContainer: {
    flex: 1,
  },
  datePickerSafeArea: {
    flex: 1,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  datePickerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  datePickerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalBottomPadding: {
    height: 40,
  },
});