export interface Palette {
    name: string;
    description?: string;
    colors: {
        sidebar: string;
        accent: string;
        bg: string;
        bgSecondary: string;
        card: string;
        text: string;
        textOnDark: string;
        textMuted: string;
        border: string;
        successBg: string;
        successText: string;
        errorBg: string;
        errorText: string;
        sidebarMuted: string;
        input: string;
    };
    isDark: boolean;
}

export const PALETTES: Record<string, Palette> = {
    'Teal Gold': {
        name: 'Teal Gold',
        isDark: false,
        colors: {
            sidebar: '#425c59',
            accent: '#c99b33',
            bg: '#e4eeed',
            bgSecondary: '#e2eceb',
            card: '#ffffff',
            text: '#1a1a1a',
            textOnDark: '#ffffff',
            textMuted: '#6b7280',
            border: '#e5e7eb',
            successBg: '#f0fdf4',
            successText: '#15803d',
            errorBg: '#fef2f2',
            errorText: '#b91c1c',
            sidebarMuted: '#cbd5e1',
            input: '#ffffff'
        }
    },
    'Burgundy Study': {
        name: 'Burgundy Study',
        isDark: false,
        colors: {
            sidebar: '#3d1f2b',
            accent: '#c4715a',
            bg: '#f5eeeb',
            bgSecondary: '#ede4e0',
            card: '#ffffff',
            text: '#2a1a1f',
            textOnDark: '#ffffff',
            textMuted: '#7a6065',
            border: '#e0d4d0',
            successBg: '#f0fdf4',
            successText: '#15803d',
            errorBg: '#fef2f2',
            errorText: '#b91c1c',
            sidebarMuted: '#cbd5e1',
            input: '#ffffff'
        }
    },
    'Forest Ink': {
        name: 'Forest Ink',
        isDark: false,
        colors: {
            sidebar: '#1e3429',
            accent: '#7a9e7e',
            bg: '#edf2ee',
            bgSecondary: '#e2ebe3',
            card: '#ffffff',
            text: '#1a2b1e',
            textOnDark: '#ffffff',
            textMuted: '#5a7060',
            border: '#d3dfd5',
            successBg: '#f0fdf4',
            successText: '#15803d',
            errorBg: '#fef2f2',
            errorText: '#b91c1c',
            sidebarMuted: '#cbd5e1',
            input: '#ffffff'
        }
    },
    'Slate Dust': {
        name: 'Slate Dust',
        isDark: false,
        colors: {
            sidebar: '#2c3340',
            accent: '#9b8ea8',
            bg: '#f0f0f4',
            bgSecondary: '#e8e8ef',
            card: '#ffffff',
            text: '#1f2433',
            textOnDark: '#ffffff',
            textMuted: '#6b7280',
            border: '#e5e7eb',
            successBg: '#f0fdf4',
            successText: '#15803d',
            errorBg: '#fef2f2',
            errorText: '#b91c1c',
            sidebarMuted: '#cbd5e1',
            input: '#ffffff'
        }
    },
    'Smoked Plum': {
        name: 'Smoked Plum',
        isDark: true,
        colors: {
            sidebar: '#1a1220',
            accent: '#b89ec4',
            bg: '#231830',
            bgSecondary: '#1e1528',
            card: '#2d2040',
            text: '#e8e0f0',
            textOnDark: '#e8e0f0',
            textMuted: '#9b8ea8',
            border: '#453260',
            successBg: '#14532d',
            successText: '#86efac',
            errorBg: '#7f1d1d',
            errorText: '#fee2e2',
            sidebarMuted: '#9b8ea8',
            input: '#3d2e52'
        }
    },
    'Ochre Archive': {
        name: 'Ochre Archive',
        isDark: false,
        colors: {
            sidebar: '#2f2a1e',
            accent: '#c4a35a',
            bg: '#f4f0e8',
            bgSecondary: '#ece8de',
            card: '#ffffff',
            text: '#2a2318',
            textOnDark: '#ffffff',
            textMuted: '#7a6a50',
            border: '#e2d8c3',
            successBg: '#f0fdf4',
            successText: '#15803d',
            errorBg: '#fef2f2',
            errorText: '#b91c1c',
            sidebarMuted: '#cbd5e1',
            input: '#ffffff'
        }
    }
};

export const DEFAULT_PALETTE_NAME = 'Teal Gold';
