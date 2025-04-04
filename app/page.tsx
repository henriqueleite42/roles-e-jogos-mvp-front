"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import Image from "next/image"

// Sample data for our items
const items = [
	{
		id: 1,
		title: "Gizmos",
		url: "https://ludopedia.com.br/jogo/gizmos",
		rating: 2.04,
		image: "/games/gizmos.webp",
		persons: [
			{ name: "Henrique Leite", avatar: "/users/henrique-leite.jpg" },
		],
	},
]

export default function Home() {
	const [searchQuery, setSearchQuery] = useState("")

	// Filter items based on search query
	const filteredItems = items.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))

	return (
		<main className="container mx-auto py-8 px-4">
			<div className="mb-8">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search by title..."
						className="pl-10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			<div className="space-y-4">
				{filteredItems.length > 0 ? (
					filteredItems.map((item) => (
						<Card key={item.id} className="overflow-hidden">
							<CardContent className="p-0">
								<div className="flex flex-col md:flex-row">
									<div className="flex-1 p-6">
										<h2 className="text-2xl font-bold">{item.title}</h2>
										<div className="flex items-center mt-2 mb-4">
											<div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
												{item.rating.toFixed(1)}
											</div>
										</div>
										<div className="flex">
											{item.persons.map((person, index) => (
												<div key={index} className="relative group mr-1">
													<Image
														src={person.avatar}
														alt={person.name}
														width={40}
														height={40}
														className="rounded-full border-2 border-background"
													/>
													<div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
														{person.name}
													</div>
												</div>
											))}
										</div>
									</div>
									<div className="md:w-[300px] h-[200px] relative">
										<Image src={item.image} alt={item.title} fill className="object-cover" />
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
			</div>
		</main>
	)
}

