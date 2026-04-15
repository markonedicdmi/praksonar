'use client';

import Link from 'next/link';
import StatBadge from '@/components/StatBadge';
import ActiveUsersCounter from '@/components/ActiveUsersCounter';
import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export default function HomePage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSkillChecked, setIsSkillChecked] = useState(false);
  const [showCookieNotice, setShowCookieNotice] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [uskoroKey, setUskoroKey] = useState(0);

  const handleRefreshClick = () => {
    trackEvent('scraper_refresh_clicked');
    setRefreshCount(c => c + 1);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('cookie_consent') !== 'dismissed') {
      setShowCookieNotice(true);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = () => {
    setIsNavigating(true);
  };

  return (
    <div className="w-full bg-app min-h-screen text-app-text overflow-x-hidden font-sans">

      {/* GLOBAL RADAR LOADER OVERLAY */}
      {isNavigating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-app/80 backdrop-blur-sm">
          <iframe src="/radar.html" className="w-[300px] h-[300px] border-none" title="Loading..." />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col items-center">

        {/* SECTION 1 - HERO */}
        <section className="fade-in w-full flex flex-col items-center text-center mt-8 md:mt-16 mb-16 md:mb-24">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight md:leading-tight text-app-text max-w-3xl mb-4">
            <span className="relative inline-block"><span className="relative z-10">Sve prakse</span><span className="absolute inset-0 bg-accent/30 -skew-x-2 rounded-sm" aria-hidden="true" /></span> <br className="hidden md:block" />
            <span className="messy-highlight">
              <span className="relative z-10 px-1">na jednom mestu.</span>
              <svg 
                className="absolute top-0 left-[-5%] w-[110%] h-[110%] z-[-1] opacity-90" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 300 100" 
                preserveAspectRatio="none"
              >
                {/* Forward strokes (left to right) - varying lengths, smooth bleeding caps */}
                <path className="highlighter-path-1" stroke="#c99b33" strokeOpacity="0.3" strokeWidth="25" strokeLinecap="round" fill="none" d="M10,40 Q150,25 285,35" />
                <path className="highlighter-path-1" stroke="#c99b33" strokeOpacity="0.35" strokeWidth="20" strokeLinecap="round" fill="none" d="M2,50 Q150,35 295,45" />
                <path className="highlighter-path-3" stroke="#c99b33" strokeOpacity="0.25" strokeWidth="30" strokeLinecap="round" fill="none" d="M15,25 Q150,15 280,30" />
                <path className="highlighter-path-3" stroke="#c99b33" strokeOpacity="0.25" strokeWidth="15" strokeLinecap="round" fill="none" d="M30,15 Q150,15 260,20" />
                
                {/* Backward strokes (right to left) - varying lengths, smooth bleeding caps */}
                <path className="highlighter-path-2" stroke="#c99b33" strokeOpacity="0.35" strokeWidth="30" strokeLinecap="round" fill="none" d="M300,55 Q150,75 10,50" />
                <path className="highlighter-path-2" stroke="#c99b33" strokeOpacity="0.3" strokeWidth="20" strokeLinecap="round" fill="none" d="M285,75 Q150,85 20,65" />
                <path className="highlighter-path-2" stroke="#c99b33" strokeOpacity="0.2" strokeWidth="15" strokeLinecap="round" fill="none" d="M270,85 Q150,90 35,75" />
              </svg>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mt-8 mb-10 font-light leading-relaxed">
            Fakultet, ispiti, obaveze... Znamo da već imaš previše toga na tanjiru. Neka <span className="inline-block align-middle h-5 w-28 bg-current -mt-1 ml-1" style={{ WebkitMask: 'url("/logo with text updated.png") no-repeat center/contain', mask: 'url("/logo with text updated.png") no-repeat center/contain' }} aria-label="Praksonar" /> preuzme beskrajno pretraživanje praksi umesto tebe.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/internships" onClick={handleNavClick} className="w-full sm:w-auto bg-accent text-white px-8 py-3.5 rounded-xl font-medium text-lg hover:bg-opacity-90 transition-all hover:scale-105 shadow-md">
              Pretraži prakse →
            </Link>
            <Link href="/auth/register" onClick={handleNavClick} className="w-full sm:w-auto bg-transparent border-2 border-border text-app-text px-8 py-3.5 rounded-xl font-medium text-lg hover:border-sidebar hover:text-sidebar transition-all shadow-sm">
              Registruj se besplatno
            </Link>
          </div>
          <StatBadge />
          <ActiveUsersCounter />
        </section>

        {/* LOGO MARQUEE / STRIP */}
        <section className="fade-in w-full text-center mb-20 md:mb-32">
          <p className="text-sm text-muted mb-8 uppercase tracking-widest font-medium">Prikupljamo prakse i prilike sa svih strana</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xl md:text-2xl font-bold tracking-tight">Infostud</span>
            <span className="text-xl md:text-2xl font-bold tracking-tight">HelloWorld</span>
            <span className="text-xl md:text-2xl font-bold tracking-tight">Erasmus+</span>
            <span className="text-xl md:text-2xl font-bold tracking-tight">LinkedIn</span>
          </div>
        </section>

        {/* SECTION 2 - HOW IT WORKS */}
        <section className="fade-in w-full mb-20 md:mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Kako funkcioniše?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 */}
            <div className="bg-card p-10 rounded-xl border border-border hover:border-accent/30 transition-all hover:-translate-y-1 hover:shadow-xl group flex flex-col">
              <div className="w-14 h-14 bg-app rounded-xl flex items-center justify-center mb-6 overflow-hidden relative group-hover:bg-accent/10 transition-colors">
                <iframe src="/radar.html" className="w-[120px] h-[120px] absolute pointer-events-none scale-[0.28] origin-center" title="Loading..." />
              </div>
              <h3 className="text-xl font-bold mb-4">
                <span className="relative inline-block text-app-text">
                  Sve prakse
                  <svg className="absolute -bottom-2 left-0 w-full" width="100%" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                    <path d="M 0,4 Q 25,0 50,4 Q 75,8 100,4" stroke="var(--color-accent)" strokeWidth="2" fill="none" opacity="0.9" />
                  </svg>
                </span>
                {' '}odmah
              </h3>
              <p className="text-muted leading-relaxed mb-6">
                Ogromna baza praksi dostupna 24/7, budi prvi koji će se prijaviti uz <span className="inline-block align-middle h-4 w-24 bg-current -mt-1 ml-1" style={{ WebkitMask: 'url("/logo with text updated.png") no-repeat center/contain', mask: 'url("/logo with text updated.png") no-repeat center/contain' }} aria-label="Praksonar" />.
              </p>
              <button type="button" onClick={handleRefreshClick} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-app text-app-text rounded-lg border border-border hover:border-accent hover:text-accent transition-colors text-sm font-medium mt-auto group-hover:bg-accent/5">
                <span style={{ transform: `rotate(${refreshCount * 720}deg)`, transition: 'transform 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)' }} className="flex items-center justify-center">
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </span>
                Osveži listu
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-card p-10 rounded-xl border border-border hover:border-accent/30 transition-all hover:-translate-y-1 hover:shadow-xl group flex flex-col">
              <div className="w-14 h-14 bg-app rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Skill Checklist</h3>
              <p className="text-muted leading-relaxed mb-6">
                Automatski poredi tvoje veštine sa zahtevima prakse pre slanja prijave.
              </p>
              <div
                className="mt-auto bg-app p-3 rounded-lg border border-border flex items-center gap-3 w-full group-hover:border-accent/30 transition-colors cursor-pointer"
                onClick={() => setIsSkillChecked(!isSkillChecked)}
              >
                <div className="relative flex items-center justify-center flex-shrink-0 w-5 h-5">
                  {/* Glowing ring that invites clicking */}
                  {!isSkillChecked && (
                    <div className="absolute inset-0 rounded-md bg-accent animate-ping opacity-75" style={{ animationDuration: '3s' }}></div>
                  )}
                  <div className={`relative z-10 w-full h-full rounded-md flex items-center justify-center border transition-all duration-300 ${isSkillChecked ? 'bg-[#22c55e] border-[#22c55e] text-white' : 'bg-app border-accent shadow-[0_0_8px_var(--color-accent)] text-transparent'}`}>
                    <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isSkillChecked ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <span className={`text-sm font-medium transition-all duration-300 ${isSkillChecked ? 'text-muted line-through decoration-muted/50' : 'text-app-text'}`}>
                  Good problem-solving skills
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div onClick={() => setUskoroKey(k => k + 1)} className="relative bg-card p-10 rounded-xl border border-border hover:border-accent/30 transition-all hover:-translate-y-1 hover:shadow-xl group cursor-pointer">
              <span className="absolute top-5 right-5 bg-app text-accent text-xs font-bold px-3 py-1.5 rounded-full border border-border overflow-visible">
                {uskoroKey > 0 ? (
                  <span className="messy-highlight">
                    <span className="relative z-10 px-1 text-neutral-800">Uskoro</span>
                    <svg 
                      key={uskoroKey}
                      className="absolute top-[-10%] left-[-15%] w-[130%] h-[120%] z-0 opacity-90 pointer-events-none" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 300 100" 
                      preserveAspectRatio="none"
                    >
                      {/* Thicker marker lines for such a small badge */}
                      <path className="highlighter-path-instant-1" stroke="#5c735e" strokeOpacity="0.4" strokeWidth="40" strokeLinecap="round" fill="none" d="M10,40 Q150,25 285,35" />
                      <path className="highlighter-path-instant-1" stroke="#5c735e" strokeOpacity="0.4" strokeWidth="30" strokeLinecap="round" fill="none" d="M2,50 Q150,35 295,45" />
                      <path className="highlighter-path-instant-3" stroke="#5c735e" strokeOpacity="0.3" strokeWidth="40" strokeLinecap="round" fill="none" d="M15,25 Q150,15 280,30" />
                      
                      <path className="highlighter-path-instant-2" stroke="#5c735e" strokeOpacity="0.4" strokeWidth="45" strokeLinecap="round" fill="none" d="M300,55 Q150,75 10,50" />
                      <path className="highlighter-path-instant-2" stroke="#5c735e" strokeOpacity="0.35" strokeWidth="35" strokeLinecap="round" fill="none" d="M285,75 Q150,85 20,65" />
                    </svg>
                  </span>
                ) : (
                  "Uskoro"
                )}
              </span>
              <div className="w-14 h-14 bg-app rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">AI ti piše prijavu</h3>
              <p className="text-muted leading-relaxed">
                CV Pisac će generisati personalizovano motivaciono pismo za svaku praksu za koju apliciraš.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3 - FOR WHO */}
        <section className="fade-in w-full mb-20 md:mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Za koga je <span className="inline-block align-middle h-8 w-40 bg-current -mt-2 ml-1" style={{ WebkitMask: 'url("/logo with text updated.png") no-repeat center/contain', mask: 'url("/logo with text updated.png") no-repeat center/contain' }} aria-label="Praksonar" /> ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-app-text mb-6 pb-4 border-b border-border">Ako si student koji...</h3>
              <ul className="space-y-5">
                {[
                  'Želi da pije kafu umesto da gugla prakse',
                  'Prijavljuje se na prakse ali ne dobija odgovor',
                  'Ne zna tačno koje veštine mu nedostaju',
                  'Želi da aplicira brže i sa boljim prijavama'
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 group">
                    <svg className="w-6 h-6 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-app-text mb-6 pb-4 border-b border-border">
                <span className="inline-block align-middle h-6 w-32 bg-current -mt-1" style={{ WebkitMask: 'url("/logo with text updated.png") no-repeat center/contain', mask: 'url("/logo with text updated.png") no-repeat center/contain' }} aria-label="Praksonar" /> ti daje...
              </h3>
              <ul className="space-y-5">
                {[
                  'Više vremena da se zapravo spremiš za praksu',
                  'Pregled skill gapova pre apliciranja',
                  'AI pisac motivacionih pisama (uskoro)',
                  'Instant notifikacije kad izađe nova praksa'
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 group">
                    <svg className="w-6 h-6 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-app-text font-medium leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 4 - CTA BANNER */}
        <section className="fade-in w-full mb-16 md:mb-24">
          <div className="bg-sidebar rounded-2xl p-10 md:p-16 text-center shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sidebar to-sidebar-muted/10 opacity-60 z-0"></div>
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-3xl md:text-5xl font-bold text-text-on-dark mb-4 drop-shadow-sm">Počni danas. Besplatno.</h2>
              <p className="text-sidebar-muted text-lg mb-8 max-w-xl mx-auto font-light">
                Registracija traje 2 minuta. Nema kreditne kartice.
              </p>
              <Link href="/auth/register" onClick={handleNavClick} className="bg-text-on-dark text-sidebar px-10 py-4 rounded-xl font-bold text-lg hover:bg-accent hover:text-white transition-all hover:scale-105 shadow-xl hover:shadow-accent/40">
                Registruj se →
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 5 - FOOTER */}
        <footer className="fade-in w-full border-t border-border pt-10 pb-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted font-light">
          <div>© 2026 Praksonar</div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            <Link href="/o-autoru" className="hover:text-accent transition-colors">O autoru</Link>
            <a href="mailto:kontakt@praksonar.com" className="hover:text-accent transition-colors">Kontakt</a>
            <Link href="/politika-privatnosti" className="hover:text-accent transition-colors">Politika privatnosti</Link>
          </div>
        </footer>

      </div >

      {/* COOKIE NOTICE */}
      {showCookieNotice && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-sidebar text-text-on-dark py-2 px-4 flex justify-between items-center text-sm shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <p className="flex-1 text-center sm:text-left pr-4">
            Praksonar koristi Google Analytics za analitiku poseta. Korišćenjem sajta prihvataš ovo.
          </p>
          <button
            onClick={() => {
              localStorage.setItem('cookie_consent', 'dismissed');
              setShowCookieNotice(false);
            }}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
            aria-label="Zatvori obaveštenje"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div >
  );
}
