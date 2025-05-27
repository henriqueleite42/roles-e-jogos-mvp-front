import { cookies } from 'next/headers';
import GalleryPage from "./content"
import { Auth } from '@/types/api';

export const metadata = {
	title: "Galeria",
	description: "As fotos da nossa comunidade",
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