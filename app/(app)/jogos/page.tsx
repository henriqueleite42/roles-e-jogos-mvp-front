"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Users, Filter, Loader2, X, Check } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useDebounce } from "@/hooks/use-debounce"

interface Owner {
	AccountId: number
	AvatarUrl?: string
	Handle: string
}

interface GameCollection {
	Game: {
		IconUrl?: string
		Id: number
		LudopediaUrl?: string
		MaxAmountOfPlayers: number
		MinAmountOfPlayers: number
		Name: string
	}
	Owners: Array<Owner>
}

interface ResponseGames {
	Data: Array<GameCollection>
	Pagination: {
		Current?: string
		Limit: number
		Next?: string
	}
}

const ITEMS_PER_PAGE = 5

// export const metadata = {
// 	title: "Jogos",
// 	description: "Veja os jogos de toda a comunidade!",
// }

export default function GamesPage() {
	const [gameSearchQuery, setSearchQuery] = useState("")
	const [kind, setKind] = useState("GAME")
	const [maxPlayers, setMaxPlayers] = useState("0")
	const [ownerSearchQuery, setOwnerSearchQuery] = useState("")
	const [selectedOwnerDetails, setSelectedOwnerDetails] = useState<Owner | null>(null)
	const [isOwnerSearchOpen, setIsOwnerSearchOpen] = useState(false)

	// Debounce the game search query to avoid excessive API calls
	const debouncedGameSearch = useDebounce(gameSearchQuery)
	// Debounce the owner search query to avoid excessive API calls
	const debouncedOwnerSearch = useDebounce(ownerSearchQuery)

	// Use TanStack Query for data fetching with infinite scroll
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfiniteQuery<ResponseGames>({
		queryKey: ["games", kind, debouncedGameSearch, maxPlayers, selectedOwnerDetails],
		queryFn: async ({ pageParam = null }) => {
			const queryObj: Record<string, string> = {
				kind: kind,
				limit: String(ITEMS_PER_PAGE),
			}

			if (pageParam) {
				queryObj.after = String(pageParam)
			}
			if (debouncedGameSearch.length >= 3) {
				queryObj.gameName = debouncedGameSearch
			}
			if (maxPlayers != "0") {
				queryObj.maxAmountOfPlayers = maxPlayers
			}
			if (selectedOwnerDetails) {
				queryObj.accountId = String(selectedOwnerDetails.AccountId)
			}

			const query = new URLSearchParams(queryObj)

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections/collective?${query.toString()}`, {
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

	// Fetch owners based on search query
	const {
		data: ownerSearchResults,
		isLoading: isSearchingOwners,
	} = useQuery<Array<Owner>>({
		queryKey: ["ownerSearch", debouncedOwnerSearch],
		queryFn: async () => {
			if (!debouncedOwnerSearch || debouncedOwnerSearch.trim().length < 2) return []

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/search?query=${encodeURIComponent(debouncedOwnerSearch)}`)

			if (!response.ok) {
				throw new Error(`Owner search failed with status ${response.status}`)
			}

			return response.json().then(r => r.Data)
		},
		enabled: debouncedOwnerSearch.length >= 3,
		staleTime: 1000 * 60 * 5, // 5 minutes
	})

	// Count active filters
	const activeFilterCount = useMemo(() => {
		let count = 0
		if (maxPlayers !== "0") count++
		if (selectedOwnerDetails) count++
		return count
	}, [maxPlayers, selectedOwnerDetails])

	// Observer for infinite scroll
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

	// Reset all filters
	const resetFilters = () => {
		setSearchQuery("")
		setMaxPlayers("0")
		clearOwnerSelection()
	}

	// Handle owner selection
	const handleOwnerSelect = (owner: Owner) => {
		setSelectedOwnerDetails(owner)
		setOwnerSearchQuery("")
		setIsOwnerSearchOpen(false)
	}

	// Clear owner selection
	const clearOwnerSelection = () => {
		setOwnerSearchQuery("")
		setSelectedOwnerDetails(null)
		setIsOwnerSearchOpen(false)
	}

	// Loading state
	if (status === "pending") {
		return (
			<div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[60vh]">
				<Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
				<p className="text-lg text-muted-foreground">Carregando jogos...</p>
			</div>
		)
	}

	// Error state
	if (status === "error") {
		return (
			<div className="container mx-auto py-8 px-4">
				<Alert variant="destructive" className="mb-6">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Erro ao carregar jogos: {error.message}. Por favor, tente novamente mais tarde.
					</AlertDescription>
				</Alert>
				<Button onClick={() => window.location.reload()}>Tentar novamente</Button>
			</div>
		)
	}

	return (
		<main className="container mx-auto py-8 px-4 min-h-screen">
			<div className="flex flex-col md:flex-row gap-4 mb-8">
				<div className="relative flex-grow">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Pesquisar jogos..."
						className="pl-10"
						value={gameSearchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline" className="gap-2">
							<Filter className="h-4 w-4" />
							Filtros
							{activeFilterCount > 0 && (
								<Badge variant="secondary" className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center">
									{activeFilterCount}
								</Badge>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80">
						<div className="grid gap-4">
							<div className="space-y-2">
								<h4 className="font-medium leading-none">Filtros</h4>
								<p className="text-sm text-muted-foreground">Ajuste os filtros para encontrar jogos específicos.</p>
							</div>
							<div className="grid gap-2">
								{/* Game Kind */}
								<div className="grid gap-1">
									<Label htmlFor="kind">Items da lista</Label>
									<Select value={kind} onValueChange={setKind}>
										<SelectTrigger id="kind">
											<SelectValue placeholder="Selecione o tipo de jogo" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="GAME">Jogos</SelectItem>
											<SelectItem value="RPG">RPGs</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Owner search with API integration */}
								<div className="grid gap-1">
									<Label htmlFor="ownerSearch">Proprietário</Label>

									{selectedOwnerDetails ? (
										<div className="flex items-center justify-between border rounded-md p-2">
											<div className="flex items-center gap-2">
												<div className="rounded-full border w-8 h-8 overflow-hidden">
													<Image
														src={selectedOwnerDetails.AvatarUrl || "/placeholder.svg"}
														alt={selectedOwnerDetails.Handle}
														width={32}
														height={32}
														className="w-full h-full object-cover"
													/>
												</div>
												<span>{selectedOwnerDetails.Handle}</span>
											</div>
											<Button variant="ghost" size="sm" onClick={clearOwnerSelection} className="h-8 w-8 p-0">
												<X className="h-4 w-4" />
											</Button>
										</div>
									) : (
										<Popover open={isOwnerSearchOpen} onOpenChange={setIsOwnerSearchOpen}>
											<PopoverTrigger asChild>
												<Button variant="outline" role="combobox" className="justify-between w-full">
													Buscar proprietário
													<Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-full p-0" align="start">
												<Command>
													<CommandInput
														placeholder="Digite o nome do usuário..."
														value={ownerSearchQuery}
														onValueChange={setOwnerSearchQuery}
													/>
													<CommandList>
														{isSearchingOwners && (
															<div className="flex items-center justify-center py-6">
																<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
															</div>
														)}

														{!isSearchingOwners && ownerSearchQuery.length < 3 && (
															<CommandEmpty>Digite pelo menos 3 caracteres para buscar</CommandEmpty>
														)}

														{!isSearchingOwners && ownerSearchQuery.length >= 3 && ownerSearchResults?.length === 0 && (
															<CommandEmpty>Nenhum usuário encontrado</CommandEmpty>
														)}

														{(ownerSearchResults && ownerSearchResults.length > 0) && (
															<CommandGroup>
																{ownerSearchResults.map((owner) => (
																	<CommandItem
																		key={owner.AccountId}
																		value={owner.Handle}
																		onSelect={() => handleOwnerSelect(owner)}
																		className="flex items-center gap-2"
																	>
																		<div className="rounded-full border w-6 h-6 overflow-hidden">
																			<Image
																				src={owner.AvatarUrl || "/placeholder.svg"}
																				alt={owner.Handle}
																				width={24}
																				height={24}
																				className="w-full h-full object-cover"
																			/>
																		</div>
																		<span>{owner.Handle}</span>
																	</CommandItem>
																))}
															</CommandGroup>
														)}
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									)}
								</div>

								<div className="grid gap-1">
									<Label htmlFor="maxPlayers">Máximo de jogadores</Label>
									<Select value={maxPlayers} onValueChange={setMaxPlayers}>
										<SelectTrigger id="maxPlayers">
											<SelectValue placeholder="Qualquer número" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="0">Qualquer número</SelectItem>
											<SelectItem value="2">2+</SelectItem>
											<SelectItem value="3">3+</SelectItem>
											<SelectItem value="4">4+</SelectItem>
											<SelectItem value="5">5+</SelectItem>
											<SelectItem value="6">6+</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Active filters summary */}
								{activeFilterCount > 0 && (
									<div className="mt-2 text-sm text-muted-foreground">
										<p>
											{activeFilterCount} {activeFilterCount === 1 ? "filtro ativo" : "filtros ativos"}
										</p>
									</div>
								)}

								<Button variant="outline" onClick={resetFilters} className="mt-2">
									Limpar filtros
								</Button>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>

			{/* <div className="pb-5">
				<b>{allItems.length} itens encontrados</b>
			</div> */}

			{allItems.length > 0 ? (
				<div className="space-y-4 mt-4">
					{allItems.map((item) => (
						<Card key={item.Game.Id} className="overflow-hidden hover:shadow-md transition-shadow">
							<CardContent className="p-0">
								<div className="flex flex-row">
									<div className="flex-1 p-4 md:p-6">
										<h2 className="text-xl md:text-2xl font-bold">{item.Game.Name}</h2>
										<div className="flex flex-wrap items-center mt-2 mb-2 md:mb-4">
											<Badge variant="outline" className="mr-2 mb-1">
												{item.Game.MinAmountOfPlayers === item.Game.MaxAmountOfPlayers
													? `${item.Game.MinAmountOfPlayers} jogadores`
													: `${item.Game.MinAmountOfPlayers}-${item.Game.MaxAmountOfPlayers} jogadores`}
											</Badge>
											<a
												href={item.Game.LudopediaUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm text-blue-600 hover:underline"
											>
												Ver na Ludopedia
											</a>
										</div>
										<div className="flex items-center">
											<Users className="h-4 w-4 mr-2 text-muted-foreground" />
											<div className="flex">
												{item.Owners.map((person) => (
													<div key={person.AccountId} className="relative group -ml-2 first:ml-0">
														<div className="rounded-full border-2 border-background w-10 h-10 overflow-hidden">
															<Image
																src={person.AvatarUrl || "/placeholder.svg"}
																alt={person.Handle || `Usuário ${person.AccountId}`}
																width={40}
																height={40}
																className="w-full h-full object-cover object-center"
															/>
														</div>
														<div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
															{person.Handle || `ID: ${person.AccountId}`}
														</div>
													</div>
												))}
											</div>
										</div>
									</div>
									<div className="w-[100px] h-[100px] md:w-[200px] md:h-[200px] relative">
										<Image
											src={item.Game.IconUrl || "/placeholder.svg"}
											alt={item.Game.Name}
											fill
											className="object-cover"
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					))}

					{/* Infinite scroll observer element */}
					<div ref={observerTarget} className="w-full py-4 flex justify-center">
						{isFetchingNextPage && (
							<div className="flex items-center gap-2">
								<Loader2 className="h-5 w-5 animate-spin text-orange-500" />
								<span className="text-sm text-muted-foreground">Carregando mais jogos...</span>
							</div>
						)}
					</div>
				</div>
			) : (
				<div className="text-center py-10">
					<p className="text-muted-foreground">Nenhum item encontrado.</p>
				</div>
			)}
		</main>
	)
}
