import { Metadata } from "next";
import GamesPage from "./content";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Jogos",
		description: 'Veja os jogos e rpgs da comunidade',
		openGraph: {
			images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/mago.webp"],
		},
	}
}

export default function Page() {
	return <GamesPage />
}