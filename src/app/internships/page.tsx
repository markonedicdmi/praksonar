'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ProfileForGap, Internship } from '@/lib/skillGap';
import InternshipCard from '@/components/InternshipCard';
import InternshipDetail from '@/components/InternshipDetail';

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
const LOCATIONS = ['All', 'Srbija', 'Internacionalno'];
const LANGUAGES = ['All', 'Engleski', 'Nemački'];

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
    const [page, setPage] = useState(0);
    const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

    // Filters from URL
    const fieldParam = searchParams.get('field') || 'Sve oblasti';
    const locationParam = searchParams.get('location') || 'All';
    const languageParam = searchParams.get('language') || 'All';

    // Client-side search state
    const [clientSearch, setClientSearch] = useState('');

    const PAGE_SIZE = 20;

    const fetchInternships = useCallback(async (isLoadMore = false, currentPage = 0) => {
        if (!isLoadMore) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            let query = supabase
                .from('internships')
                .select('*')
                .order('created_at', { ascending: false })
                .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

            if (fieldParam !== 'Sve oblasti') {
                query = query.eq('field', fieldParam);
            }

            if (locationParam === 'Srbija') {
                query = query.eq('is_international', false);
            } else if (locationParam === 'Internacionalno') {
                query = query.eq('is_international', true);
            }

            if (languageParam === 'Engleski') {
                // Looking for either 'English' or 'Engleski' in the json array
                // A simple text search or strict contains. We will use contains.
                query = query.contains('required_languages', '[{"lang": "English"}]');
            } else if (languageParam === 'Nemački') {
                query = query.contains('required_languages', '[{"lang": "German"}]');
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                if (data.length < PAGE_SIZE) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                if (isLoadMore) {
                    setInternships((prev) => [...prev, ...data]);
                } else {
                    setInternships(data);
                }
            }
        } catch (error) {
            console.error('Error fetching internships:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [supabase, fieldParam, locationParam, languageParam]);

    useEffect(() => {
        setPage(0);
        setHasMore(true);
        fetchInternships(false, 0);

        const fetchLatest = async () => {
            const { data } = await supabase.from('internships').select('created_at').order('created_at', { ascending: false }).limit(1).single();
            if (data) setLastRefreshed(data.created_at);
        };
        fetchLatest();
    }, [fetchInternships, supabase]);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setIsLoggedIn(true);
                const { data } = await supabase
                    .from('user_profiles')
                    .select('skills, languages')
                    .eq('id', session.user.id)
                    .single();
                if (data) {
                    setUserProfile(data as ProfileForGap);
                }

                // Fetch saved internships
                const { data: savedData } = await supabase
                    .from('saved_internships')
                    .select('internship_id')
                    .eq('user_id', session.user.id);
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

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'Sve oblasti' || value === 'All' || value === 'false') {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`?${params.toString()}`);
    };

    const handleSave = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        // Requires login check
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert('Morate biti ulogovani da biste sačuvali/uklonili praksu.');
            return;
        }

        const isCurrentlySaved = savedInternships.includes(id);

        if (isCurrentlySaved) {
            // Unsave
            const { error } = await supabase
                .from('saved_internships')
                .delete()
                .match({ internship_id: id, user_id: session.user.id });

            if (error) {
                alert('Došlo je do greške prilikom uklanjanja.');
                console.error(error);
            } else {
                setSavedInternships(prev => prev.filter(savedId => savedId !== id));
            }
        } else {
            // Save
            const { error } = await supabase
                .from('saved_internships')
                .insert({ internship_id: id, user_id: session.user.id });

            if (error) {
                if (error.code === '23505') {
                    if (!savedInternships.includes(id)) {
                        setSavedInternships(prev => [...prev, id]);
                    }
                } else {
                    alert('Došlo je do greške prilikom čuvanja.');
                    console.error(error);
                }
            } else {
                setSavedInternships(prev => [...prev, id]);
            }
        }
    };

    // Client-side search & saved filtering
    const displayedInternships = internships.filter((internship) => {
        if (showSaved && !savedInternships.includes(internship.id)) return false;
        if (!clientSearch.trim()) return true;
        const searchLower = clientSearch.toLowerCase();
        const titleMatch = internship.title.toLowerCase().includes(searchLower);
        const companyMatch = internship.company.toLowerCase().includes(searchLower);
        return titleMatch || companyMatch;
    });

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-light text-app-text mb-2">Prakse</h1>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <p className="text-muted text-sm">
                            {loading ? 'Učitavanje...' : `Pronađeno ${displayedInternships.length} praksi`}
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => alert('Lista je ažurna!')}
                                className="px-3 py-1.5 text-xs font-medium border border-sidebar text-sidebar hover:bg-sidebar hover:text-text-on-dark rounded-md flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Osveži listu
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

            {/* Filters */}
            <div className="bg-card p-4 rounded-xl shadow-sm border border-border mb-6 flex flex-wrap gap-4">
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
                <div className="w-full sm:w-auto min-w-[150px]">
                    <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Lokacija</label>
                    <select
                        className="w-full rounded-md border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2 px-3 border bg-card text-sm"
                        value={locationParam}
                        onChange={(e) => updateFilter('location', e.target.value)}
                    >
                        {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                <div className="w-full sm:w-auto min-w-[150px]">
                    <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1">Jezik</label>
                    <select
                        className="w-full rounded-md border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2 px-3 border bg-card text-sm"
                        value={languageParam}
                        onChange={(e) => updateFilter('language', e.target.value)}
                    >
                        {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
            </div>

            {/* Split Pane Content */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                {/* Left Side: List */}
                <div className="w-full lg:w-1/2 xl:w-7/12 flex flex-col overflow-y-auto pr-1 pb-10 space-y-4 custom-scrollbar">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-card rounded-xl shadow-sm border border-border p-5 flex flex-col sm:flex-row gap-4 shrink-0">
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 bg-border/50 rounded w-1/3"></div>
                                    <div className="h-6 bg-border/50 rounded w-3/4"></div>
                                    <div className="flex gap-2 pt-2">
                                        <div className="h-5 bg-border/50 rounded w-20"></div>
                                        <div className="h-5 bg-border/50 rounded w-28"></div>
                                    </div>
                                    <div className="flex gap-1.5 pt-1">
                                        <div className="h-5 bg-border/50 rounded w-16"></div>
                                        <div className="h-5 bg-border/50 rounded w-20"></div>
                                    </div>
                                </div>
                                <div className="flex sm:flex-col justify-end items-end gap-3 mt-4 sm:mt-0 min-w-[120px]">
                                    <div className="h-4 bg-border/50 rounded w-24"></div>
                                    <div className="h-9 bg-border/50 rounded w-full sm:w-24"></div>
                                </div>
                            </div>
                        ))
                    ) : displayedInternships.length === 0 ? (
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
                                    }}
                                    handleSave={handleSave}
                                />
                            ))}
                            {hasMore && !clientSearch.trim() && (
                                <div className="pt-4 flex justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="py-2.5 px-6 border border-sidebar text-accent rounded-lg shadow-sm hover:bg-sidebar hover:text-text-on-dark transition-colors disabled:opacity-50"
                                    >
                                        {loadingMore ? 'Učitavanje...' : 'Učitaj još praksi'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Right Side: Detail Panel (Desktop) */}
                <div className="hidden lg:block lg:w-1/2 xl:w-5/12 sticky top-0 h-[calc(100vh-16rem)]">
                    <InternshipDetail
                        internship={selectedInternship}
                        userProfile={userProfile}
                        isLoggedIn={isLoggedIn}
                        isSaved={selectedInternship ? savedInternships.includes(selectedInternship.id) : false}
                        handleSave={handleSave}
                    />
                </div>
            </div>

            {/* Mobile Detail Overlay (Slide-up) */}
            <div
                className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isDetailOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)} />
                <div
                    className={`absolute bottom-0 left-0 right-0 bg-app rounded-t-3xl shadow-2xl transition-transform duration-500 transform ease-out ${isDetailOpen ? 'translate-y-0' : 'translate-y-full'}`}
                    style={{ height: '85vh' }}
                >
                    <div className="w-12 h-1.5 bg-border/20 rounded-full mx-auto my-3" />
                    <div className="h-full overflow-y-auto pb-20 px-4">
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
