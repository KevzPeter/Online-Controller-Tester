/** @type {import('next').NextConfig} */
const nextConfig = {
    // Keep the repository's contributor guide under manual control.
    agentRules: false,
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack'],
        })
        return config
    },
};

export default nextConfig;
