"use client"
import Link from "next/link"
import { Calendar, CalendarIcon, Loader2, TicketIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ResponseAccountEventTickets } from "@/types/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useRef } from "react"
import { Header } from "@/components/header"
import { formatDisplayPrice } from "@/lib/price"
import { formatDate } from "@/lib/dates"

export default function Content() {
	// Use TanStack Query for data fetching with infinite scroll
	const { data: accountTickets, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery<ResponseAccountEventTickets>({
		queryKey: ["account-tickets"],
		staleTime: 1000 * 60 * 5, // 5 minutes
		queryFn: async ({ pageParam = null }) => {
			const queryObj: Record<string, string> = {}

			if (pageParam) {
				queryObj.afterTimestamp = String((pageParam as any).Timestamp)
				queryObj.afterId = String((pageParam as any).Id)
			}

			const query = new URLSearchParams(queryObj)

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/tickets/mine?${query.toString()}`, {
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
	const allAccountTickets = useMemo(() => {
		if (!accountTickets) return []

		// Flatten the pages array and extract items from each page
		return accountTickets.pages.flatMap((page) => page.Data || [])
	}, [accountTickets])

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
			<Header title="Ingressos" displayBackButton />

			<main className="flex-1 container mx-auto p-2 mb-10 space-y-2">
				{allAccountTickets.map((ticket) => (
					<Card key={ticket.Event.Id} className="hover:shadow-md transition-shadow">
						<CardContent className="p-6">
							<div className="flex items-start gap-4">
								{/* Event Image */}
								<div className="flex-shrink-0">
									<img
										src={ticket.Event.IconUrl || "/placeholder.svg"}
										alt={ticket.Event.Name}
										className="w-16 h-16 rounded-lg object-cover"
									/>
								</div>

								{/* Event Info */}
								<div className="flex-1 min-w-0">
									<div className="flex items-start mb-2">
										<h3 className="font-semibold text-lg mb-1">{ticket.Event.Name}</h3>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
										<div className="flex items-center gap-2 text-sm">
											<CalendarIcon className="h-4 w-4 text-muted-foreground" />
											<span>{formatDate(ticket.Event.StartDate)}</span>
										</div>
										<div className="flex items-center gap-2 text-sm">
											<TicketIcon className="h-4 w-4 text-muted-foreground" />
											<span>{formatDisplayPrice(ticket.Event.Price, ticket.Amount)}</span>
										</div>
									</div>

									<div className="flex justify-end">
										<Button asChild>
											<Link href={`/ingressos/${ticket.Event.Slug}`} className="text-white">Ver Detalhes</Link>
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}

				{allAccountTickets.length === 0 && (
					<div className="text-center py-10">
						<Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<p className="text-muted-foreground">Nenhum ingresso encontrado.</p>
					</div>
				)}

				{allAccountTickets.length > 0 && (
					/* Infinite scroll observer element */
					<div ref={observerTarget} className="w-full py-4 flex justify-center">
						{isFetchingNextPage && (
							<div className="flex items-center gap-2">
								<Loader2 className="h-5 w-5 animate-spin text-orange-500" />
								<span className="text-sm text-muted-foreground">Carregando mais ingressos...</span>
							</div>
						)}
					</div>
				)}
			</main>
		</>
	)
}
