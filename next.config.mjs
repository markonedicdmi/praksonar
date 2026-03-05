/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/internships/:path+',
                destination: '/internships',
                permanent: false,
            },
        ];
    },
};

export default nextConfig;
