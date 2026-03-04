'use client';

import { Internship } from '@/lib/skillGap';

interface InternshipCardProps {
    internship: Internship;
    isSaved: boolean;
    isSelected: boolean;
    onClick: () => void;
    handleSave: (id: string, e: React.MouseEvent) => void;
}

export default function InternshipCard({ internship, isSaved, isSelected, onClick, handleSave }: InternshipCardProps) {
    const reqSkills = internship.required_skills ? internship.required_skills.slice(0, 4) : [];
    const hasMoreSkills = internship.required_skills && internship.required_skills.length > 4;

    return (
        <div
            onClick={onClick}
            className={`bg-card rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer relative group overflow-hidden shrink-0 ${isSelected ? 'border-2 border-accent' : 'border border-border hover:border-sidebar'
                }`}
        >
            {/* Selected Indicator Bar */}
            {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent"></div>
            )}

            <div className="p-5 flex flex-col sm:flex-row gap-4">
                {/* Main Info */}
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted mb-1">{internship.company}</p>
                    <h3 className="text-lg font-medium text-app-text leading-tight mb-3 line-clamp-2 pr-8">{internship.title}</h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-app-secondary text-muted">
                            <svg className="w-3 h-3 mr-1 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {internship.location || 'Srbija / Remote'}
                        </span>
                        {internship.source_name && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sidebar text-text-on-dark px-2 py-0.5">
                                {internship.source_name}
                            </span>
                        )}
                        {internship.is_international && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                Internacionalno
                            </span>
                        )}
                    </div>

                    {/* Skill Tags Preview */}
                    <div className="flex flex-wrap gap-1.5">
                        {reqSkills.map((skill, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-app-secondary text-muted border border-border">
                                {skill}
                            </span>
                        ))}
                        {hasMoreSkills && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-app-secondary text-muted border border-border">
                                +{internship.required_skills!.length - 4}
                            </span>
                        )}
                    </div>
                </div>

                {/* Right Action Column */}
                <div className="flex sm:flex-col justify-between items-end sm:items-end mt-2 sm:mt-0 sm:min-w-[120px]">
                    <button
                        onClick={(e) => handleSave(internship.id, e)}
                        className={`p-2 focus:outline-none transition-colors absolute top-3 right-3 sm:static ${isSaved ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
                            }`}
                        title={isSaved ? "Sačuvana praksa" : "Sačuvaj praksu"}
                    >
                        <svg className="w-6 h-6 transition-transform hover:scale-110" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>

                    <div className="text-right w-full sm:w-auto">
                        {/* Publication date — shown only when created_at is available */}
                        {internship.created_at && (
                            <div className="text-xs text-muted/70 mb-1">
                                Objavljeno: {new Date(internship.created_at).toLocaleDateString('sr-RS')}
                            </div>
                        )}
                        <div className="text-xs text-muted mb-2">
                            Rok: {internship.deadline ? new Date(internship.deadline).toLocaleDateString('sr-RS') : 'Što pre'}
                        </div>
                        <button className={`px-4 py-2 w-full sm:w-auto rounded-md text-sm font-medium transition-colors ${isSelected ? 'bg-accent text-text-on-dark shadow-sm' : 'bg-sidebar text-text-on-dark hover:opacity-90'
                            }`}>
                            Pogledaj
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
