import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import ScraperSection from '@/components/admin/ScraperSection';
import InternshipsSection from '@/components/admin/InternshipsSection';
import UsersSection from '@/components/admin/UsersSection';

export default async function AdminPage() {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        redirect('/internships');
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-12 pb-24">
            <div>
                <h1 className="text-2xl font-bold text-app-text mb-2">Admin Dashboard</h1>
                <p className="text-text-muted">Upravljanje sistemom, podacima i korisnicima.</p>
            </div>

            <div className="space-y-16">
                <ScraperSection />
                <hr className="border-border" />
                <InternshipsSection />
                <hr className="border-border" />
                <UsersSection />
            </div>
        </div>
    );
}
