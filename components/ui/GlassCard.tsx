import React from 'react';
import { View, ViewStyle, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  pressable?: boolean;
  onPress?: () => void;
  gradient?: boolean;
  blur?: boolean;
  intensity?: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function GlassCard({ 
  children, 
  style, 
  pressable = false, 
  onPress, 
  gradient = false,
  blur = true,
  intensity = 20
}: GlassCardProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.glass,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      shadowColor: colors.shadow,
    },
    style
  ];

  if (pressable && onPress) {
    return (
      <AnimatedTouchableOpacity
        style={[animatedStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {blur ? (
          <BlurView intensity={intensity} style={cardStyle}>
            {children}
          </BlurView>
        ) : (
          <View style={cardStyle}>
            {children}
          </View>
        )}
      </AnimatedTouchableOpacity>
    );
  }

  if (blur) {
    return (
      <BlurView intensity={intensity} style={cardStyle}>
        {children}
      </BlurView>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
});