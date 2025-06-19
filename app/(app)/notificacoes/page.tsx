"use client"

import type React from "react"

import { useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import {
	Bell,
	AtSign,
	CalendarX,
	PuzzleIcon as PuzzlePiece,
	Eye,
	CheckCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header } from "@/components/header"
import {
	NotificationData,
	NotificationDataEventCanceled,
	NotificationDataGamesCollectionFinish,
	NotificationDataMediaMention,
	ResponseListLatestNotifications
} from "@/types/api"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { formatEventDate } from "@/lib/dates"
import { LudopediaIcon } from "@/components/icons/ludopedia"
import { NotificationMediaMention } from "./notification-media-mention"
import { NotificationEventCanceled } from "./notification-event-canceled"
import { NotificationGamesCollectionFinish } from "./notification-games-collection-finish"
import { useToast } from "@/hooks/use-toast"

// Mock data for notifications
// const mockNotifications: NotificationData[] = [
// 	// Achievement notifications
// 	{
// 		id: "1",
// 		type: "achievement",
// 		title: "Nova Conquista Desbloqueada!",
// 		content: 'Você desbloqueou a conquista "Mestre dos Jogos" por adicionar 50 jogos à sua coleção.',
// 		timestamp: new Date(2023, 5, 13, 14, 30),
// 		isRead: false,
// 		sender: {
// 			id: "system",
// 			name: "Sistema",
// 			avatar: "/placeholder.svg?height=40&width=40",
// 		},
// 		data: {
// 			achievementName: "Mestre dos Jogos",
// 			achievementIcon: "🏆",
// 			xpEarned: 500,
// 			currentXp: 2450,
// 			nextLevelXp: 3000,
// 			progress: 82,
// 		},
// 		actions: {
// 			primary: {
// 				label: "Ver Conquista",
// 				action: "/perfil?tab=conquistas",
// 				icon: <Eye size={16} />,
// 				variant: "default",
// 			},
// 		},
// 	},

// 	// Friend request notification
// 	{
// 		id: "2",
// 		type: "friend_request",
// 		title: "Nova Solicitação de Amizade",
// 		content: "Marina Silva quer se conectar com você. Vocês têm 3 amigos em comum.",
// 		timestamp: new Date(2023, 5, 13, 10, 15),
// 		isRead: false,
// 		sender: {
// 			id: "user123",
// 			name: "Marina Silva",
// 			avatar: "/placeholder.svg?height=40&width=40",
// 		},
// 		data: {
// 			mutualFriends: 3,
// 			requestDate: new Date(2023, 5, 13, 10, 15),
// 		},
// 		actions: {
// 			primary: {
// 				label: "Aceitar",
// 				action: "accept_friend",
// 				icon: <Check size={16} />,
// 				variant: "default",
// 			},
// 			secondary: [
// 				{
// 					label: "Recusar",
// 					action: "decline_friend",
// 					icon: <X size={16} />,
// 					variant: "outline",
// 				},
// 				{
// 					label: "Ver Perfil",
// 					action: "/perfil/user123",
// 					icon: <Eye size={16} />,
// 					variant: "ghost",
// 				},
// 			],
// 		},
// 	},

// 	// Mention notification
// 	{
// 		id: "3",
// 		type: "mention",
// 		title: "Você foi mencionado em uma foto",
// 		content: 'Carlos Oliveira mencionou você em uma foto do evento "Noite de Jogos de Tabuleiro".',
// 		timestamp: new Date(2023, 5, 12, 20, 45),
// 		isRead: true,
// 		sender: {
// 			id: "user456",
// 			name: "Carlos Oliveira",
// 			avatar: "/placeholder.svg?height=40&width=40",
// 		},
// 		data: {
// 			postId: "post789",
// 			eventId: "event123",
// 			eventName: "Noite de Jogos de Tabuleiro",
// 			imageUrl: "/placeholder.svg?height=100&width=150",
// 		},
// 		actions: {
// 			primary: {
// 				label: "Ver Foto",
// 				action: "/eventos/event123/fotos/post789",
// 				icon: <Eye size={16} />,
// 				variant: "default",
// 			},
// 			secondary: [
// 				{
// 					label: "Responder",
// 					action: "reply_to_mention",
// 					icon: <MessageSquare size={16} />,
// 					variant: "outline",
// 				},
// 			],
// 		},
// 	},

// 	// Cancelled event notification
// 	{
// 		id: "4",
// 		type: "event",
// 		title: "Evento Cancelado",
// 		content: 'O evento "Torneio de Catan" foi cancelado pelo organizador. Motivo: Local indisponível.',
// 		timestamp: new Date(2023, 5, 12, 16, 20),
// 		isRead: false,
// 		sender: {
// 			id: "user789",
// 			name: "Pedro Almeida",
// 			avatar: "/placeholder.svg?height=40&width=40",
// 		},
// 		data: {
// 			eventId: "event456",
// 			eventName: "Torneio de Catan",
// 			originalDate: new Date(2023, 5, 15, 19, 0),
// 			cancellationReason: "Local indisponível",
// 			imageUrl: "/placeholder.svg?height=100&width=150",
// 		},
// 		actions: {
// 			primary: {
// 				label: "Ver Detalhes",
// 				action: "/eventos/event456",
// 				icon: <Eye size={16} />,
// 				variant: "default",
// 			},
// 		},
// 	},

// 	// Game collection notification
// 	{
// 		id: "5",
// 		type: "game",
// 		title: "Novo Jogo Adicionado à Coleção",
// 		content: "Azul foi adicionado à sua coleção de jogos.",
// 		timestamp: new Date(2023, 5, 11, 9, 10),
// 		isRead: true,
// 		sender: {
// 			id: "system",
// 			name: "Sistema",
// 			avatar: "/placeholder.svg?height=40&width=40",
// 		},
// 		data: {
// 			gameId: "game123",
// 			gameName: "Azul",
// 			gameImage: "/placeholder.svg?height=100&width=150",
// 			addedBy: "Você",
// 		},
// 		actions: {
// 			primary: {
// 				label: "Ver Jogo",
// 				action: "/jogos/azul",
// 				icon: <Eye size={16} />,
// 				variant: "default",
// 			},
// 		},
// 	},

// 	// Event invitation
// 	{
// 		id: "6",
// 		type: "event",
// 		title: "Convite para Evento",
// 		content: 'Você foi convidado para o evento "Maratona de RPG" por Ana Beatriz.',
// 		timestamp: new Date(2023, 5, 11, 8, 30),
// 		isRead: true,
// 		sender: {
// 			id: "user101",
// 			name: "Ana Beatriz",
// 			avatar: "/placeholder.svg?height=40&width=40",
// 		},
// 		data: {
// 			eventId: "event789",
// 			eventName: "Maratona de RPG",
// 			eventDate: new Date(2023, 5, 18, 14, 0),
// 			imageUrl: "/placeholder.svg?height=100&width=150",
// 		},
// 		actions: {
// 			primary: {
// 				label: "Confirmar Presença",
// 				action: "/eventos/event789?action=confirm",
// 				icon: <Check size={16} />,
// 				variant: "default",
// 			},
// 			secondary: [
// 				{
// 					label: "Recusar",
// 					action: "/eventos/event789?action=decline",
// 					icon: <X size={16} />,
// 					variant: "outline",
// 				},
// 				{
// 					label: "Ver Evento",
// 					action: "/eventos/event789",
// 					icon: <Eye size={16} />,
// 					variant: "ghost",
// 				},
// 			],
// 		},
// 	},

// 	// Another achievement notification (older)
// 	{
// 		id: "7",
// 		type: "achievement",
// 		title: "Nova Conquista Desbloqueada!",
// 		content: 'Você desbloqueou a conquista "Organizador Iniciante" por criar seu primeiro evento.',
// 		timestamp: new Date(2023, 5, 10, 13, 45),
// 		isRead: true,
// 		sender: {
// 			id: "system",
// 			name: "Sistema",
// 			avatar: "/placeholder.svg?height=40&width=40",
// 		},
// 		data: {
// 			achievementName: "Organizador Iniciante",
// 			achievementIcon: "🎮",
// 			xpEarned: 200,
// 			currentXp: 1950,
// 			nextLevelXp: 3000,
// 			progress: 65,
// 		},
// 		actions: {
// 			primary: {
// 				label: "Ver Conquista",
// 				action: "/perfil?tab=conquistas",
// 				icon: <Eye size={16} />,
// 				variant: "default",
// 			},
// 		},
// 	},
// ]

// Get icon for notification type
// const getNotificationIcon = (notification: NotificationData) => {
// 	switch (notification.type) {
// 		case "achievement":
// 			return <Trophy className="h-5 w-5 text-yellow-500" />
// 		case "friend_request":
// 			return <UserPlus className="h-5 w-5 text-blue-500" />
// 		case "mention":
// 			return <AtSign className="h-5 w-5 text-purple-500" />
// 		case "event":
// 			// Different icons for event subtypes
// 			if (notification.data.cancellationReason) {
// 				return <CalendarX className="h-5 w-5 text-red-500" />
// 			}
// 			return <Calendar className="h-5 w-5 text-green-500" />
// 		case "game":
// 			return <PuzzlePiece className="h-5 w-5 text-orange-500" />
// 		default:
// 			return <Bell className="h-5 w-5 text-gray-500" />
// 	}
// }

export default function NotificationsPage() {
	const queryClient = useQueryClient()
	const { toast } = useToast()

	// Use TanStack Query for data fetching with infinite scroll
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfiniteQuery<ResponseListLatestNotifications>({
		queryKey: ["notifications"],
		queryFn: async ({ pageParam = null }) => {
			const queryObj: Record<string, string> = {}

			if (pageParam) {
				queryObj.after = String(pageParam)
			}

			const query = new URLSearchParams(queryObj)

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications?${query.toString()}`, {
				credentials: "include"
			})

			if (!response.ok) {
				throw new Error(`Erro ao pegar dados da API: ${response.status}`)
			}

			return response.json()
		},
		getNextPageParam: (lastPage) => {
			// Return undefined if there are no more pages or if nextCursor is not provided
			return lastPage.Pagination.Next || undefined
		},
		initialPageParam: null,
	})

	// Process all items from all pages
	const allItems = useMemo(() => {
		if (!data) return []

		// Flatten the pages array and extract items from each page
		return data.pages.flatMap((page) => page.Data || [])
	}, [data])

	const unreadCount = useMemo(() => {
		let counter = 0
		allItems.forEach(i => {
			if (!i.ReadAt) {
				counter++
			}
		})
		return counter
	}, [allItems])

	// Observer for infinite scroll
	const observerTarget = useRef<HTMLDivElement | null>(null)

	// Intersection Observer for infinite scroll
	useEffect(() => {
		if (!hasNextPage || !observerTarget.current || isFetchingNextPage) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					fetchNextPage()
				}
			},
			{ threshold: 0.5 },
		)

		observer.observe(observerTarget.current)

		return () => {
			observer.disconnect()
		}
	}, [hasNextPage, isFetchingNextPage])

	// Render notification content based on type
	// const renderNotificationContent = (notification: NotificationData) => {
	// 	switch (notification.type) {
	// 		case "achievement":
	// 			return (
	// 				<div className="mt-2">
	// 					<div className="flex items-center gap-2 mb-2">
	// 						<span className="text-xl">{notification.data.achievementIcon}</span>
	// 						<span className="font-medium">{notification.data.achievementName}</span>
	// 						<Badge variant="secondary">+{notification.data.xpEarned} XP</Badge>
	// 					</div>
	// 					<div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-1">
	// 						<div
	// 							className="bg-gradient-to-r from-orange-500 to-yellow-400 h-2.5 rounded-full"
	// 							style={{ width: `${notification.data.progress}%` }}
	// 						></div>
	// 					</div>
	// 					<div className="text-xs text-gray-500">
	// 						{notification.data.currentXp}/{notification.data.nextLevelXp} XP para o próximo nível
	// 					</div>
	// 				</div>
	// 			)

	// 		case "friend_request":
	// 			return (
	// 				<div className="mt-2">
	// 					<div className="flex items-center gap-2">
	// 						<span className="text-sm text-gray-500">
	// 							{notification.data.mutualFriends > 0
	// 								? `${notification.data.mutualFriends} amigos em comum`
	// 								: "Nenhum amigo em comum"}
	// 						</span>
	// 					</div>
	// 				</div>
	// 			)

	// 		case "mention":
	// 		case "event":
	// 		case "game":
	// 			// These types have images to display
	// 			if (notification.data.imageUrl) {
	// 				return (
	// 					<div className="mt-2">
	// 						<div className="relative h-20 w-32 rounded-md overflow-hidden">
	// 							<Image
	// 								src={notification.data.imageUrl || "/placeholder.svg"}
	// 								alt={notification.data.eventName || notification.data.gameName || "Imagem"}
	// 								fill
	// 								className="object-cover"
	// 							/>
	// 						</div>
	// 					</div>
	// 				)
	// 			}
	// 			return null

	// 		default:
	// 			return null
	// 	}
	// }

	const markAllAsRead = useMutation({
		mutationFn: async () => {
			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/notifications/read', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
			});

			if (!res.ok) {
				const error = await res.text()
				throw new Error(error)
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] })
		},
		onError: (error) => {
			console.error(error);
			toast({
				title: "Erro ao marcar notificações como lidas",
				description: "Não foi marcar as notificações como lidas, por favor entre em contato com o suporte.",
				variant: "destructive",
			})
		},
	});

	const markAsExecutedMutation = useMutation({
		mutationFn: async (notification: NotificationData) => {
			const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/notifications/executed', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					NotificationId: notification.Id,
				}),
				credentials: 'include',
			});

			if (!res.ok) {
				const error = await res.text()
				throw new Error(error)
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] })
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const markAsExecuted = (notification: NotificationData) => {
		markAsExecutedMutation.mutate(notification)
	}

	return (
		<>
			<Header title="Notificações" displayBackButton />

			<div className="min-h-screen">
				<div className="flex justify-between items-center mb-4 mt-4">
					<div className="flex items-center gap-2">
						{unreadCount > 0 && (
							<Badge variant="secondary" className="ml-2">
								{unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
							</Badge>
						)}
					</div>

					<div className="flex gap-2 p-2">
						<Button
							size="sm"
							className="flex items-center gap-1 text-white"
							onClick={() => markAllAsRead.mutate()}
							disabled={unreadCount === 0 || markAllAsRead.isPending}
						>
							<CheckCheck size={16} />
							Marcar todas como lidas
						</Button>
					</div>
				</div>

				{/* Search and filters */}
				<div className="mb-6">
					{
						allItems.length === 0 && (
							<div className="text-center py-12">
								<Bell className="mx-auto h-12 w-12 text-gray-400" />
								<h3 className="mt-4 text-lg font-medium">Nenhuma notificação</h3>
								<p className="mt-2 text-gray-500">
									Você não tem notificações neste momento.
								</p>
							</div>
						)
					}
					{allItems.length > 0 && (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow">
							{allItems.map(notification => {
								if (notification.Type === "EVENT_CANCELED") {
									return <NotificationEventCanceled key={notification.Id} notification={notification} markAsExecuted={markAsExecuted} />
								}
								if (notification.Type === "GAMES_COLLECTION_IMPORT_FINISH") {
									return <NotificationGamesCollectionFinish key={notification.Id} notification={notification} markAsExecuted={markAsExecuted} />
								}
								if (notification.Type === "MEDIA_MENTION") {
									return <NotificationMediaMention key={notification.Id} notification={notification} markAsExecuted={markAsExecuted} />
								}

								console.error(`Notification type not implemented: ${notification.Type}`)
								return <></>
							})}
						</div>
					)}
				</div>
			</div>
		</>
	)
}
