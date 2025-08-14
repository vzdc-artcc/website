import config from './package.json' with {type: 'json'};
import {NextConfig} from "next";

const nextConfig: NextConfig = {
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
    publicRuntimeConfig: {
        version: config.version,
        author: config.author,
    },
};

export default nextConfig;
