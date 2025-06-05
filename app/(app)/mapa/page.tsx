import { Metadata } from "next"
import { Map } from "./content"

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
	return <Map />
}