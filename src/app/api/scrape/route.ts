import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import path from 'path';

// Helper to lazily create the admin client so the module doesn't crash on boot if env vars are missing
function getSupabaseAdmin() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Supabase admin env vars are not defined (.env.local missing)');
    }
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

/**
 * POST /api/scrape — Trigger a new scraper run.
 * Returns the run ID immediately; frontend polls GET for status.
 */
export async function POST() {
    try {
        const supabaseAdmin = getSupabaseAdmin();

        // Check if a scrape is already running
        const { data: activeRun } = await supabaseAdmin
            .from('scrape_runs')
            .select('id')
            .eq('status', 'running')
            .limit(1)
            .maybeSingle();

        if (activeRun) {
            return NextResponse.json(
                { error: 'Scraper je već aktivan.', runId: activeRun.id },
                { status: 409 }
            );
        }

        // Insert a new run row
        const { data: newRun, error: insertError } = await supabaseAdmin
            .from('scrape_runs')
            .insert({ status: 'running', source_name: 'Infostud' })
            .select('id')
            .single();

        if (insertError || !newRun) {
            console.error('Failed to insert scrape_run:', insertError);
            return NextResponse.json(
                { error: 'Greška pri pokretanju scrapera.' },
                { status: 500 }
            );
        }

        const runId = newRun.id;

        // Spawn the scrapy process in the background
        // Pass the run_id so the pipeline can update the row on completion
        const scraperDir = path.resolve(process.cwd(), 'scraper');
        const scrapy = spawn(
            'scrapy',
            ['crawl', 'infostud', '-a', `run_id=${runId}`],
            {
                cwd: scraperDir,
                env: { ...process.env },
                // Detach so the API response isn't blocked
                detached: false,
                stdio: ['ignore', 'pipe', 'pipe'],
            }
        );

        let stderrOutput = '';

        scrapy.stderr?.on('data', (chunk: Buffer) => {
            stderrOutput += chunk.toString();
        });

        scrapy.on('close', async (code) => {
            if (code === 0) {
                // Pipeline handles updating new_count itself; just mark finished if not already
                const { data: currentRun } = await supabaseAdmin
                    .from('scrape_runs')
                    .select('status')
                    .eq('id', runId)
                    .single();

                // Only update if pipeline didn't already set it
                if (currentRun?.status === 'running') {
                    await supabaseAdmin
                        .from('scrape_runs')
                        .update({
                            status: 'completed',
                            finished_at: new Date().toISOString(),
                        })
                        .eq('id', runId);
                }
            } else {
                // Spider failed
                const errorMsg = stderrOutput.slice(-500) || `Process exited with code ${code}`;
                await supabaseAdmin
                    .from('scrape_runs')
                    .update({
                        status: 'failed',
                        error_message: errorMsg,
                        finished_at: new Date().toISOString(),
                    })
                    .eq('id', runId);
            }
        });

        scrapy.on('error', async (err) => {
            console.error('Failed to spawn scrapy:', err);
            await supabaseAdmin
                .from('scrape_runs')
                .update({
                    status: 'failed',
                    error_message: err.message,
                    finished_at: new Date().toISOString(),
                })
                .eq('id', runId);
        });

        return NextResponse.json({ runId }, { status: 202 });
    } catch (err) {
        console.error('Unexpected error in POST /api/scrape:', err);
        return NextResponse.json(
            { error: 'Neočekivana greška.' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/scrape?runId=<uuid> — Poll the status of a scrape run.
 */
export async function GET(request: NextRequest) {
    const runId = request.nextUrl.searchParams.get('runId');

    if (!runId) {
        return NextResponse.json({ error: 'Nedostaje runId parametar.' }, { status: 400 });
    }

    try {
        const supabaseAdmin = getSupabaseAdmin();

        const { data, error } = await supabaseAdmin
            .from('scrape_runs')
            .select('id, status, new_count, error_message, started_at, finished_at')
            .eq('id', runId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Run nije pronađen.' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error('Error in GET /api/scrape:', err);
        return NextResponse.json({ error: 'Neočekivana greška.' }, { status: 500 });
    }
}
