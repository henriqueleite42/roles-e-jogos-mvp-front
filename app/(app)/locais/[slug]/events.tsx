"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationData, ResponseListEventsByLocation } from "@/types/api";
import { Calendar, Loader2 } from "lucide-react";
import Image from "next/image";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Loading from "@/components/ui/loading";
import { formatEventDate } from "@/lib/dates";

export function LocationEvents({ location }: { location: LocationData }) {
	// Use TanStack Query for data fetching with infinite scroll
	const { data: events, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery<ResponseListEventsByLocation>({
		queryKey: ["list-location-events", location.Id],
		staleTime: 1000 * 60 * 5, // 5 minutes
		queryFn: async ({ pageParam = null }) => {
			const query = new URLSearchParams({
				locationId: String(location.Id)
			})

			const pp = pageParam as any
			if (pp?.Timestamp && pp?.Id) {
				query.set("afterTimestamp", String(pp.Timestamp))
				query.set("afterId", String(pp.Id))
			}

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/location?${query.toString()}`, {
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
		enabled: Boolean(location.Id)
	})

	// Process all items from all pages
	const allEvents = useMemo(() => {
		if (!events) return []

		// Flatten the pages array and extract items from each page
		return events.pages.flatMap((page) => page.Data || [])
	}, [events])

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
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calendar className="h-5 w-5" />
					Eventos
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col space-y-3">
					{
						isPending && (
							<Loading />
						)
					}
					{allEvents.length > 1 && (
						allEvents.map((event) => (
							<Link key={event.Id} href={`/eventos/${event.Slug}`}>
								<div className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
									<div className="w-16 h-16 relative flex-shrink-0 rounded overflow-hidden">
										<Image
											src={event.IconUrl || "/placeholder.svg"}
											alt=""
											fill
											className="object-cover"
										/>
									</div>
									<div className="flex-1 min-w-0">
										<h4 className="font-medium truncate">{event.Name}</h4>
										<div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
											<Calendar className="h-3 w-3" />
											<span>{formatEventDate(event.StartDate)}</span>
										</div>
									</div>
								</div>
							</Link>
						))
					)}

					{/* Infinite scroll observer element */}
					<div ref={observerTarget} className="w-full py-4 flex justify-center">
						{isFetchingNextPage && (
							<div className="flex items-center gap-2">
								<Loader2 className="h-5 w-5 animate-spin text-orange-500" />
								<span className="text-sm text-muted-foreground">Carregando mais eventos...</span>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}