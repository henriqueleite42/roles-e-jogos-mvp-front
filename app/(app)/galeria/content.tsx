"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import NextImage from "next/image"
import { Calendar, X, ChevronLeft, ChevronRight, Gamepad2, MapPin, Users, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatEventDate } from "../eventos/utils"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Auth, MediaData, ResponseGetGallery } from "@/types/api"
import Link from "next/link"
import { canDo } from "@/lib/can-do-something"

import { Header } from "@/components/header"
import { useMasonry } from "@/lib/mansory"

// Update the component to use the new masonry layout
export default function GalleryPage({ auth }: { auth?: Auth }) {
	const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

	const observerTarget = useRef<HTMLDivElement | null>(null)

	// Use TanStack Query for data fetching with infinite scroll
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<ResponseGetGallery>({
		queryKey: ["list-medias"],
		queryFn: async ({ pageParam = null }) => {
			const queryObj: Record<string, string> = {}

			if (pageParam) {
				queryObj.after = String(pageParam)
			}

			const query = new URLSearchParams(queryObj)

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medias?${query.toString()}`, {
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

	// Navigation functions
	const goToPrevious = useCallback(() => {
		if (selectedImageIndex !== null && selectedImageIndex > 0) {
			setSelectedImageIndex(selectedImageIndex - 1)
		}
	}, [selectedImageIndex])

	const goToNext = useCallback(() => {
		if (selectedImageIndex !== null && selectedImageIndex < allItems.length - 1) {
			setSelectedImageIndex(selectedImageIndex + 1)
		}
	}, [selectedImageIndex, allItems.length])

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (selectedImageIndex === null) return

			switch (e.key) {
				case "ArrowLeft":
					e.preventDefault()
					goToPrevious()
					break
				case "ArrowRight":
					e.preventDefault()
					goToNext()
					break
				case "Escape":
					e.preventDefault()
					setSelectedImageIndex(null)
					break
			}
		}

		if (selectedImageIndex !== null) {
			document.addEventListener("keydown", handleKeyDown)
			document.body.style.overflow = "hidden"
		} else {
			document.body.style.overflow = "unset"
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown)
			document.body.style.overflow = "unset"
		}
	}, [selectedImageIndex, goToPrevious, goToNext])

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

	const selectedImage = selectedImageIndex !== null ? allItems[selectedImageIndex] : null

	return (
		<>
			<Header title="Galeria" displayBackButton />

			<div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-white">
				<main className="flex-1 container mx-auto pt-4 pb-8 px-4">
					{canDo(auth) && (
						<div className="flex md:flex-row justify-around items-start md:items-center gap-4 mb-6">
							<Link href="/galeria/criar">
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
								{column.map((image, idx) => (
									<div
										key={image.Id}
										className="group cursor-pointer"
										onClick={() => setSelectedImageIndex(idx)}
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

											<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
												<h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{image.Description}</h3>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Avatar className="w-6 h-6 border-2 border-white/50">
															<AvatarImage src={image.Owner.AvatarUrl || "/placeholder.svg"} alt={image.Owner.Handle} />
															<AvatarFallback className="text-xs bg-white/20 text-white">
																{image.Owner.Handle}
															</AvatarFallback>
														</Avatar>
														<span className="text-white/90 text-xs font-medium">{image.Owner.Handle}</span>
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
						<div className="fixed inset-0 bg-black/95 z-50 flex items-center flex flex-col lg:flex-row max-w-7xl mx-auto p-4 gap-6 overflow-auto">
							{/* Close button */}
							<Button
								variant="ghost"
								size="icon"
								className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
								onClick={() => setSelectedImageIndex(null)}
							>
								<X className="h-6 w-6" />
							</Button>

							{/* Main content */}
							{/* Image */}
							<div
								className="relative flex-shrink-0"
							// onTouchStart={handleTouchStart}
							// onTouchMove={handleTouchMove}
							// onTouchEnd={handleTouchEnd}
							// onClick={() => handleDoubleTap(selectedImage)}
							>
								<NextImage
									src={selectedImage.Url || "/placeholder.svg"}
									alt="image"
									width={selectedImage.Width}
									height={selectedImage.Height}
									className="max-w-full rounded-lg"
									priority
								/>
							</div>


							{/* Navigation buttons */}
							<div className="flex justify-between w-full">
								<Button
									variant="ghost"
									size="icon"
									className="z-10 text-white hover:bg-white/10"
									onClick={goToPrevious}
									disabled={selectedImageIndex! <= 0}
								>
									<ChevronLeft className="h-8 w-8" />
								</Button>

								<Button
									variant="ghost"
									size="icon"
									className="z-10 text-white hover:bg-white/10"
									onClick={goToNext}
									disabled={selectedImageIndex! >= allItems.length - 1}
								>
									<ChevronRight className="h-8 w-8" />
								</Button>
							</div>

							{/* Image details */}
							<div className="lg:max-w-md w-full text-white space-y-6">
								<div>
									<p className="text-white/80 leading-relaxed">{selectedImage.Description}</p>
								</div>

								<div className="flex items-center gap-3">
									<Avatar className="w-10 h-10">
										<AvatarImage
											src={selectedImage.Owner.AvatarUrl || "/placeholder.svg"}
											alt={selectedImage.Owner.Handle}
										/>
										<AvatarFallback>{selectedImage.Owner.Handle}</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium">{selectedImage.Owner.Handle}</p>
										<div className="flex items-center gap-2 text-sm text-white/70">
											<Calendar className="h-3 w-3" />
											<span>{formatEventDate(selectedImage.CreatedAt)}</span>
										</div>
									</div>
								</div>

								{/* Related Information Section */}
								{(selectedImage.Game || selectedImage.Event || selectedImage.Location) && (
									<div className="space-y-3">
										<h3 className="text-lg font-semibold text-white/90">Informações Relacionadas</h3>

										{/* Game Information */}
										{selectedImage.Game && (
											<div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
												<div className="flex items-center gap-2 flex-1">
													<Gamepad2 className="h-4 w-4 text-green-400 flex-shrink-0" />
													<div className="flex items-center gap-2 min-w-0">
														{selectedImage.Game.IconUrl && (
															<div className="w-6 h-6 relative flex-shrink-0">
																<NextImage
																	src={selectedImage.Game.IconUrl || "/placeholder.svg"}
																	alt={selectedImage.Game.Name}
																	fill
																	className="object-cover rounded"
																/>
															</div>
														)}
														<div className="min-w-0">
															<p className="text-sm font-medium text-white truncate">{selectedImage.Game.Name}</p>
														</div>
													</div>
												</div>
											</div>
										)}

										{/* Event Information */}
										{selectedImage.Event && (
											<Link href={"/eventos/" + selectedImage.Event.Slug} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
												<div className="flex items-center gap-2 flex-1">
													<Users className="h-4 w-4 text-purple-400 flex-shrink-0" />
													<div className="min-w-0">
														<p className="text-sm font-medium text-white truncate">{selectedImage.Event.Name}</p>
													</div>
												</div>
											</Link>
										)}

										{/* Location Information */}
										{selectedImage.Location && (
											<div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
												<div className="flex items-center gap-2 flex-1">
													<MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
													<div className="min-w-0">
														<p className="text-sm font-medium text-white truncate">{selectedImage.Location.Name}</p>
													</div>
												</div>
											</div>
										)}
									</div>
								)}

								{/* <div className="flex items-center gap-4">
								<Button
									variant="ghost"
									className={cn(
										"text-white hover:bg-white/10 gap-2",
										selectedImage.isLiked && "text-red-400 hover:text-red-300",
									)}
									onClick={() => handleLike(selectedImage.Id)}
								>
									<Heart className={cn("h-5 w-5", selectedImage.isLiked && "fill-current")} />
									<span>{selectedImage.likes}</span>
								</Button>
							</div> */}

								<div className="text-sm text-white/60">
									<p className="mt-1">💡 Dica: Use as setas do teclado, deslize ou toque duas vezes para curtir</p>
								</div>
							</div>
						</div>
					)
				}
			</div >
		</>
	)
}
