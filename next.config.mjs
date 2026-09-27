/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    poweredByHeader: false,
    compress: true,

    // 2. Keep your existing image configuration with AVIF/WebP optimization
    images: {
        formats: ['image/avif', 'image/webp'],
        qualities: [70, 75, 80, 85, 90],
        minimumCacheTTL: 31536000,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "media.gyanaangan.in",
            },
            {
                protocol: "https",
                hostname: "gyanaangan.in",
            },
        ],
    },

    async headers() {
        return [
            {
                source: '/svg/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/images/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/favicon.ico',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;