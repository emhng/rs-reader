/** @type {import('next').NextConfig} */
const devMode = {
	reactStrictMode: true,
	swcMinify: true
};

const nextConfig = {
	basePath: '/rs-reader',
	assetPrefix: '/rs-reader'
};

module.exports = nextConfig;
