import { redirect } from 'next/navigation'

export const metadata = {
	title: "Instagram",
	description: "Conheça o Instagram da nossa comunidade",
}

export default async function Instagram() {
	redirect(process.env.NEXT_PUBLIC_INSTAGRAM_URL!)
}
