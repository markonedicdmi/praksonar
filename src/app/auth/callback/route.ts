import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                if (next === '/onboarding') {
                    // Give trigger some time to potentially fire, or initialize profile if absent
                    const { data } = await supabase.from('user_profiles').select('id').eq('id', user.id).single()
                    if (!data) {
                        // If the profile wasn't created via SQL trigger on auth.users, create it now
                        await supabase.from('user_profiles').insert({ id: user.id })
                    }
                }

                // Track login session
                try {
                    const adminSupabase = createAdminClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.SUPABASE_SERVICE_ROLE_KEY!
                    );
                    const forwarded = request.headers.get('x-forwarded-for');
                    const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'Unknown';
                    let geo = { city: 'Unknown', country: 'Unknown' };
                    try {
                        if (ip !== 'Unknown' && !ip.startsWith('192.168.') && !ip.startsWith('10.') && ip !== '127.0.0.1') {
                            const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,country`, { signal: AbortSignal.timeout(3000) });
                            if (geoRes.ok) geo = await geoRes.json();
                        }
                    } catch {}
                    await adminSupabase.from('user_sessions').insert({
                        user_id: user.id,
                        email: user.email || null,
                        ip_address: ip,
                        city: geo.city || 'Unknown',
                        country: geo.country || 'Unknown',
                        user_agent: request.headers.get('user-agent') || 'Unknown',
                    });
                } catch (e) {
                    console.error('Track login error in callback:', e);
                }
            }
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
