import { redirect } from 'next/navigation'

export default async function Whatsapp() {
	redirect(process.env.NEXT_PUBLIC_WHATSAPP_URL!)
}
