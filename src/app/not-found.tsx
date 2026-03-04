import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-app flex flex-col items-center justify-center p-4">
            <span
                className="h-20 w-64 bg-accent inline-block mb-12"
                style={{
                    WebkitMask: 'url("/praksonar with text updated FAT.png") no-repeat center/contain',
                    mask: 'url("/praksonar with text updated FAT.png") no-repeat center/contain'
                }}
            />
            <h1 className="text-8xl flex-shrink-0 sm:text-9xl font-bold mb-4" style={{ color: '#c99b33' }}>404</h1>
            <p className="text-xl sm:text-2xl text-app-text font-medium mb-8 text-center max-w-md">Ova stranica ne postoji.</p>
            <Link href="/internships" className="bg-accent text-text-on-dark px-8 py-4 rounded-lg font-medium hover:opacity-90 transition-colors shadow-sm">
                Nazad na prakse
            </Link>
        </div>
    );
}
