import {NextConfig} from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'utfs.io',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'api.vzdc.org',
                port: '',
                pathname: '/cdn/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3900',
                pathname: '/cdn/**',
            },
        ],
    },
    serverExternalPackages: ['mjml'],
    experimental: {
        serverActions: {
            bodySizeLimit: '20MB',
        },
    },
    output: 'standalone',
    allowedDevOrigins: ['sniff-tapering-glowing.ngrok-free.dev'],
    async redirects() {
        return [
            {
                source: '/web-system',
                destination: '/website-management/overview',
                permanent: true,
            },
            {
                source: '/web-system/overview',
                destination: '/website-management/overview',
                permanent: true,
            },
            {
                source: '/web-system/discord-configs',
                destination: '/website-management/discord',
                permanent: true,
            },
            {
                source: '/web-system/discord-configs/discord-config/:id',
                destination: '/website-management/discord/config/:id',
                permanent: true,
            },
            {
                source: '/web-system/discord-configs/channel/new',
                destination: '/website-management/discord/channel/new',
                permanent: true,
            },
            {
                source: '/web-system/discord-configs/channel/:id',
                destination: '/website-management/discord/channel/:id',
                permanent: true,
            },
            {
                source: '/web-system/discord-configs/role/new',
                destination: '/website-management/discord/role/new',
                permanent: true,
            },
            {
                source: '/web-system/discord-configs/role/:id',
                destination: '/website-management/discord/role/:id',
                permanent: true,
            },
            {
                source: '/web-system/discord-configs/category/new',
                destination: '/website-management/discord/category/new',
                permanent: true,
            },
            {
                source: '/web-system/discord-configs/category/:id',
                destination: '/website-management/discord/category/:id',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
