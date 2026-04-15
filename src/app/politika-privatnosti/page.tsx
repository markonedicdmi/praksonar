import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Politika Privatnosti — Praksonar',
    description: 'Politika privatnosti platforme Praksonar.',
    alternates: {
        canonical: '/politika-privatnosti',
    },
};

export default function PolitikaPrivatnostiPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-light text-app-text mb-8">Politika privatnosti</h1>

            <div className="bg-card border border-border rounded-xl p-8 space-y-6 text-muted leading-relaxed text-sm">
                <p className="text-xs text-sidebar-muted uppercase tracking-widest">Poslednje ažurirano: april 2026.</p>

                <section>
                    <h2 className="text-lg font-medium text-app-text mb-3">1. Uvod</h2>
                    <p>
                        Praksonar (&quot;mi&quot;, &quot;nas&quot;, &quot;naša platforma&quot;) je besplatna platforma koja pomaže studentima
                        u Srbiji da pronađu prakse i prilike za stručno usavršavanje. Ova politika privatnosti objašnjava
                        koje podatke prikupljamo, zašto ih prikupljamo i kako ih koristimo.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-medium text-app-text mb-3">2. Podaci koje prikupljamo</h2>
                    <p className="mb-2">Kada koristite Praksonar, možemo prikupljati sledeće podatke:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong>Podaci o nalogu:</strong> ime, email adresa, lozinka (šifrovana)</li>
                        <li><strong>Podaci o profilu:</strong> fakultet, oblast studija, nivo studija, veštine, jezici</li>
                        <li><strong>Profilna slika i CV:</strong> fajlovi koje sami postavite</li>
                        <li><strong>Podešavanja:</strong> izabrana paleta boja, filteri, preferencije obaveštenja</li>
                        <li><strong>Podaci o korišćenju:</strong> anonimizovana analitika putem Google Analytics (kolačići)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-medium text-app-text mb-3">3. Kako koristimo vaše podatke</h2>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Prikazivanje relevantnih praksi i analiza veština</li>
                        <li>Čuvanje vaših preferencija i sačuvanih oglasa</li>
                        <li>Poboljšanje korisničkog iskustva i funkcionalnosti platforme</li>
                        <li>Slanje obaveštenja o novim praksama (samo ako uključite)</li>
                    </ul>
                    <p className="mt-2">Vaše podatke <strong>nikada ne prodajemo</strong> trećim stranama.</p>
                </section>

                <section>
                    <h2 className="text-lg font-medium text-app-text mb-3">4. Gde čuvamo podatke</h2>
                    <p>
                        Koristimo <strong>Supabase</strong> (infrastruktura hostovana na AWS, EU region) za čuvanje podataka,
                        autentikaciju i skladištenje fajlova. Svi podaci su zaštićeni Row Level Security (RLS) politikama
                        — korisnik može pristupiti samo sopstvenim podacima.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-medium text-app-text mb-3">5. Kolačići</h2>
                    <p>
                        Koristimo kolačiće za autentikaciju (sesija) i Google Analytics (anonimizovana analitika poseta).
                        Možete ih onemogućiti u podešavanjima vašeg pretraživača, ali to može uticati na funkcionalnost.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-medium text-app-text mb-3">6. Vaša prava</h2>
                    <p className="mb-2">Imate sledeća prava:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong>Pristup:</strong> Možete videti sve svoje podatke na stranici Profil i Podešavanja</li>
                        <li><strong>Izmena:</strong> Možete izmeniti sve podatke u bilo kom trenutku</li>
                        <li><strong>Brisanje:</strong> Možete trajno obrisati nalog u Podešavanjima → &quot;Obriši nalog&quot;</li>
                        <li><strong>Prenosivost:</strong> Vaš CV se može preuzeti u originalnom formatu</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-medium text-app-text mb-3">7. Scraping podataka</h2>
                    <p>
                        Praksonar automatski prikuplja javno dostupne oglase za prakse sa sajtova poput Infostud, HelloWorld.rs,
                        LinkedIn i Erasmus+. Ovi podaci su javno dostupni i ne sadrže lične podatke korisnika.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-medium text-app-text mb-3">8. Bezbednost</h2>
                    <p>
                        Koristimo industrijsko standardne mere zaštite uključujući HTTPS enkripciju, šifrovane lozinke
                        (bcrypt), Row Level Security politike na bazi podataka i ograničeni pristup administrativnim funkcijama.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-medium text-app-text mb-3">9. Promene politike</h2>
                    <p>
                        Ova politika može biti ažurirana. Sve značajne promene biće objavljene na ovoj stranici.
                        Datum poslednjeg ažuriranja je naveden na vrhu.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-medium text-app-text mb-3">10. Kontakt</h2>
                    <p>
                        Za sva pitanja u vezi sa privatnošću, pišite nam na{' '}
                        <a href="mailto:kontakt@praksonar.com" className="text-accent hover:underline">
                            kontakt@praksonar.com
                        </a>.
                    </p>
                </section>
            </div>
        </div>
    );
}
