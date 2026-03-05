'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { deleteInternship, insertInternship } from '@/app/admin/actions';

export default function InternshipsSection() {
    const supabase = createClient();
    const [internships, setInternships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [page, setPage] = useState(0);
    const pageSize = 50;
    const [total, setTotal] = useState(0);

    // Search
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '', company: '', description: '', location: '',
        is_international: false, field: '', required_skills: '',
        source_url: '', source_name: 'Manual', deadline: ''
    });

    const fetchInternships = async () => {
        setLoading(true);
        let query = supabase
            .from('internships')
            .select('*', { count: 'exact' });

        if (search.trim()) {
            query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
        }

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (!error && data) {
            setInternships(data);
            if (count !== null) setTotal(count);
        }
        setLoading(false);
    };

    useEffect(() => {
        // Basic debounce for search
        const timer = setTimeout(() => {
            fetchInternships();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, search]);

    const handleDelete = async (id: string) => {
        if (!confirm('Da li ste sigurni da želite da obrišete ovu praksu?')) return;

        setDeletingId(id);
        try {
            await deleteInternship(id);
            alert('Praksa obrisana');
            fetchInternships();
        } catch (e: any) {
            alert('Greška pri brisanju: ' + e.message);
        } finally {
            setDeletingId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await insertInternship(formData);
            alert('Praksa uspešno dodata');
            setIsModalOpen(false);
            setFormData({
                title: '', company: '', description: '', location: '',
                is_international: false, field: '', required_skills: '',
                source_url: '', source_name: 'Manual', deadline: ''
            });
            fetchInternships();
        } catch (e: any) {
            alert('Greška: ' + e.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-app-text flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Prakse
                </h2>

                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Pretraži po naslovu ili kompaniji..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        className="bg-card border border-border rounded-lg px-4 py-2 text-sm text-app-text focus:outline-none focus:border-accent min-w-[250px]"
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-accent hover:bg-accent/90 text-text-on-dark px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Dodaj ručno
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-border text-text-muted">
                            <th className="px-6 py-4 font-medium">Naziv</th>
                            <th className="px-6 py-4 font-medium">Kompanija</th>
                            <th className="px-6 py-4 font-medium">Izvor</th>
                            <th className="px-6 py-4 font-medium">Kreirano</th>
                            <th className="px-6 py-4 font-medium">Rok</th>
                            <th className="px-6 py-4 font-medium text-right">Akcije</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 max-md:divide-border">
                        {loading && internships.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8 text-text-muted">Učitavanje...</td></tr>
                        ) : internships.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8 text-text-muted">Nema rezultata.</td></tr>
                        ) : (
                            internships.map(internship => (
                                <tr key={internship.id} className="hover:bg-sidebar/30 transition-colors">
                                    <td className="px-6 py-4 font-medium max-w-[200px] truncate" title={internship.title}>{internship.title}</td>
                                    <td className="px-6 py-4 text-text-muted">{internship.company}</td>
                                    <td className="px-6 py-4 text-text-muted">
                                        <span className="bg-border/50 px-2 py-1 rounded text-xs">{internship.source_name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted">
                                        {new Date(internship.created_at).toLocaleDateString('sr-RS')}
                                    </td>
                                    <td className="px-6 py-4 text-text-muted">
                                        {internship.deadline ? new Date(internship.deadline).toLocaleDateString('sr-RS') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(internship.id)}
                                            disabled={deletingId === internship.id}
                                            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                                            title="Obriši"
                                        >
                                            {deletingId === internship.id ? 'Brišem...' : (
                                                <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="border-t border-border px-6 py-4 flex items-center justify-between text-sm">
                    <div className="text-text-muted">
                        Prikazano {page * pageSize + 1} do {Math.min((page + 1) * pageSize, total)} od {total}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-3 py-1 bg-sidebar rounded hover:bg-sidebar/80 disabled:opacity-50 transition-colors text-text-muted"
                        >
                            Prethodna
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={(page + 1) * pageSize >= total}
                            className="px-3 py-1 bg-sidebar rounded hover:bg-sidebar/80 disabled:opacity-50 transition-colors text-text-muted"
                        >
                            Sledeća
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-border">
                            <h3 className="text-xl font-bold text-app-text">Dodaj praksu ručno</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-app-text transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="add-internship-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-text-muted mb-1">Naziv *</label>
                                        <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-sidebar border border-border rounded px-3 py-2 text-text-on-dark focus:border-accent outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-text-muted mb-1">Kompanija *</label>
                                        <input required type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full bg-sidebar border border-border rounded px-3 py-2 text-text-on-dark focus:border-accent outline-none" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-text-muted mb-1">Link URL *</label>
                                        <input required type="url" value={formData.source_url} onChange={e => setFormData({ ...formData, source_url: e.target.value })} className="w-full bg-sidebar border border-border rounded px-3 py-2 text-text-on-dark focus:border-accent outline-none" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-text-muted mb-1">Opis</label>
                                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-sidebar border border-border rounded px-3 py-2 text-text-on-dark focus:border-accent outline-none h-24" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-text-muted mb-1">Lokacija</label>
                                        <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full bg-sidebar border border-border rounded px-3 py-2 text-text-on-dark focus:border-accent outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-text-muted mb-1">Oblast (Field)</label>
                                        <input type="text" value={formData.field} onChange={e => setFormData({ ...formData, field: e.target.value })} className="w-full bg-sidebar border border-border rounded px-3 py-2 text-text-on-dark focus:border-accent outline-none" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-text-muted mb-1">Veštine (odvojeno zarezom)</label>
                                        <input type="text" placeholder="React, Node.js, Git..." value={formData.required_skills} onChange={e => setFormData({ ...formData, required_skills: e.target.value })} className="w-full bg-sidebar border border-border rounded px-3 py-2 text-text-on-dark focus:border-accent outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-text-muted mb-1">Datum isteka (Deadline)</label>
                                        <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="w-full bg-sidebar border border-border rounded px-3 py-2 text-text-on-dark focus:border-accent outline-none" />
                                    </div>
                                    <div className="flex items-center mt-6">
                                        <input type="checkbox" id="is_international" checked={formData.is_international} onChange={e => setFormData({ ...formData, is_international: e.target.checked })} className="w-4 h-4 rounded border-border bg-sidebar accent-accent" />
                                        <label htmlFor="is_international" className="ml-2 text-sm text-app-text">Internacionalna praksa</label>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-text-muted hover:text-app-text transition-colors font-medium">
                                Otkaži
                            </button>
                            <button type="submit" form="add-internship-form" className="bg-accent hover:bg-accent/90 text-text-on-dark px-6 py-2 rounded-lg font-medium shadow transition-colors">
                                Sačuvaj praksu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
