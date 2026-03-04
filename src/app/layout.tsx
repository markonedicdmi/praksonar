import type { Metadata } from 'next';
import { League_Spartan } from 'next/font/google';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { PaletteProvider } from '@/components/PaletteProvider';
import ClientShell from '@/components/ClientShell';

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
        <PaletteProvider>
          <ClientShell user={session?.user || null} profile={userProfile}>
            {children}
          </ClientShell>
        </PaletteProvider>
      </body>
    </html>
  );
}
