"use client"

import { BottomNavbar } from "@/components/bottom-navbar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarClock, MapPin, Users, Info } from 'lucide-react'
import Image from "next/image"

import EVENTS from "../../get-data/events.json"

const now = new Date().getTime()

const events = EVENTS.filter(e => new Date(e.Date).getTime() >= now)

function formatEventDate(dateString: string): string {
	const date = new Date(dateString)

	// Format date: DD/MM/YYYY
	const day = date.getDate().toString().padStart(2, "0")
	const month = (date.getMonth() + 1).toString().padStart(2, "0")
	const year = date.getFullYear()

	// Format time: HH:MM
	const hours = date.getHours().toString().padStart(2, "0")
	const minutes = date.getMinutes().toString().padStart(2, "0")

	return `${day}/${month}/${year} às ${hours}:${minutes}`
}

export default function Events() {
	return (
		<main className="container mx-auto py-8 px-4">
			<h1 className="text-3xl font-bold mb-6">Rolês & Jogos</h1>

			{events.map((event) => (
				<Card key={event.Id} className="overflow-hidden hover:shadow-md transition-shadow">
					<CardContent className="p-0">
						<div className="flex flex-col">
							{/* Event Header Section */}
							<div className="flex flex-row">
								<div className="flex-1 p-4 md:p-6">
									<h2 className="text-xl md:text-2xl font-bold">{event.Name}</h2>
									<p className="text-muted-foreground mt-1">{event.Description}</p>

									<div className="flex items-center mt-3 text-sm">
										<CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
										<span>{formatEventDate(event.Date)}</span>
									</div>

									<div className="flex items-center mt-2 text-sm">
										<Info className="h-4 w-4 mr-2 text-muted-foreground" />
										<span>{event.AvailableSpots - event.Confirmations.length > 0 ? `${event.AvailableSpots - event.Confirmations.length} vagas disponíveis` : "Evento lotado"}</span>
									</div>
								</div>
								<div className="w-[100px] h-[100px] md:w-[150px] md:h-[150px] relative">
									<Image src={event.ImageUrl || "/placeholder.svg"} alt={event.Name} fill className="object-cover" />
								</div>
							</div>

							{/* Games Section */}
							{event.Games.length > 0 && (
								<div className="border-t border-gray-100 p-4 md:p-6">
									<h3 className="font-medium mb-3">Jogos</h3>
									<div className="space-y-3">
										{event.Games.map((game) => (
											<div key={game.Id} className="flex items-start gap-3">
												<div className="w-10 h-10 relative flex-shrink-0">
													<Image
														src={game.IconUrl || "/placeholder.svg"}
														alt={game.Name}
														fill
														className="object-cover rounded"
													/>
												</div>
												<div>
													<div className="font-medium">{game.Name}</div>
													<div className="flex items-center mt-1">
														<Badge variant="outline" className="text-xs">
															{game.MinAmountOfPlayers === game.MaxAmountOfPlayers
																? `${game.MinAmountOfPlayers} jogadores`
																: `${game.MinAmountOfPlayers}-${game.MaxAmountOfPlayers} jogadores`}
														</Badge>
														<a
															href={game.LudopediaUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="text-xs text-blue-600 hover:underline ml-2"
														>
															Ver na Ludopedia
														</a>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Location Section */}
							<div className="border-t border-gray-100 p-4 md:p-6 bg-gray-50">
								<div className="flex items-start gap-3 mb-3">
									<MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
									<div>
										<h3 className="font-medium">{event.Location.Name}</h3>
										<p className="text-sm text-muted-foreground">{event.Location.Address}</p>
									</div>
								</div>

								{/* Confirmations Section */}
								<div className="flex items-center mt-4">
									<Users className="h-5 w-5 mr-2 text-muted-foreground" />
									<span className="text-sm font-medium mr-2">
										Confirmados ({event.Confirmations.length}/{event.AvailableSpots}):
									</span>
									<div className="flex">
										{event.Confirmations.length > 0 ? (
											event.Confirmations.map((person, index) => (
												<div key={index} className="relative group -ml-2 first:ml-0">
													<div className="rounded-full border-2 border-background w-8 h-8 overflow-hidden">
														<Image
															src={person.AvatarUrl || "/placeholder.svg"}
															alt={person.Handle || `Usuário ${person.AccountId}`}
															width={32}
															height={32}
															className="w-full h-full object-cover object-center"
														/>
													</div>
													<div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
														{person.Handle || `ID: ${person.AccountId}`}
													</div>
												</div>
											))
										) : (
											<span className="text-sm text-muted-foreground">Nenhuma confirmação ainda</span>
										)}
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			))}

			{events.length === 0 && (
				<div className="text-center py-10">
					<p className="text-muted-foreground">Nenhum evento encontrado.</p>
				</div>
			)}

			<BottomNavbar />
		</main>
	)
}
