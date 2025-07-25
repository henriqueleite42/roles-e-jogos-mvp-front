import { Metadata } from "next"
import { Comunidades } from "./content"

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Comunidades",
		description: "Encontre pessoas para jogar contigo!",
		openGraph: {
			images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/mago.webp"],
		},
	}
}

export default async function Page() {
	return <Comunidades />
}
