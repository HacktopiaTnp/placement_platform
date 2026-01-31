/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Exclude pg and related packages from client-side bundle
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                url: false,
                zlib: false,
                http: false,
                https: false,
                assert: false,
                os: false,
                path: false,
                dns: false,
            };
        }
        return config;
    },
};

export default nextConfig;
