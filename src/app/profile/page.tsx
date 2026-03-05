'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import InlineMessage from '@/components/InlineMessage';
import SonarLoader from '@/components/SonarLoader';

const LANGUAGE_OPTIONS = ['English', 'German', 'French', 'Spanish', 'Other'];
const LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageMessage, setPageMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Form States
    const [fullName, setFullName] = useState('');
    const [university, setUniversity] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState('');
    const [studyLevel, setStudyLevel] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [languages, setLanguages] = useState<{ lang: string; level: string }[]>([]);

    // Avatar
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarProgress, setAvatarProgress] = useState(0);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // CV
    const [cvUrl, setCvUrl] = useState<string | null>(null);
    const [cvUploading, setCvUploading] = useState(false);
    const cvInputRef = useRef<HTMLInputElement>(null);

    // Language add form
    const [newLang, setNewLang] = useState(LANGUAGE_OPTIONS[0]);
    const [newLevel, setNewLevel] = useState(LEVEL_OPTIONS[2]);

    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }
            setUserId(user.id);

            const { data } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setFullName(data.full_name || '');
                setUniversity(data.university || '');
                setFieldOfStudy(data.field_of_study || '');
                setStudyLevel(data.study_level || '');
                setSkills(data.skills || []);
                setLanguages(data.languages || []);
                setAvatarUrl(data.avatar_url || null);
                setCvUrl(data.cv_url || null);
            }
            setLoading(false);
        }
        loadProfile();
    }, [router, supabase]);

    const handleSave = async (section: 'basic' | 'skills' | 'languages') => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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
            .eq('id', user.id);

        if (!error) {
            setPageMessage({ type: 'success', text: 'Promene sacuvane!' });
        } else {
            setPageMessage({ type: 'error', text: 'Greska pri cuvanju.' });
        }
        setSaving(false);
    };

    // --- Avatar logic ---

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setPageMessage({ type: 'error', text: 'Dozvoljeni formati: JPEG, PNG.' });
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setPageMessage({ type: 'error', text: 'Maksimalna velicina slike: 2MB.' });
            return;
        }

        setAvatarUploading(true);
        setAvatarProgress(0);

        // Simulate progress since supabase-js doesn't provide upload progress natively
        const progressInterval = setInterval(() => {
            setAvatarProgress(prev => Math.min(prev + 15, 90));
        }, 150);

        const filePath = `${userId}/avatar.${file.type === 'image/png' ? 'png' : 'jpg'}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true, contentType: file.type });

        clearInterval(progressInterval);

        if (uploadError) {
            setPageMessage({ type: 'error', text: 'Greska pri uploadu slike.' });
            console.error(uploadError);
            setAvatarUploading(false);
            setAvatarProgress(0);
            return;
        }

        setAvatarProgress(100);

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl + '?t=' + Date.now(); // cache bust

        await supabase.from('user_profiles').update({ avatar_url: publicUrl }).eq('id', userId);
        setAvatarUrl(publicUrl);
        setAvatarUploading(false);
        setAvatarProgress(0);
        setPageMessage({ type: 'success', text: 'Slika uspesno postavljena!' });

        // Reset file input
        if (avatarInputRef.current) avatarInputRef.current.value = '';
    };

    const handleAvatarRemove = async () => {
        if (!userId) return;
        setAvatarUploading(true);

        // Try deleting both possible extensions
        await supabase.storage.from('avatars').remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`]);
        await supabase.from('user_profiles').update({ avatar_url: null }).eq('id', userId);

        setAvatarUrl(null);
        setAvatarUploading(false);
        setPageMessage({ type: 'info', text: 'Slika uklonjena.' });
    };

    // --- CV logic ---

    const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        if (file.type !== 'application/pdf') {
            setPageMessage({ type: 'error', text: 'Dozvoljeni format: PDF.' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setPageMessage({ type: 'error', text: 'Maksimalna velicina CV-a: 5MB.' });
            return;
        }

        setCvUploading(true);

        const filePath = `${userId}/cv.pdf`;

        const { error: uploadError } = await supabase.storage
            .from('cvs')
            .upload(filePath, file, { upsert: true, contentType: 'application/pdf' });

        if (uploadError) {
            setPageMessage({ type: 'error', text: 'Greska pri uploadu CV-a.' });
            console.error(uploadError);
            setCvUploading(false);
            return;
        }

        const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl + '?t=' + Date.now();

        await supabase.from('user_profiles').update({ cv_url: publicUrl }).eq('id', userId);
        setCvUrl(publicUrl);
        setCvUploading(false);
        setPageMessage({ type: 'success', text: 'CV uspesno postavljen!' });

        if (cvInputRef.current) cvInputRef.current.value = '';
    };

    const handleCvRemove = async () => {
        if (!userId) return;
        setCvUploading(true);

        await supabase.storage.from('cvs').remove([`${userId}/cv.pdf`]);
        await supabase.from('user_profiles').update({ cv_url: null }).eq('id', userId);

        setCvUrl(null);
        setCvUploading(false);
        setPageMessage({ type: 'info', text: 'CV uklonjen.' });
    };

    // --- Language add logic ---

    const handleAddLanguage = () => {
        if (languages.length >= 10) {
            setPageMessage({ type: 'error', text: 'Maksimalno 10 jezika.' });
            return;
        }
        if (languages.some(l => l.lang === newLang)) {
            setPageMessage({ type: 'error', text: 'Taj jezik je vec dodat.' });
            return;
        }
        setLanguages([...languages, { lang: newLang, level: newLevel }]);
    };

    // --- Initials helper ---
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || '?';
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-16 min-h-[60vh]">
                <SonarLoader size={120} />
                <p className="mt-4 text-app-text font-medium tracking-widest text-sm uppercase">Učitavanje...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col pt-4 pb-20 max-w-5xl mx-auto w-full px-4 sm:px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-light text-app-text">Moj Profil</h1>
                <p className="mt-1 text-muted">Upravljanje vasim licnim podacima i vestinama.</p>
            </div>
            {pageMessage && (
                <InlineMessage type={pageMessage.type} message={pageMessage.text} onClose={() => setPageMessage(null)} />
            )}

            <div className="space-y-6">

                {/* Profile Picture Card */}
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-5 border-b border-border bg-app-secondary/50">
                        <h2 className="text-lg font-medium text-app-text">Profilna slika</h2>
                    </div>
                    <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
                        {/* Avatar Display */}
                        <div className="relative flex-shrink-0">
                            {avatarUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full object-cover border-2 border-border shadow-md"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-sidebar text-text-on-dark flex items-center justify-center text-2xl font-bold shadow-md">
                                    {getInitials(fullName)}
                                </div>
                            )}
                            {avatarUploading && (
                                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                                    <SonarLoader size={40} />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            {avatarUploading && avatarProgress > 0 && (
                                <div className="w-48 bg-border rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-accent h-full rounded-full transition-all duration-300"
                                        style={{ width: `${avatarProgress}%` }}
                                    />
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={avatarUploading}
                                    className="px-4 py-2 text-sm font-medium bg-accent text-text-on-dark rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                                >
                                    Promeni sliku
                                </button>
                                {avatarUrl && (
                                    <button
                                        onClick={handleAvatarRemove}
                                        disabled={avatarUploading}
                                        className="px-4 py-2 text-sm font-medium border border-border text-muted rounded-lg hover:bg-app-secondary transition-colors disabled:opacity-50"
                                    >
                                        Ukloni sliku
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-muted">JPEG ili PNG, maks. 2MB</p>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/jpeg,image/png"
                                className="hidden"
                                onChange={handleAvatarUpload}
                            />
                        </div>
                    </div>
                </div>

                {/* CV Card */}
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-5 border-b border-border bg-app-secondary/50">
                        <h2 className="text-lg font-medium text-app-text">Moj CV</h2>
                    </div>
                    <div className="p-6">
                        {cvUrl ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-app-secondary p-4 rounded-lg border border-border gap-4">
                                <div className="flex items-center gap-3">
                                    <svg className="w-8 h-8 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-app-text text-sm">cv.pdf</p>
                                        <p className="text-xs text-muted">Postavljen</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <a
                                        href={cvUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 text-sm font-medium bg-sidebar text-text-on-dark rounded-lg hover:opacity-90 transition-colors"
                                    >
                                        Preuzmi
                                    </a>
                                    <button
                                        onClick={handleCvRemove}
                                        disabled={cvUploading}
                                        className="px-4 py-2 text-sm font-medium border border-border text-muted rounded-lg hover:bg-app-secondary transition-colors disabled:opacity-50"
                                    >
                                        Ukloni
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 border border-dashed border-border rounded-lg">
                                {cvUploading ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <SonarLoader size={48} />
                                        <p className="text-sm text-muted">Postavljanje CV-a...</p>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="w-10 h-10 text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <button
                                            onClick={() => cvInputRef.current?.click()}
                                            className="px-5 py-2.5 text-sm font-medium bg-accent text-text-on-dark rounded-lg hover:bg-yellow-600 transition-colors"
                                        >
                                            Dodaj CV
                                        </button>
                                        <p className="text-xs text-muted mt-3">Samo PDF, maks. 5MB</p>
                                    </>
                                )}
                            </div>
                        )}
                        <input
                            ref={cvInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            className="hidden"
                            onChange={handleCvUpload}
                        />
                    </div>
                </div>

                {/* Basic Info Card */}
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-5 border-b border-border bg-app-secondary/50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-app-text">Osnovne informacije</h2>
                        <button onClick={() => handleSave('basic')} disabled={saving} className="text-sm font-medium text-accent hover:text-yellow-600 transition-colors">
                            Sacuvaj
                        </button>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Ime i prezime</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Fakultet</label>
                            <input
                                type="text"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Oblast studija</label>
                            <input
                                type="text"
                                value={fieldOfStudy}
                                onChange={(e) => setFieldOfStudy(e.target.value)}
                                className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Nivo studija</label>
                            <select
                                value={studyLevel}
                                onChange={(e) => setStudyLevel(e.target.value)}
                                className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input"
                            >
                                <option value="bachelor">Osnovne (Bachelor)</option>
                                <option value="master">Master</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Skills Card */}
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-5 border-b border-border bg-app-secondary/50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-app-text">Vestine</h2>
                        <button onClick={() => handleSave('skills')} disabled={saving} className="text-sm font-medium text-accent hover:text-yellow-600 transition-colors">
                            Sacuvaj
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-4 min-h-[48px] p-4 bg-app-secondary rounded-lg border border-border items-center">
                            {skills.map((skill) => (
                                <span key={skill} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-app border border-border text-accent">
                                    {skill}
                                    <button onClick={() => setSkills(skills.filter(s => s !== skill))} className="ml-2 text-muted hover:text-accent transition-colors focus:outline-none">
                                        &times;
                                    </button>
                                </span>
                            ))}
                            {skills.length === 0 && <span className="text-sm text-muted italic">Nemate dodatih vestina</span>}
                        </div>
                        <input
                            type="text"
                            placeholder="Dodaj novu vestinu i pritisni Enter..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const v = e.currentTarget.value.trim();
                                    if (v && !skills.includes(v)) setSkills([...skills, v]);
                                    e.currentTarget.value = '';
                                }
                            }}
                            className="block w-full md:w-1/2 rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input"
                        />
                    </div>
                </div>

                {/* Languages Card */}
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-5 border-b border-border bg-app-secondary/50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-app-text">Jezici</h2>
                        <button onClick={() => handleSave('languages')} disabled={saving} className="text-sm font-medium text-accent hover:text-yellow-600 transition-colors">
                            Sacuvaj
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Existing languages list */}
                        <div className="space-y-3">
                            {languages.map((l, i) => (
                                <div key={i} className="flex justify-between items-center bg-app-secondary p-4 rounded-lg border border-border max-w-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-app-text">{l.lang}</span>
                                        <span className="text-xs font-medium uppercase tracking-wider text-text-on-dark bg-sidebar px-2 py-1 rounded">{l.level}</span>
                                    </div>
                                    <button
                                        onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))}
                                        className="text-muted hover:text-accent text-sm font-medium transition-colors"
                                    >
                                        Ukloni
                                    </button>
                                </div>
                            ))}
                            {languages.length === 0 && <p className="text-sm text-muted italic">Nemate dodatih jezika</p>}
                        </div>

                        {/* Add language form */}
                        {languages.length < 10 && (
                            <div className="flex flex-col sm:flex-row gap-3 max-w-lg pt-2 border-t border-border">
                                <select
                                    value={newLang}
                                    onChange={(e) => setNewLang(e.target.value)}
                                    className="flex-1 rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input text-sm"
                                >
                                    {LANGUAGE_OPTIONS.map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                                <select
                                    value={newLevel}
                                    onChange={(e) => setNewLevel(e.target.value)}
                                    className="w-full sm:w-24 rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input text-sm"
                                >
                                    {LEVEL_OPTIONS.map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAddLanguage}
                                    className="px-5 py-2.5 text-sm font-medium bg-accent text-text-on-dark rounded-lg hover:bg-yellow-600 transition-colors"
                                >
                                    Dodaj
                                </button>
                            </div>
                        )}
                        {languages.length >= 10 && (
                            <p className="text-xs text-muted">Maksimalan broj jezika je dostignut (10).</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
