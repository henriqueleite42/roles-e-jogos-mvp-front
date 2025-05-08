import { cookies } from 'next/headers';

import { Profile } from "@/types/api"
import { LoggedView } from './logged-view';
import SignInPage from './unlogged-view';

export default async function ContaPage() {
	const cookieStore = await cookies();

	if (!cookieStore.get("session")) {
		return <SignInPage />
	}

	const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/profile/me', {
		method: 'GET',
		headers: {
			Cookie: cookieStore.toString()
		},
		next: { revalidate: 1 },
	}).catch(() => ({
		ok: false
	} as Response));

	if (res.ok) {
		const profile: Profile = await res.json();
		return (
			<LoggedView profile={profile} />
		)
	} else {
		return <SignInPage />
	}
}
