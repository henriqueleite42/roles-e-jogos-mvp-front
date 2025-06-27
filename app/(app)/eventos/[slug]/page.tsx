import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Event, EventAttendanceData, Profile, ResponseListEventAttendances, ResponseListEventGames } from "@/types/api"
import { MapPin, Pencil, Users } from "lucide-react"
import { Metadata } from "next"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Attendances } from "./attendances"
import { getAvailableSpots } from "./utils"
import { ShareButton } from "./share"
import { cookies } from "next/headers"
import { Dates } from "./dates"
import { Header } from "@/components/header"
import { EventImages } from "./images"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Loading from "@/components/ui/loading"
import { getDescription } from "@/lib/description"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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

	const event = await response.json() as Event

	return {
		title: event.Name,
		description: getDescription(event.Description),
		openGraph: event.IconUrl ? ({
			images: [event.IconUrl],
		}) : undefined,
	}
}

const getAvailableCapacity = (event: Event, attendances: Array<EventAttendanceData>) => {
	const { availableSpots, isFull } = getAvailableSpots(event, attendances)

	if (!event.Capacity) {
		return (
			<span className="text-green-600 font-medium">
				Sem limite de vagas!
			</span>
		)
	}

	if (isFull) {
		return (
			<span className="text-red-600 font-medium">
				Evento lotado
			</span>
		)
	}

	return (
		<span className="text-yellow-600 font-medium">
			{`${availableSpots} vagas disponíveis`}
		</span>
	)
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
		return (<></>)
	}

	const event = await resEvent.json() as Event

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

	const { confirmations, maybes, notGoing, confirmationsCount } = getAvailableSpots(event, attendances.Data)

	return (
		<>
			<Header title="Evento" displayBackButton />

			<main className="flex-1 container mx-auto py-8 px-4 mb-10">
				{event.OwnerId === account?.AccountId && (
					<div className="flex justify-center align-center mb-5">
						<Button type="button" className="text-white" asChild>
							<Link href={"/eventos/" + event.Slug + "/editar"}>
								<Pencil className="h-4 w-4" />
								Editar evento
							</Link>
						</Button>
					</div>
				)}

				<div className="max-w-4xl mx-auto space-y-6">
					{/* Event Header */}
					<Card className="overflow-hidden">
						{event.IconUrl && (
							<div className="h-64 relative">
								<Image src={event.IconUrl || "/placeholder.svg"} alt={event.Name} fill className="object-cover" />
							</div>
						)}
						<CardContent className="p-6">
							<div className="flex justify-between items-start mb-4">
								<h1 className="text-3xl font-bold">{event.Name}</h1>
								<ShareButton event={event} />
							</div>
							<p className="text-lg mb-6 whitespace-pre-line overflow-hidden text-ellipsis break-words">{event.Description}</p>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Dates event={event} />

								<div className="space-y-3">
									<div className="flex items-start gap-2">
										<MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
										<div>
											<p className="font-medium">{event.Location.Name}</p>
											<p className="text-sm text-muted-foreground">{event.Location.Address}</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Users className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="font-medium">Capacidade</p>
											<p className="text-sm text-muted-foreground">
												{getAvailableCapacity(event, attendances.Data)}
											</p>
										</div>
									</div>

								</div>
							</div>

							<div className="mt-4 flex justify-center">
								<Attendances event={event} attendances={attendances.Data} account={account} />
							</div>
						</CardContent>
					</Card>

					{/* Games Section */}
					<Card>
						<CardHeader>
							<CardTitle>Jogos do Evento</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{games.Data.map((game) => (
									<Link key={game.Id} href={"/jogos/" + game.Slug}>
										<div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50  transition-colors">
											<div className="w-12 h-12 relative flex-shrink-0">
												<Image
													src={game.IconUrl || "/placeholder.svg"}
													alt={game.Name}
													fill
													className="object-cover rounded"
												/>
											</div>
											<div className="flex-1">
												<h3 className="font-medium">{game.Name}</h3>
												<div className="flex items-center gap-2 mt-1">
													<Badge variant="outline" className="text-xs">
														{game.MinAmountOfPlayers === game.MaxAmountOfPlayers
															? `${game.MinAmountOfPlayers} jogadores`
															: `${game.MinAmountOfPlayers}-${game.MaxAmountOfPlayers} jogadores`}
													</Badge>
												</div>
											</div>
										</div>
									</Link>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Confirmations Section */}
					<Card>
						<CardHeader>
							<CardTitle>
								Confirmados (
								{confirmationsCount}
								{event.Capacity && `/${event.Capacity}`})
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{confirmations.map((person) => (
									<Link key={person.Profile.AccountId} href={"/p/" + person.Profile.Handle} className="flex items-center gap-2 border rounded-full px-3 py-1">
										<Avatar className="w-6 h-6">
											<AvatarImage src={person.Profile.AvatarUrl || "/placeholder.svg"} alt={person.Profile.Handle} />
											<AvatarFallback className="text-xs">{person.Profile.Handle.substring(0, 2).toUpperCase()}</AvatarFallback>
										</Avatar>
										<span className="text-sm">{person.Profile.Handle}</span>
									</Link>
								))}

								{confirmations.length === 0 && (
									<p className="text-sm text-muted-foreground">Nenhuma confirmação ainda</p>
								)}
							</div>
						</CardContent>
					</Card>


					{/* Maybe Section */}
					{maybes.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>
									Talvez
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{maybes.map((person) => (
										<Link key={person.Profile.AccountId} href={"/p/" + person.Profile.Handle} className="flex items-center gap-2 border rounded-full px-3 py-1">
											<Avatar className="w-6 h-6">
												<AvatarImage src={person.Profile.AvatarUrl || "/placeholder.svg"} alt={person.Profile.Handle} />
												<AvatarFallback className="text-xs">{person.Profile.Handle.substring(0, 2).toUpperCase()}</AvatarFallback>
											</Avatar>
											<span className="text-sm">{person.Profile.Handle}</span>
										</Link>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{notGoing.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>
									Não vão
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{notGoing.map((person) => (
										<Link key={person.Profile.AccountId} href={"/p/" + person.Profile.Handle} className="flex items-center gap-2 border rounded-full px-3 py-1">
											<Avatar className="w-6 h-6">
												<AvatarImage src={person.Profile.AvatarUrl || "/placeholder.svg"} alt={person.Profile.Handle} />
												<AvatarFallback className="text-xs">{person.Profile.Handle.substring(0, 2).toUpperCase()}</AvatarFallback>
											</Avatar>
											<span className="text-sm">{person.Profile.Handle}</span>
										</Link>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					<EventImages event={event} />

					{/* Comments Section */}
					{/* <CommentsSection /> */}
				</div>
			</main>
		</>
	)
}