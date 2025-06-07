import { cookies } from 'next/headers';

import SignInPage from './unlogged-view';
import { redirect } from 'next/navigation';
import { Profile } from '@/types/api';

export const metadata = {
	title: "Conta",
	description: "Acesse sua conta",
}

export default async function ContaPage() {
	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		return <SignInPage />
	}

	const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/profiles/me', {
		method: 'GET',
		headers: {
			Cookie: cookieStore.toString()
		},
		cache: 'no-store',
	}).catch(() => ({
		ok: false
	} as Response));

	if (!res.ok) {
		return <SignInPage />
	}

	const profile = await res.json() as Profile

	redirect("/p/" + profile.Handle)
}
