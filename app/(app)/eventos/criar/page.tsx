import { ResponseListCommunitiesManagedByUser } from "@/types/api";
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

	const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/communities/managed', {
		method: 'GET',
		cache: 'no-store',
		headers: {
			Cookie: cookieStore.toString()
		}
	}).catch(() => ({
		ok: false
	} as Response));

	if (!res.ok) {
		console.error(await res.text())
		redirect("/eventos")
	}

	const resJson = await res.json() as ResponseListCommunitiesManagedByUser

	if (resJson.Data.length === 0) {
		console.error(await res.text())
		redirect("/eventos")
	}

	return <FormCreateEvent communities={resJson.Data} />
}
