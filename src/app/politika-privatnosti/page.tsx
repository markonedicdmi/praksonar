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

            <div className="bg-card border border-border rounded-xl p-8 space-y-6 text-muted leading-relaxed">
                <p className="text-sidebar-muted italic">
                    [PLACEHOLDER — Politika privatnosti će biti dostupna uskoro.]
                </p>
            </div>
        </div>
    );
}
