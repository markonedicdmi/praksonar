import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Prakse za studente Srbije — Praksonar',
    description: 'Pretraži stotine studentskih praksi u Srbiji. Filtriranje po oblasti, lokaciji i jeziku. Automatski osvežavano svaki dan.',
    alternates: {
        canonical: '/internships',
    },
    openGraph: {
        title: 'Prakse za studente Srbije — Praksonar',
        description: 'Pretraži stotine studentskih praksi u Srbiji. Filtriranje po oblasti, lokaciji i jeziku. Automatski osvežavano svaki dan.',
        url: 'https://praksonar.com/internships',
    },
};

export default function InternshipsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
