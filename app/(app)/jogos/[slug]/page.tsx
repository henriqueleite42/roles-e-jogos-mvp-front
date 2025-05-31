import Image from "next/image"
import {
	ExternalLink,
	Users,
	Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Metadata } from "next"
import { redirect } from 'next/navigation';
import { GameData } from "@/types/api"
import { getDescription } from "@/lib/description"
import { Header } from "@/components/header"
import { GameOwners } from "./owners"
import { GameImages } from "./images"
import { GameEvents } from "./events"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
	const { slug } = await params

	const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/games?slug=" + slug, {
		method: "GET",
		credentials: "include"
	})

	if (!response.ok) {
		return {
			title: process.env.NEXT_PUBLIC_WEBSITE_NAME,
			description: 'Faça amigos e jogue jogos',
		}
	}

	const game = await response.json() as GameData

	return {
		title: game.Name,
		description: getDescription(game.Description),
		openGraph: game.IconUrl ? ({
			images: [game.IconUrl],
		}) : undefined,
	}
}

export default async function GameDetailsPage({ params }: { params: { slug: string } }) {
	const { slug } = await params

	const resGame = await fetch(process.env.NEXT_PUBLIC_API_URL + "/games?slug=" + slug, {
		method: "GET",
	})

	if (!resGame.ok) {
		console.error(await resGame.text())
		redirect('/jogos')
	}

	const game = await resGame.json() as GameData

	if (!game) {
		redirect('/jogos')
	}

	return (
		<div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-white">
			<Header title={game.Name} displayBackButton />

			<main className="flex-1 px-4 py-6 space-y-6 mb-10">
				{/* Game Header */}
				<Card className="overflow-hidden">
					<div className="flex flex-col sm:flex-row">
						<div className="w-full sm:w-48 h-64 sm:h-auto relative flex-shrink-0">
							<Image src={game.IconUrl || "/placeholder.svg"} alt={game.Name} fill className="object-cover" />
						</div>
						<CardContent className="flex-1 p-4 sm:p-6">
							<div className="space-y-3">
								<div className="flex items-center gap-4 text-sm">
									<div className="flex items-center gap-1">
										<Users className="h-4 w-4" />
										<span>
											{game.MinAmountOfPlayers === game.MaxAmountOfPlayers
												? `${game.MinAmountOfPlayers} jogadores`
												: `${game.MinAmountOfPlayers}-${game.MaxAmountOfPlayers} jogadores`}
										</span>
									</div>
									<div className="flex items-center gap-1">
										<Clock className="h-4 w-4" />
										<span>{game.AverageDuration}</span>
									</div>
								</div>

								{/* <div className="flex items-center gap-2">
									<div className="flex items-center gap-1">
										<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
										<span className="font-medium">{game.rating}</span>
									</div>
									<Badge variant="outline">Complexidade: {game.complexity}/5</Badge>
								</div> */}

								{/* <div className="flex flex-wrap gap-2">
									{game.categories.map((category) => (
										<Badge key={category} variant="secondary">
											{category}
										</Badge>
									))}
								</div> */}

								<div className="flex gap-2 pt-2">
									<Button asChild className="flex-1">
										<a href={game.LudopediaUrl} target="_blank" rel="noopener noreferrer" className="gap-2 text-white">
											<ExternalLink className="h-4 w-4" />
											Ver na Ludopedia
										</a>
									</Button>
									{/* <Button asChild variant="outline" className="flex-1">
										<a href={game.purchaseUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
											<ShoppingCart className="h-4 w-4" />
											Comprar na {game.partnerStoreName}
										</a>
									</Button> */}
								</div>
							</div>
						</CardContent>
					</div>
				</Card>

				{/* Game Description */}
				{game.Description && (
					<Card>
						<CardHeader>
							<CardTitle>Descrição</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground leading-relaxed">{game.Description}</p>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
								{/* <div className="sm:col-span-2">
								<h4 className="font-medium mb-2">Mecânicas</h4>
								<div className="flex flex-wrap gap-1">
									{game.mechanics.map((mechanic) => (
										<Badge key={mechanic} variant="outline" className="text-xs">
											{mechanic}
										</Badge>
									))}
								</div>
							</div> */}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Image Gallery */}
				<GameImages game={game} />

				{/* Owners */}
				<GameOwners game={game} />

				{/* Related Events */}
				<GameEvents game={game} />

				{/* Comments Section */}
				{/* <GameComments game={game} /> */}
			</main>
		</div>
	)
}
