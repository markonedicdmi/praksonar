import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Prijavi se — Praksonar',
    description: 'Prijavi se na Praksonar i pronađi prakse za studente u Srbiji prilagođene tvojim veštinama.',
    alternates: {
        canonical: '/auth/login',
    },
    openGraph: {
        title: 'Prijavi se — Praksonar',
        description: 'Prijavi se na Praksonar i pronađi prakse za studente u Srbiji prilagođene tvojim veštinama.',
        url: 'https://praksonar.com/auth/login',
    },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
