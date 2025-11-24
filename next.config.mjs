/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;
