import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EventData, Profile, ResponseListEventTicketBuyers, ResponseListEventPlannedMatches, ResponseListCommunitiesIdsManagedByUser } from "@/types/api"
import { Calendar, Clock, DollarSign, GamepadIcon, Pencil, Users } from "lucide-react"
import { Metadata } from "next"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { getAvailableSpots } from "./utils"
import { cookies } from "next/headers"
import { Header } from "@/components/header"
import { EventImages } from "./images"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Loading from "@/components/ui/loading"
import { getDescription } from "@/lib/description"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EventDetails } from "./details"
import { formatEventDate } from "@/lib/dates"
import { formatDisplayPrice } from "@/lib/price"
import { redirect } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
	const { slug } = await params

	const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/events?slug=" + slug, {
		method: "GET",
		credentials: "include"
	})

	if (!response.ok) {
		return {
			title: process.env.NEXT_PUBLIC_WEBSITE_NAME,
			description: 'Faça amigos e jogue jogos',
		}
	}

	const event = await response.json() as EventData

	return {
		title: event.Name,
		description: getDescription(event.Description),
		openGraph: event.IconUrl ? ({
			images: [event.IconUrl],
		}) : undefined,
	}
}

function formatDuration(startDate: string, endDate: string): string {
	const start = new Date(startDate)
	const end = new Date(endDate)
	const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60))

	if (diffInMinutes < 60) {
		return `${diffInMinutes}min`
	} else {
		const hours = Math.floor(diffInMinutes / 60)
		const minutes = diffInMinutes % 60
		return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
	}
}

export default async function EventPage({ params }: { params: { slug: string } }) {
	const { slug } = await params

	const cookieStore = await cookies();

	const resEvent = await fetch(process.env.NEXT_PUBLIC_API_URL + "/events?slug=" + slug, {
		method: "GET",
		credentials: "include"
	})

	if (!resEvent.ok) {
		console.error(await resEvent.text())
		redirect("/eventos")
	}

	const event = await resEvent.json() as EventData

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

	// User managed communities

	var managedCommunities = [] as Array<number>
	if (cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/communities/managed/ids', {
			method: 'GET',
			cache: 'no-store',
			headers: {
				Cookie: cookieStore.toString()
			}
		}).catch(() => ({
			ok: false
		} as Response));

		if (res.ok) {
			const resJson = await res.json() as ResponseListCommunitiesIdsManagedByUser
			managedCommunities = resJson.Data
		} else {
			console.error(await res.text())
		}
	}

	// Account

	var account: Profile | null = null
	if (cookieStore.get(process.env.SESSION_COOKIE_NAME!)) {
		const resAccount = await fetch(process.env.NEXT_PUBLIC_API_URL + '/profiles/me', {
			method: 'GET',
			cache: 'no-store',
			headers: {
				Cookie: cookieStore.toString()
			}
		}).catch(() => ({
			ok: false
		} as Response));

		if (resAccount.ok) {
			account = await resAccount.json() as Profile
		} else {
			console.error(await resAccount.text())
		}
	}

	if (!event) {
		return <>
			<Header title="Evento" displayBackButton />

			<main className="flex-1 container mx-auto py-8 px-4 mb-10">
				<Loading />
			</main>
		</>
	}

	const {
		availableSpots,
		isFull
	} = getAvailableSpots(event, ticketBuyers)

	return (
		<>
			<Header title="Evento" displayBackButton />

			<main className="flex-1 container mx-auto p-2 mb-10">
				{managedCommunities.includes(event.Organizer.Id) && (
					<div className="flex justify-center align-center mb-5">
						<Button type="button" className="text-white" asChild>
							<Link href={"/eventos/" + event.Slug + "/editar"}>
								<Pencil className="h-4 w-4" />
								Editar evento
							</Link>
						</Button>
					</div>
				)}

				<div className="max-w-4xl mx-auto space-y-4">
					{/* Event Header */}
					<EventDetails event={event} account={account} availableSpots={availableSpots} isFull={isFull} />

					{/* Planned Matches Section */}
					{plannedMatches.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<GamepadIcon className="h-5 w-5" />
									Partidas Planejadas ({plannedMatches.length})
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{plannedMatches.map((match) => (
										<div key={match.Id} className="flex items-start gap-4 p-4 border rounded-lg">
											<div className="w-16 h-16 relative flex-shrink-0">
												<Image
													src={match.GameIconUrl || "/placeholder.svg"}
													alt={match.Name}
													fill
													className="object-cover rounded"
												/>
											</div>
											<div className="flex-1">
												<div className="flex items-start justify-between mb-2">
													<h3 className="font-semibold text-lg">{match.Name}</h3>
													<div className="flex items-center gap-2">
														{match.Price && (
															<Badge variant="outline" className="gap-1">
																<DollarSign className="h-3 w-3" />
																{formatDisplayPrice(match.Price)}
															</Badge>
														)}
														<Badge variant="secondary" className="gap-1">
															<Users className="h-3 w-3" />
															{
																match.MaxAmountOfPlayers === 1 ?
																	"Até 1 jogador" :
																	`Até ${match.MaxAmountOfPlayers} jogadores`
															}
														</Badge>
													</div>
												</div>
												<p className="text-muted-foreground mb-3">{match.Description}</p>
												<div className="flex items-center gap-4 text-sm text-muted-foreground">
													<div className="flex items-center gap-1">
														<Calendar className="h-4 w-4" />
														{match.StartDate ? formatEventDate(match.StartDate) : "Sem horário definido"}
													</div>
													{
														match.StartDate && match.EndDate && (
															<div className="flex items-center gap-1">
																<Clock className="h-4 w-4" />
																{formatDuration(match.StartDate, match.EndDate)}
															</div>
														)
													}
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Confirmations Section */}
					<Card>
						<CardHeader>
							<CardTitle>
								Participantes Confirmados
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{ticketBuyers.map((person) => (
									<div key={person.Profile.AccountId} className="flex items-center gap-2 border rounded-full px-3 py-1">
										<Avatar className="w-6 h-6">
											<AvatarImage src={person.Profile.AvatarUrl || "/placeholder.svg"} alt={person.Profile.Handle} />
											<AvatarFallback className="text-xs">{person.Profile.Handle.substring(0, 2).toUpperCase()}</AvatarFallback>
										</Avatar>
										<span className="text-sm">{person.Profile.Handle}</span>
										{
											person.AmountOfTickets > 1 && (
												<Badge variant="secondary" className="text-xs ml-1">
													x{person.AmountOfTickets}
												</Badge>
											)
										}
									</div>
								))}

								{ticketBuyers.length === 0 && (
									<p className="text-sm text-muted-foreground">Nenhuma confirmação ainda</p>
								)}
							</div>
						</CardContent>
					</Card>

					<EventImages event={event} />

					{/* Comments Section */}
					{/* <CommentsSection /> */}
				</div>
			</main>
		</>
	)
}