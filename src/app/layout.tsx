import type { Metadata } from 'next';
import { Inter, Outfit, DM_Mono } from 'next/font/google';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import NavAuth from '@/components/NavAuth';
import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const dm_mono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-dm-mono' });

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

  return (
    <html lang="sr" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${dm_mono.variable} font-outfit antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="min-h-screen bg-sonar-bg text-sonar-white flex flex-col transition-colors duration-300">
            <nav className="border-b border-sonar-border bg-sonar-surface sticky top-0 z-50 transition-colors duration-300">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                  {/* Left: Logo */}
                  <div className="flex-shrink-0 flex items-center">
                    <Link href="/" className="text-xl sm:text-2xl font-futura font-bold text-sonar-white uppercase tracking-widest flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-sonar-signal animate-pulse"></div>
                      Praksonar
                    </Link>
                  </div>

                  {/* Center: Main Links */}
                  <div className="hidden md:flex md:space-x-8 absolute left-1/2 transform -translate-x-1/2">
                    <Link href="/internships" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-sonar-muted hover:border-sonar-border hover:text-sonar-signal transition-colors">
                      Prakse
                    </Link>
                    <Link href="/cv-writer" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-sonar-muted hover:border-sonar-border hover:text-sonar-signal transition-colors">
                      CV Pisac
                    </Link>
                  </div>

                  {/* Right: Auth */}
                  <div className="flex items-center gap-4">
                    <ThemeSwitcher />
                    <NavAuth user={session?.user} />
                  </div>
                </div>
              </div>

              {/* Mobile Nav Links (Simple view) */}
              <div className="md:hidden border-t border-sonar-border flex justify-center space-x-6 py-3 bg-sonar-surface">
                <Link href="/internships" className="text-sm font-medium text-sonar-muted hover:text-sonar-signal transition-colors">
                  Prakse
                </Link>
                <Link href="/cv-writer" className="text-sm font-medium text-sonar-muted hover:text-sonar-signal transition-colors">
                  CV Pisac
                </Link>
              </div>
            </nav>

            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
