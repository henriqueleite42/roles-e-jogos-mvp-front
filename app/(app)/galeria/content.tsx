"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import NextImage from "next/image"
import { Calendar, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInfiniteQuery } from "@tanstack/react-query"
import { MediaData, ResponseGetGallery } from "@/types/api"
import Link from "next/link"

import { Header } from "@/components/header"
import { useMasonry } from "@/lib/mansory"
import { ImageDetails } from "./details"
import { useToast } from "@/hooks/use-toast"

interface Params {
	preSelectedMedia?: MediaData
}

interface SelectedImage {
	Index: number
	Data: MediaData
}

const mediasData: Array<MediaData> = []

// Update the component to use the new masonry layout
export default function GalleryPage({ preSelectedMedia }: Params) {
	const { toast } = useToast()

	const [isLoadingImageDetails, setIsLoadingImageDetails] = useState(false)
	const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
		preSelectedMedia ? {
			Index: -1,
			Data: preSelectedMedia
		} : null
	)

	// Use TanStack Query for data fetching with infinite scroll
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<ResponseGetGallery>({
		queryKey: ["list-medias"],
		staleTime: 1000 * 60 * 5, // 5 minutes
		queryFn: async ({ pageParam = null }) => {
			const queryObj: Record<string, string> = {}

			if (pageParam) {
				queryObj.after = String(pageParam)
			}

			const query = new URLSearchParams(queryObj)

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medias/all?${query.toString()}`, {
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

	// Navigation functions
	const seeDetails = useCallback(async (mediaIndex: number) => {
		if (mediasData[mediaIndex]) {
			setSelectedImage({
				Index: mediaIndex,
				Data: mediasData[mediaIndex]
			})
			return
		}

		setIsLoadingImageDetails(true)

		const mediaId = allItems[mediaIndex].Id

		const query = new URLSearchParams({
			mediaId: String(mediaId)
		})

		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medias?${query.toString()}`, {
			credentials: "include"
		})

		if (!response.ok) {
			toast({
				title: "Erro ao pegar dados da imagem",
				description: "Não foi possível pegar dados da imagem.",
				variant: "destructive",
			})

			setIsLoadingImageDetails(false)

			return
		}

		const mediaData = await response.json() as MediaData

		mediasData[mediaIndex] = mediaData

		setSelectedImage({
			Index: mediaIndex,
			Data: mediaData
		})
		setIsLoadingImageDetails(false)
	}, [allItems, setSelectedImage, setIsLoadingImageDetails])

	const { columns, containerRef } = useMasonry(allItems)

	return (
		<>
			<Header title="Galeria" displayBackButton />

			<div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-white">
				<main className="flex-1 container mx-auto pt-4 pb-8 px-4">
					<div className="flex md:flex-row justify-around items-start md:items-center gap-4 mb-6">
						<Link href="/galeria/criar">
							<Button className="gap-2 text-white">
								<Plus className="h-4 w-4" />
								Adicionar imagem
							</Button>
						</Link>
					</div>

					<div ref={containerRef} className="flex gap-4 items-start">
						{columns.map((column, columnIndex) => (
							<div key={columnIndex} className="flex-1 flex flex-col gap-4">
								{column.map((image, idx) => (
									<div
										key={image.Id}
										className="group cursor-pointer"
										onClick={() => seeDetails(idx)}
									>
										<div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] bg-white">
											<NextImage
												src={image.Url || "/placeholder.svg"}
												alt={"image"}
												width={image.Width}
												height={image.Height}
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


					{/* Empty state */}
					{
						columns.length === 0 && (
							<div className="text-center py-20">
								<div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
									<Calendar className="h-12 w-12 text-gray-400" />
								</div>
								<h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma imagem encontrada</h3>
								<p className="text-gray-500">Seja o primeiro a compartilhar uma foto da sua sessão de jogos!</p>
							</div>
						)
					}
				</main >

				{/* Full Screen Modal */}
				{
					selectedImage && (
						<ImageDetails
							isLoading={isLoadingImageDetails}
							image={selectedImage.Data}
							goToPrevious={() => seeDetails(selectedImage.Index - 1)}
							canGoToPrevious={selectedImage.Index <= 0}
							goToNext={() => seeDetails(selectedImage.Index + 1)}
							canGoToNext={selectedImage.Index! >= allItems.length - 1}
							close={() => setSelectedImage(null)}
						/>
					)
				}
			</div >
		</>
	)
}
