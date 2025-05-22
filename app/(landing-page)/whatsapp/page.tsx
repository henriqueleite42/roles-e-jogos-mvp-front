import { redirect } from 'next/navigation'

export const metadata = {
	title: "Whatsapp",
	description: "Conheça o Whatsapp da nossa comunidade",
}

export default async function Whatsapp() {
	redirect(process.env.NEXT_PUBLIC_WHATSAPP_URL!)
}
