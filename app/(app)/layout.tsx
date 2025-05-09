import type { Metadata } from 'next'
import { Calendar, Dice6, Home, Plus, User } from 'lucide-react'
import Link from "next/link"

import '../globals.css'
import QueryProvider from '@/components/query-provider'

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

				<link rel="icon" href="/favicon.ico" sizes="any" />
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

				<meta
					name='viewport'
					content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
				/>
			</head>
			<body className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-white">
				<header className="p-4 border-b bg-gradient-to-r from-orange-500 to-orange-400">
					<h1 className="text-2xl font-bold text-center text-white">Rolês & Jogos</h1>
				</header>

				<QueryProvider>{children}</QueryProvider>

				<nav className="border-t bg-white py-2 px-4 sticky bottom-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
					<div className="flex items-center justify-between max-w-md mx-auto">
						<Link href="/home" className="flex flex-col items-center p-2 text-orange-800">
							<Home className="h-6 w-6" />
							<span className="text-xs mt-1">Home</span>
						</Link>

						<Link href="/jogos" className="flex flex-col items-center p-2 text-orange-800">
							<Dice6 className="h-6 w-6" />
							<span className="text-xs mt-1">Jogos</span>
						</Link>

						<Link href="/adicionar-partida" className="flex flex-col items-center p-2 relative">
							<div className="absolute -top-5 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 p-3 shadow-lg">
								<Plus className="h-6 w-6 text-white" />
							</div>
							<span className="text-xs mt-7 font-medium text-orange-500">Adicionar Partida</span>
						</Link>

						<Link href="/eventos" className="flex flex-col items-center p-2 text-orange-800">
							<Calendar className="h-6 w-6" />
							<span className="text-xs mt-1">Eventos</span>
						</Link>

						<Link href="/conta" className="flex flex-col items-center p-2 text-orange-800">
							<User className="h-6 w-6" />
							<span className="text-xs mt-1">Conta</span>
						</Link>
					</div>
				</nav>
			</body>
		</html>
	)
}
