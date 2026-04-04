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
        ],
    },
    serverExternalPackages: ['mjml'],
    experimental: {
        serverActions: {
            bodySizeLimit: '20MB',
        },
    },
    output: 'standalone',
};

export default nextConfig;
