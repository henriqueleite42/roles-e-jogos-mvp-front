"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AccountAchievementData, AchievementId, Profile, ResponseListAccountAchievements } from "@/types/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Trophy, Award, Target, Calendar, Camera, Crown, GamepadIcon, Heart, MapPin, Star, Users, Lock, Loader2, AlertCircle } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"

const getAchievementIcon = (id: AchievementId) => {
	const iconMap: Record<AchievementId, any> = {
		CREATE_ONE_EVENT: Calendar,
		CREATE_TEN_EVENTS: Calendar,
		CREATE_FIFTY_EVENTS: Calendar,
		CREATE_ONE_HUNDRED_EVENTS: Calendar,
		ATTEND_ONE_EVENT: Users,
		ATTEND_TEN_EVENTS: Users,
		ATTEND_FIFTY_EVENTS: Users,
		ATTEND_ONE_HUNDRED_EVENTS: Users,
		PERSONAL_COLLECTION_ONE_GAME: GamepadIcon,
		PERSONAL_COLLECTION_TEN_GAMES: GamepadIcon,
		PERSONAL_COLLECTION_FIFTY_GAMES: GamepadIcon,
		PERSONAL_COLLECTION_ONE_HUNDRED_GAMES: GamepadIcon,
		CONNECT_DISCORD: Heart,
		CONNECT_LUDOPEDIA: Heart,
		// COLLECT_FIFTY_GAMES: GamepadIcon,
		// HUNDRED_CONNECTIONS: Heart,
		// RATE_TWENTY_GAMES: Star,
		// BIG_EVENT_ORGANIZER: Crown,
		// SECRET_ACHIEVEMENT_1: Lock,
		// FIRST_STEPS: Target,
		// PHOTO_SHARER: Camera,
		// LOCATION_EXPLORER: MapPin,
	}
	return iconMap[id] || Trophy
}

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	})
}

const getProgressPercentage = (progress: number | undefined, required: number) => {
	if (progress === null) return 100
	return Math.min(((progress || 0) / required) * 100, 100)
}

function AchievementCard({ achievement }: { achievement: AccountAchievementData }) {
	const Icon = getAchievementIcon(achievement.Id)
	const isUnlocked = achievement.AchievedAt !== null
	const progressPercentage = getProgressPercentage(achievement.Progress, achievement.RequiredAmount)

	return (
		<Card
			className={`transition-all duration-200 hover:shadow-lg ${isUnlocked ? "border-orange-200 bg-orange-50/50" : "border-gray-200"
				}`}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div
						className={`p-3 rounded-full ${isUnlocked ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}
					>
						{achievement.IsSecret && !isUnlocked ? <Lock className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
					</div>
					<div className="flex gap-2">
						{isUnlocked && (
							<Badge variant="secondary" className="bg-orange-100 text-orange-700">
								<Trophy className="h-3 w-3 mr-1" />
								Desbloqueada
							</Badge>
						)}
						{achievement.IsSecret && (
							<Badge variant="outline" className="border-purple-200 text-purple-700">
								<Lock className="h-3 w-3 mr-1" />
								Secreta
							</Badge>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				<div className="space-y-3">
					<div>
						<h3 className="font-semibold text-lg">{achievement.IsSecret && !isUnlocked ? "???" : achievement.Name}</h3>
						<p className="text-sm text-muted-foreground">
							{achievement.IsSecret && !isUnlocked
								? "Conquista secreta - continue jogando para descobrir!"
								: achievement.Description}
						</p>
					</div>

					{/* Progress Bar */}
					{!isUnlocked && achievement.Progress !== null && (
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Progresso</span>
								<span className="font-medium">
									{achievement.Progress}/{achievement.RequiredAmount}
								</span>
							</div>
							<Progress value={progressPercentage} className="h-2" />
						</div>
					)}

					{/* Achievement Date */}
					{isUnlocked && achievement.AchievedAt && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Award className="h-4 w-4" />
							<span>Desbloqueada em {formatDate(achievement.AchievedAt)}</span>
						</div>
					)}

					{/* Requirement */}
					{!isUnlocked && !achievement.IsSecret && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Target className="h-4 w-4" />
							<span>Meta: {achievement.RequiredAmount}</span>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export function ProfileAchievements({ profile }: { profile: Profile }) {
	// Use TanStack Query for data fetching with infinite scroll
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, error } = useInfiniteQuery<ResponseListAccountAchievements>({
		queryKey: ["achievements-me", profile.AccountId],
		queryFn: async ({ pageParam = null }) => {
			if (!profile.AccountId) {
				return {
					pages: [
						{
							Data: []
						}
					]
				}
			}

			const queryObj: Record<string, string> = {
				accountId: String(profile.AccountId)
			}

			if (pageParam) {
				queryObj.after = String(pageParam)
			}

			const query = new URLSearchParams(queryObj)

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/achievements/account?${query.toString()}`, {
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
		enabled: Boolean(profile.AccountId)
	})

	// Process all items from all pages
	const allItems = useMemo(() => {
		if (!data) return []

		// Flatten the pages array and extract items from each page
		return data.pages.flatMap((page) => page.Data || [])
	}, [data])


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


	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Trophy className="h-5 w-5" />
						Conquistas
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isPending && (
						<div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[100vh]">
							<Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
							<p className="text-lg text-muted-foreground">Carregando conquistas...</p>
						</div>
					)}
					{error && (
						<div className="container mx-auto py-8 px-4">
							<Alert variant="destructive" className="mb-6">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Erro ao carregar conquistas: {error.message}. Por favor, tente novamente mais tarde.
								</AlertDescription>
							</Alert>
							<Button onClick={() => window.location.reload()}>Tentar novamente</Button>
						</div>
					)}
					{!isPending && !error && (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{allItems.map((achievement) => (
								<AchievementCard key={achievement.Id} achievement={achievement} />
							))}

							{allItems.length === 0 && (
								<div className="text-center py-12">
									<Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-semibold mb-2">Nenhuma conquista encontrada</h3>
									<p className="text-muted-foreground">Tente ajustar seus filtros ou termo de busca</p>
								</div>
							)}

							{/* Infinite scroll observer element */}
							<div ref={observerTarget} className="w-full py-4 flex justify-center">
								{isFetchingNextPage && (
									<div className="flex items-center gap-2">
										<Loader2 className="h-5 w-5 animate-spin text-orange-500" />
										<span className="text-sm text-muted-foreground">Carregando mais eventos...</span>
									</div>
								)}
							</div>
						</div>
					)}

				</CardContent>
			</Card>
		</>
	)
}