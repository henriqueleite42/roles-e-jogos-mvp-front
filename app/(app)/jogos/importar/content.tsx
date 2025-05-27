"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Download, Loader2, Search, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useMutation, useQuery } from "@tanstack/react-query"
import { LudopediaGame, ResponseSearchLudopediaGames } from "@/types/api"

// Form schema with validation
const importFormSchema = z.object({
	selectedGame: z
		.object({
			LudopediaId: z.coerce.number().int(),
			Name: z.string(),
			IconUrl: z.string().optional().nullable(),
		})
		.nullable()
		.refine((game) => game !== null, {
			message: "Selecione um jogo para importar.",
		}),
})

type ImportFormValues = z.infer<typeof importFormSchema>

export function ImportGamesPage() {
	const { toast } = useToast()

	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [isPopoverOpen, setIsPopoverOpen] = useState(false)

	const [gameQuery, setGameQuery] = useState("")


	const debouncedGameQuery = useDebounce(gameQuery)

	// Initialize form with react-hook-form and zod
	const form = useForm<ImportFormValues>({
		resolver: zodResolver(importFormSchema),
		defaultValues: {},
	})

	const { data: games, isLoading: isSearchingGames } = useQuery<ResponseSearchLudopediaGames>({
		queryKey: ["search-games", debouncedGameQuery],
		queryFn: async () => {
			try {
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

				const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games/ludopedia/search?${query.toString()}`, {
					credentials: "include"
				})

				if (!response.ok) {
					throw new Error(`Erro ao pegar dados da API: ${response.status}`)
				}

				return response.json()
			} catch (err) {
				console.error(err)
				toast({
					title: "Falha na importação",
					description: (err as any).message || "Não foi possível importar o jogo.",
					variant: "destructive",
				})
				return []
			}
		},
	})

	const mutation = useMutation({
		mutationFn: async ({ selectedGame }: ImportFormValues) => {
			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/games/ludopedia/import', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					LudopediaGameId: selectedGame.LudopediaId
				}),
				credentials: 'include',
			});

			if (!res.ok) {
				const error = await res.text()
				console.error(error);
				throw new Error(error)
			}
		},
		onSuccess: (_, { selectedGame }) => {
			toast({
				title: "Jogo importado com sucesso!",
				description: `${selectedGame.Name} foi adicionado ao noso banco de dados.`,
				className: "bg-green-400"
			})

			form.reset()
			setGameQuery("")
			setIsDialogOpen(false)
		},
		onError: (err) => {
			toast({
				title: "Erro ao criar evento!",
				description: err.message,
				className: "bg-red-400"
			})
		}
	});

	const handleGameSelect = async (game: LudopediaGame) => {
		// Set the selected game in the form
		form.setValue("selectedGame", game)
		setIsPopoverOpen(false)
		setGameQuery("")

		// Start import immediately
		mutation.mutate({ selectedGame: game })
	}

	// Handle dialog close - reset form when dialog closes
	const handleDialogOpenChange = (open: boolean) => {
		setIsDialogOpen(open)
		if (!open) {
			form.reset()
			setGameQuery("")
		}
	}

	const handleSearchQueryChange = (value: string) => {
		setGameQuery(value)
		if (!isPopoverOpen && value.length > 0) {
			setIsPopoverOpen(true)
		}
	}

	return (
		<main className="flex-1 container mx-auto py-8 px-4">
			<div className="max-w-2xl mx-auto">
				<Card>
					<CardHeader>
						<CardTitle>Importar jogos</CardTitle>
						<CardDescription>
							Importe jogos para nosso banco de dados para que eles fiquem disponiveis para seleção.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex justify-center">
							{/* Ludopedia Import */}
							<Card className="border-2 border-dashed border-muted-foreground/25 hover:border-orange-300 transition-colors">
								<CardContent className="flex flex-col items-center justify-center p-6 text-center">
									<div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
										<Download className="h-8 w-8 text-orange-600" />
									</div>
									<h3 className="font-semibold text-lg mb-2">Ludopedia</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Importe jogos diretamente da  Ludopedia
									</p>

									<Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
										<DialogTrigger asChild>
											<Button className="w-full text-white">Importar da Ludopedia</Button>
										</DialogTrigger>
										<DialogContent className="sm:max-w-[425px]">
											<DialogHeader>
												<DialogTitle>Importar Jogo da Ludopedia</DialogTitle>
												<DialogDescription>
													Busque e selecione o jogo que você deseja importar da Ludopedia.
												</DialogDescription>
											</DialogHeader>

											<Form {...form}>
												<div className="space-y-4">
													<FormField
														control={form.control}
														name="selectedGame"
														render={({ field }) => (
															<FormItem className="flex flex-col">
																<FormLabel>Buscar Jogo</FormLabel>
																<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
																	<PopoverTrigger asChild>
																		<FormControl>
																			<Button
																				variant="outline"
																				role="combobox"
																				className={cn(
																					"w-full justify-between",
																					!field.value && "text-muted-foreground",
																				)}
																				disabled={mutation.isPending}
																			>
																				{field.value ? (
																					<div className="flex items-center gap-2 text-left">
																						{field.value.IconUrl && (
																							<div className="h-5 w-5 relative flex-shrink-0">
																								<Image
																									src={field.value.IconUrl || "/placeholder.svg"}
																									alt={field.value.Name}
																									fill
																									className="object-cover rounded"
																								/>
																							</div>
																						)}
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
																	<PopoverContent className="w-[400px] p-0" align="start">
																		<Command>
																			<CommandInput
																				placeholder="Digite o nome do jogo..."
																				value={gameQuery}
																				onValueChange={handleSearchQueryChange}
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

																				{!isSearchingGames && gameQuery.length >= 2 && (games?.Data || []).length === 0 && (
																					<CommandEmpty>Nenhum jogo encontrado</CommandEmpty>
																				)}

																				{(games?.Data || []).length > 0 && (
																					<CommandGroup>
																						{games?.Data.map((game) => (
																							<CommandItem
																								key={game.LudopediaId}
																								value={game.Name}
																								onSelect={() => handleGameSelect(game)}
																								className="flex items-center gap-3 p-3"
																							>
																								{game.IconUrl && (
																									<div className="h-10 w-10 relative flex-shrink-0">
																										<Image
																											src={game.IconUrl || "/placeholder.svg"}
																											alt={game.Name}
																											fill
																											className="object-cover rounded"
																										/>
																									</div>
																								)}
																								<div className="flex-1 min-w-0">
																									<div className="font-medium">{game.Name}</div>
																								</div>
																								{field.value?.LudopediaId === game.LudopediaId && (
																									<Check className="h-4 w-4 text-green-600" />
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

													{mutation.isPending && (
														<div className="flex items-center justify-center py-4">
															<Loader2 className="h-6 w-6 animate-spin text-orange-500 mr-2" />
															<span className="text-sm text-muted-foreground">Importando jogo...</span>
														</div>
													)}
												</div>
											</Form>
										</DialogContent>
									</Dialog>
								</CardContent>
							</Card>

							{/* Placeholder for future import sources */}
							{/* <Card className="border-2 border-dashed border-muted-foreground/25 opacity-50">
								<CardContent className="flex flex-col items-center justify-center p-6 text-center">
									<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
										<Download className="h-8 w-8 text-gray-400" />
									</div>
									<h3 className="font-semibold text-lg mb-2 text-muted-foreground">BoardGameGeek</h3>
									<p className="text-sm text-muted-foreground mb-4">Em breve: Importe jogos do BoardGameGeek</p>
									<Button variant="outline" disabled className="w-full">
										Em Breve
									</Button>
								</CardContent>
							</Card> */}
						</div>

						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<h4 className="font-medium text-blue-900 mb-2">💡 Dicas para importação:</h4>
							<ul className="text-sm text-blue-800 space-y-1">
								<li>• Digite o nome do jogo para ver as opções disponíveis</li>
								<li>• Selecione o jogo correto da lista de resultados</li>
								<li>• A importação começará automaticamente após a seleção</li>
							</ul>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
