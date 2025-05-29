"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, ImageIcon, Loader2, MapPin, Search, X, Plus } from "lucide-react"
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
import { useInfiniteQuery, useMutation } from "@tanstack/react-query"
import { ResponseSearchGames, ResponseSearchLocations } from "@/types/api"
import { useToast } from "@/hooks/use-toast"
import { uploadImage } from "@/lib/api/upload-image"
import { Header } from "@/components/header"

// Form schema with validation
const formSchema = z.object({
	Name: z.string().min(3, {
		message: "O nome do evento deve ter pelo menos 3 caracteres.",
	}),
	Description: z.string().min(10, {
		message: "A descrição deve ter pelo menos 10 caracteres.",
	}),
	StartDate: z.coerce.date({
		required_error: "A data de início é obrigatória.",
		message: "A data de início é obrigatória.",
		invalid_type_error: "A data de início é obrigatória.",
	}),
	EndDate: z.coerce.date({
		required_error: "A data de termino é obrigatória.",
		message: "A data de termino é obrigatória.",
		invalid_type_error: "A data de termino é obrigatória.",
	}),
	Capacity: z.coerce
		.number()
		.int()
		.min(1, {
			message: "Se especificada, a capacidade deve ser de pelo menos 1 pessoa.",
		})
		.optional().nullable(),
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
			required_error: "Selecione um local para o evento."
		},
	),
	Games: z
		.array(
			z.object({
				Id: z.coerce.number().int(),
				Name: z.string(),
				Description: z.string(),
				IconUrl: z.string().optional().nullable(),
				Kind: z.string(),
				LudopediaId: z.coerce.number().int().optional().nullable(),
				LudopediaUrl: z.string().optional().nullable(),
				MinAmountOfPlayers: z.coerce.number().int(),
				MaxAmountOfPlayers: z.coerce.number().int(),
				AverageDuration: z.coerce.number().int(),
				MinAge: z.coerce.number().int(),
				CreatedAt: z.coerce.date(),
			}),
		)
		.min(1, "O evento deve ter pelo menos 1 jogo.")
		.default([])
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

export function FormCreateEvent() {
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

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/search?${query.toString()}`, {
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
			var icon: any = undefined

			if (body.EventImage !== null) {
				const { FilePath } = await uploadImage({
					FileName: body.EventImage?.name,
					ImageBlob: body.EventImage,
					Kind: "EVENT_ICON"
				})

				icon = {
					CustomIconPath: FilePath
				}
			} else if (body.Games.length >= 1) {
				icon = {
					UseGameIconGameId: body.Games[0].Id
				}
			}

			const gamesIds = body.Games.map(g => g.Id)

			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/events', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					Name: body.Name,
					Description: body.Description,
					Icon: icon,
					StartDate: body.StartDate.toISOString(),
					EndDate: body.EndDate?.toISOString(),
					Capacity: body.Capacity,
					LocationId: body.Location.Id,
					GamesList: gamesIds
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
			router.push("/eventos")
		},
		onError: (err) => {
			toast({
				title: "Erro ao criar evento!",
				description: err.message,
				className: "bg-red-400"
			})
		}
	});

	// Initialize form
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			Name: "",
			Description: "",
			Games: [],
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
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
											accept=".png,.jpg,.jpeg,.webp"
											className="hidden"
											onChange={handleImageUpload}
										/>
										<span className="text-sm text-muted-foreground">
											{imagePreview ? "Imagem selecionada" : "Caso nenhuma imagem seja selecionada, a imagem de capa do primeiro jogo será usada. Caso o evento não tenha imagem e nem jogos, ele ficará sem imagens."}
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
															fromDate={new Date()}
														/>
													</PopoverContent>
												</Popover>

												<div className="flex-1">
													<Input
														type="time"
														className="w-full"
														onChange={(e) => {
															if (!e.target.value) return;

															const [hours, minutes] = e.target.value.split(":").map(Number);
															const baseDate = field.value || form.getValues().StartDate || new Date();

															const newDate = new Date(baseDate); // clone to avoid mutation
															newDate.setHours(hours, minutes);
															newDate.setSeconds(0);
															newDate.setMilliseconds(0);

															field.onChange(newDate);

															// Revalidates EndDate, necessary for the refine
															form.trigger("EndDate");
														}}
														lang="pt-BR"
														step="60"
														min="00:00"
														max="23:59"
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
															fromDate={new Date()}
														/>
													</PopoverContent>
												</Popover>

												<div className="flex-1">
													<Input
														type="time"
														className="w-full"
														onChange={(e) => {
															if (!e.target.value) return;

															const [hours, minutes] = e.target.value.split(":").map(Number);
															const baseDate = field.value || form.getValues().EndDate || new Date();

															const newDate = new Date(baseDate); // clone to avoid mutation
															newDate.setHours(hours, minutes);
															newDate.setSeconds(0);
															newDate.setMilliseconds(0);

															field.onChange(newDate);

															// Revalidates StartDate, necessary for the refine
															form.trigger("StartDate");
															form.trigger("EndDate");
														}}
														lang="pt-BR"
														step="60"
														min="00:00"
														max="23:59"
														value={field.value ? format(field.value, "HH:mm") : ""}
													/>
												</div>
											</div>
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
													{...field}
													value={field.value || ""}
													onChange={(e) => {
														const value = e.target.value === "" ? undefined : Number.parseInt(e.target.value, 10)
														field.onChange(value)
													}}
												/>
											</FormControl>
											<FormDescription>
												Número máximo de participantes que podem confirmar presença. Deixe em branco para capacidade
												ilimitada.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

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
																		<div className="text-xs text-muted-foreground truncate">{field.value.Address}</div>
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

								{/* Games Section */}
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<Label>Jogos do Evento</Label>
										<Popover open={isGamePopoverOpen} onOpenChange={setIsGamePopoverOpen}>
											<PopoverTrigger asChild>
												<Button variant="outline" size="sm" className="h-8 gap-1">
													<Plus className="h-3.5 w-3.5" />
													Adicionar Jogo
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

														{!isSearchingGames && gameQuery.length < 3 && (
															<CommandEmpty>Digite pelo menos 3 caracteres para buscar</CommandEmpty>
														)}

														{!isSearchingGames && gameQuery.length >= 3 && games.length === 0 && (
															<CommandEmpty>Nenhum jogo encontrado</CommandEmpty>
														)}

														{games.length > 0 && (
															<CommandGroup>
																{games.map((game) => {
																	// Check if game is already selected
																	const isSelected = form.getValues().Games?.some((g) => g.Id === game.Id)

																	return (
																		<CommandItem
																			key={game.Id}
																			value={game.Name}
																			disabled={isSelected}
																			onSelect={() => {
																				if (!isSelected) {
																					const currentGames = form.getValues().Games || []
																					form.setValue("Games", [...currentGames, game], { shouldValidate: true })
																					setGameQuery("")
																				}
																			}}
																			className={cn(
																				"flex items-center gap-2",
																				isSelected && "opacity-50 cursor-not-allowed",
																			)}
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
																	)
																})}
															</CommandGroup>
														)}
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									</div>

									<FormField
										control={form.control}
										name="Games"
										render={({ field }) => (
											<FormItem>
												<div className="space-y-2">
													{field.value && field.value.length > 0 ? (
														<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
															{field.value.map((game, index) => (
																<div key={game.Id} className="flex items-center gap-2 border rounded-md p-2 bg-muted/20">
																	{game.IconUrl && (
																		<div className="h-8 w-8 relative flex-shrink-0">
																			<Image
																				src={game.IconUrl || "/placeholder.svg"}
																				alt={game.Name}
																				fill
																				className="object-cover rounded"
																			/>
																		</div>
																	)}
																	<div className="flex-1 min-w-0">
																		<p className="font-medium truncate">{game.Name}</p>
																		{game.MinAmountOfPlayers && game.MaxAmountOfPlayers && (
																			<p className="text-xs text-muted-foreground">
																				{game.MinAmountOfPlayers === game.MaxAmountOfPlayers
																					? `${game.MinAmountOfPlayers} jogadores`
																					: `${game.MinAmountOfPlayers}-${game.MaxAmountOfPlayers} jogadores`}
																			</p>
																		)}
																	</div>
																	<Button
																		type="button"
																		variant="ghost"
																		size="icon"
																		className="h-8 w-8 rounded-full"
																		onClick={() => {
																			const newGames = [...field.value]
																			newGames.splice(index, 1)
																			form.setValue("Games", newGames)
																		}}
																	>
																		<X className="h-4 w-4" />
																	</Button>
																</div>
															))}
														</div>
													) : (
														<div className="text-center py-6 border rounded-md bg-muted/20">
															<p className="text-sm text-muted-foreground">
																Nenhum jogo adicionado. Clique em "Adicionar Jogo" para incluir jogos ao evento.
															</p>
														</div>
													)}
												</div>
												<FormDescription>Adicione os jogos que serão jogados durante o evento.</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
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