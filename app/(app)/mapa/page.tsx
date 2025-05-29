import { Header } from "@/components/header"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Mapa",
		description: "Encontre pessoas proximas a voce para combinar caronas e mesas!",
		openGraph: {
			images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/mago.webp"],
		},
	}
}


export default function Map() {
	return (
		<>
			<Header title="Mapa" displayBackButton />

			<main className="flex-1 container py-8 px-4">
				<div className="rounded-lg overflow-hidden border">
					<iframe
						src="https://www.google.com/maps/d/u/0/embed?mid=1TdBj-p79GEwf-pMyPUEzDQsuuZb1ryU&ehbc=2E312F&noprof=1"
						width="100%"
						height="600"
						title="Mapa de jogos"
						className="border-0"
					></iframe>
				</div>
			</main>
		</>
	)
}
