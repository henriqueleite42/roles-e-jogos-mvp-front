import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

const APP_DIR = path.join(process.cwd(), 'app')

export function getStaticRoutes(dir = APP_DIR, segments: string[] = []): string[] {
	const entries = fs.readdirSync(dir, { withFileTypes: true })
	let routes: string[] = []

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)

		if (entry.isDirectory()) {
			// Remove route groups by skipping the folder name
			const isRouteGroup = entry.name.startsWith('(')
			const isDynamicSegment = entry.name.startsWith('[')

			const segment = isRouteGroup || isDynamicSegment ? '' : entry.name
			routes = routes.concat(
				getStaticRoutes(fullPath, [...segments, segment])
			)
		}

		if (entry.name === 'page.tsx' || entry.name === 'page.js') {
			const fullRoute = '/' + segments.filter(Boolean).join('/')
			const cleanRoute = fullRoute.replace(/\/index$/, '') || '/'
			routes.push(cleanRoute)
		}
	}

	return Array.from(new Set(routes))
}

export async function GET() {
	const paths = getStaticRoutes()

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
			.map(
				(path) => `
  <url>
    <loc>${process.env.NEXT_PUBLIC_WEBSITE_URL}${path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`
			)
			.join('')}
</urlset>`

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
		},
	})
}
