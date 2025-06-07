"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/dates"
import { Profile } from "@/types/api"
import { Trophy, Award, Target } from "lucide-react"

export function ProfileAchievements({ profile }: { profile: Profile }) {
	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Trophy className="h-5 w-5" />
						Conquistas Desbloqueadas
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{earnedBadges.map((badge) => (
							<div
								key={badge.id}
								className="flex items-center gap-3 p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50"
							>
								<div className={`p-3 rounded-full ${badge.bgColor}`}>
									<badge.icon className={`h-6 w-6 ${badge.color}`} />
								</div>
								<div className="flex-1">
									<h4 className="font-semibold">{badge.name}</h4>
									<p className="text-sm text-muted-foreground mb-1">{badge.description}</p>
									<p className="text-xs text-muted-foreground">Desbloqueado em {formatDate(badge.earnedDate!)}</p>
								</div>
								<Award className="h-5 w-5 text-yellow-600" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* In Progress Badges */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Em Progresso
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{inProgressBadges.map((badge) => (
							<div key={badge.id} className="flex items-center gap-3 p-4 border rounded-lg">
								<div className={`p-3 rounded-full ${badge.bgColor} opacity-60`}>
									<badge.icon className={`h-6 w-6 ${badge.color}`} />
								</div>
								<div className="flex-1">
									<h4 className="font-semibold">{badge.name}</h4>
									<p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
									<div className="space-y-1">
										<div className="flex justify-between text-xs">
											<span>Progresso</span>
											<span>{badge.progress}%</span>
										</div>
										<Progress value={badge.progress} className="h-2" />
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</>
	)
}