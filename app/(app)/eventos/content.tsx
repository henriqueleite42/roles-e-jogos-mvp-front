"use client"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users, Share2, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { EventData, ResponseEvents } from "@/types/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useRef } from "react"
import { Header } from "@/components/header"
import { formatEventDate } from "@/lib/dates"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDisplayPrice } from "@/lib/price"
import { getShareData } from "./utils"

function formatDateRange(startDate: string, endDate?: string): string {
	const start = formatEventDate(startDate)
	if (!endDate) return start

	const startDateTime = new Date(startDate)
	const endDateTime = new Date(endDate)

	// If same day, just show end time
	if (startDateTime.toDateString() === endDateTime.toDateString()) {
		const endHours = endDateTime.getHours().toString().padStart(2, "0")
		const endMinutes = endDateTime.getMinutes().toString().padStart(2, "0")
		return `${start} - ${endHours}:${endMinutes}`
	}

	// Different days
	return `${start} - ${formatEventDate(endDate)}`
}

function getDayOfWeek(dateString: string): string {
	const date = new Date(dateString)
	const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]
	return days[date.getDay()]
}

function formatDateHeader(dateString: string): string {
	const date = new Date(dateString)
	const today = new Date()
	const tomorrow = new Date(today)
	tomorrow.setDate(tomorrow.getDate() + 1)

	// Check if it's today
	if (date.toDateString() === today.toDateString()) {
		return "Hoje"
	}

	// Check if it's tomorrow
	if (date.toDateString() === tomorrow.toDateString()) {
		return "Amanhã"
	}

	// Otherwise show day of week and date
	const dayOfWeek = getDayOfWeek(dateString)
	const day = date.getDate().toString().padStart(2, "0")
	const month = (date.getMonth() + 1).toString().padStart(2, "0")

	return `${dayOfWeek}, ${day}/${month}`
}

export default function Events() {
	const { toast } = useToast()

	// Use TanStack Query for data fetching with infinite scroll
	const { data: events, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery<ResponseEvents>({
		queryKey: ["events"],
		staleTime: 1000 * 60 * 5, // 5 minutes
		queryFn: async ({ pageParam = null }) => {
			const queryObj: Record<string, string> = {}

			if (pageParam) {
				queryObj.afterTimestamp = String((pageParam as any).Timestamp)
				queryObj.afterId = String((pageParam as any).Id)
			}

			const query = new URLSearchParams(queryObj)

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/next?${query.toString()}`, {
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
	const eventsByDay = useMemo<{ [key: string]: EventData[] }>(() => {
		if (!events) return {}

		const grouped: { [key: string]: EventData[] } = {}

		events.pages.forEach(page => {
			page.Data.forEach(event => {
				const dateKey = new Date(event.StartDate).toDateString()
				if (!grouped[dateKey]) {
					grouped[dateKey] = []
				}
				grouped[dateKey].push(event)
			})
		})

		return grouped
	}, [events])

	const sortedDays = useMemo(() => {
		return Object.keys(eventsByDay).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
	}, [eventsByDay])

	const handleShare = async (event: EventData) => {
		const shareData = getShareData(event)

		try {
			if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
				await navigator.share(shareData)
			} else {
				await navigator.clipboard.writeText(shareData.url)
				toast({
					title: "Link copiado",
					description: "O link do evento foi copiado para a área de transferência.",
				})
			}
		} catch (error) {
			if ((error as any).name !== "AbortError") {
				toast({
					title: "Erro ao compartilhar",
					description: "Não foi possível compartilhar o evento.",
					variant: "destructive",
				})
			}
		}
	}

	// Observer for infinite scroll
	const observerTarget = useRef<HTMLDivElement | null>(null)

	// Intersection Observer for infinite scroll
	useEffect(() => {
		if (!hasNextPage || !observerTarget.current || isFetchingNextPage) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					fetchNextPage()
				}
			},
			{ threshold: 0.5 },
		)

		observer.observe(observerTarget.current)

		return () => {
			observer.disconnect()
		}
	}, [hasNextPage, isFetchingNextPage])

	return (
		<>
			<Header title="Eventos" displayBackButton />

			<main className="flex-1 container mx-auto p-2 mb-10 space-y-2">
				{sortedDays.map((day) => {
					const dayEvents = eventsByDay[day]
					const firstEventDate = dayEvents[0].StartDate

					return (
						<div key={day} className="space-y-4 mb-4">
							{/* Day Header */}
							<div className="flex items-center gap-3">
								<Calendar className="h-5 w-5 text-primary" />
								<h2 className="text-xl font-semibold text-foreground">{formatDateHeader(firstEventDate)}</h2>
								<div className="flex-1 h-px bg-border"></div>
							</div>

							{/* Events for this day */}
							<div className="space-y-4">
								{dayEvents.map((event) => (
									<Card key={event.Id} className="overflow-hidden hover:shadow-md transition-shadow">
										<CardContent className="p-0">
											<div className="flex flex-col">
												{/* Header Section */}
												<div className="flex gap-4 p-4">
													{/* Event Image */}
													<div className="w-24 h-24 sm:w-32 sm:h-32 relative flex-shrink-0 rounded-lg overflow-hidden">
														<Image src={event.IconUrl || "/placeholder.svg"} alt={event.Name} fill className="object-cover" />
													</div>

													{/* Event Info */}
													<div className="flex-1 min-w-0">
														<h2 className="text-xl font-bold mb-1 line-clamp-2">{event.Name}</h2>

														{/* Organizer Info */}
														<div className="flex items-center gap-2 mb-2">
															<Avatar className="h-8 w-8">
																<AvatarImage
																	src={event.Organizer.AvatarUrl || "/placeholder.svg"}
																	alt={event.Organizer.Handle}
																/>
																<AvatarFallback className="text-xs">
																	{event.Organizer.Handle.charAt(0).toUpperCase()}
																</AvatarFallback>
															</Avatar>
															<span className="text-sm text-muted-foreground">Organização: @{event.Organizer.Handle}</span>
														</div>

														<div className="flex items-center gap-1 text-muted-foreground">
															<MapPin className="h-4 w-4 flex-shrink-0" />
															<span className="text-sm truncate">{event.Location.Name}</span>
														</div>
													</div>

													{/* Price Badge */}
													<div className="flex-shrink-0">
														<Badge variant={event.Price ? "secondary" : "green"} className="flex items-center gap-1">
															{formatDisplayPrice(event.Price)}
														</Badge>
													</div>
												</div>

												{/* Content Section */}
												<div className="px-4 pb-4 space-y-4">
													{/* Event Details */}
													<div className="space-y-2">
														{/* Date and Time */}
														<div className="flex items-center gap-2 text-sm">
															<Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
															<span>{formatDateRange(event.StartDate, event.EndDate)}</span>
														</div>

														{/* Location Name */}
														<div className="flex items-start gap-2 text-sm">
															<MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
															<span className="text-muted-foreground">{event.Location.Name}</span>
														</div>

														{/* Capacity */}
														{event.Capacity && (
															<div className="flex items-center gap-2 text-sm">
																<Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
																<span className="text-muted-foreground">Capacidade: {event.Capacity} pessoas</span>
															</div>
														)}
														{!event.Capacity && (
															<div className="flex items-center gap-2 text-sm">
																<Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
																<span className="text-muted-foreground">Sem limite de vagas!</span>
															</div>
														)}
													</div>

													{/* Action Buttons */}
													<div className="flex gap-2 pt-2">
														<Button asChild className="flex-1 text-white">
															<Link href={`/eventos/${event.Slug}`} className="gap-2">
																<Eye className="h-4 w-4" />
																Ver mais
															</Link>
														</Button>
														<Button variant="outline" size="icon" onClick={() => handleShare(event)} className="flex-shrink-0">
															<Share2 className="h-4 w-4" />
														</Button>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					)
				})}

				{sortedDays.length === 0 && (
					<div className="text-center py-10">
						<Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<p className="text-muted-foreground">Nenhum evento encontrado.</p>
					</div>
				)}

				{sortedDays.length > 0 && (
					/* Infinite scroll observer element */
					<div ref={observerTarget} className="w-full py-4 flex justify-center">
						{isFetchingNextPage && (
							<div className="flex items-center gap-2">
								<Loader2 className="h-5 w-5 animate-spin text-orange-500" />
								<span className="text-sm text-muted-foreground">Carregando mais eventos...</span>
							</div>
						)}
					</div>
				)}
			</main>
		</>
	)
}
