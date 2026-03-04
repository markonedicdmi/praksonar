'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const FIELDS = [
    'Informatika',
    'Ekonomija',
    'Pravo',
    'Medicina',
    'Inženjerstvo',
    'Umetnost',
    'Ostalo',
];
const SUGGESTED_SKILLS = ['Python', 'Excel', 'Figma', 'JavaScript', 'SQL', 'SPSS', 'AutoCAD', 'Photoshop', 'R'];
const LANG_OPTIONS = ['English', 'German', 'French', 'Spanish', 'Other'];
const LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Maternji'];

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Step 1 State
    const [fullName, setFullName] = useState('');
    const [university, setUniversity] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState(FIELDS[0]);
    const [studyLevel, setStudyLevel] = useState('bachelor');

    // Step 2 State
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');

    // Step 3 State
    const [languages, setLanguages] = useState<{ lang: string; level: string }[]>([]);
    const [langInput, setLangInput] = useState(LANG_OPTIONS[0]);
    const [levelInput, setLevelInput] = useState(LEVEL_OPTIONS[0]);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth/login');
            } else {
                setUserId(session.user.id);
                // Pre-fetch if needed, ignore for now to keep it simple.
            }
        };
        fetchUser();
    }, [router, supabase]);

    const saveProfileData = async (data: Record<string, unknown>) => {
        if (!userId) return false;
        setLoading(true);
        const { error } = await supabase
            .from('user_profiles')
            .update(data)
            .eq('id', userId);

        setLoading(false);
        if (error) {
            console.error('Error saving profile:', error);
            alert('Došlo je do greške pri čuvanju podataka.');
            return false;
        }
        return true;
    };

    const handleNextStep1 = async () => {
        const success = await saveProfileData({
            full_name: fullName,
            university,
            field_of_study: fieldOfStudy,
            study_level: studyLevel,
        });
        if (success) setStep(2);
    };

    const handleNextStep2 = async () => {
        // Save skills
        const success = await saveProfileData({ skills });
        if (success) setStep(3);
    };

    const handleNextStep3 = async () => {
        // Save languages
        const success = await saveProfileData({ languages });
        if (success) setStep(4);
    };

    const handleFinish = () => {
        router.push('/internships');
    };

    const addSkill = (skillToAdd: string) => {
        const s = skillToAdd.trim();
        if (s && !skills.includes(s)) {
            setSkills([...skills, s]);
        }
        setSkillInput('');
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter((s) => s !== skillToRemove));
    };

    const addLanguage = () => {
        if (!languages.find(l => l.lang === langInput)) {
            setLanguages([...languages, { lang: langInput, level: levelInput }]);
        }
    };

    const removeLanguage = (langToRemove: string) => {
        setLanguages(languages.filter((l) => l.lang !== langToRemove));
    };

    return (
        <div className="min-h-screen bg-app py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
            <div className="w-full max-w-xl bg-card p-8 sm:p-10 rounded-2xl shadow-lg border border-border">

                {/* Progress Bar */}
                <div className="mb-10">
                    <div className="flex justify-between text-xs font-medium text-muted mb-2 px-1 uppercase tracking-wider">
                        <span className={step >= 1 ? "text-accent font-medium" : ""}>Osnovno</span>
                        <span className={step >= 2 ? "text-accent font-medium" : ""}>Veštine</span>
                        <span className={step >= 3 ? "text-accent font-medium" : ""}>Jezici</span>
                        <span className={step === 4 ? "text-accent font-medium" : ""}>Gotovo</span>
                    </div>
                    <div className="w-full bg-app-secondary rounded-full h-2">
                        <div
                            className="bg-accent h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${(step / 4) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h2 className="text-3xl font-light text-app-text mb-2">Dobrodošli!</h2>
                            <p className="text-muted text-sm">Popunite osnovne informacije kako bismo našli idealne prakse za vas.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Ime i prezime</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input"
                                placeholder="Petar Petrović"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Fakultet / Univerzitet</label>
                            <input
                                type="text"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input"
                                placeholder="Univerzitet u Beogradu"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Oblast studija</label>
                                <select
                                    value={fieldOfStudy}
                                    onChange={(e) => setFieldOfStudy(e.target.value)}
                                    className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border bg-input transition-colors"
                                >
                                    {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Nivo studija</label>
                                <select
                                    value={studyLevel}
                                    onChange={(e) => setStudyLevel(e.target.value)}
                                    className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border bg-input transition-colors"
                                >
                                    <option value="bachelor">Osnovne (Bachelor)</option>
                                    <option value="master">Master</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleNextStep1}
                            disabled={loading || !fullName || !university}
                            className="w-full mt-6 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-text-on-dark bg-accent hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Čuvanje...' : 'Sledeći korak'}
                        </button>
                    </div>
                )}

                {/* Step 2: Skills */}
                {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h2 className="text-3xl font-light text-app-text mb-2">Tvoje veštine</h2>
                            <p className="text-sm text-muted">Dodaj tehnologije, alate i koncepte koje poznaješ.</p>
                        </div>

                        <div>
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addSkill(skillInput);
                                    }
                                }}
                                className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input"
                                placeholder="Unesi veštinu i pritisni Enter (npr. Python)"
                            />
                        </div>

                        {/* Selected Skills */}
                        <div className="flex flex-wrap gap-2 min-h-[48px] p-4 bg-app-secondary rounded-lg border border-border">
                            {skills.map(skill => (
                                <span key={skill} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-app border border-border text-accent">
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)} className="ml-2 inline-flex text-muted hover:text-accent focus:outline-none">
                                        &times;
                                    </button>
                                </span>
                            ))}
                            {skills.length === 0 && <span className="text-sm text-muted italic flex items-center">Nijedna veština nije dodata</span>}
                        </div>

                        {/* Suggested Skills */}
                        <div>
                            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Popularne veštine:</p>
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).map(skill => (
                                    <button
                                        key={skill}
                                        onClick={() => addSkill(skill)}
                                        className="inline-flex items-center px-3 py-1.5 border border-border rounded-full text-xs font-medium text-muted bg-card hover:bg-app-secondary hover:text-accent transition-colors"
                                    >
                                        + {skill}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setStep(1)}
                                className="w-1/3 py-3 px-4 border border-border rounded-lg shadow-sm text-sm font-medium text-muted bg-card hover:bg-app-secondary focus:outline-none transition-colors"
                            >
                                Nazad
                            </button>
                            <button
                                onClick={handleNextStep2}
                                disabled={loading}
                                className="w-2/3 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-text-on-dark bg-accent hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Čuvanje...' : 'Sledeći korak'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Languages */}
                {step === 3 && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h2 className="text-3xl font-light text-app-text mb-2">Jezici</h2>
                            <p className="text-sm text-muted">Koji strani jezici ti idu od ruke?</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-end bg-app-secondary p-4 rounded-lg border border-border">
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-medium text-muted mb-1 uppercase tracking-wider">Jezik</label>
                                <select
                                    value={langInput}
                                    onChange={(e) => setLangInput(e.target.value)}
                                    className="block w-full rounded-md border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2 px-3 border bg-card"
                                >
                                    {LANG_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div className="w-full sm:w-1/3">
                                <label className="block text-xs font-medium text-muted mb-1 uppercase tracking-wider">Nivo</label>
                                <select
                                    value={levelInput}
                                    onChange={(e) => setLevelInput(e.target.value)}
                                    className="block w-full rounded-md border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2 px-3 border bg-card"
                                >
                                    {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={addLanguage}
                                className="w-full sm:w-auto py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-text-on-dark bg-sidebar hover:opacity-90 focus:outline-none transition-colors"
                            >
                                Dodaj
                            </button>
                        </div>

                        {/* Selected Languages */}
                        <div className="space-y-3 min-h-[100px]">
                            {languages.map((l, i) => (
                                <div key={i} className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm border border-border">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-app-text">{l.lang}</span>
                                        <span className="text-xs font-medium uppercase tracking-wider text-text-on-dark bg-sidebar px-2 py-1 rounded">{l.level}</span>
                                    </div>
                                    <button onClick={() => removeLanguage(l.lang)} className="text-muted hover:text-error-bg0 text-sm font-medium transition-colors">Ukloni</button>
                                </div>
                            ))}
                            {languages.length === 0 && <p className="text-sm text-muted italic text-center py-4 border border-dashed border-border rounded-lg">Nijedan jezik nije dodat</p>}
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-border mt-6">
                            <button
                                onClick={() => setStep(2)}
                                className="w-1/3 py-3 px-4 border border-border rounded-lg shadow-sm text-sm font-medium text-muted bg-card hover:bg-app-secondary focus:outline-none transition-colors"
                            >
                                Nazad
                            </button>
                            <button
                                onClick={handleNextStep3}
                                disabled={loading}
                                className="w-2/3 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-text-on-dark bg-accent hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Čuvanje...' : 'Završi profil'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Done */}
                {step === 4 && (
                    <div className="space-y-6 text-center py-10 animate-fade-in">
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-app mb-6">
                            <svg className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-light text-app-text">Super! Profil je popunjen.</h2>
                        <p className="text-muted max-w-sm mx-auto">
                            Sada možemo da ti prikažemo tvoj Skill Checklist za željene prakse, kao i da ti omogućimo pametnije pretrage.
                        </p>

                        <button
                            onClick={handleFinish}
                            className="mt-10 w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-md text-lg font-medium text-text-on-dark bg-accent hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all"
                        >
                            Pronađi praksu
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
