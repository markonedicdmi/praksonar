import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.ZYTE_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'ZYTE_API_KEY environment variable is not set.' }, { status: 500 });
    }

    const projectId = process.env.ZYTE_PROJECT_ID;
    if (!projectId) {
        return NextResponse.json({ error: 'ZYTE_PROJECT_ID environment variable is not set.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const listResponse = await fetch(`https://app.zyte.com/api/spiders/list.json?project=${projectId}`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`
            }
        });

        if (!listResponse.ok) {
            throw new Error(`Failed to list spiders: ${listResponse.statusText}`);
        }

        const { spiders } = await listResponse.json();

        const triggerPromises = (spiders || []).map((spider: { name: string } | string) => {
            const spiderName = typeof spider === 'string' ? spider : spider.name;
            return fetch('https://app.zyte.com/api/run.json', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    project: projectId,
                    spider: spiderName
                })
            });
        });

        await Promise.all(triggerPromises);

        const { error: insertError } = await supabaseAdmin.from('scraper_logs').insert({
            status: 'running',
            started_at: new Date().toISOString(),
            lines: [`Triggered ${triggerPromises.length} spiders successfully.`]
        });

        if (insertError) {
            console.error('Error inserting log:', insertError);
            return NextResponse.json({ error: 'Započeto, ali greška pri upisu u scraper_logs.' }, { status: 500 });
        }

        return NextResponse.json({ status: 'success', message: `Triggered ${triggerPromises.length} spiders.` });

    } catch (error: any) {
        console.error('Scraper trigger error:', error);

        // Attempt to log error
        await supabaseAdmin.from('scraper_logs').insert({
            status: 'error',
            started_at: new Date().toISOString(),
            finished_at: new Date().toISOString(),
            lines: [error.message || 'Nepoznata greška']
        });

        return NextResponse.json({ error: error.message || 'Došlo je do greške.' }, { status: 500 });
    }
}
