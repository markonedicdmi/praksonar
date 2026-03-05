'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function StatBadge() {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        async function fetchCount() {
            try {
                const { count, error } = await supabase
                    .from('internships')
                    .select('*', { count: 'exact', head: true });

                if (!error && count !== null) {
                    setCount(count);
                }
            } catch (err) {
                // Ignore error
            } finally {
                setLoading(false);
            }
        }

        fetchCount();
    }, []);

    if (loading) {
        return (
            <div className="inline-flex mt-8 items-center justify-center animate-pulse bg-card text-muted px-5 py-3 rounded-full border border-border text-sm font-medium min-w-[200px] min-h-[44px]">
                <div className="h-4 w-32 bg-sidebar-muted/30 rounded"></div>
            </div>
        );
    }

    if (count === null) {
        return null; // Return nothing if fetch failed silently
    }

    return (
        <div className="inline-flex mt-8 items-center justify-center bg-card text-app-text px-5 py-3 rounded-full border border-border shadow-sm transition-all hover:border-accent/40 hover:shadow-md">
            <span className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                </span>
                <span className="font-medium">{count}+ aktuelnih praksi</span>
            </span>
        </div>
    );
}
