import { MetadataRoute } from 'next';
// Wait, createClient from client relies on hooks. I should use server client or standard fetch.
// Even better, createClient from server, but sitemap doesn't take cookies easily if statically generated.
// Actually, generic supabase JS client is safer:
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://praksonar.com';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

    // Fetch all internship IDs
    const { data: internships } = await supabase
        .from('internships')
        .select('id, created_at')
        .order('created_at', { ascending: false });

    const dynamicInternships = (internships || []).map((internship) => ({
        url: `${baseUrl}/internships/${internship.id}`,
        lastModified: internship.created_at ? new Date(internship.created_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/internships`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/auth/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/auth/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        },
        {
            url: `${baseUrl}/cv-writer`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/settings`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/o-meni`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.4,
        },
        {
            url: `${baseUrl}/politika-privatnosti`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.2,
        },
    ];

    return [...staticPages, ...dynamicInternships];
}
