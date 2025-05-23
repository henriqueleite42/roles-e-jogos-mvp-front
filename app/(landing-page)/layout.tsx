import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
	title: process.env.NEXT_PUBLIC_WEBSITE_NAME,
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
				<meta name="application-name" content={process.env.NEXT_PUBLIC_WEBSITE_NAME} />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content={process.env.NEXT_PUBLIC_WEBSITE_NAME} />
				<meta name="description" content="Faça amigos e jogue jogos" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="msapplication-TileColor" content="#b73d2f" />
				<meta name="msapplication-tap-highlight" content="no" />
				<meta name="theme-color" content="#b73d2f" />

				<link rel="icon" href="/icons/favicon.ico" sizes="any" />

				<link rel="icon" type="image/png" sizes="71x71" href="/icons/windows11/SmallTile.scale-100.png" />
				<link rel="icon" type="image/png" sizes="89x89" href="/icons/windows11/SmallTile.scale-125.png" />
				<link rel="icon" type="image/png" sizes="107x107" href="/icons/windows11/SmallTile.scale-150.png" />
				<link rel="icon" type="image/png" sizes="142x142" href="/icons/windows11/SmallTile.scale-200.png" />
				<link rel="icon" type="image/png" sizes="284x284" href="/icons/windows11/SmallTile.scale-400.png" />
				<link rel="icon" type="image/png" sizes="150x150" href="/icons/windows11/Square150x150Logo.scale-100.png" />
				<link rel="icon" type="image/png" sizes="188x188" href="/icons/windows11/Square150x150Logo.scale-125.png" />
				<link rel="icon" type="image/png" sizes="225x225" href="/icons/windows11/Square150x150Logo.scale-150.png" />
				<link rel="icon" type="image/png" sizes="300x300" href="/icons/windows11/Square150x150Logo.scale-200.png" />
				<link rel="icon" type="image/png" sizes="600x600" href="/icons/windows11/Square150x150Logo.scale-400.png" />
				<link rel="icon" type="image/png" sizes="310x150" href="/icons/windows11/Wide310x150Logo.scale-100.png" />
				<link rel="icon" type="image/png" sizes="388x188" href="/icons/windows11/Wide310x150Logo.scale-125.png" />
				<link rel="icon" type="image/png" sizes="465x225" href="/icons/windows11/Wide310x150Logo.scale-150.png" />
				<link rel="icon" type="image/png" sizes="620x300" href="/icons/windows11/Wide310x150Logo.scale-200.png" />
				<link rel="icon" type="image/png" sizes="1240x600" href="/icons/windows11/Wide310x150Logo.scale-400.png" />
				<link rel="icon" type="image/png" sizes="310x310" href="/icons/windows11/LargeTile.scale-100.png" />
				<link rel="icon" type="image/png" sizes="388x388" href="/icons/windows11/LargeTile.scale-125.png" />
				<link rel="icon" type="image/png" sizes="465x465" href="/icons/windows11/LargeTile.scale-150.png" />
				<link rel="icon" type="image/png" sizes="620x620" href="/icons/windows11/LargeTile.scale-200.png" />
				<link rel="icon" type="image/png" sizes="1240x1240" href="/icons/windows11/LargeTile.scale-400.png" />
				<link rel="icon" type="image/png" sizes="44x44" href="/icons/windows11/Square44x44Logo.scale-100.png" />
				<link rel="icon" type="image/png" sizes="55x55" href="/icons/windows11/Square44x44Logo.scale-125.png" />
				<link rel="icon" type="image/png" sizes="66x66" href="/icons/windows11/Square44x44Logo.scale-150.png" />
				<link rel="icon" type="image/png" sizes="88x88" href="/icons/windows11/Square44x44Logo.scale-200.png" />
				<link rel="icon" type="image/png" sizes="176x176" href="/icons/windows11/Square44x44Logo.scale-400.png" />
				<link rel="icon" type="image/png" sizes="50x50" href="/icons/windows11/StoreLogo.scale-100.png" />
				<link rel="icon" type="image/png" sizes="63x63" href="/icons/windows11/StoreLogo.scale-125.png" />
				<link rel="icon" type="image/png" sizes="75x75" href="/icons/windows11/StoreLogo.scale-150.png" />
				<link rel="icon" type="image/png" sizes="100x100" href="/icons/windows11/StoreLogo.scale-200.png" />
				<link rel="icon" type="image/png" sizes="200x200" href="/icons/windows11/StoreLogo.scale-400.png" />
				<link rel="icon" type="image/png" sizes="620x300" href="/icons/windows11/SplashScreen.scale-100.png" />
				<link rel="icon" type="image/png" sizes="775x375" href="/icons/windows11/SplashScreen.scale-125.png" />
				<link rel="icon" type="image/png" sizes="930x450" href="/icons/windows11/SplashScreen.scale-150.png" />
				<link rel="icon" type="image/png" sizes="1240x600" href="/icons/windows11/SplashScreen.scale-200.png" />
				<link rel="icon" type="image/png" sizes="2480x1200" href="/icons/windows11/SplashScreen.scale-400.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/icons/windows11/Square44x44Logo.targetsize-16.png" />
				<link rel="icon" type="image/png" sizes="20x20" href="/icons/windows11/Square44x44Logo.targetsize-20.png" />
				<link rel="icon" type="image/png" sizes="24x24" href="/icons/windows11/Square44x44Logo.targetsize-24.png" />
				<link rel="icon" type="image/png" sizes="30x30" href="/icons/windows11/Square44x44Logo.targetsize-30.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/icons/windows11/Square44x44Logo.targetsize-32.png" />
				<link rel="icon" type="image/png" sizes="36x36" href="/icons/windows11/Square44x44Logo.targetsize-36.png" />
				<link rel="icon" type="image/png" sizes="40x40" href="/icons/windows11/Square44x44Logo.targetsize-40.png" />
				<link rel="icon" type="image/png" sizes="44x44" href="/icons/windows11/Square44x44Logo.targetsize-44.png" />
				<link rel="icon" type="image/png" sizes="48x48" href="/icons/windows11/Square44x44Logo.targetsize-48.png" />
				<link rel="icon" type="image/png" sizes="60x60" href="/icons/windows11/Square44x44Logo.targetsize-60.png" />
				<link rel="icon" type="image/png" sizes="64x64" href="/icons/windows11/Square44x44Logo.targetsize-64.png" />
				<link rel="icon" type="image/png" sizes="72x72" href="/icons/windows11/Square44x44Logo.targetsize-72.png" />
				<link rel="icon" type="image/png" sizes="80x80" href="/icons/windows11/Square44x44Logo.targetsize-80.png" />
				<link rel="icon" type="image/png" sizes="96x96" href="/icons/windows11/Square44x44Logo.targetsize-96.png" />
				<link rel="icon" type="image/png" sizes="256x256" href="/icons/windows11/Square44x44Logo.targetsize-256.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-16.png" />
				<link rel="icon" type="image/png" sizes="20x20" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-20.png" />
				<link rel="icon" type="image/png" sizes="24x24" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-24.png" />
				<link rel="icon" type="image/png" sizes="30x30" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-30.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-32.png" />
				<link rel="icon" type="image/png" sizes="36x36" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-36.png" />
				<link rel="icon" type="image/png" sizes="40x40" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-40.png" />
				<link rel="icon" type="image/png" sizes="44x44" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-44.png" />
				<link rel="icon" type="image/png" sizes="48x48" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-48.png" />
				<link rel="icon" type="image/png" sizes="60x60" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-60.png" />
				<link rel="icon" type="image/png" sizes="64x64" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-64.png" />
				<link rel="icon" type="image/png" sizes="72x72" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-72.png" />
				<link rel="icon" type="image/png" sizes="80x80" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-80.png" />
				<link rel="icon" type="image/png" sizes="96x96" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-96.png" />
				<link rel="icon" type="image/png" sizes="256x256" href="/icons/windows11/Square44x44Logo.altform-unplated_targetsize-256.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-16.png" />
				<link rel="icon" type="image/png" sizes="20x20" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-20.png" />
				<link rel="icon" type="image/png" sizes="24x24" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-24.png" />
				<link rel="icon" type="image/png" sizes="30x30" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-30.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-32.png" />
				<link rel="icon" type="image/png" sizes="36x36" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-36.png" />
				<link rel="icon" type="image/png" sizes="40x40" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-40.png" />
				<link rel="icon" type="image/png" sizes="44x44" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-44.png" />
				<link rel="icon" type="image/png" sizes="48x48" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-48.png" />
				<link rel="icon" type="image/png" sizes="60x60" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-60.png" />
				<link rel="icon" type="image/png" sizes="64x64" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-64.png" />
				<link rel="icon" type="image/png" sizes="72x72" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-72.png" />
				<link rel="icon" type="image/png" sizes="80x80" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-80.png" />
				<link rel="icon" type="image/png" sizes="96x96" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-96.png" />
				<link rel="icon" type="image/png" sizes="256x256" href="/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-256.png" />
				<link rel="icon" type="image/png" sizes="512x512" href="/icons/android/android-launchericon-512-512.png" />
				<link rel="icon" type="image/png" sizes="192x192" href="/icons/android/android-launchericon-192-192.png" />
				<link rel="icon" type="image/png" sizes="144x144" href="/icons/android/android-launchericon-144-144.png" />
				<link rel="icon" type="image/png" sizes="96x96" href="/icons/android/android-launchericon-96-96.png" />
				<link rel="icon" type="image/png" sizes="72x72" href="/icons/android/android-launchericon-72-72.png" />
				<link rel="icon" type="image/png" sizes="48x48" href="/icons/android/android-launchericon-48-48.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/icons/ios/16.png" />
				<link rel="icon" type="image/png" sizes="20x20" href="/icons/ios/20.png" />
				<link rel="icon" type="image/png" sizes="29x29" href="/icons/ios/29.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/icons/ios/32.png" />
				<link rel="icon" type="image/png" sizes="40x40" href="/icons/ios/40.png" />
				<link rel="icon" type="image/png" sizes="50x50" href="/icons/ios/50.png" />
				<link rel="icon" type="image/png" sizes="57x57" href="/icons/ios/57.png" />
				<link rel="icon" type="image/png" sizes="58x58" href="/icons/ios/58.png" />
				<link rel="icon" type="image/png" sizes="60x60" href="/icons/ios/60.png" />
				<link rel="icon" type="image/png" sizes="64x64" href="/icons/ios/64.png" />
				<link rel="icon" type="image/png" sizes="72x72" href="/icons/ios/72.png" />
				<link rel="icon" type="image/png" sizes="76x76" href="/icons/ios/76.png" />
				<link rel="icon" type="image/png" sizes="80x80" href="/icons/ios/80.png" />
				<link rel="icon" type="image/png" sizes="87x87" href="/icons/ios/87.png" />
				<link rel="icon" type="image/png" sizes="100x100" href="/icons/ios/100.png" />
				<link rel="icon" type="image/png" sizes="114x114" href="/icons/ios/114.png" />
				<link rel="icon" type="image/png" sizes="120x120" href="/icons/ios/120.png" />
				<link rel="icon" type="image/png" sizes="128x128" href="/icons/ios/128.png" />
				<link rel="icon" type="image/png" sizes="144x144" href="/icons/ios/144.png" />
				<link rel="icon" type="image/png" sizes="152x152" href="/icons/ios/152.png" />
				<link rel="icon" type="image/png" sizes="167x167" href="/icons/ios/167.png" />
				<link rel="apple-touch-icon" type="image/png" sizes="180x180" href="/icons/ios/180.png" />
				<link rel="icon" type="image/png" sizes="192x192" href="/icons/ios/192.png" />
				<link rel="icon" type="image/png" sizes="256x256" href="/icons/ios/256.png" />
				<link rel="icon" type="image/png" sizes="512x512" href="/icons/ios/512.png" />
				<link rel="icon" type="image/png" sizes="1024x1024" href="/icons/ios/1024.png" />
				<link rel="manifest" href="/manifest.json" />
				<link rel="shortcut icon" href="/icons/favicon.ico" />
				<meta property="og:type" content="website" />

				<link rel="canonical" href="https://rolesejogos.com.br" />
				<meta property="og:title" content={process.env.NEXT_PUBLIC_WEBSITE_NAME} />
				<meta property="og:description" content="Faça amigos e jogue jogos" />
				<meta property="og:site_name" content={process.env.NEXT_PUBLIC_WEBSITE_NAME} />
				<meta property="og:url" content="https://rolesejogos.com.br" />
				<meta property="og:image" content="https://rolesejogos.com.br/icons/favicon.ico" />

				<meta
					name='viewport'
					content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
				/>
			</head>
			<body>{children}</body>
		</html>
	)
}
