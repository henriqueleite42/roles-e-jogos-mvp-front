import { Metadata } from "next"
import { Header } from "@/components/header"
import { MapPage } from "./content"

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Mapa",
		description: "Encontre pessoas proximas a voce para combinar caronas e mesas!",
		openGraph: {
			images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/mago.webp"],
		},
	}
}

export default function Page() {
	return (
		<>
			<Header title="Mapa" displayBackButton />

			<main className="overflow-hidden min-h-[84vh]">
				<MapPage />
			</main>
		</>
	)
}