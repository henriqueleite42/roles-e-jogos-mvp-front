"use client"
import { useMemo, useState } from "react"
import Image from "next/image"
import {
	ChevronLeft,
	ChevronRight,
	Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Event, ResponseGetGallery } from "@/types/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import Loading from "@/components/ui/loading"
import Link from "next/link"

interface Params {
	event: Event
}

export const EventImages = ({ event }: Params) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)

	// Use TanStack Query for data fetching with infinite scroll
	const { data: images, isPending, fetchNextPage } = useInfiniteQuery<ResponseGetGallery>({
		queryKey: ["list-event-images", event.Id],
		staleTime: 1000 * 60 * 5, // 5 minutes
		queryFn: async ({ pageParam = null }) => {
			const query = new URLSearchParams({
				eventId: String(event.Id)
			})

			if (pageParam) {
				query.set("after", String(pageParam))
			}

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
		enabled: Boolean(event.Id)
	})

	// Process all items from all pages
	const allImages = useMemo(() => {
		if (!images) return []

		// Flatten the pages array and extract items from each page
		return images.pages.flatMap((page) => page.Data || [])
	}, [images])

	const nextImage = () => {
		if (event && allImages.length > 0) {
			setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
		}
	}

	const prevImage = () => {
		if (event && allImages.length > 0) {
			setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
		}
	}

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
			Slug: event.Location.Slug,
		})
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>Galeria de Imagens</CardTitle>
			</CardHeader>
			<CardContent>
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
				{
					isPending && (
						<Loading />
					)
				}
				{allImages.length > 0 && (
					<div className="relative">
						<div className="aspect-video relative rounded-lg overflow-hidden">
							<Image
								src={allImages[currentImageIndex]?.Url || "/placeholder.svg"}
								alt="img"
								fill
								className="object-cover"
							/>
							{allImages.length > 1 && (
								<>
									<Button
										variant="outline"
										size="icon"
										className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
										onClick={prevImage}
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="icon"
										className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
										onClick={nextImage}
									>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</>
							)}
						</div>
						<div className="flex gap-2 mt-3 overflow-x-auto pb-2">
							{allImages.map((image, index) => (
								<button
									key={image.Id}
									onClick={() => setCurrentImageIndex(index)}
									className={cn(
										"flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden",
										index === currentImageIndex ? "border-orange-500" : "border-gray-200",
									)}
								>
									<Image
										src={image.Url || "/placeholder.svg"}
										alt="img"
										width={64}
										height={64}
										className="object-cover w-full h-full"
									/>
								</button>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}