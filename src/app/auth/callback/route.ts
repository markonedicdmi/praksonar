import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            if (next === '/onboarding') {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    // Give trigger some time to potentially fire, or initialize profile if absent
                    const { data } = await supabase.from('user_profiles').select('id').eq('id', user.id).single()
                    if (!data) {
                        // If the profile wasn't created via SQL trigger on auth.users, create it now
                        await supabase.from('user_profiles').insert({ id: user.id })
                    }
                }
            }
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
