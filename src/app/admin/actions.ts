'use server';

import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function deleteInternship(id: string) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('internships').delete().eq('id', id);
    if (error) {
        throw new Error(error.message);
    }
    return { success: true };
}

export async function insertInternship(data: any) {
    const supabase = getSupabaseAdmin();

    const payload = { ...data };
    // Check that required fields are present
    if (!payload.title || !payload.company || !payload.source_url) {
        throw new Error('Title, company, and source_url are required.');
    }

    // Comma separated input to array
    if (typeof payload.required_skills === 'string' && payload.required_skills) {
        payload.required_skills = payload.required_skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    const { error } = await supabase.from('internships').insert(payload);
    if (error) {
        throw new Error(error.message);
    }
    return { success: true };
}

export async function toggleWriterRequestStatus(id: string, handled: boolean) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('human_writer_requests').update({ handled }).eq('id', id);
    if (error) {
        throw new Error(error.message);
    }
    return { success: true };
}

export async function triggerScraper() {
    // Server action runs server-side, so CRON_SECRET is safe here
    const origin = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    const res = await fetch(`${origin}/api/scraper/trigger`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` },
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Greška pri pokretanju skrejpera.');
    }

    const data = await res.json();
    return { success: true, message: data.message || 'Skrejper pokrenut.' };
}

