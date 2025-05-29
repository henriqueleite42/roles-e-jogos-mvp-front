"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import NextImage from "next/image"
import { Calendar, X, ChevronLeft, ChevronRight, Gamepad2, MapPin, Users, Loader2, Plus, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatEventDate } from "../eventos/utils"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Auth, MediaData, ResponseGetGallery } from "@/types/api"
import Link from "next/link"
import { canDo } from "@/lib/can-do-something"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadImage } from "@/lib/api/upload-image"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/header"

// Form schema with validation
const imageFormSchema = z.object({
	description: z.string().max(512).optional(),
})

type ImageFormValues = z.infer<typeof imageFormSchema>

interface MutationParams extends ImageFormValues {
	Image: File | null
}

// Add this custom hook for masonry layout
const useMasonry = (images: MediaData[], columnWidth = 300) => {
	const [columns, setColumns] = useState<MediaData[][]>([])
	const [columnCount, setColumnCount] = useState(1)
	const containerRef = useRef<HTMLDivElement>(null)

	const calculateColumns = useCallback(() => {
		if (!containerRef.current) return

		const containerWidth = containerRef.current.offsetWidth
		const gap = 16 // 1rem gap
		const newColumnCount = Math.max(1, Math.floor((containerWidth + gap) / (columnWidth + gap)))

		if (newColumnCount !== columnCount) {
			setColumnCount(newColumnCount)
		}
	}, [columnWidth, columnCount])

	useEffect(() => {
		calculateColumns()
		window.addEventListener("resize", calculateColumns)
		return () => window.removeEventListener("resize", calculateColumns)
	}, [calculateColumns])

	useEffect(() => {
		if (images.length === 0) return

		// Initialize columns
		const newColumns: MediaData[][] = Array.from({ length: columnCount }, () => [])
		const columnHeights = new Array(columnCount).fill(0)

		// Distribute images across columns
		images.forEach((image) => {
			// Find the shortest column
			const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))

			// Add image to shortest column
			newColumns[shortestColumnIndex].push(image)

			// Update column height (approximate based on aspect ratio)
			const aspectRatio = image.Height / image.Width
			const imageHeight = columnWidth * aspectRatio
			columnHeights[shortestColumnIndex] += imageHeight + 16 // Add gap
		})

		setColumns(newColumns)
	}, [images, columnCount, columnWidth])

	return { columns, containerRef }
}

// Update the component to use the new masonry layout
export default function GalleryPage({ auth }: { auth?: Auth }) {
	const queryClient = useQueryClient()

	const [imageToUpload, setImageToUpload] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

	// Initialize form
	const form = useForm<ImageFormValues>({
		resolver: zodResolver(imageFormSchema),
	})

	const mutation = useMutation({
		mutationFn: async (body: MutationParams) => {
			if (!body.Image) {
				throw new Error("imagem obrigatoria")
			}

			await new Promise((res, rej) => {
				const img = new Image()
				img.onload = async () => {
					const { FilePath } = await uploadImage({
						FileName: body.Image!.name,
						ImageBlob: body.Image!,
						Kind: "MEDIA_IMAGE"
					})

					const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/medias', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							Description: body.description,
							Width: img.width,
							Height: img.height,
							Path: FilePath,
						}),
						credentials: 'include',
					});

					if (!response.ok) {
						const error = await response.text()
						console.error(error);
						return rej(error)
					}

					URL.revokeObjectURL(img.src) // Clean up memory

					return res(undefined)
				}
				img.src = URL.createObjectURL(body.Image!)
			})
		},
		onSuccess: () => {
			form.reset()
			setImageToUpload(null)
			setImagePreview(null)
			setIsDialogOpen(false)
			queryClient.invalidateQueries({ queryKey: ["list-medias"] })
		}
	});

	// Handle image upload
	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onloadend = () => {
				setImageToUpload(file)
				setImagePreview(reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	// Clear image preview
	const clearImagePreview = () => {
		setImageToUpload(null)
		setImagePreview(null)
		// Also clear the file input
		const fileInput = document.getElementById("location-image") as HTMLInputElement
		if (fileInput) fileInput.value = ""
	}

	// Handle form submission
	const onSubmit = async (values: ImageFormValues) => {
		mutation.mutate({
			...values,
			Image: imageToUpload,
		})
	}

	// Observer for infinite scroll
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
							<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
								<DialogTrigger asChild>
									<Button className="gap-2 text-white">
										<Plus className="h-4 w-4" />
										Adicionar imagem
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-[550px]">
									<DialogHeader>
										<DialogTitle>Adicionar nova imagem</DialogTitle>
									</DialogHeader>

									<Form {...form}>
										<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
											{/* Description */}
											<FormField
												control={form.control}
												name="description"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Descrição</FormLabel>
														<FormControl>
															<Textarea
																placeholder="Ex: Jogatina de sabadão"
																className="min-h-[100px]"
																disabled={mutation.isPending}
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											{/* Image */}
											<div className="space-y-2">
												<Label htmlFor="image-to-upload">Imagem</Label>
												<div className="flex items-center gap-4">
													<Button
														type="button"
														variant="outline"
														onClick={() => document.getElementById("image-to-upload")?.click()}
														className="gap-2"
													>
														<ImageIcon className="h-4 w-4" />
														Escolher Imagem
													</Button>
													<Input
														id="image-to-upload"
														type="file"
														accept="image/*"
														className="hidden"
														onChange={handleImageUpload}
													/>
													<span className="text-sm text-muted-foreground">
														{imagePreview ? "Imagem selecionada" : "Nenhuma imagem selecionada"}
													</span>
												</div>

												{imagePreview && (
													<div className="relative mt-4 rounded-md overflow-hidden w-full max-w-md">
														<img
															src={imagePreview || "/placeholder.svg"}
															alt="Preview"
															className="w-full h-auto object-cover max-h-[200px]"
														/>
														<Button
															type="button"
															variant="destructive"
															size="icon"
															className="absolute top-2 right-2 h-8 w-8 rounded-full"
															onClick={clearImagePreview}
														>
															<X className="h-4 w-4" />
														</Button>
													</div>
												)}
											</div>

											<DialogFooter>
												<Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
													Cancelar
												</Button>
												<Button type="submit" disabled={mutation.isPending} className="text-white">
													{mutation.isPending ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															Salvando...
														</>
													) : (
														"Adicionar imagem"
													)}
												</Button>
											</DialogFooter>
										</form>
									</Form>
								</DialogContent>
							</Dialog>
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
