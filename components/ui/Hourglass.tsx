import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate,
  Extrapolation 
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface HourglassProps {
  totalDays: number;
  remainingDays: number;
  size?: number;
  animated?: boolean;
}

export function Hourglass({ totalDays, remainingDays, size = 80, animated = true }: HourglassProps) {
  const { colors } = useTheme();
  const rotation = useSharedValue(0);
  const sandLevel = useSharedValue(0);

  const progress = totalDays > 0 ? (totalDays - remainingDays) / totalDays : 0;
  const urgency = remainingDays / totalDays;

  useEffect(() => {
    if (animated) {
      rotation.value = withRepeat(withTiming(360, { duration: 3000 }), -1, false);
      sandLevel.value = withTiming(progress, { duration: 1000 });
    }
  }, [progress, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }));

  const sandAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      sandLevel.value,
      [0, 1],
      [0, size * 0.6],
      Extrapolation.CLAMP
    );
    return {
      height,
    };
  });

  const getSandColor = () => {
    if (urgency > 0.6) return colors.success;
    if (urgency > 0.3) return colors.warning;
    return colors.danger;
  };

  const hourglassPath = `
    M ${size * 0.2} ${size * 0.1}
    L ${size * 0.8} ${size * 0.1}
    L ${size * 0.8} ${size * 0.35}
    L ${size * 0.5} ${size * 0.5}
    L ${size * 0.8} ${size * 0.65}
    L ${size * 0.8} ${size * 0.9}
    L ${size * 0.2} ${size * 0.9}
    L ${size * 0.2} ${size * 0.65}
    L ${size * 0.5} ${size * 0.5}
    L ${size * 0.2} ${size * 0.35}
    Z
  `;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={animated ? animatedStyle : undefined}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="hourglassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.textTertiary} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={colors.textTertiary} stopOpacity="0.1" />
            </LinearGradient>
          </Defs>
          
          {/* Hourglass outline */}
          <Path
            d={hourglassPath}
            fill="url(#hourglassGradient)"
            stroke={colors.textTertiary}
            strokeWidth="2"
          />
          
          {/* Sand particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <Circle
              key={i}
              cx={size * 0.3 + (i % 3) * size * 0.1}
              cy={size * 0.7 + Math.floor(i / 3) * size * 0.05}
              r="2"
              fill={getSandColor()}
              opacity={progress * 0.8}
            />
          ))}
        </Svg>
      </Animated.View>
      
      {/* Animated sand level indicator */}
      <Animated.View
        style={[
          styles.sandIndicator,
          sandAnimatedStyle,
          {
            backgroundColor: getSandColor(),
            bottom: size * 0.1,
            left: size * 0.25,
            right: size * 0.25,
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sandIndicator: {
    position: 'absolute',
    borderRadius: 2,
    opacity: 0.6,
  },
});