import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { User, Star, Sun, Moon, Settings, CircleHelp as HelpCircle, Shield, FileText, Trash2, Bell, Check } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { useTheme } from '@/contexts/ThemeContext';
import { useGoals } from '@/contexts/GoalContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const premiumFeatures = [
  'Unlimited goals',
  'Advanced analytics',
  'Custom categories',
  'Data export',
  'Priority support'
];

export default function Profile() {
  const { colors, theme, setTheme, isDark } = useTheme();
  const { goals, getTotalStats } = useGoals();
  const stats = getTotalStats();

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your goals and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been deleted. Please restart the app.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getThemeIcon = (themeType: string) => {
    switch (themeType) {
      case 'light': return <Sun size={20} color={colors.text} />;
      case 'dark': return <Moon size={20} color={colors.text} />;
      default: return <Settings size={20} color={colors.text} />;
    }
  };

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
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        </View>

        {/* Profile Info */}
        <GlassCard style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <User size={32} color={colors.primary} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            Goal Achiever
          </Text>
          <Text style={[styles.goalCount, { color: colors.textSecondary }]}>
            {stats.totalGoals} {stats.totalGoals === 1 ? 'Goal' : 'Goals'} Created
          </Text>
          <View style={[styles.freeBadge, { backgroundColor: colors.success + '20' }]}>
            <Star size={16} color={colors.success} />
            <Text style={[styles.freeText, { color: colors.success }]}>FREE</Text>
          </View>
        </GlassCard>

        {/* Premium Upgrade */}
        <GlassCard style={styles.premiumCard}>
          <View style={styles.premiumHeader}>
            <Star size={24} color={colors.warning} />
            <Text style={[styles.premiumTitle, { color: colors.text }]}>
              Upgrade to Premium
            </Text>
          </View>
          
          <View style={styles.featuresList}>
            {premiumFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Check size={16} color={colors.success} />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
          
          <PremiumButton
            title="Upgrade Now"
            onPress={() => Alert.alert('Coming Soon', 'Premium features will be available in a future update!')}
            style={styles.upgradeButton}
          />
        </GlassCard>

        {/* Settings */}
        <GlassCard style={styles.settingsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Settings
          </Text>
          
          {/* Theme Selection */}
          <View style={styles.settingSection}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Appearance
            </Text>
            <View style={styles.themeOptions}>
              {(['light', 'dark', 'auto'] as const).map((themeOption) => (
                <TouchableOpacity
                  key={themeOption}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: theme === themeOption ? colors.accent : colors.secondary,
                      borderColor: theme === themeOption ? colors.accent : colors.tertiary,
                    }
                  ]}
                  onPress={() => setTheme(themeOption)}
                >
                  {getThemeIcon(themeOption)}
                  <Text style={[
                    styles.themeOptionText,
                    { 
                      color: theme === themeOption ? colors.primary : colors.text 
                    }
                  ]}>
                    {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.settingSection}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Notifications
            </Text>
            <View style={styles.notificationOptions}>
              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Bell size={20} color={colors.textSecondary} />
                  <Text style={[styles.notificationText, { color: colors.text }]}>
                    Daily Reminders
                  </Text>
                </View>
                <Switch
                  value={false}
                  onValueChange={() => Alert.alert('Coming Soon', 'Notification settings will be available in a future update!')}
                  trackColor={{ false: colors.tertiary, true: colors.accent }}
                  thumbColor={colors.primary}
                />
              </View>
              
              <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Star size={20} color={colors.textSecondary} />
                  <Text style={[styles.notificationText, { color: colors.text }]}>
                    Achievement Alerts
                  </Text>
                </View>
                <Switch
                  value={true}
                  onValueChange={() => Alert.alert('Coming Soon', 'Notification settings will be available in a future update!')}
                  trackColor={{ false: colors.tertiary, true: colors.accent }}
                  thumbColor={colors.primary}
                />
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Support */}
        <GlassCard style={styles.supportCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Support
          </Text>
          
          <TouchableOpacity 
            style={styles.supportItem}
            onPress={() => Alert.alert('Help & FAQ', 'Help documentation will be available in a future update!')}
          >
            <HelpCircle size={20} color={colors.textSecondary} />
            <Text style={[styles.supportText, { color: colors.text }]}>
              Help & FAQ
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.supportItem}
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy will be available in a future update!')}
          >
            <Shield size={20} color={colors.textSecondary} />
            <Text style={[styles.supportText, { color: colors.text }]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.supportItem}
            onPress={() => Alert.alert('Terms of Service', 'Terms of service will be available in a future update!')}
          >
            <FileText size={20} color={colors.textSecondary} />
            <Text style={[styles.supportText, { color: colors.text }]}>
              Terms of Service
            </Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard style={styles.dangerCard}>
          <Text style={[styles.sectionTitle, { color: colors.danger }]}>
            Danger Zone
          </Text>
          
          <TouchableOpacity 
            style={[styles.dangerItem, { borderColor: colors.danger + '30' }]}
            onPress={handleDeleteAllData}
          >
            <Trash2 size={20} color={colors.danger} />
            <View style={styles.dangerContent}>
              <Text style={[styles.dangerTitle, { color: colors.danger }]}>
                Delete All Data
              </Text>
              <Text style={[styles.dangerDescription, { color: colors.textTertiary }]}>
                Permanently delete all goals and progress
              </Text>
            </View>
          </TouchableOpacity>
        </GlassCard>

        {/* App Version */}
        <Text style={[styles.version, { color: colors.textTertiary }]}>
          TimeSink v1.0.0
        </Text>
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
  },
  profileCard: {
    margin: 24,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  goalCount: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  freeText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginLeft: 4,
  },
  premiumCard: {
    margin: 24,
    padding: 20,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  upgradeButton: {
    width: '100%',
  },
  settingsCard: {
    margin: 24,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  themeOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  notificationOptions: {
    gap: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
  supportCard: {
    margin: 24,
    padding: 20,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  supportText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
  dangerCard: {
    margin: 24,
    padding: 20,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  dangerContent: {
    marginLeft: 12,
  },
  dangerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  dangerDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  version: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
});