"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarClock, MapPin, Users, Info, Check, X, HelpCircle, ThumbsUp, ThumbsDown, Calendar } from "lucide-react"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { Event, EventAttendanceStatus, Profile } from "@/types/api"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Attendance status types
type AttendanceStatus = "GOING" | "NOT_GOING" | "MAYBE" | null

interface ResponseEvents {
	Data: Array<Event>
	Pagination: {
		Current?: string
		Limit: number
		Next?: string
	}
}

interface ConfirmAttendanceInput {
	EventId: number
	Confirmation: EventAttendanceStatus
}

// Attendance status configuration
const attendanceConfig = {
	GOING: {
		label: "Vou participar",
		icon: ThumbsUp,
		color: "text-green-600",
		bgColor: "bg-green-100",
		borderColor: "border-green-200",
		hoverColor: "hover:bg-green-200",
	},
	NOT_GOING: {
		label: "Não vou",
		icon: ThumbsDown,
		color: "text-red-600",
		bgColor: "bg-red-100",
		borderColor: "border-red-200",
		hoverColor: "hover:bg-red-200",
	},
	MAYBE: {
		label: "Talvez",
		icon: HelpCircle,
		color: "text-amber-600",
		bgColor: "bg-amber-100",
		borderColor: "border-amber-200",
		hoverColor: "hover:bg-amber-200",
	},
}

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
	const queryClient = useQueryClient()

	const account = useQuery<Profile>({
		queryKey: ["profile"],
		queryFn: async () => {
			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/profile/me', {
				method: 'GET',
				cache: 'no-store',
				credentials: "include"
			}).catch(() => ({
				ok: false
			} as Response));


			if (!res.ok) {
				return
			}

			return res.json()
		}
	})

	// Use TanStack Query for data fetching with infinite scroll
	const { data: events, } = useInfiniteQuery<ResponseEvents>({
		queryKey: ["events"],
		queryFn: async ({ pageParam = null }) => {
			const queryObj: Record<string, string> = {}

			if (pageParam) {
				queryObj.after = String(pageParam)
			}

			const query = new URLSearchParams(queryObj)

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event/next?${query.toString()}`, {
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`Erro ao pegar dados da API: ${response.status}`)
			}

			return response.json()
		},
		getNextPageParam: (lastPage) => {
			// Return undefined if there are no more pages or if nextCursor is not provided
			return lastPage.Pagination.Next || undefined
		},
		initialPageParam: null,
	})

	// Process all items from all pages
	const allEvents = useMemo(() => {
		if (!events) return []

		// Flatten the pages array and extract items from each page
		return events.pages.flatMap((page) => page.Data || [])
	}, [events])

	const mutation = useMutation({
		mutationFn: async (body: ConfirmAttendanceInput) => {
			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/event/attendance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
				credentials: 'include',
			});

			if (!res.ok) {
				const error = await res.text()
				throw new Error(error)
			}
		},
		onSuccess: () => {
			// Invalidate and refetch any queries that might be affected
			queryClient.invalidateQueries({ queryKey: ['events'] })
		},
		onError: (error) => {
			console.error(error);
		},
	});

	function updateAttendance(eventId: number, status: any) {
		mutation.mutate({
			EventId: eventId,
			Confirmation: status
		});
	}

	// Function to get attendance button based on current status
	const getAttendanceButton = (event: Event) => {
		const userAttendance = event.Attendances.find(a => a.AccountId === account.data?.AccountId)
		const availableSpots = event.Capacity ? event.Capacity - event.Attendances.length : -1
		const isFull = availableSpots <= 0

		// If the event is full and user is not already going, disable the button
		const isDisabled = isFull && userAttendance?.Status !== "GOING"

		if (userAttendance) {
			// User has already set an attendance status
			const config = attendanceConfig[userAttendance?.Status]

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className={cn("gap-2 border", config.borderColor, config.bgColor, config.color, config.hoverColor)}
						>
							<config.icon className="h-4 w-4" />
							{config.label}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{Object.entries(attendanceConfig).map(([status, config]) => (
							<DropdownMenuItem
								key={status}
								onClick={() => updateAttendance(event.Id, status as AttendanceStatus)}
								disabled={status === "GOING" && isDisabled}
								className={cn(
									"gap-2",
									status === userAttendance?.Status ? "font-medium" : "",
									status === userAttendance?.Status ? config.color : "",
								)}
							>
								<config.icon className="h-4 w-4" />
								{config.label}
								{status === userAttendance?.Status && <Check className="h-4 w-4 ml-auto" />}
							</DropdownMenuItem>
						))}
						{/* <DropdownMenuItem onClick={() => updateAttendance(event.Id, null)} className="gap-2 text-gray-600">
							<X className="h-4 w-4" />
							Remover resposta
						</DropdownMenuItem> */}
					</DropdownMenuContent>
				</DropdownMenu>
			)
		} else {
			// User hasn't set an attendance status yet
			return (
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="gap-1 border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
						onClick={() => updateAttendance(event.Id, "GOING")}
						disabled={isDisabled}
					>
						<Check className="h-4 w-4" />
						Vou
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="gap-1 border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
						onClick={() => updateAttendance(event.Id, "MAYBE")}
					>
						<HelpCircle className="h-4 w-4" />
						Talvez
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="gap-1 border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
						onClick={() => updateAttendance(event.Id, "NOT_GOING")}
					>
						<X className="h-4 w-4" />
						Não vou
					</Button>
				</div>
			)
		}
	}

	return (
		<main className="flex-1 container mx-auto py-8 px-4 mb-10">
			{allEvents.map((event) => {
				const availableSpots = event.Capacity ? event.Capacity - event.Attendances.length : -1
				const isFull = availableSpots <= 0
				const userAttendance = account.data?.AccountId
					? event.Attendances.find(a => a.AccountId === account.data?.AccountId)
					: undefined

				// Check if user is already in confirmations (for the UI only)
				const isUserConfirmed = userAttendance?.Status === "GOING"

				return (
					<Card key={event.Id} className="overflow-hidden hover:shadow-md transition-shadow mb-3">
						<CardContent className="p-0">
							<div className="flex flex-col">
								{/* Event Header Section */}
								<div className="flex flex-row">
									<div className="flex-1 p-4 md:p-6">
										<div className="flex justify-between items-start">
											<h2 className="text-xl md:text-2xl font-bold">{event.Name}</h2>
										</div>
										<p className="text-muted-foreground mt-1">{event.Description}</p>

										<div className="flex items-center mt-3 text-sm">
											<CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
											<span>{formatEventDate(event.StartDate)}</span>
										</div>

										<div className="flex items-center mt-2 text-sm">
											<Info className="h-4 w-4 mr-2 text-muted-foreground" />
											<span className={cn(isFull && !isUserConfirmed ? "text-red-600 font-medium" : "")}>
												{(event.Capacity === undefined || event.Capacity === null) ? "Sem limite de vagas!" : (
													availableSpots > 0
														? `${availableSpots} vagas disponíveis`
														: "Evento lotado"
												)}
											</span>
										</div>
									</div>
									<div className="w-[100px] h-[100px] md:w-[150px] md:h-[150px] relative">
										<Image src={event.IconUrl || "/placeholder.svg"} alt={event.Name} fill className="object-cover" />
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
											Confirmados ({event.Attendances.length}/{event.Capacity}):
										</span>
										<div className="flex">
											{event.Attendances.length > 0 ? (
												event.Attendances.map((person, index) => (
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
											) : !isUserConfirmed ? (
												<span className="text-sm text-muted-foreground">Nenhuma confirmação ainda</span>
											) : null}
										</div>
									</div>
								</div>

								{account.data?.AccountId && (
									<div className="flex justify-center items-start p-4 md:p-6">
										{getAttendanceButton(event)}
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				)
			})}

			{allEvents.length === 0 && (
				<div className="text-center py-10">
					<Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<p className="text-muted-foreground">Nenhum evento encontrado.</p>
				</div>
			)}
		</main>
	)
}
