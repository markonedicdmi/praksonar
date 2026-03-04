'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/internships');
            }
        };
        checkSession();
    }, [router, supabase]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback?next=/onboarding`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/auth/confirm-email');
            router.refresh();
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-app-secondary px-4">
                <div className="w-full max-w-md flex flex-col items-center justify-center text-center space-y-6">
                    <div id="loading-animation" className="animate-pulse">
                        <span
                            className="h-24 w-24 bg-accent inline-block"
                            style={{
                                WebkitMask: 'url("/Praksonar logo fat.png") no-repeat center/contain',
                                mask: 'url("/Praksonar logo fat.png") no-repeat center/contain'
                            }}
                        />
                    </div>
                    <h2 className="text-xl font-medium text-app-text animate-pulse">Kreiranje naloga...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-app-secondary px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg shadow border border-border">
                <div>
                    <div className="flex justify-center mb-6">
                        <span
                            className="h-20 w-20 bg-accent inline-block"
                            style={{
                                WebkitMask: 'url("/Praksonar logo fat.png") no-repeat center/contain',
                                mask: 'url("/Praksonar logo fat.png") no-repeat center/contain'
                            }}
                        />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-app-text">
                        Kreiraj novi nalog
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted">
                        Već imaš nalog?{' '}
                        <Link href="/auth/login" className="font-medium text-accent hover:opacity-90">
                            Prijavi se
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    {error && (
                        <div className="bg-error-bg text-error-text p-3 rounded text-sm text-center">
                            {error}
                        </div>
                    )}
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email adresa
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded-t-md border-0 py-2.5 text-app-text ring-1 ring-inset ring-border placeholder:text-muted focus:z-10 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 px-3 bg-input"
                                placeholder="Email adresa"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Lozinka
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="relative block w-full rounded-b-md border-0 py-2.5 text-app-text ring-1 ring-inset ring-border placeholder:text-muted focus:z-10 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6 px-3 bg-input"
                                placeholder="Lozinka (min 6 karaktera)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-accent px-3 py-2.5 text-sm font-medium text-text-on-dark hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
                        >
                            {loading ? 'Kreiranje...' : 'Registruj se'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
