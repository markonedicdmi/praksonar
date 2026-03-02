import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col relative bg-sonar-bg text-sonar-white overflow-x-hidden">
      {/* Radar Background */}
      <div className="absolute inset-x-0 top-0 h-screen z-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-[0.07]">
        <svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="400" cy="400" r="100" stroke="currentColor" strokeWidth="1" className="animate-sonar-ping text-sonar-signal" />
          <circle cx="400" cy="400" r="200" stroke="currentColor" strokeWidth="1" className="text-sonar-signal" />
          <circle cx="400" cy="400" r="300" stroke="currentColor" strokeWidth="1" className="text-sonar-signal" />
          <circle cx="400" cy="400" r="400" stroke="currentColor" strokeWidth="1" className="text-sonar-signal" />
        </svg>
      </div>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-4 text-center mt-10 md:mt-20">
        <h1 className="font-futura text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-widest text-sonar-white mb-6">
          Sve prakse.<br /> Na jednom mestu.
        </h1>
        <p className="font-outfit text-sonar-muted text-lg sm:text-xl max-w-2xl mb-10">
          Praksonar automatski prikuplja prakse za studente iz Srbije — svaki dan.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/internships"
            className="font-outfit bg-sonar-signal text-sonar-bg px-8 py-3 rounded-md font-medium text-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgb(var(--sonar-signal)/0.3)] hover:shadow-[0_0_20px_rgb(var(--sonar-signal)/0.5)]"
          >
            Pronađi praksu
          </Link>
          <Link
            href="/auth/register"
            className="font-outfit bg-transparent border border-sonar-border text-sonar-white px-8 py-3 rounded-md font-medium text-lg hover:border-sonar-signal hover:text-sonar-signal transition-colors"
          >
            Napravi nalog
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 max-w-5xl mx-auto w-full px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-sonar-surface border border-sonar-border/50 rounded-lg p-8 flex flex-col items-center text-center">
            <span className="font-dmmono text-sonar-signal text-xl mb-4">01</span>
            <h3 className="font-outfit text-sonar-white text-xl font-medium mb-2">Napravite profil</h3>
            <p className="font-outfit text-sonar-muted text-sm">Unesite fakultet, smer, jezike i veštine kojim vladate.</p>
          </div>
          <div className="bg-sonar-surface border border-sonar-border/50 rounded-lg p-8 flex flex-col items-center text-center">
            <span className="font-dmmono text-sonar-signal text-xl mb-4">02</span>
            <h3 className="font-outfit text-sonar-white text-xl font-medium mb-2">Pregledajte prakse</h3>
            <p className="font-outfit text-sonar-muted text-sm">Baza sa stotinama aktivnih pozicija se sama osvežava.</p>
          </div>
          <div className="bg-sonar-surface border border-sonar-border/50 rounded-lg p-8 flex flex-col items-center text-center">
            <span className="font-dmmono text-sonar-signal text-xl mb-4">03</span>
            <h3 className="font-outfit text-sonar-white text-xl font-medium mb-2">Vidite šta nedostaje</h3>
            <p className="font-outfit text-sonar-muted text-sm">Sonar precizno poredi vaše veštine sa onim što firma traži.</p>
          </div>
        </div>
      </section>

      {/* SOURCES */}
      <section className="relative z-10 w-full px-4 py-16 flex flex-col items-center">
        <h3 className="font-dmmono text-sonar-muted text-sm uppercase tracking-widest mb-6">Izvori pretrage</h3>
        <div className="flex flex-wrap justify-center gap-3">
          <div className="font-dmmono text-xs sm:text-sm text-sonar-muted bg-sonar-surface border border-sonar-border px-4 py-2 rounded-full">
            Infostud
          </div>
          <div className="font-dmmono text-xs sm:text-sm text-sonar-muted bg-sonar-surface border border-sonar-border px-4 py-2 rounded-full">
            Erasmus
          </div>
          <div className="font-dmmono text-xs sm:text-sm text-sonar-muted bg-sonar-surface border border-sonar-border px-4 py-2 rounded-full">
            Reddit
          </div>
          <div className="font-dmmono text-xs sm:text-sm text-sonar-muted/50 bg-sonar-surface border border-sonar-border/50 px-4 py-2 rounded-full">
            Još izvora uskoro
          </div>
        </div>
      </section>

      {/* KO-FI */}
      <section className="relative z-10 w-full max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="font-outfit text-sonar-muted text-lg mb-8 leading-relaxed">
          Praksonar je besplatan i pravi ga student, baš kao i ti. Ako ti je koristan, možeš da podržiš razvoj.
        </p>
        <a
          href="https://ko-fi.com/nedic"
          target="_blank"
          rel="noopener noreferrer"
          className="font-outfit inline-flex items-center gap-2 bg-transparent border border-sonar-border text-sonar-white px-6 py-2.5 rounded-md font-medium hover:border-sonar-signal hover:text-sonar-signal transition-colors text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
          Podrži na Ko-fi
        </a>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-sonar-border/50 bg-sonar-bg mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-dmmono text-xs text-sonar-muted">
          <div className="flex items-center gap-6">
            <Link href="/internships" className="hover:text-sonar-white transition-colors">/internships</Link>
            <Link href="/auth/register" className="hover:text-sonar-white transition-colors">/auth/register</Link>
          </div>
          <div>
            Napravio student iz Srbije
          </div>
        </div>
      </footer>
    </main>
  );
}
