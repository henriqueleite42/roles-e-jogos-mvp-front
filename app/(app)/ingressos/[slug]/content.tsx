"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
	CalendarIcon,
	MapPinIcon,
	UserIcon,
	TicketIcon,
	QrCodeIcon,
	Ticket,
} from "lucide-react"
import { EventData, EventTicketData, EventTicketStatus, EventType, Profile, ResponseAccountEventTicketsByEvent } from "@/types/api"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { formatEventDate } from "@/lib/dates"
import { formatDisplayPrice } from "@/lib/price"
import { useToast } from "@/hooks/use-toast"
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Params {
	account: Profile
	event: EventData
}

function getStatusBadge(status: EventTicketStatus) {
	switch (status) {
		case "ATTENDED":
			return (
				<Badge variant="default" className="bg-green-500">
					Utilizado
				</Badge>
			)
		case "PAID":
			return <Badge variant="default">Pago</Badge>
		case "WAITING_PAYMENT":
		default:
			return <Badge variant="secondary">Pendente</Badge>
	}
}

function getPaymentText(eventType: EventType) {
	switch (eventType) {
		case "PAID_ON_SITE":
			return "Total à pagar:"
		case "BUY_ON_THIRD_PARTY":
		case "FREE":
		default:
			return "Total pago:"
	}
}

function getQrCodeValue(account: Profile, event: EventData, ticket: EventTicketData) {
	const query = new URLSearchParams({
		accountId: String(account.AccountId),
		eventId: String(event.Id),
		ticketId: String(ticket.Id),
	}).toString()

	return `${process.env.NEXT_PUBLIC_API_URL}/events/tickets/validate?${query.toString()}`
}

export default function TicketDetailsPage({ account, event }: Params) {
	const { toast } = useToast()

	const { data, isPending } = useQuery<ResponseAccountEventTicketsByEvent>({
		queryKey: ["account-event-tickets", event.Id],
		staleTime: 1000 * 60 * 10, // 10 minutes
		queryFn: async () => {
			const query = new URLSearchParams({
				eventId: String(event.Id),
				limit: String(100),
			})

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/tickets/mine/event?${query.toString()}`, {
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`Get connection import status failed with status ${response.status}`)
			}

			return response.json()
		},
	})

	const tickets = useMemo(() => data?.Data || [], [data])

	const totalPrice = (event.Price || 0) * tickets.length

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
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
			{/* Event Information */}
			<div className="lg:col-span-1">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CalendarIcon className="h-5 w-5" />
							Informações do Evento
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Event Image */}
						<div className="text-center">
							<img
								src={event.IconUrl || "/placeholder.svg"}
								alt={event.Name}
								className="w-32 h-32 rounded-lg object-cover mx-auto mb-4"
							/>
							<h3 className="font-semibold text-lg">{event.Name}</h3>
						</div>

						<Separator />

						{/* Event Details */}
						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<CalendarIcon className="h-4 w-4 text-muted-foreground mt-1" />
								<div>
									<div className="font-medium">Data e Hora</div>
									<div className="text-sm text-muted-foreground">
										{formatEventDate(event.StartDate)} - {formatEventDate(event.EndDate)}
									</div>
								</div>
							</div>

							<div className="flex items-start gap-3" onClick={() => copyAddress(event)}>
								<MapPinIcon className="h-4 w-4 text-muted-foreground mt-1" />
								<div>
									<div className="font-medium">{event.Location.Name}</div>
									<div className="text-sm text-muted-foreground">{event.Location.Address}</div>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<UserIcon className="h-4 w-4 text-muted-foreground mt-1" />
								<div>
									<div className="font-medium">Organizador</div>
									<div className="flex items-center gap-2 mt-1">
										<Avatar className="h-6 w-6">
											<AvatarImage src={event.Organizer.AvatarUrl || "/placeholder.svg"} />
											<AvatarFallback>{event.Organizer.Handle.substring(0, 2).toUpperCase()}</AvatarFallback>
										</Avatar>
										<span className="text-sm">@{event.Organizer.Handle}</span>
									</div>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<TicketIcon className="h-4 w-4 text-muted-foreground mt-1" />
								<div>
									<div className="font-medium">Preço Total</div>
									<div className="text-sm text-muted-foreground">
										{formatDisplayPrice(totalPrice)} ({tickets.length} {tickets.length === 1 ? "ingresso" : "ingressos"})
									</div>
								</div>
							</div>
						</div>

						<Separator />

						{/* Description */}
						<div>
							<div className="font-medium mb-2">Descrição</div>
							<p className="text-sm text-muted-foreground">{event.Description}</p>
						</div>

						<Separator />

						{/* See complete event */}
						<div>
							<Button variant="link" size="sm" className="flex-1 w-full" asChild>
								<Link href={`/eventos/${event.Slug}`}>
									Ver evento completo
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Tickets */}
			<div className="lg:col-span-2">
				{isPending && (
					<div className="text-center py-10">
						<Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<p className="text-muted-foreground">Carregando ingressos...</p>
					</div>
				)}

				{!isPending && (
					<>

						<div className="space-y-6">
							{tickets.map((ticket, index) => (
								<Card key={ticket.Id}>
									<CardHeader>
										<div className="flex items-center justify-between">
											<CardTitle className="flex items-center gap-2">
												<QrCodeIcon className="h-5 w-5" />
												Ingresso #{index + 1}
											</CardTitle>
											{getStatusBadge(ticket.Status)}
										</div>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											{/* QR Code */}
											<div className="text-center">
												<div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
													<QRCode value={getQrCodeValue(account, event, ticket)} className="w-64 h-64 mx-auto" />
												</div>
												<p className="text-sm text-muted-foreground mt-2">Apresente este QR Code na entrada do evento</p>
											</div>

											{/* Ticket Details */}
											<div className="space-y-4">
												<div>
													<div className="font-medium text-sm text-muted-foreground">ID do Ingresso</div>
													<div className="font-mono text-lg">#{ticket.Id.toString().padStart(6, "0")}</div>
												</div>

												<div>
													<div className="font-medium text-sm text-muted-foreground">Comprado em</div>
													<div>{formatEventDate(ticket.CreatedAt)}</div>
												</div>

												{ticket.PaidAt && (
													<div>
														<div className="font-medium text-sm text-muted-foreground">Pago em</div>
														<div>{formatEventDate(ticket.PaidAt)}</div>
													</div>
												)}

												{ticket.AttendedAt && (
													<div>
														<div className="font-medium text-sm text-muted-foreground">Utilizado em</div>
														<div>{formatEventDate(ticket.AttendedAt)}</div>
													</div>
												)}

												<div>
													<div className="font-medium text-sm text-muted-foreground">Preço</div>
													<div className="text-lg font-semibold">{formatDisplayPrice(event.Price)}</div>
												</div>

												{/* Actions */}
												{/* <Separator /> */}
												{/* <div className="flex gap-2">
											<Button variant="outline" size="sm" onClick={() => handleDownloadTicket(ticket.Id)}>
												<DownloadIcon className="h-4 w-4 mr-2" />
												Download
											</Button>
											<Button variant="outline" size="sm" onClick={() => handleShareTicket(ticket.Id)}>
												<ShareIcon className="h-4 w-4 mr-2" />
												Compartilhar
											</Button>
										</div> */}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>

						{/* Summary */}
						<Card className="mt-6">
							<CardHeader>
								<CardTitle>Resumo</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span>Quantidade de ingressos:</span>
										<span>{tickets.length}</span>
									</div>
									<div className="flex justify-between">
										<span>Preço unitário:</span>
										<span>{formatDisplayPrice(event.Price)}</span>
									</div>
									<Separator />
									<div className="flex justify-between font-semibold text-lg">
										<span>{getPaymentText(event.Type)}</span>
										<span>{formatDisplayPrice(totalPrice)}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</>
				)}
			</div>
		</div>
	)
}
