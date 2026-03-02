'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';

export default function NavAuth({ user }: { user: User | null }) {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    if (user) {
        return (
            <div className="flex items-center space-x-4">
                <Link href="/profile" className="h-8 w-8 rounded-full bg-sonar-border flex items-center justify-center text-sonar-signal font-medium hover:bg-sonar-signal hover:text-sonar-bg transition-colors">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                </Link>
                <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-sonar-muted hover:text-sonar-white transition-colors"
                >
                    Odjavi se
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="text-sm font-medium text-sonar-muted hover:text-sonar-white transition-colors">
                Prijavi se
            </Link>
            <Link
                href="/auth/register"
                className="rounded-md border border-sonar-border px-4 py-2 text-sm font-medium text-sonar-white hover:border-sonar-signal hover:text-sonar-signal transition-colors"
            >
                Napravi nalog
            </Link>
        </div>
    );
}
