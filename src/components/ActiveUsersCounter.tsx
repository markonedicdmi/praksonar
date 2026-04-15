'use client';

import { useState, useEffect } from 'react';

export default function ActiveUsersCounter() {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await fetch('/api/active-users');
                const data = await res.json();
                setCount(data.count || 0);
            } catch {
                setCount(0);
            }
        };
        fetchCount();
        // Refresh every 2 minutes
        const interval = setInterval(fetchCount, 120_000);
        return () => clearInterval(interval);
    }, []);

    if (count === null) return null;

    return (
        <div className="flex items-center gap-2 text-xs text-muted">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
            </span>
            <span>{count} {count === 1 ? 'aktivan korisnik' : 'aktivnih korisnika'}</span>
        </div>
    );
}
