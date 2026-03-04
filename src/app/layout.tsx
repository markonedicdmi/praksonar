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
  metadataBase: new URL('https://praksonar.com'),
  title: {
    template: '%s | Praksonar',
    default: 'Praksonar — Sve prakse za studente Srbije',
  },
  description: 'Praksonar automatski prikuplja prakse za studente iz Srbije svaki dan. Pronađi svoju idealnu praksu i saznaj šta ti nedostaje.',
  keywords: 'prakse srbija, studentske prakse, praksa beograd, praksa novi sad, internship srbija',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Praksonar — Sve prakse za studente Srbije',
    description: 'Praksonar automatski prikuplja prakse za studente iz Srbije svaki dan. Pronađi svoju idealnu praksu i saznaj šta ti nedostaje.',
    url: 'https://praksonar.com',
    siteName: 'Praksonar',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Praksonar — Sve prakse za studente Srbije',
      },
    ],
    locale: 'sr_RS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Praksonar — Sve prakse za studente Srbije',
    description: 'Praksonar automatski prikuplja prakse za studente iz Srbije svaki dan. Pronađi svoju idealnu praksu i saznaj šta ti nedostaje.',
    images: ['/og-image.png'],
  },
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
