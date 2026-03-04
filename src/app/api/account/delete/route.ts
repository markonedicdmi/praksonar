import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function DELETE() {
    try {
        const supabaseServer = await createServerClient();
        const { data: { user } } = await supabaseServer.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (error) {
            console.error('Error deleting user:', error);
            return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Delete user exception:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
