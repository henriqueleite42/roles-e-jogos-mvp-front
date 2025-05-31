"use client"

import {
	Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GameData, ResponseListGameOwners } from "@/types/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import Loading from "@/components/ui/loading"

interface Params {
	game: GameData
}

export const GameOwners = ({ game }: Params) => {
	// Use TanStack Query for data fetching with infinite scroll
	const { data: owners, isPending, fetchNextPage } = useInfiniteQuery<ResponseListGameOwners>({
		queryKey: ["list-game-owners", game.Id],
		staleTime: 1000 * 60 * 5, // 5 minutes
		queryFn: async ({ pageParam = null }) => {
			const query = new URLSearchParams({
				gameId: String(game.Id)
			})

			if (pageParam) {
				query.set("after", String(pageParam))
			}

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections/games/owners?${query.toString()}`, {
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
		enabled: Boolean(game.Id)
	})

	// Process all items from all pages
	const allOwners = useMemo(() => {
		if (!owners) return []

		// Flatten the pages array and extract items from each page
		return owners.pages.flatMap((page) => page.Data || [])
	}, [owners])

	return (
		<>
			{allOwners.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Proprietários
						</CardTitle>
					</CardHeader>
					<CardContent>
						{
							isPending && (
								<Loading />
							)
						}
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{allOwners.map((owner) => (
								<div key={owner.AccountId} className="flex items-center gap-2 p-2 border rounded-lg">
									<Avatar className="w-8 h-8">
										<AvatarImage src={owner.AvatarUrl || "/placeholder.svg"} alt={owner.Handle} />
										<AvatarFallback className="text-xs">{owner.Handle.substring(0, 2).toUpperCase()}</AvatarFallback>
									</Avatar>
									<span className="text-sm truncate">{owner.Handle}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</>
	)
}