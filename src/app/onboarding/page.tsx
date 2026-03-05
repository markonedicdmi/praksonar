'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import SonarLoader from '@/components/SonarLoader';
import { usePalette } from '@/components/PaletteProvider';
import { User } from '@supabase/supabase-js';
import { PALETTES, DEFAULT_PALETTE_NAME } from '@/lib/palettes';
import { trackEvent } from '@/lib/analytics';

const UNIVERSITIES = ['Univerzitet u Beogradu', 'Univerzitet u Novom Sadu', 'Univerzitet u Nišu', 'Univerzitet u Kragujevcu', 'Drugo'];
const LANGUAGES = ['Engleski', 'Nemački', 'Francuski', 'Španski', 'Italijanski', 'Ruski', 'Srpski', 'Drugo'];
const FIELDS = ['Informatika', 'Ekonomija', 'Pravo', 'Medicina', 'Inženjerstvo', 'Marketing', 'Ljudski resursi', 'Matematika', 'Fizika', 'Drugo'];

const PencilIcon = () => (
    <svg className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const { setPalette } = usePalette();
    const [step, setStep] = useState(1);
    const [user, setUser] = useState<User | null>(null);

    // Form state
    const [universitySelection, setUniversitySelection] = useState<string>('');
    const [customUniversity, setCustomUniversity] = useState('');

    const [languagesList, setLanguagesList] = useState<{ lang: string; level: string }[]>([{ lang: 'Srpski', level: 'Maternji' }]);
    const [newLang, setNewLang] = useState(LANGUAGES[0]);
    const [newLevel, setNewLevel] = useState('B2');
    const [customNewLang, setCustomNewLang] = useState('');

    const [fieldSelection, setFieldSelection] = useState<string>('');
    const [customField, setCustomField] = useState('');

    const [themeSelection, setThemeSelection] = useState<string>(DEFAULT_PALETTE_NAME);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                router.push('/auth/login');
            } else {
                setUser(user);
            }
        };
        fetchUser();
    }, [router, supabase]);

    const handleSaveAndFinish = async () => {
        if (!user) return;
        setStep(5); // Show loader

        const finalUniversity = universitySelection === 'Drugo' ? customUniversity.trim() : universitySelection;

        const finalLanguages = [...languagesList];

        const finalField = fieldSelection === 'Drugo' ? customField.trim() : fieldSelection;

        // Use full_name from auth metadata if available
        const fullName = user.user_metadata?.full_name || '';

        // Prepare profile data
        const profileData = {
            id: user.id, // required for UPSERT based on RLS
            full_name: fullName,
            university: finalUniversity || null,
            languages: finalLanguages.length > 0 ? finalLanguages : null,
            field_of_study: finalField || null,
            theme_preference: themeSelection,
        };

        try {
            // Upsert profile
            await supabase.from('user_profiles').upsert(profileData);

            // Also update the local palette provider so the rest of the app knows about the new theme
            await setPalette(themeSelection);

            trackEvent('register_complete');

            // Wait a minimal duration so the loader can be seen and feel like personalization is happening
            setTimeout(() => {
                router.push('/internships');
            }, 2500);

        } catch (error) {
            console.error('Error saving onboarding data:', error);
            // Fallback redirect 
            router.push('/internships');
        }
    };

    const handleAddLanguage = () => {
        const langName = newLang === 'Drugo' ? customNewLang.trim() : newLang;

        if (!langName) {
            return;
        }

        const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Maternji'];
        if (!validLevels.includes(newLevel)) {
            return;
        }

        if (languagesList.some(l => l.lang.toLowerCase() === langName.toLowerCase())) {
            return;
        }

        setLanguagesList([...languagesList, { lang: langName, level: newLevel }]);
        if (newLang === 'Drugo') {
            setCustomNewLang('');
        }
    };

    const removeLanguage = (langName: string) => {
        setLanguagesList(languagesList.filter(l => l.lang !== langName));
    };

    // Loader State
    if (step === 5) {
        return (
            <div className="fixed inset-0 z-50 bg-app/90 backdrop-blur-sm flex flex-col items-center justify-center">
                <SonarLoader size={120} />
                <h2 className="mt-8 text-2xl font-light text-app-text animate-pulse">Personalizujemo tvoje iskustvo...</h2>
                <p className="mt-2 text-muted text-sm">Podešavamo Praksonar prema tvojim veštinama i interesovanjima.</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header & Progress */}
                <div className="px-6 py-5 border-b border-border bg-app-secondary">
                    <h2 className="text-xl font-medium text-app-text">Personalizacija profila</h2>
                    <div className="mt-3 flex gap-2">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-accent' : 'bg-border/50'}`} />
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">

                    {/* Step 1: University */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h3 className="text-2xl font-light text-app-text mb-2">Na kom fakultetu studiraš?</h3>
                                <p className="text-sm text-muted">Pomoći će nam da ti predložimo najrelevantnije pozicije.</p>
                            </div>

                            <div className="space-y-3">
                                {UNIVERSITIES.map(uni => (
                                    <label key={uni} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${universitySelection === uni ? 'border-accent bg-accent/5' : 'border-border hover:border-sidebar bg-input'}`}>
                                        <input
                                            type="radio"
                                            name="university"
                                            value={uni}
                                            checked={universitySelection === uni}
                                            onChange={(e) => setUniversitySelection(e.target.value)}
                                            className="w-4 h-4 text-accent focus:ring-accent border-gray-300"
                                        />
                                        <span className="ml-3 font-medium text-app-text text-sm">{uni}</span>
                                    </label>
                                ))}
                            </div>

                            {universitySelection === 'Drugo' && (
                                <div className="relative mt-2 animate-fade-in">
                                    <input
                                        type="text"
                                        placeholder="Unesi naziv fakulteta..."
                                        value={customUniversity}
                                        onChange={(e) => setCustomUniversity(e.target.value)}
                                        className="w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-3 px-4 pr-10 border bg-app-secondary text-sm transition-colors"
                                    />
                                    <PencilIcon />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Languages */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h3 className="text-2xl font-light text-app-text mb-2">Koje jezike govoriš?</h3>
                                <p className="text-sm text-muted">Znanje jezika je često ključno za inostrane ili remote prakse. Dodaj jezike koje govoriš.</p>
                            </div>

                            <div className="space-y-3">
                                {languagesList.map((l, i) => (
                                    <div key={i} className="flex justify-between items-center bg-app-secondary p-3 rounded-xl border border-border">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-app-text text-sm">{l.lang}</span>
                                            <span className="text-xs font-medium uppercase tracking-wider text-text-on-dark bg-sidebar px-2 py-1 rounded">{l.level}</span>
                                        </div>
                                        <button
                                            onClick={() => removeLanguage(l.lang)}
                                            className="text-muted hover:text-accent font-medium transition-colors w-8 h-8 flex items-center justify-center rounded-full bg-input"
                                            aria-label="Ukloni jezik"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                                {languagesList.length === 0 && <p className="text-sm text-muted italic">Nisu dodati jezici</p>}
                            </div>

                            <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
                                <select
                                    value={newLang}
                                    onChange={(e) => setNewLang(e.target.value)}
                                    className="flex-1 rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border bg-input text-sm"
                                >
                                    {LANGUAGES.map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                                <select
                                    value={newLevel}
                                    onChange={(e) => setNewLevel(e.target.value)}
                                    className="w-full sm:w-28 rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border bg-input text-sm"
                                >
                                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Maternji'].map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>

                            {newLang === 'Drugo' && (
                                <div className="relative animate-fade-in">
                                    <input
                                        type="text"
                                        placeholder="Koji tačno jezik? (npr. Kineski, Švedski)"
                                        value={customNewLang}
                                        onChange={(e) => setCustomNewLang(e.target.value)}
                                        className="w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-4 pr-10 border bg-app-secondary text-sm transition-colors"
                                    />
                                    <PencilIcon />
                                </div>
                            )}

                            <button
                                onClick={handleAddLanguage}
                                className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium bg-sidebar text-text-on-dark rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Dodaj jezik
                            </button>
                        </div>
                    )}

                    {/* Step 3: Field / Looking For */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h3 className="text-2xl font-light text-app-text mb-2">Šta te najviše zanima?</h3>
                                <p className="text-sm text-muted">Odaberi oblast u kojoj želiš da izgradiš karijeru.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {FIELDS.map(field => (
                                    <label key={field} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${fieldSelection === field ? 'border-accent bg-accent/5' : 'border-border hover:border-sidebar bg-input'}`}>
                                        <input
                                            type="radio"
                                            name="field"
                                            value={field}
                                            checked={fieldSelection === field}
                                            onChange={(e) => setFieldSelection(e.target.value)}
                                            className="w-4 h-4 text-accent focus:ring-accent border-gray-300"
                                        />
                                        <span className="ml-3 font-medium text-app-text text-sm">{field}</span>
                                    </label>
                                ))}
                            </div>

                            {fieldSelection === 'Drugo' && (
                                <div className="relative mt-2 animate-fade-in">
                                    <input
                                        type="text"
                                        placeholder="Unesi željenu oblast (npr. Farmacija, Arhitektura)"
                                        value={customField}
                                        onChange={(e) => setCustomField(e.target.value)}
                                        className="w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-3 px-4 pr-10 border bg-app-secondary text-sm transition-colors"
                                    />
                                    <PencilIcon />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Theme */}
                    {step === 4 && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h3 className="text-2xl font-light text-app-text mb-2">Izaberi temu</h3>
                                <p className="text-sm text-muted">Možeš je uvek promeniti u podešavanjima.</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.values(PALETTES).map((palette) => {
                                    const isSelected = themeSelection === palette.name;
                                    return (
                                        <div
                                            key={palette.name}
                                            onClick={() => {
                                                setThemeSelection(palette.name);

                                                // Live preview immediately
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
                                            }}
                                            className={`relative flex flex-col items-center gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all hover:scale-[1.02] ${isSelected ? 'border-accent bg-accent/5' : 'border-border bg-card'}`}
                                        >
                                            <div className="flex w-full h-12 rounded-lg overflow-hidden border border-border shadow-sm">
                                                <div className="flex-1" style={{ backgroundColor: palette.colors.sidebar }} />
                                                <div className="flex-1" style={{ backgroundColor: palette.colors.accent }} />
                                            </div>
                                            <span className="text-sm font-medium text-app-text text-center">{palette.name}</span>
                                            {isSelected && (
                                                <div className="absolute -top-2 -right-2 bg-accent text-text-on-dark rounded-full p-1 shadow-md">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="text-muted hover:text-app-text font-medium text-sm px-4 py-2 transition-colors focus:outline-none"
                            >
                                Nazad
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (step === 1) setStep(2);
                                else if (step === 2) setStep(3);
                                else if (step === 3) setStep(4);
                                else handleSaveAndFinish();
                            }}
                            className="text-muted hover:text-app-text font-medium text-sm px-4 py-2 transition-colors focus:outline-none"
                        >
                            Preskoči
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            if (step === 1) setStep(2);
                            else if (step === 2) setStep(3);
                            else if (step === 3) setStep(4);
                            else handleSaveAndFinish();
                        }}
                        className="px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-lg shadow hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                    >
                        {step === 4 ? 'Završi' : 'Sledeće'}
                    </button>
                </div>
            </div>
        </div>
    );
}
