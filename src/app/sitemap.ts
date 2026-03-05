import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: 'https://praksonar.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: 'https://praksonar.com/internships', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: 'https://praksonar.com/cv-writer', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: 'https://praksonar.com/o-autoru', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: 'https://praksonar.com/auth/login', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: 'https://praksonar.com/auth/register', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ]
}
