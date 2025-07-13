import { ColorScheme } from '@/types';

export const lightTheme: ColorScheme = {
  primary: '#FFFFFF',
  secondary: '#F8F9FA',
  tertiary: '#E9ECEF',
  text: '#212529',
  textSecondary: '#6C757D',
  textTertiary: '#ADB5BD',
  accent: '#007AFF',
  success: '#28A745',
  warning: '#FFC107',
  danger: '#DC3545',
  glass: 'rgba(255, 255, 255, 0.15)',
  glassStrong: 'rgba(255, 255, 255, 0.25)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  gradient: ['#007AFF', '#5856D6']
};

export const darkTheme: ColorScheme = {
  primary: '#1C1C1E',
  secondary: '#2C2C2E',
  tertiary: '#3A3A3C',
  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#8E8E93',
  accent: '#0A84FF',
  success: '#30D158',
  warning: '#FF9F0A',
  danger: '#FF453A',
  glass: 'rgba(255, 255, 255, 0.1)',
  glassStrong: 'rgba(255, 255, 255, 0.2)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  gradient: ['#0A84FF', '#5E5CE6']
};

export const categories = [
  { name: 'Fitness', color: '#FF6B6B', icon: 'Dumbbell' },
  { name: 'Learning', color: '#4ECDC4', icon: 'Book' },
  { name: 'Career', color: '#45B7D1', icon: 'Briefcase' },
  { name: 'Health', color: '#96CEB4', icon: 'Heart' },
  { name: 'Habits', color: '#FFEAA7', icon: 'Repeat' },
  { name: 'Creative', color: '#DDA0DD', icon: 'Palette' }
];

export const moodEmojis = {
  terrible: '😞',
  bad: '😕',
  okay: '😐',
  good: '😊',
  great: '😄'
};

export const motivationalQuotes = [
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" }
];