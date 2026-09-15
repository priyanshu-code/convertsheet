/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /@duckdb\/duckdb-wasm/ },
    ];
    return config;
  },
};

export default nextConfig;
