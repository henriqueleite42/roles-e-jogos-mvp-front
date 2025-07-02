import { Header } from "@/components/header"
import { CreateLocationForm } from "./form"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "Cadastrar local",
		description: "Cadastre um novo local em nosso site",
		openGraph: {
			images: [process.env.NEXT_PUBLIC_WEBSITE_URL + "/mago.webp"],
		},
	}
}

export default function Page() {
	return (
		<>
			<Header title="Cadastrar local" displayBackButton />

			<main className="flex flex-col min-h-screen flex-1 container mx-auto pt-4 pb-8 px-4">
				<CreateLocationForm />
			</main>
		</>
	)
}