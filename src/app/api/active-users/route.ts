import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Count distinct users active in the last 24 hours
        const { count } = await supabase
            .from('user_sessions')
            .select('user_id', { count: 'exact', head: true })
            .gte('logged_in_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        return NextResponse.json({ count: count || 0 });
    } catch (error) {
        console.error('Active users error:', error);
        return NextResponse.json({ count: 0 });
    }
}
