'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import SonarLoader from '@/components/SonarLoader';
import { User } from '@supabase/supabase-js';

const UNIVERSITIES = ['Univerzitet u Beogradu', 'Univerzitet u Novom Sadu', 'Univerzitet u Nišu', 'Univerzitet u Kragujevcu', 'Drugo'];
const LANGUAGES = ['Engleski', 'Nemački', 'Francuski', 'Španski', 'Italijanski', 'Ruski', 'Drugo'];
const FIELDS = ['Informatika', 'Ekonomija', 'Pravo', 'Medicina', 'Inženjerstvo', 'Marketing', 'Ljudski resursi', 'Drugo'];

const PencilIcon = () => (
    <svg className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(1);
    const [user, setUser] = useState<User | null>(null);

    // Form state
    const [universitySelection, setUniversitySelection] = useState<string>('');
    const [customUniversity, setCustomUniversity] = useState('');

    // Multiple languages can be selected, but we will simplify to primary language just like the other fields, 
    // or allow multiple. The prompt says "what languages can he speak". Let's allow multiple.
    const [languageSelections, setLanguageSelections] = useState<string[]>([]);
    const [customLanguage, setCustomLanguage] = useState('');

    // New language diploma & proficiency state
    const [hasDiploma, setHasDiploma] = useState<string>(''); // 'da' ili 'ne'
    const [diplomaName, setDiplomaName] = useState('');
    const [languageLevels, setLanguageLevels] = useState<Record<string, number>>({});

    const [fieldSelection, setFieldSelection] = useState<string>('');
    const [customField, setCustomField] = useState('');

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
        setStep(4); // Show loader

        const finalUniversity = universitySelection === 'Drugo' ? customUniversity.trim() : universitySelection;

        const finalLanguages: { lang: string, level: string }[] = [];

        const processLang = (langName: string) => {
            if (hasDiploma === 'da' && diplomaName.trim()) {
                return { lang: langName, level: `Diploma: ${diplomaName.trim()}` };
            } else if (hasDiploma === 'da') {
                return { lang: langName, level: 'Sertifikovan' };
            } else if (hasDiploma === 'ne') {
                const lvl = languageLevels[langName] || 3;
                return { lang: langName, level: `Nivo ${lvl}/5` };
            }
            return { lang: langName, level: 'B2' }; // fallback if skipped
        };

        languageSelections.forEach(l => {
            if (l !== 'Drugo') finalLanguages.push(processLang(l));
        });

        if (languageSelections.includes('Drugo') && customLanguage.trim() !== '') {
            finalLanguages.push(processLang(customLanguage.trim()));
        }

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
        };

        try {
            // Upsert profile
            await supabase.from('user_profiles').upsert(profileData);

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

    const toggleLanguage = (lang: string) => {
        if (languageSelections.includes(lang)) {
            setLanguageSelections(prev => prev.filter(l => l !== lang));
            setLanguageLevels(prev => { const n = { ...prev }; delete n[lang]; return n; });
        } else {
            setLanguageSelections(prev => [...prev, lang]);
            setLanguageLevels(prev => ({ ...prev, [lang]: 3 }));
        }
    };

    // Loader State
    if (step === 4) {
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
                        {[1, 2, 3].map(s => (
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
                                <p className="text-sm text-muted">Znanje jezika je često ključno za inostrane ili remote prakse. Možeš izabrati više.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {LANGUAGES.map(lang => (
                                    <label key={lang} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${languageSelections.includes(lang) ? 'border-accent bg-accent/5' : 'border-border hover:border-sidebar bg-input'}`}>
                                        <input
                                            type="checkbox"
                                            name="languages"
                                            value={lang}
                                            checked={languageSelections.includes(lang)}
                                            onChange={() => toggleLanguage(lang)}
                                            className="w-4 h-4 text-accent focus:ring-accent border-gray-300 rounded"
                                        />
                                        <span className="ml-3 font-medium text-app-text text-sm">{lang}</span>
                                    </label>
                                ))}
                            </div>

                            {languageSelections.includes('Drugo') && (
                                <div className="relative mt-2 animate-fade-in">
                                    <input
                                        type="text"
                                        placeholder="Koji tačno jezik? (npr. Kineski, Švedski)"
                                        value={customLanguage}
                                        onChange={(e) => {
                                            setCustomLanguage(e.target.value);
                                            if (!languageLevels[e.target.value]) {
                                                setLanguageLevels(prev => ({ ...prev, [e.target.value]: 3 }));
                                            }
                                        }}
                                        className="w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-3 px-4 pr-10 border bg-app-secondary text-sm transition-colors"
                                    />
                                    <PencilIcon />
                                </div>
                            )}

                            {languageSelections.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-border animate-fade-in space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-app-text mb-3">Da li imaš diplomu / sertifikat za naznačene jezike?</p>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="diploma" value="da" checked={hasDiploma === 'da'} onChange={() => setHasDiploma('da')} className="text-accent focus:ring-accent w-4 h-4 border-gray-300" />
                                                <span className="text-sm text-app-text">Da</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="diploma" value="ne" checked={hasDiploma === 'ne'} onChange={() => setHasDiploma('ne')} className="text-accent focus:ring-accent w-4 h-4 border-gray-300" />
                                                <span className="text-sm text-app-text">Ne</span>
                                            </label>
                                        </div>
                                    </div>

                                    {hasDiploma === 'da' && (
                                        <div className="animate-fade-in">
                                            <input
                                                type="text"
                                                placeholder="Unesi naziv sertifikata (npr. Cambridge C1, Goethe B2)"
                                                value={diplomaName}
                                                onChange={(e) => setDiplomaName(e.target.value)}
                                                className="w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-3 px-4 border bg-app-secondary text-sm transition-colors"
                                            />
                                        </div>
                                    )}

                                    {hasDiploma === 'ne' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <p className="text-xs text-muted uppercase tracking-wider">Označi nivo znanja od 1 (osnovno) do 5 (odlično)</p>
                                            {languageSelections.map(lang => {
                                                const label = lang === 'Drugo' ? (customLanguage || 'Drugi jezik') : lang;
                                                const val = languageLevels[lang === 'Drugo' ? customLanguage : lang] || 3;
                                                const key = lang === 'Drugo' ? customLanguage : lang;
                                                return (
                                                    <div key={lang} className="flex items-center justify-between gap-4">
                                                        <span className="text-sm font-medium text-app-text w-1/3 truncate">{label}</span>
                                                        <div className="flex-1 flex gap-2">
                                                            {[1, 2, 3, 4, 5].map(level => (
                                                                <button
                                                                    key={level}
                                                                    onClick={() => setLanguageLevels(prev => ({ ...prev, [key]: level }))}
                                                                    className={`flex-1 h-8 rounded text-xs font-medium transition-colors ${val === level ? 'bg-sidebar text-text-on-dark shadow-sm' : 'bg-input border border-border text-app-text hover:border-sidebar'}`}
                                                                >
                                                                    {level}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
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

                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between gap-4">
                    <button
                        onClick={() => {
                            if (step === 1) setStep(2);
                            else if (step === 2) setStep(3);
                            else handleSaveAndFinish();
                        }}
                        className="text-muted hover:text-app-text font-medium text-sm px-4 py-2 transition-colors focus:outline-none"
                    >
                        Preskoči
                    </button>

                    <button
                        onClick={() => {
                            if (step === 1) setStep(2);
                            else if (step === 2) setStep(3);
                            else handleSaveAndFinish();
                        }}
                        className="px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-lg shadow hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                    >
                        {step === 3 ? 'Završi' : 'Sledeće'}
                    </button>
                </div>

            </div>
        </div>
    );
}
