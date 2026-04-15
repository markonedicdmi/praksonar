import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that should be available on the WWW (landing/frontend) domain
const WWW_ROUTES = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/confirm-email',
    '/auth/callback',
    '/o-meni',
    '/o-autoru',
    '/politika-privatnosti',
    '/cv-writer',
];

// Static/API routes passthrough — always allowed on any domain
const PASSTHROUGH_PREFIXES = [
    '/_next',
    '/api',
    '/favicon',
    '/logo',
    '/og-image',
    '/profile-placeholder',
    '/manifest',
    '/robots',
    '/sitemap',
];

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const { pathname } = request.nextUrl;

    // Always allow static assets and API routes
    if (PASSTHROUGH_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
        return NextResponse.next();
    }

    // Allow file extensions (images, css, js, etc.)
    if (pathname.includes('.')) {
        return NextResponse.next();
    }

    // Determine which domain we're on
    const isWWW = hostname.startsWith('www.') || hostname === 'praksonar.com';
    const isApp = hostname.startsWith('app.');

    // Local development — no domain routing, allow everything
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        return NextResponse.next();
    }

    if (isWWW) {
        // On www/root domain: only allow landing-related routes
        const isAllowed = WWW_ROUTES.some(route => {
            if (route === '/') return pathname === '/';
            return pathname.startsWith(route);
        });

        if (!isAllowed) {
            // Redirect app routes to app.praksonar.com
            const url = request.nextUrl.clone();
            url.hostname = 'app.praksonar.com';
            url.port = '';
            return NextResponse.redirect(url);
        }
    }

    if (isApp) {
        // On app domain: redirect root to /internships (the main app view)
        if (pathname === '/') {
            const url = request.nextUrl.clone();
            url.pathname = '/internships';
            return NextResponse.redirect(url);
        }

        // On app domain: don't serve the landing page (redirect to www)
        // But allow everything else (internships, profile, settings, admin, etc.)
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
