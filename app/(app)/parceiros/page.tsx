import { Header } from "@/components/header"
import { Partners } from "@/components/partners"

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
