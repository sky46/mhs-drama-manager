/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, context) => {
        // File polling for hot reloading, dev only
        config.watchOptions = {
            poll: 500,
            aggregateTimeout: 300
          }
        return config
    }
};

export default nextConfig;
