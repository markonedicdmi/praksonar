import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Podešavanja — Praksonar',
    description: 'Upravljaj podešavanjima svog Praksonar naloga.',
    alternates: {
        canonical: '/settings',
    },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
