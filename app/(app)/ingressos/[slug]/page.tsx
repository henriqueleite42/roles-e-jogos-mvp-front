import { EventData, Profile } from "@/types/api"
import { cookies } from "next/headers"
import { Header } from "@/components/header"
import { redirect } from "next/navigation";
import Content from "./content";

export default async function Page({ params }: { params: { slug: string } }) {
	const { slug } = await params

	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/ingressos")
	}

	// Account

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
		console.error(await resAccount.text())
		redirect("/ingressos")
	}

	const account = await resAccount.json() as Profile

	// Event

	const resEvent = await fetch(process.env.NEXT_PUBLIC_API_URL + "/events?slug=" + slug, {
		method: "GET",
		credentials: "include"
	})

	if (!resEvent.ok) {
		console.error(await resEvent.text())
		redirect("/ingressos")
	}

	const event = await resEvent.json() as EventData

	if (!event) {
		redirect("/eventos")
	}

	return (
		<>
			<Header title="Ingressos" displayBackButton />

			<Content account={account} event={event} />
		</>
	)
}