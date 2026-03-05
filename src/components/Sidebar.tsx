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
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const InfoIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
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
        { name: 'CV Pisac', href: '/cv-writer', icon: <DocumentIcon />, badge: 'uskoro' },
        { name: 'O autoru', href: '/o-autoru', icon: <InfoIcon /> },
        { name: 'Podešavanja', href: '/settings', icon: <SettingsIcon /> },
    ];

    const guestNavItems: NavItem[] = [
        { name: 'Prakse', href: '/internships', icon: <BriefcaseIcon /> },
        { name: 'Prijavi se', href: '/auth/login', icon: <LoginIcon /> },
        { name: 'Registruj se', href: '/auth/register', icon: <RegisterIcon />, highlight: true },
        { name: 'CV Pisac', href: '/cv-writer', icon: <DocumentIcon />, badge: 'uskoro' },
        { name: 'O autoru', href: '/o-autoru', icon: <InfoIcon /> },
        { name: 'Podešavanja', href: '/settings', icon: <SettingsIcon /> }
    ];

    const currentNavItems = user ? loggedInNavItems : guestNavItems;
    const userName = profile?.full_name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Gost');
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
                    <Link href="/auth/register" onClick={onClose} className="flex items-center gap-4 group cursor-pointer hover:bg-card/5 p-2 -m-2 rounded-lg transition-colors">
                        <div className="w-12 h-12 rounded-full bg-sidebar-muted/20 text-sidebar-muted flex items-center justify-center font-medium text-lg overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                            ?
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate group-hover:text-accent transition-colors">Gost</span>
                            <span className="text-xs text-sidebar-muted truncate">Prijavite se za pun pristup</span>
                        </div>
                    </Link>
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
                            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? 'bg-accent text-text-on-dark font-medium shadow-md'
                                : item.highlight
                                    ? 'border border-[#c99b33] text-[#c99b33] hover:bg-[#c99b33]/10'
                                    : 'text-sidebar-muted hover:bg-card/10 hover:text-text-on-dark'
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                {item.icon}
                                {item.name}
                            </span>
                            {item.badge && (
                                <span className="text-[10px] uppercase tracking-tighter bg-sidebar-muted/20 px-1.5 py-0.5 rounded leading-none">
                                    {item.badge}
                                </span>
                            )}
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
                    <svg className="w-5 h-5 text-[#FF5E5B]" viewBox="0 0 50 50" fill="currentColor">
                        <path d="M 25 2 C 12.309288 2 2 12.309297 2 25 C 2 37.690703 12.309288 48 25 48 C 37.690712 48 48 37.690703 48 25 C 48 12.309297 37.690712 2 25 2 z M 25 4 C 36.609833 4 46 13.390175 46 25 C 46 36.609825 36.609833 46 25 46 C 13.390167 46 4 36.609825 4 25 C 4 13.390175 13.390167 4 25 4 z M 14.636719 14.394531 C 12.640426 14.394531 11 16.033004 11 18.029297 L 11 32.091797 C 11 34.573412 13.03401 36.605469 15.515625 36.605469 L 30.453125 36.605469 C 32.93474 36.605469 34.96875 34.573412 34.96875 32.091797 L 34.96875 31.072266 C 39.171089 30.320232 42.359577 26.577015 41.966797 22.103516 C 41.57761 17.671107 37.691909 14.394531 33.287109 14.394531 L 14.636719 14.394531 z M 14.636719 16.394531 L 33.287109 16.394531 C 36.70231 16.394531 39.679796 18.921705 39.974609 22.279297 C 40.301446 26.001745 37.498921 29.11721 33.910156 29.326172 L 32.96875 29.380859 L 32.96875 32.091797 C 32.96875 33.492182 31.85351 34.605469 30.453125 34.605469 L 15.515625 34.605469 C 14.11524 34.605466 13 33.492182 13 32.091797 L 13 18.029297 C 13 17.11359 13.721012 16.394531 14.636719 16.394531 z M 32.970703 17.818359 L 32.970703 27.935547 L 34.080078 27.8125 C 36.564518 27.536032 38.484375 25.398372 38.484375 22.863281 C 38.484375 20.312286 36.586714 18.133428 34.056641 17.912109 L 32.970703 17.818359 z M 19.908203 19.886719 C 17.66975 19.886719 15.832031 21.724438 15.832031 23.962891 C 15.832031 25.158867 16.358618 26.251124 17.203125 26.990234 L 17.148438 26.939453 L 22.544922 32.416016 L 27.941406 26.939453 L 27.886719 26.990234 C 28.73206 26.251729 29.259136 25.158315 29.257812 23.960938 C 29.256712 21.723385 27.41943 19.886719 25.181641 19.886719 C 24.16042 19.886719 23.259857 20.325278 22.544922 20.962891 C 21.829987 20.325278 20.929424 19.886719 19.908203 19.886719 z M 34.970703 20.451172 C 35.824808 20.958201 36.484375 21.744314 36.484375 22.863281 C 36.484375 23.933381 35.818128 24.720832 34.970703 25.246094 L 34.970703 20.451172 z M 22.892578 21.207031 L 22.9375 21.255859 C 22.9326 21.250259 22.924862 21.247757 22.919922 21.242188 C 22.909042 21.230967 22.903708 21.218161 22.892578 21.207031 z M 22.195312 21.208984 C 22.184532 21.219844 22.180472 21.233191 22.169922 21.244141 C 22.165222 21.249441 22.156994 21.250539 22.152344 21.255859 L 22.195312 21.208984 z M 19.908203 21.886719 C 20.522227 21.886719 21.062751 22.150773 21.431641 22.572266 L 21.455078 22.597656 L 21.478516 22.621094 C 21.545966 22.688544 21.622109 22.789954 21.677734 22.886719 L 22.541016 24.388672 L 23.410156 22.890625 C 23.468176 22.790735 23.547059 22.687803 23.615234 22.619141 L 23.636719 22.595703 L 23.658203 22.572266 C 24.027093 22.150773 24.567617 21.886719 25.181641 21.886719 C 26.335188 21.886719 27.257812 22.809343 27.257812 23.962891 C 27.258489 24.575513 26.990972 25.11688 26.570312 25.484375 L 26.542969 25.509766 L 26.517578 25.537109 L 22.544922 29.568359 L 18.546875 25.509766 L 18.519531 25.486328 C 18.098038 25.117438 17.832031 24.576915 17.832031 23.962891 C 17.832031 22.809343 18.754656 21.886719 19.908203 21.886719 z" />
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
