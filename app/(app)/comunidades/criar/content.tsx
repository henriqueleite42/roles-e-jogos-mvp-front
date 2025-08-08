"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ImageIcon, Loader2, MapPin, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"
import { useInfiniteQuery, useMutation } from "@tanstack/react-query"
import { ResponseSearchLocations } from "@/types/api"
import { useToast } from "@/hooks/use-toast"
import { uploadImage } from "@/lib/api/upload-image"

// Form schema with validation
const formSchema = z.object({
	Handle: z.string().min(3, {
		message: "O identificador da comunidade deve ter pelo menos 3 caracteres.",
	}).max(24, {
		message: "O identificador da comunidade deve ter no maximo 24 caracteres.",
	}),
	Name: z.string().min(3, {
		message: "O nome da comunidade deve ter pelo menos 3 caracteres.",
	}).max(64, {
		message: "O nome da comunidade deve ter no maximo 64 caracteres.",
	}),
	Description: z.string().max(1024, {
		message: "A descrição deve ter no maximo 1024 caracteres.",
	}),
	AffiliationType: z.enum(["PUBLIC"]),
	WebsiteUrl: z.string().url().optional().nullable(),
	WhatsappUrl: z.string().url().optional().nullable(),
	InstagramUrl: z.string().url().optional().nullable(),
	TiktokUrl: z.string().url().optional().nullable(),
	Location: z.object(
		{
			Id: z.coerce.number().int(),
			Name: z.string(),
			Address: z.string(),
			IconUrl: z.string().optional().nullable(),
			Kind: z.string(),
			CreatedBy: z.number().int(),
			CreatedAt: z.coerce.date(),
		},
		{
			required_error: "Selecione um local para a comunidade."
		},
	),
}).refine((data) => {
	if (!data.Handle) return false;

	if (
		data.Handle.startsWith("_") ||
		data.Handle.startsWith(".") ||
		data.Handle.endsWith("_") ||
		data.Handle.endsWith(".")
	) {
		return false;
	}

	return true;
}, {
	message: "O identificador não pode começar ou terminar com _ ou .",
	path: ["Handle"]
}).refine((data) => {
	if (!data.Handle) return false;

	if (new RegExp("^\\d").test(data.Handle)) {
		return false;
	}

	return true;
}, {
	message: "O identificador não pode começar com números",
	path: ["Handle"]
}).refine((data) => {
	if (!data.Handle) return false;

	if (new RegExp("^\\d$").test(data.Handle)) {
		return false;
	}

	return true;
}, {
	message: "O identificador não pode ser apenas números",
	path: ["Handle"]
});

type FormValues = z.infer<typeof formSchema>

interface MutationParams extends FormValues {
	CommunityImage: File | null
}

export default function FormCreateCommunity() {
	const { toast } = useToast()
	const router = useRouter()

	const [communityImage, setCommunityImage] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)

	const [locationQuery, setLocationQuery] = useState("")
	const [isLocationPopoverOpen, setIsLocationPopoverOpen] = useState(false)

	const debouncedLocationQuery = useDebounce(locationQuery)

	// Use TanStack Query for data fetching with infinite scroll
	const { data: locationsQuery, isLoading: isSearchingLocations } = useInfiniteQuery<ResponseSearchLocations>({
		queryKey: ["search-locations", debouncedLocationQuery],
		queryFn: async () => {
			if (debouncedLocationQuery.length < 3) {
				return {
					page: {
						Data: []
					}
				}
			}

			const query = new URLSearchParams({
				query: debouncedLocationQuery
			})

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/search/visible?${query.toString()}`, {
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`Erro ao pegar dados da API: ${response.status}`)
			}

			return response.json()
		},
		getNextPageParam: (lastPage) => {
			// Return undefined if there are no more pages or if nextCursor is not provided
			return undefined
		},
		initialPageParam: null,
	})

	// Process all items from all pages
	const locations = useMemo(() => {
		if (!locationsQuery) return []

		// Flatten the pages array and extract items from each page
		return locationsQuery.pages.flatMap((page) => page.Data || [])
	}, [locationsQuery])

	const mutation = useMutation({
		mutationFn: async (body: MutationParams) => {
			const reqBody = {
				Handle: body.Handle,
				Name: body.Name,
				Description: body.Description,
				AffiliationType: body.AffiliationType,
				LocationId: body.Location.Id,
				WebsiteUrl: body.WebsiteUrl,
				WhatsappUrl: body.WhatsappUrl,
				InstagramUrl: body.InstagramUrl,
				TiktokUrl: body.TiktokUrl,
			} as any

			if (!body.CommunityImage) {
				throw new Error("avatar required")
			}

			const { FilePath } = await uploadImage({
				FileName: body.CommunityImage?.name,
				ImageBlob: body.CommunityImage,
				Kind: "COMMUNITY_AVATAR_IMG"
			})

			reqBody.AvatarPath = FilePath

			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/communities', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(reqBody),
				credentials: 'include',
			});

			if (!res.ok) {
				const error = await res.text()
				console.error(error);
				throw new Error(error)
			}

			return res.json() as Promise<{
				Handle: string
			}>
		},
		onSuccess: (data) => {
			router.push("/comunidades/" + data.Handle)
		},
		onError: (err) => {
			if (err.message === "file size exceeded") {
				toast({
					title: "Erro ao criar comunidade",
					description: "Imagem grande de mais, limite de 5 MB",
					variant: "destructive",
				})
				return
			}
			if (err.message === "avatar required") {
				toast({
					title: "Erro ao criar comunidade",
					description: "A comunidade precisa ter uma imagem",
					variant: "destructive",
				})
				return
			}

			console.error(err)
			toast({
				title: "Erro ao criar comunidade",
				description: err.message,
				variant: "destructive",
			})
		}
	});

	// Initialize form
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			AffiliationType: "PUBLIC",
		},
	})

	// Handle image upload
	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onloadend = () => {
				setCommunityImage(file)
				setImagePreview(reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	// Clear image preview
	const clearImagePreview = () => {
		setCommunityImage(null)
		setImagePreview(null)
		// Also clear the file input
		const fileInput = document.getElementById("community-image") as HTMLInputElement
		if (fileInput) fileInput.value = ""
	}

	// Handle location query change
	const handleLocationQueryChange = (value: string) => {
		setLocationQuery(value)
		if (!isLocationPopoverOpen) {
			setIsLocationPopoverOpen(true)
		}
	}

	// Handle form submission
	const onSubmit = async (values: FormValues) => {
		mutation.mutate({
			...values,
			CommunityImage: communityImage
		})
	}

	return (
		<main className="flex-1 container mx-auto py-8 px-4 mb-16">
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle>Criar Nova Comunidade</CardTitle>
					<CardDescription>Preencha os detalhes da sua comunidade para encontrar pessoascom gostos semelhantes.</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{/* Community Name */}
							<FormField
								control={form.control}
								name="Name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nome da Comunidade *</FormLabel>
										<FormControl>
											<Input placeholder="Ex: Jogatinas de Campinas" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Community Handle */}
							<FormField
								control={form.control}
								name="Handle"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Identificador da Comunidade *</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="Ex: jogatinas-de-campinas"
												onChange={(e) => {
													const onlyAllowed = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '');
													field.onChange(onlyAllowed);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Community Description */}
							<FormField
								control={form.control}
								name="Description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Descrição</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Descreva sua comunidade e o que torna ela especial."
												className="min-h-[120px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Event Image */}
							<div className="space-y-2">
								<Label htmlFor="community-image">Avatar da comunidade</Label>
								<div className="flex items-center gap-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => document.getElementById("community-image")?.click()}
										className="gap-2"
									>
										<ImageIcon className="h-4 w-4" />
										Escolher Imagem
									</Button>
									<Input
										id="community-image"
										type="file"
										accept=".png,.jpg,.jpeg,.webp"
										className="hidden"
										onChange={handleImageUpload}
									/>
									<span className="text-sm text-muted-foreground">
										{imagePreview ? "Imagem selecionada" : "Escolha uma imagem que represente sua comunidade."}
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

							{/* Location */}
							<FormField
								control={form.control}
								name="Location"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Local</FormLabel>
										<Popover open={isLocationPopoverOpen} onOpenChange={setIsLocationPopoverOpen}>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														role="combobox"
														className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
													>
														{field.value ? (
															<div className="flex items-center gap-2 text-left">
																<MapPin className="h-4 w-4 flex-shrink-0" />
																<div className="truncate">
																	<div>{field.value.Name}</div>
																	<div className="text-xs text-muted-foreground truncate break-words whitespace-normal">{field.value.Address}</div>
																</div>
															</div>
														) : (
															<div className="flex items-center gap-2">
																<Search className="h-4 w-4" />
																<span>Buscar local...</span>
															</div>
														)}
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-[300px] p-0" align="start">
												<Command>
													<CommandInput
														placeholder="Buscar por nome ou endereço..."
														value={locationQuery}
														onValueChange={handleLocationQueryChange}
													/>
													<CommandList>
														{isSearchingLocations && (
															<div className="flex items-center justify-center py-6">
																<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
															</div>
														)}

														{!isSearchingLocations && locationQuery.length < 3 && (
															<CommandEmpty>Digite pelo menos 3 caracteres para buscar</CommandEmpty>
														)}

														{!isSearchingLocations && locationQuery.length >= 3 && locations.length === 0 && (
															<CommandEmpty>Nenhum local encontrado</CommandEmpty>
														)}

														{locations.length > 0 && (
															<CommandGroup>
																{locations.map((location) => (
																	<CommandItem
																		key={location.Id}
																		value={location.Name}
																		onSelect={() => {
																			form.setValue("Location", location, { shouldValidate: true })
																			setIsLocationPopoverOpen(false)
																		}}
																	>
																		<div className="flex flex-col">
																			<div>{location.Name}</div>
																			<div className="text-xs text-muted-foreground">{location.Address}</div>
																		</div>
																	</CommandItem>
																))}
															</CommandGroup>
														)}
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Website Url */}
							<FormField
								control={form.control}
								name="WebsiteUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Site da comunidade</FormLabel>
										<FormControl>
											<Input placeholder="Ex: https://rolesejogos.com.br" {...field} value={field.value || undefined} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* Whatsapp Url */}
							<FormField
								control={form.control}
								name="WhatsappUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>WhatsApp da comunidade</FormLabel>
										<FormControl>
											<Input placeholder="Ex: https://chat.whatsapp.com/rolesejogos" {...field} value={field.value || undefined} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* Instagram Url */}
							<FormField
								control={form.control}
								name="InstagramUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Instagram da comunidade</FormLabel>
										<FormControl>
											<Input placeholder="Ex: https://www.instagram.com/rolesejogos" {...field} value={field.value || undefined} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* Tiktok Url */}
							<FormField
								control={form.control}
								name="TiktokUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>TikTok da comunidade</FormLabel>
										<FormControl>
											<Input placeholder="Ex: https://tiktok.com/@rolesejogos" {...field} value={field.value || undefined} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end gap-4 pt-4">
								<Button type="button" variant="outline" asChild>
									<Link href="/comunidades">Cancelar</Link>
								</Button>
								<Button type="submit" disabled={mutation.isPending} className="text-white">
									{mutation.isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Criando...
										</>
									) : (
										"Criar Comunidade"
									)}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</main>
	)
}