'use client';

/*
  Migration SQL for human_writer_requests (if handled column doesn't exist):
  
  ALTER TABLE public.human_writer_requests 
  ADD COLUMN IF NOT EXISTS handled boolean DEFAULT false;
*/

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toggleWriterRequestStatus } from '@/app/admin/actions';

export default function UsersSection() {
    const supabase = createClient();
    const [stats, setStats] = useState({ totalUsers: 0, newUsersWeek: 0, cvWaitlist: 0 });
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const [
                { count: totalUsers },
                { count: newUsersWeek },
                { count: cvWaitlist },
                { data: requestsData }
            ] = await Promise.all([
                supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
                supabase.from('user_profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
                supabase.from('cv_waitlist').select('*', { count: 'exact', head: true }),
                supabase.from('human_writer_requests').select('*').order('created_at', { ascending: false })
            ]);

            setStats({
                totalUsers: totalUsers || 0,
                newUsersWeek: newUsersWeek || 0,
                cvWaitlist: cvWaitlist || 0
            });

            if (requestsData) {
                setRequests(requestsData);
            }
        } catch (e) {
            console.error('Error fetching users data:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await toggleWriterRequestStatus(id, !currentStatus);
            alert('Status uspešno izmenjen');

            // Update local state instead of refetching all
            setRequests(requests.map(req =>
                req.id === id ? { ...req, handled: !currentStatus } : req
            ));
        } catch (e: any) {
            alert('Greška pri izmeni statusa: ' + e.message);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-app-text flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Korisnici
            </h2>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between hover:border-accent/40 transition-colors">
                    <p className="text-sm text-text-muted">Ukupno registrovanih korisnika</p>
                    <div className="text-2xl font-bold text-app-text mt-2">{stats.totalUsers}</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between hover:border-accent/40 transition-colors">
                    <p className="text-sm text-text-muted">Novi korisnici ove nedelje</p>
                    <div className="text-2xl font-bold text-[#4ade80] mt-2">+{stats.newUsersWeek}</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between hover:border-accent/40 transition-colors">
                    <p className="text-sm text-text-muted">Prijave za CV Pisac</p>
                    <div className="text-2xl font-bold text-accent mt-2">{stats.cvWaitlist}</div>
                </div>
            </div>

            {/* Requests Table */}
            <div className="mt-8">
                <h3 className="text-lg font-medium text-app-text mb-4 drop-shadow-sm">Zahtevi za ručno pisanje CV-a</h3>
                <div className="bg-card border border-border rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-border text-text-muted">
                                <th className="px-6 py-4 font-medium">Ime</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Link do prakse</th>
                                <th className="px-6 py-4 font-medium">Napomene</th>
                                <th className="px-6 py-4 font-medium">Datum</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Akcija</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20 max-md:divide-border">
                            {loading && requests.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-text-muted">Učitavanje...</td></tr>
                            ) : requests.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-text-muted">Nema zahteva.</td></tr>
                            ) : (
                                requests.map(req => (
                                    <tr key={req.id} className="hover:bg-sidebar/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-app-text">{req.name || '-'}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-text-muted">{req.email || '-'}</td>
                                        <td className="px-6 py-4 text-accent max-w-[200px] truncate">
                                            {req.internship_url ? (
                                                <a href={req.internship_url} target="_blank" rel="noreferrer" className="hover:underline" title={req.internship_url}>
                                                    Otvori link
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-text-muted max-w-[200px] truncate" title={req.notes}>{req.notes || '-'}</td>
                                        <td className="px-6 py-4 text-text-muted">
                                            {new Date(req.created_at).toLocaleDateString('sr-RS')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded text-xs font-medium border ${req.handled ? 'bg-[#059669]/20 text-[#10b981] border-[#10b981]/30' : 'bg-amber-400/10 text-amber-500 border-amber-500/30'}`}>
                                                {req.handled ? 'Obrađeno' : 'Na čekanju'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleToggleStatus(req.id, req.handled)}
                                                className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${req.handled ? 'bg-sidebar hover:bg-sidebar-muted/50 text-text-muted' : 'bg-accent/20 hover:bg-accent/30 text-accent'}`}
                                            >
                                                {req.handled ? 'Vrati na čekanje' : 'Označi kao obrađeno'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
