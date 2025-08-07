"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EventData, ResponseListEventTicketBuyers } from "@/types/api"
import { useQuery } from "@tanstack/react-query"

interface Props {
	event: EventData
}

export function Confirmations({ event }: Props) {
	// Use TanStack Query for data fetching with infinite scroll
	const { data, isLoading } = useQuery<ResponseListEventTicketBuyers>({
		queryKey: ["event-ticket-buyers", event.Id],
		queryFn: async () => {
			const query = new URLSearchParams({
				limit: String(100),
				eventId: String(event.Id),
			})

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/tickets/buyers?${query.toString()}`, {
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`Erro ao pegar dados da API: ${response.status}`)
			}

			return response.json()
		},
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					Participantes Confirmados
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-2">
					{data?.Data.map((person) => (
						<div key={person.Profile.AccountId} className="flex items-center gap-2 border rounded-full px-3 py-1">
							<Avatar className="w-6 h-6">
								<AvatarImage src={person.Profile.AvatarUrl || "/placeholder.svg"} alt={person.Profile.Handle} />
								<AvatarFallback className="text-xs">{person.Profile.Handle.substring(0, 2).toUpperCase()}</AvatarFallback>
							</Avatar>
							<span className="text-sm">{person.Profile.Handle}</span>
							{
								person.AmountOfTickets > 1 && (
									<Badge variant="secondary" className="text-xs ml-1">
										x{person.AmountOfTickets}
									</Badge>
								)
							}
						</div>
					))}

					{data?.Data.length === 0 && !isLoading && (
						<p className="text-sm text-muted-foreground">Nenhuma confirmação ainda</p>
					)}
				</div>
			</CardContent>
		</Card>
	)
}