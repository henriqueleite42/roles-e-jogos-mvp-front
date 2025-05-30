"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Auth, Event, ResponseGetGallery } from "@/types/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";
import NextImage from "next/image"
import { useMasonry } from "@/lib/mansory";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { canDo } from "@/lib/can-do-something";

interface Params {
	event: Event
	auth?: Auth
}

export function EventImages({ event, auth }: Params) {
	const canAddImg = canDo(auth)

	// Use TanStack Query for data fetching with infinite scroll
	const { data, isFetchingNextPage } = useInfiniteQuery<ResponseGetGallery>({
		queryKey: ["event-images", event.Id],
		staleTime: 1000 * 60 * 5, // 5 minutes
		queryFn: async ({ pageParam = null }) => {
			const queryObj: Record<string, string> = {
				eventId: String(event.Id)
			}

			if (pageParam) {
				queryObj.after = String(pageParam)
			}

			const query = new URLSearchParams(queryObj)

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medias/event?${query.toString()}`, {
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
	const allItems = useMemo(() => {
		if (!data) return []

		// Flatten the pages array and extract items from each page
		return data.pages.flatMap((page) => page.Data || [])
	}, [data])

	const { columns, containerRef } = useMasonry(allItems)

	const observerTarget = useRef<HTMLDivElement | null>(null)

	const redirectQuery = new URLSearchParams({
		event: JSON.stringify({
			Id: event.Id,
			Name: event.Name,
			Slug: event.Slug,
			IconUrl: event.IconUrl,
		}),
		location: JSON.stringify({
			Id: event.Location.Id,
			Name: event.Location.Name,
		})
	})

	return (<>
		{(allItems.length > 0 || canAddImg) && (
			<Card>
				<CardHeader>
					<CardTitle>
						Galeria
					</CardTitle>
				</CardHeader>
				<CardContent>
					{canAddImg && (
						<div className="flex md:flex-row justify-around items-start md:items-center gap-4 mb-6">
							<Link href={
								`/galeria/criar?${redirectQuery.toString()}`
							}>
								<Button className="gap-2 text-white">
									<Plus className="h-4 w-4" />
									Adicionar imagem
								</Button>
							</Link>
						</div>
					)}

					<div ref={containerRef} className="flex gap-4 items-start">
						{columns.map((column, columnIndex) => (
							<div key={columnIndex} className="flex-1 flex flex-col gap-4">
								{column.map((image) => (
									<div
										key={image.Id}
										className="group cursor-pointer"
									>
										<div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] bg-white">
											<NextImage
												src={image.Url || "/placeholder.svg"}
												alt={"image"}
												width={image.Width || 300}
												height={image.Height || 300}
												className="w-full h-auto object-cover"
												sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
											/>

											{/* Overlay on hover */}
											<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

											{/* <Button
													variant="ghost"
													size="icon"
													className={cn(
														"absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300",
														"bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg",
														image.isLiked && "opacity-100 text-red-500 bg-white",
													)}
													onClick={(e) => handleLike(image.Id, e)}
												>
													<Heart className={cn("h-4 w-4", image.isLiked && "fill-current")} />
												</Button> */}

											<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
												<h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{image.Description}</h3>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Avatar className="w-6 h-6 border-2 border-white/50">
															<AvatarImage src={image.Owner?.AvatarUrl} width={300} height={300} alt={image.Owner?.Handle} />
															<AvatarFallback className="text-xs bg-white/20 text-white">
																{image.Owner?.Handle}
															</AvatarFallback>
														</Avatar>
														<span className="text-white/90 text-xs font-medium">{image.Owner?.Handle}</span>
													</div>
													{/* <div className="flex items-center gap-1">
															<Heart className="h-3 w-3 text-white/90" />
															<span className="text-white/90 text-xs font-medium">{image.likes}</span>
														</div> */}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						))}
					</div>

					{/* Infinite scroll observer element */}
					<div ref={observerTarget} className="py-4 flex justify-center">
						{isFetchingNextPage && (
							<div className="flex items-center gap-2">
								<Loader2 className="h-5 w-5 animate-spin text-orange-500" />
								<span className="text-sm text-muted-foreground">Carregando mais imagens...</span>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		)}
	</>)
}