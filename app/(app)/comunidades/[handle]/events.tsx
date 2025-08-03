"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatEventDate } from "@/lib/dates"
import { CommunityData, ResponseListEventsByAccount } from "@/types/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Calendar, MapPin, Loader2, AlertCircle, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef } from "react"

export function ProfileEvents({ community }: { community: CommunityData }) {
	// Use TanStack Query for data fetching with infinite scroll
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, error } = useInfiniteQuery<ResponseListEventsByAccount>({
		queryKey: ["events-community", community.Id],
		queryFn: async ({ pageParam = null }) => {
			if (!community.Id) {
				return {
					pages: [
						{
							Data: []
						}
					]
				}
			}

			const queryObj: Record<string, string> = {
				communityId: String(community.Id),
			}

			if (pageParam) {
				queryObj.after = String(pageParam)
			}

			const query = new URLSearchParams(queryObj)

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/community?${query.toString()}`, {
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
		enabled: Boolean(community.Id)
	})

	// Process all items from all pages
	const allItems = useMemo(() => {
		if (!data) return []

		// Flatten the pages array and extract items from each page
		return data.pages.flatMap((page) => page.Data || [])
	}, [data])


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
					Histórico de Eventos
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex justify-center align-center mb-5">
					<Button type="button" className="text-white" asChild>
						<Link href={`/comunidades/${community.Handle}/eventos/criar`}>
							<Plus className="h-4 w-4" />
							Criar evento
						</Link>
					</Button>
				</div>

				<div className="space-y-4">
					{isPending && (
						<div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[100vh]">
							<Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
							<p className="text-lg text-muted-foreground">Carregando eventos...</p>
						</div>
					)}
					{error && (
						<div className="container mx-auto py-8 px-4">
							<Alert variant="destructive" className="mb-6">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Erro ao carregar eventos: {error.message}. Por favor, tente novamente mais tarde.
								</AlertDescription>
							</Alert>
							<Button onClick={() => window.location.reload()}>Tentar novamente</Button>
						</div>
					)}
					{allItems.map((event) => (
						<Link href={"/eventos/" + event.Slug} key={event.Id} className="flex items-center gap-3 p-3 border rounded-lg">
							<div className="w-16 h-12 relative rounded overflow-hidden">
								<Image
									src={event.IconUrl || "/placeholder.svg"}
									alt={event.Name}
									fill
									className="object-cover"
								/>
							</div>
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<h4 className="font-medium">{event.Name}</h4>
								</div>
								<div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
									<Calendar className="h-3 w-3" />
									<span>{formatEventDate(event.StartDate)}</span>
								</div>
								<div className="flex items-center gap-4 text-xs text-muted-foreground">
									<div className="flex items-center gap-1">
										<MapPin className="h-3 w-3" />
										{/* <span>{event.Location.Name}</span> */}
										<span>Foo</span>
									</div>
								</div>
							</div>
						</Link>
					))}

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