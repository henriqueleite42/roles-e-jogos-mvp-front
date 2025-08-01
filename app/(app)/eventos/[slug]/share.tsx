"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { EventData } from "@/types/api"
import { Share2 } from "lucide-react"

const handleShare = async (event: EventData) => {
	const shareData = {
		title: event.Name,
		text: `${event.Name} - ${event.Description.substring(0, 100)}...`,
		url: window.location.href,
	}

	try {
		// Check if Web Share API is supported (typically mobile)
		if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
			await navigator.share(shareData)
			toast({
				title: "Evento compartilhado",
				description: "O evento foi compartilhado com sucesso.",
			})
		} else {
			// Fallback to clipboard (typically desktop)
			await navigator.clipboard.writeText(window.location.href)
			toast({
				title: "Link copiado",
				description: "O link do evento foi copiado para a área de transferência.",
			})
		}
	} catch (error) {
		// Handle user cancellation or other errors
		if ((error as any).name !== "AbortError") {
			toast({
				title: "Erro ao compartilhar",
				description: "Não foi possível compartilhar o evento. Tente novamente.",
				variant: "destructive",
			})
		}
	}
}

export function ShareButton({ event }: { event: EventData }) {
	return (
		<Button
			variant="outline"
			size="icon"
			onClick={() => handleShare(event)}
			className="p-3 w-15 bg-primary text-white"
			title="Compartilhar evento"
		>
			<Share2 className="h-4 w-4" />
			Share
		</Button>
	)
}