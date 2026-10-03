const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/secretSanta';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: basePath === '/' ? '' : basePath,
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath === '/' ? '' : basePath,
  },
  async redirects() {
    if (!basePath || basePath === '/') return [];
    return [
      {
        source: '/',
        destination: basePath,
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
