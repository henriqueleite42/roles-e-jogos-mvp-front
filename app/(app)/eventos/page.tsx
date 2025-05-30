import { Metadata } from "next"
import Events from "./content"

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Eventos",
		description: "Veja todos os proximos eventos e mesas!",
		openGraph: {
			images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/mago.webp"],
		},
	}
}

export default async function Page() {
	return <Events />
}
