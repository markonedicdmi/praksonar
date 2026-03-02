'use client';

import { useState, useEffect } from 'react';
import { Internship, ProfileForGap, getSkillGaps, LanguageSkill } from '@/lib/skillGap';

interface InternshipCardProps {
    internship: Internship;
    userProfile: ProfileForGap | null;
    isLoggedIn: boolean;
    isSaved: boolean;
    viewMode?: string;
    handleSave: (id: string) => void;
}

export default function InternshipCard({ internship, userProfile, isLoggedIn, isSaved, viewMode = 'default', handleSave }: InternshipCardProps) {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    // Load from localStorage on mount
    useEffect(() => {
        if (!isLoggedIn) return;
        try {
            const saved = localStorage.getItem(`praksonar_gaps_${internship.id}`);
            if (saved) {
                setCheckedItems(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Error loading checkmarks', e);
        }
    }, [internship.id, isLoggedIn]);

    // Save to localStorage when checkedItems changes
    const toggleCheck = (item: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newState = { ...checkedItems, [item]: !checkedItems[item] };
        setCheckedItems(newState);
        try {
            localStorage.setItem(`praksonar_gaps_${internship.id}`, JSON.stringify(newState));
        } catch (e) {
            console.error('Error saving checkmarks', e);
        }
    };

    return (
        <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group ${viewMode === 'compact'
            ? 'p-4 flex flex-col w-full'
            : 'p-6 flex flex-col h-full w-full'
            }`}>
            <div className="absolute top-4 right-4">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Optional: if you just want to let the main logic happen
                        handleSave(internship.id);
                    }}
                    className={`p-2 focus:outline-none transition-colors ${isSaved ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
                        }`}
                    title={isSaved ? "Sačuvana praksa" : "Sačuvaj praksu"}
                >
                    <svg className="w-6 h-6 transition-all duration-300" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </button>
            </div>

            <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900">{internship.company}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1 line-clamp-2">{internship.title}</h3>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${internship.is_international ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {internship.is_international ? 'Internacionalno' : 'Srbija'}
                    {internship.location ? ` - ${internship.location}` : ''}
                </span>

                {internship.source_name && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {internship.source_name}
                    </span>
                )}
            </div>

            <div className="flex-grow">
                {internship.required_languages && Array.isArray(internship.required_languages) && internship.required_languages.length > 0 && (
                    <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Jezici:</p>
                        <div className="flex flex-wrap gap-1">
                            {internship.required_languages.map((lang: LanguageSkill, idx: number) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                    {lang.lang} {lang.level && `(${lang.level})`}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {internship.required_skills && internship.required_skills.length > 0 && (
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Potrebne veštine:</p>
                        <div className="flex flex-wrap gap-1">
                            {internship.required_skills.map((skill, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <GapSection
                internship={internship}
                userProfile={userProfile}
                isLoggedIn={isLoggedIn}
                checkedItems={checkedItems}
                toggleCheck={toggleCheck}
            />
        </div>
    );
}

interface GapSectionProps {
    internship: Internship;
    userProfile: ProfileForGap | null;
    isLoggedIn: boolean;
    checkedItems: Record<string, boolean>;
    toggleCheck: (item: string, e: React.MouseEvent) => void;
}

// Sub-component for clarity
function GapSection({ internship, userProfile, isLoggedIn, checkedItems, toggleCheck }: GapSectionProps) {
    const [isOpen, setIsOpen] = useState(false);

    const reqSkills = internship.required_skills || [];
    const reqLangs = Array.isArray(internship.required_languages) ? internship.required_languages : [];
    const hasNoReqs = reqSkills.length === 0 && reqLangs.length === 0;

    const { missingSkills, missingLanguages } = getSkillGaps(userProfile, internship);
    const allGaps = [...missingLanguages, ...missingSkills];
    const initialGapsCount = allGaps.length;
    const checkedCount = allGaps.filter(item => checkedItems[item]).length;
    const remainingCount = initialGapsCount - checkedCount;

    // Auto-close when everything is checked
    useEffect(() => {
        if (remainingCount === 0) {
            setIsOpen(false);
        }
    }, [remainingCount]);

    if (!isLoggedIn) {
        return (
            <div className="mt-4 pt-4 border-t border-gray-100 flex-none pb-4">
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">Šta ti nedostaje</h4>
                <p className="text-sm text-gray-500 italic">Prijavi se da vidiš šta ti nedostaje</p>

                <CtaSection internship={internship} />
            </div>
        );
    }

    if (hasNoReqs) {
        return (
            <div className="mt-4 pt-4 border-t border-gray-100 flex-none pb-4">
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">Šta ti nedostaje</h4>
                <p className="text-sm text-gray-500 italic">Zahtevi nisu navedeni</p>
                <CtaSection internship={internship} />
            </div>
        );
    }

    if (initialGapsCount === 0) {
        return (
            <div className="mt-4 pt-4 border-t border-gray-100 flex-none pb-4">
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">Šta ti nedostaje</h4>
                <p className="text-sm font-medium text-green-600">✓ Spreman/a si!</p>
                <CtaSection internship={internship} />
            </div>
        );
    }

    // Interactive Checklist
    return (
        <div className="mt-4 pt-4 border-t border-gray-100 flex-none pb-4">
            <div className={`mb-4 ${remainingCount === 0 ? 'mt-2' : ''}`}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center w-full cursor-pointer list-none outline-none text-left"
                >
                    {remainingCount === 0 ? (
                        <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wider flex items-center gap-2">
                            ✓ Spremni smo, prijava!
                        </h4>
                    ) : (
                        <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                            Šta ti nedostaje <span className="text-red-500 font-normal normal-case ml-1">({remainingCount} preostalo)</span>
                        </h4>
                    )}
                    <svg className={`w-4 h-4 ml-auto transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${remainingCount === 0 ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        <div className="mt-3 flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 pb-1">
                            {allGaps.map((item, idx) => {
                                const isChecked = !!checkedItems[item];
                                return (
                                    <div
                                        key={idx}
                                        className={`flex items-center justify-between p-2 rounded-md border transition-colors ${isChecked ? 'bg-green-50 border-green-200 opacity-70' : 'bg-red-50 border-red-100'
                                            }`}
                                    >
                                        <label className="flex items-center gap-3 cursor-pointer select-none flex-grow">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => { }} // Controlled by onClick on label/wrapper
                                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                                                onClick={(e) => toggleCheck(item, e)}
                                            />
                                            <span className={`text-sm transition-all ${isChecked ? 'text-green-800 line-through decoration-green-800/50' : 'text-gray-800'}`}>
                                                {item}
                                            </span>
                                        </label>
                                        {!isChecked && (
                                            <a
                                                href={`https://www.google.com/search?q=course+${encodeURIComponent(item)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group/btn relative inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-blue-600 hover:bg-red-100 rounded transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                <span className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 hidden group-hover/btn:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none after:content-[''] after:absolute after:top-1/2 after:-right-1 after:-translate-y-1/2 after:border-4 after:border-transparent after:border-l-gray-800">
                                                    Spremi me
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <CtaSection internship={internship} isReady={remainingCount === 0 && initialGapsCount > 0} />
        </div>
    );
}

function CtaSection({ internship, isReady = false }: { internship: Internship, isReady?: boolean }) {
    return (
        <div className="mt-2 flex items-center justify-between">
            <div className="text-sm text-gray-500">
                {internship.deadline ? (
                    <span>Rok: <span className="font-medium text-gray-900">{new Date(internship.deadline).toLocaleDateString('sr-RS')}</span></span>
                ) : (
                    <span>Rok: <span className="italic">Nije navedeno</span></span>
                )}
            </div>
            <a
                href={internship.source_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isReady
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-[0_0_10px_rgba(22,163,74,0.3)] animate-pulse hover:animate-none'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    }`}
            >
                {isReady ? 'Prijavi se' : 'Pogledaj'}
            </a>
        </div>
    );
}
