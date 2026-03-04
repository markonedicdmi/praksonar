'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Icons
const BriefcaseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const DocumentIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const LoginIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const RegisterIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const KofiIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267.023 11.966.049c2.438.026 2.678-2.525 2.678-2.525 3.247.05 4.604-2.515 4.654-2.715 1.574-6.324-.025-10.155-1.525-13.33zm-4.331 6.54c-.114.398-.714.898-1.574.898h-.129c-1.343-4.453-1.604-8.086-1.604-8.086s5.286-.18 6.002 2.058c.457 1.48.049 4.306-2.695 5.13z" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

interface SidebarProps {
    user?: User | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile?: any;
    onClose?: () => void;
}

interface NavItem {
    name: string;
    href: string;
    icon: JSX.Element;
    disabled?: boolean;
    badge?: string;
    highlight?: boolean;
}

export default function Sidebar({ user, profile, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
        if (onClose) onClose();
    };

    const loggedInNavItems: NavItem[] = [
        { name: 'Prakse', href: '/internships', icon: <BriefcaseIcon /> },
        { name: 'Moj Profil', href: '/profile', icon: <UserIcon /> },
        { name: 'CV Pisac', href: '/cv-writer', icon: <DocumentIcon />, disabled: true, badge: 'uskoro' },
        { name: 'Podešavanja', href: '/settings', icon: <SettingsIcon /> },
    ];

    const guestNavItems: NavItem[] = [
        { name: 'Prakse', href: '/internships', icon: <BriefcaseIcon /> },
        { name: 'Prijavi se', href: '/auth/login', icon: <LoginIcon /> },
        { name: 'Registruj se', href: '/auth/register', icon: <RegisterIcon />, highlight: true },
        { name: 'CV Pisac', href: '/cv-writer', icon: <DocumentIcon />, disabled: true, badge: 'uskoro' },
        { name: 'Podešavanja', href: '/settings', icon: <SettingsIcon /> }
    ];

    const currentNavItems = user ? loggedInNavItems : guestNavItems;
    const userName = profile?.full_name || user?.email?.split('@')[0] || 'Gost';
    const userEmail = user?.email || 'Niste prijavljeni';

    return (
        <div className="w-64 bg-sidebar text-text-on-dark flex flex-col h-full flex-shrink-0 relative">
            {/* Mobile Close Button */}
            <button
                onClick={onClose}
                className="md:hidden absolute top-4 right-4 p-2 text-text-on-dark hover:bg-card/10 rounded-lg transition-colors"
                aria-label="Zatvori meni"
            >
                <CloseIcon />
            </button>

            {/* Logo area */}
            <div className="p-6 h-20 flex items-center">
                <Link href="/internships" onClick={onClose} className="flex items-center">
                    <span
                        className="h-10 w-48 bg-current"
                        style={{
                            WebkitMask: 'url("/logo with text updated.png") no-repeat center/contain',
                            mask: 'url("/logo with text updated.png") no-repeat center/contain'
                        }}
                    />
                </Link>
            </div>

            {/* User Profile Summary */}
            <div className="px-6 py-4 mb-4">
                {user ? (
                    <Link href="/profile" onClick={onClose} className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-full bg-accent text-text-on-dark flex items-center justify-center font-medium text-lg overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate group-hover:text-accent transition-colors">{userName}</span>
                            <span className="text-xs text-sidebar-muted truncate">{userEmail}</span>
                        </div>
                    </Link>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-sidebar-muted/20 text-sidebar-muted flex items-center justify-center font-medium text-lg overflow-hidden flex-shrink-0">
                            ?
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">Gost</span>
                            <span className="text-xs text-sidebar-muted truncate">Prijavite se za pun pristup</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                {currentNavItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    if (item.disabled) {
                        return (
                            <div
                                key={item.name}
                                className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sidebar-muted cursor-not-allowed opacity-60"
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <span>{item.name}</span>
                                </div>
                                {item.badge && (
                                    <span className="text-[10px] uppercase tracking-tighter bg-sidebar-muted/20 px-1.5 py-0.5 rounded leading-none">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        );
                    }
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? 'bg-accent text-text-on-dark font-medium shadow-md'
                                : item.highlight
                                    ? 'border border-[#c99b33] text-[#c99b33] hover:bg-[#c99b33]/10'
                                    : 'text-sidebar-muted hover:bg-card/10 hover:text-text-on-dark'
                                }`}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 space-y-4">
                {/* Ko-fi Support */}
                <a
                    href="https://ko-fi.com/nedic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-card border border-border text-accent px-6 py-3 rounded-lg font-medium hover:border-accent hover:text-accent transition-colors text-sm shadow-sm w-full justify-center"
                >
                    <svg className="w-5 h-5 text-[#FF5E5B]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.463-.091-3.71.951-1.242 2.618-1.4 3.702-.127 0 0 .166.2.316.368.125-.152.288-.337.288-.337 1.054-1.295 2.76-1.129 3.737.135.94 1.251.625 2.735-.095 3.716zm9.028-1.556c-.056.284-.652.753-2.441.874.152-1.155.191-2.319.191-2.319s.032-1.464-.093-2.09c.773-.016 1.503.061 1.503.061 1.258.156 1.493 1.254 1.44 1.769l-.6 1.705z" />
                    </svg>
                    Podrži projekat
                </a>

                {user && (
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sidebar-muted hover:bg-card/10 hover:text-text-on-dark transition-colors"
                    >
                        <LogoutIcon />
                        Odjavi se
                    </button>
                )}
            </div>
        </div>
    );
}
