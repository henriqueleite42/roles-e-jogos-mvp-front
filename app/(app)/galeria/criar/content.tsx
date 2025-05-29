"use client"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadImage } from "@/lib/api/upload-image"
import { Textarea } from "@/components/ui/textarea"
import { X, Loader2, Gamepad2, ImageIcon, MapPin, Search, Plus } from "lucide-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"
import { GameData, MinimumEventDataWithLocation, ResponseSearchEvents, ResponseSearchGames, ResponseSearchLocations, ResponseSearchProfiles } from "@/types/api"
import NextImage from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Form schema with validation
const imageFormSchema = z.object({
	description: z.string().max(512).optional(),
	Game: z.object({
		Id: z.coerce.number().int(),
		Name: z.string(),
	})
		.optional()
		.nullable(),
	Location: z.object({
		Id: z.coerce.number().int(),
		Name: z.string(),
	})
		.optional()
		.nullable(),
	Event: z.object({
		Id: z.coerce.number().int(),
		Name: z.string(),
		IconUrl: z.string().optional().nullable(),
	})
		.optional()
		.nullable(),
	Peoples: z
		.array(
			z.object({
				AccountId: z.coerce.number().int(),
				Handle: z.string(),
				AvatarUrl: z.string().optional().nullable(),
			}),
		)
		.default([]),
})

type ImageFormValues = z.infer<typeof imageFormSchema>

interface MutationParams extends ImageFormValues {
	Image: File | null
}

export function CreateImagePage() {
	const searchParams = useSearchParams()
	const router = useRouter()

	const redirectTo = searchParams.get("redirectTo") || "/galeria"

	const [imageToUpload, setImageToUpload] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)

	const [gameQuery, setGameQuery] = useState("")
	const [isGamePopoverOpen, setIsGamePopoverOpen] = useState(false)

	const [locationQuery, setLocationQuery] = useState("")
	const [isLocationPopoverOpen, setIsLocationPopoverOpen] = useState(false)

	const [eventQuery, setEventQuery] = useState("")
	const [isEventPopoverOpen, setIsEventPopoverOpen] = useState(false)

	const [peopleQuery, setPeopleQuery] = useState("")
	const [isPeoplePopoverOpen, setIsPeoplePopoverOpen] = useState(false)

	const debouncedGameQuery = useDebounce(gameQuery)
	const debouncedLocationQuery = useDebounce(locationQuery)
	const debouncedEventQuery = useDebounce(eventQuery)
	const debouncedPeopleQuery = useDebounce(peopleQuery)

	// Handle game query change
	const handleGameQueryChange = (value: string) => {
		setGameQuery(value)
		if (!isGamePopoverOpen) {
			setIsGamePopoverOpen(true)
		}
	}

	// Handle location query change
	const handleLocationQueryChange = (value: string) => {
		setLocationQuery(value)
		if (!isLocationPopoverOpen) {
			setIsLocationPopoverOpen(true)
		}
	}

	// Handle event query change
	const handleEventQueryChange = (value: string) => {
		setEventQuery(value)
		if (!isEventPopoverOpen) {
			setIsEventPopoverOpen(true)
		}
	}

	// Handle event query change
	const handlePeopleQueryChange = (value: string) => {
		setPeopleQuery(value)
		if (!isPeoplePopoverOpen) {
			setIsPeoplePopoverOpen(true)
		}
	}

	// Use TanStack Query for data fetching with infinite scroll
	const { data: gamesQuery, isLoading: isSearchingGames } = useQuery<ResponseSearchGames>({
		queryKey: ["search-games", debouncedGameQuery],
		queryFn: async () => {
			if (debouncedGameQuery.length < 3) {
				return {
					Data: []
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
	})

	// Use TanStack Query for data fetching with infinite scroll
	const { data: locationsQuery, isLoading: isSearchingLocations } = useQuery<ResponseSearchLocations>({
		queryKey: ["search-locations", debouncedLocationQuery],
		queryFn: async () => {
			if (debouncedLocationQuery.length < 3) {
				return {
					Data: []
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
	})

	// Use TanStack Query for data fetching with infinite scroll
	const { data: eventsQuery, isLoading: isSearchingEvents } = useQuery<ResponseSearchEvents>({
		queryKey: ["search-events", debouncedEventQuery],
		queryFn: async () => {
			if (debouncedEventQuery.length < 3) {
				return {
					Data: []
				}
			}

			const query = new URLSearchParams({
				query: debouncedEventQuery
			})

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/search-with-location?${query.toString()}`, {
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`Erro ao pegar dados da API: ${response.status}`)
			}

			return response.json()
		},
	})

	// Use TanStack Query for data fetching with infinite scroll
	const { data: peoplesQuery, isLoading: isSearchingPeoples } = useQuery<ResponseSearchProfiles>({
		queryKey: ["search-peoples", debouncedPeopleQuery],
		queryFn: async () => {
			if (debouncedPeopleQuery.length < 3) {
				return {
					Data: []
				}
			}

			const query = new URLSearchParams({
				query: debouncedPeopleQuery
			})

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/search?${query.toString()}`, {
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`Erro ao pegar dados da API: ${response.status}`)
			}

			return response.json()
		},
	})

	const gameFromQuery = searchParams.get("game")
	const eventFromQuery = searchParams.get("event")
	const locationFromQuery = searchParams.get("location")

	// Initialize form
	const form = useForm<ImageFormValues>({
		resolver: zodResolver(imageFormSchema),
	})

	useEffect(() => {
		if (gameFromQuery) {
			try {
				const game = JSON.parse(gameFromQuery) as GameData

				if (game.Id && game.Name) {
					form.setValue("Game", {
						Id: game.Id,
						Name: game.Name,
					})
				}
			} catch (err) {
				console.error("fail to set game from query" + (err as any).message)
			}
		}

		if (eventFromQuery && locationFromQuery) {
			try {
				const event = JSON.parse(eventFromQuery) as Omit<MinimumEventDataWithLocation, "Location">
				const location = JSON.parse(locationFromQuery) as MinimumEventDataWithLocation["Location"]

				console.log(event);
				console.log(location);


				if (event.Id && event.Slug && event.Name && location.Id && location.Name) {
					form.setValue("Event", {
						Id: event.Id,
						Name: event.Name,
						IconUrl: event.IconUrl,
					})
					form.setValue("Location", {
						Id: location.Id,
						Name: location.Name,
					})
				}
			} catch (err) {
				console.error("fail to set event and location from query" + (err as any).message)
			}
		}

		if (!eventFromQuery && locationFromQuery) {
			try {
				const location = JSON.parse(locationFromQuery) as MinimumEventDataWithLocation["Location"]

				if (location.Id && location.Name) {
					form.setValue("Location", {
						Id: location.Id,
						Name: location.Name,
					})
				}
			} catch (err) {
				console.error("fail to set location from query" + (err as any).message)
			}
		}
	}, [gameFromQuery, eventFromQuery, locationFromQuery, form.setValue])

	const mutation = useMutation({
		mutationFn: async (body: MutationParams) => {
			if (!body.Image) {
				throw new Error("imagem obrigatoria")
			}

			console.log(body);

			var gameId: number | undefined = undefined
			var eventId: number | undefined = undefined
			var locationId: number | undefined = undefined
			var peopleIds = [] as Array<number>

			if (body.Game) {
				gameId = body.Game.Id
			}
			if (body.Event) {
				eventId = body.Event.Id
			}
			if (body.Location) {
				locationId = body.Location.Id
			}
			for (const person of body.Peoples) {
				peopleIds.push(person.AccountId)
			}

			await new Promise((res, rej) => {
				const img = new Image()
				img.onload = async () => {
					var filePath = ""
					if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
						filePath = "/foo/bar.jpg"
					} else {
						const { FilePath } = await uploadImage({
							FileName: body.Image!.name,
							ImageBlob: body.Image!,
							Kind: "MEDIA_IMAGE"
						})
						filePath = FilePath
					}

					const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/medias', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							Description: body.description,
							Width: img.width,
							Height: img.height,
							Path: filePath,
							EventId: eventId,
							GameId: gameId,
							LocationId: locationId,
							People: peopleIds
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
			router.push(redirectTo)
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

	return (
		<>
			<Header title="Adicionar imagem" displayBackButton />

			<main className="flex flex-col min-h-screen flex-1 container mx-auto pt-4 pb-8 px-4">
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

						{/* Game Section */}
						<FormField
							control={form.control}
							name="Game"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Jogo</FormLabel>
									<Popover open={isGamePopoverOpen} onOpenChange={setIsGamePopoverOpen}>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													role="combobox"
													className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
												>
													{field.value ? (
														<div className="flex items-center gap-2 text-left">
															<Gamepad2 className="h-4 w-4 flex-shrink-0" />
															<div className="truncate">
																<div>{field.value.Name}</div>
															</div>
														</div>
													) : (
														<div className="flex items-center gap-2">
															<Search className="h-4 w-4" />
															<span>Buscar jogo...</span>
														</div>
													)}
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-[300px] p-0" align="start">
											<Command>
												<CommandInput
													placeholder="Buscar por nome..."
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

													{!isSearchingGames && gameQuery.length >= 3 && (gamesQuery?.Data || []).length === 0 && (
														<CommandEmpty>Nenhum jogo encontrado</CommandEmpty>
													)}

													{(gamesQuery?.Data || []).length > 0 && (
														<CommandGroup>
															{(gamesQuery?.Data || []).map((game) => (
																<CommandItem
																	key={game.Id}
																	value={game.Name}
																	onSelect={() => {
																		form.setValue("Game", game, { shouldValidate: true })
																		setGameQuery("")
																		setIsGamePopoverOpen(false)
																	}}
																	className="flex items-center gap-2"
																>
																	{game.IconUrl && (
																		<div className="h-6 w-6 relative flex-shrink-0">
																			<NextImage
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
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Event Section */}
						<FormField
							control={form.control}
							name="Event"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Evento</FormLabel>
									<Popover open={isEventPopoverOpen} onOpenChange={setIsEventPopoverOpen}>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													role="combobox"
													className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
												>
													{field.value ? (
														<div className="flex items-center gap-2 text-left">
															<NextImage className="h-4 w-4 flex-shrink-0" src={field.value.IconUrl || "/placeholder.svg"} width={300} height={300} alt="img" />
															<div className="truncate">
																<div>{field.value.Name}</div>
															</div>
														</div>
													) : (
														<div className="flex items-center gap-2">
															<Search className="h-4 w-4" />
															<span>Buscar evento...</span>
														</div>
													)}
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-[300px] p-0" align="start">
											<Command>
												<CommandInput
													placeholder="Buscar por nome..."
													value={eventQuery}
													onValueChange={handleEventQueryChange}
												/>
												<CommandList>
													{isSearchingEvents && (
														<div className="flex items-center justify-center py-6">
															<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
														</div>
													)}

													{!isSearchingEvents && eventQuery.length < 3 && (
														<CommandEmpty>Digite pelo menos 3 caracteres para buscar</CommandEmpty>
													)}

													{!isSearchingEvents && eventQuery.length >= 3 && (eventsQuery?.Data || []).length === 0 && (
														<CommandEmpty>Nenhum local encontrado</CommandEmpty>
													)}

													{(eventsQuery?.Data || []).length > 0 && (
														<CommandGroup>
															{(eventsQuery?.Data || []).map((event) => (
																<CommandItem
																	key={event.Id}
																	value={event.Name}
																	onSelect={() => {
																		form.setValue("Event", event, { shouldValidate: true })
																		form.setValue("Location", {
																			Id: event.Location.Id,
																			Name: event.Location.Name,
																		}, { shouldValidate: true })
																		setIsEventPopoverOpen(false)
																	}}
																>
																	<div className="flex flex-col">
																		<div>{event.Name}</div>
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

						{/* Location Section */}
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
													disabled={form.getValues().Event != undefined}
												>
													{field.value ? (
														<div className="flex items-center gap-2 text-left">
															<MapPin className="h-4 w-4 flex-shrink-0" />
															<div className="truncate">
																<div>{field.value.Name}</div>
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

													{!isSearchingLocations && locationQuery.length >= 3 && (locationsQuery?.Data || []).length === 0 && (
														<CommandEmpty>Nenhum local encontrado</CommandEmpty>
													)}

													{(locationsQuery?.Data || []).length > 0 && (
														<CommandGroup>
															{(locationsQuery?.Data || []).map((location) => (
																<CommandItem
																	key={location.Id}
																	value={location.Name}
																	onSelect={() => {
																		form.setValue("Location", location, { shouldValidate: true })
																		setLocationQuery("")
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
									{form.getValues().Event && (
										<FormDescription>O local é definido automaticamente pelo evento</FormDescription>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* People Section */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<Label>Pessoas na foto</Label>
								<Popover open={isPeoplePopoverOpen} onOpenChange={setIsPeoplePopoverOpen}>
									<PopoverTrigger asChild>
										<Button variant="outline" size="sm" className="h-8 gap-1">
											<Plus className="h-3.5 w-3.5" />
											Marcar alguém
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-[300px] p-0" align="end">
										<Command>
											<CommandInput
												placeholder="Buscar pessoas..."
												value={peopleQuery}
												onValueChange={handlePeopleQueryChange}
											/>
											<CommandList>
												{isSearchingPeoples && (
													<div className="flex items-center justify-center py-6">
														<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
													</div>
												)}

												{!isSearchingPeoples && peopleQuery.length < 3 && (
													<CommandEmpty>Digite pelo menos 3 caracteres para buscar</CommandEmpty>
												)}

												{!isSearchingPeoples && peopleQuery.length >= 3 && (peoplesQuery?.Data || []).length === 0 && (
													<CommandEmpty>Ninguém encontrado</CommandEmpty>
												)}

												{(peoplesQuery?.Data || []).length > 0 && (
													<CommandGroup>
														{(peoplesQuery?.Data || []).map((people) => {
															// Check if people is already selected
															const isSelected = form.getValues().Peoples?.some((g) => g.AccountId === people.AccountId)

															return (
																<CommandItem
																	key={people.AccountId}
																	value={people.Handle}
																	disabled={isSelected}
																	onSelect={() => {
																		if (!isSelected) {
																			const currentPeoples = form.getValues().Peoples || []
																			form.setValue("Peoples", [...currentPeoples, people], { shouldValidate: true })
																			setPeopleQuery("")
																		}
																	}}
																	className={cn(
																		"flex items-center gap-2",
																		isSelected && "opacity-50 cursor-not-allowed",
																	)}
																>
																	{people.AvatarUrl && (
																		<div className="h-6 w-6 relative flex-shrink-0">
																			<NextImage
																				src={people.AvatarUrl}
																				alt={people.Handle}
																				fill
																				className="object-cover rounded"
																			/>
																		</div>
																	)}
																	{!people.AvatarUrl && (
																		<div className="h-6 w-6 relative flex-shrink-0">
																			<NextImage
																				src="/placeholder.svg"
																				alt={people.Handle}
																				width={300}
																				height={300}
																				className="object-cover rounded"
																			/>
																		</div>
																	)}
																	<span>{people.Handle}</span>
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
								name="Peoples"
								render={({ field }) => (
									<FormItem>
										<div className="space-y-2">
											{field.value && field.value.length > 0 ? (
												<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
													{field.value.map((people, index) => (
														<div key={people.AccountId} className="flex items-center gap-2 border rounded-md p-2 bg-muted/20">
															{people.AvatarUrl && (
																<div className="h-8 w-8 relative flex-shrink-0">
																	<NextImage
																		src={people.AvatarUrl}
																		alt={people.Handle}
																		fill
																		className="object-cover rounded"
																	/>
																</div>
															)}
															{!people.AvatarUrl && (
																<div className="h-8 w-8 relative flex-shrink-0">
																	<NextImage
																		src={"/placeholder.svg"}
																		alt={people.Handle}
																		width={300}
																		height={300}
																		className="object-cover rounded"
																	/>
																</div>
															)}
															<div className="flex-1 min-w-0">
																<p className="font-medium truncate">{people.Handle}</p>
															</div>
															<Button
																type="button"
																variant="ghost"
																size="icon"
																className="h-8 w-8 rounded-full"
																onClick={() => {
																	const newPeoples = [...field.value]
																	newPeoples.splice(index, 1)
																	form.setValue("Peoples", newPeoples)
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
														Niguem marcado. Clique em "Marcar alguém" para marcar pessoas na imagem.
													</p>
												</div>
											)}
										</div>
										<FormDescription>Adicione os pessoas que estão presentes na imagem.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

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

						<div className="flex justify-center gap-2">
							<Button type="button" variant="outline" onClick={() => router.back()}>
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
						</div>
					</form>
				</Form>
			</main>
		</>
	)
}