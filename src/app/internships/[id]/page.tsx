import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ClientWrapper from './ClientWrapper';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const supabase = await createClient();

    const { data: internship } = await supabase
        .from('internships')
        .select('title, company, description, is_international, location')
        .eq('id', id)
        .single();

    if (!internship) {
        return {
            title: 'Praksa nije pronađena',
        };
    }

    const title = `${internship.title} @ ${internship.company}`;
    const descriptionText = internship.description
        ? internship.description.replace(/<[^>]+>/g, '').substring(0, 160) + '...'
        : 'Saznajte više o ovoj praksi na Praksonaru.';

    return {
        title,
        description: descriptionText,
        alternates: {
            canonical: `/internships/${id}`,
        },
        openGraph: {
            title,
            description: descriptionText,
            url: `https://praksonar.com/internships/${id}`,
            siteName: 'Praksonar',
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description: descriptionText,
        },
    };
}

export default async function InternshipPage({ params }: Props) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const supabase = await createClient();

    // Fetch internship
    const { data: internship, error } = await supabase
        .from('internships')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !internship) {
        notFound();
    }

    // Fetch session & user profile & saved status
    const { data: { user } } = await supabase.auth.getUser();
    let userProfile = null;
    let isSaved = false;

    if (user) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        userProfile = profile;

        const { data: savedData } = await supabase
            .from('saved_internships')
            .select('id')
            .match({ internship_id: id, user_id: user.id })
            .single();

        if (savedData) {
            isSaved = true;
        }
    }

    // Generate JSON-LD Schema Markup for JobPosting
    const jobPostingSchema = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: internship.title,
        description: internship.description || 'Pronađi više informacija o ovoj praksi na Praksonaru.',
        datePosted: internship.created_at,
        validThrough: internship.deadline ? internship.deadline : undefined,
        employmentType: 'INTERN',
        hiringOrganization: {
            '@type': 'Organization',
            name: internship.company,
        },
        jobLocation: internship.is_international ? {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressCountry: 'Internacionalno',
            }
        } : (internship.location ? {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressLocality: internship.location,
                addressCountry: 'RS',
            }
        } : {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressCountry: 'RS',
            }
        }),
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 h-full min-h-[calc(100vh-64px)] flex flex-col pt-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
            />
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 min-h-[60vh]">
                <ClientWrapper
                    internship={internship}
                    userProfile={userProfile}
                    isLoggedIn={!!user}
                    initialIsSaved={isSaved}
                />
            </div>
        </div>
    );
}
