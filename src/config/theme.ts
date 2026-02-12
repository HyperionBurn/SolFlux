/**
 * SolFLux AMOLED-Optimized Dark Theme
 * Pure black backgrounds for battery savings on OLED displays
 */

export const colors = {
    // Backgrounds
    background: '#000000',
    surface: '#0A0A0A',
    surfaceElevated: '#111111',
    card: '#141414',
    cardBorder: '#1E1E1E',

    // Primary - Electric Violet (Solana-inspired)
    primary: '#9945FF',
    primaryLight: '#B77BFF',
    primaryDark: '#7B2FCC',
    primaryMuted: 'rgba(153, 69, 255, 0.15)',

    // Accent - Neon Cyan
    accent: '#14F195',
    accentLight: '#4DFFC0',
    accentDark: '#0BBF76',
    accentMuted: 'rgba(20, 241, 149, 0.15)',

    // SKR Gold
    skrGold: '#FFD700',
    skrGoldLight: '#FFE44D',
    skrGoldDark: '#CC9900',
    skrGoldMuted: 'rgba(255, 215, 0, 0.15)',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textTertiary: '#666666',
    textInverse: '#000000',

    // Status
    success: '#14F195',
    warning: '#FFD700',
    error: '#FF4444',
    info: '#4DA6FF',

    // Gradient presets
    gradientPrimary: ['#9945FF', '#14F195'] as const,
    gradientSKR: ['#FFD700', '#FF8C00'] as const,
    gradientDark: ['#0A0A0A', '#000000'] as const,

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.4)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const typography = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },
    size: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 20,
        xxl: 28,
        hero: 36,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const shadows = {
    card: {
        shadowColor: '#9945FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    elevated: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
};

export const animation = {
    fast: 150,
    normal: 300,
    slow: 500,
    spring: {
        damping: 15,
        stiffness: 150,
        mass: 1,
    },
};
