import Link from 'next/link';

export default function ConfirmEmailPage() {
    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-app-secondary px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg shadow border border-border text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                    <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-app-text">
                    Potvrdi svoju email adresu
                </h2>
                <p className="mt-2 text-sm text-muted">
                    Poslali smo ti link za potvrdu na unetu email adresu. Klikni na link u mailu da bi aktivirao/la nalog i nastavio/la na podešavanje profila.
                </p>
                <div className="pt-4">
                    <Link href="/auth/login" className="font-medium text-accent hover:opacity-90">
                        Kada potvrdiš email, prijavi se ovde
                    </Link>
                </div>
            </div>
        </div>
    );
}
