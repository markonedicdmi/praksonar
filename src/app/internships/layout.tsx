import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Prakse — Praksonar',
    description: 'Pretraži sve dostupne prakse za studente u Srbiji.',
    alternates: {
        canonical: 'https://praksonar.com/internships',
    },
};

export default function InternshipsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
