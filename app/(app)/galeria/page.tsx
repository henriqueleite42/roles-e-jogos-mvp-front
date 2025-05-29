import { cookies } from 'next/headers';
import GalleryPage from "./content"
import { Auth } from '@/types/api';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Galeria",
		description: 'Veja as fotos da nossa comunidade',
		openGraph: {
			images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/nosso-grupo.jpg"],
		},
	}
}

export default async function Page() {
	const cookieStore = await cookies();

	var auth: Auth | undefined = undefined
	if (cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/me', {
			method: 'GET',
			headers: {
				Cookie: cookieStore.toString()
			},
			cache: 'no-store',
		}).catch(() => ({
			ok: false
		} as Response));


		if (res.ok) {
			const body = await res.text()
			auth = JSON.parse(body) as Auth;
		}
	}

	return <GalleryPage auth={auth} />
}