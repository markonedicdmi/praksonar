import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'O autoru | Praksonar',
    description: 'Saznaj ko stoji iza Praksonara.',
};

export default function AboutAuthorPage() {
    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <h1 className="text-3xl font-medium text-app-text mb-2">O autoru</h1>
            <h2 className="text-lg text-muted mb-8">Praksonar je napravio student, za studente.</h2>

            <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
                <p className="text-app-text leading-relaxed">
                    [PLACEHOLDER — autor će ovde dodati tekst o sebi i projektu]
                </p>

                <hr className="border-border my-8" />

                <div>
                    <h3 className="text-xl font-medium text-app-text mb-4">Kontakt</h3>
                    <p className="text-app-text mb-2">Imaš pitanje, predlog ili želiš da sarađujemo?</p>
                    <a
                        href="mailto:kontakt@praksonar.com"
                        className="text-accent hover:underline font-medium inline-flex items-center gap-2"
                    >
                        <svg className="w-5 h-5 block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        kontakt@praksonar.com
                    </a>
                </div>
            </div>

            <p className="mt-8 text-sm text-center text-muted/80">
                Praksonar nije zvanična platforma nijednog univerziteta.
            </p>
        </div>
    );
}
