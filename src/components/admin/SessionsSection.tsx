'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Session {
    id: string;
    email: string;
    ip_address: string;
    city: string;
    country: string;
    user_agent: string;
    logged_in_at: string;
}

export default function SessionsSection() {
    const supabase = createClient();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCount, setActiveCount] = useState(0);

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            try {
                // Fetch last 50 sessions
                const { data } = await supabase
                    .from('user_sessions')
                    .select('*')
                    .order('logged_in_at', { ascending: false })
                    .limit(50);

                if (data) setSessions(data);

                // Active users count (24h)
                const { count } = await supabase
                    .from('user_sessions')
                    .select('user_id', { count: 'exact', head: true })
                    .gte('logged_in_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

                setActiveCount(count || 0);
            } catch (e) {
                console.error('Error fetching sessions:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const parseUA = (ua: string) => {
        if (ua.includes('Mobile')) return '📱';
        if (ua.includes('Windows')) return '🖥️';
        if (ua.includes('Mac')) return '💻';
        if (ua.includes('Linux')) return '🐧';
        return '🌐';
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'upravo';
        if (mins < 60) return `pre ${mins}m`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `pre ${hours}h`;
        const days = Math.floor(hours / 24);
        return `pre ${days}d`;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-app-text flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Login Sesije
            </h2>

            {/* Active Users Badge */}
            <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-accent/40 transition-colors">
                <div className="relative">
                    <div className="w-3 h-3 bg-[#22c55e] rounded-full animate-pulse" />
                </div>
                <div>
                    <p className="text-sm text-text-muted">Aktivni korisnici (24h)</p>
                    <div className="text-2xl font-bold text-app-text">{activeCount}</div>
                </div>
            </div>

            {/* Sessions Table */}
            <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-border text-text-muted">
                            <th className="px-5 py-3 font-medium"></th>
                            <th className="px-5 py-3 font-medium">Email</th>
                            <th className="px-5 py-3 font-medium">IP</th>
                            <th className="px-5 py-3 font-medium">Lokacija</th>
                            <th className="px-5 py-3 font-medium">Vreme</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-8 text-text-muted">Učitavanje...</td></tr>
                        ) : sessions.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-text-muted">Nema sesija.</td></tr>
                        ) : (
                            sessions.map(s => (
                                <tr key={s.id} className="hover:bg-sidebar/30 transition-colors">
                                    <td className="px-5 py-3 text-lg" title={s.user_agent}>{parseUA(s.user_agent)}</td>
                                    <td className="px-5 py-3 font-mono text-xs text-app-text">{s.email || '-'}</td>
                                    <td className="px-5 py-3 font-mono text-xs text-text-muted">{s.ip_address}</td>
                                    <td className="px-5 py-3 text-text-muted">
                                        {s.city && s.country ? `${s.city}, ${s.country}` : s.country || '-'}
                                    </td>
                                    <td className="px-5 py-3 text-text-muted" title={new Date(s.logged_in_at).toLocaleString('sr-RS')}>
                                        {timeAgo(s.logged_in_at)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
