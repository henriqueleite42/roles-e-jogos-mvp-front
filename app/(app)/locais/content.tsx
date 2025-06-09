"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Loader2, MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useInfiniteQuery } from "@tanstack/react-query"
import { ResponseListLocations } from "@/types/api"
import Link from "next/link"
import { Header } from "@/components/header"

export function LocationsPageContent() {
	// Use TanStack Query for data fetching with infinite scroll
	const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery<ResponseListLocations>({
		queryKey: ["list-locations"],
		queryFn: async ({ pageParam = null }) => {
			const query = new URLSearchParams()

			if (pageParam) {
				query.set("after", pageParam as string)
			}

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/visible?${query.toString()}`, {
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
	const locations = useMemo(() => {
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
		<>
			<Header title="Locais" displayBackButton />

			<div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-white">
				<main className="flex-1 container mx-auto py-8 px-4">
					<div className="flex md:flex-row justify-around items-start md:items-center gap-4 mb-6">
						<Link href="/mapa" >
							<Button className="gap-2 text-white">
								<MapPin className="h-8 w-8 text-white" />
								Ver mapa
							</Button>
						</Link>

						<Link href="/locais/criar" >
							<Button className="gap-2 text-white">
								<Plus className="h-8 w-8 text-white" />
								Cadastrar novo
							</Button>
						</Link>
					</div>

					{locations.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{locations.map((location) => (
								<Link href={"/locais/" + location.Slug} key={location.Id} className="overflow-hidden hover:shadow-md transition-shadow">
									<Card>
										<div className="h-40 relative">
											<Image
												src={location.IconUrl || "/placeholder.svg"}
												alt={location.Name}
												fill
												className="object-cover"
											/>
											<Badge
												className={cn(
													"absolute top-2 right-2",
													location.Kind === "BUSINESS"
														? "bg-blue-100 text-blue-800 hover:bg-blue-100"
														: "bg-green-100 text-green-800 hover:bg-green-100",
												)}
											>
												{location.Kind === "BUSINESS" ? "Comercial" : "Pessoal"}
											</Badge>
										</div>
										<CardHeader className="pb-2">
											<CardTitle className="text-xl">{location.Name}</CardTitle>
										</CardHeader>
										<CardContent className="pb-2">
											<div className="flex items-start gap-2">
												<MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
												<p className="text-sm text-muted-foreground">{location.Address}</p>
											</div>
										</CardContent>
										<CardFooter className="flex justify-between">
											<p className="text-xs text-muted-foreground">
												Adicionado em {new Date(location.CreatedAt).toLocaleDateString("pt-BR")}
											</p>
											<Button variant="ghost" size="sm">
												Editar
											</Button>
										</CardFooter>
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
					) : (
						<div className="text-center py-10">
							<MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-muted-foreground">Nenhum local encontrado.</p>
							<Link href="/locais/criar" >
								<Button className="gap-2 text-white">
									<Plus className="h-8 w-8 text-white" />
									Adicionar local
								</Button>
							</Link>
						</div>
					)}
				</main>
			</div>
		</>
	)
}
