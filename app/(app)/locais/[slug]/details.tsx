"use client"

import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { LocationData } from "@/types/api"
import { Navigation, Share2 } from "lucide-react"

export function LocationDetails({ location }: { location: LocationData }) {
	const { toast } = useToast()

	const openInMaps = () => {
		if (location) {
			const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.Latitude},${location.Longitude}`
			window.open(mapsUrl, "_blank")
		}
	}

	const shareLocation = async () => {
		if (!location) return

		const shareData = {
			title: location.Name,
			text: `${location.Name} - ${location.Address}`,
			url: window.location.href,
		}

		try {
			if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
				await navigator.share(shareData)
			} else {
				await navigator.clipboard.writeText(window.location.href)
				toast({
					title: "Link copiado",
					description: "O link do local foi copiado para a área de transferência.",
				})
			}
		} catch (error: any) {
			if (error.name !== "AbortError") {
				toast({
					title: "Erro ao compartilhar",
					description: "Não foi possível compartilhar o local.",
					variant: "destructive",
				})
			}
		}
	}


	return (
		<CardContent className="p-6">
			<div className="space-y-4">
				<div className="flex gap-2">
					<Button onClick={openInMaps} className="flex-1 gap-2 text-white">
						<Navigation className="h-4 w-4" />
						Abrir no Maps
					</Button>
					<Button onClick={shareLocation} variant="outline" size="icon">
						<Share2 className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</CardContent>
	)
}