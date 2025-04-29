import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
	title: 'Rolês & Jogos',
	description: 'Faça amigos e jogue jogos',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" sizes="any" />

				<meta name="application-name" content="Rolês & Jogos" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Rolês & Jogos" />
				<meta name="description" content="Faça amigos e jogue jogos" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="msapplication-TileColor" content="#000000" />
				<meta name="msapplication-tap-highlight" content="no" />
				<meta name="theme-color" content="#000000" />

				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />

				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
				<link rel="manifest" href="/manifest.json" />
				<link rel="shortcut icon" href="/favicon.ico" />
				<meta property="og:type" content="website" />

				<meta property="og:title" content="Rolês & Jogos" />
				<meta property="og:description" content="Faça amigos e jogue jogos" />
				<meta property="og:site_name" content="Rolês & Jogos" />
				<meta property="og:url" content="https://roles-e-jogos-mvp-front.vercel.app" />
				<meta property="og:image" content="https://roles-e-jogos-mvp-front.vercel.app/favicon.png" />
			</head>
			<body>{children}</body>
		</html>
	)
}
