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
  title: {
    default: 'Praksonar — Sve prakse za studente Srbije',
    template: '%s | Praksonar',
  },
  description: 'Praksonar automatski prikuplja prakse za studente iz Srbije svaki dan. Pronađi svoju idealnu praksu i saznaj šta ti nedostaje.',
  keywords: ['prakse srbija', 'studentske prakse', 'praksa beograd', 'praksa novi sad', 'internship srbija'],
  metadataBase: new URL('https://praksonar.com'),
  openGraph: {
    title: 'Praksonar — Sve prakse za studente Srbije',
    description: 'Praksonar automatski prikuplja prakse za studente iz Srbije svaki dan.',
    url: 'https://praksonar.com',
    siteName: 'Praksonar',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'sr_RS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Praksonar — Sve prakse za studente Srbije',
    description: 'Praksonar automatski prikuplja prakse za studente iz Srbije svaki dan.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://praksonar.com',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/praksonar logo.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userProfile = null;
  if (user) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    userProfile = data;
  }

  return (
    <html lang="sr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Praksonar",
              "alternateName": ["Praksomar", "Praksoner", "Praksonar.com"],
              "url": "https://praksonar.com",
              "logo": "https://praksonar.com/praksonar logo.png",
              "description": "Praksonar automatski prikuplja prakse za studente iz Srbije svaki dan. Pronađi svoju idealnu praksu i saznaj šta ti nedostaje.",
              "foundingLocation": {
                "@type": "Place",
                "name": "Serbia"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Praksonar",
              "url": "https://praksonar.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://praksonar.com/internships?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={`${leagueSpartan.variable} antialiased font-sans font-light`}>
        <PaletteProvider>
          <ClientShell user={user || null} profile={userProfile}>
            {children}
          </ClientShell>
        </PaletteProvider>
      </body>
    </html>
  );
}
