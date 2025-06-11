"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, ImageIcon, Loader2, MapPin, Search, X, Plus, Trash2, AlertTriangle, Triangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Event, ResponseSearchGames, ResponseSearchLocations } from "@/types/api"
import { getAvailableSpots } from "../utils"
import { useMutation, useQuery } from "@tanstack/react-query"
import { uploadImage } from "@/lib/api/upload-image"

// Form schema with validation (same as create event)
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
			Slug: z.string(),
			Address: z.string(),
			IconUrl: z.string().optional().nullable(),
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
				Slug: z.string(),
				IconUrl: z.string().optional().nullable(),
				MinAmountOfPlayers: z.coerce.number().int(),
				MaxAmountOfPlayers: z.coerce.number().int(),
			}),
		)
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

export default function EditEventPage({ event }: { event: Event }) {
	const params = useParams()
	const router = useRouter()
	const { toast } = useToast()

	const [eventImage, setEventImage] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string | undefined>(event.IconUrl)

	const [locationQuery, setLocationQuery] = useState("")
	const [isLocationPopoverOpen, setIsLocationPopoverOpen] = useState(false)
	const [gameQuery, setGameQuery] = useState("")
	const [isGamePopoverOpen, setIsGamePopoverOpen] = useState(false)

	const debouncedLocationQuery = useDebounce(locationQuery)
	const debouncedGameQuery = useDebounce(gameQuery)

	const { confirmationsCount } = getAvailableSpots(event)

	// Use TanStack Query for data fetching with infinite scroll
	const { data: locationsData, isLoading: isSearchingLocations } = useQuery<ResponseSearchLocations>({
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
	})

	const locations = locationsData?.Data || []

	// Use TanStack Query for data fetching with infinite scroll
	const { data: gamesData, isLoading: isSearchingGames } = useQuery<ResponseSearchGames>({
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
	})

	const games = gamesData?.Data || []

	const cancelEventMutation = useMutation({
		mutationFn: async () => {
			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/events', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					EventId: event.Id,
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
			console.error(err)
			toast({
				title: "Erro ao cancelar evento",
				description: err.message,
				variant: "destructive",
			})
		}
	});

	const editEventMutation = useMutation({
		mutationFn: async (body: MutationParams) => {
			const reqBody: any = {}

			if (body.Name != event.Name) {
				reqBody.Name = body.Name
			}
			if (body.Description != event.Description) {
				reqBody.Description = body.Description
			}
			if (body.StartDate.toISOString().replace('.000', '') != event.StartDate) {
				reqBody.StartDate = body.StartDate.toISOString().replace('.000', '')
			}
			if (body.EndDate.toISOString().replace('.000', '') != event.EndDate) {
				reqBody.EndDate = body.EndDate.toISOString().replace('.000', '')
			}
			if (body.Capacity != event.Capacity) {
				reqBody.Capacity = body.Capacity
			}
			if (body.Location.Id != event.Location.Id) {
				reqBody.LocationId = body.Location.Id
			}
			if (body.EventImage !== null) {
				const { FilePath } = await uploadImage({
					FileName: body.EventImage?.name,
					ImageBlob: body.EventImage,
					Kind: "EVENT_ICON"
				})

				reqBody.IconPath = FilePath
			}

			const currentGamesIds = event.Games.map(g => g.Id)
			const bodyGamesIds = body.Games.map(g => g.Id)

			const gamesToAdd = bodyGamesIds.filter(gId => !currentGamesIds.includes(gId))
			const gamesToRemove = currentGamesIds.filter(gId => !bodyGamesIds.includes(gId))

			if (gamesToAdd.length > 0) {
				reqBody.GamesToAdd = gamesToAdd
			}
			if (gamesToRemove.length > 0) {
				reqBody.GamesToRemove = gamesToRemove
			}

			if (Object.keys(reqBody).length === 0) {
				return
			}

			console.log(reqBody);
			throw new Error("foo")

			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/events', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(reqBody),
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
			Capacity: event.Capacity,
			Description: event.Description,
			EndDate: new Date(event.EndDate),
			Location: event.Location,
			Games: event.Games,
			Name: event.Name,
			StartDate: new Date(event.StartDate),
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
		setImagePreview(undefined)
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
		editEventMutation.mutate({
			...values,
			EventImage: eventImage
		})
	}

	return (
		<main className="flex-1 container mx-auto py-8 px-4 mb-16">
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle>Editar Evento</CardTitle>
							<CardDescription>
								Faça as alterações necessárias no seu evento. Os participantes confirmados serão notificados sobre as
								mudanças.
							</CardDescription>
						</div>
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="destructive" size="sm" className="gap-2">
									<Trash2 className="h-4 w-4" />
									Cancelar Evento
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle className="flex items-center gap-2">
										<Triangle className="h-5 w-5 text-red-500" />
										Cancelar Evento
									</DialogTitle>
									<DialogDescription>
										Tem certeza que deseja cancelar este evento? Esta ação não pode ser desfeita e todos os
										participantes confirmados serão notificados sobre o cancelamento.
										{event.Attendances.length > 0 && (
											<div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
												<strong>{confirmationsCount} participante(s)</strong> confirmado(s) será(ão)
												notificado(s).
											</div>
										)}
									</DialogDescription>
								</DialogHeader>
								<DialogFooter>
									<DialogClose>Manter Evento</DialogClose>
									<Button
										variant="destructive"
										onClick={() => cancelEventMutation.mutate()}
										disabled={cancelEventMutation.isPending}
										className="bg-red-600 hover:bg-red-700 text-white"
									>
										{cancelEventMutation.isPending ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Cancelando...
											</>
										) : (
											"Sim, Cancelar Evento"
										)}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
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
										Alterar Imagem
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
										<FormLabel>Data e Hora de Término (Opcional)</FormLabel>
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
											Número máximo de participantes que podem confirmar presença. Deixe em branco para capacidade
											ilimitada.
											{confirmationsCount > 0 && (
												<div className="mt-1 text-amber-600">
													<strong>Atenção:</strong> {confirmationsCount} pessoa(s) já confirmaram
													presença.
												</div>
											)}
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

													{!isSearchingGames && gameQuery.length < 2 && (
														<CommandEmpty>Digite pelo menos 2 caracteres para buscar</CommandEmpty>
													)}

													{!isSearchingGames && gameQuery.length >= 2 && games.length === 0 && (
														<CommandEmpty>Nenhum jogo encontrado</CommandEmpty>
													)}

													{games.length > 0 && (
														<CommandGroup>
															{games.map((game) => {
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
															<div
																key={game.Id}
																className="flex items-center gap-2 border rounded-md p-2 bg-muted/20"
															>
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
								<Button type="submit" disabled={editEventMutation.isPending} className="text-white">
									{editEventMutation.isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Salvando...
										</>
									) : (
										"Salvar Alterações"
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
