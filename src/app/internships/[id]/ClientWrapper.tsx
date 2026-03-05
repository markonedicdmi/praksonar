'use client';

import { useState } from 'react';
import { Internship, ProfileForGap } from '@/lib/skillGap';
import InternshipDetail from '@/components/InternshipDetail';
import { createClient } from '@/lib/supabase/client';
import InlineMessage from '@/components/InlineMessage';
import Link from 'next/link';

interface Props {
    internship: Internship;
    userProfile: ProfileForGap | null;
    isLoggedIn: boolean;
    initialIsSaved: boolean;
}

export default function ClientWrapper({ internship, userProfile, isLoggedIn, initialIsSaved }: Props) {
    const supabase = createClient();
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const handleSave = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setMessage({ type: 'error', text: 'Morate biti ulogovani da biste sačuvali/uklonili praksu.' });
            return;
        }

        if (isSaved) {
            const { error } = await supabase
                .from('saved_internships')
                .delete()
                .match({ internship_id: id, user_id: user.id });

            if (error) {
                setMessage({ type: 'error', text: 'Greška pri uklanjanju.' });
            } else {
                setIsSaved(false);
            }
        } else {
            const { error } = await supabase
                .from('saved_internships')
                .insert({ internship_id: id, user_id: user.id });

            if (error && error.code !== '23505') {
                setMessage({ type: 'error', text: 'Greška pri čuvanju.' });
            } else {
                setIsSaved(true);
            }
        }
    };

    return (
        <div className="w-full h-full relative">
            <div className="mb-6">
                <Link href="/internships" className="inline-flex items-center text-sm font-medium text-muted hover:text-accent transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Nazad na sve prakse
                </Link>
            </div>
            {message && (
                <div className="mb-4">
                    <InlineMessage type={message.type} message={message.text} onClose={() => setMessage(null)} />
                </div>
            )}
            <InternshipDetail
                internship={internship}
                userProfile={userProfile}
                isLoggedIn={isLoggedIn}
                isSaved={isSaved}
                handleSave={handleSave}
            />
        </div>
    );
}
