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
    const [page, setPage] = useState(0);

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-light text-praksonar-teal mb-1">Prakse</h1>
                    <p className="text-praksonar-teal/70">
                        {loading ? 'Učitavanje...' : `Pronađeno ${displayedInternships.length} praksi`}
                    </p>
                </div>
                {isLoggedIn && (
                    <button
                        onClick={() => setShowSaved(!showSaved)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showSaved ? 'bg-praksonar-gold border-praksonar-gold text-white shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <svg className="w-5 h-5" fill={showSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Sačuvano
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Pretraga</label>
                    <input
                        type="text"
                        placeholder="Po poziciji ili kompaniji..."
                        className="w-full rounded-md border-gray-200 shadow-sm focus:border-praksonar-teal focus:ring-praksonar-teal py-2 px-3 border text-sm"
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-auto min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Oblast</label>
                    <select
                        className="w-full rounded-md border-gray-200 shadow-sm focus:border-praksonar-teal focus:ring-praksonar-teal py-2 px-3 border bg-white text-sm"
                        value={fieldParam}
                        onChange={(e) => updateFilter('field', e.target.value)}
                    >
                        {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div className="w-full sm:w-auto min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Lokacija</label>
                    <select
                        className="w-full rounded-md border-gray-200 shadow-sm focus:border-praksonar-teal focus:ring-praksonar-teal py-2 px-3 border bg-white text-sm"
                        value={locationParam}
                        onChange={(e) => updateFilter('location', e.target.value)}
                    >
                        {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                <div className="w-full sm:w-auto min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Jezik</label>
                    <select
                        className="w-full rounded-md border-gray-200 shadow-sm focus:border-praksonar-teal focus:ring-praksonar-teal py-2 px-3 border bg-white text-sm"
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
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="flex gap-2"><div className="h-5 bg-gray-200 rounded w-16"></div></div>
                            </div>
                        ))
                    ) : displayedInternships.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">Nema rezultata</h3>
                            <p className="mt-1 text-sm text-gray-500">Pokušaj sa drugačijom pretragom.</p>
                        </div>
                    ) : (
                        <>
                            {displayedInternships.map((internship) => (
                                <InternshipCard
                                    key={internship.id}
                                    internship={internship}
                                    isSaved={savedInternships.includes(internship.id)}
                                    isSelected={selectedInternship?.id === internship.id}
                                    onClick={() => setSelectedInternship(internship)}
                                    handleSave={handleSave}
                                />
                            ))}
                            {hasMore && !clientSearch.trim() && (
                                <div className="pt-4 flex justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="py-2.5 px-6 border border-praksonar-teal text-praksonar-teal rounded-lg shadow-sm hover:bg-praksonar-teal hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        {loadingMore ? 'Učitavanje...' : 'Učitaj još praksi'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Right Side: Detail Panel */}
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
        </div>
    );
}

export default function InternshipsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen text-center p-24 text-gray-500">Učitavanje...</div>}>
            <InternshipsContent />
        </Suspense>
    );
}
