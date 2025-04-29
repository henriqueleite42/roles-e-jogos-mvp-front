import pwa from 'next-pwa'

const withPWA = pwa({
	dest: 'public', // Destination directory for the PWA files
	register: true, // Register the service worker
	skipWaiting: true, // Skip waiting for the new service worker to activate
	disable: process.env.NODE_ENV === 'development', // Disable PWA in development mode
	// Other optional configurations:
	// swSrc: './public/service-worker.js', // Custom service worker path
	// runtimeCaching: [], // Define runtime caching strategies
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
	experimental: {
		webpackBuildWorker: true,
		parallelServerBuildTraces: true,
		parallelServerCompiles: true,
	},
}

export default withPWA(nextConfig);
