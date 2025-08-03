"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, ImageIcon, Loader2, MapPin, Search, X, Plus, Users, Clock, GamepadIcon, Home, SquareArrowOutUpRight, DollarSign, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query"
import { EventData, MinimumCommunityData, MinimumGameData, ResponseListCommunitiesManagedByUser, ResponseSearchGames, ResponseSearchLocations } from "@/types/api"
import { useToast } from "@/hooks/use-toast"
import { uploadImage } from "@/lib/api/upload-image"
import { Header } from "@/components/header"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Form schema with validation
const formSchema = z.object({
	Name: z.string().min(3, {
		message: "O nome do evento deve ter pelo menos 3 caracteres.",
	}),
	Description: z.string().min(10, {
		message: "A descrição deve ter pelo menos 10 caracteres.",
	}),
	Type: z.enum(["FREE", "PAID_ON_SITE", "BUY_ON_THIRD_PARTY"], {
		required_error: "Selecione o tipo de evento.",
	}),
	StartDate: z.date({
		required_error: "A data de início é obrigatória.",
	}),
	EndDate: z.date({
		required_error: "A data de termino é obrigatória.",
	}),
	Capacity: z.coerce
		.number()
		.int()
		.min(1, {
			message: "Se especificada, a capacidade deve ser de pelo menos 1 pessoa.",
		})
		.optional(),
	Price: z.coerce.number().min(1, "O preço deve ser maior ou igual a R$ 1,00.").optional().nullable(),
	ExternalUrl: z.string().url().optional().nullable(),
	Community: z.object(
		{
			Id: z.number().int(),
			Handle: z.string(),
			AvatarUrl: z.string().optional(),
		},
		{
			required_error: "Selecione uma comunidade organizadora.",
		},
	),
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
			required_error: "Selecione um local para o evento.",
		},
	),
	PlannedMatches: z
		.array(
			z.object({
				GameId: z.number().int(),
				Name: z.string(),
				IconUrl: z.string().optional(),
				Description: z.string(),
				MaxAmountOfPlayers: z.coerce.number().int().min(1, "Deve ter pelo menos 1 jogador."),
				StartDate: z.date().optional().nullable(),
				EndDate: z.date().optional().nullable(),
				Price: z.coerce.number().min(100, "O preço deve ser maior ou igual a R$ 1,00.").optional(),
			}),
		)
		.optional()
		.default([]),
}).refine((data) => {
	if (!data.StartDate) return false

	const startDate = new Date(data.StartDate).getTime()
	const now = new Date().getTime()

	return startDate > now
}, {
	message: "Data de início precisa ser no futuro.",
	path: ["StartDate"]
}).refine((data) => {
	return Boolean(data.EndDate)
}, {
	message: "Data de término estar preenchida.",
	path: ["EndDate"]
}).refine((data) => {
	if (!data.EndDate) return false
	if (!data.StartDate) return false

	const startDate = new Date(data.StartDate).getTime()
	const endDate = new Date(data.EndDate).getTime()

	return endDate > startDate
}, {
	message: "Data de término precisa ser depois da data de início.",
	path: ["EndDate"]
})

type FormValues = z.infer<typeof formSchema>

interface MutationParams extends FormValues {
	EventImage: File | null
}

interface Params {
	communities: Array<MinimumCommunityData>
}

export function FormCreateEvent({ communities }: Params) {
	const { toast } = useToast()
	const router = useRouter()

	const [eventImage, setEventImage] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)

	const [locationQuery, setLocationQuery] = useState("")
	const [isLocationPopoverOpen, setIsLocationPopoverOpen] = useState(false)

	const [gameQuery, setGameQuery] = useState("")
	const [isGamePopoverOpen, setIsGamePopoverOpen] = useState(false)

	const debouncedLocationQuery = useDebounce(locationQuery)
	const debouncedGameQuery = useDebounce(gameQuery)

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

	// Use TanStack Query for data fetching with infinite scroll
	const { data: gamesQuery, isLoading: isSearchingGames } = useInfiniteQuery<ResponseSearchGames>({
		queryKey: ["search-games", debouncedGameQuery],
		queryFn: async () => {
			if (debouncedGameQuery.length < 3) {
				return {
					page: {
						Data: []
					}
				}
			}

			const query = new URLSearchParams({
				query: debouncedGameQuery
			})

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games/search?${query.toString()}`, {
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
	const games = useMemo(() => {
		if (!gamesQuery) return []

		// Flatten the pages array and extract items from each page
		return gamesQuery.pages.flatMap((page) => page.Data || [])
	}, [gamesQuery])

	const mutation = useMutation({
		mutationFn: async (body: MutationParams) => {
			const reqBody = {
				CommunityId: body.Community.Id,
				Name: body.Name,
				Description: body.Description,
				Type: body.Type,
				StartDate: body.StartDate.toISOString().replace('.000', ''),
				EndDate: body.EndDate.toISOString().replace('.000', ''),
				Capacity: body.Capacity,
				LocationId: body.Location.Id,
				PlannedMatches: [],
			} as any

			if (body.Type !== "FREE" && body.Price) {
				reqBody.Price = body.Price * 100
			}

			if (body.Type === "BUY_ON_THIRD_PARTY") {
				reqBody.ExternalUrl = body.ExternalUrl
			}

			if (body.EventImage !== null) {
				const { FilePath } = await uploadImage({
					FileName: body.EventImage?.name,
					ImageBlob: body.EventImage,
					Kind: "EVENT_ICON"
				})

				reqBody.IconPath = FilePath
			}

			if (!reqBody.IconPath && body.PlannedMatches.length >= 1) {
				reqBody.IconUrl = body.PlannedMatches[0].IconUrl || ""
			}

			if (!reqBody.IconPath && !reqBody.IconUrl) {
				throw new Error("icon required")
			}

			for (const plannedMatch of body.PlannedMatches) {
				const pm = {
					GameId: plannedMatch.GameId,
					Name: plannedMatch.Name,
					IconUrl: plannedMatch.IconUrl,
					Description: plannedMatch.Description,
					MaxAmountOfPlayers: plannedMatch.MaxAmountOfPlayers,
				} as any

				if (plannedMatch.Price) {
					pm.Price = plannedMatch.Price * 100
				}
				if (plannedMatch.StartDate) {
					pm.StartDate = plannedMatch.StartDate.toISOString().replace('.000', '')
				}
				if (plannedMatch.EndDate) {
					pm.Price = plannedMatch.EndDate.toISOString().replace('.000', '')
				}

				reqBody.PlannedMatches.push(pm)
			}

			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/events', {
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

			return res.json() as Promise<EventData>
		},
		onSuccess: (data) => {
			router.push("/eventos/" + data.Slug)
		},
		onError: (err) => {
			if (err.message === "file size exceeded") {
				toast({
					title: "Erro ao criar evento",
					description: "Imagem grande de mais, limite de 5 MB",
					variant: "destructive",
				})
				return
			}
			if (err.message === "icon required") {
				toast({
					title: "Erro ao criar evento",
					description: "O evento precisa ter uma imagem",
					variant: "destructive",
				})
				return
			}

			console.error(err)
			toast({
				title: "Erro ao criar evento",
				description: err.message,
				variant: "destructive",
			})
		}
	});

	// Initialize form
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			Name: "",
			Description: "",
			Type: "FREE",
			PlannedMatches: [],
			Community: communities[0],
		},
	})

	// Field array for planned matches
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "PlannedMatches",
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
		const fileInput = document.getElementById("event-image") as HTMLInputElement
		if (fileInput) fileInput.value = ""
	}

	// Handle location query change
	const handleLocationQueryChange = (value: string) => {
		setLocationQuery(value)
		if (!isLocationPopoverOpen) {
			setIsLocationPopoverOpen(true)
		}
	}

	// Handle game query change
	const handleGameQueryChange = (value: string) => {
		setGameQuery(value)
		if (!isGamePopoverOpen) {
			setIsGamePopoverOpen(true)
		}
	}

	// Add new planned match
	const addPlannedMatch = (game: MinimumGameData) => {
		append({
			GameId: game.Id,
			Name: game.Name,
			IconUrl: game.IconUrl,
			Description: "",
			MaxAmountOfPlayers: game.MaxAmountOfPlayers,
		})
		setGameQuery("")
		setIsGamePopoverOpen(false)
	}

	// Handle form submission
	const onSubmit = async (values: FormValues) => {
		mutation.mutate({
			...values,
			EventImage: eventImage
		})
	}

	return (
		<>
			<Header title="Criar Evento" displayBackButton />

			<main className="flex-1 container mx-auto py-8 px-4 mb-16">
				<Card className="max-w-2xl mx-auto">
					<CardHeader>
						<CardTitle>Criar Novo Evento</CardTitle>
						<CardDescription>Preencha os detalhes do seu evento para compartilhar com a comunidade.</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
								{/* Event Basic Information */}
								<div className="space-y-6">
									<h3 className="text-lg font-semibold">Informações Básicas</h3>


									{/* Community Organizer */}
									<FormField
										control={form.control}
										name="Community"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Comunidade Organizadora</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant="outline"
																role="combobox"
																className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
															>
																{field.value ? (
																	<div className="flex items-center gap-2 text-left">
																		{field.value.AvatarUrl && (
																			<div className="h-6 w-6 relative flex-shrink-0">
																				<Image
																					src={field.value.AvatarUrl || "/placeholder.svg"}
																					alt={field.value.Handle}
																					fill
																					className="object-cover rounded-full"
																				/>
																			</div>
																		)}
																		<div className="truncate">
																			<div>{field.value.Handle}</div>
																		</div>
																	</div>
																) : (
																	<div className="flex items-center gap-2">
																		<Users className="h-4 w-4" />
																		<span>Selecionar comunidade...</span>
																	</div>
																)}
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-[300px] p-0" align="start">
														<Command>
															<CommandList>
																<CommandGroup>
																	{communities.map((community) => (
																		<CommandItem
																			key={community.Id}
																			value={community.Handle}
																			onSelect={() => {
																				form.setValue("Community", community, { shouldValidate: true })
																			}}
																			className="flex items-center gap-3 p-3"
																		>
																			{community.AvatarUrl && (
																				<div className="h-8 w-8 relative flex-shrink-0">
																					<Image
																						src={community.AvatarUrl || "/placeholder.svg"}
																						alt={community.Handle}
																						fill
																						className="object-cover rounded-full"
																					/>
																				</div>
																			)}
																			<div className="flex flex-col">
																				<div className="font-medium">{community.Handle}</div>
																			</div>
																		</CommandItem>
																	))}
																</CommandGroup>
															</CommandList>
														</Command>
													</PopoverContent>
												</Popover>
												<FormDescription>Selecione a comunidade que está organizando este evento.</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Event Type */}
									<FormField
										control={form.control}
										name="Type"
										render={({ field }) => (
											<FormItem className="space-y-3">
												<FormLabel>Tipo de Evento</FormLabel>
												<FormControl>
													<RadioGroup
														onValueChange={field.onChange}
														defaultValue={field.value}
														className="flex flex-col space-y-1"
													>
														<FormItem className="flex items-center space-x-3 space-y-0">
															<FormControl>
																<RadioGroupItem value="FREE" />
															</FormControl>
															<FormLabel className="font-normal flex items-center gap-2">
																<DollarSign className="h-4 w-4 text-blue-600" />
																Gratuito
															</FormLabel>
														</FormItem>
														<FormItem className="flex items-center space-x-3 space-y-0">
															<FormControl>
																<RadioGroupItem value="PAID_ON_SITE" />
															</FormControl>
															<FormLabel className="font-normal flex items-center gap-2">
																<Home className="h-4 w-4 text-green-600" />
																Pago no local
															</FormLabel>
														</FormItem>
														<FormItem className="flex items-center space-x-3 space-y-0">
															<FormControl>
																<RadioGroupItem value="BUY_ON_THIRD_PARTY" />
															</FormControl>
															<FormLabel className="font-normal flex items-center gap-2">
																<SquareArrowOutUpRight className="h-4 w-4 text-red-600" />
																Comprado em plataforma externa
															</FormLabel>
														</FormItem>
													</RadioGroup>
												</FormControl>
												{/* <FormDescription>
													Locais comerciais são públicos e podem ser adicionados a qualquer evento. Locais pessoais
													são privados e apenas você pode adicioná-los aos seus eventos.
												</FormDescription> */}
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Event Name */}
									<FormField
										control={form.control}
										name="Name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nome do Evento</FormLabel>
												<FormControl>
													<Input placeholder="Ex: Noite de Jogos de Tabuleiro" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Event Description */}
									<FormField
										control={form.control}
										name="Description"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Descrição</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Descreva o seu evento, jogos que serão jogados, etc."
														className="min-h-[120px]"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Event Price */}
									{form.watch("Type") !== "FREE" && (
										<FormField
											control={form.control}
											name="Price"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Preço (R$)</FormLabel>
													<FormControl>
														<div className="relative">
															<DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
															<Input
																type="number"
																min="0"
																step="0.01"
																className="pl-10"
																placeholder="0.00"
																{...field}
																value={field.value || ""}
																onChange={(e) => {
																	let value = e.target.value;

																	// Remove any characters that aren't digits or dot
																	value = value.replace(/[^0-9.]/g, '');

																	// Limit to one dot
																	const parts = value.split('.');
																	if (parts.length > 2) {
																		value = parts[0] + '.' + parts[1];
																	}

																	// Limit to 2 decimal places
																	if (parts[1]?.length > 2) {
																		value = parts[0] + '.' + parts[1].substring(0, 2);
																	}

																	field.onChange(parseFloat(value))
																}}
															/>
														</div>
													</FormControl>
													<FormDescription>Deixe em branco se for gratuito</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}

									{/* Event ExternalUrl */}
									{form.watch("Type") === "BUY_ON_THIRD_PARTY" && (
										<FormField
											control={form.control}
											name="ExternalUrl"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Url de compra</FormLabel>
													<FormControl>
														<Input placeholder="Ex: https://rolesejogos.com.br/eventos/evento-top" {...field} value={field.value || undefined} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}

									{/* Event Image */}
									<div className="space-y-2">
										<Label htmlFor="event-image">Imagem do Evento</Label>
										<div className="flex items-center gap-4">
											<Button
												type="button"
												variant="outline"
												onClick={() => document.getElementById("event-image")?.click()}
												className="gap-2"
											>
												<ImageIcon className="h-4 w-4" />
												Escolher Imagem
											</Button>
											<Input
												id="event-image"
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
								</div>

								{/* Event Timing */}
								<div className="space-y-6">
									<h3 className="text-lg font-semibold">Data e Horário</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{/* Start Date and Time */}
										<FormField
											control={form.control}
											name="StartDate"
											render={({ field }) => (
												<FormItem className="flex flex-col">
													<FormLabel>Data e Hora de Início</FormLabel>
													<div className="flex gap-2">
														<Popover>
															<PopoverTrigger asChild>
																<FormControl>
																	<Button
																		variant={"outline"}
																		className={cn(
																			"w-full pl-3 text-left font-normal",
																			!field.value && "text-muted-foreground",
																		)}
																	>
																		<Calendar className="mr-2 h-4 w-4" />
																		{field.value ? (
																			format(field.value, "PPP", { locale: ptBR })
																		) : (
																			<span>Selecione uma data</span>
																		)}
																	</Button>
																</FormControl>
															</PopoverTrigger>
															<PopoverContent className="w-auto p-0" align="start">
																<CalendarComponent
																	mode="single"
																	selected={field.value}
																	onSelect={field.onChange}
																	initialFocus
																	locale={ptBR}
																/>
															</PopoverContent>
														</Popover>

														<div className="flex-1">
															<Input
																type="time"
																className="w-full"
																onChange={(e) => {
																	const [hours, minutes] = e.target.value.split(":").map(Number)
																	const date = field.value || new Date()
																	date.setHours(hours, minutes)
																	field.onChange(date)
																}}
																value={field.value ? format(field.value, "HH:mm") : ""}
															/>
														</div>
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>

										{/* End Date and Time (Optional) */}
										<FormField
											control={form.control}
											name="EndDate"
											render={({ field }) => (
												<FormItem className="flex flex-col">
													<FormLabel>Data e Hora de Término</FormLabel>
													<div className="flex gap-2">
														<Popover>
															<PopoverTrigger asChild>
																<FormControl>
																	<Button
																		variant={"outline"}
																		className={cn(
																			"w-full pl-3 text-left font-normal",
																			!field.value && "text-muted-foreground",
																		)}
																	>
																		<Calendar className="mr-2 h-4 w-4" />
																		{field.value ? (
																			format(field.value, "PPP", { locale: ptBR })
																		) : (
																			<span>Selecione uma data</span>
																		)}
																	</Button>
																</FormControl>
															</PopoverTrigger>
															<PopoverContent className="w-auto p-0" align="start">
																<CalendarComponent
																	mode="single"
																	selected={field.value || undefined}
																	onSelect={field.onChange}
																	initialFocus
																	locale={ptBR}
																/>
															</PopoverContent>
														</Popover>

														<div className="flex-1">
															<Input
																type="time"
																className="w-full"
																onChange={(e) => {
																	if (!e.target.value) return

																	const [hours, minutes] = e.target.value.split(":").map(Number)
																	const date = field.value || form.getValues().StartDate || new Date()
																	date.setHours(hours, minutes)
																	field.onChange(date)
																}}
																value={field.value ? format(field.value, "HH:mm") : ""}
															/>
														</div>
													</div>
													<FormDescription>
														Se não especificado, o evento será considerado sem horário de término definido.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								{/* Capacity and Location */}
								<div className="space-y-6">
									<h3 className="text-lg font-semibold">Local e Capacidade</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
																				<div className="text-xs text-muted-foreground truncate break-words whitespace-normal">
																					{field.value.Address}
																				</div>
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

																	{!isSearchingLocations && locationQuery.length < 2 && (
																		<CommandEmpty>Digite pelo menos 2 caracteres para buscar</CommandEmpty>
																	)}

																	{!isSearchingLocations && locationQuery.length >= 2 && locations.length === 0 && (
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

										{/* Capacity */}
										<FormField
											control={form.control}
											name="Capacity"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Capacidade</FormLabel>
													<FormControl>
														<Input
															type="number"
															min="1"
															{...field}
															value={field.value || ""}
															onChange={(e) => {
																const value = e.target.value === "" ? undefined : Number.parseInt(e.target.value, 10)
																field.onChange(value)
															}}
														/>
													</FormControl>
													<FormDescription>
														Número máximo de participantes. Deixe em branco para capacidade ilimitada.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								{/* Planned Matches Section */}
								<div className="space-y-6">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold">Partidas Planejadas</h3>
										<Popover open={isGamePopoverOpen} onOpenChange={setIsGamePopoverOpen}>
											<PopoverTrigger asChild>
												<Button variant="outline" size="sm" className="gap-2 bg-transparent">
													<Plus className="h-4 w-4" />
													Adicionar Partida
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-[300px] p-0" align="end">
												<Command>
													<CommandInput
														placeholder="Buscar jogos..."
														value={gameQuery}
														onValueChange={handleGameQueryChange}
													/>
													<CommandList>
														{isSearchingGames && (
															<div className="flex items-center justify-center py-6">
																<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
															</div>
														)}

														{!isSearchingGames && gameQuery.length < 2 && (
															<CommandEmpty>Digite pelo menos 2 caracteres para buscar</CommandEmpty>
														)}

														{!isSearchingGames && gameQuery.length >= 2 && games.length === 0 && (
															<CommandEmpty>Nenhum jogo encontrado</CommandEmpty>
														)}

														{games.length > 0 && (
															<CommandGroup>
																{games.map((game) => (
																	<CommandItem
																		key={game.Id}
																		value={game.Name}
																		onSelect={() => addPlannedMatch(game)}
																		className="flex items-center gap-2"
																	>
																		{game.IconUrl && (
																			<div className="h-6 w-6 relative flex-shrink-0">
																				<Image
																					src={game.IconUrl || "/placeholder.svg"}
																					alt={game.Name}
																					fill
																					className="object-cover rounded"
																				/>
																			</div>
																		)}
																		<span>{game.Name}</span>
																		{game.MinAmountOfPlayers && game.MaxAmountOfPlayers && (
																			<span className="text-xs text-muted-foreground ml-auto">
																				{game.MinAmountOfPlayers === game.MaxAmountOfPlayers
																					? `${game.MinAmountOfPlayers} jogadores`
																					: `${game.MinAmountOfPlayers}-${game.MaxAmountOfPlayers} jogadores`}
																			</span>
																		)}
																	</CommandItem>
																))}
															</CommandGroup>
														)}
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									</div>

									{fields.length > 0 ? (
										<div className="space-y-4">
											{fields.map((field, index) => (
												<Card key={field.id} className="p-4">
													<div className="flex items-start justify-between mb-4">
														<div className="flex items-center gap-3">
															{form.watch(`PlannedMatches.${index}.IconUrl`) && (
																<div className="h-10 w-10 relative flex-shrink-0">
																	<Image
																		src={
																			form.watch(`PlannedMatches.${index}.IconUrl`) ||
																			"/placeholder.svg"
																		}
																		alt={form.watch(`PlannedMatches.${index}.Name`)}
																		fill
																		className="object-cover rounded"
																	/>
																</div>
															)}
															<div>
																<h4 className="font-medium">{form.watch(`PlannedMatches.${index}.Name`)}</h4>
																<p className="text-sm text-muted-foreground">Partida {index + 1}</p>
															</div>
														</div>
														<Button
															type="button"
															variant="ghost"
															size="icon"
															onClick={() => remove(index)}
															className="h-8 w-8 rounded-full"
														>
															<X className="h-4 w-4" />
														</Button>
													</div>

													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														{/* Match Name */}
														<FormField
															control={form.control}
															name={`PlannedMatches.${index}.Name`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Nome da Partida</FormLabel>
																	<FormControl>
																		<Input placeholder="Ex: Jaipur customizado" {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														{/* Match Description */}
														<div className="md:col-span-2">
															<FormField
																control={form.control}
																name={`PlannedMatches.${index}.Description`}
																render={({ field }) => (
																	<FormItem>
																		<FormLabel>Descrição da Partida</FormLabel>
																		<FormControl>
																			<Textarea
																				placeholder="Descreva esta partida específica..."
																				className="min-h-[80px]"
																				{...field}
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>
														</div>

														{/* Max Players */}
														<FormField
															control={form.control}
															name={`PlannedMatches.${index}.MaxAmountOfPlayers`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Máximo de Jogadores</FormLabel>
																	<FormControl>
																		<div className="relative">
																			<Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
																			<Input
																				type="number"
																				min="1"
																				className="pl-10"
																				{...field}
																				onChange={(e) => field.onChange(Number(e.target.value))}
																			/>
																		</div>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														{/* Price */}
														{/* <FormField
															control={form.control}
															name={`PlannedMatches.${index}.Price`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Preço (R$)</FormLabel>
																	<FormControl>
																		<div className="relative">
																			<DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
																			<Input
																				type="number"
																				min="0"
																				step="0.01"
																				className="pl-10"
																				placeholder="0.00"
																				{...field}
																				value={field.value || ""}
																				onChange={(e) => {
																					const value = e.target.value === "" ? undefined : Number(e.target.value)
																					field.onChange(value)
																				}}
																			/>
																		</div>
																	</FormControl>
																	<FormDescription>Deixe em branco se for gratuito</FormDescription>
																	<FormMessage />
																</FormItem>
															)}
														/> */}

														{/* Start Date and Time */}
														<FormField
															control={form.control}
															name={`PlannedMatches.${index}.StartDate`}
															render={({ field }) => (
																<FormItem className="flex flex-col">
																	<FormLabel>Início da Partida</FormLabel>
																	<div className="flex gap-2">
																		<Popover>
																			<PopoverTrigger asChild>
																				<FormControl>
																					<Button
																						variant={"outline"}
																						className={cn(
																							"w-full pl-3 text-left font-normal",
																							!field.value && "text-muted-foreground",
																						)}
																					>
																						<Clock className="mr-2 h-4 w-4" />
																						{field.value ? (
																							format(field.value, "dd/MM", { locale: ptBR })
																						) : (
																							<span>Data</span>
																						)}
																					</Button>
																				</FormControl>
																			</PopoverTrigger>
																			<PopoverContent className="w-auto p-0" align="start">
																				<CalendarComponent
																					mode="single"
																					selected={field.value as (Date | undefined)}
																					onSelect={field.onChange}
																					initialFocus
																					locale={ptBR}
																				/>
																			</PopoverContent>
																		</Popover>

																		<div className="flex-1">
																			<Input
																				type="time"
																				className="w-full"
																				onChange={(e) => {
																					const [hours, minutes] = e.target.value.split(":").map(Number)
																					const date = field.value || new Date()
																					date.setHours(hours, minutes)
																					field.onChange(date)
																				}}
																				value={field.value ? format(field.value, "HH:mm") : ""}
																			/>
																		</div>
																	</div>
																	<FormMessage />
																</FormItem>
															)}
														/>

														{/* End Date and Time */}
														<FormField
															control={form.control}
															name={`PlannedMatches.${index}.EndDate`}
															render={({ field }) => (
																<FormItem className="flex flex-col">
																	<FormLabel>Fim da Partida</FormLabel>
																	<div className="flex gap-2">
																		<Popover>
																			<PopoverTrigger asChild>
																				<FormControl>
																					<Button
																						variant={"outline"}
																						className={cn(
																							"w-full pl-3 text-left font-normal",
																							!field.value && "text-muted-foreground",
																						)}
																					>
																						<Clock className="mr-2 h-4 w-4" />
																						{field.value ? (
																							format(field.value, "dd/MM", { locale: ptBR })
																						) : (
																							<span>Data</span>
																						)}
																					</Button>
																				</FormControl>
																			</PopoverTrigger>
																			<PopoverContent className="w-auto p-0" align="start">
																				<CalendarComponent
																					mode="single"
																					selected={field.value as (Date | undefined)}
																					onSelect={field.onChange}
																					initialFocus
																					locale={ptBR}
																				/>
																			</PopoverContent>
																		</Popover>

																		<div className="flex-1">
																			<Input
																				type="time"
																				className="w-full"
																				onChange={(e) => {
																					const [hours, minutes] = e.target.value.split(":").map(Number)
																					const date = field.value || new Date()
																					date.setHours(hours, minutes)
																					field.onChange(date)
																				}}
																				value={field.value ? format(field.value, "HH:mm") : ""}
																			/>
																		</div>
																	</div>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
												</Card>
											))}
										</div>
									) : (
										<div className="text-center py-8 border rounded-md bg-muted/20">
											<GamepadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
											<p className="text-sm text-muted-foreground">
												Nenhuma partida planejada ainda. Clique em "Adicionar Partida" para incluir jogos específicos ao
												evento.
											</p>
										</div>
									)}
								</div>

								<div className="flex justify-end gap-4 pt-4">
									<Button type="button" variant="outline" asChild>
										<Link href="/eventos">Cancelar</Link>
									</Button>
									<Button type="submit" disabled={mutation.isPending} className="text-white">
										{mutation.isPending ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Criando...
											</>
										) : (
											"Criar Evento"
										)}
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</main>
		</>
	)
}