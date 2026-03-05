'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { usePalette } from '@/components/PaletteProvider';
import { PALETTES } from '@/lib/palettes';
import InlineMessage from '@/components/InlineMessage';
import SonarLoader from '@/components/SonarLoader';

// ─── Toggle component ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, sublabel }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    sublabel?: string;
}) {
    return (
        <label className="flex items-start justify-between gap-4 cursor-pointer group">
            <div>
                <p className="text-sm font-medium text-app-text group-hover:text-accent transition-colors">{label}</p>
                {sublabel && <p className="text-xs text-muted mt-0.5">{sublabel}</p>}
            </div>
            <button
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative flex-shrink-0 mt-0.5 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${checked ? 'bg-sidebar' : 'bg-border'}`}
            >
                <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
                />
            </button>
        </label>
    );
}

// ─── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    // Close on Escape
    useEffect(() => {
        const handler = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md p-6 z-10">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-medium text-app-text">{title}</h3>
                    <button onClick={onClose} className="text-muted hover:text-accent transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const supabase = createClient();
    const router = useRouter();
    const { activePaletteName, setPalette } = usePalette();

    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [pageMessage, setPageMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

    // Section 2 — Exclusion filters
    const [excludedKeywords, setExcludedKeywords] = useState<string[]>([]);
    const [keywordInput, setKeywordInput] = useState('');
    const [savingKeywords, setSavingKeywords] = useState(false);
    const keywordInputRef = useRef<HTMLInputElement>(null);

    // Section 3 — Notifications
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [showProfileMatch, setShowProfileMatch] = useState(false);
    const [savingNotifications, setSavingNotifications] = useState(false);

    // Section 4 — Account modals
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Password modal state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Delete modal state
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);

    // ── Load profile ──────────────────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }
            setUserId(user.id);

            const { data } = await supabase
                .from('user_profiles')
                .select('excluded_keywords, email_notifications, show_profile_match')
                .eq('id', user.id)
                .single();

            if (data) {
                setExcludedKeywords(data.excluded_keywords || []);
                setEmailNotifications(data.email_notifications ?? false);
                setShowProfileMatch(data.show_profile_match ?? false);
            }
            setLoading(false);
        }
        load();
    }, [router, supabase]);

    // ── Keyword tag input ─────────────────────────────────────────────────────
    const addKeyword = () => {
        const word = keywordInput.trim();
        if (!word) return;
        if (excludedKeywords.map(k => k.toLowerCase()).includes(word.toLowerCase())) {
            setPageMessage({ type: 'info', text: 'Ta reč je već dodata.' });
            return;
        }
        setExcludedKeywords(prev => [...prev, word]);
        setKeywordInput('');
        keywordInputRef.current?.focus();
    };

    const handleKeywordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addKeyword();
        }
    };

    const removeKeyword = (word: string) => {
        setExcludedKeywords(prev => prev.filter(k => k !== word));
    };

    const saveKeywords = async () => {
        if (!userId) return;
        setSavingKeywords(true);
        const { error } = await supabase
            .from('user_profiles')
            .update({ excluded_keywords: excludedKeywords })
            .eq('id', userId);
        if (error) {
            setPageMessage({ type: 'error', text: 'Greška pri čuvanju filtera.' });
        } else {
            setPageMessage({ type: 'success', text: 'Filteri sačuvani!' });
        }
        setSavingKeywords(false);
    };

    // ── Notifications save ─────────────────────────────────────────────────────
    const saveNotifications = async () => {
        if (!userId) return;
        setSavingNotifications(true);
        const { error } = await supabase
            .from('user_profiles')
            .update({ email_notifications: emailNotifications, show_profile_match: showProfileMatch })
            .eq('id', userId);
        if (error) {
            setPageMessage({ type: 'error', text: 'Greška pri čuvanju podešavanja.' });
        } else {
            setPageMessage({ type: 'success', text: 'Podešavanja obaveštenja sačuvana!' });
        }
        setSavingNotifications(false);
    };

    // ── Change password ────────────────────────────────────────────────────────
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            setPasswordMessage({ type: 'error', text: 'Popunite oba polja.' });
            return;
        }
        if (newPassword.length < 8) {
            setPasswordMessage({ type: 'error', text: 'Nova lozinka mora imati najmanje 8 karaktera.' });
            return;
        }

        setPasswordSaving(true);
        setPasswordMessage(null);

        // Re-authenticate first by signing in again
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
            setPasswordMessage({ type: 'error', text: 'Ne mogu da pronađem vaš nalog.' });
            setPasswordSaving(false);
            return;
        }

        // Verify current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            setPasswordMessage({ type: 'error', text: 'Pogrešna trenutna lozinka.' });
            setPasswordSaving(false);
            return;
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

        if (updateError) {
            setPasswordMessage({ type: 'error', text: 'Greška pri promeni lozinke.' });
        } else {
            setPasswordMessage({ type: 'success', text: 'Lozinka uspešno promenjena!' });
            setCurrentPassword('');
            setNewPassword('');
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordMessage(null);
            }, 1500);
        }
        setPasswordSaving(false);
    };

    // ── Delete account ─────────────────────────────────────────────────────────
    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'OBRISI') return;
        setDeleting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Cascade delete related rows
                await supabase.from('saved_internships').delete().eq('user_id', user.id);
                await supabase.from('cv_generations').delete().eq('user_id', user.id);
                await supabase.from('user_profiles').delete().eq('id', user.id);
            }

            // Call server-side route for auth.admin.deleteUser
            const res = await fetch('/api/account/delete', { method: 'DELETE' });
            if (res.ok) {
                await supabase.auth.signOut();
                router.push('/');
            } else {
                setPageMessage({ type: 'error', text: 'Greška pri brisanju naloga. Kontaktirajte podršku.' });
                setShowDeleteModal(false);
                setDeleting(false);
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            setPageMessage({ type: 'error', text: 'Došlo je do neočekivane greške pri brisanju.' });
            setShowDeleteModal(false);
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-16">
                <SonarLoader size={100} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col pt-4 pb-20 max-w-3xl mx-auto w-full px-4 sm:px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-light text-app-text">Podešavanja</h1>
                <p className="mt-1 text-muted">Prilagodite izgled i rad aplikacije.</p>
            </div>

            {pageMessage && (
                <div className="mb-6">
                    <InlineMessage type={pageMessage.type} message={pageMessage.text} onClose={() => setPageMessage(null)} />
                </div>
            )}

            <div className="space-y-6">

                {/* ── SECTION 1: IZGLED ───────────────────────────────────────── */}
                <section className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-5 border-b border-border bg-app-secondary/50">
                        <h2 className="text-lg font-medium text-app-text">Izgled</h2>
                        <p className="text-sm text-muted mt-1">Izaberite paletu boja koja vam najviše odgovara.</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.values(PALETTES).map((palette) => (
                                <button
                                    key={palette.name}
                                    onClick={() => setPalette(palette.name)}
                                    className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all duration-200 group ${activePaletteName === palette.name
                                        ? 'border-accent ring-4 ring-accent/10'
                                        : 'border-border hover:border-accent/40'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="font-medium text-app-text text-sm">{palette.name}</span>
                                        <div className="flex items-center gap-1.5">
                                            {palette.isDark && (
                                                <span className="text-[10px] uppercase tracking-widest bg-sidebar text-text-on-dark px-1.5 py-0.5 rounded">Dark</span>
                                            )}
                                            {activePaletteName === palette.name && (
                                                <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 mt-auto">
                                        <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: palette.colors.sidebar }} title="Sidebar" />
                                        <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: palette.colors.accent }} title="Accent" />
                                        <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: palette.colors.bg }} title="Background" />
                                        <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: palette.colors.card }} title="Card" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── SECTION 2: FILTERI ──────────────────────────────────────── */}
                <section className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-5 border-b border-border bg-app-secondary/50 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-medium text-app-text">Filteri</h2>
                            <p className="text-sm text-muted mt-1">Isključi oglase koji sadrže ove reči.</p>
                        </div>
                        <button
                            onClick={saveKeywords}
                            disabled={savingKeywords}
                            className="text-sm font-medium text-accent hover:text-yellow-600 transition-colors disabled:opacity-50"
                        >
                            {savingKeywords ? 'Čuvanje...' : 'Sačuvaj'}
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Tag cloud */}
                        <div className="min-h-[52px] flex flex-wrap gap-2 p-3 bg-app-secondary rounded-lg border border-border">
                            {excludedKeywords.length === 0 && (
                                <span className="text-sm text-muted italic self-center">Nema dodatih reči za isključivanje</span>
                            )}
                            {excludedKeywords.map((word) => (
                                <span
                                    key={word}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"
                                >
                                    {word}
                                    <button
                                        onClick={() => removeKeyword(word)}
                                        className="hover:text-red-500 transition-colors focus:outline-none"
                                        aria-label={`Ukloni ${word}`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="flex gap-3">
                            <input
                                ref={keywordInputRef}
                                type="text"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyDown={handleKeywordKeyDown}
                                placeholder="Upiši reč i pritisni Enter... (npr. German, vozačka)"
                                className="flex-1 rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input text-sm"
                            />
                            <button
                                onClick={addKeyword}
                                className="px-4 py-2.5 text-sm font-medium bg-sidebar text-text-on-dark rounded-lg hover:opacity-90 transition-colors"
                            >
                                Dodaj
                            </button>
                        </div>
                        <p className="text-xs text-muted">
                            Prakse koje u naslovu, opisu ili veštinama sadrže neku od ovih reči biće sakrivene na stranici sa praksama.
                        </p>
                    </div>
                </section>

                {/* ── SECTION 3: OBAVEŠTENJA ──────────────────────────────────── */}
                <section className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-5 border-b border-border bg-app-secondary/50 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-medium text-app-text">Obaveštenja</h2>
                            <p className="text-sm text-muted mt-1">Upravljanje obaveštenjima i prikazom praksi.</p>
                        </div>
                        <button
                            onClick={saveNotifications}
                            disabled={savingNotifications}
                            className="text-sm font-medium text-accent hover:text-yellow-600 transition-colors disabled:opacity-50"
                        >
                            {savingNotifications ? 'Čuvanje...' : 'Sačuvaj'}
                        </button>
                    </div>
                    <div className="p-6 space-y-5">
                        <Toggle
                            checked={emailNotifications}
                            onChange={setEmailNotifications}
                            label="Email obaveštenja o novim praksama"
                            sublabel="Šaljemo ti email kada dodamo nove prakse koje odgovaraju tvojoj oblasti."
                        />
                        <div className="border-t border-border/60" />
                        <Toggle
                            checked={showProfileMatch}
                            onChange={setShowProfileMatch}
                            label="Prikaži samo prakse koje odgovaraju mom profilu"
                            sublabel="Na stranici sa praksama prikazuju se samo prakse koje se poklapaju sa tvojim veštinama i jezicima."
                        />
                    </div>
                </section>

                {/* ── SECTION 4: NALOG ────────────────────────────────────────── */}
                <section className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-5 border-b border-border bg-app-secondary/50">
                        <h2 className="text-lg font-medium text-app-text">Nalog</h2>
                        <p className="text-sm text-muted mt-1">Upravljanje nalogom i bezbednošću.</p>
                    </div>
                    <div className="p-6 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-border text-app-text rounded-lg hover:bg-app-secondary transition-colors"
                        >
                            <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            Promeni lozinku
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Obriši nalog
                        </button>
                    </div>
                </section>

            </div>

            {/* ── Password Modal ────────────────────────────────────────────────── */}
            {showPasswordModal && (
                <Modal title="Promeni lozinku" onClose={() => { setShowPasswordModal(false); setPasswordMessage(null); setCurrentPassword(''); setNewPassword(''); }}>
                    <div className="space-y-4">
                        {passwordMessage && (
                            <div className={`p-3 rounded-lg text-sm ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {passwordMessage.text}
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Trenutna lozinka</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Nova lozinka</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input text-sm"
                                placeholder="Min. 8 karaktera"
                            />
                        </div>
                        <button
                            onClick={handleChangePassword}
                            disabled={passwordSaving}
                            className="w-full py-2.5 bg-sidebar text-text-on-dark rounded-lg font-medium text-sm hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {passwordSaving ? <><SonarLoader size={18} /> Čuvanje...</> : 'Potvrdi promenu'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── Delete Modal ──────────────────────────────────────────────────── */}
            {showDeleteModal && (
                <Modal title="Obriši nalog" onClose={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}>
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-sm text-red-700 font-medium">Ova akcija je nepovratna.</p>
                            <p className="text-sm text-red-600 mt-1">Biće obrisani svi tvoji podaci, sačuvane prakse, CV i profilna slika.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">
                                Ukucaj <span className="text-red-600 font-bold">OBRISI</span> za potvrdu
                            </label>
                            <input
                                type="text"
                                value={deleteConfirm}
                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                className="block w-full rounded-lg border-red-200 shadow-sm focus:border-red-400 focus:ring-red-400 py-2.5 px-3 border transition-colors bg-input text-sm"
                                placeholder="OBRISI"
                            />
                        </div>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirm !== 'OBRISI' || deleting}
                            className="w-full py-2.5 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            {deleting ? <><SonarLoader size={18} /> Brisanje...</> : 'Trajno obriši nalog'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
