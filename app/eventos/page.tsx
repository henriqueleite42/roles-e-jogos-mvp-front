"use client"

import { BottomNavbar } from "@/components/bottom-navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from 'next/navigation'

export default function Map() {
	const router = useRouter()

	return (
		<main className="container mx-auto py-8 px-4">
			<h1 className="text-3xl font-bold mb-6">Rolês & Jogos</h1>

			<p>Em breve</p>

			<BottomNavbar />
		</main>
	)
}
