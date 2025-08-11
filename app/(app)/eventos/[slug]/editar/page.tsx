import { EventData, Profile, ResponseListEventTicketBuyers, ResponseListEventPlannedMatches, ResponseListCommunitiesManagedByUser } from "@/types/api"
import { cookies } from "next/headers"
import { Header } from "@/components/header"
import { redirect } from "next/navigation";
import Content from "./content";
import { getAvailableSpots } from "../utils";

export default async function Page({ params }: { params: { slug: string } }) {
	const { slug } = await params

	const cookieStore = await cookies();

	if (!cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		redirect("/conta")
	}

	// Event

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

	const managedCommunities = await resManagedCommunities.json() as ResponseListCommunitiesManagedByUser

	// Ticket Buyers

	const resEventTicketBuyers = await fetch(process.env.NEXT_PUBLIC_API_URL + "/events/tickets/buyers?limit=100&eventId=" + event.Id, {
		method: "GET",
		credentials: "include"
	})

	if (!resEventTicketBuyers.ok) {
		console.error(await resEventTicketBuyers.text())
		return (<></>)
	}

	const ticketBuyersRes = await resEventTicketBuyers.json() as ResponseListEventTicketBuyers
	const ticketBuyers = ticketBuyersRes.Data

	// Planned Matches

	const resEventPlannedMatches = await fetch(process.env.NEXT_PUBLIC_API_URL + "/events/planned-matches?limit=100&eventId=" + event.Id, {
		method: "GET",
		credentials: "include"
	})

	if (!resEventPlannedMatches.ok) {
		console.error(await resEventPlannedMatches.text())
		return (<></>)
	}

	const plannedMatchesRes = await resEventPlannedMatches.json() as ResponseListEventPlannedMatches
	const plannedMatches = plannedMatchesRes.Data

	const { confirmationsCount } = getAvailableSpots(event, ticketBuyers)

	return (
		<>
			<Header title="Evento" displayBackButton />

			<Content
				account={account}
				event={event}
				plannedMatches={plannedMatches}
				confirmationsCount={confirmationsCount}
				communities={managedCommunities.Data}
			/>
		</>
	)
}