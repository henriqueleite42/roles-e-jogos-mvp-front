"use client"

import { Card, CardContent } from "@/components/ui/card"
import { EventData, Profile, ResponseListEventTicketBuyers } from "@/types/api"
import Image from "next/image"
import { ShareButton } from "./share"
import { Calendar, Clock, CreditCard, DollarSign, Loader2, MapPin, Minus, Plus, ShoppingCart, SquareArrowOutUpRight, User, Users } from "lucide-react"
import { getAvailableSpots } from "./utils"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { formatEventDate } from "@/lib/dates"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import Link from "next/link"

interface Params {
	account: Profile | null
	event: EventData
	availableSpots: number
	isFull: boolean
}

function formatDisplayPrice(price?: number): string {
	if (!price) return "Gratuito"
	return `R$ ${(price / 100).toFixed(2).replace(".", ",")}`
}

export const EventDetails = ({ event, account, availableSpots, isFull }: Params) => {
	const { toast } = useToast()

	const [ticketQuantity, setTicketQuantity] = useState(1)
	const [isDialogOpen, setIsDialogOpen] = useState(false)

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

	const incrementQuantity = () => {
		if (!event?.Capacity) {
			setTicketQuantity((prev) => prev + 1)
			return
		}

		if (ticketQuantity < availableSpots) {
			setTicketQuantity((prev) => prev + 1)
		}
	}

	const decrementQuantity = () => {
		if (ticketQuantity > 1) {
			setTicketQuantity((prev) => prev - 1)
		}
	}

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			if (!account) {
				throw new Error("unauthorized")
			}

			console.log(ticketQuantity);

			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/tickets/free`, {
				method: "POST",
				body: JSON.stringify({
					EventId: event.Id,
					AccountId: account?.AccountId,
					Amount: ticketQuantity
				}),
				headers: { 'Content-Type': 'application/json' },
				credentials: "include"
			})

			if (!res.ok) {
				console.error(await res.text())
				throw new Error(`Fail to create tickets ${res.status}`)
			}
		},
		onSuccess: () => {
			setTicketQuantity(1)
			setIsDialogOpen(false)
			toast({
				title: "Ingressos comprados com sucesso!",
				description: "Seus ingressos podem ser encontrados na pagina de ingressos."
			})
		},
		onError: (error) => {
			console.error('Error creating tickets:', error)
			toast({
				title: "Erro ao comprar ingressos",
				description: error.message,
				variant: "destructive",
			})
		},

	})

	const totalPrice = (event.Price || 0) * ticketQuantity

	return (<Card className="overflow-hidden">
		<div className="h-64 relative">
			<Image src={event.IconUrl || "/placeholder.svg"} alt={event.Name} fill className="object-cover" />
		</div>
		<CardContent className="p-6">
			<div className="flex justify-between items-start mb-4">
				<h1 className="text-3xl font-bold flex-1 mr-4">{event.Name}</h1>
				<div className="flex gap-2">
					<ShareButton event={event} />
				</div>
			</div>
			<p className="text-muted-foreground text-lg mb-6">{event.Description}</p>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<Calendar className="h-5 w-5 text-muted-foreground" />
						<div>
							<p className="font-medium">Início</p>
							<p className="text-sm text-muted-foreground">{formatEventDate(event.StartDate)}</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Clock className="h-5 w-5 text-muted-foreground" />
						<div>
							<p className="font-medium">Término</p>
							<p className="text-sm text-muted-foreground">{formatEventDate(event.EndDate)}</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<User className="h-5 w-5 text-muted-foreground" />
						<div>
							<p className="font-medium">Organizador</p>
							<div className="flex items-center gap-2">
								<Avatar className="w-6 h-6">
									<AvatarImage
										src={event.Organizer.AvatarUrl || "/placeholder.svg"}
										alt={event.Organizer.Handle}
									/>
									<AvatarFallback className="text-xs">
										{event.Organizer.Handle.substring(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<span className="text-sm text-muted-foreground">@{event.Organizer.Handle}</span>
							</div>
						</div>
					</div>
				</div>

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
								{event.Capacity ? (
									<span className={cn(isFull ? "text-red-600 font-medium" : "")}>
										{availableSpots !== null && availableSpots > 0
											? `${availableSpots} vagas disponíveis`
											: "Evento lotado"}
									</span>
								) : (
									"Capacidade ilimitada"
								)}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<DollarSign className="h-5 w-5 text-muted-foreground" />
						<div>
							<p className="font-medium">Preço</p>
							<p className="text-sm text-muted-foreground">{
								event.Price ? (
									formatDisplayPrice(event.Price)
								) : (
									"Gratuito"
								)
							}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Buy Tickets Button */}
			{
				event.ExternalUrl && (
					<div className="mt-4 flex justify-center">
						<Button
							variant="outline"
							size="lg"
							asChild
							className="p-3 w-15 bg-primary text-white"
							title="Comprar ingressos"
						>
							<a href={event.ExternalUrl} target="_blank" rel="noopener noreferrer" className="gap-1 w-full">
								<SquareArrowOutUpRight className="h-4 w-4" />
								Comprar ingressos
							</a>
						</Button>
					</div>
				)
			}
			{
				!event.ExternalUrl && !account && (
					<div className="mt-4 flex justify-center">
						<Button asChild className="flex-1 text-white">
							<Link href="/home" className="flex flex-col items-center p-2 text-red-950">
								Crie uma conta para garantir sua vaga!
							</Link>
						</Button>
					</div>
				)
			}
			{
				!event.ExternalUrl && account && (
					<div className="mt-6 pt-6 border-t">
						<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
							<DialogTrigger asChild>
								<Button
									className="w-full text-white gap-2"
									size="lg"
									disabled={isFull}
								>
									<ShoppingCart className="h-5 w-5" />
									{isFull ? "Evento Lotado" : "Comprar Ingressos"}
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>Comprar Ingressos</DialogTitle>
									<DialogDescription>Selecione a quantidade de ingressos</DialogDescription>
								</DialogHeader>

								<div className="space-y-6">
									{/* Event Info */}
									<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
										<div className="w-12 h-12 relative">
											<Image
												src={event.IconUrl || "/placeholder.svg"}
												alt={event.Name}
												fill
												className="object-cover rounded"
											/>
										</div>
										<div className="flex-1">
											<h3 className="font-medium">{event.Name}</h3>
											<p className="text-sm text-muted-foreground">{formatEventDate(event.StartDate)}</p>
										</div>
									</div>

									{/* Quantity Selector */}
									<div className="space-y-3">
										<label className="text-sm font-medium">Quantidade de ingressos</label>
										<div className="flex items-center justify-center gap-4">
											<Button
												variant="outline"
												size="icon"
												onClick={decrementQuantity}
												disabled={ticketQuantity <= 1}
											>
												<Minus className="h-4 w-4" />
											</Button>
											<span className="text-2xl font-bold w-12 text-center">{ticketQuantity}</span>
											<Button
												variant="outline"
												size="icon"
												onClick={incrementQuantity}
												disabled={availableSpots !== null && ticketQuantity >= availableSpots}
											>
												<Plus className="h-4 w-4" />
											</Button>
										</div>
										{availableSpots !== Number.MAX_VALUE && (
											<p className="text-xs text-muted-foreground text-center">
												Máximo: {availableSpots} ingressos disponíveis
											</p>
										)}
									</div>

									{/* Price Summary */}
									<div className="space-y-2 p-4 bg-gray-50 rounded-lg">
										<div className="flex justify-between text-sm">
											<span>Preço unitário:</span>
											<span>{formatDisplayPrice(event.Price)}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span>Quantidade:</span>
											<span>{ticketQuantity}</span>
										</div>
										<div className="flex justify-between font-bold text-lg border-t pt-2">
											<span>Total:</span>
											<span>{formatDisplayPrice(totalPrice)}</span>
										</div>
									</div>
								</div>

								<DialogFooter className="gap-2">
									<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
										Cancelar
									</Button>
									<Button onClick={() => mutate()} disabled={isPending} className="gap-2 text-white">
										{isPending ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<CreditCard className="h-4 w-4" />
										)}
										{isPending ? "Processando..." : "Finalizar Compra"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				)
			}
		</CardContent>
	</Card>)
}