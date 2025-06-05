"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { LocationData } from "@/types/api"
import { Copy, MapPin } from "lucide-react"

export function LocationAddress({ location }: { location: LocationData }) {
	const { toast } = useToast()

	const copyAddress = async () => {
		if (location) {
			try {
				await navigator.clipboard.writeText(location.Address)
				toast({
					title: "Endereço copiado",
					description: "O endereço foi copiado para a área de transferência.",
				})
			} catch (error) {
				toast({
					title: "Erro ao copiar",
					description: "Não foi possível copiar o endereço.",
					variant: "destructive",
				})
			}
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MapPin className="h-5 w-5" />
					Endereço
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1">
						<p className="font-medium">{location.Address}</p>
						<p className="text-sm text-muted-foreground mt-1">
							{location.Neighborhood}, {location.City} - {location.State}
						</p>
						<p className="text-sm text-muted-foreground">CEP: {location.ZipCode}</p>
					</div>
					<Button variant="outline" size="icon" onClick={copyAddress}>
						<Copy className="h-4 w-4" />
					</Button>
				</div>

				<div className="grid grid-cols-2 gap-4 pt-4 border-t">
					<div>
						<p className="text-sm font-medium">Região</p>
						<p className="text-sm text-muted-foreground">
							{location.City}, {location.State}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}