import { redirect } from 'next/navigation'

export default async function Instagram() {
	redirect(process.env.NEXT_PUBLIC_INSTAGRAM_URL!)
}
