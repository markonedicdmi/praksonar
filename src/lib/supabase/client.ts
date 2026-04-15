import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // Set cookie domain to .praksonar.com so auth works across www and app subdomains
                getAll() {
                    const pairs = document.cookie.split(';').map(c => {
                        const [name, ...rest] = c.trim().split('=');
                        return { name, value: rest.join('=') };
                    });
                    return pairs;
                },
                setAll(cookiesToSet) {
                    const isProduction = window.location.hostname.includes('praksonar.com');
                    cookiesToSet.forEach(({ name, value, options }) => {
                        let cookie = `${name}=${value}; path=${options?.path || '/'}`;
                        if (isProduction) {
                            cookie += '; domain=.praksonar.com';
                        }
                        if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
                        if (options?.sameSite) cookie += `; samesite=${options.sameSite}`;
                        if (options?.secure || isProduction) cookie += '; secure';
                        document.cookie = cookie;
                    });
                },
            },
        }
    )
}
