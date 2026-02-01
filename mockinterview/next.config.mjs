/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    webpack: (config, { isServer }) => {
        if (isServer) {
            // Externalize canvas and other optional dependencies for server-side
            config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
        }
        
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
                canvas: false,
            };
        }
        
        // Ignore optional dependencies warnings
        config.ignoreWarnings = [
            { module: /node_modules\/canvas/ },
            { module: /node_modules\/jsdom/ },
        ];
        
        return config;
    },
};

export default nextConfig;
