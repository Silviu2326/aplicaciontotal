const palette = {
  // Neutrals
  neutralBg: '#F8FAFC', // Clean neutral for backgrounds
  neutralText: '#1A202C', // Dark text for readability
  neutralTextSecondary: '#718096', // Secondary text
  white: '#FFFFFF',

  // Semantic Accents (Contexts)
  finance: '#10B981', // Emerald Green
  work: '#6366F1',    // Indigo Blue
  study: '#F59E0B',   // Amber/Orange
  health: '#EC4899',  // Pink
  
  // Energy Levels
  energyHigh: '#FFD700', // Gold/Yellow
  energyMedium: '#3B82F6', // Blue
  energyLow: '#A0AEC0',  // Grey

  // Functional
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

const glass = {
  bg: 'rgba(255, 255, 255, 0.85)',
  border: 'rgba(255, 255, 255, 0.5)',
};

const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  deep: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
};

const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
};

const typography = {
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: palette.neutralText,
    },
    body: {
        fontSize: 16,
        color: palette.neutralText,
    },
    caption: {
        fontSize: 12,
        color: palette.neutralTextSecondary,
    }
};

export const LifeTheme = {
  colors: palette,
  glass,
  shadows,
  spacing,
  borderRadius,
  typography,
};
