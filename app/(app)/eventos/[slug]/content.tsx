"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
	ArrowLeft,
	Calendar,
	MapPin,
	Users,
	Clock,
	MessageCircle,
	Send,
	ThumbsUp,
	ThumbsDown,
	HelpCircle,
	Check,
	X,
	Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Types
type AttendanceStatus = "GOING" | "NOT_GOING" | "MAYBE" | null

type Comment = {
	id: string
	userId: string
	userName: string
	userAvatar?: string
	content: string
	createdAt: string
	replies?: Comment[]
}

type EventDetails = {
	id: string
	name: string
	description: string
	imageUrl: string
	startDate: string
	endDate?: string
	capacity?: number
	location: {
		name: string
		address: string
	}
	games: Array<{
		id: string
		name: string
		iconUrl?: string
		minPlayers: number
		maxPlayers: number
		ludopediaUrl: string
	}>
	confirmations: Array<{
		accountId: number
		handle: string
		avatarUrl?: string
	}>
	comments: Comment[]
}

// Comment form schema
const commentFormSchema = z.object({
	content: z
		.string()
		.min(1, "O comentário não pode estar vazio")
		.max(500, "O comentário deve ter no máximo 500 caracteres"),
})

type CommentFormValues = z.infer<typeof commentFormSchema>

// Mock function to fetch event details
const fetchEventDetails = async (id: string): Promise<EventDetails | null> => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1000))

	// Mock event data based on ID
	const mockEvents: Record<string, EventDetails> = {
		"1": {
			id: "1",
			name: "Noite de Jogos de Tabuleiro",
			description:
				"Venha se divertir com diversos jogos de tabuleiro e conhecer novos amigos! Uma noite especial dedicada aos amantes de jogos de mesa, com uma seleção cuidadosa de jogos para todos os níveis de experiência.",
			imageUrl: "/placeholder.svg?height=300&width=600",
			startDate: "2025-06-10T19:00:00",
			endDate: "2025-06-10T23:00:00",
			capacity: 20,
			location: {
				name: "Luderia Central",
				address: "Rua das Flores, 123, São Paulo, SP",
			},
			games: [
				{
					id: "101",
					name: "Catan",
					iconUrl: "/placeholder.svg?height=40&width=40",
					minPlayers: 3,
					maxPlayers: 4,
					ludopediaUrl: "https://ludopedia.com.br/jogo/catan",
				},
				{
					id: "102",
					name: "Ticket to Ride",
					iconUrl: "/placeholder.svg?height=40&width=40",
					minPlayers: 2,
					maxPlayers: 5,
					ludopediaUrl: "https://ludopedia.com.br/jogo/ticket-to-ride",
				},
				{
					id: "103",
					name: "Pandemic",
					iconUrl: "/placeholder.svg?height=40&width=40",
					minPlayers: 2,
					maxPlayers: 4,
					ludopediaUrl: "https://ludopedia.com.br/jogo/pandemic",
				},
			],
			confirmations: [
				{
					accountId: 1001,
					handle: "Carlos Silva",
					avatarUrl: "/placeholder.svg?height=40&width=40",
				},
				{
					accountId: 1002,
					handle: "Ana Rodrigues",
					avatarUrl: "/placeholder.svg?height=40&width=40",
				},
				{
					accountId: 1003,
					handle: "Pedro Almeida",
					avatarUrl: "/placeholder.svg?height=40&width=40",
				},
			],
			comments: [
				{
					id: "c1",
					userId: "u1",
					userName: "Maria Santos",
					userAvatar: "/placeholder.svg?height=32&width=32",
					content: "Que evento incrível! Mal posso esperar para jogar Catan novamente. Alguém sabe se vai ter pizza?",
					createdAt: "2025-05-20T14:30:00Z",
				},
				{
					id: "c2",
					userId: "u2",
					userName: "João Oliveira",
					userAvatar: "/placeholder.svg?height=32&width=32",
					content: "Primeira vez jogando Pandemic, alguém pode me ensinar as regras?",
					createdAt: "2025-05-21T10:15:00Z",
				},
				{
					id: "c3",
					userId: "u3",
					userName: "Fernanda Costa",
					userAvatar: "/placeholder.svg?height=32&width=32",
					content: "Vou levar alguns jogos extras caso alguém queira experimentar algo novo!",
					createdAt: "2025-05-22T16:45:00Z",
				},
			],
		},
		"2": {
			id: "2",
			name: "Campeonato de Magic",
			description:
				"Torneio oficial de Magic: The Gathering com premiação para os finalistas. Formato Standard, com inscrições limitadas.",
			imageUrl: "/placeholder.svg?height=300&width=600",
			startDate: "2025-06-15T14:00:00",
			endDate: "2025-06-15T20:00:00",
			capacity: 32,
			location: {
				name: "Card Kingdom",
				address: "Av. Atlântica, 500, Rio de Janeiro, RJ",
			},
			games: [
				{
					id: "201",
					name: "Magic: The Gathering",
					iconUrl: "/placeholder.svg?height=40&width=40",
					minPlayers: 2,
					maxPlayers: 2,
					ludopediaUrl: "https://ludopedia.com.br/jogo/magic-the-gathering",
				},
			],
			confirmations: [
				{
					accountId: 2001,
					handle: "Mariana Costa",
					avatarUrl: "/placeholder.svg?height=40&width=40",
				},
				{
					accountId: 2002,
					handle: "Roberto Gomes",
					avatarUrl: "/placeholder.svg?height=40&width=40",
				},
			],
			comments: [
				{
					id: "c4",
					userId: "u4",
					userName: "Lucas Ferreira",
					userAvatar: "/placeholder.svg?height=32&width=32",
					content: "Qual é o formato exato do torneio? Standard atual?",
					createdAt: "2025-05-18T09:20:00Z",
				},
			],
		},
	}

	return mockEvents[id] || null
}

// Mock function to add a comment
const addComment = async (eventId: string, content: string): Promise<Comment> => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 800))

	// Mock new comment
	return {
		id: `c${Date.now()}`,
		userId: "current-user",
		userName: "Você",
		userAvatar: "/placeholder.svg?height=32&width=32",
		content,
		createdAt: new Date().toISOString(),
	}
}

// Attendance status configuration
const attendanceConfig = {
	GOING: {
		label: "Vou participar",
		icon: ThumbsUp,
		color: "text-green-600",
		bgColor: "bg-green-100",
		borderColor: "border-green-200",
		hoverColor: "hover:bg-green-200",
	},
	NOT_GOING: {
		label: "Não vou",
		icon: ThumbsDown,
		color: "text-red-600",
		bgColor: "bg-red-100",
		borderColor: "border-red-200",
		hoverColor: "hover:bg-red-200",
	},
	MAYBE: {
		label: "Talvez",
		icon: HelpCircle,
		color: "text-amber-600",
		bgColor: "bg-amber-100",
		borderColor: "border-amber-200",
		hoverColor: "hover:bg-amber-200",
	},
}

function formatEventDate(dateString: string): string {
	const date = new Date(dateString)
	const day = date.getDate().toString().padStart(2, "0")
	const month = (date.getMonth() + 1).toString().padStart(2, "0")
	const year = date.getFullYear()
	const hours = date.getHours().toString().padStart(2, "0")
	const minutes = date.getMinutes().toString().padStart(2, "0")
	return `${day}/${month}/${year} às ${hours}:${minutes}`
}

function formatCommentDate(dateString: string): string {
	const date = new Date(dateString)
	const now = new Date()
	const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

	if (diffInHours < 1) {
		return "Agora há pouco"
	} else if (diffInHours < 24) {
		return `${diffInHours}h atrás`
	} else {
		const diffInDays = Math.floor(diffInHours / 24)
		return `${diffInDays}d atrás`
	}
}

export default function EventDetailsPage() {
	const params = useParams()
	const router = useRouter()
	const { toast } = useToast()
	const [event, setEvent] = useState<EventDetails | null>(null)
	const [loading, setLoading] = useState(true)
	const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>(null)
	const [isSubmittingComment, setIsSubmittingComment] = useState(false)

	const form = useForm<CommentFormValues>({
		resolver: zodResolver(commentFormSchema),
		defaultValues: {
			content: "",
		},
	})

	useEffect(() => {
		const loadEvent = async () => {
			try {
				const eventData = await fetchEventDetails(params.id as string)
				if (eventData) {
					setEvent(eventData)
				} else {
					toast({
						title: "Evento não encontrado",
						description: "O evento que você está procurando não existe.",
						variant: "destructive",
					})
					router.push("/eventos")
				}
			} catch (error) {
				toast({
					title: "Erro ao carregar evento",
					description: "Não foi possível carregar os detalhes do evento.",
					variant: "destructive",
				})
			} finally {
				setLoading(false)
			}
		}

		loadEvent()
	}, [params.id, router, toast])

	const updateAttendance = (status: AttendanceStatus) => {
		setAttendanceStatus(status)
	}

	const getAttendanceButton = (isFull: boolean) => {
		const isDisabled = isFull && attendanceStatus !== "GOING"

		if (attendanceStatus) {
			const config = attendanceConfig[attendanceStatus]
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className={cn("gap-2 border", config.borderColor, config.bgColor, config.color, config.hoverColor)}
						>
							<config.icon className="h-4 w-4" />
							{config.label}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{Object.entries(attendanceConfig).map(([status, config]) => (
							<DropdownMenuItem
								key={status}
								onClick={() => updateAttendance(status as AttendanceStatus)}
								disabled={status === "GOING" && isDisabled}
								className={cn(
									"gap-2",
									status === attendanceStatus ? "font-medium" : "",
									status === attendanceStatus ? config.color : "",
								)}
							>
								<config.icon className="h-4 w-4" />
								{config.label}
								{status === attendanceStatus && <Check className="h-4 w-4 ml-auto" />}
							</DropdownMenuItem>
						))}
						<DropdownMenuItem onClick={() => updateAttendance(null)} className="gap-2 text-gray-600">
							<X className="h-4 w-4" />
							Remover resposta
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		} else {
			return (
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="gap-1 border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
						onClick={() => updateAttendance("GOING")}
						disabled={isDisabled}
					>
						<Check className="h-4 w-4" />
						Vou
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="gap-1 border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
						onClick={() => updateAttendance("MAYBE")}
					>
						<HelpCircle className="h-4 w-4" />
						Talvez
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="gap-1 border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
						onClick={() => updateAttendance("NOT_GOING")}
					>
						<X className="h-4 w-4" />
						Não vou
					</Button>
				</div>
			)
		}
	}

	const onSubmitComment = async (values: CommentFormValues) => {
		if (!event) return

		setIsSubmittingComment(true)
		try {
			const newComment = await addComment(event.id, values.content)
			setEvent({
				...event,
				comments: [...event.comments, newComment],
			})
			form.reset()
			toast({
				title: "Comentário adicionado",
				description: "Seu comentário foi publicado com sucesso.",
			})
		} catch (error) {
			toast({
				title: "Erro ao adicionar comentário",
				description: "Não foi possível publicar seu comentário. Tente novamente.",
				variant: "destructive",
			})
		} finally {
			setIsSubmittingComment(false)
		}
	}

	if (loading) {
		return (
			<div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-white">
				<header className="p-4 border-b bg-gradient-to-r from-orange-500 to-orange-400 flex items-center">
					<Link href="/eventos" className="text-white mr-4">
						<ArrowLeft className="h-6 w-6" />
					</Link>
					<h1 className="text-xl font-bold text-white">Carregando...</h1>
				</header>
				<main className="flex-1 flex items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-orange-500" />
				</main>
			</div>
		)
	}

	if (!event) {
		return null
	}

	const availableSpots = event.capacity ? event.capacity - event.confirmations.length : null
	const isFull = availableSpots !== null && availableSpots <= 0
	const isUserConfirmed = attendanceStatus === "GOING"

	let adjustedAvailableSpots = availableSpots
	if (isUserConfirmed && adjustedAvailableSpots !== null) {
		adjustedAvailableSpots -= 1
	}

	return (
		<div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-white">
			<header className="p-4 border-b bg-gradient-to-r from-orange-500 to-orange-400 flex items-center">
				<Link href="/eventos" className="text-white mr-4">
					<ArrowLeft className="h-6 w-6" />
				</Link>
				<h1 className="text-xl font-bold text-white">Detalhes do Evento</h1>
			</header>

			<main className="flex-1 container mx-auto py-8 px-4 mb-10">
				<div className="max-w-4xl mx-auto space-y-6">
					{/* Event Header */}
					<Card className="overflow-hidden">
						<div className="h-64 relative">
							<Image src={event.imageUrl || "/placeholder.svg"} alt={event.name} fill className="object-cover" />
						</div>
						<CardContent className="p-6">
							<div className="flex justify-between items-start mb-4">
								<h1 className="text-3xl font-bold">{event.name}</h1>
								{getAttendanceButton(isFull)}
							</div>
							<p className="text-muted-foreground text-lg mb-6">{event.description}</p>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<Calendar className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="font-medium">Início</p>
											<p className="text-sm text-muted-foreground">{formatEventDate(event.startDate)}</p>
										</div>
									</div>

									{event.endDate && (
										<div className="flex items-center gap-2">
											<Clock className="h-5 w-5 text-muted-foreground" />
											<div>
												<p className="font-medium">Término</p>
												<p className="text-sm text-muted-foreground">{formatEventDate(event.endDate)}</p>
											</div>
										</div>
									)}
								</div>

								<div className="space-y-3">
									<div className="flex items-start gap-2">
										<MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
										<div>
											<p className="font-medium">{event.location.name}</p>
											<p className="text-sm text-muted-foreground">{event.location.address}</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Users className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="font-medium">Capacidade</p>
											<p className="text-sm text-muted-foreground">
												{event.capacity ? (
													<span className={cn(isFull && !isUserConfirmed ? "text-red-600 font-medium" : "")}>
														{adjustedAvailableSpots !== null && adjustedAvailableSpots > 0
															? `${adjustedAvailableSpots} vagas disponíveis`
															: isUserConfirmed
																? "Você está confirmado"
																: "Evento lotado"}
													</span>
												) : (
													"Capacidade ilimitada"
												)}
											</p>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Games Section */}
					{event.games.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Jogos do Evento</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{event.games.map((game) => (
										<div key={game.id} className="flex items-center gap-3 p-3 border rounded-lg">
											<div className="w-12 h-12 relative flex-shrink-0">
												<Image
													src={game.iconUrl || "/placeholder.svg"}
													alt={game.name}
													fill
													className="object-cover rounded"
												/>
											</div>
											<div className="flex-1">
												<h3 className="font-medium">{game.name}</h3>
												<div className="flex items-center gap-2 mt-1">
													<Badge variant="outline" className="text-xs">
														{game.minPlayers === game.maxPlayers
															? `${game.minPlayers} jogadores`
															: `${game.minPlayers}-${game.maxPlayers} jogadores`}
													</Badge>
													<a
														href={game.ludopediaUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="text-xs text-blue-600 hover:underline"
													>
														Ver na Ludopedia
													</a>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Confirmations Section */}
					<Card>
						<CardHeader>
							<CardTitle>
								Participantes Confirmados (
								{isUserConfirmed ? event.confirmations.length + 1 : event.confirmations.length}
								{event.capacity && `/${event.capacity}`})
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{isUserConfirmed && (
									<div className="flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-3 py-1">
										<div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
											<span className="text-xs font-medium text-green-700">Você</span>
										</div>
										<span className="text-sm font-medium text-green-700">Você</span>
									</div>
								)}

								{event.confirmations.map((person) => (
									<div key={person.accountId} className="flex items-center gap-2 border rounded-full px-3 py-1">
										<Avatar className="w-6 h-6">
											<AvatarImage src={person.avatarUrl || "/placeholder.svg"} alt={person.handle} />
											<AvatarFallback className="text-xs">{person.handle.substring(0, 2).toUpperCase()}</AvatarFallback>
										</Avatar>
										<span className="text-sm">{person.handle}</span>
									</div>
								))}

								{event.confirmations.length === 0 && !isUserConfirmed && (
									<p className="text-sm text-muted-foreground">Nenhuma confirmação ainda</p>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Comments Section */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MessageCircle className="h-5 w-5" />
								Comentários ({event.comments.length})
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Add Comment Form */}
							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmitComment)} className="space-y-4">
									<FormField
										control={form.control}
										name="content"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Textarea
														placeholder="Adicione um comentário sobre o evento..."
														className="min-h-[100px]"
														disabled={isSubmittingComment}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<div className="flex justify-end">
										<Button type="submit" disabled={isSubmittingComment} className="gap-2">
											{isSubmittingComment ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Send className="h-4 w-4" />
											)}
											{isSubmittingComment ? "Publicando..." : "Publicar Comentário"}
										</Button>
									</div>
								</form>
							</Form>

							{/* Comments List */}
							<div className="space-y-4">
								{event.comments.length > 0 ? (
									event.comments.map((comment) => (
										<div key={comment.id} className="flex gap-3 p-4 border rounded-lg">
											<Avatar className="w-10 h-10 flex-shrink-0">
												<AvatarImage src={comment.userAvatar || "/placeholder.svg"} alt={comment.userName} />
												<AvatarFallback>{comment.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<span className="font-medium">{comment.userName}</span>
													<span className="text-xs text-muted-foreground">{formatCommentDate(comment.createdAt)}</span>
												</div>
												<p className="text-sm">{comment.content}</p>
											</div>
										</div>
									))
								) : (
									<div className="text-center py-8">
										<MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
										<p className="text-muted-foreground">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	)
}
