"use client"

import type React from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Building2, Home, ImageIcon, Loader2, MapPin, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { uploadImage } from "@/lib/api/upload-image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useEffect, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandList, CommandItem } from "@/components/ui/command"
import { ExternalLocation, ResponseSearchExternalLocations } from "@/types/api"
import { promiseWithTimeout } from "@/lib/promise-with-timeout"
import { toast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { useRouter } from "next/navigation"

// Form schema with validation
const locationFormSchema = z.object({
	name: z.string().min(3, {
		message: "O nome do local deve ter pelo menos 3 caracteres.",
	}),
	kind: z.enum(["BUSINESS", "PERSONAL"], {
		required_error: "Selecione o tipo de local.",
	}),
	ZipCode: z.string(),
	State: z.string(),
	City: z.string(),
	Neighborhood: z.string(),
	FullAddress: z.string({
		required_error: "O endereço é obrigatório.",
	}),
	ExtraDetails: z.string().optional(),
	Latitude: z.coerce.number(),
	Longitude: z.coerce.number(),
}).refine((data) => {
	if (!data.FullAddress) return false;
	return true;
}, {
	message: "O endereço é obrigatório.",
	path: ["FullAddress"]
});

type LocationFormValues = z.infer<typeof locationFormSchema>

interface MutationParams extends LocationFormValues {
	LocationImage: File | null
}

export default function Page() {
	const queryClient = useQueryClient()
	const router = useRouter()

	const [eventImage, setEventImage] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)

	const [locationQuery, setLocationQuery] = useState("")
	const [isLocationPopoverOpen, setIsLocationPopoverOpen] = useState(false)

	const debouncedLocationQuery = useDebounce(locationQuery)

	// Handle location query change
	const handleLocationQueryChange = (value: string) => {
		setLocationQuery(value)
		if (!isLocationPopoverOpen) {
			setIsLocationPopoverOpen(true)
		}
	}

	// Use TanStack Query for data fetching with infinite scroll
	const { data: locations, isLoading: isSearchingLocations, error } = useQuery<ResponseSearchExternalLocations>({
		queryKey: ["search-external-locations", debouncedLocationQuery],
		staleTime: 1000 * 60 * 60, // 60 minutes
		queryFn: async () => {
			if (debouncedLocationQuery.length < 3) {
				return {
					Data: []
				}
			}

			if (!navigator.geolocation) {
				throw new Error("Browser nao suporta geolocation.")
			}

			const latlong = await promiseWithTimeout(
				new Promise<{ latitude: number; longitude: number }>((res, rej) => {
					navigator.geolocation.getCurrentPosition(
						(position) => {
							res(position.coords)
						},
						(error) => {
							console.error(error);
							rej(error)
						}
					)
				}),
				2000
			)

			const query = new URLSearchParams({
				query: debouncedLocationQuery,
				latitude: String(latlong.latitude),
				longitude: String(latlong.longitude),
			})

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/search/external?${query.toString()}`, {
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`Erro ao pegar dados da API: ${response.status}`)
			}

			return response.json()
		},
	})

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
					Address: body.FullAddress,
					City: body.City,
					Latitude: body.Latitude,
					Longitude: body.Longitude,
					Neighborhood: body.Neighborhood,
					State: body.State,
					ZipCode: body.ZipCode,
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
			queryClient.invalidateQueries({ queryKey: ["list-locations"] })
			router.push("/locais")
		}
	});

	// Initialize form
	const form = useForm<LocationFormValues>({
		resolver: zodResolver(locationFormSchema),
		defaultValues: {
			name: "",
			kind: "BUSINESS",
			ZipCode: "",
			State: "",
			City: "",
			Neighborhood: "",
			Latitude: 0,
			Longitude: 0,
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

	const handleLocationSelect = (location: ExternalLocation) => {
		form.setValue("ZipCode", location.ZipCode, { shouldValidate: true })
		form.setValue("State", location.State, { shouldValidate: true })
		form.setValue("City", location.City, { shouldValidate: true })
		form.setValue("Neighborhood", location.Neighborhood, { shouldValidate: true })
		form.setValue("FullAddress", location.FullAddress, { shouldValidate: true })
		form.setValue("Latitude", location.Latitude, { shouldValidate: true })
		form.setValue("Longitude", location.Longitude, { shouldValidate: true })
		form.setValue("name", location.Name, { shouldValidate: true })
		setIsLocationPopoverOpen(false)
		setLocationQuery("")
	}

	useEffect(() => {
		if (!error) return

		console.error(error);
		toast({
			title: "Erro ao buscar endereços",
			description: "Não foi possível buscar endereços. Se o erro persistir, por favor entre em contato com o suporte.",
			variant: "destructive",
		})
	}, [error])

	return (
		<>
			<Header title="Cadastrar local" displayBackButton />

			<main className="flex flex-col min-h-screen flex-1 container mx-auto pt-4 pb-8 px-4">

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Location Search */}
						<FormField
							control={form.control}
							name="FullAddress"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Endereço</FormLabel>
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
																<div>{field.value}</div>
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

													{!isSearchingLocations && locationQuery.length >= 3 && (locations?.Data || []).length === 0 && (
														<CommandEmpty>Nenhum local encontrado</CommandEmpty>
													)}

													{(locations?.Data || []).length > 0 && (
														<CommandGroup>
															{(locations?.Data || []).map((location) => (
																<CommandItem
																	key={location.Name}
																	value={location.Name}
																	onSelect={() => handleLocationSelect(location)}
																>
																	<div className="flex flex-col">
																		<div>{location.Name}</div>
																		<div className="text-xs text-muted-foreground">{location.FullAddress}</div>
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


						{/* Location Details - Disabled Fields */}
						{form.watch("ZipCode") && (
							<>
								<div className="space-y-4 max-w-90">
									<h4 className="font-medium text-sm">Detalhes do Endereço</h4>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<Label className="text-xs text-muted-foreground">CEP</Label>
											<Input value={form.watch("ZipCode") || ""} disabled className="text-sm" />
										</div>
										<div>
											<Label className="text-xs text-muted-foreground">Estado</Label>
											<Input value={form.watch("State") || ""} disabled className="text-sm" />
										</div>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<Label className="text-xs text-muted-foreground">Cidade</Label>
											<Input value={form.watch("City") || ""} disabled className="text-sm" />
										</div>
										<div>
											<Label className="text-xs text-muted-foreground">Bairro</Label>
											<Input
												value={form.watch("Neighborhood") || ""}
												disabled
												className="text-sm"
											/>
										</div>
									</div>

									<div>
										<Label className="text-xs text-muted-foreground">Endereço Completo</Label>
										<Input
											value={form.watch("FullAddress") || ""}
											disabled
											className="text-sm"
										/>
									</div>
								</div>

								{/* Location ExtraDetails */}
								<FormField
									control={form.control}
									name="ExtraDetails"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Complemento</FormLabel>
											<FormControl>
												<Input placeholder="Ex: Apto 75" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</>
						)}

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
									"Salvar Local"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</main>
		</>
	)
}