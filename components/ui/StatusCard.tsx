import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { useTheme } from '@/contexts/ThemeContext';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatusCard({ title, value, icon, color, subtitle, trend }: StatusCardProps) {
  const { colors } = useTheme();

  const getTrendIcon = () => {
    if (trend === 'up') {
      return <TrendingUp size={16} color={colors.success} />;
    }
    if (trend === 'down') {
      return <TrendingDown size={16} color={colors.danger} />;
    }
    return null;
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color || colors.accent }]}>
          {icon}
        </View>
        {getTrendIcon()}
      </View>
      
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textTertiary }]}>{subtitle}</Text>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    margin: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});