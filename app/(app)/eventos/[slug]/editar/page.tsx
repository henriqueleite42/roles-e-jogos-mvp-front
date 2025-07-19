import { EventData, Profile, ResponseListEventAttendances, ResponseListEventGames } from "@/types/api"
import { cookies } from "next/headers"
import { Header } from "@/components/header"
import { redirect } from "next/navigation";
import EditEventPage from "./content";

export default async function Page({ params }: { params: { slug: string } }) {
	const { slug } = await params

	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/eventos")
	}

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
		redirect("/eventos")
	}

	const account = await resAccount.json() as Profile

	const resEvent = await fetch(process.env.NEXT_PUBLIC_API_URL + "/events?slug=" + slug, {
		method: "GET",
		credentials: "include"
	})

	if (!resEvent.ok) {
		console.error(await resEvent.text())
		redirect("/eventos")
	}

	const event = await resEvent.json() as EventData

	if (!event) {
		redirect("/eventos")
	}

	if (event.OwnerId !== account.AccountId) {
		redirect("/eventos")
	}

	const resEventAttendances = await fetch(process.env.NEXT_PUBLIC_API_URL + "/events/attendances?limit=100&eventId=" + event.Id, {
		method: "GET",
		credentials: "include"
	})

	if (!resEventAttendances.ok) {
		console.error(await resEventAttendances.text())
		return (<></>)
	}

	const attendances = await resEventAttendances.json() as ResponseListEventAttendances

	const resEventGames = await fetch(process.env.NEXT_PUBLIC_API_URL + "/events/games?limit=100&eventId=" + event.Id, {
		method: "GET",
		credentials: "include"
	})

	if (!resEventGames.ok) {
		console.error(await resEventGames.text())
		return (<></>)
	}

	const games = await resEventGames.json() as ResponseListEventGames

	return (
		<>
			<Header title="Evento" displayBackButton />

			<EditEventPage event={event} attendances={attendances} games={games} />
		</>
	)
}