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
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="w-full max-w-xl bg-white p-8 rounded-lg shadow-sm border border-gray-200">

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                        <span>Osnovno</span>
                        <span>Veštine</span>
                        <span>Jezici</span>
                        <span>Gotovo</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(step / 4) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Dobrodošli! Recite nam nešto o sebi</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ime i prezime</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                                placeholder="Petar Petrović"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fakultet / Univerzitet</label>
                            <input
                                type="text"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                                placeholder="Univerzitet u Beogradu"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Oblast studija</label>
                                <select
                                    value={fieldOfStudy}
                                    onChange={(e) => setFieldOfStudy(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white"
                                >
                                    {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nivo studija</label>
                                <select
                                    value={studyLevel}
                                    onChange={(e) => setStudyLevel(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white"
                                >
                                    <option value="bachelor">Osnovne (Bachelor)</option>
                                    <option value="master">Master</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleNextStep1}
                            disabled={loading || !fullName || !university}
                            className="w-full mt-4 flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Čuvanje...' : 'Sledeći korak'}
                        </button>
                    </div>
                )}

                {/* Step 2: Skills */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Koje su tvoje veštine?</h2>
                        <p className="text-sm text-gray-600">Dodaj tehnologije, alate i koncepte koje poznaješ.</p>

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
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                                placeholder="Unesi veštinu i pritisni Enter (npr. Python)"
                            />
                        </div>

                        {/* Selected Skills */}
                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                            {skills.map(skill => (
                                <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)} className="ml-2 inline-flex text-blue-500 hover:text-blue-700 focus:outline-none">
                                        &times;
                                    </button>
                                </span>
                            ))}
                            {skills.length === 0 && <span className="text-sm text-gray-400 italic">Nijedna veština nije dodata</span>}
                        </div>

                        {/* Suggested Skills */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Predloženo:</p>
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).map(skill => (
                                    <button
                                        key={skill}
                                        onClick={() => addSkill(skill)}
                                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        + {skill}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setStep(1)}
                                className="w-1/3 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Nazad
                            </button>
                            <button
                                onClick={handleNextStep2}
                                disabled={loading}
                                className="w-2/3 flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Čuvanje...' : 'Sledeći korak'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Languages */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Koje jezike govoriš?</h2>

                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jezik</label>
                                <select
                                    value={langInput}
                                    onChange={(e) => setLangInput(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white"
                                >
                                    {LANG_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div className="w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nivo</label>
                                <select
                                    value={levelInput}
                                    onChange={(e) => setLevelInput(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white"
                                >
                                    {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={addLanguage}
                                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                            >
                                Dodaj
                            </button>
                        </div>

                        {/* Selected Languages */}
                        <div className="space-y-3 min-h-[100px] border border-gray-200 rounded-md p-4 bg-gray-50">
                            {languages.map((l, i) => (
                                <div key={i} className="flex justify-between items-center bg-white p-3 rounded shadow-sm border border-gray-100">
                                    <div>
                                        <span className="font-semibold text-gray-900">{l.lang}</span>
                                        <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{l.level}</span>
                                    </div>
                                    <button onClick={() => removeLanguage(l.lang)} className="text-red-500 hover:text-red-700 text-sm font-medium">Ukloni</button>
                                </div>
                            ))}
                            {languages.length === 0 && <p className="text-sm text-gray-400 italic">Nijedan jezik nije dodat</p>}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="w-1/3 flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Nazad
                            </button>
                            <button
                                onClick={handleNextStep3}
                                disabled={loading}
                                className="w-2/3 flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Čuvanje...' : 'Završi profil'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Done */}
                {step === 4 && (
                    <div className="space-y-6 text-center py-8">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Super! Profil je popunjen.</h2>
                        <p className="text-gray-600">
                            Sada možemo da ti prikažemo šta ti nedostaje za željene prakse, kao i da automatizujemo generisanje prijava.
                        </p>

                        <button
                            onClick={handleFinish}
                            className="mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Pronađi praksu
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
