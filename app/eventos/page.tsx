"use client"

import { BottomNavbar } from "@/components/bottom-navbar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarClock, MapPin, Users } from 'lucide-react'
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
				<Card className="overflow-hidden hover:shadow-md transition-shadow">
					<CardContent className="p-0">
						<div className="flex flex-col">
							{/* Game and Image Section */}
							<div className="flex flex-row">
								<div className="flex-1 p-4 md:p-6">
									<h2 className="text-xl md:text-2xl font-bold">{event.Game.Name}</h2>
									<div className="flex flex-wrap items-center mt-2 mb-2 md:mb-4">
										<Badge variant="outline" className="mr-2 mb-1">
											{event.Game.MinAmountOfPlayers === event.Game.MaxAmountOfPlayers
												? `${event.Game.MinAmountOfPlayers} jogadores`
												: `${event.Game.MinAmountOfPlayers}-${event.Game.MaxAmountOfPlayers} jogadores`}
										</Badge>
										<a
											href={event.Game.LudopediaUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-blue-600 hover:underline"
										>
											Ver na Ludopedia
										</a>
									</div>

									{/* Date display */}
									<div className="flex items-center mt-2 text-sm">
										<CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
										<span>{formatEventDate(event.Date)}</span>
									</div>
								</div>
								<div className="w-[100px] h-[100px] md:w-[150px] md:h-[150px] relative">
									<Image
										src={event.Game.IconUrl || "/placeholder.svg"}
										alt={event.Game.Name}
										fill
										className="object-cover"
									/>
								</div>
							</div>

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
										Confirmados ({event.Confirmations.length}/{event.Game.MaxAmountOfPlayers}):
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

