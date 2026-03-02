'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Icons (using simple SVGs for now, can be replaced with lucide-react if desired)
const BriefcaseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const DocumentIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

interface SidebarProps {
    user: User;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: any;
}

export default function Sidebar({ user, profile }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const navItems = [
        { name: 'Prakse', href: '/internships', icon: <BriefcaseIcon /> },
        { name: 'Moj Profil', href: '/profile', icon: <UserIcon /> },
        { name: 'CV Pisac', href: '/cv-writer', icon: <DocumentIcon /> },
        { name: 'Podešavanja', href: '/settings', icon: <SettingsIcon /> },
    ];

    const userName = profile?.full_name || user.email?.split('@')[0] || 'Korisnik';
    const userEmail = user.email || '';

    return (
        <div className="w-64 bg-praksonar-teal text-white flex flex-col h-full flex-shrink-0">
            {/* Logo area */}
            <div className="p-6 h-20 flex items-center">
                <Link href="/" className="text-2xl font-normal tracking-wide flex items-center gap-2">
                    Praksonar
                </Link>
            </div>

            {/* User Profile Summary */}
            <div className="px-6 py-4 flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-praksonar-mint text-praksonar-teal flex items-center justify-center font-medium text-lg overflow-hidden flex-shrink-0">
                    {/* Placeholder Avatar */}
                    {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{userName}</span>
                    <span className="text-xs text-praksonar-mint/70 truncate">{userEmail}</span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-praksonar-gold text-white font-medium shadow-md'
                                : 'text-praksonar-mint/80 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="p-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-praksonar-mint/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <LogoutIcon />
                    Odjavi se
                </button>
            </div>
        </div>
    );
}
