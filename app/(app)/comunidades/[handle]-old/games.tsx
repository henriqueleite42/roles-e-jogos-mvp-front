import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommunityData, Profile, ResponseGames, ResponseSearchPersonalGames } from "@/types/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AlertCircle, Gamepad, Loader2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

export function ProfileGames({ community }: { community: CommunityData }) {
	// Use TanStack Query for data fetching with infinite scroll
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, error } = useInfiniteQuery<ResponseGames>({
		queryKey: ["games-community", community.Id],
		queryFn: async ({ pageParam = null }) => {
			const queryObj: Record<string, string> = {
				communityId: String(community.Id),
			}

			if (pageParam) {
				queryObj.after = String(pageParam)
			}

			const query = new URLSearchParams(queryObj)

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections/community?${query.toString()}`, {
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
					<Gamepad className="h-5 w-5" />
					Coleção
				</CardTitle>
				<p className="text-muted-foreground mt-1">
					Veja a coleção conjunta de todos os membros dessa comunidade
				</p>
			</CardHeader>
			<CardContent className="px-2">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
					{isPending && (
						<div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[100vh]">
							<Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
							<p className="text-lg text-muted-foreground">Carregando jogos...</p>
						</div>
					)}
					{error && (
						<div className="container mx-auto py-8 px-4">
							<Alert variant="destructive" className="mb-6">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Erro ao carregar jogos: {error.message}. Por favor, tente novamente mais tarde.
								</AlertDescription>
							</Alert>
							<Button className="text-white" onClick={() => window.location.reload()}>Tentar novamente</Button>
						</div>
					)}
					{allItems.map((game) => (
						<Link href={"/jogos/" + game.Game.Slug} key={game.Game.Id} className="overflow-hidden hover:shadow-md transition-shadow">
							<Card>
								<CardContent className="p-0">
									<div className="flex flex-row">
										<div className="flex-1 p-4 md:p-6">
											<h2 className="text-xl md:text-2xl font-bold">{game.Game.Name}</h2>
											<div className="flex flex-wrap items-center mt-2 mb-2 md:mb-4">
												<Badge variant="outline" className="mr-2 mb-1">
													{game.Game.MinAmountOfPlayers === game.Game.MaxAmountOfPlayers
														? `${game.Game.MinAmountOfPlayers} jogadores`
														: `${game.Game.MinAmountOfPlayers}-${game.Game.MaxAmountOfPlayers} jogadores`}
												</Badge>
											</div>
											<div className="flex items-center">
												<Users className="h-4 w-4 mr-2 text-muted-foreground" />
												<div className="flex">
													{game.Owners.map((person) => (
														<Link key={person.AccountId} href={"/p/" + person.Handle} className="relative group -ml-2 first:ml-0">
															<div className="rounded-full border-2 border-background w-10 h-10 overflow-hidden">
																<Image
																	src={person.AvatarUrl || "/placeholder.svg"}
																	alt={person.Handle || `Usuário ${person.AccountId}`}
																	width={40}
																	height={40}
																	className="w-full h-full object-cover object-center"
																/>
															</div>
															<div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
																{person.Handle || `ID: ${person.AccountId}`}
															</div>
														</Link>
													))}
												</div>
											</div>
										</div>
										<div className="w-[100px] h-[100px] md:w-[200px] md:h-[200px] relative">
											<Image
												src={game.Game.IconUrl || "/placeholder.svg"}
												alt={game.Game.Name}
												fill
												className="object-cover"
											/>
										</div>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}

					{/* Infinite scroll observer element */}
					<div ref={observerTarget} className="w-full py-4 flex justify-center">
						{isFetchingNextPage && (
							<div className="flex items-center gap-2">
								<Loader2 className="h-5 w-5 animate-spin text-orange-500" />
								<span className="text-sm text-muted-foreground">Carregando mais jogos...</span>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}