import { redirect } from 'next/navigation'

export default async function TikTok() {
	redirect(process.env.NEXT_PUBLIC_TIKTOK_URL!)
}
