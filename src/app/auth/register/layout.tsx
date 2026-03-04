import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Registruj se — Praksonar',
    description: 'Napravi besplatan nalog na Praksonaru i pronađi stotine studentskih praksi u Srbiji svaki dan.',
    alternates: {
        canonical: '/auth/register',
    },
    openGraph: {
        title: 'Registruj se — Praksonar',
        description: 'Napravi besplatan nalog na Praksonaru i pronađi stotine studentskih praksi u Srbiji svaki dan.',
        url: 'https://praksonar.com/auth/register',
    },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
