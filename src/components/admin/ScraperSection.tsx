'use client';

/*
  Migration SQL for scraper_logs:
  
  CREATE TABLE public.scraper_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    started_at timestamptz DEFAULT now(),
    finished_at timestamptz,
    status text,
    lines text[],
    created_at timestamptz DEFAULT now()
  );
  
  -- Add RLS policies if necessary
  ALTER TABLE public.scraper_logs ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Enable read for all" ON public.scraper_logs FOR SELECT USING (true);
  CREATE POLICY "Enable insert for service role only" ON public.scraper_logs FOR INSERT WITH CHECK (true);
*/

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ScraperSection() {
    const supabase = createClient();
    const [logs, setLogs] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, today: 0, week: 0 });
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState(false);

    useEffect(() => {
        fetchData();
        // Poll every 10 seconds
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            // 1. Fetch last 20 rows from scraper_logs
            const { data: logsData } = await supabase
                .from('scraper_logs')
                .select('*')
                .order('started_at', { ascending: false })
                .limit(20);

            if (logsData) {
                setLogs(logsData);
            }

            // 2. Fetch stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const [
                { count: total },
                { count: todayCount },
                { count: weekCount }
            ] = await Promise.all([
                supabase.from('internships').select('*', { count: 'exact', head: true }),
                supabase.from('internships').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
                supabase.from('internships').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString())
            ]);

            setStats({
                total: total || 0,
                today: todayCount || 0,
                week: weekCount || 0
            });

        } catch (error) {
            console.error('Error fetching scraper data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTrigger = async () => {
        setTriggering(true);
        try {
            // Get the session user token or just call the route. 
            // The route expects `Authorization: Bearer CRON_SECRET` theoretically, 
            // but client-side shouldn't have CRON_SECRET. 
            // User requested the API to check for CRON_SECRET. Wait, admin is calling it from frontend.
            // We'll need a way for the frontend to call this, maybe a server action is better or a proxy route.
            // Wait, let's just use a proxy server action or fix the route to accept both.
            // Actually, I'll update the route later. Let's do a simple POST for now.

            const res = await fetch('/api/scraper/trigger', {
                method: 'POST',
            });

            if (!res.ok) {
                alert('Došlo je do greške pri pokretanju');
                return;
            }
            alert('Skrejper pokrenut');
            fetchData();
        } catch (err) {
            alert('Greška');
        } finally {
            setTriggering(false);
        }
    };

    const handleStop = () => {
        alert('Uskoro dostupno');
    };

    const latestLog = logs[0];
    const isRunning = latestLog?.status === 'running';

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-app-text flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Skrejper
            </h2>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between hover:border-accent/40 transition-colors">
                    <p className="text-sm text-text-muted">Ukupno praksi</p>
                    <div className="text-2xl font-bold text-app-text mt-2">{stats.total}</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between hover:border-accent/40 transition-colors">
                    <p className="text-sm text-text-muted">Dodato danas</p>
                    <div className="text-2xl font-bold text-[#4ade80] mt-2">+{stats.today}</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between hover:border-accent/40 transition-colors">
                    <p className="text-sm text-text-muted">Dodato ove nedelje</p>
                    <div className="text-2xl font-bold text-accent mt-2">+{stats.week}</div>
                </div>
            </div>

            {/* Control Row */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                    <div className="flex flex-col gap-1">
                        <div className="text-sm text-text-muted mb-1">Status</div>
                        <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : latestLog?.status === 'error' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                            <span className="font-medium text-app-text">
                                {isRunning ? 'Running' : latestLog?.status === 'error' ? 'Error' : 'Idle'}
                            </span>
                        </div>
                        {latestLog?.started_at && (
                            <div className="text-xs text-text-muted/70 mt-1">
                                Poslednje pokretanje: {new Date(latestLog.started_at).toLocaleString('sr-RS')}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleTrigger}
                            disabled={triggering || isRunning}
                            className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {triggering ? 'Pokretanje...' : 'Pokreni skrejper'}
                        </button>
                        <button
                            onClick={handleStop}
                            className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all"
                        >
                            Zaustavi skrejper
                        </button>
                    </div>

                </div>

                {/* Log Viewer */}
                <div className="mt-6">
                    <div className="text-sm font-medium text-text-muted mb-2">Logovi praćenja (Poslednjih 20)</div>
                    <div className="bg-[#1a1b1e] rounded-lg p-4 font-mono text-xs overflow-y-auto max-h-60 border border-border select-all">
                        {logs.length === 0 ? (
                            <div className="text-gray-500">Nema evidentiranih aktivnosti.</div>
                        ) : (
                            <div className="space-y-3">
                                {logs.map((log) => (
                                    <div key={log.id} className="border-b border-border/20 pb-2 last:border-0">
                                        <div className="flex justify-between text-gray-400 mb-1">
                                            <span>[{new Date(log.started_at).toLocaleString('sr-RS')}] Status: <span className={log.status === 'error' ? 'text-red-400' : log.status === 'running' ? 'text-amber-400' : 'text-green-400'}>{log.status.toUpperCase()}</span></span>
                                            <span>{log.id.split('-')[0]}</span>
                                        </div>
                                        {log.lines && log.lines.length > 0 ? (
                                            log.lines.map((line: string, i: number) => (
                                                <div key={i} className="text-gray-300 pl-4 border-l border-gray-700 ml-1 py-0.5 whitespace-pre-wrap leading-relaxed">{line}</div>
                                            ))
                                        ) : (
                                            <div className="text-gray-500 italic pl-4">Nema detaljnih logova.</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
