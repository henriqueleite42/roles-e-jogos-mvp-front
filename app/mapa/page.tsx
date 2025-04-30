"use client"

import { BottomNavbar } from "@/components/bottom-navbar"

export default function Map() {
	return (
		<main className="container mx-auto py-8 px-4">
			<h1 className="text-3xl font-bold mb-6">Rolês & Jogos</h1>

			<div className="rounded-lg overflow-hidden border">
				<iframe
					src="https://www.google.com/maps/d/u/0/embed?mid=1TdBj-p79GEwf-pMyPUEzDQsuuZb1ryU&ehbc=2E312F&noprof=1"
					width="100%"
					height="480"
					title="Mapa de jogos"
					className="border-0"
				></iframe>
			</div>

			<BottomNavbar />
		</main>
	)
}
