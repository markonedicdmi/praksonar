import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'O meni — Praksonar',
    description: 'Praksonar je besplatna platforma za studente Srbije koja automatski prikuplja prakse sa svih sajtova. Napravio student za studente.',
    alternates: {
        canonical: '/o-meni',
    },
    openGraph: {
        title: 'O meni — Praksonar',
        description: 'Praksonar je besplatna platforma za studente Srbije koja automatski prikuplja prakse sa svih sajtova. Napravio student za studente.',
        url: 'https://praksonar.com/o-meni',
    },
};

export default function OMeniPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-light text-app-text mb-8">O meni</h1>

            <div className="bg-card border border-border rounded-xl p-8 space-y-6 text-muted leading-relaxed">

                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="shrink-0">
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-border shadow-sm">
                            <Image
                                src="/profile-placeholder.jpg"
                                alt="Osnivač Praksonara"
                                fill
                                className="object-cover bg-app-secondary"
                                sizes="(max-width: 640px) 96px, 128px"
                            />
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <p>
                            Zdravo! Ja sam student sa novosadskog PMF-a i napravio sam Praksonar zato što sam
                            i sam prošao kroz beskonačno pretraživanje praksi po desetak sajtova. Znao sam da mora postojati
                            bolji način — pa sam ga napravio.
                        </p>

                        <p>
                            Praksonar automatski prikuplja prakse sa Infostuda, HelloWorld-a, LinkedIn-a, Erasmus+ programa
                            i drugih izvora, sve na jednom mestu. Besplatan je, napravljen od studenta za studente, 
                            i uvek će takav ostati.
                        </p>

                        <p>
                            Ako ti je platforma korisna, podeli je sa kolegama. To je najbolja podrška. 🤝
                        </p>
                    </div>
                </div>

                <hr className="border-border my-8" />

                {/* Contact */}
                <div>
                    <h2 className="text-base font-medium text-app-text mb-2">Kontakt</h2>
                    <p>
                        Imaš ideju, ponudu za saradnju ili želiš da prijaviš grešku?{' '}
                        <a
                            href="mailto:kontakt@praksonar.com"
                            className="text-accent hover:underline"
                        >
                            kontakt@praksonar.com
                        </a>
                    </p>
                </div>

                {/* Support */}
                <div>
                    <h2 className="text-base font-medium text-app-text mb-2">Podrži projekat</h2>
                    <p>
                        Praksonar je 100% besplatan. Ako ti platforma pomaže, možeš me podržati{' '}
                        <a
                            href="https://ko-fi.com/nedic"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline font-medium"
                        >
                            na Ko-fi
                        </a>
                        .
                    </p>
                </div>

                {/* Links */}
                <div className="pt-2 flex flex-wrap gap-4 text-sm">
                    <Link href="/politika-privatnosti" className="text-accent hover:underline">
                        Politika privatnosti
                    </Link>
                    <Link href="/internships" className="text-accent hover:underline">
                        Prakse
                    </Link>
                </div>
            </div>
        </div>
    );
}
