/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },

    // 2. Keep your existing image configuration
    images: {
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

    // output: 'standalone',
};

export default nextConfig;