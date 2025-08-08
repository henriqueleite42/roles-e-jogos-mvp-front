import { Profile, ResponseListCommunitiesManagedByUser } from "@/types/api";
import { FormCreateEvent } from "./form";
import { cookies } from "next/headers"
import { redirect } from 'next/navigation';

export const metadata = {
	title: "Criar Evento",
	description: "Crie um evento e compartilhe-o com a comunidade!",
}

export default async function CreateEventPage() {
	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/conta")
	}

	// Managed Communities


	const resAccount = await fetch(process.env.NEXT_PUBLIC_API_URL + '/profiles/me', {
		method: 'GET',
		cache: 'no-store',
		headers: {
			Cookie: cookieStore.toString()
		}
	}).catch(() => ({
		ok: false
	} as Response));

	if (!resAccount.ok) {
		redirect("/conta")
	}

	const account = await resAccount.json() as Profile

	// Managed Communities

	const resManagedCommunities = await fetch(process.env.NEXT_PUBLIC_API_URL + '/communities/managed', {
		method: 'GET',
		cache: 'no-store',
		headers: {
			Cookie: cookieStore.toString()
		}
	}).catch(() => ({
		ok: false
	} as Response));

	if (!resManagedCommunities.ok) {
		console.error(await resManagedCommunities.text())
		redirect("/eventos")
	}

	const resJson = await resManagedCommunities.json() as ResponseListCommunitiesManagedByUser

	return <FormCreateEvent communities={resJson.Data} account={account} />
}
