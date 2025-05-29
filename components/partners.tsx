import Image from "next/image"
import { Card, CardContent } from "./ui/card"


// Partnership type
type Partnership = {
	id: number
	name: string
	description: string
	logoUrl: string
	website: string
}

const partnerships: Partnership[] = [
	{
		id: 1,
		name: "Golgari Adventures",
		description: "Os maiores influencers de Magic: The Gathering e card games da região.",
		logoUrl: "/golgari-adventures.jpg",
		website: "https://www.instagram.com/golgari.adventures/",
	},
]

export function Partners() {
	return (
		<section>
			<h2 className="text-3xl font-bold mb-6 text-center">Nossos Parceiros</h2>
			<div className="space-y-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{partnerships
						.map((partner) => (
							<Card key={partner.id} className="overflow-hidden hover:shadow-md transition-all pt-5">
								<div className="h-32 relative bg-white flex items-center justify-center p-4">
									<Image
										src={partner.logoUrl || "/placeholder.svg"}
										alt={partner.name}
										width={150}
										height={75}
										className="object-contain"
									/>
								</div>
								<CardContent className="p-4">
									<h4 className="font-bold my-1">{partner.name}</h4>
									<p className="text-muted-foreground text-sm mb-3">{partner.description}</p>
									<a
										href={partner.website}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-blue-600 hover:underline"
									>
										Visitar site
									</a>
								</CardContent>
							</Card>
						))}
				</div>
			</div>
		</section>
	)
}