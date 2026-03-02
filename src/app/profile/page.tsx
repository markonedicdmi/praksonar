'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form States
    const [fullName, setFullName] = useState('');
    const [university, setUniversity] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState('');
    const [studyLevel, setStudyLevel] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [languages, setLanguages] = useState<{ lang: string, level: string }[]>([]);

    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth/login');
                return;
            }

            const { data } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (data) {
                setFullName(data.full_name || '');
                setUniversity(data.university || '');
                setFieldOfStudy(data.field_of_study || '');
                setStudyLevel(data.study_level || '');
                setSkills(data.skills || []);
                setLanguages(data.languages || []);
            }
            setLoading(false);
        }
        loadProfile();
    }, [router, supabase]);

    const handleSave = async (section: 'basic' | 'skills' | 'languages') => {
        setSaving(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        let updates = {};
        if (section === 'basic') {
            updates = { full_name: fullName, university, field_of_study: fieldOfStudy, study_level: studyLevel };
        } else if (section === 'skills') {
            updates = { skills };
        } else if (section === 'languages') {
            updates = { languages };
        }

        const { error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', session.user.id);

        if (!error) {
            alert('Promene sačuvane!');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="p-8 max-w-5xl mx-auto space-y-6 w-full">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-full">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="h-10 bg-gray-100 rounded"></div>
                            <div className="h-10 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col pt-4 pb-20 max-w-5xl mx-auto w-full px-4 sm:px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-light text-praksonar-teal">Moj Profil</h1>
                <p className="mt-1 text-praksonar-teal/70">Upravljanje vašim ličnim podacima i veštinama.</p>
            </div>

            <div className="space-y-6">
                {/* Basic Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-praksonar-teal">Osnovne informacije</h2>
                        <button onClick={() => handleSave('basic')} disabled={saving} className="text-sm font-medium text-praksonar-gold hover:text-yellow-600 transition-colors">
                            Sačuvaj
                        </button>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Ime i prezime</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-praksonar-teal focus:ring-praksonar-teal py-2.5 px-3 border transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Fakultet</label>
                            <input
                                type="text"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-praksonar-teal focus:ring-praksonar-teal py-2.5 px-3 border transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Oblast studija</label>
                            <input
                                type="text"
                                value={fieldOfStudy}
                                onChange={(e) => setFieldOfStudy(e.target.value)}
                                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-praksonar-teal focus:ring-praksonar-teal py-2.5 px-3 border transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Nivo studija</label>
                            <select
                                value={studyLevel}
                                onChange={(e) => setStudyLevel(e.target.value)}
                                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-praksonar-teal focus:ring-praksonar-teal py-2.5 px-3 border transition-colors bg-white"
                            >
                                <option value="bachelor">Osnovne (Bachelor)</option>
                                <option value="master">Master</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Skills Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-praksonar-teal">Veštine</h2>
                        <button onClick={() => handleSave('skills')} disabled={saving} className="text-sm font-medium text-praksonar-gold hover:text-yellow-600 transition-colors">
                            Sačuvaj
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-4 min-h-[48px] p-4 bg-gray-50 rounded-lg border border-gray-100 items-center">
                            {skills.map((skill) => (
                                <span key={skill} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-praksonar-mint border border-praksonar-teal/20 text-praksonar-teal">
                                    {skill}
                                    <button onClick={() => setSkills(skills.filter(s => s !== skill))} className="ml-2 text-praksonar-teal/50 hover:text-praksonar-teal transition-colors focus:outline-none">
                                        &times;
                                    </button>
                                </span>
                            ))}
                            {skills.length === 0 && <span className="text-sm text-gray-400 italic">Nemate dodatih veština</span>}
                        </div>
                        <input
                            type="text"
                            placeholder="Dodaj novu veštinu i pritisni Enter..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const v = e.currentTarget.value.trim();
                                    if (v && !skills.includes(v)) setSkills([...skills, v]);
                                    e.currentTarget.value = '';
                                }
                            }}
                            className="block w-full md:w-1/2 rounded-lg border-gray-200 shadow-sm focus:border-praksonar-teal focus:ring-praksonar-teal py-2.5 px-3 border transition-colors"
                        />
                    </div>
                </div>

                {/* Languages Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-praksonar-teal">Jezici</h2>
                        <button onClick={() => handleSave('languages')} disabled={saving} className="text-sm font-medium text-praksonar-gold hover:text-yellow-600 transition-colors">
                            Sačuvaj
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-3">
                            {languages.map((l, i) => (
                                <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100 max-w-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-gray-900">{l.lang}</span>
                                        <span className="text-xs font-medium uppercase tracking-wider text-praksonar-teal bg-praksonar-mint px-2 py-1 rounded">{l.level}</span>
                                    </div>
                                    <button onClick={() => setLanguages(languages.filter(lang => lang.lang !== l.lang))} className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors">Ukloni</button>
                                </div>
                            ))}
                            {languages.length === 0 && <p className="text-sm text-gray-400 italic mb-4">Nemate dodatih jezika</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
