'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ProfileForGap, Internship } from '@/lib/skillGap';
import InternshipCard from '@/components/InternshipCard';
import InternshipDetail from '@/components/InternshipDetail';
import InlineMessage from '@/components/InlineMessage';
import SonarLoader from '@/components/SonarLoader';
import { trackEvent } from '@/lib/analytics';

// Filter option constants
const FIELDS = [
    'Sve oblasti',
    'Informatika',
    'Ekonomija',
    'Pravo',
    'Medicina',
    'Inženjerstvo',
    'Umetnost',
    'Ostalo',
];
const LOCATIONS = ['Sve', 'Srbija', 'Internacionalno', 'Rad od kuće'];
const LANGUAGES = ['Sve', 'Engleski', 'Nemački'];
const CITIES = ['Beograd', 'Novi Sad', 'Ostalo'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Najnovije' },
    { value: 'deadline', label: 'Rok prijave' },
];
// Source name options for multi-select checkboxes
const SOURCE_OPTIONS = ['Infostud', 'Erasmus', 'Reddit'];

function InternshipsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [internships, setInternships] = useState<Internship[]>([]);
    const [userProfile, setUserProfile] = useState<ProfileForGap | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [savedInternships, setSavedInternships] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [showSaved, setShowSaved] = useState(false);
    const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [startY, setStartY] = useState(0);
    const [page, setPage] = useState(0);
    const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
    const [pageMessage, setPageMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [scrollTop, setScrollTop] = useState(0);
    const [refreshCooldown, setRefreshCooldown] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);

    // --- URL-synced filter params ---
    const fieldParam = searchParams.get('field') || 'Sve oblasti';
    const locationParam = searchParams.get('location') || 'Sve';
    const languageParam = searchParams.get('language') || 'Sve';
    const cityParam = searchParams.get('city') || '';
    const sortParam = searchParams.get('sort') || 'newest';

    // Advanced filter params
    const hasDeadlineParam = searchParams.get('hasDeadline') === 'true';
    const deadlineBeforeParam = searchParams.get('deadlineBefore') || '';
    const postedAfterParam = searchParams.get('postedAfter') || '';
    // sources is comma-separated in URL e.g. "Infostud,Erasmus"
    const sourcesParam = searchParams.get('sources') || '';
    const selectedSources = sourcesParam ? sourcesParam.split(',') : [];

    // Client-side search state (not in URL — just ui state)
    const [clientSearch, setClientSearch] = useState('');

    const PAGE_SIZE = 20;

    const fetchInternships = useCallback(async (isLoadMore = false, currentPage = 0, isSilentRefresh = false) => {
        if (!isSilentRefresh) {
            if (!isLoadMore) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
        }

        try {
            // Base query with ordering
            let query = supabase
                .from('internships')
                .select('*');

            // --- Sorting ---
            if (sortParam === 'deadline') {
                // nullsFirst: false puts nulls at end
                query = query.order('deadline', { ascending: true, nullsFirst: false });
            } else {
                // Default: newest first
                query = query.order('created_at', { ascending: false });
            }

            // Pagination
            query = query.range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

            // --- Oblast (field of study) ---
            if (fieldParam !== 'Sve oblasti') {
                query = query.ilike('field', `%${fieldParam}%`);
            }

            // --- Location ---
            if (locationParam === 'Srbija') {
                query = query.eq('is_international', false);

                // --- City sub-filter (only when Srbija is selected) ---
                if (cityParam === 'Beograd') {
                    query = query.ilike('location', '%Beograd%');
                } else if (cityParam === 'Novi Sad') {
                    query = query.ilike('location', '%Novi Sad%');
                } else if (cityParam === 'Ostalo') {
                    // "Ostalo" = Serbian internships that are NOT Beograd or Novi Sad
                    query = query
                        .not('location', 'ilike', '%Beograd%')
                        .not('location', 'ilike', '%Novi Sad%');
                }
            } else if (locationParam === 'Internacionalno') {
                query = query.eq('is_international', true);
            } else if (locationParam === 'Rad od kuće') {
                query = query.or('location.ilike.%od kuće%,location.ilike.%remote%');
            }

            // --- Language ---
            // required_languages is a JSONB array of {lang, level} objects.
            // Use PostgREST's `cs` operator (contains) which maps to PostgreSQL @>
            if (languageParam === 'Engleski') {
                query = query.filter('required_languages', 'cs', '[{"lang":"English"}]');
            } else if (languageParam === 'Nemački') {
                query = query.filter('required_languages', 'cs', '[{"lang":"German"}]');
            }

            // --- Client-side search (title + company) ---
            if (clientSearch.trim()) {
                query = query.or(`title.ilike.%${clientSearch.trim()}%,company.ilike.%${clientSearch.trim()}%`);
            }

            // --- Advanced: only show internships with a deadline ---
            if (hasDeadlineParam) {
                query = query.not('deadline', 'is', null);
            }

            // --- Advanced: deadline before date ---
            if (deadlineBeforeParam) {
                query = query.lte('deadline', deadlineBeforeParam);
            }

            // --- Advanced: posted after date ---
            if (postedAfterParam) {
                query = query.gte('created_at', postedAfterParam);
            }

            // --- Advanced: source filter ---
            const sourcesList = sourcesParam ? sourcesParam.split(',') : [];
            if (sourcesList.length > 0) {
                query = query.in('source_name', sourcesList);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                setHasMore(data.length >= PAGE_SIZE);

                if (isLoadMore) {
                    setInternships((prev) => [...prev, ...data]);
                } else {
                    setInternships(data);
                }
            }
        } catch (error) {
            console.error('Error fetching internships:', error);
        } finally {
            if (!isSilentRefresh) {
                setLoading(false);
                setLoadingMore(false);
            }
        }
    }, [
        supabase,
        fieldParam,
        locationParam,
        languageParam,
        cityParam,
        sortParam,
        clientSearch,
        hasDeadlineParam,
        deadlineBeforeParam,
        postedAfterParam,
        sourcesParam,
    ]);

    // Re-fetch whenever filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0);
            setHasMore(true);
            fetchInternships(false, 0);
        }, 300);

        const fetchLatest = async () => {
            const { data } = await supabase.from('internships').select('created_at').order('created_at', { ascending: false }).limit(1).single();
            if (data) setLastRefreshed(data.created_at);
        };
        fetchLatest();

        return () => clearTimeout(timer);
    }, [fetchInternships, supabase]);

    // Fetch user profile + saved internships
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsLoggedIn(true);
                const { data } = await supabase
                    .from('user_profiles')
                    .select('skills, languages')
                    .eq('id', user.id)
                    .single();
                if (data) {
                    setUserProfile(data as ProfileForGap);
                }

                const { data: savedData } = await supabase
                    .from('saved_internships')
                    .select('internship_id')
                    .eq('user_id', user.id);
                if (savedData) {
                    setSavedInternships(savedData.map((d: { internship_id: string }) => d.internship_id));
                }
            }
        };
        fetchUser();
    }, [supabase]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchInternships(true, nextPage);
    };

    // Lock body scroll when detail panel is open on mobile
    useEffect(() => {
        if (isDetailOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isDetailOpen]);

    // Track scroll position for sticky panel height calculation
    useEffect(() => {
        const mainEl = document.querySelector('main');
        if (!mainEl) return;
        const onScroll = () => {
            setScrollTop(mainEl.scrollTop);
        };
        mainEl.addEventListener('scroll', onScroll, { passive: true });
        return () => mainEl.removeEventListener('scroll', onScroll);
    }, []);

    // Update a single URL filter param. Removes param when set to default value.
    const updateFilter = (key: string, value: string) => {
        trackEvent('filter_used', { filter_type: key, filter_value: value });
        const params = new URLSearchParams(searchParams.toString());

        // When switching away from Srbija, clear city filter
        if (key === 'location' && value !== 'Srbija') {
            params.delete('city');
        }

        const defaultValues = new Set(['Sve oblasti', 'Sve', 'newest', '', 'false']);
        if (defaultValues.has(value) || value === '') {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`?${params.toString()}`);
    };

    // Toggle a source in the multi-select sources param
    const toggleSource = (source: string) => {
        trackEvent('filter_used', { filter_type: 'source', filter_value: source });
        const current = new Set(selectedSources);
        if (current.has(source)) {
            current.delete(source);
        } else {
            current.add(source);
        }
        const params = new URLSearchParams(searchParams.toString());
        if (current.size === 0) {
            params.delete('sources');
        } else {
            params.set('sources', Array.from(current).join(','));
        }
        router.push(`?${params.toString()}`);
    };

    // Check if any advanced filters are currently active (for badge)
    const activeAdvancedCount = [
        hasDeadlineParam,
        !!deadlineBeforeParam,
        !!postedAfterParam,
        selectedSources.length > 0,
    ].filter(Boolean).length;

    const handleSave = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setPageMessage({ type: 'error', text: 'Morate biti ulogovani da biste sačuvali/uklonili praksu.' });
            return;
        }

        const isCurrentlySaved = savedInternships.includes(id);

        if (isCurrentlySaved) {
            const { error } = await supabase
                .from('saved_internships')
                .delete()
                .match({ internship_id: id, user_id: user.id });

            if (error) {
                setPageMessage({ type: 'error', text: 'Došlo je do greške prilikom uklanjanja.' });
                console.error(error);
            } else {
                setSavedInternships(prev => prev.filter(savedId => savedId !== id));
            }
        } else {
            const { error } = await supabase
                .from('saved_internships')
                .insert({ internship_id: id, user_id: user.id });

            if (error) {
                if (error.code === '23505') {
                    if (!savedInternships.includes(id)) {
                        setSavedInternships(prev => [...prev, id]);
                    }
                } else {
                    setPageMessage({ type: 'error', text: 'Došlo je do greške prilikom čuvanja.' });
                    console.error(error);
                }
            } else {
                setSavedInternships(prev => [...prev, id]);
            }
        }
    };

    const handleRefresh = async () => {
        trackEvent('scraper_refresh_clicked');
        if (refreshCooldown) {
            setPageMessage({ type: 'info', text: 'Sačekajte pre nego što ponovo osvežite.' });
            return;
        }

        setIsRefreshing(true);
        setPageMessage(null);

        try {
            const startRes = await fetch('/api/scrape', { method: 'POST' });
            const startData = await startRes.json();

            if (!startRes.ok) {
                if (startRes.status === 409 && startData.runId) {
                    setPageMessage({ type: 'info', text: 'Scraper je već aktivan, pratim status...' });
                } else {
                    throw new Error(startData.error || 'Greška pri pokretanju scrapera.');
                }
            }

            const runId = startData.runId;

            const pollStatus = (): Promise<{ status: string; new_count?: number; error_message?: string }> => {
                return new Promise((resolve, reject) => {
                    const interval = setInterval(async () => {
                        try {
                            const pollRes = await fetch(`/api/scrape?runId=${runId}`);
                            const pollData = await pollRes.json();

                            if (pollData.status === 'completed' || pollData.status === 'failed') {
                                clearInterval(interval);
                                resolve(pollData);
                            }
                        } catch (err) {
                            clearInterval(interval);
                            reject(err);
                        }
                    }, 3000);

                    setTimeout(() => {
                        clearInterval(interval);
                        reject(new Error('Scrapting traje predugo. Pokušajte ponovo.'));
                    }, 5 * 60 * 1000);
                });
            };

            const result = await pollStatus();

            if (result.status === 'completed') {
                await fetchInternships(false, 0, true);

                const countMsg = result.new_count
                    ? `Pronađeno ${result.new_count} praksi.`
                    : 'Nema novih praksi.';
                setPageMessage({ type: 'success', text: `Lista je uspešno ažurirana! ${countMsg}` });

                const { data } = await supabase.from('internships').select('created_at').order('created_at', { ascending: false }).limit(1).single();
                if (data) setLastRefreshed(data.created_at);
            } else {
                setPageMessage({
                    type: 'error',
                    text: result.error_message || 'Scraper nije uspeo. Pokušajte ponovo.',
                });
            }
        } catch (err) {
            console.error('Refresh error:', err);
            setPageMessage({
                type: 'error',
                text: err instanceof Error ? err.message : 'Greška pri osvežavanju liste.',
            });
        } finally {
            setIsRefreshing(false);
            setRefreshCooldown(true);
            setTimeout(() => setRefreshCooldown(false), 30000);
        }
    };

    // Client-side saved filtering
    const displayedInternships = internships.filter((internship) => {
        if (showSaved && !savedInternships.includes(internship.id)) return false;
        return true;
    });

    // Dynamic height for sticky detail panel
    const headerSpace = 250;
    const effectiveSpace = Math.max(24, headerSpace - scrollTop);
    const dynamicHeight = `calc(100vh - ${effectiveSpace}px - 2rem)`;

    return (
        <div className="min-h-full flex flex-col relative pb-6">
            {loading && internships.length === 0 && (
                <div className="absolute inset-x-0 inset-y-0 z-50 flex flex-col items-center justify-center bg-app/60 backdrop-blur-md rounded-xl">
                    <SonarLoader size={120} />
                    <p className="mt-4 text-app-text font-medium tracking-widest text-sm uppercase">Učitavanje...</p>
                </div>
            )}

            {/* Header row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-light text-app-text mb-2">Prakse</h1>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Results count + sort */}
                        <div className="flex items-center gap-3">
                            <p className="text-muted text-sm">
                                {loading ? 'Učitavanje...' : `Pronađeno ${displayedInternships.length}${hasMore ? '+' : ''} praksi`}
                            </p>
                            {/* Sort dropdown */}
                            <select
                                className="rounded-md border border-border bg-input text-sm py-1 px-2 text-app-text focus:border-sidebar focus:ring-sidebar"
                                value={sortParam}
                                onChange={(e) => updateFilter('sort', e.target.value)}
                                aria-label="Sortiraj po"
                            >
                                {SORT_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing || refreshCooldown}
                                className="px-3 py-1.5 text-xs font-medium border border-sidebar text-sidebar hover:bg-sidebar hover:text-text-on-dark rounded-md flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isRefreshing ? <SonarLoader size={16} /> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                                {isRefreshing ? 'Osvežavanje...' : 'Osveži listu'}
                            </button>
                            {lastRefreshed && (
                                <span className="text-xs text-muted/70 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Poslednje osvežavanje: {new Date(lastRefreshed).toLocaleDateString('sr-RS')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {isLoggedIn && (
                    <button
                        onClick={() => setShowSaved(!showSaved)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showSaved ? 'bg-accent border-accent text-text-on-dark shadow-sm' : 'bg-card border-border text-muted hover:bg-app-secondary'}`}
                    >
                        <svg className="w-5 h-5" fill={showSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Sačuvano
                    </button>
                )}
            </div>

            {pageMessage && (
                <InlineMessage type={pageMessage.type} message={pageMessage.text} onClose={() => setPageMessage(null)} />
            )}

            {/* ── FILTERS ── */}
            <div className="bg-card rounded-xl shadow-sm border border-border mb-6">
                {/* Primary filters row */}
                <div className="p-4 flex flex-wrap gap-4">
                    {/* Pretraga */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Pretraga</label>
                        <input
                            type="text"
                            placeholder="Po poziciji ili kompaniji..."
                            className="w-full rounded-md border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2 px-3 border text-sm bg-input"
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                        />
                    </div>

                    {/* Oblast */}
                    <div className="w-full sm:w-auto min-w-[150px]">
                        <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Oblast</label>
                        <select
                            className="w-full rounded-md border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2 px-3 border bg-input text-sm"
                            value={fieldParam}
                            onChange={(e) => updateFilter('field', e.target.value)}
                        >
                            {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>

                    {/* Lokacija */}
                    <div className="w-full sm:w-auto min-w-[150px]">
                        <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Lokacija</label>
                        <select
                            className="w-full rounded-md border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2 px-3 border bg-input text-sm"
                            value={locationParam}
                            onChange={(e) => updateFilter('location', e.target.value)}
                        >
                            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    {/* Grad — only shown when Srbija is selected */}
                    {locationParam === 'Srbija' && (
                        <div className="w-full sm:w-auto min-w-[140px]">
                            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Grad</label>
                            <select
                                className="w-full rounded-md border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2 px-3 border bg-input text-sm"
                                value={cityParam}
                                onChange={(e) => updateFilter('city', e.target.value)}
                            >
                                <option value="">Svi gradovi</option>
                                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Jezik */}
                    <div className="w-full sm:w-auto min-w-[150px]">
                        <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Jezik</label>
                        <select
                            className="w-full rounded-md border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2 px-3 border bg-input text-sm"
                            value={languageParam}
                            onChange={(e) => updateFilter('language', e.target.value)}
                        >
                            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>

                {/* Advanced filters toggle */}
                <div className="border-t border-border">
                    <button
                        onClick={() => setAdvancedOpen((o) => !o)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted hover:text-app-text transition-colors"
                    >
                        <span className="flex items-center gap-2 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Napredni filteri
                            {activeAdvancedCount > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-text-on-dark text-xs font-bold">
                                    {activeAdvancedCount}
                                </span>
                            )}
                        </span>
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${advancedOpen ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Advanced filters panel */}
                    {advancedOpen && (
                        <div className="px-4 pb-4 flex flex-wrap gap-6 border-t border-border/50 pt-4">
                            {/* Toggle: only with deadline */}
                            <label className="flex items-center gap-2 cursor-pointer select-none min-w-max">
                                <div
                                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${hasDeadlineParam ? 'bg-accent' : 'bg-border'}`}
                                    onClick={() => updateFilter('hasDeadline', hasDeadlineParam ? '' : 'true')}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${hasDeadlineParam ? 'translate-x-5' : ''}`} />
                                </div>
                                <span className="text-sm text-app-text">Prikaži samo prakse sa rokom</span>
                            </label>

                            {/* Rok do */}
                            <div>
                                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Rok do</label>
                                <input
                                    type="date"
                                    className="rounded-md border border-border bg-input text-sm py-1.5 px-3 text-app-text focus:border-sidebar focus:ring-sidebar"
                                    value={deadlineBeforeParam}
                                    onChange={(e) => updateFilter('deadlineBefore', e.target.value)}
                                />
                            </div>

                            {/* Datum objave od */}
                            <div>
                                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Datum objave od</label>
                                <input
                                    type="date"
                                    className="rounded-md border border-border bg-input text-sm py-1.5 px-3 text-app-text focus:border-sidebar focus:ring-sidebar"
                                    value={postedAfterParam}
                                    onChange={(e) => updateFilter('postedAfter', e.target.value)}
                                />
                            </div>

                            {/* Izvor multi-select */}
                            <div>
                                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Izvor</label>
                                <div className="flex flex-wrap gap-3">
                                    {SOURCE_OPTIONS.map((src) => {
                                        const isChecked = selectedSources.includes(src);
                                        return (
                                            <label key={src} className="flex items-center gap-1.5 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleSource(src)}
                                                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                                                />
                                                <span className="text-sm text-app-text">{src}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── SPLIT PANE ── */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6">
                {/* Left: List */}
                <div className="w-full lg:w-1/2 xl:w-7/12 flex flex-col space-y-4">
                    {displayedInternships.length === 0 && !loading ? (
                        <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border">
                            <h3 className="text-sm font-medium text-app-text">Nema rezultata</h3>
                            <p className="mt-1 text-sm text-muted">Pokušaj sa drugačijom pretragom.</p>
                        </div>
                    ) : (
                        <>
                            {displayedInternships.map((internship) => (
                                <InternshipCard
                                    key={internship.id}
                                    internship={internship}
                                    isSaved={savedInternships.includes(internship.id)}
                                    isSelected={selectedInternship?.id === internship.id}
                                    onClick={() => {
                                        setSelectedInternship(internship);
                                        setIsDetailOpen(true);
                                        setIsFullScreen(false);
                                    }}
                                    handleSave={handleSave}
                                />
                            ))}
                            {hasMore && !clientSearch.trim() && (
                                <div className="pt-4 flex justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="py-2.5 px-6 border border-sidebar text-accent rounded-lg shadow-sm hover:bg-sidebar hover:text-text-on-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loadingMore ? <><SonarLoader size={20} /> Učitavanje...</> : 'Učitaj još praksi'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Right: Detail Panel (Desktop) */}
                <div className="hidden lg:block lg:w-1/2 xl:w-5/12 relative">
                    <div
                        className="sticky top-6 transition-all ease-out"
                        style={{ height: dynamicHeight }}
                    >
                        <InternshipDetail
                            internship={selectedInternship}
                            userProfile={userProfile}
                            isLoggedIn={isLoggedIn}
                            isSaved={selectedInternship ? savedInternships.includes(selectedInternship.id) : false}
                            handleSave={handleSave}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Detail Overlay */}
            <div
                className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isDetailOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)} />
                <div
                    className={`absolute bottom-0 left-0 right-0 bg-app rounded-t-3xl shadow-2xl transition-all duration-300 transform ease-out flex flex-col ${isDetailOpen ? 'translate-y-0' : 'translate-y-full'}`}
                    style={{ height: isFullScreen ? '96vh' : '75vh' }}
                >
                    <button
                        className="w-full pt-[12px] pb-3 flex justify-center items-center touch-none focus:outline-none shrink-0"
                        onTouchStart={(e) => setStartY(e.touches[0].clientY)}
                        onTouchEnd={(e) => {
                            const endY = e.changedTouches[0].clientY;
                            const diff = endY - startY;
                            if (diff < -40 && !isFullScreen) {
                                setIsFullScreen(true);
                            } else if (diff > 40) {
                                if (isFullScreen) setIsFullScreen(false);
                                else setIsDetailOpen(false);
                            }
                        }}
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        aria-label="Promeni veličinu prozora"
                    >
                        <div
                            className="w-[40px] h-[4px] rounded-full"
                            style={{ backgroundColor: 'var(--color-text-muted)', opacity: 0.4 }}
                        />
                    </button>
                    <div className="flex-1 overflow-y-auto pb-8 px-4">
                        <InternshipDetail
                            internship={selectedInternship}
                            userProfile={userProfile}
                            isLoggedIn={isLoggedIn}
                            isSaved={selectedInternship ? savedInternships.includes(selectedInternship.id) : false}
                            handleSave={handleSave}
                            onClose={() => setIsDetailOpen(false)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}



export default function InternshipsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen text-center p-24 text-muted">Učitavanje...</div>}>
            <InternshipsContent />
        </Suspense>
    );
}
