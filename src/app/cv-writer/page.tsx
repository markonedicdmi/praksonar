'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const FEATURES = [
    'Personalizovano za svaki oglas posebno',
    'Pisano na jeziku oglasa (srpski ili engleski)',
    'Harvard format, profesionalan i koncizan',
    'Visoka prilagodljivost — ti biraš ton, stil i detalje',
    'Generisano za 30 sekundi',
];

export default function CvWriterPage() {
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pre-fill email if user is logged in
    useEffect(() => {
        async function prefill() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) {
                setEmail(session.user.email);
            }
        }
        prefill();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim()) {
            setError('Unesite email adresu.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError('Unesite ispravnu email adresu.');
            return;
        }

        setLoading(true);

        const { error: dbError } = await supabase
            .from('cv_waitlist')
            .insert({ email: email.trim().toLowerCase() });

        setLoading(false);

        if (dbError) {
            if (dbError.code === '23505') {
                // Unique violation — email already registered
                setSubmitted(true);
            } else {
                setError('Greška pri slanju. Pokušajte ponovo.');
                console.error(dbError);
            }
            return;
        }

        setSubmitted(true);
    };

    return (
        <div className="h-full flex flex-col pt-6 pb-20 max-w-3xl mx-auto w-full px-4 sm:px-6">

            {/* Hero */}
            <div className="mb-10">
                <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full bg-accent/15 text-accent border border-accent/30">
                    Uskoro
                </span>
                <h1 className="text-4xl font-light text-app-text mb-3 leading-tight">
                    CV Pisac
                </h1>
                <p className="text-lg text-muted leading-relaxed max-w-xl">
                    Automatski napiši savršenu prijavu za svaku praksu
                </p>
            </div>

            {/* Description card */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-6">
                <div className="px-6 py-5 border-b border-border bg-app-secondary/50">
                    <h2 className="text-base font-medium text-app-text">Šta je CV Pisac?</h2>
                </div>
                <div className="p-6">
                    <p className="text-muted leading-relaxed mb-6">
                        Praksonar CV Pisac analizira konkretni oglas za praksu i piše personalizovanu prijavu
                        prilagođenu tačno tom oglasu — ne generički šablon, već pismo koje odgovara traženim
                        veštinama i jeziku kompanije.
                    </p>

                    <ul className="space-y-3">
                        {FEATURES.map((feature) => (
                            <li key={feature} className="flex items-start gap-3">
                                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-accent" viewBox="0 0 12 12" fill="none">
                                        <path
                                            d="M2 6l3 3 5-5"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                                <span className="text-app-text text-sm leading-relaxed">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Email signup card */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-5 border-b border-border bg-app-secondary/50">
                    <h2 className="text-base font-medium text-app-text">Obavesti me kad bude dostupno</h2>
                </div>
                <div className="p-6">
                    {submitted ? (
                        <div className="flex items-start gap-4 py-2">
                            <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
                                <svg className="w-4 h-4 text-accent" viewBox="0 0 16 16" fill="none">
                                    <path
                                        d="M3 8l4 4 6-6"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                            <div>
                                <p className="font-medium text-app-text">Hvala!</p>
                                <p className="text-sm text-muted mt-0.5">
                                    Obavestićemo te čim CV Pisac bude dostupan.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                            <input
                                id="cv-waitlist-email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError(null);
                                }}
                                placeholder="tvoj@email.com"
                                disabled={loading}
                                className="flex-1 rounded-lg border border-border shadow-sm focus:border-sidebar focus:ring-1 focus:ring-sidebar py-2.5 px-3 transition-colors bg-input text-app-text placeholder:text-muted disabled:opacity-60 outline-none"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 text-sm font-medium bg-accent text-text-on-dark rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-60 whitespace-nowrap flex-shrink-0"
                            >
                                {loading ? 'Slanje...' : 'Prijavi se'}
                            </button>
                        </form>
                    )}

                    {error && (
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}

                    {!submitted && (
                        <p className="mt-3 text-xs text-muted">
                            Nema spama. Email koristimo samo da te obavestimo o lansiranju.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
