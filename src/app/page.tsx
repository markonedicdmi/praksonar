import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect('/internships');
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-x-hidden min-h-screen">


      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center mt-10 md:mt-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal text-app-text tracking-wide mb-6 leading-tight">
          Sve prakse.<br /> Na jednom mestu.
        </h1>
        <p className="text-muted text-lg sm:text-xl max-w-2xl mb-12 font-light">
          Praksonar automatski prikuplja prakse za studente iz Srbije — svaki dan.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/internships"
            className="bg-accent text-text-on-dark px-8 py-3.5 rounded-lg font-medium text-lg hover:bg-yellow-600 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Pronađi praksu
          </Link>
          <Link
            href="/auth/register"
            className="bg-card border text-accent border-border px-8 py-3.5 rounded-lg font-medium text-lg hover:border-sidebar hover:text-accent hover:bg-sidebar bg-opacity-5 transition-colors shadow-sm"
          >
            Napravi nalog
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 max-w-5xl mx-auto w-full px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-xl p-8 flex flex-col text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-accent text-4xl font-light mb-4">01</span>
            <h3 className="text-app-text text-xl font-medium mb-3">Napravite profil</h3>
            <p className="text-muted text-sm leading-relaxed">Unesite fakultet, smer, jezike i veštine kojim vladate kako bismo vam prilagodili ponudu.</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-8 flex flex-col text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-accent text-4xl font-light mb-4">02</span>
            <h3 className="text-app-text text-xl font-medium mb-3">Pregledajte prakse</h3>
            <p className="text-muted text-sm leading-relaxed">Baza sa desetinama aktivnih pozicija se sama osvežava sa popularnih platformi svakog dana.</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-8 flex flex-col text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-accent text-4xl font-light mb-4">03</span>
            <h3 className="text-app-text text-xl font-medium mb-3">Skill Checklist</h3>
            <p className="text-muted text-sm leading-relaxed">Praksonar precizno poredi vaše veštine sa onim što firma traži na svakom oglasu.</p>
          </div>
        </div>
      </section>

      {/* SOURCES */}
      <section className="relative z-10 w-full px-4 py-16 flex flex-col items-center">
        <h3 className="text-muted text-sm uppercase tracking-wider mb-8 font-medium">Izvori pretrage</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="text-sm font-medium text-app-text bg-card border border-border px-6 py-2.5 rounded-full shadow-sm">
            Infostud
          </div>
          <div className="text-sm font-medium text-app-text bg-card border border-border px-6 py-2.5 rounded-full shadow-sm">
            Erasmus
          </div>
          <div className="text-sm font-medium text-app-text bg-card border border-border px-6 py-2.5 rounded-full shadow-sm">
            Reddit
          </div>
          <div className="text-sm font-medium text-muted bg-app-secondary border border-border px-6 py-2.5 rounded-full">
            Još izvora uskoro
          </div>
        </div>
      </section>

      {/* KO-FI */}
      <section className="relative z-10 w-full max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-muted text-lg mb-8 leading-relaxed font-light">
          Praksonar je besplatan i pravi ga student, baš kao i ti. Ako ti je koristan, možeš da podržiš dalji razvoj platforme.
        </p>
        <a
          href="https://ko-fi.com/nedic"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-card border border-border text-accent px-6 py-3 rounded-lg font-medium hover:border-accent hover:text-accent transition-colors text-sm shadow-sm"
        >
          <svg className="w-5 h-5 text-[#FF5E5B]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.463-.091-3.71.951-1.242 2.618-1.4 3.702-.127 0 0 .166.2.316.368.125-.152.288-.337.288-.337 1.054-1.295 2.76-1.129 3.737.135.94 1.251.625 2.735-.095 3.716zm9.028-1.556c-.056.284-.652.753-2.441.874.152-1.155.191-2.319.191-2.319s.032-1.464-.093-2.09c.773-.016 1.503.061 1.503.061 1.258.156 1.493 1.254 1.44 1.769l-.6 1.705z" />
          </svg>
          Podrži na Ko-fi
        </a>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-border/60 bg-card/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted font-medium tracking-wide uppercase">
          <div className="flex items-center gap-6">
            <Link href="/internships" className="hover:text-accent transition-colors">/internships</Link>
            <Link href="/auth/register" className="hover:text-accent transition-colors">/auth/register</Link>
          </div>
          <div>
            Napravio student iz Srbije
          </div>
        </div>
      </footer>
    </div>
  );
}
