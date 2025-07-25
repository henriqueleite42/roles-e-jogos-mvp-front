"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useInfiniteQuery } from "@tanstack/react-query"
import { ResponseListCommunities } from "@/types/api"
import { useMemo } from "react"
import { Header } from "@/components/header"
import { formatDate } from "@/lib/dates"

// Função para traduzir o tipo de afiliação
function translateAffiliationType(type: string): string {
	switch (type) {
		case "PUBLIC":
			return "Pública"
		case "PRIVATE":
			return "Privada"
		case "INVITE_ONLY":
			return "Apenas Convite"
		default:
			return type
	}
}

// Função para obter a cor do badge baseado no tipo de afiliação
function getAffiliationColor(type: string): string {
	switch (type) {
		case "PUBLIC":
			return "bg-green-500"
		case "PRIVATE":
			return "bg-amber-500"
		case "INVITE_ONLY":
			return "bg-purple-500"
		default:
			return "bg-gray-500"
	}
}

export function Comunidades() {
	// Use TanStack Query for data fetching with infinite scroll
	const { data: communities, } = useInfiniteQuery<ResponseListCommunities>({
		queryKey: ["communities"],
		staleTime: 1000 * 60 * 5, // 5 minutes
		queryFn: async ({ pageParam = null }) => {
			const queryObj: Record<string, string> = {}

			if (pageParam) {
				queryObj.after = String(pageParam)
			}

			const query = new URLSearchParams(queryObj)

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities/public?${query.toString()}`, {
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
	const allCommunities = useMemo(() => {
		if (!communities) return []

		// Flatten the pages array and extract items from each page
		return communities.pages.flatMap((page) => page.Data || [])
	}, [communities])

	return (
		<>
			<Header title="Comunidades" displayBackButton />

			<main className="container mx-auto py-8 px-4 min-h-screen">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
					<div>
						<h1 className="text-3xl font-bold">Comunidades</h1>
						<p className="text-muted-foreground mt-1">
							Encontre e participe de comunidades de jogadores com interesses similares
						</p>
					</div>
					<Button asChild>
						<Link href="/comunidades/criar" className="text-white">
							<Plus className="mr-2 h-4 w-4" /> Criar Comunidade
						</Link>
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{allCommunities.map((community) => (
						<Link href={`/comunidades/${community.Handle}`} key={community.Id}>
							<Card className="h-full hover:shadow-md transition-shadow">
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<div className="relative h-12 w-12 rounded-full overflow-hidden">
												<Image
													src={community.AvatarUrl || "/placeholder.svg"}
													alt={community.Name}
													fill
													className="object-cover"
												/>
											</div>
											<div>
												<CardTitle className="text-lg">{community.Name}</CardTitle>
												<CardDescription>@{community.Handle}</CardDescription>
												<div className="flex gap-2 items-center text-sm">
													<MapPin className="h-4 w-4" />
													<p>{community.Location.City}, {community.Location.State}</p>
												</div>
											</div>
										</div>
										<Badge className={getAffiliationColor(community.AffiliationType) + " text-white"}>
											{translateAffiliationType(community.AffiliationType)}
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-2 text-sm">
										<div className="flex items-center gap-1">
											<Users className="h-4 w-4 text-muted-foreground" />
											<span>
												{
													community.MemberCount === 1 ? "1 membro" :
														community.MemberCount + " membros"
												}
											</span>
										</div>
									</div>
								</CardContent>
								<CardFooter className="text-xs text-muted-foreground border-t pt-4">
									<div className="flex items-center gap-1">
										<Clock className="h-3 w-3" />
										<span>Desde {formatDate(community.CreatedAt)}</span>
									</div>
								</CardFooter>
							</Card>
						</Link>
					))}
				</div>
			</main >
		</>
	)
}
