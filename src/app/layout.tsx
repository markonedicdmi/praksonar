import type { Metadata } from 'next';
import { League_Spartan } from 'next/font/google';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';
import Sidebar from '@/components/Sidebar';
import NavAuth from '@/components/NavAuth';

const leagueSpartan = League_Spartan({
  subsets: ['latin', 'latin-ext'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-league-spartan',
});

export const metadata: Metadata = {
  title: 'Praksonar - Sve prakse. Na jednom mestu.',
  description: 'Praksonar automatski prikuplja prakse za studente iz Srbije — svaki dan.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  let userProfile = null;
  if (session) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    userProfile = data;
  }

  return (
    <html lang="sr" suppressHydrationWarning>
      <body className={`${leagueSpartan.variable} antialiased font-sans font-light`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {session ? (
            <div className="flex h-screen overflow-hidden bg-praksonar-mint">
              {/* Left Sidebar */}
              <div className="hidden md:flex flex-shrink-0">
                <Sidebar user={session.user} profile={userProfile} />
              </div>

              {/* Mobile Header (Fallback when sidebar is hidden) */}
              <div className="md:hidden flex h-16 bg-praksonar-teal text-white items-center justify-between px-4 sm:px-6 fixed top-0 w-full z-10">
                <Link href="/" className="text-xl font-normal tracking-wide">
                  Praksonar
                </Link>
                <NavAuth user={session.user} />
              </div>

              {/* Main Content Area */}
              <main className="flex-1 overflow-y-auto mt-16 md:mt-0 p-4 md:p-8 bg-praksonar-mint">
                {children}
              </main>
            </div>
          ) : (
            /* Logged Out Layout (Full width, simple header) */
            <div className="min-h-screen bg-praksonar-mint flex flex-col">
              <nav className="bg-transparent absolute top-0 w-full z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex h-20 items-center justify-between">
                    <Link href="/" className="text-2xl font-normal text-praksonar-teal tracking-wide">
                      Praksonar
                    </Link>
                    <div className="flex gap-4">
                      <Link href="/auth/login" className="text-sm font-medium text-praksonar-teal hover:text-praksonar-gold px-4 py-2 transition-colors">
                        Prijavi se
                      </Link>
                      <Link href="/auth/register" className="text-sm font-medium bg-praksonar-gold text-white rounded-md px-4 py-2 hover:bg-praksonar-gold/90 transition-colors">
                        Registracija
                      </Link>
                    </div>
                  </div>
                </div>
              </nav>
              <main className="flex-1 flex flex-col">
                {children}
              </main>
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
