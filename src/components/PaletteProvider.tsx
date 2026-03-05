'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PALETTES, DEFAULT_PALETTE_NAME, Palette } from '@/lib/palettes';
import { createClient } from '@/lib/supabase/client';

interface PaletteContextType {
    activePaletteName: string;
    activePalette: Palette;
    setPalette: (name: string) => void;
}

const PaletteContext = createContext<PaletteContextType>({
    activePaletteName: DEFAULT_PALETTE_NAME,
    activePalette: PALETTES[DEFAULT_PALETTE_NAME],
    setPalette: () => { },
});

export const usePalette = () => useContext(PaletteContext);

export function PaletteProvider({ children }: { children: React.ReactNode }) {
    const [activePaletteName, setActivePaletteName] = useState<string>(DEFAULT_PALETTE_NAME);
    const [mounted, setMounted] = useState(false);
    const supabase = createClient();

    // Init from localStorage / Supabase
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('praksonar_theme_preference');
        if (stored && PALETTES[stored]) {
            setActivePaletteName(stored);
        }

        // Try to fetch from DB and override if exists
        const loadFromDb = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase.from('user_profiles').select('theme_preference').eq('id', user.id).single();
                if (!error && data && data.theme_preference && PALETTES[data.theme_preference]) {
                    setActivePaletteName(data.theme_preference);
                    localStorage.setItem('praksonar_theme_preference', data.theme_preference);
                }
            }
        };
        loadFromDb();
    }, [supabase]);

    const pathname = usePathname();

    useEffect(() => {
        if (!mounted) return;

        // Force Teal Gold on public/landing pages before login
        const isPublicPath = pathname === '/' || pathname.startsWith('/auth');
        const effectivePaletteName = isPublicPath ? 'Teal Gold' : activePaletteName;

        const palette = PALETTES[effectivePaletteName] || PALETTES[DEFAULT_PALETTE_NAME];
        if (!palette) return;

        const root = document.documentElement;
        root.style.setProperty('--color-sidebar', palette.colors.sidebar);
        root.style.setProperty('--color-accent', palette.colors.accent);
        root.style.setProperty('--color-bg', palette.colors.bg);
        root.style.setProperty('--color-bg-secondary', palette.colors.bgSecondary);
        root.style.setProperty('--color-card', palette.colors.card);
        root.style.setProperty('--color-text', palette.colors.text);
        root.style.setProperty('--color-text-on-dark', palette.colors.textOnDark);
        root.style.setProperty('--color-text-muted', palette.colors.textMuted);
        root.style.setProperty('--color-border', palette.colors.border);
        root.style.setProperty('--color-success-bg', palette.colors.successBg);
        root.style.setProperty('--color-success-text', palette.colors.successText);
        root.style.setProperty('--color-error-bg', palette.colors.errorBg);
        root.style.setProperty('--color-error-text', palette.colors.errorText);
        root.style.setProperty('--color-sidebar-muted', palette.colors.sidebarMuted);
        root.style.setProperty('--color-input', palette.colors.input);

        if (palette.isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [activePaletteName, mounted, pathname]);

    const setPalette = async (name: string) => {
        if (!PALETTES[name]) return;
        setActivePaletteName(name);
        localStorage.setItem('praksonar_theme_preference', name);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('user_profiles').update({ theme_preference: name }).eq('id', user.id);
        }
    };

    return (
        <PaletteContext.Provider value={{ activePaletteName, activePalette: PALETTES[activePaletteName], setPalette }}>
            {children}
        </PaletteContext.Provider>
    );
}
