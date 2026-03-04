'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { User } from '@supabase/supabase-js';

interface ClientShellProps {
    user: User | null;
    profile: any;
    children: React.ReactNode;
}

export default function ClientShell({ user, profile, children }: ClientShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on navigation
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    // Sidebar should be shown if user is logged in, or if on specific public app-like pages
    const showSidebar = user || pathname.startsWith('/internships') || pathname.startsWith('/settings') || pathname.startsWith('/cv-writer');

    if (!showSidebar) {
        return (
            <div className="min-h-screen bg-app flex flex-col transition-colors">
                {/* Simple Landing/Auth Top Nav */}
                <nav className="bg-transparent w-full z-50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-20 items-center justify-between">
                            <Link href="/internships" className="flex items-center">
                                <span
                                    className="h-10 w-48 bg-current"
                                    style={{
                                        WebkitMask: 'url("/logo with text updated.png") no-repeat center/contain',
                                        mask: 'url("/logo with text updated.png") no-repeat center/contain'
                                    }}
                                />
                            </Link>
                            <div className="flex gap-4">
                                <Link href="/auth/login" className="text-sm font-medium text-accent hover:opacity-80 px-4 py-2 transition-colors">
                                    Prijavi se
                                </Link>
                                <Link href="/auth/register" className="text-sm font-medium border border-accent text-accent rounded-md px-4 py-2 hover:bg-accent/10 transition-colors">
                                    Registracija
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>
                <main className="flex-1 flex flex-col">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-app">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-shrink-0 border-r border-border">
                <Sidebar user={user} profile={profile} />
            </div>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />

                {/* Sidebar Content */}
                <div
                    className={`absolute inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <Sidebar user={user} profile={profile} onClose={() => setIsSidebarOpen(false)} />
                </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden flex h-16 bg-sidebar text-text-on-dark items-center justify-center px-4 fixed top-0 w-full z-40 border-b border-border/10">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute left-4 p-2 text-text-on-dark hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Otvori meni"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <Link href="/internships" className="flex items-center h-10 w-48">
                    <span
                        className="h-full w-full bg-current"
                        style={{
                            WebkitMask: 'url("/logo with text updated.png") no-repeat center/contain',
                            mask: 'url("/logo with text updated.png") no-repeat center/contain'
                        }}
                    />
                </Link>
                <a
                    href="https://ko-fi.com/nedic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-4 p-2 text-accent hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Podrži projekat"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.463-.091-3.71.951-1.242 2.618-1.4 3.702-.127 0 0 .166.2.316.368.125-.152.288-.337.288-.337 1.054-1.295 2.76-1.129 3.737.135.94 1.251.625 2.735-.095 3.716zm9.028-1.556c-.056.284-.652.753-2.441.874.152-1.155.191-2.319.191-2.319s.032-1.464-.093-2.09c.773-.016 1.503.061 1.503.061 1.258.156 1.493 1.254 1.44 1.769l-.6 1.705z" />
                    </svg>
                </a>
            </div>

            {/* Main Content Area */}
            <main className={`flex-1 overflow-y-auto mt-16 md:mt-0 transition-all duration-300`}>
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
