import { redirect } from 'next/navigation'

export const metadata = {
	title: "TikTok",
	description: "Conheça o TikTok da nossa comunidade",
}

export default async function TikTok() {
	redirect(process.env.NEXT_PUBLIC_TIKTOK_URL!)
}
