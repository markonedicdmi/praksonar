import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CV Pisac — Praksonar',
    description: 'AI asistent za pisanje CV-ja i propratnih pisama prilagođenih konkretnoj studentskoj praksi. Uskoro na Praksonaru.',
    alternates: {
        canonical: '/cv-writer',
    },
    openGraph: {
        title: 'CV Pisac — Praksonar',
        description: 'AI asistent za pisanje CV-ja i propratnih pisama prilagođenih konkretnoj studentskoj praksi. Uskoro na Praksonaru.',
        url: 'https://praksonar.com/cv-writer',
    },
};

export default function CvWriterLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
