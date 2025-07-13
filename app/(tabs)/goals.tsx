import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
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
  { label: 'Custom', days: 0 },
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '60 Days', days: 60 },
  { label: '90 Days', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
];

export default function GoalsScreen() {
  const { colors } = useTheme();
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();
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

  const formatDeadlineDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (goal: Goal) => {
    const daysElapsed = Math.floor((new Date().getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.floor((new Date(goal.deadline).getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return Math.min((daysElapsed / totalDays) * 100, 100);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Goals</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            onPress={handleAddGoal}
          >
            <Plus size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Target size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Goals Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Create your first goal to start tracking your progress
            </Text>
            <TouchableOpacity
              style={[styles.createFirstGoalButton, { backgroundColor: colors.accent }]}
              onPress={handleAddGoal}
            >
              <Text style={[styles.createFirstGoalText, { color: colors.primary }]}>
                Create Your First Goal
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
            {goals.map((goal) => (
              <GlassCard key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalName, { color: colors.text }]}>{goal.name}</Text>
                    <Text style={[styles.goalCategory, { color: colors.textSecondary }]}>
                      {goal.category}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleEditGoal(goal)}>
                    <Edit3 size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {goal.description && (
                  <Text style={[styles.goalDescription, { color: colors.textSecondary }]}>
                    {goal.description}
                  </Text>
                )}

                <View style={styles.goalStats}>
                  <View style={styles.statItem}>
                    <Clock size={16} color={colors.accent} />
                    <Text style={[styles.statText, { color: colors.text }]}>
                      {getDaysRemaining(new Date(goal.deadline))} days left
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Flag size={16} color={colors.accent} />
                    <Text style={[styles.statText, { color: colors.text }]}>
                      {goal.dailyTarget} {goal.unit}/day
                    </Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: colors.secondary }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: colors.accent,
                          width: `${getProgressPercentage(goal)}%`
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                    {Math.round(getProgressPercentage(goal))}% complete
                  </Text>
                </View>
              </GlassCard>
            ))}
          </ScrollView>
        )}

        <PremiumButton />
      </SafeAreaView>

      {/* Goal Creation/Edit Modal */}
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
                <Text style={[styles.label, { color: colors.text }]}>Goal Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.secondary, color: colors.text }]}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter your goal..."
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Description */}
              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.secondary, color: colors.text }]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Describe your goal..."
                  placeholderTextColor={colors.textSecondary}
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
                            ? colors.accent 
                            : colors.secondary,
                          borderColor: colors.accent
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

              {/* Deadline */}
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
              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Daily Target</Text>
                <View style={styles.targetRow}>
                  <TextInput
                    style={[styles.targetInput, { backgroundColor: colors.secondary, color: colors.text }]}
                    value={formData.dailyTarget}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, dailyTarget: text }))}
                    placeholder="1"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.unitInput, { backgroundColor: colors.secondary, color: colors.text }]}
                    value={formData.unit}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, unit: text }))}
                    placeholder="task"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseDatePicker}
        >
          <SafeAreaView style={[styles.datePickerContainer, { backgroundColor: colors.primary }]}>
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
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={styles.datePicker}
                textColor={colors.text}
              />
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createFirstGoalButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createFirstGoalText: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalsList: {
    flex: 1,
  },
  goalCard: {
    marginBottom: 16,
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalCategory: {
    fontSize: 14,
  },
  goalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    marginLeft: 6,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deadlineScroll: {
    marginTop: 8,
  },
  deadlineChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  deadlineChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  datePreviewCard: {
    padding: 16,
    marginBottom: 16,
  },
  datePreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePreviewText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  customDateButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  customDateButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  targetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  targetInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  unitInput: {
    flex: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  datePickerContainer: {
    flex: 1,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  datePickerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePicker: {
    width: '100%',
    height: 200,
  },
});