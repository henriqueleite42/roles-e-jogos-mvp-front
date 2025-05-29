"use client"

import type React from "react"

import { useMemo, useState } from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Building2, Home, ImageIcon, Loader2, MapPin, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ResponseListLocations } from "@/types/api"
import Link from "next/link"
import { uploadImage } from "@/lib/api/upload-image"
import { Header } from "@/components/header"

// Form schema with validation
const locationFormSchema = z.object({
	name: z.string().min(3, {
		message: "O nome do local deve ter pelo menos 3 caracteres.",
	}),
	address: z.string().min(10, {
		message: "O endereço deve ter pelo menos 10 caracteres.",
	}),
	kind: z.enum(["BUSINESS", "PERSONAL"], {
		required_error: "Selecione o tipo de local.",
	}),
})

type LocationFormValues = z.infer<typeof locationFormSchema>

interface MutationParams extends LocationFormValues {
	LocationImage: File | null
}

export function LocationsPageContent() {
	const queryClient = useQueryClient()

	const [eventImage, setEventImage] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	// Use TanStack Query for data fetching with infinite scroll
	const { data } = useInfiniteQuery<ResponseListLocations>({
		queryKey: ["list-locations"],
		queryFn: async ({ pageParam = null }) => {
			const query = new URLSearchParams()

			if (pageParam) {
				query.set("after", pageParam as string)
			}

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations?${query.toString()}`, {
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

	const mutation = useMutation({
		mutationFn: async (body: MutationParams) => {
			var icon: any = undefined
			if (body.LocationImage !== null) {
				const { FilePath } = await uploadImage({
					FileName: body.LocationImage?.name,
					ImageBlob: body.LocationImage,
					Kind: "LOCATION_ICON"
				})

				icon = FilePath
			}

			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/locations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					Name: body.name,
					Address: body.address,
					Kind: body.kind,
					IconPath: icon,
				}),
				credentials: 'include',
			});

			if (!res.ok) {
				const error = await res.text()
				console.error(error);
				throw new Error(error)
			}

		},
		onSuccess: () => {
			form.reset()
			setEventImage(null)
			setImagePreview(null)
			setIsDialogOpen(false)
			queryClient.invalidateQueries({ queryKey: ["list-locations"] })
		}
	});

	// Initialize form
	const form = useForm<LocationFormValues>({
		resolver: zodResolver(locationFormSchema),
		defaultValues: {
			name: "",
			address: "",
			kind: "BUSINESS",
		},
	})

	// Handle image upload
	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onloadend = () => {
				setEventImage(file)
				setImagePreview(reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	// Clear image preview
	const clearImagePreview = () => {
		setEventImage(null)
		setImagePreview(null)
		// Also clear the file input
		const fileInput = document.getElementById("location-image") as HTMLInputElement
		if (fileInput) fileInput.value = ""
	}

	// Handle form submission
	const onSubmit = async (values: LocationFormValues) => {
		mutation.mutate({
			...values,
			LocationImage: eventImage,
		})
	}

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

						<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
							<DialogTrigger asChild>
								<Button className="gap-2 text-white">
									<Plus className="h-4 w-4" />
									Novo Local
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[550px]">
								<DialogHeader>
									<DialogTitle>Adicionar Novo Local</DialogTitle>
									<DialogDescription>Preencha os detalhes do local para adicioná-lo à sua lista.</DialogDescription>
								</DialogHeader>

								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
										{/* Location Name */}
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Nome do Local</FormLabel>
													<FormControl>
														<Input placeholder="Ex: Luderia Central" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										{/* Location Address */}
										<FormField
											control={form.control}
											name="address"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Endereço</FormLabel>
													<FormControl>
														<Input placeholder="Ex: Rua das Flores, 123, São Paulo, SP" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										{/* Location Image */}
										<div className="space-y-2">
											<Label htmlFor="location-image">Imagem do Local</Label>
											<div className="flex items-center gap-4">
												<Button
													type="button"
													variant="outline"
													onClick={() => document.getElementById("location-image")?.click()}
													className="gap-2"
												>
													<ImageIcon className="h-4 w-4" />
													Escolher Imagem
												</Button>
												<Input
													id="location-image"
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

										{/* Location Kind */}
										<FormField
											control={form.control}
											name="kind"
											render={({ field }) => (
												<FormItem className="space-y-3">
													<FormLabel>Tipo de Local</FormLabel>
													<FormControl>
														<RadioGroup
															onValueChange={field.onChange}
															defaultValue={field.value}
															className="flex flex-col space-y-1"
														>
															<FormItem className="flex items-center space-x-3 space-y-0">
																<FormControl>
																	<RadioGroupItem value="BUSINESS" />
																</FormControl>
																<FormLabel className="font-normal flex items-center gap-2">
																	<Building2 className="h-4 w-4 text-blue-600" />
																	Comercial
																</FormLabel>
															</FormItem>
															<FormItem className="flex items-center space-x-3 space-y-0">
																<FormControl>
																	<RadioGroupItem value="PERSONAL" />
																</FormControl>
																<FormLabel className="font-normal flex items-center gap-2">
																	<Home className="h-4 w-4 text-green-600" />
																	Pessoal
																</FormLabel>
															</FormItem>
														</RadioGroup>
													</FormControl>
													<FormDescription>
														Locais comerciais são públicos e podem ser adicionados a qualquer evento. Locais pessoais
														são privados e apenas você pode adicioná-los aos seus eventos.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

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
													"Salvar Local"
												)}
											</Button>
										</DialogFooter>
									</form>
								</Form>
							</DialogContent>
						</Dialog>
					</div>

					{locations.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{locations.map((location) => (
								<Card key={location.Id} className="overflow-hidden hover:shadow-md transition-shadow">
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
							))}
						</div>
					) : (
						<div className="text-center py-10">
							<MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-muted-foreground">Nenhum local encontrado.</p>
							<Button className="mt-4 text-white" onClick={() => setIsDialogOpen(true)}>
								Adicionar Local
							</Button>
						</div>
					)}
				</main>
			</div>
		</>
	)
}
