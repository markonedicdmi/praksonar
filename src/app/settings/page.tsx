'use client';

import { usePalette } from '@/components/PaletteProvider';
import { PALETTES } from '@/lib/palettes';

export default function SettingsPage() {
    const { activePaletteName, setPalette } = usePalette();

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <header className="mb-8">
                <h1 className="text-3xl font-medium text-app-text tracking-tight">Podešavanja</h1>
                <p className="mt-2 text-muted">Prilagodite izgled i rad aplikacije.</p>
            </header>

            <section className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-app-secondary/30">
                    <h2 className="text-lg font-medium text-app-text">Izgled i Teme</h2>
                    <p className="text-sm text-muted mt-1">Izaberite paletu boja koja vam najviše odgovara.</p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.values(PALETTES).map((palette) => (
                            <button
                                key={palette.name}
                                onClick={() => setPalette(palette.name)}
                                className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all duration-200 group ${activePaletteName === palette.name
                                        ? 'border-accent ring-4 ring-accent/10'
                                        : 'border-border hover:border-accent/40'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-medium text-app-text">{palette.name}</span>
                                    {palette.isDark && (
                                        <span className="text-[10px] uppercase tracking-widest bg-sidebar text-text-on-dark px-1.5 py-0.5 rounded">Dark</span>
                                    )}
                                </div>

                                {/* Palette Preview Pills */}
                                <div className="flex gap-1.5 mt-auto">
                                    <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: palette.colors.sidebar }} title="Sidebar" />
                                    <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: palette.colors.accent }} title="Accent" />
                                    <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: palette.colors.bg }} title="Background" />
                                    <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: palette.colors.card }} title="Card" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
