
import Script from 'next/script'

export function GoogleAnalytics() {
	if (process.env.NODE_ENV !== "production") {
		return <></>
	}

	return (
		<>
			<Script
				async
				src={"https://www.googletagmanager.com/gtag/js?id=" + process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}
				strategy="afterInteractive"
			/>
			<Script>
				{`
				window.dataLayer = window.dataLayer || [];
				function gtag(){dataLayer.push(arguments);}
				gtag('js', new Date());
				gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
			`}
			</Script>
		</>
	)
}