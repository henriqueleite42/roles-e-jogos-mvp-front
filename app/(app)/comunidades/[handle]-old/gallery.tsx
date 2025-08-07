"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CommunityData, Profile, ResponseGetGallery } from "@/types/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Calendar, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useMemo, useState } from "react"

export function ProfileGallery({ community }: { community: CommunityData }) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)

	// Use TanStack Query for data fetching with infinite scroll
	const { data: images, isPending, fetchNextPage, error } = useInfiniteQuery<ResponseGetGallery>({
		queryKey: ["community-images", community.Id],
		staleTime: 1000 * 60 * 5, // 5 minutes
		queryFn: async ({ pageParam = null }) => {
			const query = new URLSearchParams({
				communityId: String(community.Id)
			})

			if (pageParam) {
				query.set("after", String(pageParam))
			}

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medias/community?${query.toString()}`, {
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
	const allImages = useMemo(() => {
		if (!images) return []

		// Flatten the pages array and extract items from each page
		return images.pages.flatMap((page) => page.Data || [])
	}, [images])

	const nextImage = () => {
		if (community && allImages.length > 0) {
			setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
		}
	}

	const prevImage = () => {
		if (community && allImages.length > 0) {
			setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calendar className="h-5 w-5" />
					Histórico de Imagens
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{isPending && (
						<div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[100vh]">
							<Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
							<p className="text-lg text-muted-foreground">Carregando imagens...</p>
						</div>
					)}
					{error && (
						<div className="container mx-auto py-8 px-4">
							<Alert variant="destructive" className="mb-6">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Erro ao carregar imagens: {error.message}. Por favor, tente novamente mais tarde.
								</AlertDescription>
							</Alert>
							<Button onClick={() => window.location.reload()}>Tentar novamente</Button>
						</div>
					)}

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
				</div>
			</CardContent>
		</Card>
	)
}