"use client"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users, Share2, Eye, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { formatEventDate } from "./utils"
import { Event, ResponseEvents } from "@/types/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { Header } from "@/components/header"

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

export default function Events() {
	const { toast } = useToast()

	// Use TanStack Query for data fetching with infinite scroll
	const { data: events, } = useInfiniteQuery<ResponseEvents>({
		queryKey: ["events"],
		staleTime: 1000 * 60 * 5, // 5 minutes
		queryFn: async ({ pageParam = null }) => {
			const queryObj: Record<string, string> = {}

			if (pageParam) {
				queryObj.after = String(pageParam)
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
	const allEvents = useMemo(() => {
		if (!events) return []

		// Flatten the pages array and extract items from each page
		return events.pages.flatMap((page) => page.Data || [])
	}, [events])

	const handleShare = async (event: Event) => {
		const shareData = {
			title: event.Name,
			text: `${event.Name} - ${event.Description.substring(0, 100)}...`,
			url: `${window.location.origin}/eventos/${event.Slug}`,
		}

		try {
			if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
				await navigator.share(shareData)
			} else {
				await navigator.clipboard.writeText(`${window.location.origin}/eventos/${event.Slug}`)
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

	const copyAddress = async (event: Event) => {
		try {
			await navigator.clipboard.writeText(event.Location.Address)
			toast({
				title: "Endereço copiado",
				description: "O endereço foi copiado para a área de transferência.",
			})
		} catch (error) {
			toast({
				title: "Erro ao copiar",
				description: "Não foi possível copiar o endereço.",
				variant: "destructive",
			})
		}
	}

	return (
		<>
			<Header title="Eventos" displayBackButton />

			<main className="flex-1 container mx-auto py-8 px-4 mb-10">
				<div className="space-y-6">
					{allEvents.map((event) => (
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
											<div className="flex items-center gap-1 text-muted-foreground mb-2">
												<MapPin className="h-4 w-4 flex-shrink-0" />
												<span className="text-sm truncate">{event.Location.Name}</span>
											</div>
										</div>
									</div>

									{/* Content Section */}
									<div className="px-4 pb-4 space-y-4">
										{/* Description */}
										<p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{event.Description}</p>

										{/* Event Details */}
										<div className="space-y-2">
											{/* Date and Time */}
											<div className="flex items-center gap-2 text-sm">
												<Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
												<span>{formatDateRange(event.StartDate, event.EndDate)}</span>
											</div>

											{/* Location Address */}
											<div className="flex items-start gap-2 text-sm" onClick={() => copyAddress(event)}>
												<MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
												<span className="text-muted-foreground">{event.Location.Address}</span>
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

					{allEvents.length === 0 && (
						<div className="text-center py-10">
							<Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-muted-foreground">Nenhum evento encontrado.</p>
						</div>
					)}
				</div>
			</main>
		</>
	)
}
