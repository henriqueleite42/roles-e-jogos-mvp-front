"use client"

import { Card, CardContent } from "@/components/ui/card"
import { EventAttendanceData, EventData, Profile, ResponseListEventAttendances } from "@/types/api"
import Image from "next/image"
import { ShareButton } from "./share"
import { Dates } from "./dates"
import { MapPin, SquareArrowOutUpRight, Users } from "lucide-react"
import { Attendances } from "./attendances"
import { getAvailableSpots } from "./utils"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Params {
	account: Profile | null
	event: EventData
	attendances: ResponseListEventAttendances
}

const getAvailableCapacity = (event: EventData, attendances: Array<EventAttendanceData>) => {
	const { availableSpots, isFull } = getAvailableSpots(event, attendances)

	if (!event.Capacity) {
		return (
			<span className="text-green-600 font-medium">
				Sem limite de vagas!
			</span>
		)
	}

	if (isFull) {
		return (
			<span className="text-red-600 font-medium">
				Evento lotado
			</span>
		)
	}

	return (
		<span className="text-yellow-600 font-medium">
			{`${availableSpots} vagas disponíveis`}
		</span>
	)
}

export const EventDetails = ({ event, attendances, account }: Params) => {
	const { toast } = useToast()

	const copyAddress = async (event: EventData) => {
		try {
			await navigator.clipboard.writeText(event.Location.Address)
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

	return (
		<Card className="overflow-hidden">
			{event.IconUrl && (
				<div className="h-64 relative">
					<Image src={event.IconUrl || "/placeholder.svg"} alt={event.Name} fill className="object-cover" />
				</div>
			)}
			<CardContent className="p-6">
				<div className="flex justify-between items-start mb-4">
					<h1 className="text-3xl font-bold">{event.Name}</h1>
					<ShareButton event={event} />
				</div>
				<p className="text-lg mb-6 whitespace-pre-line overflow-hidden text-ellipsis break-words">{event.Description}</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Dates event={event} />

					<div className="space-y-3">
						<div className="flex items-start gap-2" onClick={() => copyAddress(event)}>
							<MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div>
								<p className="font-medium">{event.Location.Name}</p>
								<p className="text-sm text-muted-foreground">{event.Location.Address}</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Users className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="font-medium">Capacidade</p>
								<p className="text-sm text-muted-foreground">
									{getAvailableCapacity(event, attendances.Data)}
								</p>
							</div>
						</div>

					</div>
				</div>

				{event.ExternalUrl ? (
					<div className="mt-4 flex justify-center">
						<Button
							variant="outline"
							size="lg"
							asChild
							className="p-3 w-15 bg-primary text-white"
							title="Comprar ingressos"
						>
							<Link href={event.ExternalUrl} className="gap-1 w-full">
								<SquareArrowOutUpRight className="h-4 w-4" />
								Comprar ingressos
							</Link>
						</Button>
					</div>
				) : (
					<div className="mt-4 flex justify-center">
						<Attendances event={event} attendances={attendances.Data} account={account} />
					</div>
				)}
			</CardContent>
		</Card>
	)
}