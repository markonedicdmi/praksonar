import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        // WWW (landing/frontend) pages
        { url: 'https://www.praksonar.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: 'https://www.praksonar.com/o-meni', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: 'https://www.praksonar.com/politika-privatnosti', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: 'https://www.praksonar.com/cv-writer', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: 'https://www.praksonar.com/auth/login', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: 'https://www.praksonar.com/auth/register', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        // APP pages
        { url: 'https://app.praksonar.com/internships', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ]
}
