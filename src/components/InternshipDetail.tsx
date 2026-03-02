'use client';

import { useState, useEffect } from 'react';
import { Internship, ProfileForGap, getSkillGaps, LanguageSkill } from '@/lib/skillGap';

interface InternshipDetailProps {
    internship: Internship | null;
    userProfile: ProfileForGap | null;
    isLoggedIn: boolean;
    isSaved: boolean;
    handleSave: (id: string, e: React.MouseEvent) => void;
}

export default function InternshipDetail({ internship, userProfile, isLoggedIn, isSaved, handleSave }: InternshipDetailProps) {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    // Load from localStorage on mount when internship changes
    useEffect(() => {
        if (!isLoggedIn || !internship) return;
        try {
            const saved = localStorage.getItem(`praksonar_gaps_${internship.id}`);
            if (saved) {
                setCheckedItems(JSON.parse(saved));
            } else {
                setCheckedItems({});
            }
        } catch (e) {
            console.error('Error loading checkmarks', e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [internship?.id, isLoggedIn]);

    if (!internship) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-praksonar-teal/60 h-full border border-dashed border-praksonar-teal/20 rounded-xl">
                <svg className="w-16 h-16 mb-4 text-praksonar-teal/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <h3 className="text-xl font-medium mb-2">Izaberi praksu</h3>
                <p className="text-sm">Klikni na karticu sa leve strane da vidiš detalje i uporediš svoje veštine.</p>
            </div>
        );
    }

    const toggleCheck = (item: string) => {
        const newState = { ...checkedItems, [item]: !checkedItems[item] };
        setCheckedItems(newState);
        try {
            localStorage.setItem(`praksonar_gaps_${internship.id}`, JSON.stringify(newState));
        } catch (e) {
            console.error('Error saving checkmarks', e);
        }
    };

    const reqSkills = internship.required_skills || [];
    const reqLangs = Array.isArray(internship.required_languages) ? internship.required_languages : [];
    const hasNoReqs = reqSkills.length === 0 && reqLangs.length === 0;

    let missingSkills: string[] = [];
    let missingLanguages: string[] = [];

    if (isLoggedIn) {
        const gaps = getSkillGaps(userProfile, internship);
        missingSkills = gaps.missingSkills;
        missingLanguages = gaps.missingLanguages;
    }

    const allGaps = [...missingLanguages, ...missingSkills];
    const initialGapsCount = allGaps.length;
    const checkedCount = allGaps.filter(item => checkedItems[item]).length;
    const remainingCount = initialGapsCount - checkedCount;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col h-full overscroll-contain overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-praksonar-teal/80">{internship.company}</p>
                    <button
                        onClick={(e) => handleSave(internship.id, e)}
                        className={`p-2 rounded-full transition-colors ${isSaved ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'}`}
                        title={isSaved ? "Ukloni iz sačuvanih" : "Sačuvaj praksu"}
                    >
                        <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
                <h2 className="text-2xl font-medium text-gray-900 leading-tight mb-4">{internship.title}</h2>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-praksonar-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {internship.location || 'Nije navedeno'} {internship.is_international && '(Internacionalno)'}
                    </span>
                    {internship.source_name && (
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-praksonar-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                            {internship.source_name}
                        </span>
                    )}
                </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                {/* Description */}
                {internship.description && (
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Opis pozicije</h3>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {internship.description}
                        </div>
                    </div>
                )}

                {/* Requirements Overview */}
                <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Zahtevi</h3>
                    {hasNoReqs ? (
                        <p className="text-sm text-gray-500 italic">Zahtevi nisu navedeni.</p>
                    ) : (
                        <div className="space-y-4">
                            {reqSkills.length > 0 && (
                                <ul className="space-y-1">
                                    {reqSkills.map((s, i) => (
                                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="text-praksonar-gold mt-0.5">›</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {reqLangs.length > 0 && (
                                <ul className="space-y-1">
                                    {reqLangs.map((lang: LanguageSkill, i: number) => (
                                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="text-praksonar-gold mt-0.5">›</span> {lang.lang} {lang.level && `- ${lang.level}`}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Skills Gap Analysis */}
                <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Šta ti nedostaje?</h3>
                    {!isLoggedIn ? (
                        <p className="text-sm text-gray-500 italic">Prijavi se da vidiš analizu veština.</p>
                    ) : hasNoReqs ? (
                        <p className="text-sm text-gray-500 italic">Praksa nema specifične zahteve.</p>
                    ) : initialGapsCount === 0 ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-sm font-medium">Sve veštine se poklapaju. Spreman/a si!</span>
                        </div>
                    ) : (
                        <div>
                            <p className="text-xs text-gray-500 mb-3">Veštine koje treba da naučiš (obeleži kad završiš):</p>
                            <div className="flex flex-wrap gap-2">
                                {allGaps.map((item, idx) => {
                                    const isChecked = !!checkedItems[item];
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => toggleCheck(item)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isChecked ? 'bg-green-50 text-green-700 border-green-200 line-through opacity-70' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                                        >
                                            {isChecked ? (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            )}
                                            {item}
                                        </button>
                                    )
                                })}
                            </div>

                            {remainingCount === 0 && initialGapsCount > 0 && (
                                <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md animate-fade-in">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-sm font-medium">Bravo! Spreman/a si za prijavu.</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                        Rok za prijavu: <span className="font-medium text-gray-900">{internship.deadline ? new Date(internship.deadline).toLocaleDateString('sr-RS') : 'Što pre'}</span>
                    </span>
                </div>
                <a
                    href={internship.source_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3.5 px-4 bg-praksonar-gold hover:bg-yellow-600 active:bg-yellow-700 text-white text-center font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-praksonar-gold focus:ring-offset-2"
                >
                    Apliciraj na {internship.source_name || 'sajtu kompanije'}
                </a>
            </div>
        </div>
    );
}
