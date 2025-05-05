"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Users, Filter } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import ITEMS from "../../../get-data/games.json"

// Sample data for our items
const items = Object.values(ITEMS).sort((a, b) => {
	if (a.Game.Name > b.Game.Name) {
		return 1
	} else {
		return -1
	}
})

const ownersSet = {} as { [accountId: number]: any }
items.forEach((item) => {
	item.Owners.forEach((owner) => {
		if (!ownersSet[owner.AccountId]) {
			ownersSet[owner.AccountId] = owner
		}
	})
})
const uniqueOwners = Object.values(ownersSet).sort((a, b) => {
	if (a.Handle > b.Handle) {
		return 1
	} else {
		return -1
	}
})

export default function Home() {
	const [searchQuery, setSearchQuery] = useState("")
	const [activeView, setActiveView] = useState("GAME")
	const [selectedOwner, setSelectedOwner] = useState("all")
	const [maxPlayers, setMaxPlayers] = useState("0")

	// Filter items based on all criteria
	const filteredItems = useMemo(() => {
		return items.filter((item) => {
			// Filter by kind
			const kind = item.Game.Kind === activeView
			if (!kind) {
				return false
			}

			// Filter by minimum players
			const playerMatch = maxPlayers === "0" || Number.parseInt(maxPlayers, 10) <= item.Game.MaxAmountOfPlayers
			if (!playerMatch) {
				return false
			}

			// Filter by name
			const nameMatch = searchQuery === "" || item.Game.Name.toLowerCase().includes(searchQuery.toLowerCase())
			if (!nameMatch) {
				return false
			}

			// Filter by owner
			const ownerMatch =
				selectedOwner === "all" || item.Owners.some((owner) => owner.AccountId.toString() === selectedOwner)
			if (!ownerMatch) {
				return false
			}

			return true
		})
	}, [searchQuery, selectedOwner, maxPlayers, activeView])


	// Reset all filters
	const resetFilters = () => {
		setSearchQuery("")
		setSelectedOwner("all")
		setMaxPlayers("0")
	}

	return (
		<main className="container mx-auto py-8 px-4">
			<div className="flex flex-col md:flex-row gap-4 mb-8">
				<div className="relative flex-grow">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Pesquisar jogos..."
						className="pl-10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline" className="gap-2">
							<Filter className="h-4 w-4" />
							Filtros
							{(selectedOwner !== "all" || maxPlayers !== "0") && (
								<Badge variant="secondary" className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center">
									{(selectedOwner !== "all" ? 1 : 0) + (maxPlayers !== "0" ? 1 : 0)}
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
								<div className="grid gap-1">
									<Label htmlFor="owner">Proprietário</Label>
									<Select value={selectedOwner} onValueChange={setSelectedOwner}>
										<SelectTrigger id="owner">
											<SelectValue placeholder="Todos os proprietários" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todos os proprietários</SelectItem>
											{uniqueOwners.map((owner) => (
												<SelectItem key={owner.AccountId} value={owner.AccountId.toString()}>
													{owner.Handle}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
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
								<Button variant="outline" onClick={resetFilters} className="mt-2">
									Limpar filtros
								</Button>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>

			<div className="pb-5">
				<b>{filteredItems.length} jogos encontrados</b>
			</div>

			<Tabs defaultValue="GAME" className="mb-8">
				<TabsList>
					<TabsTrigger value="GAME" onClick={() => setActiveView("GAME")}>
						Jogos
					</TabsTrigger>
					<TabsTrigger value="RPG" onClick={() => setActiveView("RPG")}>
						RPGs
					</TabsTrigger>
				</TabsList>

				{activeView === "GAME" && (
					<TabsContent value="GAME" className="space-y-4 mt-4">
						{filteredItems.length > 0 ? (
							filteredItems.map((item) => (
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
														{item.Owners.map((person, index) => (
															<div key={index} className="relative group -ml-2 first:ml-0">
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
							))
						) : (
							<div className="text-center py-10">
								<p className="text-muted-foreground">Nenhum jogo encontrado.</p>
							</div>
						)}
					</TabsContent>)}


				{activeView === "RPG" && (
					<TabsContent value="RPG" className="space-y-4 mt-4">
						{filteredItems.length > 0 ? (
							filteredItems.map((item) => (
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
														{item.Owners.map((person, index) => (
															<div key={index} className="relative group -ml-2 first:ml-0">
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
							))
						) : (
							<div className="text-center py-10">
								<p className="text-muted-foreground">Nenhum rpg encontrado.</p>
							</div>
						)}
					</TabsContent>)}
			</Tabs>
		</main>
	)
}
