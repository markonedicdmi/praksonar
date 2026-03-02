'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSkillGaps, ProfileForGap, Internship } from '@/lib/skillGap';
import InternshipCard from '@/components/InternshipCard';

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
    const [page, setPage] = useState(0);

    // Filters from URL
    const fieldParam = searchParams.get('field') || 'Sve oblasti';
    const locationParam = searchParams.get('location') || 'All';
    const languageParam = searchParams.get('language') || 'All';
    const viewMode = searchParams.get('view') || 'default';
    const showSaved = searchParams.get('saved') === 'true';

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
    }, [fetchInternships]);

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
                    setSavedInternships(savedData.map((d: any) => d.internship_id));
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

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'Sve oblasti' || value === 'All' || value === 'false') {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`?${params.toString()}`);
    };

    const handleSave = async (id: string) => {
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

    // Masonry Layout Calculation for Compact Mode
    const columnCount = 3; // Max columns for lg
    const masonryColumns: Internship[][] = Array.from({ length: columnCount }, () => []);

    if (viewMode === 'compact') {
        displayedInternships.forEach((internship, index) => {
            masonryColumns[index % columnCount].push(internship);
        });
    }

    return (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Prakse</h1>
                    <p className="mt-1 text-gray-600">Pronađite svoju idealnu priliku za razvoj.</p>
                </div>
            </div>

            {/* View Mode & Saved Toggles */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => updateFilter('view', 'default')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'default' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Default
                    </button>
                    <button
                        onClick={() => updateFilter('view', 'compact')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'compact' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Compact
                    </button>
                </div>
                {isLoggedIn && (
                    <button
                        onClick={() => updateFilter('saved', showSaved ? 'false' : 'true')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showSaved ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <svg className="w-5 h-5" fill={showSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Sačuvano
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pretraga (klijentska)</label>
                    <input
                        type="text"
                        placeholder="Pretraži po naslovu ili kompaniji..."
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Oblast</label>
                    <select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white"
                        value={fieldParam}
                        onChange={(e) => updateFilter('field', e.target.value)}
                    >
                        {FIELDS.map((f) => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full md:w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lokacija</label>
                    <select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white"
                        value={locationParam}
                        onChange={(e) => updateFilter('location', e.target.value)}
                    >
                        {LOCATIONS.map((l) => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full md:w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jezik</label>
                    <select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white"
                        value={languageParam}
                        onChange={(e) => updateFilter('language', e.target.value)}
                    >
                        {LANGUAGES.map((l) => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                            <div className="flex gap-2">
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : displayedInternships.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nema rezultata</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Nismo našli nijednu praksu koja odgovara tvojim filterima. Pokušaj sa drugačijom pretragom!
                    </p>
                </div>
            ) : (
                <>
                    {viewMode === 'compact' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                            {/* Render Masonry Columns */}
                            {masonryColumns.map((column, colIdx) => (
                                <div key={colIdx} className="flex flex-col gap-6">
                                    {column.map((internship) => (
                                        <InternshipCard
                                            key={internship.id}
                                            internship={internship}
                                            userProfile={userProfile}
                                            isLoggedIn={isLoggedIn}
                                            isSaved={savedInternships.includes(internship.id)}
                                            handleSave={handleSave}
                                            viewMode={viewMode}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedInternships.map((internship) => (
                                <InternshipCard
                                    key={internship.id}
                                    internship={internship}
                                    userProfile={userProfile}
                                    isLoggedIn={isLoggedIn}
                                    isSaved={savedInternships.includes(internship.id)}
                                    handleSave={handleSave}
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    )}

                    {hasMore && !clientSearch.trim() && (
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingMore ? 'Učitavanje...' : 'Učitaj još'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}

export default function InternshipsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen text-center p-24 text-gray-500">Učitavanje...</div>}>
            <InternshipsContent />
        </Suspense>
    );
}
