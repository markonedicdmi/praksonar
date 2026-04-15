import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Free IP geolocation API — no key required
async function getGeoFromIP(ip: string) {
    try {
        // Skip localhost/private IPs  
        if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return { city: 'Localhost', country: 'Local' };
        }
        const res = await fetch(`http://ip-api.com/json/${ip}?fields=city,country`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
            const data = await res.json();
            return { city: data.city || 'Unknown', country: data.country || 'Unknown' };
        }
    } catch { }
    return { city: 'Unknown', country: 'Unknown' };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, email } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get IP from headers
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'Unknown';
        const userAgent = req.headers.get('user-agent') || 'Unknown';

        // Get geolocation
        const geo = await getGeoFromIP(ip);

        await supabase.from('user_sessions').insert({
            user_id: userId,
            email: email || null,
            ip_address: ip,
            city: geo.city,
            country: geo.country,
            user_agent: userAgent,
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Track login error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
