import { Header } from "@/components/header"
import { Partners } from "@/components/partners"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Parceiros",
		description: "Conheça nossos parcerios: As pessoas que ajudam a tornar o que fazemos possivel!",
		openGraph: {
			images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/mago.webp"],
		},
	}
}

export default function Page() {
	return (
		<div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-white">
			<Header title="Parceiros" displayBackButton />

			<main className="flex-1 container mx-auto py-8 px-4">
				{/* Partnerships Section */}
				<Partners />
			</main>
		</div>
	)
}
