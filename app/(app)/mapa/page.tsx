"use client"

export default function Map() {
	return (
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
	)
}
